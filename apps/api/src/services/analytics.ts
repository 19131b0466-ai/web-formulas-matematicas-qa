import { randomUUID } from 'node:crypto';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type {
  BotCategory,
  BotConfidence,
  EventSource,
  TrafficClass,
  VisitLogAdminDto,
} from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';
import { audienceCondition, type TrafficAudience } from '../lib/analytics-audience.js';
import { anonymizeIpNetwork, hashIp } from '../lib/ip-privacy.js';
import {
  extractGeo,
  extractIp,
  parseUserAgent,
  primaryLanguageFromAccept,
} from '../lib/request-meta.js';
import { classifyTraffic } from '../lib/traffic-classifier.js';

const DEDUPE_WINDOW_MS = 30 * 60 * 1000;
const MAX_UA_LENGTH = 2000;

export type TrackVisitInput = {
  sessionId: string;
  path: string;
  referer?: string | null;
  acceptLanguage?: string | null;
  screen?: { width: number; height: number } | null;
  sectionSlug?: string | null;
  subjectSlug?: string | null;
  searchQuery?: string | null;
  queryString?: string | null;
};

export type TrackVisitResult = {
  ok: true;
  deduplicated: boolean;
  /** Internal only — never serialize to HTTP responses. */
  _internal?: { ipAddress: string };
};

type VisitRow = typeof visitLogs.$inferSelect;

function asTrafficClass(value: string | null | undefined): TrafficClass {
  if (value === 'human' || value === 'bot' || value === 'unknown') return value;
  return 'unknown';
}

function asEventSource(value: string | null | undefined): EventSource {
  if (value === 'web_client' || value === 'server' || value === 'api' || value === 'internal' || value === 'unknown') {
    return value;
  }
  return 'unknown';
}

function asBotCategory(value: string | null | undefined): BotCategory | null {
  if (
    value === 'search_engine' ||
    value === 'ai_crawler' ||
    value === 'social_preview' ||
    value === 'seo_crawler' ||
    value === 'advertising' ||
    value === 'browser_automation' ||
    value === 'monitoring' ||
    value === 'generic_crawler' ||
    value === 'unknown_bot'
  ) {
    return value;
  }
  return null;
}

function asBotConfidence(value: string | null | undefined): BotConfidence | null {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  return null;
}

/** Map DB row → admin DTO. Explicitly omits ipAddress. */
export function toVisitLogAdminDto(row: VisitRow): VisitLogAdminDto {
  return {
    id: row.id,
    sessionId: row.sessionId,
    visitedAt: (row.visitedAt ?? new Date()).toISOString(),
    path: row.path,
    queryString: row.queryString,
    referer: row.referer,
    countryCode: row.countryCode,
    countryName: row.countryName,
    region: row.region,
    city: row.city,
    timezone: row.timezone,
    acceptLanguage: row.acceptLanguage,
    primaryLanguage: row.primaryLanguage,
    screenWidth: row.screenWidth,
    screenHeight: row.screenHeight,
    deviceType: row.deviceType,
    browser: row.browser,
    os: row.os,
    sectionSlug: row.sectionSlug,
    subjectSlug: row.subjectSlug,
    searchQuery: row.searchQuery,
    isUniqueDay: row.isUniqueDay,
    isBot: row.isBot,
    trafficClass: asTrafficClass(row.trafficClass),
    botId: row.botId,
    botCategory: asBotCategory(row.botCategory),
    botDetectionReason: row.botDetectionReason,
    botConfidence: asBotConfidence(row.botConfidence),
    classificationVersion: row.classificationVersion,
    ipHash: row.ipHash,
    ipNetwork: row.ipNetwork,
    eventSource: asEventSource(row.eventSource),
    userAgent: row.userAgent,
  };
}

/** Ensure no accidental IP leakage in serialized admin objects. */
export function assertNoIpFields(payload: unknown): void {
  const json = JSON.stringify(payload);
  if (
    /"ipAddress"\s*:/i.test(json) ||
    /"ip_address"\s*:/i.test(json) ||
    /"ip"\s*:\s*"/i.test(json)
  ) {
    throw new Error('IP fields must never appear in admin/public analytics payloads');
  }
}

/** CSV export columns — ip_address intentionally excluded. */
export const VISIT_CSV_COLUMNS = [
  'id',
  'sessionId',
  'visitedAt',
  'path',
  'queryString',
  'referer',
  'countryCode',
  'countryName',
  'region',
  'city',
  'timezone',
  'acceptLanguage',
  'primaryLanguage',
  'screenWidth',
  'screenHeight',
  'deviceType',
  'browser',
  'os',
  'sectionSlug',
  'subjectSlug',
  'searchQuery',
  'isUniqueDay',
  'trafficClass',
  'isBot',
  'botId',
  'botCategory',
  'botDetectionReason',
  'botConfidence',
  'classificationVersion',
  'ipHash',
  'ipNetwork',
  'eventSource',
  'userAgent',
] as const;

export function visitsToCsv(rows: VisitLogAdminDto[]): string {
  assertNoIpFields(rows);
  const header = VISIT_CSV_COLUMNS.join(',');
  const lines = rows.map((row) => VISIT_CSV_COLUMNS.map((col) => csvEscape(row[col])).join(','));
  return [header, ...lines].join('\n');
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function recordVisit(
  db: Database,
  input: TrackVisitInput,
  headers: Headers,
  eventSource: EventSource = 'web_client',
): Promise<TrackVisitResult> {
  const path = normalizePath(input.path);
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS);

  const existing = await db
    .select({ id: visitLogs.id })
    .from(visitLogs)
    .where(
      and(
        eq(visitLogs.sessionId, input.sessionId),
        eq(visitLogs.path, path),
        gte(visitLogs.visitedAt, since),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { ok: true, deduplicated: true };
  }

  const ipAddress = extractIp(headers);
  const geo = extractGeo(headers);
  const userAgentRaw = headers.get('user-agent');
  const userAgent = userAgentRaw ? userAgentRaw.slice(0, MAX_UA_LENGTH) : null;
  const classified = classifyTraffic(userAgent);
  const parsed = parseUserAgent(userAgent);
  const acceptLanguage = input.acceptLanguage ?? headers.get('accept-language');
  const referer = input.referer ?? headers.get('referer');
  const ipHash = hashIp(ipAddress);
  const ipNetwork = anonymizeIpNetwork(ipAddress);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const priorToday = await db
    .select({ id: visitLogs.id })
    .from(visitLogs)
    .where(and(eq(visitLogs.sessionId, input.sessionId), gte(visitLogs.visitedAt, startOfDay)))
    .limit(1);

  const isUniqueDay = classified.trafficClass === 'human' && priorToday.length === 0;

  await db.insert(visitLogs).values({
    id: randomUUID(),
    sessionId: input.sessionId,
    visitedAt: new Date(),
    ipAddress,
    userAgent,
    referer: referer || null,
    path,
    queryString: input.queryString ?? null,
    countryCode: geo.countryCode,
    countryName: geo.countryName,
    region: geo.region,
    city: geo.city,
    latitude: geo.latitude,
    longitude: geo.longitude,
    timezone: geo.timezone,
    acceptLanguage: acceptLanguage || null,
    primaryLanguage: primaryLanguageFromAccept(acceptLanguage),
    screenWidth: input.screen?.width ?? null,
    screenHeight: input.screen?.height ?? null,
    deviceType: parsed.deviceType,
    browser: parsed.browser,
    os: parsed.os,
    sectionSlug: input.sectionSlug ?? null,
    subjectSlug: input.subjectSlug ?? null,
    searchQuery: input.searchQuery ?? null,
    isUniqueDay,
    isBot: classified.isBot,
    trafficClass: classified.trafficClass,
    botId: classified.botId,
    botCategory: classified.botCategory,
    botDetectionReason: classified.reason,
    botConfidence: classified.confidence,
    ipHash,
    ipNetwork,
    eventSource,
    classificationVersion: classified.classificationVersion,
  });

  return { ok: true, deduplicated: false, _internal: { ipAddress } };
}

export async function listRecentVisitsAdmin(
  db: Database,
  limit: number,
  audience: TrafficAudience = 'all',
): Promise<VisitLogAdminDto[]> {
  const filter = audienceCondition(audience);
  const rows = await db
    .select()
    .from(visitLogs)
    .where(filter ?? sql`true`)
    .orderBy(desc(visitLogs.visitedAt))
    .limit(limit);

  const dtos = rows.map(toVisitLogAdminDto);
  assertNoIpFields(dtos);
  return dtos;
}

export async function countVisits(db: Database): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(visitLogs);
  return row?.count ?? 0;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith('/')) return `/${trimmed}`;
  return trimmed.length > 500 ? trimmed.slice(0, 500) : trimmed;
}

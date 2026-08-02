import { randomUUID } from 'node:crypto';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type { VisitLogAdminDto } from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';
import {
  extractGeo,
  extractIp,
  parseUserAgent,
  primaryLanguageFromAccept,
} from '../lib/request-meta.js';

const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

export type TrackVisitInput = {
  sessionId: string;
  path: string;
  referer?: string | null;
  acceptLanguage?: string | null;
  screen?: { width: number; height: number } | null;
  sectionSlug?: string | null;
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

/** Map DB row → admin DTO. Explicitly omits ipAddress / userAgent raw if needed. */
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
    searchQuery: row.searchQuery,
    isUniqueDay: row.isUniqueDay,
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
  'searchQuery',
  'isUniqueDay',
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
  const userAgent = headers.get('user-agent');
  const parsed = parseUserAgent(userAgent);
  const acceptLanguage = input.acceptLanguage ?? headers.get('accept-language');
  const referer = input.referer ?? headers.get('referer');

  // Unique for the calendar day per session (first path of the day counts)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const priorToday = await db
    .select({ id: visitLogs.id })
    .from(visitLogs)
    .where(and(eq(visitLogs.sessionId, input.sessionId), gte(visitLogs.visitedAt, startOfDay)))
    .limit(1);

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
    searchQuery: input.searchQuery ?? null,
    isUniqueDay: priorToday.length === 0,
  });

  return { ok: true, deduplicated: false, _internal: { ipAddress } };
}

export async function listRecentVisitsAdmin(
  db: Database,
  limit: number,
): Promise<VisitLogAdminDto[]> {
  const rows = await db.select().from(visitLogs).orderBy(desc(visitLogs.visitedAt)).limit(limit);

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

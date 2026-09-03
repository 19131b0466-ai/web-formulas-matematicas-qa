import { and, asc, desc, gte, lte, sql, type SQL } from 'drizzle-orm';
import type {
  AnalyticsOverview,
  BotsAnalytics,
  BotSummaryRow,
  GeoCityCount,
  GeoCountryCount,
  NamedCount,
  RpmStats,
  TimeseriesPoint,
  VisitLogAdminDto,
} from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';
import { audienceCondition, type TrafficAudience } from '../lib/analytics-audience.js';
import { displayBotLabel } from '../lib/traffic-classifier.js';
import {
  assertNoIpFields,
  listRecentVisitsAdmin,
  toVisitLogAdminDto,
  visitsToCsv,
} from './analytics.js';

export type DateRange = {
  from: Date;
  to: Date;
};

function rangeFilter(range?: DateRange) {
  if (!range) return undefined;
  return and(gte(visitLogs.visitedAt, range.from), lte(visitLogs.visitedAt, range.to));
}

function combinedFilter(range?: DateRange, audience: TrafficAudience = 'human'): SQL {
  const parts = [rangeFilter(range), audienceCondition(audience)].filter(
    (part): part is SQL => Boolean(part),
  );
  if (parts.length === 0) return sql`true`;
  if (parts.length === 1) return parts[0]!;
  return and(...parts)!;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function startOfUtcDay(d = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

async function countWhere(db: Database, where?: SQL): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitLogs)
    .where(where ?? sql`true`);
  return row?.count ?? 0;
}

export async function getOverview(db: Database): Promise<AnalyticsOverview> {
  const today = startOfUtcDay();
  const week = daysAgo(7);
  const month = daysAgo(30);
  const human = audienceCondition('human');

  const [
    todayHuman,
    weekHuman,
    monthHuman,
    uniqueWeek,
    totalHuman,
    todayTotal,
    todayBot,
    todayUnknown,
    allTotal,
    allBot,
    allUnknown,
    topCountry,
    topSection,
  ] = await Promise.all([
    countWhere(db, and(gte(visitLogs.visitedAt, today), human)),
    countWhere(db, and(gte(visitLogs.visitedAt, week), human)),
    countWhere(db, and(gte(visitLogs.visitedAt, month), human)),
    db
      .select({ count: sql<number>`count(distinct ${visitLogs.sessionId})::int` })
      .from(visitLogs)
      .where(and(gte(visitLogs.visitedAt, week), human))
      .then(([row]) => row?.count ?? 0),
    countWhere(db, human),
    countWhere(db, gte(visitLogs.visitedAt, today)),
    countWhere(db, and(gte(visitLogs.visitedAt, today), audienceCondition('bot'))),
    countWhere(db, and(gte(visitLogs.visitedAt, today), audienceCondition('unknown'))),
    countWhere(db),
    countWhere(db, audienceCondition('bot')),
    countWhere(db, audienceCondition('unknown')),
    db
      .select({
        code: visitLogs.countryCode,
        name: visitLogs.countryName,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(and(gte(visitLogs.visitedAt, month), human))
      .groupBy(visitLogs.countryCode, visitLogs.countryName)
      .orderBy(desc(sql`count(*)`))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select({
        slug: visitLogs.sectionSlug,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(and(gte(visitLogs.visitedAt, month), human, sql`${visitLogs.sectionSlug} is not null`))
      .groupBy(visitLogs.sectionSlug)
      .orderBy(desc(sql`count(*)`))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ]);

  const overview: AnalyticsOverview = {
    visitsToday: todayHuman,
    visitsWeek: weekHuman,
    visitsMonth: monthHuman,
    uniqueSessionsWeek: uniqueWeek,
    topCountry: topCountry
      ? { code: topCountry.code, name: topCountry.name, count: topCountry.count }
      : null,
    topSection: topSection ? { slug: topSection.slug, count: topSection.count } : null,
    totalVisits: totalHuman,
    timezone: 'UTC',
    totalTrafficToday: todayTotal,
    humanVisitsToday: todayHuman,
    botRequestsToday: todayBot,
    unknownTrafficToday: todayUnknown,
    botPercentToday: pct(todayBot, todayTotal),
    totalTrafficAll: allTotal,
    humanVisitsAll: totalHuman,
    botRequestsAll: allBot,
    unknownTrafficAll: allUnknown,
    botPercentAll: pct(allBot, allTotal),
  };

  assertNoIpFields(overview);
  return overview;
}

export async function getTimeseries(
  db: Database,
  range: DateRange,
  granularity: 'day' | 'hour' = 'day',
  audience: TrafficAudience = 'human',
): Promise<TimeseriesPoint[]> {
  const bucket =
    granularity === 'hour'
      ? sql`date_trunc('hour', ${visitLogs.visitedAt})`
      : sql`date_trunc('day', ${visitLogs.visitedAt})`;

  const humanSessionSql =
    audience === 'bot' || audience === 'unknown'
      ? sql<number>`0::int`
      : audience === 'all'
        ? sql<number>`count(distinct case when ${visitLogs.trafficClass} = 'human' then ${visitLogs.sessionId} end)::int`
        : sql<number>`count(distinct ${visitLogs.sessionId})::int`;

  const rows = await db
    .select({
      date: sql<string>`${bucket}::text`,
      visits: sql<number>`count(*)::int`,
      uniqueSessions: humanSessionSql,
      uniqueIpHashes: sql<number>`count(distinct ${visitLogs.ipHash})::int`,
    })
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .groupBy(bucket)
    .orderBy(asc(bucket));

  const points = rows.map((r) => ({
    date: r.date,
    visits: r.visits,
    uniqueSessions: r.uniqueSessions,
    uniqueIpHashes: r.uniqueIpHashes,
  }));
  assertNoIpFields(points);
  return points;
}

export async function getGeoDistribution(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'human',
): Promise<{ countries: GeoCountryCount[]; cities: GeoCityCount[] }> {
  const filter = combinedFilter(range, audience);

  const countries = await db
    .select({
      countryCode: visitLogs.countryCode,
      countryName: visitLogs.countryName,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(filter)
    .groupBy(visitLogs.countryCode, visitLogs.countryName)
    .orderBy(desc(sql`count(*)`))
    .limit(50);

  const cities = await db
    .select({
      countryCode: visitLogs.countryCode,
      city: visitLogs.city,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(filter)
    .groupBy(visitLogs.countryCode, visitLogs.city)
    .orderBy(desc(sql`count(*)`))
    .limit(50);

  const result = { countries, cities };
  assertNoIpFields(result);
  return result;
}

export async function getTopPages(
  db: Database,
  range?: DateRange,
  limit = 20,
  audience: TrafficAudience = 'human',
): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.sectionSlug}, ${visitLogs.path})`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .groupBy(sql`coalesce(${visitLogs.sectionSlug}, ${visitLogs.path})`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  assertNoIpFields(rows);
  return rows;
}

export async function getTopSubjects(
  db: Database,
  range?: DateRange,
  limit = 20,
  audience: TrafficAudience = 'human',
): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.subjectSlug}, '(sin materia)')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .groupBy(sql`coalesce(${visitLogs.subjectSlug}, '(sin materia)')`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  assertNoIpFields(rows);
  return rows;
}

export async function getReferrers(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'human',
): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(nullif(${visitLogs.referer}, ''), '(directo)')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .groupBy(sql`coalesce(nullif(${visitLogs.referer}, ''), '(directo)')`)
    .orderBy(desc(sql`count(*)`))
    .limit(30);

  assertNoIpFields(rows);
  return rows;
}

export async function getDevices(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'human',
): Promise<{ devices: NamedCount[]; browsers: NamedCount[]; os: NamedCount[] }> {
  const filter = combinedFilter(range, audience);

  const devices = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.deviceType}, 'unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(filter)
    .groupBy(visitLogs.deviceType)
    .orderBy(desc(sql`count(*)`));

  const browsers = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.browser}, 'unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(filter)
    .groupBy(visitLogs.browser)
    .orderBy(desc(sql`count(*)`))
    .limit(20);

  const os = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.os}, 'unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(filter)
    .groupBy(visitLogs.os)
    .orderBy(desc(sql`count(*)`))
    .limit(20);

  const result = { devices, browsers, os };
  assertNoIpFields(result);
  return result;
}

export async function getLanguages(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'human',
): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.primaryLanguage}, 'unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .groupBy(visitLogs.primaryLanguage)
    .orderBy(desc(sql`count(*)`))
    .limit(30);

  assertNoIpFields(rows);
  return rows;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank))] ?? 0;
}

export async function getRpmStats(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'all',
): Promise<RpmStats> {
  const filter = combinedFilter(range, audience);
  const minute = sql`date_trunc('minute', ${visitLogs.visitedAt})`;

  const [classRows, ipRows, totalRow] = await Promise.all([
    db
      .select({
        minute: sql<string>`${minute}::text`,
        trafficClass: visitLogs.trafficClass,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(filter)
      .groupBy(minute, visitLogs.trafficClass)
      .orderBy(asc(minute)),
    db
      .select({
        ipHash: visitLogs.ipHash,
        count: sql<number>`count(*)::int`,
      })
      .from(visitLogs)
      .where(and(filter, sql`${visitLogs.ipHash} is not null`))
      .groupBy(visitLogs.ipHash, minute),
    countWhere(db, filter),
  ]);

  const byMinute = new Map<string, { human: number; bot: number; unknown: number; total: number }>();
  for (const row of classRows) {
    const current = byMinute.get(row.minute) ?? { human: 0, bot: 0, unknown: 0, total: 0 };
    if (row.trafficClass === 'human') current.human += row.count;
    else if (row.trafficClass === 'bot') current.bot += row.count;
    else current.unknown += row.count;
    current.total += row.count;
    byMinute.set(row.minute, current);
  }

  const series = [...byMinute.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([minuteLabel, counts]) => ({ minute: minuteLabel, ...counts }));

  const totals = series.map((s) => s.total).sort((a, b) => a - b);
  const elapsedMinutes = range
    ? Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / 60_000))
    : Math.max(1, series.length);

  const ipMax = ipRows.reduce((max, row) => Math.max(max, row.count), 0);

  const rpm: RpmStats = {
    maxPerMinute: totals.length ? totals[totals.length - 1]! : 0,
    maxPerIpHash: ipMax,
    mean: Math.round((totalRow / elapsedMinutes) * 100) / 100,
    median: percentile(totals, 50),
    p95: percentile(totals, 95),
    series: series.slice(-180),
  };
  assertNoIpFields(rpm);
  return rpm;
}

export async function getBotsAnalytics(db: Database, range?: DateRange): Promise<BotsAnalytics> {
  const botFilter = combinedFilter(range, 'bot');
  const totalFilter = rangeFilter(range);
  const minute = sql`date_trunc('minute', ${visitLogs.visitedAt})`;

  const [totalBotRequests, totalTraffic, grouped, rpmRows, categories, paths, countries, cities] =
    await Promise.all([
      countWhere(db, botFilter),
      countWhere(db, totalFilter),
      db
        .select({
          botId: sql<string>`coalesce(${visitLogs.botId}, '(sin id)')`,
          category: visitLogs.botCategory,
          requests: sql<number>`count(*)::int`,
          uniquePaths: sql<number>`count(distinct ${visitLogs.path})::int`,
          uniqueIpHashes: sql<number>`count(distinct ${visitLogs.ipHash})::int`,
          uniqueNetworks: sql<number>`count(distinct ${visitLogs.ipNetwork})::int`,
          firstSeen: sql<string | null>`min(${visitLogs.visitedAt})::text`,
          lastSeen: sql<string | null>`max(${visitLogs.visitedAt})::text`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(sql`coalesce(${visitLogs.botId}, '(sin id)')`, visitLogs.botCategory)
        .orderBy(desc(sql`count(*)`)),
      db
        .select({
          botId: sql<string>`coalesce(${visitLogs.botId}, '(sin id)')`,
          n: sql<number>`count(*)::int`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(sql`coalesce(${visitLogs.botId}, '(sin id)')`, minute),
      db
        .select({
          name: sql<string>`coalesce(${visitLogs.botCategory}, 'unknown')`,
          count: sql<number>`count(*)::int`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(visitLogs.botCategory)
        .orderBy(desc(sql`count(*)`)),
      db
        .select({
          name: visitLogs.path,
          count: sql<number>`count(*)::int`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(visitLogs.path)
        .orderBy(desc(sql`count(*)`))
        .limit(20),
      db
        .select({
          countryCode: visitLogs.countryCode,
          countryName: visitLogs.countryName,
          count: sql<number>`count(*)::int`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(visitLogs.countryCode, visitLogs.countryName)
        .orderBy(desc(sql`count(*)`))
        .limit(20),
      db
        .select({
          countryCode: visitLogs.countryCode,
          city: visitLogs.city,
          count: sql<number>`count(*)::int`,
        })
        .from(visitLogs)
        .where(botFilter)
        .groupBy(visitLogs.countryCode, visitLogs.city)
        .orderBy(desc(sql`count(*)`))
        .limit(20),
    ]);

  const rpmByBot = new Map<string, number>();
  for (const row of rpmRows) {
    rpmByBot.set(row.botId, Math.max(rpmByBot.get(row.botId) ?? 0, row.n));
  }
  const bots: BotSummaryRow[] = grouped.map((row) => ({
    botId: row.botId,
    category: row.category,
    requests: row.requests,
    uniquePaths: row.uniquePaths,
    uniqueIpHashes: row.uniqueIpHashes,
    uniqueNetworks: row.uniqueNetworks,
    firstSeen: row.firstSeen,
    lastSeen: row.lastSeen,
    maxRpm: rpmByBot.get(row.botId) ?? 0,
    percent: pct(row.requests, totalBotRequests),
  }));

  const rpm = await getRpmStats(db, range, 'bot');

  const result: BotsAnalytics = {
    totalBotRequests,
    totalTraffic,
    botPercent: pct(totalBotRequests, totalTraffic),
    topBotId: bots[0] ? displayBotLabel(bots[0].botId) : null,
    categories,
    paths,
    countries,
    cities,
    bots,
    rpm,
  };
  assertNoIpFields(result);
  return result;
}

export async function exportVisits(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'all',
  format: 'csv' | 'json' = 'csv',
): Promise<{ body: string; contentType: string; filename: string }> {
  const rows = await db
    .select()
    .from(visitLogs)
    .where(combinedFilter(range, audience))
    .orderBy(desc(visitLogs.visitedAt))
    .limit(10_000);

  const dtos: VisitLogAdminDto[] = rows.map(toVisitLogAdminDto);
  assertNoIpFields(dtos);
  if (format === 'json') {
    return {
      body: JSON.stringify(dtos),
      contentType: 'application/json; charset=utf-8',
      filename: 'visit-logs.json',
    };
  }
  return {
    body: visitsToCsv(dtos),
    contentType: 'text/csv; charset=utf-8',
    filename: 'visit-logs.csv',
  };
}

export async function exportVisitsCsv(
  db: Database,
  range?: DateRange,
  audience: TrafficAudience = 'all',
): Promise<string> {
  const exported = await exportVisits(db, range, audience, 'csv');
  return exported.body;
}

export { listRecentVisitsAdmin };

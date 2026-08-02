import { and, asc, desc, gte, lte, sql } from 'drizzle-orm';
import type {
  AnalyticsOverview,
  GeoCityCount,
  GeoCountryCount,
  NamedCount,
  TimeseriesPoint,
  VisitLogAdminDto,
} from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';
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

export async function getOverview(db: Database): Promise<AnalyticsOverview> {
  const today = startOfUtcDay();
  const week = daysAgo(7);
  const month = daysAgo(30);

  const [todayRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitLogs)
    .where(gte(visitLogs.visitedAt, today));

  const [weekRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitLogs)
    .where(gte(visitLogs.visitedAt, week));

  const [monthRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visitLogs)
    .where(gte(visitLogs.visitedAt, month));

  const [uniqueWeek] = await db
    .select({ count: sql<number>`count(distinct ${visitLogs.sessionId})::int` })
    .from(visitLogs)
    .where(gte(visitLogs.visitedAt, week));

  const [totalRow] = await db.select({ count: sql<number>`count(*)::int` }).from(visitLogs);

  const [topCountry] = await db
    .select({
      code: visitLogs.countryCode,
      name: visitLogs.countryName,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(gte(visitLogs.visitedAt, month))
    .groupBy(visitLogs.countryCode, visitLogs.countryName)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const [topSection] = await db
    .select({
      slug: visitLogs.sectionSlug,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(and(gte(visitLogs.visitedAt, month), sql`${visitLogs.sectionSlug} is not null`))
    .groupBy(visitLogs.sectionSlug)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  const overview: AnalyticsOverview = {
    visitsToday: todayRow?.count ?? 0,
    visitsWeek: weekRow?.count ?? 0,
    visitsMonth: monthRow?.count ?? 0,
    uniqueSessionsWeek: uniqueWeek?.count ?? 0,
    topCountry: topCountry
      ? { code: topCountry.code, name: topCountry.name, count: topCountry.count }
      : null,
    topSection: topSection ? { slug: topSection.slug, count: topSection.count } : null,
    totalVisits: totalRow?.count ?? 0,
  };

  assertNoIpFields(overview);
  return overview;
}

export async function getTimeseries(
  db: Database,
  range: DateRange,
  granularity: 'day' | 'hour' = 'day',
): Promise<TimeseriesPoint[]> {
  const bucket =
    granularity === 'hour'
      ? sql`date_trunc('hour', ${visitLogs.visitedAt})`
      : sql`date_trunc('day', ${visitLogs.visitedAt})`;

  const rows = await db
    .select({
      date: sql<string>`${bucket}::text`,
      visits: sql<number>`count(*)::int`,
      uniqueSessions: sql<number>`count(distinct ${visitLogs.sessionId})::int`,
    })
    .from(visitLogs)
    .where(rangeFilter(range))
    .groupBy(bucket)
    .orderBy(asc(bucket));

  const points = rows.map((r) => ({
    date: r.date,
    visits: r.visits,
    uniqueSessions: r.uniqueSessions,
  }));
  assertNoIpFields(points);
  return points;
}

export async function getGeoDistribution(
  db: Database,
  range?: DateRange,
): Promise<{ countries: GeoCountryCount[]; cities: GeoCityCount[] }> {
  const filter = rangeFilter(range);

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
): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.sectionSlug}, ${visitLogs.path})`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(rangeFilter(range))
    .groupBy(sql`coalesce(${visitLogs.sectionSlug}, ${visitLogs.path})`)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  assertNoIpFields(rows);
  return rows;
}

export async function getReferrers(db: Database, range?: DateRange): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(nullif(${visitLogs.referer}, ''), '(directo)')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(rangeFilter(range))
    .groupBy(sql`coalesce(nullif(${visitLogs.referer}, ''), '(directo)')`)
    .orderBy(desc(sql`count(*)`))
    .limit(30);

  assertNoIpFields(rows);
  return rows;
}

export async function getDevices(
  db: Database,
  range?: DateRange,
): Promise<{ devices: NamedCount[]; browsers: NamedCount[]; os: NamedCount[] }> {
  const filter = rangeFilter(range);

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

export async function getLanguages(db: Database, range?: DateRange): Promise<NamedCount[]> {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${visitLogs.primaryLanguage}, 'unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(visitLogs)
    .where(rangeFilter(range))
    .groupBy(visitLogs.primaryLanguage)
    .orderBy(desc(sql`count(*)`))
    .limit(30);

  assertNoIpFields(rows);
  return rows;
}

export async function exportVisitsCsv(db: Database, range?: DateRange): Promise<string> {
  const rows = await db
    .select()
    .from(visitLogs)
    .where(rangeFilter(range))
    .orderBy(desc(visitLogs.visitedAt))
    .limit(10_000);

  const dtos: VisitLogAdminDto[] = rows.map(toVisitLogAdminDto);
  return visitsToCsv(dtos);
}

export { listRecentVisitsAdmin };

import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../db/client.js';
import { isTrafficAudience, type TrafficAudience } from '../lib/analytics-audience.js';
import { requireAdmin, type AdminEnv } from '../middleware/require-admin.js';
import {
  exportVisits,
  getBotsAnalytics,
  getDevices,
  getGeoDistribution,
  getLanguages,
  getOverview,
  getReferrers,
  getRpmStats,
  getTimeseries,
  getTopPages,
  getTopSubjects,
  listRecentVisitsAdmin,
} from '../services/admin-analytics.js';

const rangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
  granularity: z.enum(['day', 'hour']).optional(),
  format: z.enum(['csv', 'json']).optional(),
  audience: z.enum(['human', 'bot', 'unknown', 'all']).optional(),
});

function parseRange(query: z.infer<typeof rangeSchema>): { from: Date; to: Date } {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
}

function parseAudience(
  query: z.infer<typeof rangeSchema>,
  fallback: TrafficAudience,
): TrafficAudience {
  if (query.audience && isTrafficAudience(query.audience)) return query.audience;
  return fallback;
}

export function createAdminAnalyticsRoutes(getDb: () => Database) {
  const routes = new Hono<AdminEnv>();
  routes.use('*', requireAdmin);

  routes.get('/overview', async (c) => {
    const data = await getOverview(getDb());
    return c.json(data);
  });

  routes.get('/timeseries', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const range = parseRange(parsed.data);
    const data = await getTimeseries(
      getDb(),
      range,
      parsed.data.granularity ?? 'day',
      parseAudience(parsed.data, 'human'),
    );
    return c.json({ points: data });
  });

  routes.get('/geo', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getGeoDistribution(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'human'),
    );
    return c.json(data);
  });

  routes.get('/pages', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getTopPages(
      getDb(),
      parseRange(parsed.data),
      parsed.data.limit ?? 20,
      parseAudience(parsed.data, 'human'),
    );
    return c.json({ pages: data });
  });

  routes.get('/subjects', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getTopSubjects(
      getDb(),
      parseRange(parsed.data),
      parsed.data.limit ?? 20,
      parseAudience(parsed.data, 'human'),
    );
    return c.json({ subjects: data });
  });

  routes.get('/referrers', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getReferrers(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'human'),
    );
    return c.json({ referrers: data });
  });

  routes.get('/devices', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getDevices(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'human'),
    );
    return c.json(data);
  });

  routes.get('/languages', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getLanguages(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'human'),
    );
    return c.json({ languages: data });
  });

  routes.get('/recent', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await listRecentVisitsAdmin(
      getDb(),
      parsed.data.limit ?? 100,
      parseAudience(parsed.data, 'all'),
    );
    return c.json({ visits: data });
  });

  routes.get('/bots', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getBotsAnalytics(getDb(), parseRange(parsed.data));
    return c.json(data);
  });

  routes.get('/rpm', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getRpmStats(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'all'),
    );
    return c.json(data);
  });

  routes.get('/export', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const format = parsed.data.format === 'json' ? 'json' : 'csv';
    const exported = await exportVisits(
      getDb(),
      parseRange(parsed.data),
      parseAudience(parsed.data, 'all'),
      format,
    );
    return new Response(exported.body, {
      status: 200,
      headers: {
        'Content-Type': exported.contentType,
        'Content-Disposition': `attachment; filename="${exported.filename}"`,
      },
    });
  });

  return routes;
}

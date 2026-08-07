import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../db/client.js';
import { requireAdmin, type AdminEnv } from '../middleware/require-admin.js';
import {
  exportVisitsCsv,
  getDevices,
  getGeoDistribution,
  getLanguages,
  getOverview,
  getReferrers,
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
  format: z.enum(['csv']).optional(),
});

function parseRange(query: z.infer<typeof rangeSchema>): { from: Date; to: Date } {
  const to = query.to ? new Date(query.to) : new Date();
  const from = query.from
    ? new Date(query.from)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
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
    const data = await getTimeseries(getDb(), range, parsed.data.granularity ?? 'day');
    return c.json({ points: data });
  });

  routes.get('/geo', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getGeoDistribution(getDb(), parseRange(parsed.data));
    return c.json(data);
  });

  routes.get('/pages', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getTopPages(getDb(), parseRange(parsed.data), parsed.data.limit ?? 20);
    return c.json({ pages: data });
  });

  routes.get('/subjects', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getTopSubjects(getDb(), parseRange(parsed.data), parsed.data.limit ?? 20);
    return c.json({ subjects: data });
  });

  routes.get('/referrers', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getReferrers(getDb(), parseRange(parsed.data));
    return c.json({ referrers: data });
  });

  routes.get('/devices', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getDevices(getDb(), parseRange(parsed.data));
    return c.json(data);
  });

  routes.get('/languages', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await getLanguages(getDb(), parseRange(parsed.data));
    return c.json({ languages: data });
  });

  routes.get('/recent', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await listRecentVisitsAdmin(getDb(), parsed.data.limit ?? 100);
    return c.json({ visits: data });
  });

  routes.get('/export', async (c) => {
    const parsed = rangeSchema.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const csv = await exportVisitsCsv(getDb(), parseRange(parsed.data));
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="visit-logs.csv"',
      },
    });
  });

  return routes;
}

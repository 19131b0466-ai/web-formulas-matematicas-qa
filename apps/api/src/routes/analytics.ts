import { Hono } from 'hono';
import { z } from 'zod';
import type { TrackVisitResponse } from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { extractIp } from '../lib/request-meta.js';
import { recordVisit } from '../services/analytics.js';

const FORBIDDEN_IP_KEYS = new Set([
  'ip',
  'ipAddress',
  'ip_address',
  'clientIp',
  'client_ip',
  'xForwardedFor',
]);

const trackVisitSchema = z
  .object({
    sessionId: z.string().uuid(),
    path: z.string().min(1).max(500),
    referer: z.string().max(2000).nullable().optional(),
    acceptLanguage: z.string().max(200).nullable().optional(),
    screen: z
      .object({
        width: z.number().int().positive().max(10000),
        height: z.number().int().positive().max(10000),
      })
      .nullable()
      .optional(),
    sectionSlug: z.string().max(200).nullable().optional(),
    searchQuery: z.string().max(500).nullable().optional(),
    queryString: z.string().max(1000).nullable().optional(),
  })
  .strict();

/** Simple in-memory rate limit: 10 requests / minute / IP. */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function allowRate(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function createAnalyticsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.post('/visit', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (body && typeof body === 'object') {
      for (const key of Object.keys(body as Record<string, unknown>)) {
        if (FORBIDDEN_IP_KEYS.has(key)) {
          return c.json({ error: 'IP fields are not accepted from the client' }, 400);
        }
      }
    }

    const parsed = trackVisitSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid body', details: parsed.error.flatten() }, 400);
    }

    const headers = c.req.raw.headers;
    const ip = extractIp(headers);
    if (!allowRate(ip)) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    const result = await recordVisit(getDb(), parsed.data, headers);

    const response: TrackVisitResponse = {
      ok: true,
      ...(result.deduplicated ? { deduplicated: true } : {}),
    };

    return c.json(response);
  });

  return routes;
}

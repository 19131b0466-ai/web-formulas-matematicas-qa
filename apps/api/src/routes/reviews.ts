import { Hono } from 'hono';
import { z } from 'zod';
import type { SubmitReviewResponse } from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { extractIp } from '../lib/request-meta.js';
import { createReview, listApprovedReviews } from '../services/reviews.js';

const submitSchema = z.object({
  displayName: z.string().trim().max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(12).max(800),
  locale: z.enum(['es', 'en', 'de', 'pt', 'fr', 'it']).optional(),
  website: z.string().max(200).optional(),
});

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function allowRate(ip: string, limit = 3, windowMs = 60 * 60 * 1000): boolean {
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

export function createReviewsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const data = await listApprovedReviews(getDb());
    return c.json(data);
  });

  routes.post('/', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = submitSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid body', details: parsed.error.flatten() }, 400);
    }

    if (parsed.data.website?.trim()) {
      const ok: SubmitReviewResponse = { ok: true };
      return c.json(ok, 201);
    }

    const ip = extractIp(c.req.raw.headers);
    if (!allowRate(ip)) {
      return c.json({ error: 'Too many requests' }, 429);
    }

    const name = parsed.data.displayName?.trim() || null;
    await createReview(getDb(), {
      displayName: name,
      rating: parsed.data.rating,
      body: parsed.data.body,
      locale: parsed.data.locale ?? 'es',
    });

    const ok: SubmitReviewResponse = { ok: true };
    return c.json(ok, 201);
  });

  return routes;
}

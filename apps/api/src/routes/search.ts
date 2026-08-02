import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../db/client.js';
import { searchContent } from '../services/content.js';

const querySchema = z.object({
  q: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export function createSearchRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const parsed = querySchema.safeParse(c.req.query());
    if (!parsed.success) {
      return c.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, 400);
    }

    const { q, tags, limit } = parsed.data;
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (!q && tagList.length === 0) {
      return c.json({ error: 'Provide q and/or tags' }, 400);
    }

    const result = await searchContent(getDb(), q, tagList, limit);
    return c.json(result);
  });

  return routes;
}

import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../db/client.js';
import { requireAdmin, type AdminEnv } from '../middleware/require-admin.js';
import { deleteReview, listAdminReviews, setReviewStatus } from '../services/reviews.js';

const listQuery = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

const patchBody = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

export function createAdminReviewsRoutes(getDb: () => Database) {
  const routes = new Hono<AdminEnv>();
  routes.use('*', requireAdmin);

  routes.get('/', async (c) => {
    const parsed = listQuery.safeParse(c.req.query());
    if (!parsed.success) return c.json({ error: 'Invalid query' }, 400);
    const data = await listAdminReviews(getDb(), parsed.data.status);
    return c.json(data);
  });

  routes.patch('/:id', async (c) => {
    const id = c.req.param('id');
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }
    const parsed = patchBody.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Invalid body' }, 400);
    const ok = await setReviewStatus(getDb(), id, parsed.data.status);
    if (!ok) return c.json({ error: 'Not found' }, 404);
    return c.json({ ok: true });
  });

  routes.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const ok = await deleteReview(getDb(), id);
    if (!ok) return c.json({ error: 'Not found' }, 404);
    return c.json({ ok: true });
  });

  return routes;
}

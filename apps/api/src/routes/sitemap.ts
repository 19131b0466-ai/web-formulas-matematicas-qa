import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { listSitemapEntries } from '../services/content.js';

export function createSitemapRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/entries', async (c) => {
    const entries = await listSitemapEntries(getDb());
    return c.json({ entries });
  });

  return routes;
}

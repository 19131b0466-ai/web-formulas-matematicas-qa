import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { getMethodGuide } from '../services/content.js';

export function createGuideRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/method-selection', async (c) => {
    const result = await getMethodGuide(getDb());
    return c.json(result);
  });

  return routes;
}

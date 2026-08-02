import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { listTags } from '../services/content.js';

export function createTagsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const result = await listTags(getDb());
    return c.json(result);
  });

  return routes;
}

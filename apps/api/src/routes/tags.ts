import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { listTags } from '../services/content.js';

export function createTagsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const subject = c.req.query('subject') ?? 'calculo-ii';
    const result = await listTags(getDb(), subject);
    return c.json(result);
  });

  return routes;
}

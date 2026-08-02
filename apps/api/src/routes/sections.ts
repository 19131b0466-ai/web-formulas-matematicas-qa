import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { getSectionBySlug, listSectionsTree } from '../services/content.js';

export function createSectionsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const tree = await listSectionsTree(getDb());
    return c.json({ sections: tree });
  });

  routes.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const detail = await getSectionBySlug(getDb(), slug);
    if (!detail) {
      return c.json({ error: 'Section not found' }, 404);
    }
    return c.json(detail);
  });

  return routes;
}

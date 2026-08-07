import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { getSectionBySlug, listSectionsTree } from '../services/content.js';

export function createSectionsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const subject = c.req.query('subject') ?? 'calculo-ii';
    const tree = await listSectionsTree(getDb(), subject);
    return c.json({ subjectSlug: subject, sections: tree });
  });

  routes.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const subject = c.req.query('subject') ?? 'calculo-ii';
    const detail = await getSectionBySlug(getDb(), slug, subject);
    if (!detail) {
      return c.json({ error: 'Section not found' }, 404);
    }
    return c.json(detail);
  });

  return routes;
}

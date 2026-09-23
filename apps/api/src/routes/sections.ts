import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { withTimeout } from '../lib/with-timeout.js';
import { getSectionBySlug, listSectionsTree } from '../services/content.js';

const SECTION_QUERY_TIMEOUT_MS = 20_000;

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
    const detail = await withTimeout(
      getSectionBySlug(getDb(), slug, subject),
      SECTION_QUERY_TIMEOUT_MS,
      `section ${subject}/${slug}`,
    );
    if (!detail) {
      return c.json({ error: 'Section not found' }, 404);
    }
    return c.json(detail);
  });

  return routes;
}

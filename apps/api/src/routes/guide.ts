import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { withTimeout } from '../lib/with-timeout.js';
import { getMethodGuide } from '../services/content.js';

const GUIDE_QUERY_TIMEOUT_MS = 20_000;

const GUIDE_SUBJECTS = new Set([
  'calculo-diferencial',
  'calculo-ii',
  'fisica-basica',
  'fisica-electronica',
]);

export function createGuideRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/method-selection', async (c) => {
    const raw = c.req.query('subject')?.trim() || 'calculo-ii';
    const subjectSlug = GUIDE_SUBJECTS.has(raw) ? raw : 'calculo-ii';
    const result = await withTimeout(
      getMethodGuide(getDb(), subjectSlug),
      GUIDE_QUERY_TIMEOUT_MS,
      `guide ${subjectSlug}`,
    );
    return c.json(result);
  });

  return routes;
}

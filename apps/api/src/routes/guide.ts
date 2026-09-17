import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { getMethodGuide } from '../services/content.js';

const GUIDE_SUBJECTS = new Set(['calculo-diferencial', 'calculo-ii', 'fisica-basica']);

export function createGuideRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/method-selection', async (c) => {
    const raw = c.req.query('subject')?.trim() || 'calculo-ii';
    const subjectSlug = GUIDE_SUBJECTS.has(raw) ? raw : 'calculo-ii';
    const result = await getMethodGuide(getDb(), subjectSlug);
    return c.json(result);
  });

  return routes;
}

import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import {
  getFormulaByCode,
  getSectionBySlug,
  listSectionsTree,
  listSubjects,
  listTags,
  searchContent,
} from '../services/content.js';

export function createSubjectsRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.get('/', async (c) => {
    const items = await listSubjects(getDb());
    return c.json({ subjects: items });
  });

  routes.get('/:subjectSlug/sections', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const tree = await listSectionsTree(getDb(), subjectSlug);
    return c.json({ subjectSlug, sections: tree });
  });

  routes.get('/:subjectSlug/sections/:slug', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const slug = c.req.param('slug');
    const detail = await getSectionBySlug(getDb(), slug, subjectSlug);
    if (!detail) {
      return c.json({ error: 'Section not found' }, 404);
    }
    return c.json(detail);
  });

  routes.get('/:subjectSlug/search', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const q = c.req.query('q') ?? '';
    const tagsRaw = c.req.query('tags') ?? '';
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const limit = Math.min(Number(c.req.query('limit') ?? 40), 100);
    const result = await searchContent(getDb(), q, tags, limit, subjectSlug);
    return c.json(result);
  });

  routes.get('/:subjectSlug/tags', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const result = await listTags(getDb(), subjectSlug);
    return c.json(result);
  });

  routes.get('/:subjectSlug/formulas/:formulaId', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const formulaId = c.req.param('formulaId');
    const detail = await getFormulaByCode(getDb(), subjectSlug, formulaId);
    if (!detail) {
      return c.json({ error: 'Formula not found' }, 404);
    }
    return c.json(detail);
  });

  return routes;
}

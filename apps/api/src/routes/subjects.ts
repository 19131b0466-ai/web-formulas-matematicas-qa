import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import {
  listFormulaCodes,
  getFormulaByCode,
  getSectionBySlug,
  listSectionsTree,
  listSubjects,
  listTags,
  searchContent,
} from '../services/content.js';
import { withTimeout } from '../lib/with-timeout.js';

const SECTION_QUERY_TIMEOUT_MS = 20_000;
const FORMULA_QUERY_TIMEOUT_MS = 20_000;
const SEARCH_QUERY_TIMEOUT_MS = 20_000;

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
    const detail = await withTimeout(
      getSectionBySlug(getDb(), slug, subjectSlug),
      SECTION_QUERY_TIMEOUT_MS,
      `section ${subjectSlug}/${slug}`,
    );
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
    const result = await withTimeout(
      searchContent(getDb(), q, tags, limit, subjectSlug),
      SEARCH_QUERY_TIMEOUT_MS,
      `search ${subjectSlug}`,
    );
    return c.json(result);
  });

  routes.get('/:subjectSlug/tags', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const result = await listTags(getDb(), subjectSlug);
    return c.json(result);
  });

  routes.get('/:subjectSlug/formulas', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const formulas = await listFormulaCodes(getDb(), subjectSlug);
    return c.json({ subjectSlug, formulas });
  });

  routes.get('/:subjectSlug/formulas/:formulaId', async (c) => {
    const subjectSlug = c.req.param('subjectSlug');
    const formulaId = c.req.param('formulaId');
    const detail = await withTimeout(
      getFormulaByCode(getDb(), subjectSlug, formulaId),
      FORMULA_QUERY_TIMEOUT_MS,
      `formula ${subjectSlug}/${formulaId}`,
    );
    if (!detail) {
      return c.json({ error: 'Formula not found' }, 404);
    }
    return c.json(detail);
  });

  return routes;
}

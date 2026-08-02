import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.js';
import { seedFromMarkdown } from '../seed/import-markdown.js';
import { createTestDb, type TestDatabase } from './setup-db.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../');
const MD_PATH = resolve(ROOT, 'content/formulas-calculo-ii.md');

describe('API content endpoints (PGlite)', () => {
  let db: TestDatabase;
  let client: Awaited<ReturnType<typeof createTestDb>>['client'];
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const setup = await createTestDb();
    db = setup.db;
    client = setup.client;
    const stats = await seedFromMarkdown(db as never, MD_PATH);
    expect(stats.blockCount).toBeGreaterThan(200);
    app = createApp(() => db as never);
  }, 60_000);

  afterAll(async () => {
    if (client) await client.close();
  });

  it('GET /v1/health', async () => {
    const res = await app.request('/v1/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('GET /v1/sections returns a tree with planned top-level slugs', async () => {
    const res = await app.request('/v1/sections');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      sections: Array<{ slug: string; children?: unknown[] }>;
    };
    const slugs = body.sections.map((s) => s.slug);
    expect(slugs).toContain('integracion-por-partes');
    expect(slugs).toContain('apendice-antiderivadas');
    expect(slugs).toContain('guia-metodos');
  });

  it('GET /v1/sections/:slug returns blocks and subsections', async () => {
    const res = await app.request('/v1/sections/integracion-por-partes');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      section: { slug: string; title: string };
      blocks: Array<{ type: string; content: Record<string, unknown> }>;
      subsections: Array<{ slug: string }>;
    };
    expect(body.section.slug).toBe('integracion-por-partes');
    expect(body.blocks.length).toBeGreaterThan(0);
    expect(body.blocks.some((b) => b.type === 'formula')).toBe(true);
    expect(body.subsections.length).toBeGreaterThan(0);
  });

  it('GET /v1/sections/:slug returns 404 for unknown slug', async () => {
    const res = await app.request('/v1/sections/no-existe');
    expect(res.status).toBe(404);
  });

  it('GET /v1/search finds formulas by query', async () => {
    const res = await app.request('/v1/search?q=por%20partes&limit=10');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number; results: unknown[] };
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /v1/search filters by tags', async () => {
    const res = await app.request('/v1/search?tags=por-partes&limit=10');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      results: Array<{ tags: string[] }>;
    };
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results.every((r) => r.tags.includes('por-partes'))).toBe(true);
  });

  it('GET /v1/tags returns aggregated tags', async () => {
    const res = await app.request('/v1/tags');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tags: Array<{ tag: string; count: number }> };
    expect(body.tags.length).toBeGreaterThan(5);
    expect(body.tags[0]?.count).toBeGreaterThan(0);
  });

  it('GET /v1/guide/method-selection returns strategies', async () => {
    const res = await app.request('/v1/guide/method-selection');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      strategies: Array<{ signal: string; method: string }>;
      checklist: string[];
    };
    expect(body.strategies.length).toBeGreaterThanOrEqual(5);
    expect(body.checklist.length).toBeGreaterThanOrEqual(5);
  });
});

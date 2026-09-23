import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.js';
import { seedAllSubjects } from '../seed/import-markdown.js';
import { createTestDb, type TestDatabase } from './setup-db.js';

describe('API content endpoints (PGlite)', () => {
  let db: TestDatabase;
  let client: Awaited<ReturnType<typeof createTestDb>>['client'];
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const setup = await createTestDb();
    db = setup.db;
    client = setup.client;
    const stats = await seedAllSubjects(db as never);
    expect(stats.reduce((n, s) => n + s.blockCount, 0)).toBeGreaterThan(200);
    expect(stats.some((s) => s.subjectSlug === 'fisica-basica' && s.formulaCount === 195)).toBe(
      true,
    );
    expect(stats.some((s) => s.subjectSlug === 'fisica-electronica' && s.formulaCount === 188)).toBe(
      true,
    );
    app = createApp(() => db as never);
  }, 120_000);

  afterAll(async () => {
    if (client) await client.close();
  });

  it('GET /v1/health', async () => {
    const res = await app.request('/v1/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('GET /v1/subjects lists all subjects', async () => {
    const res = await app.request('/v1/subjects');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { subjects: Array<{ slug: string }> };
    const slugs = body.subjects.map((s) => s.slug);
    expect(slugs).toContain('calculo-ii');
    expect(slugs).toContain('fisica-basica');
    expect(slugs).toContain('fisica-electronica');
    expect(slugs).toContain('algebra');
  });

  it('GET /v1/sections returns calculo-ii tree by default', async () => {
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

  it('GET /v1/subjects/fisica-basica/sections returns physics chapters', async () => {
    const res = await app.request('/v1/subjects/fisica-basica/sections');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sections: Array<{ slug: string }> };
    const slugs = body.sections.map((s) => s.slug);
    expect(slugs).toContain('vectores');
    expect(slugs).toContain('electricidad-basica');
    expect(slugs).toContain('constantes-fisicas');
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

  it('GET /v1/subjects/algebra/formulas/ALG-FND-001 returns detail + visual + related', async () => {
    const res = await app.request('/v1/subjects/algebra/formulas/ALG-FND-001');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      formulaId: string;
      content: {
        latex: string;
        level?: string;
        visual?: { type: string };
        relatedIds?: string[];
      };
      related: Array<{ formulaId: string }>;
      section: { slug: string };
    };
    expect(body.formulaId).toBe('ALG-FND-001');
    expect(body.section.slug).toBe('numeros-propiedades');
    expect(body.content.level).toBe('fundamental');
    expect(body.content.visual?.type).toBe('algebra_tiles');
    expect(body.related.length).toBeGreaterThan(0);
  });

  it('GET /v1/subjects/fisica-basica/formulas/VEC-001 returns detail + related', async () => {
    const res = await app.request('/v1/subjects/fisica-basica/formulas/VEC-001');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      formulaId: string;
      content: { latex: string; relatedIds?: string[] };
      related: Array<{ formulaId: string }>;
      section: { slug: string };
    };
    expect(body.formulaId).toBe('VEC-001');
    expect(body.section.slug).toBe('vectores');
    expect(body.content.latex.length).toBeGreaterThan(0);
    expect(body.related.length).toBeGreaterThan(0);
  });

  it('GET /v1/subjects/calculo-ii/formulas/INT-001 returns detail + related', async () => {
    const res = await app.request('/v1/subjects/calculo-ii/formulas/INT-001');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      formulaId: string;
      content: { latex: string; formulaId?: string; relatedIds?: string[] };
      related: Array<{ formulaId: string }>;
      section: { slug: string };
    };
    expect(body.formulaId).toBe('INT-001');
    expect(body.content.formulaId).toBe('INT-001');
    expect(body.content.latex.length).toBeGreaterThan(0);
    expect(body.related.length).toBeGreaterThan(0);
    expect(body.related.some((r) => r.formulaId.startsWith('INT-'))).toBe(true);
  });

  it('GET calculo search finds by formula code', async () => {
    const res = await app.request('/v1/subjects/calculo-ii/search?q=INT-002&limit=5');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      total: number;
      results: Array<{ formulaCode?: string | null }>;
    };
    expect(body.total).toBeGreaterThan(0);
    expect(body.results.some((r) => r.formulaCode === 'INT-002')).toBe(true);
  });

  it('GET formula returns 404 for unknown id', async () => {
    const res = await app.request('/v1/subjects/fisica-basica/formulas/ZZZ-999');
    expect(res.status).toBe(404);
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

  it('GET physics search finds by formula code', async () => {
    const res = await app.request('/v1/subjects/fisica-basica/search?q=VEC-001&limit=5');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number };
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
    const res = await app.request('/v1/guide/method-selection?subject=calculo-ii');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      strategies: Array<{ signal: string; method: string }>;
      checklist: string[];
    };
    expect(body.strategies.length).toBeGreaterThanOrEqual(5);
    expect(body.checklist.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /v1/guide/method-selection?subject=fisica-basica returns physics strategies', async () => {
    const res = await app.request('/v1/guide/method-selection?subject=fisica-basica');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      strategies: Array<{ signal: string; method: string }>;
      checklist: string[];
    };
    expect(body.strategies.length).toBeGreaterThanOrEqual(10);
    expect(body.checklist.length).toBeGreaterThanOrEqual(5);
    expect(body.strategies.some((s) => /newton|proyectil|ohm/i.test(`${s.signal} ${s.method}`))).toBe(
      true,
    );
  });

  it('GET /v1/subjects/fisica-electronica/sections returns electronics chapters', async () => {
    const res = await app.request('/v1/subjects/fisica-electronica/sections');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sections: Array<{ slug: string }> };
    const slugs = body.sections.map((s) => s.slug);
    expect(slugs).toContain('redes-resistivas');
    expect(slugs).toContain('amplificadores-opamp');
    expect(slugs).toContain('guia-enfoque');
    expect(slugs).toContain('conversion-ad-da');
  });

  it('GET /v1/subjects/fisica-electronica/sections/conversion-ad-da returns ten ADC formulas', async () => {
    const res = await app.request('/v1/subjects/fisica-electronica/sections/conversion-ad-da');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      section: { slug: string; title: string };
      blocks: Array<{ type: string; content?: { formulaId?: string } }>;
    };
    expect(body.section.slug).toBe('conversion-ad-da');
    const formulaIds = body.blocks
      .filter((b) => b.type === 'formula')
      .map((b) => b.content?.formulaId)
      .filter((id): id is string => Boolean(id));
    expect(formulaIds).toEqual([
      'ADC-001',
      'ADC-002',
      'ADC-003',
      'ADC-004',
      'ADC-005',
      'ADC-006',
      'ADC-007',
      'ADC-008',
      'ADC-009',
      'ADC-010',
    ]);
  });

  it('GET /v1/subjects/fisica-electronica/formulas/DIV-001 returns detail + related', async () => {
    const res = await app.request('/v1/subjects/fisica-electronica/formulas/DIV-001');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      formulaId: string;
      content: { latex: string; relatedIds?: string[]; commonErrors?: string[] };
      related: Array<{ formulaId: string; subjectSlug?: string }>;
      section: { slug: string };
    };
    expect(body.formulaId).toBe('DIV-001');
    expect(body.section.slug).toBe('redes-resistivas');
    expect(body.content.latex.length).toBeGreaterThan(0);
    expect(body.content.commonErrors?.length).toBeGreaterThan(0);
    expect(body.related.some((r) => r.formulaId === 'ELE-014')).toBe(true);
  });

  it('GET electronics search finds by formula code', async () => {
    const res = await app.request('/v1/subjects/fisica-electronica/search?q=DIV-001&limit=5');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number };
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /v1/guide/method-selection?subject=fisica-electronica returns electronics strategies', async () => {
    const res = await app.request('/v1/guide/method-selection?subject=fisica-electronica');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      strategies: Array<{ signal: string; method: string }>;
      checklist: string[];
    };
    expect(body.strategies.length).toBeGreaterThanOrEqual(9);
    expect(body.checklist.length).toBeGreaterThanOrEqual(5);
    expect(
      body.strategies.some((s) => /thévenin|thevenin|norton|fasor|flip/i.test(`${s.signal} ${s.method}`)),
    ).toBe(true);
  });
});

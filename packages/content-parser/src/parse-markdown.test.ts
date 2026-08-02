import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseFormulasMarkdown } from './parse-markdown.js';
import { SECTION_SLUG_OVERRIDES } from './tags.js';
import { slugify } from './slugify.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOURCE_MD = resolve(ROOT, 'content/formulas-calculo-ii.md');

const FIXTURE = `# Fórmulas de prueba

Introducción general.

## Índice

1. [Sección demo](#1-sección-demo)

---

## 1. Notación, dominios y convenciones

Texto introductorio con \\(\\ln x\\).

> **Alcance:** nota de dominio importante.

### 1.1 Derivadas útiles

\\[
\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}+C
\\]

## 5. Integración por partes

Proviene de la regla del producto:

\\[
\\int u\\,dv = uv - \\int v\\,du
\\]

- Logarítmicas
- Algebraicas

## 7. Sustitución trigonométrica

### 7.1 Tabla de sustituciones

| Radical | Sustitución |
|---|---|
| \\(\\sqrt{a^2-x^2}\\) | \\(x=a\\operatorname{sen}\\theta\\) |

## 17. Guía para elegir un método

| Señal en el integrando | Método que conviene intentar |
|---|---|
| Composición y aparece la derivada interna | Sustitución |
| Producto con logaritmo | Integración por partes |

## Apéndice A: tabla extensa de antiderivadas

\\[
\\int e^u\\,du = e^u + C
\\]

## Lista final de comprobación

1. Verificar el dominio del integrando.
2. Identificar si la integral es propia o impropia.
`;

describe('slugify', () => {
  it('normalizes spanish accents and punctuation', () => {
    expect(slugify('Integración por partes')).toBe('integracion-por-partes');
    expect(slugify('Teorema Fundamental del Cálculo')).toBe('teorema-fundamental-del-calculo');
  });
});

describe('parseFormulasMarkdown (fixture)', () => {
  const result = parseFormulasMarkdown(FIXTURE);

  it('skips the index section', () => {
    expect(result.sections.every((s) => !/índice/i.test(s.title))).toBe(true);
  });

  it('maps top-level section slugs from the plan overrides', () => {
    const slugs = result.sections.map((s) => s.slug);
    expect(slugs).toContain('notacion-dominios');
    expect(slugs).toContain('integracion-por-partes');
    expect(slugs).toContain('guia-metodos');
    expect(slugs).toContain('apendice-antiderivadas');
  });

  it('creates subsections with parentSlug', () => {
    const sub = result.sections.find((s) => s.number === '1.1');
    expect(sub).toBeDefined();
    expect(sub?.parentSlug).toBe('notacion-dominios');
  });

  it('parses display formulas', () => {
    const formulas = result.sections.flatMap((s) =>
      s.blocks.filter((b) => b.blockType === 'formula'),
    );
    expect(formulas.length).toBeGreaterThanOrEqual(3);
    const latex = formulas.map((f) => ('latex' in f.content ? f.content.latex : ''));
    expect(latex.some((l) => l.includes('\\int u\\,dv'))).toBe(true);
  });

  it('parses strategy rows from method guide table', () => {
    const guide = result.sections.find((s) => s.slug === 'guia-metodos');
    expect(guide).toBeDefined();
    const strategies = guide!.blocks.filter((b) => b.blockType === 'strategy');
    expect(strategies.length).toBe(2);
    expect(strategies[0]?.content).toMatchObject({
      signal: expect.stringContaining('Composición'),
      method: expect.stringContaining('Sustitución'),
    });
  });

  it('keeps math delimiters in table cells for display', () => {
    const section = result.sections.find((s) => s.number === '7.1');
    const table = section?.blocks.find((b) => b.blockType === 'table');
    expect(table).toBeDefined();
    const content = table!.content as { rows: string[][] };
    expect(content.rows[0]?.[0]).toContain('\\(');
    expect(content.rows[0]?.[0]).toContain('\\sqrt');
  });

  it('parses notes, lists and checklist', () => {
    const notes = result.sections.flatMap((s) => s.blocks.filter((b) => b.blockType === 'note'));
    expect(notes.length).toBeGreaterThanOrEqual(1);

    const lists = result.sections.flatMap((s) => s.blocks.filter((b) => b.blockType === 'list'));
    expect(lists.length).toBeGreaterThanOrEqual(2);

    const checklist = result.sections.find((s) => s.slug === 'lista-comprobacion');
    expect(checklist?.blocks[0]?.blockType).toBe('list');
  });

  it('assigns tags including section and technique tags', () => {
    const partes = result.sections.find((s) => s.slug === 'integracion-por-partes');
    const formula = partes?.blocks.find((b) => b.blockType === 'formula');
    expect(formula?.tags).toContain('integracion-por-partes');
    expect(formula?.tags).toContain('por-partes');
  });
});

describe('parseFormulasMarkdown (full document)', () => {
  const markdown = readFileSync(SOURCE_MD, 'utf8');
  const result = parseFormulasMarkdown(markdown);

  it('imports all planned top-level section slugs', () => {
    const topSlugs = new Set(result.sections.filter((s) => !s.parentSlug).map((s) => s.slug));
    for (const slug of Object.values(SECTION_SLUG_OVERRIDES)) {
      expect(topSlugs.has(slug)).toBe(true);
    }
  });

  it('produces a substantial block and formula corpus', () => {
    expect(result.stats.sectionCount).toBeGreaterThanOrEqual(40);
    expect(result.stats.blockCount).toBeGreaterThanOrEqual(200);
    expect(result.stats.formulaCount).toBeGreaterThanOrEqual(100);
    expect(result.stats.tableCount).toBeGreaterThanOrEqual(1);
  });

  it('keeps unique section slugs', () => {
    const slugs = result.sections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

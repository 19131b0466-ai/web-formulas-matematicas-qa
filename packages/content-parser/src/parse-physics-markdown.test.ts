import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parsePhysicsMarkdown } from './parse-physics-markdown.js';
import { PHYSICS_SECTION_SLUG_OVERRIDES } from './tags.js';
import { inferSubjectSlugForFormulaId, type FormulaContent } from '@repo/shared-types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOURCE_MD = resolve(ROOT, 'content/formulas-fisica-basica.md');

const FIXTURE = `# Fórmulas de Física Básica

Introducción.

# Índice

1. [Vectores](#1-vectores)

---

# Notación general

| Símbolo | Significado |
|---|---|
| \(t\) | tiempo |

---

# 1. Vectores

## 1.1 Magnitud de un vector
**ID:** \`VEC-001\`

\\[
|\\\\vec A|=\\\\sqrt{A_x^2+A_y^2+A_z^2}
\\]

**Detalle:** calcula el módulo.

**Variables:** \\(A_x,A_y,A_z\\): componentes.

**Relacionadas:** \`VEC-002\`, \`VEC-003\`.

---

## 1.2 Vector unitario
**ID:** \`VEC-002\`

\\[
\\\\hat u_A=\\\\frac{\\\\vec A}{|\\\\vec A|}
\\]

**Condición:** \\(|\\\\vec A|\\\\neq0\\).

**Relacionadas:** \`VEC-001\`.

---

## 1.3 Trabajo de una fuerza constante
**ID:** \`ENE-001\`

\\[
W=\\\\vec F\\\\cdot\\\\vec d=Fd\\\\cos\\\\theta
\\]

Caso paralelo:

\\[
W=Fd
\\]

**Relacionadas:** \`VEC-002\`.

---

# 17. Constantes físicas

| Constante | Símbolo | Valor | Unidad |
|---|---|---|---|
| Velocidad de la luz | \\(c\\) | \\(3\\\\times10^8\\) | m/s |

---

# 18. Resumen de relaciones

## Cinemática

\`\`\`text
CIN-001
\`\`\`

# Modelo recomendado para implementar cada fórmula en la app

Texto meta.

# Fuentes de referencia para validación

OpenStax.
`;

describe('parsePhysicsMarkdown (fixture)', () => {
  const result = parsePhysicsMarkdown(FIXTURE);

  it('imports chapters 1 and 17 only', () => {
    const slugs = result.sections.map((s) => s.slug);
    expect(slugs).toEqual(['vectores', 'constantes-fisicas']);
  });

  it('parses formula IDs, detail, variables and related', () => {
    const vec = result.sections.find((s) => s.slug === 'vectores');
    const formulas = vec!.blocks.filter((b) => b.blockType === 'formula');
    expect(formulas.length).toBe(3);
    expect(formulas[0]?.formulaCode).toBe('VEC-001');
    const content = formulas[0]!.content as FormulaContent;
    expect(content.formulaId).toBe('VEC-001');
    expect(content.detail).toMatch(/módulo/);
    expect(content.variables).toContain('A_x');
    expect(content.relatedIds).toEqual(['VEC-002', 'VEC-003']);
  });

  it('attaches case intros to additional latex instead of detail', () => {
    const vec = result.sections.find((s) => s.slug === 'vectores');
    const work = vec!.blocks.find((b) => b.formulaCode === 'ENE-001');
    const content = work!.content as FormulaContent;
    expect(content.detail).toBeUndefined();
    expect(content.latexLabel).toBeUndefined();
    expect(content.additionalLatex).toEqual(['W=Fd']);
    expect(content.additionalLatexLabels).toEqual(['Caso paralelo']);
  });

  it('parses conditions as constraints', () => {
    const vec = result.sections.find((s) => s.slug === 'vectores');
    const unit = vec!.blocks.find((b) => b.formulaCode === 'VEC-002');
    const content = unit!.content as FormulaContent;
    expect(content.constraints?.[0]).toContain('neq');
  });

  it('keeps constants table without formula IDs', () => {
    const constants = result.sections.find((s) => s.slug === 'constantes-fisicas');
    expect(constants?.blocks.some((b) => b.blockType === 'table')).toBe(true);
  });
});

describe('parsePhysicsMarkdown (full document)', () => {
  const markdown = readFileSync(SOURCE_MD, 'utf8');
  const result = parsePhysicsMarkdown(markdown);

  it('imports all planned physics chapter slugs', () => {
    const topSlugs = new Set(result.sections.filter((s) => !s.parentSlug).map((s) => s.slug));
    for (const slug of Object.values(PHYSICS_SECTION_SLUG_OVERRIDES)) {
      expect(topSlugs.has(slug)).toBe(true);
    }
  });

  it('produces ~195 formula entries with unique IDs', () => {
    const formulas = result.sections.flatMap((s) =>
      s.blocks.filter((b) => b.blockType === 'formula' && b.formulaCode),
    );
    expect(formulas.length).toBe(195);
    const codes = formulas.map((f) => f.formulaCode!);
    expect(new Set(codes).size).toBe(195);
  });

  it('keeps unique section slugs', () => {
    const slugs = result.sections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('imports the approach guide as strategies and checklist', () => {
    const guide = result.sections.find((s) => s.slug === 'guia-enfoque');
    expect(guide).toBeDefined();
    const strategies = guide!.blocks.filter((b) => b.blockType === 'strategy');
    expect(strategies.length).toBeGreaterThanOrEqual(15);
    const lists = guide!.blocks.filter((b) => b.blockType === 'list');
    expect(lists.length).toBeGreaterThanOrEqual(1);
    const first = strategies[0]!.content as { signal: string; method: string };
    expect(first.signal.toLowerCase()).toMatch(/vector|componente/);
    expect(first.method.toLowerCase()).toMatch(/vector/);
  });

  it('resolves related IDs against known formula codes', () => {
    const codes = new Set(
      result.sections.flatMap((s) =>
        s.blocks.filter((b) => b.formulaCode).map((b) => b.formulaCode!),
      ),
    );
    for (const block of result.sections.flatMap((s) => s.blocks)) {
      if (block.blockType !== 'formula') continue;
      const content = block.content as FormulaContent;
      for (const id of content.relatedIds ?? []) {
        expect(codes.has(id) || inferSubjectSlugForFormulaId(id) !== null).toBe(true);
      }
    }
  });

  it('parses FAQ and unit metadata on high-traffic formulas', () => {
    const formulas = result.sections.flatMap((s) =>
      s.blocks.filter((b) => b.blockType === 'formula'),
    );
    const equ005 = formulas.find((b) => b.formulaCode === 'EQU-005');
    const content = equ005!.content as FormulaContent;
    expect(content.conventions?.[0]).toMatch(/Pa \(N\/m²\)/);
    expect(content.faq?.length).toBeGreaterThanOrEqual(3);
    expect(content.faq?.[0]?.question).toMatch(/fórmula/i);
    expect(content.derivation).toMatch(/σ|sigma/i);
    expect(content.lastReviewedAt).toBe('2026-09-14');
  });

  it('does not store variant intros like "Caso paralelo" as detail', () => {
    const formulas = result.sections.flatMap((s) =>
      s.blocks.filter((b) => b.blockType === 'formula'),
    );
    const ene001 = formulas.find((b) => b.formulaCode === 'ENE-001');
    const content = ene001!.content as FormulaContent;
    expect(content.detail).toMatch(/producto escalar/i);
    expect(content.additionalLatexLabels?.[0]).toBe('Caso paralelo');

    const misleadingDetails = formulas.filter((b) => {
      const c = b.content as FormulaContent;
      if (!c.additionalLatex?.length || !c.detail) return false;
      return isVariantIntroLike(c.detail);
    });
    expect(misleadingDetails.map((b) => b.formulaCode)).toEqual([]);
  });
});

function isVariantIntroLike(text: string): boolean {
  const t = text.trim();
  if (/^(o|y|con)$/i.test(t)) return true;
  if (/^(también|además|equivalentemente|por tanto)\.?$/i.test(t)) return true;
  return t.endsWith(':') && t.length <= 120;
}

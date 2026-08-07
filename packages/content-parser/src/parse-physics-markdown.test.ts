import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parsePhysicsMarkdown } from './parse-physics-markdown.js';
import { PHYSICS_SECTION_SLUG_OVERRIDES } from './tags.js';
import type { FormulaContent } from '@repo/shared-types';

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
    expect(formulas.length).toBe(2);
    expect(formulas[0]?.formulaCode).toBe('VEC-001');
    const content = formulas[0]!.content as FormulaContent;
    expect(content.formulaId).toBe('VEC-001');
    expect(content.detail).toMatch(/módulo/);
    expect(content.variables).toContain('A_x');
    expect(content.relatedIds).toEqual(['VEC-002', 'VEC-003']);
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
        expect(codes.has(id)).toBe(true);
      }
    }
  });
});

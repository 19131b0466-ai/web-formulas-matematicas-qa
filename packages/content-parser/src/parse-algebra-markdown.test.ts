import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { FormulaContent } from '@repo/shared-types';
import { parseAlgebraMarkdown } from './parse-algebra-markdown.js';
import { ALGEBRA_SECTION_SLUG_OVERRIDES } from './tags.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOURCE_MD = resolve(ROOT, 'content/formulas-algebra.md');

const FIXTURE = `---
subject: algebra
title: Test
---

# Fórmulas de Álgebra

# Índice

1. [Números](#1)

# BLOQUE — FUNDAMENTOS

# 1. Números y propiedades algebraicas

## 1.1 Propiedad conmutativa
**ID:** \`ALG-FND-001\`
**Nivel:** \`fundamental\`

\\[
a+b=b+a
\\]

**Descripción corta:** El orden no altera la suma.

### Visualización sugerida

- **Tipo:** \`algebra_tiles\`
- **Concepto visual:** intercambio de sumandos.
- **Elementos:** dos bloques.
- **Idea:** intercambiar orden.
- **Objetivo educativo:** orden no altera suma.
- **Interactividad sugerida:** arrastrar bloques.

### Fórmulas relacionadas

- \`ALG-FND-002\`

---

## 1.2 Sin visual
**ID:** \`ALG-FND-004\`
**Nivel:** \`fundamental\`

\\[
a+0=a
\\]

**Descripción corta:** Neutro aditivo.

### Fórmulas relacionadas

- \`ALG-FND-001\`

# 29. Mapas de relaciones

## Fundamentos

\`\`\`text
Distributiva → Factorización
\`\`\`

# 30. Fronteras con otras materias

- **Cálculo:** límites y derivadas.

# Plantilla para nuevas fórmulas

## Nombre
**ID:** \`ALG-XXX-000\`
`;

describe('parseAlgebraMarkdown', () => {
  it('parses fixture formulas with visual and related ids', () => {
    const result = parseAlgebraMarkdown(FIXTURE);
    expect(result.stats.formulaCount).toBe(2);
    expect(result.sections.some((s) => s.slug === 'numeros-propiedades')).toBe(true);
    const maps = result.sections.find((s) => s.slug === 'mapas-relaciones');
    expect(maps).toBeTruthy();
    expect(maps!.description).toBeNull();
    expect(maps!.blocks.some((b) => b.blockType === 'note')).toBe(false);
    const mapList = maps!.blocks.find((b) => b.blockType === 'list');
    expect(mapList?.title).toBe('Fundamentos');
    expect((mapList!.content as { items: string[] }).items).toContain('Distributiva → Factorización');
    expect(result.sections.some((s) => s.slug === 'fronteras-materias')).toBe(false);

    const fnd = result.sections
      .flatMap((s) => s.blocks)
      .find((b) => b.formulaCode === 'ALG-FND-001');
    expect(fnd).toBeTruthy();
    const content = fnd!.content as FormulaContent;
    expect(content.level).toBe('fundamental');
    expect(content.visual?.type).toBe('algebra_tiles');
    expect(content.visual?.interaction).toMatch(/arrastrar/i);
    expect(content.relatedIds).toContain('ALG-FND-002');
  });

  it('parses the canonical algebra markdown', () => {
    const md = readFileSync(SOURCE_MD, 'utf8');
    const result = parseAlgebraMarkdown(md);
    expect(result.stats.formulaCount).toBe(183);
    expect(result.stats.sectionCount).toBe(29);
    for (const [num, slug] of Object.entries(ALGEBRA_SECTION_SLUG_OVERRIDES)) {
      if (Number(num) <= 28) {
        expect(result.sections.some((s) => s.number === num && s.slug === slug)).toBe(true);
      }
    }
    const maps = result.sections.find((s) => s.slug === 'mapas-relaciones');
    expect(maps?.description).toMatch(/grafo interactivo|Relacionadas/i);
    const mapLists = maps?.blocks.filter((b) => b.blockType === 'list') ?? [];
    expect(mapLists.length).toBe(4);
    expect(maps?.blocks.some((b) => b.blockType === 'note')).toBe(false);
    const withVisual = result.sections
      .flatMap((s) => s.blocks)
      .filter((b) => b.blockType === 'formula' && (b.content as FormulaContent).visual);
    expect(withVisual.length).toBeGreaterThanOrEqual(130);
  });
});

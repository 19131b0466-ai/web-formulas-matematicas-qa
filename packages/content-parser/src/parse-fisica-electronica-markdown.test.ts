import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { inferSubjectSlugForFormulaId } from '@repo/shared-types';
import { parseFisicaElectronicaMarkdown } from './parse-physics-markdown.js';
import { ELECTRONICS_SECTION_SLUG_OVERRIDES } from './tags.js';
import type { FormulaContent } from '@repo/shared-types';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOURCE_MD = resolve(ROOT, 'content/formulas-fisica-electronica.md');

describe('parseFisicaElectronicaMarkdown (full document)', () => {
  const markdown = readFileSync(SOURCE_MD, 'utf8');
  const result = parseFisicaElectronicaMarkdown(markdown);
  const formulas = result.sections.flatMap((s) =>
    s.blocks.filter((b) => b.blockType === 'formula' && b.formulaCode),
  );

  it('imports all planned electronics chapter slugs', () => {
    const topSlugs = new Set(result.sections.filter((s) => !s.parentSlug).map((s) => s.slug));
    for (const slug of Object.values(ELECTRONICS_SECTION_SLUG_OVERRIDES)) {
      expect(topSlugs.has(slug)).toBe(true);
    }
  });

  it('produces 188 unique formula IDs with electronics prefixes', () => {
    expect(formulas.length).toBe(188);
    const codes = formulas.map((f) => f.formulaCode!);
    expect(new Set(codes).size).toBe(188);
    expect(codes.every((id) => inferSubjectSlugForFormulaId(id) === 'fisica-electronica')).toBe(
      true,
    );
  });

  it('keeps unique section slugs', () => {
    const slugs = result.sections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('imports the circuit-focus guide as strategies and checklist', () => {
    const guide = result.sections.find((s) => s.slug === 'guia-enfoque');
    expect(guide).toBeDefined();
    const strategies = guide!.blocks.filter((b) => b.blockType === 'strategy');
    expect(strategies.length).toBeGreaterThanOrEqual(9);
    const lists = guide!.blocks.filter((b) => b.blockType === 'list');
    expect(lists.length).toBeGreaterThanOrEqual(1);
    const first = strategies[0]!.content as { signal: string; method: string };
    expect(first.signal.toLowerCase()).toMatch(/dc|resist/);
    expect(first.method.toLowerCase()).toMatch(/thévenin|thevenin|norton/);
  });

  it('resolves related IDs against this catalog or a known subject prefix', () => {
    const codes = new Set(formulas.map((f) => f.formulaCode!));
    for (const block of formulas) {
      const content = block.content as FormulaContent;
      for (const id of content.relatedIds ?? []) {
        expect(codes.has(id) || inferSubjectSlugForFormulaId(id) !== null).toBe(true);
      }
    }
  });

  it('parses common errors and cross-subject links on DIV-001', () => {
    const div001 = formulas.find((b) => b.formulaCode === 'DIV-001');
    const content = div001!.content as FormulaContent;
    expect(content.commonErrors?.length).toBeGreaterThan(0);
    expect(content.relatedIds).toEqual(expect.arrayContaining(['ELE-014', 'ELE-009']));
    expect(content.constraints?.some((c) => /resistiva|divisor/i.test(c))).toBe(true);
    expect(div001!.tags).toContain('formula-electronica');
  });

  it('links combinational logic to algebra Boolean identities without recataloguing them', () => {
    const cmb = formulas.find((b) => b.formulaCode === 'CMB-001');
    const content = cmb!.content as FormulaContent;
    expect(content.relatedIds?.some((id) => id.startsWith('ALG-BOO-'))).toBe(true);
    expect(formulas.every((f) => !String(f.formulaCode).startsWith('ALG-'))).toBe(true);
  });
});

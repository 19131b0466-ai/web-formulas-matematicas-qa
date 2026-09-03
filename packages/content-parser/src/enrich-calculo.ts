import type { FormulaContent, FormulaVisual, NoteContent } from '@repo/shared-types';
import { calculoVizForSectionNumber } from '@repo/shared-types';
import type { ParsedSection } from './types.js';

const MAX_RELATED = 8;

type FormulaRef = {
  code: string;
  sectionSlug: string;
  latex: string;
  fingerprint: string;
  content: FormulaContent;
  explicitRelated: boolean;
};

type SymbolDef = { id: string; symbol: string; meaning: string; pattern: RegExp };

/** Spanish glossary aligned with app-formulas-calculo-2 symbols.json */
const SYMBOLS: SymbolDef[] = [
  { id: 'const-C', symbol: '\\(C\\)', meaning: 'Constante real de integración', pattern: /(^|[^A-Za-z\\])C([^A-Za-z]|$)/ },
  { id: 'var-x', symbol: '\\(x\\)', meaning: 'Variable independiente (variable de integración)', pattern: /(^|[^A-Za-z\\])x([^A-Za-z]|$)/ },
  { id: 'var-u', symbol: '\\(u\\)', meaning: 'Variable auxiliar de sustitución', pattern: /(^|[^A-Za-z\\])u([^A-Za-z]|$)/ },
  { id: 'var-t', symbol: '\\(t\\)', meaning: 'Parámetro o variable auxiliar', pattern: /(^|[^A-Za-z\\])t([^A-Za-z]|$)/ },
  { id: 'const-a', symbol: '\\(a\\)', meaning: 'Constante real (a menudo \\(a>0\\))', pattern: /(^|[^A-Za-z\\])a([^A-Za-z]|$)/ },
  { id: 'const-b', symbol: '\\(b\\)', meaning: 'Constante real', pattern: /(^|[^A-Za-z\\])b([^A-Za-z]|$)/ },
  { id: 'const-k', symbol: '\\(k\\)', meaning: 'Constante real distinta de cero (en muchos contextos)', pattern: /(^|[^A-Za-z\\])k([^A-Za-z]|$)/ },
  { id: 'const-n', symbol: '\\(n\\)', meaning: 'Exponente o índice entero', pattern: /(^|[^A-Za-z\\])n([^A-Za-z]|$)/ },
  { id: 'const-m', symbol: '\\(m\\)', meaning: 'Exponente o índice entero', pattern: /(^|[^A-Za-z\\])m([^A-Za-z]|$)/ },
  { id: 'fn-f', symbol: '\\(f\\)', meaning: 'Función integrando', pattern: /(^|[^A-Za-z\\])f(\(|[^A-Za-z]|$)/ },
  { id: 'fn-F', symbol: '\\(F\\)', meaning: 'Antiderivada de \\(f\\)', pattern: /(^|[^A-Za-z\\])F(\(|[^A-Za-z]|$)/ },
  { id: 'fn-g', symbol: '\\(g\\)', meaning: 'Función auxiliar (a menudo en composición o dominio)', pattern: /(^|[^A-Za-z\\])g(\(|[^A-Za-z]|$)/ },
  { id: 'diff-dx', symbol: '\\(dx\\)', meaning: 'Diferencial respecto de \\(x\\)', pattern: /\\,?dx|\bdx\b/ },
  { id: 'diff-du', symbol: '\\(du\\)', meaning: 'Diferencial respecto de \\(u\\)', pattern: /\\,?du|\bdu\b/ },
  { id: 'const-alpha', symbol: '\\(\\alpha\\)', meaning: 'Constante real (coeficiente)', pattern: /\\alpha\b/ },
  { id: 'const-beta', symbol: '\\(\\beta\\)', meaning: 'Constante real (coeficiente)', pattern: /\\beta\b/ },
  { id: 'var-theta', symbol: '\\(\\theta\\)', meaning: 'Ángulo o parámetro angular', pattern: /\\theta\b/ },
  { id: 'var-r', symbol: '\\(r\\)', meaning: 'Radio o coordenada polar', pattern: /(^|[^A-Za-z\\])r([^A-Za-z]|$)/ },
  { id: 'var-s', symbol: '\\(s\\)', meaning: 'Longitud de arco o variable de Laplace', pattern: /(^|[^A-Za-z\\])s([^A-Za-z]|$)/ },
  { id: 'var-v', symbol: '\\(v\\)', meaning: 'Función o diferencial en integración por partes (\\(dv\\))', pattern: /(^|[^A-Za-z\\])v([^A-Za-z]|$)|\bdv\b|\\,?dv/ },
  { id: 'const-e', symbol: '\\(e\\)', meaning: 'Base del logaritmo natural', pattern: /(^|[^A-Za-z\\])e\^|(^|[^A-Za-z\\])e([^A-Za-z]|$)/ },
  { id: 'const-pi', symbol: '\\(\\pi\\)', meaning: 'Constante pi', pattern: /\\pi\b/ },
  { id: 'const-p', symbol: '\\(p\\)', meaning: 'Exponente en series o integrales tipo p', pattern: /(^|[^A-Za-z\\])p([^A-Za-z]|$)/ },
  { id: 'op-ln', symbol: '\\(\\ln\\)', meaning: 'Logaritmo natural', pattern: /\\ln\b|\bln\b/ },
];

/** Pull trailing domain conditions from display LaTeX (after \\qquad / \\quad). */
export function extractConstraintsFromLatex(latex: string): string[] {
  const constraints: string[] = [];
  const normalized = latex.replace(/\s+/g, ' ').trim();

  const parts = normalized.split(/\\qquad|\\quad/);
  if (parts.length > 1) {
    for (const part of parts.slice(1)) {
      const cleaned = part.replace(/^[,;:\s]+/, '').trim();
      if (!cleaned) continue;
      if (/[≠<>\\]|neq|geq|leq|\\neq|\\ge|\\le|\\approx/.test(cleaned) || /[><=]/.test(cleaned)) {
        constraints.push(`\\(${cleaned}\\)`);
      }
    }
  }

  const neqMatches = normalized.matchAll(
    /,\s*((?:[a-zA-Z]|\\[a-zA-Z]+)\s*(?:\\neq|\\ne|≠|!=|>|<|\\ge|\\le|\\approx)[^,]*)/g,
  );
  for (const m of neqMatches) {
    const c = `\\(${m[1]!.trim()}\\)`;
    if (!constraints.includes(c)) constraints.push(c);
  }

  return constraints;
}

function detectSymbols(latex: string): Array<{ symbol: string; meaning: string }> {
  const out: Array<{ symbol: string; meaning: string }> = [];
  for (const def of SYMBOLS) {
    if (def.pattern.test(latex)) out.push({ symbol: def.symbol, meaning: def.meaning });
  }
  return out;
}

function formatVariables(entries: Array<{ symbol: string; meaning: string }>): string | null {
  if (entries.length === 0) return null;
  return entries.map((e) => `${e.symbol}: ${e.meaning}`).join('; ');
}

function latexFingerprint(latex: string): string {
  return latex.replace(/\s+/g, '').replace(/\\,/g, '');
}

function findByIncludes(
  index: FormulaRef[],
  needle: RegExp,
  sectionHint?: string,
): string | undefined {
  const hit = index.find(
    (f) =>
      needle.test(f.fingerprint) &&
      (!sectionHint || f.sectionSlug.includes(sectionHint) || f.sectionSlug === sectionHint),
  );
  return hit?.code;
}

function link(
  map: Map<string, string[]>,
  fromId: string | undefined,
  toId: string | undefined,
): void {
  if (!fromId || !toId || fromId === toId) return;
  const fwd = map.get(fromId) ?? [];
  if (!fwd.includes(toId)) fwd.push(toId);
  map.set(fromId, fwd);
  const rev = map.get(toId) ?? [];
  if (!rev.includes(fromId)) rev.push(fromId);
  map.set(toId, rev);
}

/** Curated cross-links ported from app-formulas-calculo-2 enrich.ts (IDs → INT codes). */
function buildCuratedRelations(index: FormulaRef[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  const power = findByIncludes(index, /\\intx\^n/, 'integral-indefinida');
  const oneOverX = findByIncludes(
    index,
    /\\int\\frac\{dx\}\{x\}|\\int\\frac\{1\}\{x\}/,
    'integral-indefinida',
  );
  link(map, power, oneOverX);

  const expK = findByIncludes(index, /\\inte\^\{kx\}/, 'integral-indefinida');
  const aKx = findByIncludes(index, /\\inta\^\{kx\}/, 'integral-indefinida');
  link(map, expK, aKx);

  const parts = findByIncludes(index, /\\intu\\,dv|udv|u\\,dv/, 'integracion-por-partes');
  const reduction = index.find(
    (f) =>
      f.sectionSlug.includes('integracion-por-partes') &&
      (/n-1|reduc/i.test(f.latex) || f.sectionSlug.includes('reduccion')),
  )?.code;
  link(map, parts, reduction);

  const indef = findByIncludes(index, /F\(x\)\+C/, 'integral-indefinida');
  const ftc = index.find(
    (f) =>
      f.sectionSlug.includes('integral-definida') &&
      /F\(b\)-F\(a\)|F\(b\)−F\(a\)/.test(f.fingerprint),
  )?.code;
  link(map, indef, ftc);

  const subst = findByIncludes(index, /\\int.*u\(|du=/, 'sustitucion');
  const substDef = index.find(
    (f) => f.sectionSlug.includes('sustitucion') && /f\(g\(x\)\)|g'\(x\)/.test(f.fingerprint),
  )?.code;
  link(map, subst ?? substDef, parts);

  const appendixPower = index.find(
    (f) =>
      (f.sectionSlug.includes('apendice') || f.sectionSlug.startsWith('a-1')) &&
      /\\intu\^n|\\intx\^n/.test(f.fingerprint),
  )?.code;
  link(map, appendixPower, power);

  const appendixLn = index.find(
    (f) =>
      (f.sectionSlug.includes('apendice') || f.sectionSlug.startsWith('a-1')) &&
      /\\int\\frac\{1\}\{u\}|\\int\\frac\{du\}\{u\}/.test(f.fingerprint),
  )?.code;
  link(map, appendixLn, oneOverX);

  const arcsinCore = findByIncludes(index, /\\operatorname\{arcsen\}|\\arcsin/, 'notacion-dominios');
  const arcsinApp = index.find(
    (f) =>
      (f.sectionSlug.includes('apendice') || f.sectionSlug.includes('trigono')) &&
      /arcsen|arcsin/.test(f.fingerprint),
  )?.code;
  link(map, arcsinApp, arcsinCore);

  const sqrtA2U2 = index.find(
    (f) => f.sectionSlug.includes('a-7') || /\\sqrt\{a\^2\+u\^2\}/.test(f.fingerprint),
  )?.code;
  const sqrtA2Minus = index.find(
    (f) => f.sectionSlug.includes('a-8') || /\\sqrt\{a\^2-u\^2\}/.test(f.fingerprint),
  )?.code;
  const sqrtU2A2 = index.find(
    (f) => f.sectionSlug.includes('a-9') || /\\sqrt\{u\^2-a\^2\}/.test(f.fingerprint),
  )?.code;
  link(map, sqrtA2U2, sqrtA2Minus);
  link(map, sqrtA2Minus, sqrtU2A2);

  const trigSub = index.find((f) => f.sectionSlug.includes('sustitucion-trigonometrica'))?.code;
  link(map, sqrtA2Minus, trigSub);

  const partial = index.find((f) => f.sectionSlug.includes('fracciones-parciales'))?.code;
  const rational = index.find(
    (f) => f.sectionSlug.includes('fracciones') && /P\(x\)|Q\(x\)/.test(f.fingerprint),
  )?.code;
  link(map, rational ?? partial, partial);

  const geom = index.find(
    (f) => f.sectionSlug.includes('serie-geometrica') || /\\sum.*r\^n/.test(f.fingerprint),
  )?.code;
  const pSeries = index.find(
    (f) => f.sectionSlug.includes('serie-p') || /\\sum.*1\/n\^p|n\^\{-p\}/.test(f.fingerprint),
  )?.code;
  link(map, geom, pSeries);

  const priorityPrefixes = [
    'integral-indefinida',
    'integral-definida',
    'sustitucion',
    'integracion-por-partes',
    'integrales-trigonometricas',
    'fracciones-parciales',
    'a-1',
    'a-2',
    'a-7',
    'a-8',
    'a-9',
  ];
  for (const prefix of priorityPrefixes) {
    const group = index.filter((f) => f.sectionSlug.includes(prefix));
    for (let i = 0; i < group.length - 1 && i < 8; i += 1) {
      link(map, group[i]!.code, group[i + 1]!.code);
    }
  }

  return map;
}

function nearbyCodes(codes: string[], index: number, max: number): string[] {
  const out: string[] = [];
  let d = 1;
  while (out.length < max && (index - d >= 0 || index + d < codes.length)) {
    if (index - d >= 0) out.push(codes[index - d]!);
    if (out.length >= max) break;
    if (index + d < codes.length) out.push(codes[index + d]!);
    d += 1;
  }
  return out;
}

/**
 * Enrich Cálculo II formula blocks like the native app:
 * constraints (from LaTeX + section domain notes), variables (glossary), relatedIds.
 */
export function enrichCalculoFormulas(sections: ParsedSection[]): void {
  const domainNotesBySection = new Map<string, string[]>();
  for (const section of sections) {
    const notes = section.blocks
      .filter((b) => b.blockType === 'note')
      .map((b) => b.content as NoteContent)
      .filter(
        (c) =>
          c.variant === 'domain' || /condici|dominio|usuales|a>0|\\neq/i.test(c.markdown ?? ''),
      )
      .map((c) => c.markdown.trim())
      .filter(Boolean);
    if (notes.length) domainNotesBySection.set(section.slug, notes);
  }

  const index: FormulaRef[] = [];

  for (const section of sections) {
    const sectionNotes = domainNotesBySection.get(section.slug) ?? [];
    for (const block of section.blocks) {
      if (block.blockType !== 'formula' || !block.formulaCode) continue;
      const content = block.content as FormulaContent;
      const extracted = extractConstraintsFromLatex(content.latex);
      const constraints = [
        ...new Set([...(content.constraints ?? []), ...extracted, ...sectionNotes]),
      ];
      if (constraints.length) content.constraints = constraints;

      if (!content.variables) {
        const variables = formatVariables(detectSymbols(content.latex));
        if (variables) content.variables = variables;
      }

      index.push({
        code: block.formulaCode,
        sectionSlug: section.slug,
        latex: content.latex,
        fingerprint: latexFingerprint(content.latex),
        content,
        explicitRelated: Boolean(content.relatedIds && content.relatedIds.length > 0),
      });
    }
  }

  const curated = buildCuratedRelations(index);

  // Structural neighbors within each leaf section
  const bySection = new Map<string, FormulaRef[]>();
  for (const ref of index) {
    const list = bySection.get(ref.sectionSlug) ?? [];
    list.push(ref);
    bySection.set(ref.sectionSlug, list);
  }

  for (const refs of bySection.values()) {
    const codes = refs.map((r) => r.code);
    for (let i = 0; i < refs.length; i += 1) {
      const ref = refs[i]!;
      if (ref.explicitRelated) continue;
      const related = new Set<string>(curated.get(ref.code) ?? []);
      for (const n of nearbyCodes(codes, i, MAX_RELATED)) related.add(n);
      const list = [...related].filter((c) => c !== ref.code).slice(0, MAX_RELATED);
      if (list.length) ref.content.relatedIds = list;
    }
  }

  // Formulas that only got curated links (lonely in section) still need them applied
  for (const ref of index) {
    if (ref.explicitRelated) continue;
    if (ref.content.relatedIds?.length) continue;
    const curatedOnly = (curated.get(ref.code) ?? []).filter((c) => c !== ref.code).slice(0, MAX_RELATED);
    if (curatedOnly.length) ref.content.relatedIds = curatedOnly;
  }

  attachSectionVisuals(sections);
}

function attachSectionVisuals(sections: ParsedSection[]): void {
  for (const section of sections) {
    const spec = calculoVizForSectionNumber(section.number);
    if (!spec) continue;
    const visual: FormulaVisual = {
      type: spec.type,
      concept: spec.concept,
      elements: '',
      idea: spec.concept,
      learningObjective: '',
    };
    for (const block of section.blocks) {
      if (block.blockType !== 'formula') continue;
      const content = block.content as FormulaContent;
      if (content.visual) continue;
      content.visual = visual;
    }
  }
}

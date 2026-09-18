import type { FormulaContent, FormulaFaqItem } from '@repo/shared-types';
import type { NoteContent } from '@repo/shared-types';
import { calculoDiferencialVizForFormulaId } from '@repo/shared-types';
import { extractConstraintsFromLatex } from './enrich-calculo.js';
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

const SYMBOLS: Array<{ symbol: string; meaning: string; pattern: RegExp }> = [
  { symbol: '\\(x\\)', meaning: 'Variable independiente', pattern: /(^|[^A-Za-z\\])x([^A-Za-z]|$)/ },
  { symbol: '\\(t\\)', meaning: 'Tiempo (interpretación física)', pattern: /(^|[^A-Za-z\\])t([^A-Za-z]|$)/ },
  { symbol: '\\(s\\)', meaning: 'Posición o longitud de arco', pattern: /(^|[^A-Za-z\\])s(\(|[^A-Za-z]|$)/ },
  { symbol: '\\(v\\)', meaning: 'Velocidad o función auxiliar', pattern: /(^|[^A-Za-z\\])v(\(|[^A-Za-z]|$)|\bv\b/ },
  { symbol: '\\(a\\)', meaning: 'Punto o constante real', pattern: /(^|[^A-Za-z\\])a([^A-Za-z]|$)/ },
  { symbol: '\\(b\\)', meaning: 'Extremo de intervalo o constante', pattern: /(^|[^A-Za-z\\])b([^A-Za-z]|$)/ },
  { symbol: '\\(c\\)', meaning: 'Punto intermedio (TVM, Rolle)', pattern: /(^|[^A-Za-z\\])c([^A-Za-z]|$)/ },
  { symbol: '\\(h\\)', meaning: 'Incremento en la definición de derivada', pattern: /(^|[^A-Za-z\\])h([^A-Za-z]|$)/ },
  { symbol: '\\(f\\)', meaning: 'Función', pattern: /(^|[^A-Za-z\\])f(\(|[^A-Za-z]|$)/ },
  { symbol: '\\(g\\)', meaning: 'Segunda función o composición interna', pattern: /(^|[^A-Za-z\\])g(\(|[^A-Za-z]|$)/ },
  { symbol: "\\(f'\\)", meaning: 'Derivada de \\(f\\)', pattern: /f'|f\\prime|\\frac\{d\}/ },
  { symbol: "\\(f''\\)", meaning: 'Segunda derivada de \\(f\\)', pattern: /f''|f\\prime\\prime/ },
  { symbol: '\\(n\\)', meaning: 'Orden de derivada o exponente', pattern: /(^|[^A-Za-z\\])n([^A-Za-z]|$)/ },
  { symbol: '\\(k\\)', meaning: 'Constante real', pattern: /(^|[^A-Za-z\\])k([^A-Za-z]|$)/ },
  { symbol: '\\(\\delta\\)', meaning: 'Radio en definición ε-δ', pattern: /\\delta\b/ },
  { symbol: '\\(\\varepsilon\\)', meaning: 'Tolerancia en definición ε-δ', pattern: /\\varepsilon\b/ },
  { symbol: '\\(L\\)', meaning: 'Valor del límite', pattern: /(^|[^A-Za-z\\])L([^A-Za-z]|$)/ },
  { symbol: '\\(u\\)', meaning: 'Variable auxiliar (cadena, sustitución)', pattern: /(^|[^A-Za-z\\])u([^A-Za-z]|$)/ },
  { symbol: '\\(y\\)', meaning: 'Variable dependiente', pattern: /(^|[^A-Za-z\\])y([^A-Za-z]|$)/ },
  { symbol: '\\(dy\\)', meaning: 'Diferencial de \\(y\\)', pattern: /\\,?dy|\bdy\b/ },
  { symbol: '\\(dx\\)', meaning: 'Diferencial de \\(x\\)', pattern: /\\,?dx|\bdx\b/ },
  { symbol: '\\(du\\)', meaning: 'Diferencial de \\(u\\)', pattern: /\\,?du|\bdu\b/ },
  { symbol: '\\(\\theta\\)', meaning: 'Ángulo o parámetro', pattern: /\\theta\b/ },
  { symbol: '\\(\\pi\\)', meaning: 'Constante pi', pattern: /\\pi\b/ },
  { symbol: '\\(e\\)', meaning: 'Base del logaritmo natural', pattern: /(^|[^A-Za-z\\])e\^|(^|[^A-Za-z\\])e([^A-Za-z]|$)/ },
  { symbol: '\\(\\ln\\)', meaning: 'Logaritmo natural', pattern: /\\ln\b/ },
];

/** Cross-subject links to Cálculo II and Física. */
const CROSS_SUBJECT_LINKS: Record<string, string[]> = {
  'DIF-038': ['INT-024', 'INT-022'],
  'DIF-039': ['INT-024'],
  'DIF-054': ['INT-024'],
  'DIF-073': ['INT-001'],
  'DIF-082': ['INT-022'],
  'DIF-106': ['INT-163'],
  'DIF-102': ['INT-163'],
};

const SEARCH_ALIASES: Record<string, string[]> = {
  'DIF-038': ['derivada', 'pendiente', 'cociente incremental'],
  'DIF-054': ['regla de la cadena', 'chain rule', 'composición'],
  'DIF-051': ['regla del producto', 'product rule'],
  'DIF-053': ['regla del cociente', 'quotient rule'],
  'DIF-082': ['teorema del valor medio', 'TVM', 'mean value theorem'],
  'DIF-114': ['L\'Hôpital', 'L\'Hospital', 'limite indeterminado'],
  'DIF-106': ['serie de Taylor', 'polinomio de Taylor', 'aproximación'],
  'DIF-012': ['limite epsilon delta', 'definición formal de límite'],
  'DIF-019': ['limite seno', 'limite trigonométrico'],
};

const FAQ_BY_CODE: Record<string, FormulaFaqItem[]> = {
  'DIF-038': [
    {
      question: '¿Qué mide la derivada en un punto?',
      answer:
        "La derivada \\(f'(a)\\) es la pendiente de la recta tangente a la gráfica de \\(f\\) en \\(x=a\\), y también el límite del cociente incremental cuando \\(h\\to0\\).",
    },
  ],
  'DIF-045': [
    {
      question: '¿Toda función derivable es continua?',
      answer:
        'Sí: si \\(f\\) es derivable en \\(a\\), entonces \\(f\\) es continua en \\(a\\). El recíproco no siempre vale (p. ej. \\(|x|\\) en \\(0\\)).',
    },
  ],
  'DIF-054': [
    {
      question: '¿Cuándo uso la regla de la cadena?',
      answer:
        "Cuando derivas una composición \\(f(g(x))\\): la derivada es \\(f'(g(x))\\cdot g'(x)\\). También en notación Leibniz: \\(dy/dx=(dy/du)(du/dx)\\).",
    },
  ],
  'DIF-114': [
    {
      question: '¿Cuándo puedo aplicar L\'Hôpital?',
      answer:
        "Cuando el límite tiene forma indeterminada \\(0/0\\) o \\(\\infty/\\infty\\), las funciones son derivables cerca del punto y \\(g'\\neq0\\) en una vecindad (salvo quizá el punto).",
    },
  ],
  'DIF-106': [
    {
      question: '¿Para qué sirve el polinomio de Taylor?',
      answer:
        'Aproxima \\(f(x)\\) cerca de \\(a\\) con un polinomio cuyos coeficientes dependen de las derivadas de \\(f\\) en \\(a\\). Es la base de series de potencias en Cálculo II.',
    },
  ],
};

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

function findByIncludes(index: FormulaRef[], needle: RegExp, sectionHint?: string): string | undefined {
  const hit = index.find(
    (f) =>
      needle.test(f.fingerprint) &&
      (!sectionHint || f.sectionSlug.includes(sectionHint) || f.sectionSlug === sectionHint),
  );
  return hit?.code;
}

function link(map: Map<string, string[]>, fromId: string | undefined, toId: string | undefined): void {
  if (!fromId || !toId || fromId === toId) return;
  const fwd = map.get(fromId) ?? [];
  if (!fwd.includes(toId)) fwd.push(toId);
  map.set(fromId, fwd);
  const rev = map.get(toId) ?? [];
  if (!rev.includes(fromId)) rev.push(fromId);
  map.set(toId, rev);
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

function mergeRelatedIds(existing: string[] | undefined, extra: string[]): string[] {
  const merged = [...new Set([...(existing ?? []), ...extra])];
  return merged.slice(0, MAX_RELATED);
}

function buildCuratedRelations(index: FormulaRef[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  const derivDef = findByIncludes(index, /lim_\{h\\to0\}|f'\(x\)=\\lim/, 'derivada-geometrica');
  const tangent = findByIncludes(index, /y-f\(a\)=f'\(a\)/, 'derivada-geometrica');
  const normal = findByIncludes(index, /-\\frac\{1\}\{f'\(a\)\}/, 'derivada-geometrica');
  link(map, derivDef, tangent);
  link(map, tangent, normal);

  const chain = findByIncludes(index, /f'\(g\(x\)\)/, 'reglas-derivacion');
  const chainLeibniz = findByIncludes(index, /\\frac\{dy\}\{dx\}=\\frac\{dy\}\{du\}/, 'reglas-derivacion');
  const product = findByIncludes(index, /\(fg\)'=f'g\+fg'/, 'reglas-derivacion');
  const quotient = findByIncludes(index, /\\left\(\\frac\{f\}\{g\}\\right\)'/, 'reglas-derivacion');
  link(map, chain, chainLeibniz);
  link(map, chain, product);
  link(map, product, quotient);

  const tvm = findByIncludes(index, /f'\(c\)=\\frac\{f\(b\)-f\(a\)\}/, 'teorema-valor-medio');
  const rolle = findByIncludes(index, /f'\(c\)=0/, 'teorema-valor-medio');
  link(map, rolle, tvm);

  const linear = findByIncludes(index, /L\(x\)=f\(a\)\+f'\(a\)/, 'aproximaciones-diferenciales');
  const differential = findByIncludes(index, /dy=f'\(x\)/, 'aproximaciones-diferenciales');
  link(map, differential, linear);

  const taylorPoly = findByIncludes(index, /P_n\(x\)=\\sum/, 'series-taylor');
  const taylorRest = findByIncludes(index, /R_n\(x\)=\\frac\{f\^\{\(n\+1\)\}/, 'series-taylor');
  link(map, taylorPoly, taylorRest);

  const lhopital = findByIncludes(index, /\\lim_\{x\\to a\}\\frac\{f\(x\)\}\{g\(x\)\}=\\lim/, 'lhopital');
  const limitSin = findByIncludes(index, /\\operatorname\{sen\}x\}\{x\}=1/, 'limites');
  link(map, limitSin, lhopital);

  const priorityPrefixes = [
    'limites',
    'derivada-geometrica',
    'reglas-derivacion',
    'teorema-valor-medio',
    'analisis-funciones',
    'series-taylor',
    'lhopital',
  ];
  for (const prefix of priorityPrefixes) {
    const group = index.filter((f) => f.sectionSlug.includes(prefix));
    for (let i = 0; i < group.length - 1 && i < 6; i += 1) {
      link(map, group[i]!.code, group[i + 1]!.code);
    }
  }

  return map;
}

/** Enrich Cálculo Diferencial formula blocks: constraints, variables, relations, FAQ. */
export function enrichCalculoDiferencialFormulas(sections: ParsedSection[]): void {
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

      const code = block.formulaCode;
      if (!content.faq?.length && FAQ_BY_CODE[code]) {
        content.faq = [...FAQ_BY_CODE[code]!];
      }
      if (!content.searchAliases?.length && SEARCH_ALIASES[code]) {
        content.searchAliases = [...SEARCH_ALIASES[code]!];
      }
      if (CROSS_SUBJECT_LINKS[code]) {
        content.relatedIds = mergeRelatedIds(content.relatedIds, CROSS_SUBJECT_LINKS[code]!);
      }

      index.push({
        code,
        sectionSlug: section.slug,
        latex: content.latex,
        fingerprint: latexFingerprint(content.latex),
        content,
        explicitRelated: Boolean(content.relatedIds && content.relatedIds.length > 0),
      });
    }
  }

  const curated = buildCuratedRelations(index);
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
      const related = new Set<string>(curated.get(ref.code) ?? []);
      for (const n of nearbyCodes(codes, i, MAX_RELATED)) related.add(n);
      const merged = mergeRelatedIds(ref.content.relatedIds, [...related]);
      if (merged.length) ref.content.relatedIds = merged;
    }
  }

  for (const ref of index) {
    if (ref.content.relatedIds?.length) continue;
    const curatedOnly = (curated.get(ref.code) ?? []).filter((c) => c !== ref.code).slice(0, MAX_RELATED);
    if (curatedOnly.length) ref.content.relatedIds = curatedOnly;
  }

  attachFormulaVisuals(sections);
}

function attachFormulaVisuals(sections: ParsedSection[]): void {
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.blockType !== 'formula' || !block.formulaCode) continue;
      const content = block.content as FormulaContent;
      const spec = calculoDiferencialVizForFormulaId(block.formulaCode);
      if (!spec) {
        delete content.visual;
        continue;
      }
      if (content.visual) continue;
      content.visual = {
        type: spec.type,
        concept: spec.concept,
        elements: '',
        idea: spec.concept,
        learningObjective: '',
      };
    }
  }
}

#!/usr/bin/env node
/**
 * QA checks for Cálculo Diferencial (Fase 6).
 * Usage: node scripts/verify-calculo-diferencial.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const parser = require(resolve(ROOT, 'packages/content-parser/dist/parse-markdown.js'));
const enrich = require(resolve(ROOT, 'packages/content-parser/dist/enrich-calculo.js'));
const shared = require(resolve(ROOT, 'packages/shared-types/dist/index.js'));

const SUBTOPIC_TITLES = JSON.parse(
  readFileSync(resolve(ROOT, 'scripts/calculo-diferencial-subtopic-titles.json'), 'utf8'),
);
const CONSTRAINT_IDS = ['DIF-019', 'DIF-048', 'DIF-113', 'DIF-114', 'DIF-115', 'DIF-129', 'DIF-159'];
const CONSTRAINT_LATEX_HINTS = {
  'DIF-019': [/n\\in\\mathbb\{Z\}/, /n<0/],
  'DIF-048': [/x>0/, /n\\notin\\mathbb\{Z\}/],
  'DIF-113': [/f\^\{\(n\+1\)\}.*continua/i],
  'DIF-114': [/0\/0/, /g'\(x\)\\neq\s*0/, /derivables/i],
  'DIF-115': [/0\/0/, /g'\(x\)\\neq\s*0/, /x\\to\\infty/],
  'DIF-129': [/m_\+/, /m_-/],
  'DIF-159': [/n\\in\\mathbb\{Z\}/, /g\(x\)\\neq\s*0|n<0/],
};

const TAYLOR_VIZ_KEYS = ['fnPrefix', 'approxLabel', 'errorTitle', 'degreeLabel', 'centerLabel'];
const CD_TAG_SLUGS = [
  'calculo-diferencial',
  'derivada',
  'continuidad',
  'limite',
  'grafica',
  'formula-derivada',
];

const MD = resolve(ROOT, 'content/formulas-calculo-diferencial.md');
const LOCALES = ['en', 'de', 'fr', 'it', 'pt'];
const MESSAGE_LOCALES = ['es', ...LOCALES];
const TOPIC_HUBS = [
  { slug: 'regla-cadena', ids: ['DIF-054', 'DIF-055', 'DIF-051', 'DIF-053'] },
  { slug: 'algebra-limites', ids: ['DIF-015', 'DIF-016', 'DIF-017', 'DIF-018', 'DIF-019'] },
  { slug: 'limites-indeterminados', ids: ['DIF-114', 'DIF-115', 'DIF-116'] },
  { slug: 'optimizacion', ids: ['DIF-093', 'DIF-094', 'DIF-095', 'DIF-087'] },
  { slug: 'teorema-valor-medio', ids: ['DIF-081', 'DIF-082', 'DIF-083', 'DIF-084'] },
  { slug: 'series-taylor', ids: ['DIF-106', 'DIF-107', 'DIF-102', 'DIF-113'] },
];

const issues = [];
const ok = [];

function fail(msg) {
  issues.push(msg);
}
function pass(msg) {
  ok.push(msg);
}

function loadMessages(locale) {
  const path = resolve(ROOT, `apps/web-public/messages/${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadContentI18n(locale) {
  const path = resolve(ROOT, `apps/web-public/content-i18n/${locale}.json`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

const md = readFileSync(MD, 'utf8');
const parsed = parser.parseCalculoDiferencialMarkdown(md);

const formulas = [];
const ids = [];
for (const section of parsed.sections) {
  for (const block of section.blocks) {
    if (block.blockType !== 'formula' || !block.formulaCode) continue;
    formulas.push({
      id: block.formulaCode,
      sectionNumber: section.number,
      sectionSlug: section.slug,
      detail: block.content.detail ?? null,
      latex: block.content.latex ?? '',
      related: block.content.relatedIds ?? [],
      tags: block.tags ?? [],
    });
    ids.push(block.formulaCode);
  }
}

// --- IDs ---
if (formulas.length !== 161) fail(`expected 161 formulas, got ${formulas.length}`);
else pass('161 formulas parsed');

const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) fail(`duplicate formula IDs: ${[...new Set(dup)].join(', ')}`);
else pass('no duplicate formula IDs');

const badPrefix = ids.filter((id) => !/^DIF-\d{3}$/.test(id));
if (badPrefix.length) fail(`invalid ID format: ${badPrefix.join(', ')}`);
else pass('all IDs match DIF-###');

const nums = ids.map((id) => Number(id.slice(4))).sort((a, b) => a - b);
for (let n = 1; n <= 161; n += 1) {
  if (!nums.includes(n)) fail(`missing DIF-${String(n).padStart(3, '0')}`);
}
if (nums.length === 161 && nums[0] === 1 && nums[160] === 161) pass('IDs DIF-001…DIF-161 contiguous');

// --- LaTeX ---
const emptyLatex = formulas.filter((f) => !f.latex.trim());
if (emptyLatex.length) fail(`${emptyLatex.length} formulas with empty latex`);
else pass('all formulas have LaTeX');

const unbalanced = formulas.filter((f) => {
  const t = f.latex;
  const opens = (t.match(/\\\(/g) ?? []).length;
  const closes = (t.match(/\\\)/g) ?? []).length;
  return opens !== closes;
});
if (unbalanced.length) fail(`${unbalanced.length} formulas with unbalanced \\(\\) delimiters`);
else pass('inline LaTeX delimiters balanced');

// --- Sections ---
const slugs = parsed.sections.map((s) => s.slug);
const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupSlugs.length) fail(`duplicate section slugs: ${[...new Set(dupSlugs)].join(', ')}`);
else pass('unique section slugs');

const guide = parsed.sections.find((s) => s.slug === 'guia-metodos');
const strategies = guide?.blocks.filter((b) => b.blockType === 'strategy') ?? [];
if (strategies.length < 9) fail(`guia-metodos: expected ≥9 strategies, got ${strategies.length}`);
else pass(`guia-metodos has ${strategies.length} strategies`);

// --- Viz registry ---
const EXPECTED_VIZ_COUNT = 27; // Fases 0–5
const VIZ_FORBIDDEN = {
  'DIF-041': { type: 'limit_explorer', mode: 'secante' },
  'DIF-046': { type: 'derivative_from_graph' },
  'DIF-101': { type: 'taylor_approximation' },
};
const VIZ_SEMANTIC = {
  'DIF-011': { type: 'limit_explorer', mode: 'informal', detailIncludes: ['se acerca'] },
  'DIF-012': { type: 'limit_explorer', mode: 'epsilon_delta', detailIncludes: ['formal', 'límite'] },
  'DIF-013': { type: 'limit_explorer', mode: 'lateral' },
  'DIF-020': { type: 'limit_explorer', mode: 'notable' },
  'DIF-024': { type: 'limit_explorer', mode: 'e_definition' },
  'DIF-030': { type: 'continuity_checker', mode: 'definition' },
  'DIF-031': { type: 'intermediate_value', detailIncludes: ['valor intermedio'] },
  'DIF-032': { type: 'continuity_checker', mode: 'discontinuity' },
  'DIF-038': { type: 'limit_explorer', mode: 'secante', detailIncludes: ['cociente incremental'] },
  'DIF-040': { type: 'tangent_line', mode: 'tangent', detailIncludes: ['recta tangente'] },
  'DIF-041': { type: 'tangent_line', mode: 'normal', detailIncludes: ['recta normal'] },
  'DIF-043': { type: 'derivative_from_graph', mode: 'kinematics', detailIncludes: ['velocidad', 'posición'] },
  'DIF-044': { type: 'derivative_from_graph', mode: 'kinematics_accel', detailIncludes: ['aceleración'] },
  'DIF-051': { type: 'product_rule' },
  'DIF-054': { type: 'chain_rule' },
  'DIF-074': { type: 'log_diff', detailIncludes: ['exponente variable'] },
  'DIF-081': { type: 'mean_value_theorem', mode: 'rolle' },
  'DIF-082': { type: 'mean_value_theorem', mode: 'mvt' },
  'DIF-089': { type: 'concavity_analyzer' },
  'DIF-098': { type: 'optimization_scenario', mode: 'rectangle', detailIncludes: ['área', 'perímetro', 'rectángulo'] },
  'DIF-099': { type: 'optimization_scenario', mode: 'cylinder', detailIncludes: ['cilindro', 'superficie'] },
  'DIF-102': { type: 'linear_approximation', detailIncludes: ['aproximación lineal'] },
  'DIF-106': { type: 'taylor_approximation', detailIncludes: ['Taylor', 'polinomio'] },
  'DIF-114': { type: 'lhopital_explorer', detailIncludes: ['0/0'] },
  'DIF-121': { type: 'implicit_curve', mode: 'circle', detailIncludes: ['circunferencia'] },
  'DIF-124': { type: 'related_rates', mode: 'sphere', detailIncludes: ['esfera'] },
  'DIF-128': { type: 'asymptote_explorer' },
};

const vizIds = Object.keys(shared.CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID);
if (vizIds.length !== EXPECTED_VIZ_COUNT) {
  fail(`viz registry: expected ${EXPECTED_VIZ_COUNT} formula anchors, got ${vizIds.length}`);
} else pass(`viz registry has ${EXPECTED_VIZ_COUNT} formula anchors`);

const formulaById = new Map(formulas.map((f) => [f.id, f]));
for (const id of vizIds) {
  if (!ids.includes(id)) fail(`viz registry references missing formula ${id}`);
  else pass(`viz anchor ${id} exists`);
}

for (const [id, forbidden] of Object.entries(VIZ_FORBIDDEN)) {
  const spec = shared.CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID[id];
  if (!spec) continue;
  if (spec.type === forbidden.type && (!forbidden.mode || spec.mode === forbidden.mode)) {
    fail(`forbidden viz anchor on ${id}: ${spec.type}${spec.mode ? ` (${spec.mode})` : ''}`);
  }
}
pass('no forbidden mis-anchored viz IDs');

for (const [id, rule] of Object.entries(VIZ_SEMANTIC)) {
  const spec = shared.CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID[id];
  if (!spec) {
    fail(`VIZ_SEMANTIC missing registry entry for ${id}`);
    continue;
  }
  if (spec.type !== rule.type) fail(`${id}: expected type ${rule.type}, got ${spec.type}`);
  if (rule.mode && spec.mode !== rule.mode) fail(`${id}: expected mode ${rule.mode}, got ${spec.mode ?? 'none'}`);
  if (rule.detailIncludes) {
    const detail = (formulaById.get(id)?.detail ?? '').toLowerCase();
    for (const kw of rule.detailIncludes) {
      if (!detail.includes(kw.toLowerCase())) {
        fail(`${id}: detail should include "${kw}" for viz semantic check`);
      }
    }
  }
}
if (Object.keys(VIZ_SEMANTIC).length !== vizIds.length) {
  fail(
    `VIZ_SEMANTIC should cover all ${vizIds.length} formula anchors, has ${Object.keys(VIZ_SEMANTIC).length}`,
  );
} else pass('VIZ_SEMANTIC covers all formula anchors');

for (const id of vizIds) {
  if (!VIZ_SEMANTIC[id]) fail(`VIZ_SEMANTIC missing entry for ${id}`);
}
pass('viz semantic anchors match formula details');

const sectionViz = shared.CALCULO_DIFERENCIAL_VIZ_BY_SECTION_NUMBER['16'];
if (!sectionViz || sectionViz.type !== 'derivation_decision_tree') {
  fail('§16 section viz: expected derivation_decision_tree');
} else pass('§16 derivation_decision_tree registered');

const truncatedLatex = formulas.filter((f) => f.latex.includes('\\frac{d}{dx}(,'));
if (truncatedLatex.length) {
  fail(`${truncatedLatex.length} appendix formulas with truncated LaTeX (DIF-131+)`);
} else pass('no truncated \\frac{d}{dx}(, LaTeX in appendix');

const badTags = formulas.filter(
  (f) => f.tags.includes('antiderivada') && !f.tags.includes('formula-derivada'),
);
if (badTags.length) {
  fail(`${badTags.length} formulas tagged antiderivada without formula-derivada`);
} else pass('no orphan antiderivada tags on DIF formulas');

// --- Topic hubs ---
const idSet = new Set(ids);
for (const hub of TOPIC_HUBS) {
  for (const id of hub.ids) {
    if (!idSet.has(id)) fail(`topic hub ${hub.slug}: missing formula ${id}`);
  }
}
pass('topic hub formula IDs resolve');

// --- Cross-subject related ---
for (const f of formulas) {
  for (const rel of f.related) {
    const subject = shared.inferSubjectSlugForFormulaId(rel);
    if (!subject && !rel.startsWith('DIF-')) fail(`${f.id} related ${rel}: unknown subject prefix`);
  }
}
pass('cross-subject related IDs use known prefixes');

// --- UI messages (6 locales) ---
const guideKeys = ['titleDifferential', 'descriptionDifferential', 'sectionLabelDifferential', 'introDifferential'];
for (const locale of MESSAGE_LOCALES) {
  const m = loadMessages(locale);
  for (const key of guideKeys) {
    if (!m.guide?.[key]) fail(`messages/${locale}.json missing guide.${key}`);
  }
}
pass('guide UI strings in 6 locales');

for (const locale of MESSAGE_LOCALES) {
  const m = loadMessages(locale);
  if (!m.vizDif?.limit?.secantIdea) fail(`messages/${locale}.json missing vizDif.limit`);
  if (!m.vizDif?.limit?.epsilonDeltaIdea) fail(`messages/${locale}.json missing vizDif.limit epsilonDelta`);
  if (!m.vizDif?.tangent?.idea) fail(`messages/${locale}.json missing vizDif.tangent`);
  if (!m.vizDif?.tangent?.normalIdea) fail(`messages/${locale}.json missing vizDif.tangent normal`);
  if (!m.vizDif?.kinematics?.ideaVelocity) fail(`messages/${locale}.json missing vizDif.kinematics`);
  if (!m.vizDif?.continuity?.definitionIdea) fail(`messages/${locale}.json missing vizDif.continuity`);
  else if (String(m.vizDif.continuity.definitionIdea).includes('lim_{')) {
    fail(`messages/${locale}.json vizDif.continuity.definitionIdea has unescaped ICU braces`);
  }
  if (!m.vizDif?.intermediateValue?.idea) fail(`messages/${locale}.json missing vizDif.intermediateValue`);
  if (!m.vizDif?.productRule?.idea) fail(`messages/${locale}.json missing vizDif.productRule`);
  if (!m.vizDif?.chainRule?.idea) fail(`messages/${locale}.json missing vizDif.chainRule`);
  if (!m.vizDif?.logDiff?.idea) fail(`messages/${locale}.json missing vizDif.logDiff`);
  if (!m.vizDif?.meanValueTheorem?.mvtIdea) fail(`messages/${locale}.json missing vizDif.meanValueTheorem`);
  if (!m.vizDif?.concavity?.idea) fail(`messages/${locale}.json missing vizDif.concavity`);
  if (!m.vizDif?.optimization?.rectangleIdea) fail(`messages/${locale}.json missing vizDif.optimization`);
  if (!m.vizDif?.linearApprox?.idea) fail(`messages/${locale}.json missing vizDif.linearApprox`);
  if (!m.vizDif?.lhopital?.idea) fail(`messages/${locale}.json missing vizDif.lhopital`);
  if (!m.vizDif?.implicit?.idea) fail(`messages/${locale}.json missing vizDif.implicit`);
  if (!m.vizDif?.relatedRates?.idea) fail(`messages/${locale}.json missing vizDif.relatedRates`);
  if (!m.vizDif?.asymptote?.idea) fail(`messages/${locale}.json missing vizDif.asymptote`);
  if (!m.vizDif?.tree?.idea) fail(`messages/${locale}.json missing vizDif.tree`);
}
pass('vizDif UI strings in 6 locales');

for (const locale of MESSAGE_LOCALES) {
  const m = loadMessages(locale);
  for (const key of TAYLOR_VIZ_KEYS) {
    if (!m.vizCalc?.taylor?.[key]) fail(`messages/${locale}.json missing vizCalc.taylor.${key}`);
  }
}
pass('vizCalc.taylor UI strings in 6 locales');

// --- content-i18n parity (EN baseline vs de/fr/it/pt) ---
const enDict = loadContentI18n('en');
const difPhrases = new Set();
for (const s of parsed.sections) {
  difPhrases.add(s.title);
  for (const b of s.blocks) {
    if (b.title) difPhrases.add(b.title);
    if (b.blockType === 'formula' && b.content.detail) difPhrases.add(b.content.detail);
    if (b.blockType === 'strategy') {
      difPhrases.add(b.content.signal);
      difPhrases.add(b.content.method);
    }
    if (b.blockType === 'checklist') difPhrases.add(b.content.text);
    if (b.blockType === 'list' && Array.isArray(b.content.items)) {
      for (const item of b.content.items) difPhrases.add(item);
    }
    if (b.blockType === 'note' && b.content.markdown) difPhrases.add(b.content.markdown);
    if (b.blockType === 'text' && b.content.markdown) difPhrases.add(b.content.markdown);
  }
}
difPhrases.add('Cálculo Diferencial');
difPhrases.add('Límites, continuidad, derivadas y aplicaciones');

let missingEnPhrases = 0;
for (const phrase of difPhrases) {
  if (!enDict[phrase] || enDict[phrase] === phrase) missingEnPhrases += 1;
}
if (missingEnPhrases > 0) {
  fail(`content-i18n/en.json missing translations for ${missingEnPhrases} Cálculo Diferencial phrase(s)`);
} else pass('all Cálculo Diferencial phrases have English translations');

let missingI18n = 0;
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  if (!dict['Cálculo Diferencial']) fail(`content-i18n/${locale}.json missing subject title`);
  for (const phrase of difPhrases) {
    const subtopicExpected = SUBTOPIC_TITLES[locale]?.[phrase];
    const translated = dict[phrase];
    if (subtopicExpected) {
      if (translated !== subtopicExpected) missingI18n += 1;
      continue;
    }
    if (!translated) {
      missingI18n += 1;
      continue;
    }
    if (translated === phrase && locale !== 'en') missingI18n += 1;
  }
}
if (missingI18n > 0) {
  fail(`content-i18n: ${missingI18n} EN-only phrase(s) in de/fr/it/pt (run merge-calculo-diferencial-i18n.py)`);
} else pass('content-i18n parity for Cálculo Diferencial phrases');

// --- Subtopic title parity (must not equal Spanish key in de/fr/it/pt) ---
let badSubtopicTitles = 0;
for (const locale of LOCALES.filter((l) => l !== 'en')) {
  const dict = loadContentI18n(locale);
  const expected = SUBTOPIC_TITLES[locale] ?? {};
  for (const [es, translated] of Object.entries(expected)) {
    const actual = dict[es];
    if (!actual || actual !== translated) badSubtopicTitles += 1;
  }
}
if (badSubtopicTitles > 0) {
  fail(`content-i18n: ${badSubtopicTitles} subtopic title(s) still Spanish in de/fr/it/pt`);
} else pass('subtopic title parity in content-i18n');

let badPtTitles = 0;
const ptExpected = SUBTOPIC_TITLES.pt ?? {};
const ptDict = loadContentI18n('pt');
for (const [es, translated] of Object.entries(ptExpected)) {
  const actual = ptDict[es];
  if (actual && actual === enDict[es] && enDict[es] !== es) badPtTitles += 1;
}
if (badPtTitles > 0) {
  fail(`content-i18n/pt.json: ${badPtTitles} subtopic title(s) still English (run merge-calculo-diferencial-i18n.py)`);
} else pass('Portuguese subtopic titles differ from English');

const guideChecklistKeys = [
  "4. \\(f'\\): intervalos de crecimiento/decrecimiento y puntos críticos.",
  "5. \\(f''\\): concavidad y puntos de inflexión.",
  "\\(f'\\): intervalos de crecimiento/decrecimiento y puntos críticos.",
  "\\(f''\\): concavidad y puntos de inflexión.",
];
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  for (const key of guideChecklistKeys) {
    const tr = dict[key];
    if (!tr || tr === key) fail(`content-i18n/${locale}.json missing guide checklist key`);
  }
}
pass('guide checklist numbered keys in content-i18n');

const instructiveKeys = [
  "\\(\\operatorname{arcsen} x\\), \\(\\arccos x\\), \\(\\arctan x\\) denotan funciones inversas, no recíprocos.",
  "\\(f'(x)\\), \\(f''(x)\\) y \\(f^{(n)}(x)\\) denotan derivadas de orden uno, dos y \\(n\\).",
  'Toda fórmula se aplica solo donde las expresiones estén definidas y los denominadores sean distintos de cero.',
  '**Regla de uso:** aplicar solo donde las expresiones estén definidas; denominadores distintos de cero.',
  '*Generado con 161 fórmulas catalogadas (`DIF-001` … `DIF-161`).*',
];
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  for (const key of instructiveKeys) {
    const tr = dict[key];
    if (!tr || tr === key) fail(`content-i18n/${locale}.json missing instructive block`);
  }
}
pass('instructive blocks of §1, appendix and A.5 in content-i18n');

const searchAliasKeys = [
  'serie de Taylor',
  'polinomio de Taylor',
  'aproximación',
  'cociente incremental',
  'limite indeterminado',
  'definición formal de límite',
  'regla de la potencia para límites',
  'límite de una potencia',
];
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  for (const key of searchAliasKeys) {
    const tr = dict[key];
    if (!tr || tr === key) fail(`content-i18n/${locale}.json missing search alias "${key}"`);
  }
}
pass('search aliases of DIF-106 and related fichas in content-i18n');

let aliases019 = [];
let aliases020 = [];
for (const section of parsed.sections) {
  for (const block of section.blocks) {
    if (block.formulaCode === 'DIF-019') aliases019 = block.content.searchAliases ?? [];
    if (block.formulaCode === 'DIF-020') aliases020 = block.content.searchAliases ?? [];
  }
}
if (
  !aliases019.includes('regla de la potencia para límites') ||
  !aliases019.includes('límite de una potencia') ||
  aliases019.some((a) => /seno|trigonom/i.test(a))
) {
  fail(`DIF-019 search aliases should be power-rule-for-limits, got ${JSON.stringify(aliases019)}`);
} else pass('DIF-019 search aliases are the power rule for limits');
if (!aliases020.includes('limite seno') || !aliases020.includes('limite trigonométrico')) {
  fail(`DIF-020 search aliases should cover sen x/x, got ${JSON.stringify(aliases020)}`);
} else pass('DIF-020 search aliases cover sen x/x');

for (const locale of MESSAGE_LOCALES) {
  const m = loadMessages(locale);
  if (!m.topicHubs?.limitAlgebra?.title) fail(`messages/${locale}.json missing topicHubs.limitAlgebra`);
}
pass('topicHubs.limitAlgebra UI strings in 6 locales');

const cdTagLabels = JSON.parse(
  readFileSync(resolve(ROOT, 'apps/web-public/lib/calculo-diferencial-tag-labels.json'), 'utf8'),
);
for (const locale of MESSAGE_LOCALES) {
  for (const slug of CD_TAG_SLUGS) {
    if (!cdTagLabels[locale]?.[slug]) fail(`calculo-diferencial-tag-labels.json missing ${locale}.${slug}`);
  }
}
const sampleSectionSlugs = [
  'limites-algebra-de-limites',
  'a-5-composiciones-frecuentes',
  'series-taylor-polinomio-de-taylor',
];
for (const locale of LOCALES) {
  for (const slug of sampleSectionSlugs) {
    const label = cdTagLabels[locale]?.[slug];
    const hyphenSplit = slug.replace(/-/g, ' ');
    if (!label || label === hyphenSplit) {
      fail(`calculo-diferencial-tag-labels.json ${locale}.${slug} still hyphen-split`);
    }
  }
}
pass('Cálculo Diferencial tag labels in 6 locales');

// --- Formal constraints in LaTeX (7 QA fichas) ---
for (const id of CONSTRAINT_IDS) {
  const f = formulaById.get(id);
  if (!f) {
    fail(`constraints: missing formula ${id}`);
    continue;
  }
  const extracted = enrich.extractConstraintsFromLatex(f.latex);
  if (!extracted.length) fail(`${id}: no constraints extracted from LaTeX`);
  for (const re of CONSTRAINT_LATEX_HINTS[id] ?? []) {
    if (!re.test(f.latex)) fail(`${id}: LaTeX missing required condition pattern ${re}`);
  }
}
if (CONSTRAINT_IDS.every((id) => formulaById.has(id))) {
  pass('formal constraints present for DIF-019, 048, 113, 114, 115, 129, 159');
}

// --- LaTeX localization anti-corruption (unit tests + residue scan) ---
try {
  execSync('pnpm --filter web-public exec tsx --test lib/calculo-diferencial-latex-text.test.ts', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  pass('calculo-diferencial-latex-text unit tests');
} catch (e) {
  fail(`calculo-diferencial-latex-text tests failed: ${e.stderr?.toString() || e.message}`);
}

// --- formula-derivada taxonomy: limits should not carry derivative tag ---
const tagsMod = require(resolve(ROOT, 'packages/content-parser/dist/tags.js'));
const limitTags = tagsMod.inferTags('limites', 'lim', 'formula');
if (limitTags.includes('formula-derivada')) {
  fail('inferTags(limites): formula-derivada should not apply to limit formulas');
}
const derivTags = tagsMod.inferTags('reglas-derivacion', 'd/dx', 'formula');
if (!derivTags.includes('formula-derivada')) {
  fail('inferTags(reglas-derivacion): formula-derivada expected for derivative rules');
}
pass('formula-derivada taxonomy scoped to derivative sections');

// --- Parser build artifact ---
if (!existsSync(resolve(ROOT, 'packages/content-parser/dist/parse-markdown.js'))) {
  fail('run pnpm --filter @repo/content-parser build before QA');
}

console.log(JSON.stringify({ ok: ok.length, issues }, null, 2));
if (issues.length) {
  console.error(`\n${issues.length} issue(s):`);
  for (const i of issues) console.error(`  ✗ ${i}`);
  process.exit(1);
}
console.log(`\nAll ${ok.length} checks passed.`);

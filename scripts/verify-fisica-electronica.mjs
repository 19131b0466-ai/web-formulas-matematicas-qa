#!/usr/bin/env node
/**
 * QA checks for Física Electrónica.
 * Usage: node scripts/verify-fisica-electronica.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const parser = require(resolve(ROOT, 'packages/content-parser/dist/parse-physics-markdown.js'));
const tagsMod = require(resolve(ROOT, 'packages/content-parser/dist/tags.js'));
const shared = require(resolve(ROOT, 'packages/shared-types/dist/index.js'));

const SUBTOPIC_TITLES = JSON.parse(
  readFileSync(resolve(ROOT, 'scripts/fisica-electronica-subtopic-titles.json'), 'utf8'),
);

const MD = resolve(ROOT, 'content/formulas-fisica-electronica.md');
const LOCALES = ['en', 'de', 'fr', 'it', 'pt'];
const MESSAGE_LOCALES = ['es', ...LOCALES];
const EXPECTED_COUNT = 188;
const ID_RE = /^(DIV|REA|TRN|RLC|FAS|PAC|FIL|XFR|DIO|BJT|FET|OPA|LGC|CMB|SEQ|ADC)-\d{3}$/;
const PREFIXES = ['DIV', 'REA', 'TRN', 'RLC', 'FAS', 'PAC', 'FIL', 'XFR', 'DIO', 'BJT', 'FET', 'OPA', 'LGC', 'CMB', 'SEQ', 'ADC'];
const TOPIC_HUBS = [
  { slug: 'divisores-thevenin', ids: ['DIV-001', 'DIV-003', 'DIV-006', 'DIV-007', 'DIV-010'] },
  { slug: 'transitorios-rc', ids: ['TRN-001', 'TRN-002', 'TRN-003', 'REA-007'] },
  { slug: 'fasores-impedancia', ids: ['FAS-001', 'FAS-003', 'FAS-008', 'FAS-010'] },
  { slug: 'filtros-bode', ids: ['FIL-001', 'FIL-002', 'FIL-003', 'FIL-005'] },
  { slug: 'diodos-rectificacion', ids: ['DIO-003', 'DIO-005', 'DIO-006', 'DIO-007'] },
  { slug: 'opamp-basico', ids: ['OPA-003', 'OPA-004', 'OPA-005', 'OPA-006'] },
  { slug: 'logica-combinacional', ids: ['CMB-001', 'CMB-003', 'CMB-005', 'CMB-009'] },
  { slug: 'flip-flops', ids: ['SEQ-003', 'SEQ-006', 'SEQ-007', 'SEQ-005'] },
];
const HUB_MESSAGE_KEYS = [
  'dividersThevenin',
  'rcTransients',
  'phasorsImpedance',
  'filtersBode',
  'diodesRectification',
  'opampBasic',
  'combinationalLogic',
  'flipFlops',
];
const GUIDE_KEYS = [
  'titleElectronics',
  'descriptionElectronics',
  'sectionLabelElectronics',
  'introElectronics',
];
const ELEC_TAG_SLUGS = ['fisica-electronica', 'electronica', 'formula-electronica', 'divisores', 'opamp', 'digital', 'transistores'];
const ANALOG_VIZ = new Set([
  'voltage_divider',
  'thevenin_norton',
  'rc_transient',
  'rlc_damping',
  'phasor_diagram',
  'impedance_triangle',
  'resonance_curve',
  'bode_filter',
  'diode_iv',
  'bjt_load_line',
  'opamp_circuit',
]);
const DIGITAL_PREFIX = /^(LGC|CMB|SEQ|ADC)-/;

const issues = [];
const ok = [];

function fail(msg) {
  issues.push(msg);
}
function pass(msg) {
  ok.push(msg);
}

function loadMessages(locale) {
  return JSON.parse(readFileSync(resolve(ROOT, `apps/web-public/messages/${locale}.json`), 'utf8'));
}

function loadContentI18n(locale) {
  return JSON.parse(readFileSync(resolve(ROOT, `apps/web-public/content-i18n/${locale}.json`), 'utf8'));
}

function significantTokens(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-záéíóúüñ0-9]+/i)
      .filter((t) => t.length >= 3),
  );
}

const md = readFileSync(MD, 'utf8');
const parsed = parser.parseFisicaElectronicaMarkdown(md);

const formulas = [];
const ids = [];
for (const section of parsed.sections) {
  for (const block of section.blocks) {
    if (block.blockType !== 'formula' || !block.formulaCode) continue;
    formulas.push({
      id: block.formulaCode,
      sectionNumber: section.number,
      sectionSlug: section.slug,
      title: block.title ?? '',
      detail: block.content.detail ?? null,
      latex: block.content.latex ?? '',
      related: block.content.relatedIds ?? [],
      tags: block.tags ?? [],
      commonErrors: block.content.commonErrors ?? [],
      searchAliases: block.content.searchAliases ?? [],
    });
    ids.push(block.formulaCode);
  }
}

if (formulas.length !== EXPECTED_COUNT) fail(`expected ${EXPECTED_COUNT} formulas, got ${formulas.length}`);
else pass(`${EXPECTED_COUNT} formulas parsed`);

const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) fail(`duplicate formula IDs: ${[...new Set(dup)].join(', ')}`);
else pass('no duplicate formula IDs');

const badPrefix = ids.filter((id) => !ID_RE.test(id));
if (badPrefix.length) fail(`invalid ID format: ${badPrefix.join(', ')}`);
else pass('all IDs match electronics prefixes');

const forbiddenLegacy = ids.filter((id) => /^(ELE|TRA|CON|CIR)-/.test(id));
if (forbiddenLegacy.length) fail(`legacy physics prefixes in electronics catalog: ${forbiddenLegacy.join(', ')}`);
else pass('no ELE/TRA/CON/CIR IDs in electronics catalog');

for (const prefix of PREFIXES) {
  const n = ids.filter((id) => id.startsWith(`${prefix}-`)).length;
  if (n < 8) fail(`${prefix}: expected ≥8 formulas, got ${n}`);
}

const emptyLatex = formulas.filter((f) => !f.latex.trim());
if (emptyLatex.length) fail(`${emptyLatex.length} formulas with empty latex`);
else pass('all formulas have LaTeX');

const genericDetail = formulas.filter((f) =>
  (f.detail ?? '').includes('expresa la relación principal entre las magnitudes del modelo'),
);
if (genericDetail.length) fail(`${genericDetail.length} formulas still have generic details`);
else pass('formula details are unique');

const slugs = parsed.sections.map((s) => s.slug);
const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupSlugs.length) fail(`duplicate section slugs: ${[...new Set(dupSlugs)].join(', ')}`);
else pass('unique section slugs');

for (const slug of Object.values(tagsMod.ELECTRONICS_SECTION_SLUG_OVERRIDES)) {
  if (!slugs.includes(slug)) fail(`missing chapter slug ${slug}`);
}
pass('all electronics chapter slugs present');

const guide = parsed.sections.find((s) => s.slug === 'guia-enfoque');
const strategies = guide?.blocks.filter((b) => b.blockType === 'strategy') ?? [];
if (strategies.length < 9) fail(`guia-enfoque: expected ≥9 strategies, got ${strategies.length}`);
else pass(`guia-enfoque has ${strategies.length} strategies`);

const checklist = guide?.blocks.filter((b) => b.blockType === 'list') ?? [];
if (!checklist.length) fail('guia-enfoque missing checklist list');
else pass('guia-enfoque checklist present');

const vizMap = shared.ELECTRONICA_VIZ_BY_FORMULA_ID;
const vizIds = Object.keys(vizMap);
if (vizIds.length < 45 || vizIds.length > 60) {
  fail(`viz registry: expected 45–60 formula anchors, got ${vizIds.length}`);
} else pass(`viz registry has ${vizIds.length} formula anchors`);

const formulaById = new Map(formulas.map((f) => [f.id, f]));
for (const id of vizIds) {
  if (!ids.includes(id)) fail(`viz registry references missing formula ${id}`);
}

const types = new Set(Object.values(vizMap).map((v) => v.type));
if (types.size < 12) fail(`expected ≥12 viz types, got ${types.size}`);
else pass(`${types.size} viz types`);

for (const [id, spec] of Object.entries(vizMap)) {
  if (DIGITAL_PREFIX.test(id) && ANALOG_VIZ.has(spec.type)) {
    fail(`digital ID ${id} has analog viz ${spec.type}`);
  }
  const detail = formulaById.get(id)?.detail ?? '';
  const concept = spec.concept ?? '';
  const a = significantTokens(detail);
  const b = significantTokens(concept);
  const overlap = [...b].some((t) => a.has(t));
  if (concept && detail && !overlap) {
    fail(`${id}: detail does not overlap viz concept «${concept}»`);
  }
}
pass('viz anchors match formula details and stay on-domain');

const sectionViz = shared.ELECTRONICA_VIZ_BY_SECTION_NUMBER['18'];
if (!sectionViz || sectionViz.type !== 'electronics_guide') {
  fail('§18 section viz: expected electronics_guide');
} else pass('§18 electronics_guide registered');

const div001 = formulaById.get('DIV-001');
if (!div001?.related.includes('ELE-014')) fail('DIV-001 should relate to ELE-014');
else pass('DIV-001 links to ELE-014');

const cmb001 = formulaById.get('CMB-001');
if (!cmb001?.related.some((id) => id.startsWith('ALG-BOO-'))) {
  fail('CMB-001 should relate to ALG-BOO-* (boolean identities stay in algebra)');
} else pass('CMB-001 links to ALG-BOO without duplicating algebra');

const withErrors = formulas.filter((f) => f.commonErrors.length);
if (withErrors.length < 40) fail(`expected commonErrors on viz anchors, got ${withErrors.length}`);
else pass(`${withErrors.length} formulas parse commonErrors`);

const genericErrors = withErrors.filter((f) =>
  f.commonErrors.join('; ').includes('mezclar valores pico y RMS'),
);
if (genericErrors.length) fail(`${genericErrors.length} formulas still have generic common errors`);
else pass('common errors are prefix-specific');

for (const f of formulas) {
  if (!f.tags.includes('formula-electronica')) fail(`${f.id} missing formula-electronica tag`);
  for (const rel of f.related) {
    const subject = shared.inferSubjectSlugForFormulaId(rel);
    if (!subject) fail(`${f.id} related ${rel}: unknown subject prefix`);
  }
}
pass('formula-electronica tags and related prefixes');

if (shared.inferSubjectSlugForFormulaId('DIV-001') !== 'fisica-electronica') {
  fail('inferSubjectSlugForFormulaId(DIV-001) should be fisica-electronica');
} else pass('inferSubjectSlug maps electronics prefixes');

for (const hub of TOPIC_HUBS) {
  for (const id of hub.ids) {
    if (!ids.includes(id)) fail(`topic hub ${hub.slug} references missing ${id}`);
  }
}
pass('8 topic hubs reference catalog IDs');

const guideUiKeys = GUIDE_KEYS;
for (const locale of MESSAGE_LOCALES) {
  const m = loadMessages(locale);
  for (const key of guideUiKeys) {
    if (!m.guide?.[key]) fail(`messages/${locale}.json missing guide.${key}`);
  }
  for (const key of HUB_MESSAGE_KEYS) {
    if (!m.topicHubs?.[key]?.title) fail(`messages/${locale}.json missing topicHubs.${key}`);
  }
  const tagline = m.site?.tagline ?? '';
  const folded = tagline.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (!/elektr|electr|elettr|eletron/.test(folded)) {
    fail(`messages/${locale}.json site.tagline should mention electronics`);
  }
}
pass('guide, topicHubs and tagline UI strings in 6 locales');

const enDict = loadContentI18n('en');
const phrases = new Set();
for (const s of parsed.sections) {
  phrases.add(s.title);
  for (const b of s.blocks) {
    if (b.title) phrases.add(b.title);
    if (b.blockType === 'formula' && b.content.detail) phrases.add(b.content.detail);
    if (b.blockType === 'strategy') {
      phrases.add(b.content.signal);
      phrases.add(b.content.method);
    }
    if (b.blockType === 'list' && Array.isArray(b.content.items)) {
      for (const item of b.content.items) phrases.add(item);
    }
    if (b.blockType === 'note' && b.content.markdown) phrases.add(b.content.markdown);
    if (b.blockType === 'text' && b.content.markdown) phrases.add(b.content.markdown);
  }
}
phrases.add('Física Electrónica');
phrases.add('Circuitos, semiconductores, amplificadores y electrónica digital');

let missingEnPhrases = 0;
for (const phrase of phrases) {
  if (!enDict[phrase] || enDict[phrase] === phrase) missingEnPhrases += 1;
}
if (missingEnPhrases > 0) {
  fail(`content-i18n/en.json missing translations for ${missingEnPhrases} Física Electrónica phrase(s)`);
} else pass('all Física Electrónica phrases have English translations');

let missingI18n = 0;
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  if (!dict['Física Electrónica']) fail(`content-i18n/${locale}.json missing subject title`);
  for (const phrase of phrases) {
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
  fail(`content-i18n: ${missingI18n} EN-only phrase(s) in de/fr/it/pt (run merge-fisica-electronica-i18n.py)`);
} else pass('content-i18n parity for Física Electrónica phrases');

let badSubtopicTitles = 0;
for (const locale of LOCALES.filter((l) => l !== 'en')) {
  const dict = loadContentI18n(locale);
  const expected = SUBTOPIC_TITLES[locale] ?? {};
  for (const [es, translated] of Object.entries(expected)) {
    if (dict[es] !== translated) badSubtopicTitles += 1;
  }
}
if (badSubtopicTitles > 0) {
  fail(`content-i18n: ${badSubtopicTitles} subtopic title(s) still Spanish in de/fr/it/pt`);
} else pass('subtopic title parity in content-i18n');

let badPtTitles = 0;
const ptExpected = SUBTOPIC_TITLES.pt ?? {};
const ptDict = loadContentI18n('pt');
for (const [es] of Object.entries(ptExpected)) {
  const actual = ptDict[es];
  if (actual && actual === enDict[es] && enDict[es] !== es) badPtTitles += 1;
}
if (badPtTitles > 0) {
  fail(`content-i18n/pt.json: ${badPtTitles} subtopic title(s) still English`);
} else pass('Portuguese subtopic titles differ from English');

const searchAliasKeys = [
  'divisor de tensión',
  'tensión de Thévenin',
  'amplificador inversor',
  'flip-flop D',
  'tiempo de setup',
  'teorema del muestreo',
];
for (const locale of LOCALES) {
  const dict = loadContentI18n(locale);
  for (const key of searchAliasKeys) {
    const tr = dict[key];
    if (!tr || (tr === key && locale !== 'en' && !/Thévenin|Nyquist|Norton/.test(key))) {
      fail(`content-i18n/${locale}.json missing search alias "${key}"`);
    }
  }
}
pass('search aliases of high-traffic fichas in content-i18n');

const elecTagLabels = JSON.parse(
  readFileSync(resolve(ROOT, 'apps/web-public/lib/fisica-electronica-tag-labels.json'), 'utf8'),
);
for (const locale of MESSAGE_LOCALES) {
  for (const slug of ELEC_TAG_SLUGS) {
    if (!elecTagLabels[locale]?.[slug]) {
      fail(`fisica-electronica-tag-labels.json missing ${locale}.${slug}`);
    }
  }
}
const sampleSectionSlugs = ['redes-resistivas', 'amplificadores-opamp', 'logica-secuencial'];
for (const locale of LOCALES) {
  for (const slug of sampleSectionSlugs) {
    const label = elecTagLabels[locale]?.[slug];
    const hyphenSplit = slug.replace(/-/g, ' ');
    if (!label || label === hyphenSplit) {
      fail(`fisica-electronica-tag-labels.json ${locale}.${slug} still hyphen-split`);
    }
  }
}
pass('Física Electrónica tag labels in 6 locales');

if (/[\u0007\u0008]/.test(md)) fail('control characters U+0007/U+0008 remain in electronics markdown examples');
else pass('no BEL/BS control characters in electronics markdown');

const fet002 = formulaById.get('FET-002');
if (!fet002 || !/sobreexcit/i.test(fet002.title)) {
  fail('FET-002 title should name overdrive (sobreexcitación), not threshold');
} else pass('FET-002 is MOSFET overdrive, not threshold');

const fil003 = formulaById.get('FIL-003');
if (fil003?.searchAliases?.some((a) => /pasa-bajos/i.test(a))) {
  fail('FIL-003 search aliases still include low-pass (pasa-bajos)');
} else pass('FIL-003 aliases are high-pass');

if (!/sin acoplamiento magnético/.test(md)) fail('REA-003/004 missing uncoupled-inductor restriction');
else pass('series/parallel inductors require no magnetic coupling');

if (!/S=R=1/.test(md) || !/Latch SR sensible al nivel/.test(md)) {
  fail('SEQ-001 missing level-sensitive latch condition and S=R=1 forbidden state');
} else pass('SEQ-001 latch enable and forbidden S=R=1');

const mapSection = parsed.sections.find((s) => s.slug === 'mapa-prerrequisitos');
const mapText = (mapSection?.blocks ?? [])
  .filter((b) => b.blockType === 'text')
  .map((b) => b.content?.markdown ?? '')
  .join('\n');
if (/\*\*/.test(mapText)) fail('course map still contains literal ** delimiters');
else pass('course map has no literal ** delimiters');

if (vizMap['FIL-004']?.mode !== 'lp_rl') fail('FIL-004 viz should use lp_rl mode');
else if (vizMap['OPA-009']?.mode !== 'int') fail('OPA-009 viz should use integrator mode');
else if (vizMap['ADC-006']?.mode !== 'r2r') fail('ADC-006 viz should use r2r mode');
else if (vizMap['DIV-002']?.mode !== 'current') fail('DIV-002 viz should use current mode');
else if (vizMap['FAS-009']?.mode !== 'y') fail('FAS-009 viz should use admittance mode');
else pass('mismatch viz modes FIL-004/OPA-009/ADC-006/DIV-002/FAS-009');

for (const locale of MESSAGE_LOCALES) {
  const ve = loadMessages(locale).vizElectronica;
  if (!ve?.bode_filter?.hp_rc?.caption || !ve?.sampling_pwm?.r2r?.idea || !ve?.opamp_circuit?.int?.caption) {
    fail(`messages/${locale}.json missing vizElectronica mode copy (hp_rc/r2r/int)`);
  }
}
pass('vizElectronica localized copy in 6 locales');

try {
  execSync('pnpm --filter @repo/web-public exec tsx --test lib/fisica-electronica-latex-text.test.ts', {
    cwd: ROOT,
    stdio: 'pipe',
  });
  pass('fisica-electronica-latex-text unit tests');
} catch (e) {
  fail(`fisica-electronica-latex-text tests failed: ${e.stderr?.toString() || e.message}`);
}

try {
  execSync(
    'pnpm --filter @repo/web-public exec tsx --test components/electronica/elecMath.test.ts',
    { cwd: ROOT, stdio: 'pipe' },
  );
  pass('elecMath unit tests');
} catch (e) {
  fail(`elecMath tests failed: ${e.stderr?.toString() || e.message}`);
}

const limitTags = tagsMod.inferTags('redes-resistivas', 'divisor', 'formula');
if (!limitTags.includes('formula-electronica')) {
  fail('inferTags(redes-resistivas): formula-electronica expected');
} else pass('formula-electronica taxonomy on electronics sections');

if (!existsSync(resolve(ROOT, 'packages/content-parser/dist/parse-physics-markdown.js'))) {
  fail('run pnpm --filter @repo/content-parser build before QA');
}

console.log(JSON.stringify({ ok: ok.length, issues }, null, 2));
if (issues.length) {
  console.error(`\n${issues.length} issue(s):`);
  for (const i of issues) console.error(`  ✗ ${i}`);
  process.exit(1);
}
console.log(`\nAll ${ok.length} checks passed.`);

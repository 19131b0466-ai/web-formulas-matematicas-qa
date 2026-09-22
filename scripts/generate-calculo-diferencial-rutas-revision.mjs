#!/usr/bin/env node
/**
 * Generate docs/calculo-diferencial-rutas-revision.md (Fase 6).
 * Usage: node scripts/generate-calculo-diferencial-rutas-revision.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'docs/calculo-diferencial-rutas-revision.md');
const require = createRequire(import.meta.url);

const parser = require(resolve(ROOT, 'packages/content-parser/dist/parse-markdown.js'));
const shared = require(resolve(ROOT, 'packages/shared-types/dist/index.js'));

const SUBJECT = 'calculo-diferencial';
const md = readFileSync(resolve(ROOT, 'content/formulas-calculo-diferencial.md'), 'utf8');
const parsed = parser.parseCalculoDiferencialMarkdown(md);

const topSections = parsed.sections.filter((s) => !s.parentSlug);

function sectionPath(slug) {
  if (slug.startsWith('apendice-')) return `/${SUBJECT}/apendice/${slug}`;
  return `/${SUBJECT}/seccion/${slug}`;
}

function formulaPath(id) {
  return `/${SUBJECT}/formula/${id}`;
}

function label(f, sectionNumber) {
  const detail = f.detail?.replace(/\s+/g, ' ').trim();
  if (detail) return `${sectionNumber} ${detail.length > 72 ? `${detail.slice(0, 69)}…` : detail}`;
  return `${sectionNumber} ${f.id}`;
}

const vizFormulas = [];
const lines = [];

lines.push('# Rutas para revisión manual — Cálculo Diferencial');
lines.push('');
lines.push(
  'Base: `https://<tu-dominio>/calculo-diferencial/...` (español sin prefijo `/es`; otros idiomas: `/en`, `/de`, `/pt`, `/fr`, `/it`)',
);
lines.push('');
const vizCount = Object.keys(shared.CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID).length;
lines.push(
  `**Total:** ${countFormulas(parsed)} fórmulas \`DIF-###\` + 5 topic hubs + guía §16 + ${vizCount} visualizaciones interactivas.`,
);
lines.push('');
lines.push('## Checklist QA automatizado');
lines.push('');
lines.push('```bash');
lines.push('pnpm --filter @repo/content-parser build');
lines.push('node scripts/verify-calculo-diferencial.mjs');
lines.push('pnpm typecheck && pnpm test && pnpm build');
lines.push('pnpm seo:sitemap-audit   # tras deploy');
lines.push('```');
lines.push('');
lines.push('## Checklist manual (6 idiomas)');
lines.push('');
lines.push('- [ ] Home `/calculo-diferencial` y `/en/calculo-diferencial`: título y descripción localizados');
lines.push('- [ ] KaTeX renderiza en ES, EN, DE, FR, IT, PT (muestra: DIF-038, DIF-114, DIF-106)');
lines.push('- [ ] Fórmulas relacionadas cross-subject: DIF-038 → INT-024; DIF-043 → CIN-004');
lines.push('- [ ] Topic hubs: `/calculo-diferencial/temas/regla-cadena`');
lines.push('- [ ] Guía: `/calculo-diferencial/guia` (tabla señal→método + árbol interactivo §16)');
lines.push('- [ ] Visualizaciones muestra: DIF-038 (secante), DIF-098 (optimización), DIF-114 (L\'Hôpital), DIF-106 (Taylor)');
lines.push('- [ ] Búsqueda: `DIF-054`, `regla de la cadena`, `L\'Hôpital`');
lines.push('- [ ] Sitemap incluye `/calculo-diferencial/guia` y topic hubs');
lines.push('');
lines.push('## Deploy');
lines.push('');
lines.push('1. Seed en staging (desde `apps/api`): `pnpm db:seed -- ../../content/formulas-calculo-diferencial.md`');
lines.push('2. `pnpm build` en CI verde');
lines.push('3. Deploy API + web-public (Vercel u host configurado)');
lines.push('4. `SEO_AUDIT_ORIGIN=https://<staging> pnpm seo:sitemap-audit`');
lines.push('5. Repetir en producción tras merge a `main`');
lines.push('');

for (const top of topSections) {
  if (top.slug === 'guia-metodos') continue;
  const chapterSections = parsed.sections.filter(
    (s) => s.slug === top.slug || s.parentSlug === top.slug,
  );
  const chapterFormulas = [];
  for (const sec of chapterSections) {
    for (const block of sec.blocks) {
      if (block.blockType !== 'formula' || !block.formulaCode) continue;
      const viz = shared.calculoDiferencialVizForFormulaId(block.formulaCode);
      const row = {
        id: block.formulaCode,
        sectionNumber: sec.number,
        detail: block.content.detail ?? null,
        viz: viz ? `${viz.type}${viz.mode ? ` (${viz.mode})` : ''}` : '',
      };
      chapterFormulas.push(row);
      if (viz) vizFormulas.push(row);
    }
  }
  if (chapterFormulas.length === 0) continue;

  const heading = top.number ? `${top.number}. ${top.title}` : top.title;
  lines.push(`## ${heading}`);
  lines.push('');
  lines.push(`Índice: [${sectionPath(top.slug)}](${sectionPath(top.slug)})`);
  lines.push('');
  lines.push('| ID | Ruta | Título | Viz |');
  lines.push('|---|---|---|---|');
  for (const f of chapterFormulas) {
    lines.push(
      `| ${f.id} | [${formulaPath(f.id)}](${formulaPath(f.id)}) | ${label(f, f.sectionNumber)} | ${f.viz || '—'} |`,
    );
  }
  lines.push('');
}

lines.push('## Visualizaciones interactivas');
lines.push('');
lines.push('| ID | Ruta | Viz |');
lines.push('|---|---|---|');
for (const f of vizFormulas) {
  lines.push(`| ${f.id} | [${formulaPath(f.id)}](${formulaPath(f.id)}) | ${f.viz} |`);
}
lines.push('');

lines.push('## Topic hubs');
lines.push('');
lines.push('| Slug | Ruta |');
lines.push('|---|---|');
for (const slug of [
  'regla-cadena',
  'algebra-limites',
  'limites-indeterminados',
  'optimizacion',
  'teorema-valor-medio',
  'series-taylor',
]) {
  lines.push(`| ${slug} | [/${SUBJECT}/temas/${slug}](/${SUBJECT}/temas/${slug}) |`);
}
lines.push(`| índice | [/${SUBJECT}/temas](/${SUBJECT}/temas) |`);
lines.push('');

lines.push('## Guía de métodos (sección 16)');
lines.push('');
lines.push('| Recurso | Ruta |');
lines.push('|---|---|');
lines.push(`| Guía para derivar y analizar | [/${SUBJECT}/guia](/${SUBJECT}/guia) |`);
lines.push(`| Sección completa | [${sectionPath('guia-metodos')}](${sectionPath('guia-metodos')}) |`);
lines.push('');

lines.push('## Rutas i18n de muestra');
lines.push('');
lines.push('| Locale | Home | Fórmula | Guía |');
lines.push('|---|---|---|---|');
for (const [loc, prefix] of [
  ['es', ''],
  ['en', '/en'],
  ['de', '/de'],
  ['fr', '/fr'],
  ['it', '/it'],
  ['pt', '/pt'],
]) {
  lines.push(
    `| ${loc} | [${prefix}/${SUBJECT}](${prefix}/${SUBJECT}) | [${prefix}${formulaPath('DIF-038')}](${prefix}${formulaPath('DIF-038')}) | [${prefix}/${SUBJECT}/guia](${prefix}/${SUBJECT}/guia) |`,
  );
}
lines.push('');

writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(`Wrote ${OUT} (${lines.length} lines)`);

function countFormulas(result) {
  let n = 0;
  for (const s of result.sections) {
    for (const b of s.blocks) {
      if (b.blockType === 'formula' && b.formulaCode) n += 1;
    }
  }
  return n;
}

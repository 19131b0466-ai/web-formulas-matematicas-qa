#!/usr/bin/env node
/**
 * Merge Cálculo Diferencial section-slug labels into calculo-diferencial-tag-labels.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const parser = require(resolve(ROOT, 'packages/content-parser/dist/parse-markdown.js'));

const LOCALES = ['es', 'en', 'de', 'fr', 'it', 'pt'];
const OUT = resolve(ROOT, 'apps/web-public/lib/calculo-diferencial-tag-labels.json');

const existing = JSON.parse(readFileSync(OUT, 'utf8'));
const parsed = parser.parseCalculoDiferencialMarkdown(
  readFileSync(resolve(ROOT, 'content/formulas-calculo-diferencial.md'), 'utf8'),
);

const dicts = {};
for (const locale of LOCALES.filter((l) => l !== 'es')) {
  dicts[locale] = JSON.parse(
    readFileSync(resolve(ROOT, `apps/web-public/content-i18n/${locale}.json`), 'utf8'),
  );
}

for (const section of parsed.sections) {
  existing.es ??= {};
  existing.es[section.slug] = section.title;
  for (const locale of LOCALES.filter((l) => l !== 'es')) {
    existing[locale] ??= {};
    const translated = dicts[locale][section.title];
    existing[locale][section.slug] = translated && translated !== section.title ? translated : section.title;
  }
}

const sorted = {};
for (const locale of LOCALES) {
  sorted[locale] = Object.fromEntries(Object.entries(existing[locale] ?? {}).sort(([a], [b]) => a.localeCompare(b)));
}

writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`wrote ${parsed.sections.length} section slugs into ${OUT}`);

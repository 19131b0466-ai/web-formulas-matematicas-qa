#!/usr/bin/env node
/**
 * Merge Física Electrónica section-slug labels into fisica-electronica-tag-labels.json.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const parser = require(resolve(ROOT, 'packages/content-parser/dist/parse-physics-markdown.js'));

const LOCALES = ['es', 'en', 'de', 'fr', 'it', 'pt'];
const OUT = resolve(ROOT, 'apps/web-public/lib/fisica-electronica-tag-labels.json');

const existing = JSON.parse(readFileSync(OUT, 'utf8'));
const parsed = parser.parseFisicaElectronicaMarkdown(
  readFileSync(resolve(ROOT, 'content/formulas-fisica-electronica.md'), 'utf8'),
);

const dicts = {};
for (const locale of LOCALES.filter((l) => l !== 'es')) {
  dicts[locale] = JSON.parse(
    readFileSync(resolve(ROOT, `apps/web-public/content-i18n/${locale}.json`), 'utf8'),
  );
}

const EXTRA = {
  es: { transistores: 'Transistores' },
  en: { transistores: 'Transistors' },
  de: { transistores: 'Transistoren' },
  fr: { transistores: 'Transistors' },
  it: { transistores: 'Transistor' },
  pt: { transistores: 'Transistores' },
};

for (const locale of LOCALES) {
  existing[locale] ??= {};
  Object.assign(existing[locale], EXTRA[locale]);
}

for (const section of parsed.sections) {
  existing.es ??= {};
  existing.es[section.slug] = section.title;
  for (const locale of LOCALES.filter((l) => l !== 'es')) {
    existing[locale] ??= {};
    const translated = dicts[locale][section.title];
    existing[locale][section.slug] =
      translated && translated !== section.title ? translated : section.title;
  }
}

const sorted = {};
for (const locale of LOCALES) {
  sorted[locale] = Object.fromEntries(
    Object.entries(existing[locale] ?? {}).sort(([a], [b]) => a.localeCompare(b)),
  );
}

writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`wrote ${parsed.sections.length} section slugs into ${OUT}`);

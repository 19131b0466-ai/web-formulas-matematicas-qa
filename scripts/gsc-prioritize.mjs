#!/usr/bin/env node
/**
 * Cross Google Search Console exports with the formula catalog and rank editorial priorities.
 *
 * Usage:
 *   node scripts/gsc-prioritize.mjs --pages path/to/Pages.csv [--queries path/to/Queries.csv]
 *   node scripts/gsc-prioritize.mjs --pages Pages.csv --compare before.csv after.csv
 *
 * Export from Search Console → Rendimiento → Exportar (CSV).
 * Supports Spanish and English column headers.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content');
const REPORTS_DIR = join(ROOT, 'reports');

const PAGE_URL_KEYS = ['top pages', 'páginas principales', 'pages', 'página', 'page'];
const QUERY_KEYS = ['consultas principales', 'top queries', 'query', 'consulta'];
const CLICK_KEYS = ['clicks', 'clics'];
const IMPRESSION_KEYS = ['impressions', 'impresiones'];
const CTR_KEYS = ['ctr'];
const POSITION_KEYS = ['position', 'posición', 'posicion'];

function parseArgs(argv) {
  const args = { pages: null, queries: null, compare: [], out: join(REPORTS_DIR, 'gsc-priority.json') };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--pages') args.pages = argv[++i];
    else if (arg === '--queries') args.queries = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--compare') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) args.compare.push(argv[++i]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/gsc-prioritize.mjs --pages <Pages.csv> [--queries <Queries.csv>] [--out reports/gsc-priority.json]
  node scripts/gsc-prioritize.mjs --pages after.csv --compare before.csv after.csv`);
      process.exit(0);
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

function normHeader(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function findColumn(headers, candidates) {
  const normalized = headers.map(normHeader);
  for (const key of candidates) {
    const needle = normHeader(key);
    const idx = normalized.findIndex((h) => h === needle || h.includes(needle) || needle.includes(h));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseGscTable(csvPath, urlKeys, labelKey) {
  const raw = readFileSync(resolve(csvPath), 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(raw);
  if (rows.length < 2) throw new Error(`CSV vacío o inválido: ${csvPath}`);

  const headers = rows[0];
  const urlIdx = findColumn(headers, urlKeys);
  const clicksIdx = findColumn(headers, CLICK_KEYS);
  const impressionsIdx = findColumn(headers, IMPRESSION_KEYS);
  const ctrIdx = findColumn(headers, CTR_KEYS);
  const positionIdx = findColumn(headers, POSITION_KEYS);

  if (urlIdx < 0) throw new Error(`No se encontró columna de URL en ${csvPath}`);

  const items = [];
  for (const row of rows.slice(1)) {
    const url = row[urlIdx];
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const clicks = Number.parseFloat((row[clicksIdx] ?? '0').replace(',', '.')) || 0;
    const impressions = Number.parseFloat((row[impressionsIdx] ?? '0').replace(',', '.')) || 0;
    const ctrRaw = (row[ctrIdx] ?? '0').replace('%', '').replace(',', '.');
    const ctr = Number.parseFloat(ctrRaw) || 0;
    const position = Number.parseFloat((row[positionIdx] ?? '0').replace(',', '.')) || 0;
    items.push({ [labelKey]: url, clicks, impressions, ctr, position });
  }
  return items;
}

function parsePath(url) {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    const locales = new Set(['en', 'de', 'fr', 'pt', 'it']);
    const locale = locales.has(parts[0]) ? parts.shift() : 'es';
    const subject = parts[0] ?? null;
    const kind = parts[1] ?? null;
    const slug = parts[2] ?? null;
    let formulaId = null;
    if (kind === 'formula' && slug) formulaId = slug.toUpperCase();
    return { locale, subject, kind, slug, formulaId, path: pathname };
  } catch {
    return { locale: null, subject: null, kind: null, slug: null, formulaId: null, path: url };
  }
}

function loadFormulaCatalog() {
  const catalog = new Map();
  let files = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.startsWith('formulas-') && f.endsWith('.md'));
  } catch {
    return catalog;
  }
  for (const file of files) {
    const text = readFileSync(join(CONTENT_DIR, file), 'utf8');
    const subject = file.replace(/^formulas-/, '').replace(/\.md$/, '');
    for (const match of text.matchAll(/\*\*ID:\*\*\s*`([^`]+)`/g)) {
      const id = match[1].trim().toUpperCase();
      catalog.set(id, { id, subjectHint: subject, source: file });
    }
  }
  return catalog;
}

function priorityScore({ impressions, clicks, position }) {
  const pos = Math.max(position || 1, 1);
  const zeroClickBoost = clicks === 0 && impressions >= 10 ? 2.5 : clicks === 0 ? 1.5 : 1;
  const ctrPenalty = clicks > 0 && impressions > 0 ? 0.7 + (clicks / impressions) : 1;
  return Math.round(impressions * (100 / pos) * zeroClickBoost * ctrPenalty);
}

function rankPages(pages, catalog) {
  return pages
    .map((page) => {
      const url =
        page.url ?? Object.values(page).find((v) => typeof v === 'string' && v.startsWith('http'));
      const parsed = parsePath(url);
      const meta = {
        url,
        ...page,
        ...parsed,
        inCatalog: parsed.formulaId ? catalog.has(parsed.formulaId) : false,
        catalog: parsed.formulaId ? catalog.get(parsed.formulaId) ?? null : null,
      };
      return { ...meta, score: priorityScore(page) };
    })
    .sort((a, b) => b.score - a.score);
}

function toMarkdownReport(ranked, queries, generatedAt) {
  const lines = [
    '# Prioridad editorial GSC',
    '',
    `Generado: ${generatedAt}`,
    '',
    '## Top 25 páginas (impresiones sin clics priorizadas)',
    '',
    '| Prioridad | URL | Impresiones | Clics | CTR | Pos. | Tipo | ID |',
    '|---:|---|---:|---:|---:|---:|---|---|',
  ];
  for (const row of ranked.slice(0, 25)) {
    lines.push(
      `| ${row.score} | ${row.url} | ${row.impressions} | ${row.clicks} | ${row.ctr}% | ${row.position} | ${row.kind ?? '—'} | ${row.formulaId ?? '—'} |`,
    );
  }

  const formulaGaps = ranked.filter((r) => r.formulaId && r.impressions >= 20 && r.clicks === 0).slice(0, 15);
  if (formulaGaps.length) {
    lines.push('', '## Fórmulas sin clics (candidatas a enriquecer)', '', '| ID | Impresiones | Pos. | URL |', '|---|---:|---:|---|');
    for (const row of formulaGaps) {
      lines.push(`| ${row.formulaId} | ${row.impressions} | ${row.position} | ${row.url} |`);
    }
  }

  if (queries?.length) {
    lines.push('', '## Top consultas sin clics', '', '| Consulta | Impresiones | Clics | Pos. |', '|---|---:|---:|---:|');
    for (const q of queries.filter((x) => x.impressions >= 10 && x.clicks === 0).slice(0, 20)) {
      lines.push(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${q.position} |`);
    }
  }

  lines.push(
    '',
    '## Próximos pasos',
    '',
    '1. Enriquecer las fórmulas con score alto y 0 clics.',
    '2. Probar variante B de título (`SEO_TITLE_EXPERIMENT_VARIANT=b`) en top 10.',
    '3. Re-exportar GSC a las 4 semanas y comparar con `--compare`.',
  );
  return lines.join('\n');
}

function compareExports(beforePath, afterPath) {
  const before = parseGscTable(beforePath, PAGE_URL_KEYS, 'url').map((p) => ({ ...p, url: p.url }));
  const after = parseGscTable(afterPath, PAGE_URL_KEYS, 'url').map((p) => ({ ...p, url: p.url }));
  const beforeMap = new Map(before.map((p) => [p.url, p]));
  const deltas = [];
  for (const row of after) {
    const prev = beforeMap.get(row.url);
    if (!prev) continue;
    deltas.push({
      url: row.url,
      impressionsDelta: row.impressions - prev.impressions,
      clicksDelta: row.clicks - prev.clicks,
      positionDelta: row.position - prev.position,
      ctrBefore: prev.ctr,
      ctrAfter: row.ctr,
    });
  }
  deltas.sort((a, b) => b.clicksDelta - a.clicksDelta || a.positionDelta - b.positionDelta);
  return deltas;
}

function main() {
  const args = parseArgs(process.argv);

  if (args.compare.length === 2) {
    const deltas = compareExports(args.compare[0], args.compare[1]);
    mkdirSync(REPORTS_DIR, { recursive: true });
    const out = join(REPORTS_DIR, 'gsc-compare.json');
    writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), deltas }, null, 2));
    console.log(`Comparación guardada en ${out}`);
    console.log('Top mejoras en clics:');
    for (const row of deltas.filter((d) => d.clicksDelta > 0).slice(0, 10)) {
      console.log(`  +${row.clicksDelta} clics  Δpos ${row.positionDelta.toFixed(1)}  ${row.url}`);
    }
    return;
  }

  if (!args.pages) {
    console.error('Falta --pages <Pages.csv>. Usa --help.');
    process.exit(1);
  }

  const pages = parseGscTable(args.pages, PAGE_URL_KEYS, 'url').map((p) => ({ ...p, url: p.url }));
  const queries = args.queries
    ? parseGscTable(args.queries, QUERY_KEYS, 'query').map((q) => ({
        query: q.query,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.ctr,
        position: q.position,
      }))
    : null;

  const catalog = loadFormulaCatalog();
  const ranked = rankPages(pages, catalog);
  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    source: { pages: resolve(args.pages), queries: args.queries ? resolve(args.queries) : null },
    totals: {
      pages: pages.length,
      impressions: pages.reduce((s, p) => s + p.impressions, 0),
      clicks: pages.reduce((s, p) => s + p.clicks, 0),
      formulasInCatalog: ranked.filter((r) => r.formulaId && r.inCatalog).length,
    },
    ranked: ranked.slice(0, 100),
    queries: queries?.slice(0, 100) ?? null,
  };

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(args.out, JSON.stringify(report, null, 2));
  const mdPath = args.out.replace(/\.json$/i, '.md');
  writeFileSync(mdPath, toMarkdownReport(ranked, queries, generatedAt));

  console.log(`JSON: ${args.out}`);
  console.log(`Markdown: ${mdPath}`);
  console.log(`Páginas: ${report.totals.pages} | Impresiones: ${report.totals.impressions} | Clics: ${report.totals.clicks}`);
  console.log('\nTop 10 prioridades:');
  for (const row of ranked.slice(0, 10)) {
    console.log(
      `  [${row.score}] ${row.formulaId ?? row.kind ?? '?'} — ${row.impressions} impr, ${row.clicks} clics, pos ${row.position}`,
    );
  }
}

main();

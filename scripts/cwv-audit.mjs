#!/usr/bin/env node
/**
 * Lightweight Core Web Vitals pre-check for formula pages (no Lighthouse dependency).
 *
 * Usage:
 *   node scripts/cwv-audit.mjs
 *   SEO_AUDIT_ORIGIN=https://www.maththeoryandtools.com node scripts/cwv-audit.mjs
 */
const ORIGIN = process.env.SEO_AUDIT_ORIGIN ?? 'https://www.maththeoryandtools.com';

const SAMPLE_URLS = [
  '/fisica-basica/formula/EQU-005',
  '/fisica-basica/formula/FLU-002',
  '/en/fisica-basica/formula/NEW-003',
  '/algebra/formula/ALG-NOR-001',
  '/calculo-ii/seccion/integrales-trigonometricas',
];

async function auditUrl(path) {
  const url = `${ORIGIN}${path}`;
  const start = performance.now();
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 CWV-audit' } });
  const html = await res.text();
  const ttfb = Math.round(performance.now() - start);
  const bytes = Buffer.byteLength(html, 'utf8');
  const deferredViz = /data-deferred-viz="pending"|data-deferred-viz="loading"/.test(html);
  const scriptTags = (html.match(/<script\b/gi) ?? []).length;
  return { url, status: res.status, ttfbMs: ttfb, htmlKb: Math.round(bytes / 1024), deferredViz, scriptTags };
}

async function main() {
  const rows = [];
  for (const path of SAMPLE_URLS) {
    try {
      rows.push(await auditUrl(path));
    } catch (err) {
      rows.push({ url: `${ORIGIN}${path}`, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const issues = [];
  for (const row of rows) {
    if (row.error) issues.push(`${row.url}: ${row.error}`);
    else if (row.status !== 200) issues.push(`${row.url}: HTTP ${row.status}`);
    else if (row.ttfbMs > 800) issues.push(`${row.url}: TTFB alto (${row.ttfbMs} ms)`);
    else if (!row.deferredViz) issues.push(`${row.url}: sin placeholder de viz diferida (¿build antiguo?)`);
  }

  console.log(JSON.stringify({ origin: ORIGIN, checkedAt: new Date().toISOString(), rows, issues }, null, 2));
  if (issues.length) {
    console.error('\nRevisa despliegue o ejecuta Lighthouse en las URLs anteriores.');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Production sitemap SEO audit (HTTP).
 * Usage: node scripts/seo-sitemap-audit.mjs
 */
const ORIGIN = process.env.SEO_AUDIT_ORIGIN ?? 'https://www.maththeoryandtools.com';

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 SEO-audit' } });
  const text = await res.text();
  return { res, text };
}

function locUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function meta(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i');
  return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function canonical(html) {
  const re = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i;
  const re2 = /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i;
  const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? og?.[1] ?? null;
}

async function main() {
  const issues = [];
  const { res: smRes, text: xml } = await fetchText(`${ORIGIN}/sitemap.xml`);
  if (smRes.status !== 200) {
    console.error(`sitemap.xml status ${smRes.status}`);
    process.exit(1);
  }
  const urls = locUrls(xml);
  const unique = new Set(urls);
  const search = urls.filter((u) => /\/buscar(?:\/|$|\?)/.test(u));
  if (search.length) issues.push(`search URLs in sitemap: ${search.length}`);
  if (unique.size !== urls.length) issues.push(`duplicate loc: ${urls.length - unique.size}`);

  const sample = [
    `${ORIGIN}/`,
    `${ORIGIN}/en`,
    `${ORIGIN}/en/algebra`,
    `${ORIGIN}/en/algebra/formula/ALG-FUN-001`,
    `${ORIGIN}/en/algebra/buscar`,
    `${ORIGIN}/algebra/buscar`,
  ];

  const checks = [];
  for (const url of sample) {
    const { res, text } = await fetchText(url);
    const robots = meta(text, 'robots');
    const canon = canonical(text);
    const isSearch = /\/buscar(?:\/|$|\?)/.test(url);
    const row = { url, status: res.status, robots, canonical: canon };
    if (res.status !== 200 && res.status !== 308 && res.status !== 301) {
      issues.push(`${url} status ${res.status}`);
    }
    if (isSearch) {
      if (!robots || !/noindex/i.test(robots)) issues.push(`${url} missing noindex (robots=${robots})`);
    } else if (robots && /noindex/i.test(robots)) {
      issues.push(`${url} unexpectedly noindex`);
    }
    if (canon && isSearch && /[?&]q=/.test(canon)) issues.push(`${url} canonical has query`);
    checks.push(row);
  }

  console.log(JSON.stringify({ origin: ORIGIN, sitemapUrls: urls.length, unique: unique.size, searchInSitemap: search.length, sample: checks, issues }, null, 2));
  process.exit(issues.length ? 2 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

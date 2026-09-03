import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CANONICAL_ORIGIN,
  breadcrumbJsonLd,
  buildPageMetadata,
  canonicalUrl,
  detectUnexpectedSpanish,
  isSearchPath,
  languageAlternates,
  safeJsonLd,
  websiteJsonLd,
} from './seo';

describe('SEO helpers', () => {
  it('builds self-referential Spanish home canonical with trailing slash', () => {
    assert.equal(canonicalUrl('es', '/'), `${CANONICAL_ORIGIN}/`);
  });

  it('prefixes non-default locales', () => {
    assert.equal(canonicalUrl('en', '/'), `${CANONICAL_ORIGIN}/en`);
    assert.equal(
      canonicalUrl('en', '/algebra/formula/ALG-FUN-001'),
      `${CANONICAL_ORIGIN}/en/algebra/formula/ALG-FUN-001`,
    );
  });

  it('strips trailing slashes on inner paths', () => {
    assert.equal(canonicalUrl('es', '/algebra/'), `${CANONICAL_ORIGIN}/algebra`);
  });

  it('marks search paths', () => {
    assert.equal(isSearchPath('/algebra/buscar'), true);
    assert.equal(isSearchPath('/en/algebra/buscar'), true);
    assert.equal(isSearchPath('/algebra/formula/ALG-FUN-001'), false);
  });

  it('builds reciprocal hreflang including x-default on the Spanish URL', () => {
    const alts = languageAlternates('/algebra/formula/ALG-FUN-001');
    assert.equal(alts.es, `${CANONICAL_ORIGIN}/algebra/formula/ALG-FUN-001`);
    assert.equal(alts.en, `${CANONICAL_ORIGIN}/en/algebra/formula/ALG-FUN-001`);
    assert.equal(alts['x-default'], alts.es);
    for (const locale of ['es', 'en', 'de', 'pt', 'fr', 'it'] as const) {
      assert.ok(alts[locale]);
    }
  });

  it('sets noindex,follow on search metadata and keeps a parameter-free canonical', () => {
    const meta = buildPageMetadata({
      locale: 'en',
      path: '/algebra/buscar?q=domain',
      title: 'Search',
      description: 'Find formulas.',
      siteName: 'Math',
      index: false,
      follow: true,
    });
    assert.deepEqual(meta.robots, { index: false, follow: true });
    assert.equal(meta.alternates?.canonical, `${CANONICAL_ORIGIN}/en/algebra/buscar`);
  });

  it('escapes JSON-LD', () => {
    const json = safeJsonLd({ name: '</script><script>alert(1)' });
    assert.equal(json.includes('<'), false);
    assert.doesNotThrow(() => JSON.parse(json.replace(/\\u003c/g, '<')));
  });

  it('builds valid website and breadcrumb JSON-LD', () => {
    const site = websiteJsonLd({
      name: 'Fórmulas matemáticas',
      description: 'Catálogo',
      inLanguage: ['es', 'en'],
    });
    assert.equal(site['@type'], 'WebSite');
    const crumbs = breadcrumbJsonLd('en', [
      { name: 'Home', path: '/' },
      { name: 'Algebra', path: '/algebra' },
    ]);
    assert.equal(crumbs.itemListElement.length, 2);
    assert.equal(crumbs.itemListElement[1].item, `${CANONICAL_ORIGIN}/en/algebra`);
  });

  it('detects unexpected Spanish phrases without flagging math tokens', () => {
    const leaks = detectUnexpectedSpanish(
      'The domain is the set of x. El dominio es el conjunto de valores. Dom(f)=R. ALG-FUN-001',
    );
    assert.ok(leaks.includes('el dominio es el conjunto'));
    assert.equal(detectUnexpectedSpanish('Domain of f(x) on ℝ for ALG-FUN-001').length, 0);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CANONICAL_ORIGIN,
  breadcrumbJsonLd,
  buildPageMetadata,
  canonicalUrl,
  definedTermJsonLd,
  detectUnexpectedSpanish,
  faqPageJsonLd,
  formulaOgImageUrl,
  formulaSeoDescription,
  formulaSeoTitle,
  resolveFormulaSeoTitle,
  itemListJsonLd,
  isSearchPath,
  mergeSearchKeywords,
  languageAlternates,
  latexToPlainSnippet,
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

  it('applies title experiment variant B when configured', () => {
    const resolved = resolveFormulaSeoTitle({
      concept: 'Módulo de Young',
      subjectTitle: 'Física Básica',
      locale: 'es',
      formulaId: 'EQU-005',
      subject: 'fisica-basica',
      variant: 'b',
    });
    assert.equal(resolved.variant, 'b');
    assert.match(resolved.title, /Módulo de Young: fórmula, unidades \(Pa\)/);
    assert.match(resolved.title, /Física Básica/);
  });

  it('builds search-oriented formula titles by locale', () => {
    assert.equal(
      formulaSeoTitle('Módulo de Young', 'Física Básica', 'es'),
      'Fórmula: Módulo de Young — Física Básica',
    );
    assert.equal(
      formulaSeoTitle("Young's Modulus", 'Basic Physics', 'en'),
      "Young's Modulus Formula — Basic Physics",
    );
  });

  it('enriches formula descriptions with latex, units and visualization', () => {
    const description = formulaSeoDescription({
      title: 'Presión',
      subjectTitle: 'Física Básica',
      detail: 'Cociente entre la fuerza perpendicular y el área.',
      latex: 'P=\\frac{F_\\perp}{A}',
      conventions: ['Pa = N/m²'],
      hasVisualization: true,
      visualizationNote: 'Incluye un recurso interactivo.',
      unitsLabel: 'Unidades',
      fallback: 'fallback',
    });
    assert.match(description, /F_⊥\/A|F_\perp\/A|P=/);
    assert.match(description, /Unidades: Pa/);
    assert.match(description, /interactivo/);
  });

  it('strips latex to a plain snippet', () => {
    const snippet = latexToPlainSnippet('Y=\\frac{\\sigma}{\\varepsilon}');
    assert.match(snippet, /Y/);
    assert.match(snippet, /σ\/ε|sigma\/varepsilon/i);
  });

  it('builds formula OG image URLs with locale', () => {
    assert.equal(
      formulaOgImageUrl('es', 'fisica-basica', 'EQU-005'),
      `${CANONICAL_ORIGIN}/og/es/fisica-basica/formula/EQU-005`,
    );
  });

  it('uses custom OG images in page metadata', () => {
    const meta = buildPageMetadata({
      locale: 'es',
      path: '/fisica-basica/formula/EQU-005',
      title: 'Test',
      description: 'Desc',
      siteName: 'Math',
      ogImage: {
        url: `${CANONICAL_ORIGIN}/og/es/fisica-basica/formula/EQU-005`,
        alt: 'Young',
      },
    });
    assert.ok(
      JSON.stringify(meta.openGraph?.images).includes(
        `${CANONICAL_ORIGIN}/og/es/fisica-basica/formula/EQU-005`,
      ),
    );
  });

  it('builds defined term and FAQ structured data', () => {
    const term = definedTermJsonLd({
      name: 'Módulo de Young',
      description: 'Elasticidad',
      locale: 'es',
      path: '/fisica-basica/formula/EQU-005',
      termCode: 'EQU-005',
      termSetName: 'Física Básica',
      latex: 'Y=\\sigma/\\varepsilon',
    });
    assert.equal(term['@type'], 'DefinedTerm');
    assert.equal(term.termCode, 'EQU-005');

    const faq = faqPageJsonLd({
      items: [{ question: '¿Unidad?', answer: 'Pa' }],
      locale: 'es',
      path: '/fisica-basica/formula/EQU-005',
    });
    assert.equal(faq?.mainEntity.length, 1);
  });

  it('merges search keywords without duplicates', () => {
    const merged = mergeSearchKeywords(
      ['Young modulus', 'E'],
      ['young modulus', 'Young modulus formula'],
    );
    assert.deepEqual(merged, ['Young modulus', 'E', 'Young modulus formula']);
  });

  it('builds ItemList JSON-LD for topic hubs', () => {
    const list = itemListJsonLd({
      name: 'Young modulus',
      locale: 'es',
      items: [
        { name: 'EQU-005', path: '/fisica-basica/formula/EQU-005' },
        { name: 'EQU-004', path: '/fisica-basica/formula/EQU-004' },
      ],
    });
    assert.equal(list['@type'], 'ItemList');
    assert.equal(list.itemListElement[0].position, 1);
    assert.match(list.itemListElement[0].url, /EQU-005/);
  });

  it('adds SearchAction to website JSON-LD', () => {
    const site = websiteJsonLd({
      name: 'Math',
      description: 'Catalog',
      inLanguage: ['es'],
    });
    assert.equal(site.potentialAction['@type'], 'SearchAction');
    assert.match(site.potentialAction.target.urlTemplate, /algebra\/buscar\?q=\{search_term_string\}/);
  });
});

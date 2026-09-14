import type { Metadata } from 'next';
import type { FormulaFaqItem } from '@repo/shared-types';
import { routing, localeOgTags, type AppLocale } from '@/i18n/routing';
import {
  activeTitleVariant,
  findTitleExperiment,
  type ResolvedFormulaTitle,
  type TitleVariantId,
} from '@/lib/seo-title-experiments';
import type { SubjectSlug } from '@/lib/subjects';

export const CANONICAL_ORIGIN = 'https://www.maththeoryandtools.com';
export const OG_IMAGE_PATH = '/og-default.png';
export const OG_IMAGE_ALT = 'Math Theory and Tools';

export function siteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
    return fromEnv;
  }
  return CANONICAL_ORIGIN;
}

/** Path without locale prefix, always starting with `/`. Home is `/`. */
export function normalizeAppPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

export function isSearchPath(path: string): boolean {
  return /\/buscar(?:\/|$)/.test(normalizeAppPath(path));
}

export function canonicalUrl(locale: AppLocale, path: string): string {
  const origin = siteOrigin();
  const p = normalizeAppPath(path);
  if (locale === routing.defaultLocale) {
    return p === '/' ? `${origin}/` : `${origin}${p}`;
  }
  return p === '/' ? `${origin}/${locale}` : `${origin}/${locale}${p}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const p = normalizeAppPath(path);
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = canonicalUrl(locale, p);
  }
  languages['x-default'] = canonicalUrl(routing.defaultLocale, p);
  return languages;
}

export function ogImageAbsolute(): string {
  return `${siteOrigin()}${OG_IMAGE_PATH}`;
}

export function stripSearchParams(urlOrPath: string): string {
  const q = urlOrPath.indexOf('?');
  return q === -1 ? urlOrPath : urlOrPath.slice(0, q);
}

function plainText(value: string, max = 220): string {
  const cleaned = value
    .replace(/\$[^$]+\$/g, ' ')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}…`;
}

export function composeDescription(parts: Array<string | null | undefined>, fallback: string): string {
  const text = parts
    .map((p) => (p ? plainText(p, 280) : ''))
    .filter(Boolean)
    .join(' ');
  return text.length >= 40 ? plainText(text, 280) : fallback;
}

export type PageSeoInput = {
  locale: AppLocale;
  path: string;
  title: string;
  description: string;
  index?: boolean;
  follow?: boolean;
  ogType?: 'website' | 'article';
  siteName: string;
  ogImage?: { url: string; alt?: string };
  keywords?: string[];
};

function resolveOgImage(input: PageSeoInput) {
  const url = input.ogImage?.url ?? ogImageAbsolute();
  const alt = input.ogImage?.alt ?? OG_IMAGE_ALT;
  return { url, width: 1200, height: 630, alt };
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const path = normalizeAppPath(stripSearchParams(input.path));
  const canonical = canonicalUrl(input.locale, path);
  const index = input.index ?? !isSearchPath(path);
  const follow = input.follow ?? true;
  const image = resolveOgImage(input);

  const keywords = input.keywords?.map((k) => k.trim()).filter(Boolean);

  return {
    title: input.title,
    description: input.description,
    ...(keywords?.length ? { keywords } : {}),
    robots: { index, follow },
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: input.ogType ?? 'website',
      locale: localeOgTags[input.locale],
      alternateLocale: routing.locales
        .filter((l) => l !== input.locale)
        .map((l) => localeOgTags[l]),
      siteName: input.siteName,
      title: input.title,
      description: input.description,
      url: canonical,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image.url],
    },
  };
}

export type BreadcrumbEntry = { name: string; path: string };

export function breadcrumbJsonLd(locale: AppLocale, items: BreadcrumbEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(locale, item.path),
    })),
  };
}

export function websiteJsonLd(input: {
  name: string;
  description: string;
  inLanguage: AppLocale[];
  searchPath?: string;
}) {
  const searchTemplate = canonicalUrl('es', input.searchPath ?? '/algebra/buscar');
  const searchUrl = `${searchTemplate}?q={search_term_string}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: canonicalUrl('es', '/'),
    description: input.description,
    inLanguage: input.inLanguage,
    publisher: {
      '@type': 'Organization',
      name: input.name,
      url: canonicalUrl('es', '/'),
      logo: `${siteOrigin()}/icon-512.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function titledWithSubject(name: string, subjectTitle: string): string {
  const concept = name.replace(/\s+/g, ' ').trim();
  const subject = subjectTitle.replace(/\s+/g, ' ').trim();
  if (!subject || concept === subject) return concept;
  if (concept.includes(subject)) return concept;
  return `${concept} — ${subject}`;
}

const FORMULA_TITLE_BUILDERS: Record<
  AppLocale,
  (concept: string, subject: string) => string
> = {
  es: (concept, subject) => `Fórmula: ${concept} — ${subject}`,
  en: (concept, subject) => `${concept} Formula — ${subject}`,
  de: (concept, subject) => `Formel: ${concept} — ${subject}`,
  pt: (concept, subject) => `Fórmula: ${concept} — ${subject}`,
  fr: (concept, subject) => `Formule : ${concept} — ${subject}`,
  it: (concept, subject) => `Formula: ${concept} — ${subject}`,
};

export type FormulaSeoTitleInput = {
  concept: string;
  subjectTitle: string;
  locale: AppLocale;
  formulaId?: string;
  subject?: SubjectSlug;
  variant?: TitleVariantId;
};

/** Search-oriented title for formula pages (differs from in-page H1). */
export function resolveFormulaSeoTitle(input: FormulaSeoTitleInput): ResolvedFormulaTitle {
  const name = input.concept.replace(/\s+/g, ' ').trim();
  const subject = input.subjectTitle.replace(/\s+/g, ' ').trim();
  const variant = input.variant ?? activeTitleVariant();

  if (!subject || name === subject) {
    return { title: name, variant };
  }

  const experiment =
    input.formulaId && input.subject
      ? findTitleExperiment(input.subject, input.formulaId)
      : undefined;

  if (variant === 'b' && experiment?.variantB[input.locale]) {
    const custom = experiment.variantB[input.locale]!.trim();
    return {
      title: FORMULA_TITLE_BUILDERS[input.locale](custom, subject),
      variant: 'b',
      experimentId: experiment.formulaId,
    };
  }

  return {
    title: FORMULA_TITLE_BUILDERS[input.locale](name, subject),
    variant: 'a',
    experimentId: experiment?.formulaId,
  };
}

export function formulaSeoTitle(
  concept: string,
  subjectTitle: string,
  locale: AppLocale,
  options?: { formulaId?: string; subject?: SubjectSlug; variant?: TitleVariantId },
): string {
  return resolveFormulaSeoTitle({
    concept,
    subjectTitle,
    locale,
    formulaId: options?.formulaId,
    subject: options?.subject,
    variant: options?.variant,
  }).title;
}

const SECTION_TITLE_BUILDERS: Record<AppLocale, (section: string, subject: string) => string> = {
  es: (section, subject) => `${section} — fórmulas y recursos — ${subject}`,
  en: (section, subject) => `${section} — formulas and resources — ${subject}`,
  de: (section, subject) => `${section} — Formeln und Ressourcen — ${subject}`,
  pt: (section, subject) => `${section} — fórmulas e recursos — ${subject}`,
  fr: (section, subject) => `${section} — formules et ressources — ${subject}`,
  it: (section, subject) => `${section} — formule e risorse — ${subject}`,
};

export function sectionSeoTitle(sectionName: string, subjectTitle: string, locale: AppLocale): string {
  const section = sectionName.replace(/\s+/g, ' ').trim();
  const subject = subjectTitle.replace(/\s+/g, ' ').trim();
  return SECTION_TITLE_BUILDERS[locale](section, subject);
}

const TOPIC_TITLE_BUILDERS: Record<AppLocale, (topic: string, subject: string) => string> = {
  es: (topic, subject) => `${topic} — ${subject}`,
  en: (topic, subject) => `${topic} — ${subject}`,
  de: (topic, subject) => `${topic} — ${subject}`,
  pt: (topic, subject) => `${topic} — ${subject}`,
  fr: (topic, subject) => `${topic} — ${subject}`,
  it: (topic, subject) => `${topic} — ${subject}`,
};

export function topicSeoTitle(topicTitle: string, subjectTitle: string, locale: AppLocale): string {
  const topic = topicTitle.replace(/\s+/g, ' ').trim();
  const subject = subjectTitle.replace(/\s+/g, ' ').trim();
  return TOPIC_TITLE_BUILDERS[locale](topic, subject);
}

export function mergeSearchKeywords(
  ...groups: Array<string[] | null | undefined>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const raw of group ?? []) {
      const value = raw.trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }
  return out.slice(0, 12);
}

const LATEX_SYMBOLS: Record<string, string> = {
  sigma: 'σ',
  varepsilon: 'ε',
  epsilon: 'ε',
  Delta: 'Δ',
  delta: 'δ',
  theta: 'θ',
  omega: 'ω',
  pi: 'π',
  perp: '⊥',
  parallel: '∥',
  vec: '',
  frac: '',
  left: '',
  right: '',
  text: '',
  mathrm: '',
};

function latexTokenToPlain(token: string): string {
  return token
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\operatorname\{([^}]+)\}/g, '$1')
    .replace(/\\vec\{([^}]+)\}/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, (_, cmd: string) => LATEX_SYMBOLS[cmd] ?? cmd)
    .replace(/[{}^_&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function latexToPlainSnippet(latex: string, max = 80): string {
  const plain = latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_, num, den) => {
      const left = latexTokenToPlain(num) || '·';
      const right = latexTokenToPlain(den) || '·';
      return `${left}/${right}`;
    })
    .split('\n')
    .map((line) => latexTokenToPlain(line))
    .filter(Boolean)
    .join(' = ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return '';
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

export function formulaOgImageUrl(locale: AppLocale, subject: string, formulaId: string): string {
  const id = formulaId.trim().toUpperCase();
  const subjectSlug = subject.replace(/^\/+|\/+$/g, '');
  return `${siteOrigin()}/og/${locale}/${subjectSlug}/formula/${id}`;
}

export function formulaSeoDescription(input: {
  title: string;
  subjectTitle: string;
  detail?: string | null;
  latex?: string | null;
  variables?: string | null;
  conventions?: string[];
  equivalentNotations?: string[];
  searchAliases?: string[];
  hasVisualization: boolean;
  visualizationNote?: string;
  unitsLabel?: string;
  fallback: string;
}): string {
  const latexSnippet = input.latex ? latexToPlainSnippet(input.latex) : '';
  const units = input.conventions?.length
    ? `${input.unitsLabel ?? 'Units'}: ${input.conventions.join('; ')}`
    : null;
  const aliases = mergeSearchKeywords(input.equivalentNotations, input.searchAliases)
    .slice(0, 2)
    .join('; ') || null;

  const parts: Array<string | null | undefined> = [
    latexSnippet ? `${latexSnippet}.` : null,
    input.detail,
    input.variables ? plainText(input.variables, 100) : null,
    units,
    aliases,
    input.hasVisualization ? input.visualizationNote : null,
  ];
  const composed = composeDescription(parts, '');
  if (composed.length >= 40) return composed;
  return composeDescription(
    [composed, input.fallback],
    input.fallback,
  );
}

export function learningResourceJsonLd(input: {
  name: string;
  description: string;
  locale: AppLocale;
  path: string;
  learningResourceType: string;
  isPartOf: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.name,
    description: input.description,
    learningResourceType: input.learningResourceType,
    inLanguage: input.locale,
    isPartOf: input.isPartOf,
    url: canonicalUrl(input.locale, input.path),
  };
}

export function definedTermJsonLd(input: {
  name: string;
  description: string;
  locale: AppLocale;
  path: string;
  termCode: string;
  termSetName: string;
  latex?: string | null;
}) {
  const description = input.latex
    ? `${input.description} ${latexToPlainSnippet(input.latex, 120)}`.trim()
    : input.description;

  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: input.name,
    description: plainText(description, 500),
    termCode: input.termCode,
    url: canonicalUrl(input.locale, input.path),
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: input.termSetName,
    },
  };
}

export function faqPageJsonLd(input: {
  items: FormulaFaqItem[];
  locale: AppLocale;
  path: string;
}) {
  if (!input.items.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: input.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: canonicalUrl(input.locale, input.path),
  };
}

export function itemListJsonLd(input: {
  name: string;
  locale: AppLocale;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: canonicalUrl(input.locale, item.path),
    })),
  };
}

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Spanish function-word leak detector for non-es pages. Conservative: ignores math tokens. */
const SPANISH_PHRASES = [
  'el dominio es el conjunto',
  'relaciona la expresión',
  'tipo de función',
  'de la expresión al dominio',
  'mueve b y observa',
  'próximamente',
  'cargando fórmula',
  'cargando sección',
  'cargando búsqueda',
  'tipo de función',
  'siempre definida para todo',
  'sin restricción',
  'de la expresión al dominio',
  'función no definida',
  'valores de x permitidos',
  'visualización',
];

export function detectUnexpectedSpanish(text: string): string[] {
  const lower = text.toLowerCase();
  return SPANISH_PHRASES.filter((phrase) => lower.includes(phrase));
}

import type { Metadata } from 'next';
import { routing, localeOgTags, type AppLocale } from '@/i18n/routing';

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
};

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const path = normalizeAppPath(stripSearchParams(input.path));
  const canonical = canonicalUrl(input.locale, path);
  const index = input.index ?? !isSearchPath(path);
  const follow = input.follow ?? true;
  const image = {
    url: ogImageAbsolute(),
    width: 1200,
    height: 630,
    alt: OG_IMAGE_ALT,
  };

  return {
    title: input.title,
    description: input.description,
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
      images: [ogImageAbsolute()],
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
}) {
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
  };
}

export function titledWithSubject(name: string, subjectTitle: string): string {
  const concept = name.replace(/\s+/g, ' ').trim();
  const subject = subjectTitle.replace(/\s+/g, ' ').trim();
  if (!subject || concept === subject) return concept;
  if (concept.includes(subject)) return concept;
  return `${concept} — ${subject}`;
}

export function formulaSeoDescription(input: {
  title: string;
  subjectTitle: string;
  detail?: string | null;
  hasVisualization: boolean;
  visualizationNote?: string;
  fallback: string;
}): string {
  const parts: Array<string | null | undefined> = [
    input.detail,
    input.title && input.subjectTitle ? `${input.title}. ${input.subjectTitle}.` : input.title,
    input.hasVisualization ? input.visualizationNote : null,
  ];
  return composeDescription(parts, input.fallback);
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

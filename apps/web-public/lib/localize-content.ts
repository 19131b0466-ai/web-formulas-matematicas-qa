import type { AppLocale } from '@/i18n/routing';

type ContentDict = Record<string, string>;

const dictCache = new Map<string, ContentDict>();

async function loadDict(locale: AppLocale): Promise<ContentDict> {
  if (locale === 'es') return {};
  const cached = dictCache.get(locale);
  if (cached) return cached;
  const mod = await import(`../content-i18n/${locale}.json`);
  const dict = mod.default as ContentDict;
  dictCache.set(locale, dict);
  return dict;
}

/** Normalize Spanish trig operator names for international locales. */
export function localizeLatex(latex: string, locale: AppLocale): string {
  if (locale === 'es' || locale === 'pt') return latex;
  return latex
    .replace(/\\operatorname\{sen\}/g, '\\sin')
    .replace(/\\operatorname\{arcsen\}/g, '\\arcsin');
}

function localizeString(value: string, dict: ContentDict, locale: AppLocale): string {
  const translated = dict[value] ?? value;
  return localizeLatex(translated, locale);
}

function walk(value: unknown, dict: ContentDict, locale: AppLocale): unknown {
  if (typeof value === 'string') {
    return localizeString(value, dict, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, dict, locale));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'latex' && typeof child === 'string') {
        out[key] = localizeLatex(child, locale);
      } else {
        out[key] = walk(child, dict, locale);
      }
    }
    return out;
  }
  return value;
}

export async function localizeContent<T>(data: T, locale: AppLocale): Promise<T> {
  if (data == null || locale === 'es') return data;
  const dict = await loadDict(locale);
  return walk(data, dict, locale) as T;
}

import type { AppLocale } from '@/i18n/routing';
import {
  localizeCalculoDiferencialLatexText,
  localizeCalculoDiferencialVariables,
} from './calculo-diferencial-latex-text';

type ContentDict = Record<string, string>;

const dictCache = new Map<string, ContentDict>();

/** Fields that must never pass through phrase translation (URLs, IDs). */
const IMMUTABLE_STRING_KEYS = new Set([
  'slug',
  'parentSlug',
  'formulaId',
  'id',
  'path',
  'href',
  'blockType',
  'type',
  'mode',
  'level',
  'formulaCode',
]);

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

function localizeLatexField(latex: string, locale: AppLocale): string {
  return localizeCalculoDiferencialLatexText(localizeLatex(latex, locale), locale);
}

/** Exact dictionary lookup only — no substring splicing (avoids corrupting slugs and words). */
function localizeString(value: string, dict: ContentDict, locale: AppLocale): string {
  const exact = dict[value];
  if (exact !== undefined && exact !== value) return localizeLatex(exact, locale);
  return value;
}

function walk(value: unknown, dict: ContentDict, locale: AppLocale, parentKey?: string): unknown {
  if (typeof value === 'string') {
    if (parentKey && IMMUTABLE_STRING_KEYS.has(parentKey)) return value;
    return localizeString(value, dict, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => walk(item, dict, locale, parentKey));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'tags' && Array.isArray(child) && child.every((t) => typeof t === 'string')) {
        out[key] = child;
        continue;
      }
      if (key === 'tag' && typeof child === 'string' && !child.includes(' ')) {
        out[key] = child;
        continue;
      }
      if (key === 'latex' && typeof child === 'string') {
        out[key] = localizeLatexField(child, locale);
      } else if (key === 'variables' && typeof child === 'string') {
        out[key] = localizeCalculoDiferencialVariables(localizeString(child, dict, locale), locale);
      } else if (key === 'additionalLatex' && Array.isArray(child)) {
        out[key] = child.map((item) =>
          typeof item === 'string' ? localizeLatexField(item, locale) : walk(item, dict, locale, key),
        );
      } else {
        out[key] = walk(child, dict, locale, key);
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

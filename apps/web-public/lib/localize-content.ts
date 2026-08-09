import type { AppLocale } from '@/i18n/routing';

type ContentDict = Record<string, string>;

const dictCache = new Map<string, ContentDict>();
const sortedKeysCache = new Map<string, string[]>();

async function loadDict(locale: AppLocale): Promise<ContentDict> {
  if (locale === 'es') return {};
  const cached = dictCache.get(locale);
  if (cached) return cached;
  const mod = await import(`../content-i18n/${locale}.json`);
  const dict = mod.default as ContentDict;
  dictCache.set(locale, dict);
  return dict;
}

function sortedKeys(locale: AppLocale, dict: ContentDict): string[] {
  const cached = sortedKeysCache.get(locale);
  if (cached) return cached;
  const keys = Object.keys(dict)
    .filter((k) => k.length >= 3 && dict[k] !== k)
    .sort((a, b) => b.length - a.length);
  sortedKeysCache.set(locale, keys);
  return keys;
}

/** Normalize Spanish trig operator names for international locales. */
export function localizeLatex(latex: string, locale: AppLocale): string {
  if (locale === 'es' || locale === 'pt') return latex;
  return latex
    .replace(/\\operatorname\{sen\}/g, '\\sin')
    .replace(/\\operatorname\{arcsen\}/g, '\\arcsin');
}

/**
 * Translate an exact dictionary hit, or splice known phrases into composite
 * strings (search excerpts / searchText blobs).
 */
function localizeString(value: string, dict: ContentDict, locale: AppLocale): string {
  const exact = dict[value];
  if (exact !== undefined) return localizeLatex(exact, locale);

  // Protect LaTeX segments while doing phrase replacement.
  const slots: string[] = [];
  const protectedText = value.replace(/\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$]+\$/g, (m) => {
    const i = slots.length;
    slots.push(m);
    return `\u0000${i}\u0000`;
  });

  let out = protectedText;
  for (const key of sortedKeys(locale, dict)) {
    if (!out.includes(key)) continue;
    out = out.split(key).join(dict[key]!);
  }

  out = out.replace(/\u0000(\d+)\u0000/g, (_, n) => slots[Number(n)] ?? '');
  return localizeLatex(out, locale);
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
      // Tag slugs are identifiers for filtering — do not translate in place.
      if (key === 'tags' && Array.isArray(child) && child.every((t) => typeof t === 'string')) {
        out[key] = child;
        continue;
      }
      if (key === 'tag' && typeof child === 'string' && !child.includes(' ')) {
        out[key] = child;
        continue;
      }
      if (key === 'latex' && typeof child === 'string') {
        out[key] = localizeLatex(child, locale);
      } else if (key === 'additionalLatex' && Array.isArray(child)) {
        out[key] = child.map((item) =>
          typeof item === 'string' ? localizeLatex(item, locale) : walk(item, dict, locale),
        );
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

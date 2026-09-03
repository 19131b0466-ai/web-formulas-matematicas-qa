import esSource from './viz-guide-es.json';
import i18n from './viz-guide-i18n.json';

export type GuideCopy = { idea: string; tryIt: string };

const BY_TRYIT = new Map<string, string>();
for (const [key, value] of Object.entries(esSource as Record<string, GuideCopy>)) {
  BY_TRYIT.set(value.tryIt, key);
  BY_TRYIT.set(value.idea, key);
}

export function localizeGuide(idea: string, tryIt: string, locale: string): GuideCopy {
  if (locale === 'es') return { idea, tryIt };
  const key = BY_TRYIT.get(tryIt) ?? BY_TRYIT.get(idea);
  if (!key) return { idea, tryIt };
  const pack = (i18n as Record<string, Partial<Record<string, GuideCopy>>>)[key];
  const localized = pack?.[locale];
  if (!localized?.idea || !localized?.tryIt) return { idea, tryIt };
  return localized;
}

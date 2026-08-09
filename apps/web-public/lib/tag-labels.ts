import type { AppLocale } from '@/i18n/routing';
import generated from './tag-labels.generated.json';

type LocaleMap = Record<string, string>;

const TAG_LABELS = generated as Record<Exclude<AppLocale, 'es'>, LocaleMap>;

/** Human-readable label for a tag slug in the active locale. */
export function localizeTagLabel(tag: string, locale: AppLocale): string {
  if (locale === 'es') return tag;
  const mapped = TAG_LABELS[locale]?.[tag];
  if (mapped) return mapped;
  // Last-resort: readable slug without leaving raw Spanish tokens glued by hyphens.
  return tag.replace(/-/g, ' ');
}

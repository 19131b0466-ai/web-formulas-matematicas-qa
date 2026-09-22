import type { AppLocale } from '@/i18n/routing';
import generated from './tag-labels.generated.json';
import cdTags from './calculo-diferencial-tag-labels.json';
import elecTags from './fisica-electronica-tag-labels.json';

type LocaleMap = Record<string, string>;

const GENERATED = generated as Record<Exclude<AppLocale, 'es'>, LocaleMap>;
const CD_TAGS = cdTags as Record<AppLocale, LocaleMap>;
const ELEC_TAGS = elecTags as Record<AppLocale, LocaleMap>;

const TAG_LABELS = {
  ...GENERATED,
  es: { ...(CD_TAGS.es ?? {}), ...(ELEC_TAGS.es ?? {}) },
  en: { ...GENERATED.en, ...CD_TAGS.en, ...ELEC_TAGS.en },
  de: { ...GENERATED.de, ...CD_TAGS.de, ...ELEC_TAGS.de },
  fr: { ...GENERATED.fr, ...CD_TAGS.fr, ...ELEC_TAGS.fr },
  it: { ...GENERATED.it, ...CD_TAGS.it, ...ELEC_TAGS.it },
  pt: { ...GENERATED.pt, ...CD_TAGS.pt, ...ELEC_TAGS.pt },
} as Record<AppLocale, LocaleMap>;

/** Human-readable label for a tag slug in the active locale. */
export function localizeTagLabel(tag: string, locale: AppLocale): string {
  const mapped = TAG_LABELS[locale]?.[tag];
  if (mapped) return mapped;
  // Last-resort: readable slug without leaving raw Spanish tokens glued by hyphens.
  return tag.replace(/-/g, ' ');
}

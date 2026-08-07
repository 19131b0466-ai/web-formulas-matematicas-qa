import { defineRouting } from 'next-intl/routing';

export const locales = ['es', 'en', 'de', 'pt', 'fr', 'it'] as const;
export type AppLocale = (typeof locales)[number];

export const localeNames: Record<AppLocale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
};

export const localeOgTags: Record<AppLocale, string> = {
  es: 'es_ES',
  en: 'en_US',
  de: 'de_DE',
  pt: 'pt_BR',
  fr: 'fr_FR',
  it: 'it_IT',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  /** Negotiate from Accept-Language / cookie; falls back to Spanish. */
  localeDetection: true,
  /** Persist explicit language choice across navigations (not just the tab session). */
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
});

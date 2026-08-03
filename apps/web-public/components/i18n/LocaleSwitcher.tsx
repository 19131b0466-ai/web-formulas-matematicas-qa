'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeNames, type AppLocale, locales } from '@/i18n/routing';

export function LocaleSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{t('language')}</span>
      <select
        value={locale}
        disabled={pending}
        aria-label={t('language')}
        className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm font-medium text-[var(--fg)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}

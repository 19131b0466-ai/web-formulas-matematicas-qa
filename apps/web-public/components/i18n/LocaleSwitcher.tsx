'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePathname } from '@/i18n/navigation';
import { localeNames, type AppLocale, locales, routing } from '@/i18n/routing';

/**
 * Hard-navigate on locale change. Soft RSC transitions were freezing the UI
 * (especially on formula pages) while layout + content re-fetched.
 */
export function LocaleSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{t('language')}</span>
      <select
        value={locale}
        disabled={busy}
        aria-label={t('language')}
        className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-sm font-medium text-[var(--fg)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        onChange={(event) => {
          const next = event.target.value as AppLocale;
          if (next === locale) return;
          setBusy(true);
          const path = pathname === '/' ? '' : pathname;
          const href =
            next === routing.defaultLocale ? `${path || '/'}` : `/${next}${path}`;
          window.location.assign(href);
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

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from '@/i18n/navigation';

const NAV = [
  { href: '/', key: 'home' as const },
  { href: '/acerca', key: 'about' as const },
  { href: '/resenas', key: 'reviews' as const },
  { href: '/contacto', key: 'contact' as const },
] as const;

export function SiteHeader() {
  const t = useTranslations('siteNav');
  const ts = useTranslations('site');
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="group min-w-0">
          <span className="font-display block truncate text-xl font-semibold tracking-tight text-[var(--fg)] transition group-hover:text-[var(--accent-strong)] sm:text-2xl">
            {ts('name')}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t('primary')}>
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href as '/'}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--fg-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-medium md:hidden"
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t('close') : t('menu')}
          </button>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {open ? (
        <nav
          id="site-mobile-nav"
          className="border-t border-[var(--border)] px-4 py-3 md:hidden"
          aria-label={t('primary')}
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href as '/'}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] hover:bg-[var(--accent-soft)]"
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

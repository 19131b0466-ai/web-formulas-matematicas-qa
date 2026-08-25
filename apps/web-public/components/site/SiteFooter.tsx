'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const FOOTER_LINKS = [
  { href: '/acerca', key: 'about' as const },
  { href: '/resenas', key: 'reviews' as const },
  { href: '/contacto', key: 'contact' as const },
] as const;

export function SiteFooter() {
  const t = useTranslations('siteNav');
  const ts = useTranslations('site');
  const tf = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_88%,var(--bg-elevated))]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">{ts('name')}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{tf('blurb')}</p>
          <p className="mt-4 text-xs text-[var(--fg-muted)]">
            © {year} {ts('name')}
          </p>
        </div>
        <nav aria-label={t('legal')} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.key}
              href={item.href as '/'}
              className="text-[var(--fg-muted)] underline-offset-2 transition hover:text-[var(--accent-strong)] hover:underline"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

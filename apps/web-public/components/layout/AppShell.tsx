'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import type { SectionSummary } from '@repo/shared-types';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from '@/i18n/navigation';
import type { SubjectSlug } from '@/lib/subjects';
import { searchHref, subjectHasGuide, subjectHomeHref } from '@/lib/subjects';
import { SidebarNav } from './SidebarNav';

type AppShellProps = {
  subject: SubjectSlug;
  subjectTitle: string;
  sections: SectionSummary[];
  children: ReactNode;
};

export function AppShell({ subject, subjectTitle, sections, children }: AppShellProps) {
  const t = useTranslations('nav');
  const tf = useTranslations('footer');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-fg)] lg:flex">
        <Brand subject={subject} subjectTitle={subjectTitle} />
        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-8">
          <SidebarNav subject={subject} sections={sections} />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t('closeMenu')}
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--fg)_35%,transparent)]"
            onClick={() => setOpen(false)}
          />
          <aside
            id="mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-fg)] shadow-2xl"
          >
            <Brand subject={subject} subjectTitle={subjectTitle} onClose={() => setOpen(false)} />
            <div className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-8">
              <SidebarNav subject={subject} sections={sections} onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-medium lg:hidden"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {t('menu')}
            </button>
            <Link
              href={searchHref(subject) as '/'}
              className="hidden min-h-11 items-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] sm:inline-flex"
            >
              {t('searchPlaceholder')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>

        <footer className="border-t border-[var(--border)] px-4 py-6 text-sm text-[var(--fg-muted)] sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center">
            <p>
              {tf('line')}{' '}
              {subjectHasGuide(subject) ? (
                <Link
                  href={`/${subject}/guia` as '/'}
                  className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  {tf('guideLink')}
                </Link>
              ) : (
                <Link href="/" className="text-[var(--accent-strong)] underline-offset-2 hover:underline">
                  {tf('hubLink')}
                </Link>
              )}
            </p>
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label={tf('about')}>
              <Link href="/acerca" className="underline-offset-2 hover:text-[var(--accent-strong)] hover:underline">
                {tf('about')}
              </Link>
              <Link href="/resenas" className="underline-offset-2 hover:text-[var(--accent-strong)] hover:underline">
                {tf('reviews')}
              </Link>
              <Link href="/contacto" className="underline-offset-2 hover:text-[var(--accent-strong)] hover:underline">
                {tf('contact')}
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Brand({
  subject,
  subjectTitle,
  onClose,
}: {
  subject: SubjectSlug;
  subjectTitle: string;
  onClose?: () => void;
}) {
  const t = useTranslations('nav');

  return (
    <div className="flex items-start justify-between gap-2 px-5 pb-4 pt-6">
      <div>
        <Link href="/" onClick={onClose} className="block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-muted)]">
            {t('brandEyebrow')}
          </p>
        </Link>
        <Link href={subjectHomeHref(subject) as '/'} onClick={onClose} className="block">
          <p className="font-display mt-1 text-2xl leading-tight text-[var(--accent-strong)]">
            {subjectTitle}
          </p>
        </Link>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="mt-1 inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] text-sm text-[var(--sidebar-fg)]"
          aria-label={t('close')}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

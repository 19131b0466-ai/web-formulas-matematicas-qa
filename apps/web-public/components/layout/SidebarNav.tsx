'use client';

import { useTranslations } from 'next-intl';
import type { SectionSummary } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Link, usePathname } from '@/i18n/navigation';
import type { SubjectSlug } from '@/lib/subjects';
import {
  searchHref,
  sectionHref,
  subjectHasGuide,
  subjectHomeHref,
} from '@/lib/subjects';

type SidebarNavProps = {
  subject: SubjectSlug;
  sections: SectionSummary[];
  onNavigate?: () => void;
};

export function SidebarNav({ subject, sections, onNavigate }: SidebarNavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const home = subjectHomeHref(subject);
  const search = searchHref(subject);
  const guide = `/${subject}/guia`;

  return (
    <nav aria-label={t('sectionsIndex')} className="space-y-1">
      <NavLink href="/" active={pathname === '/'} onNavigate={onNavigate}>
        {t('hub')}
      </NavLink>
      <NavLink href={home as '/'} active={pathname === home} onNavigate={onNavigate}>
        {t('home')}
      </NavLink>
      <NavLink
        href={search as '/'}
        active={pathname.startsWith(search)}
        onNavigate={onNavigate}
      >
        {t('search')}
      </NavLink>
      {subjectHasGuide(subject) ? (
        <NavLink
          href={guide as '/'}
          active={pathname.startsWith(guide)}
          onNavigate={onNavigate}
        >
          {t('guide')}
        </NavLink>
      ) : null}

      <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-muted)]">
        {t('sections')}
      </p>

      <ul className="space-y-0.5">
        {sections.map((section) => {
          const href = sectionHref(subject, section.slug);
          const active = pathname === href || pathname.endsWith(`/${section.slug}`);
          return (
            <li key={section.slug}>
              <NavLink href={href as '/'} active={active} onNavigate={onNavigate}>
                <span className="mr-2 shrink-0 tabular-nums text-[var(--sidebar-muted)]">
                  {section.number || '·'}
                </span>
                <span className="line-clamp-2">
                  <InlineMarkdown text={section.title} />
                </span>
              </NavLink>
              {section.children && section.children.length > 0 ? (
                <ul className="mb-2 ml-3 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-2">
                  {section.children.map((child) => (
                    <li key={child.slug}>
                      <NavLink
                        href={sectionHref(subject, child.slug) as '/'}
                        active={pathname.endsWith(`/${child.slug}`)}
                        compact
                        onNavigate={onNavigate}
                      >
                        <span className="line-clamp-2">
                          {child.number ? (
                            <span className="mr-1.5 text-[var(--sidebar-muted)]">
                              {child.number}
                            </span>
                          ) : null}
                          <InlineMarkdown text={child.title} />
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
  onNavigate,
  compact,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={href as '/'}
      onClick={onNavigate}
      className={`flex min-h-11 items-start rounded-lg px-3 py-2 text-sm transition ${
        compact ? 'min-h-9 py-1.5 text-[13px]' : ''
      } ${
        active
          ? 'bg-[var(--sidebar-active)] font-medium text-[var(--accent-strong)]'
          : 'text-[var(--sidebar-fg)]/90 hover:bg-[var(--sidebar-hover)] hover:text-[var(--accent-strong)]'
      }`}
    >
      {children}
    </Link>
  );
}

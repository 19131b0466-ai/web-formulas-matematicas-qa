'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
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

function sectionMatchesPath(pathname: string, subject: SubjectSlug, slug: string): boolean {
  const href = sectionHref(subject, slug);
  return pathname === href || pathname.endsWith(`/${slug}`);
}

function parentSlugForPath(
  pathname: string,
  subject: SubjectSlug,
  sections: SectionSummary[],
): string | null {
  for (const section of sections) {
    if (sectionMatchesPath(pathname, subject, section.slug)) return section.slug;
    if (section.children?.some((child) => sectionMatchesPath(pathname, subject, child.slug))) {
      return section.slug;
    }
  }
  return null;
}

export function SidebarNav({ subject, sections, onNavigate }: SidebarNavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const home = subjectHomeHref(subject);
  const search = searchHref(subject);
  const guide = `/${subject}/guia`;

  const routeExpandedSlug = useMemo(
    () => parentSlugForPath(pathname, subject, sections),
    [pathname, subject, sections],
  );

  const [expandedSlug, setExpandedSlug] = useState<string | null>(routeExpandedSlug);

  useEffect(() => {
    setExpandedSlug(routeExpandedSlug);
  }, [routeExpandedSlug]);

  function expandSection(slug: string) {
    setExpandedSlug(slug);
  }

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
        prefetch={false}
      >
        {t('search')}
      </NavLink>
      {subjectHasGuide(subject) ? (
        <NavLink
          href={guide as '/'}
          active={pathname.startsWith(guide)}
          onNavigate={onNavigate}
          prefetch={false}
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
          const active = sectionMatchesPath(pathname, subject, section.slug);
          const hasChildren = Boolean(section.children && section.children.length > 0);
          const expanded = hasChildren && expandedSlug === section.slug;
          const childActive = Boolean(
            section.children?.some((child) => sectionMatchesPath(pathname, subject, child.slug)),
          );

          return (
            <li key={section.slug}>
              <NavLink
                href={href as '/'}
                active={active || childActive}
                prefetch={false}
                onNavigate={() => {
                  if (hasChildren) expandSection(section.slug);
                  onNavigate?.();
                }}
                aria-expanded={hasChildren ? expanded : undefined}
              >
                <span className="mr-2 shrink-0 tabular-nums text-[var(--sidebar-muted)]">
                  {section.number || '·'}
                </span>
                <span className="line-clamp-2 min-w-0 flex-1">
                  <InlineMarkdown text={section.title} />
                </span>
                {hasChildren ? (
                  <span
                    aria-hidden
                    className={`ml-2 mt-0.5 shrink-0 text-[10px] text-[var(--sidebar-muted)] transition ${
                      expanded ? 'rotate-90' : ''
                    }`}
                  >
                    ▸
                  </span>
                ) : null}
              </NavLink>
              {hasChildren && expanded ? (
                <ul className="mb-2 ml-3 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-2">
                  {section.children!.map((child) => (
                    <li key={child.slug}>
                      <NavLink
                        href={sectionHref(subject, child.slug) as '/'}
                        active={sectionMatchesPath(pathname, subject, child.slug)}
                        compact
                        prefetch={false}
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
  prefetch = true,
  'aria-expanded': ariaExpanded,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  compact?: boolean;
  prefetch?: boolean;
  'aria-expanded'?: boolean;
}) {
  return (
    <Link
      href={href as '/'}
      prefetch={prefetch}
      onClick={onNavigate}
      aria-expanded={ariaExpanded}
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

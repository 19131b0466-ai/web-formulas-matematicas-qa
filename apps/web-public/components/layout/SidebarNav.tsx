'use client';

import { useTranslations } from 'next-intl';
import type { SectionSummary } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Link, usePathname } from '@/i18n/navigation';
import { sectionHref } from '@/lib/api';

type SidebarNavProps = {
  sections: SectionSummary[];
  onNavigate?: () => void;
};

export function SidebarNav({ sections, onNavigate }: SidebarNavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('sectionsIndex')} className="space-y-1">
      <NavLink href="/" active={pathname === '/'} onNavigate={onNavigate}>
        {t('home')}
      </NavLink>
      <NavLink href="/buscar" active={pathname.startsWith('/buscar')} onNavigate={onNavigate}>
        {t('search')}
      </NavLink>
      <NavLink href="/guia" active={pathname.startsWith('/guia')} onNavigate={onNavigate}>
        {t('guide')}
      </NavLink>

      <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-muted)]">
        {t('sections')}
      </p>

      <ul className="space-y-0.5">
        {sections.map((section) => {
          const href = sectionHref(section.slug);
          const active = pathname === href || pathname.endsWith(`/${section.slug}`);
          return (
            <li key={section.slug}>
              <NavLink href={href} active={active} onNavigate={onNavigate}>
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
                        href={sectionHref(child.slug)}
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SectionSummary } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { sectionHref } from '@/lib/api';

type SidebarNavProps = {
  sections: SectionSummary[];
  onNavigate?: () => void;
};

export function SidebarNav({ sections, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Índice de secciones" className="space-y-1">
      <NavLink href="/" active={pathname === '/'} onNavigate={onNavigate}>
        Inicio
      </NavLink>
      <NavLink href="/buscar" active={pathname.startsWith('/buscar')} onNavigate={onNavigate}>
        Buscar
      </NavLink>
      <NavLink href="/guia" active={pathname.startsWith('/guia')} onNavigate={onNavigate}>
        Guía de métodos
      </NavLink>

      <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-muted)]">
        Secciones
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
                <ul className="mb-2 ml-3 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
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
      href={href}
      onClick={onNavigate}
      className={`flex min-h-11 items-start rounded-lg px-3 py-2 text-sm transition ${
        compact ? 'min-h-9 py-1.5 text-[13px]' : ''
      } ${
        active
          ? 'bg-white/10 font-medium text-white'
          : 'text-[var(--sidebar-fg)]/90 hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

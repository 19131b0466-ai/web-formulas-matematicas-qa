'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';

const NAV = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/analytics/traffic', label: 'Tráfico' },
  { href: '/analytics/geo', label: 'Geo' },
  { href: '/analytics/content', label: 'Contenido' },
  { href: '/analytics/audience', label: 'Audiencia' },
  { href: '/analytics/logs', label: 'Logs' },
  { href: '/analytics/export', label: 'Exportar' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center tracking-[0.14em] text-[var(--fg-muted)] uppercase">
        <span className="hud-status-dot mr-3" aria-hidden />
        Syncing console…
      </div>
    );
  }

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[rgba(4,10,18,0.92)] backdrop-blur-md lg:flex">
        <div className="border-b border-[var(--border)] px-5 py-6">
          <p className="hud-label">Ops console</p>
          <p className="font-display mt-2 text-xl text-[var(--accent-strong)]">Cálculo II</p>
          <p className="mt-1 text-[11px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
            Analytics · Control
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className="hud-nav-link"
              >
                <span className="mr-2 text-[var(--secondary)]" aria-hidden>
                  {active ? '●' : '○'}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <p className="truncate text-[11px] tracking-wide text-[var(--fg-muted)]">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-xs tracking-[0.12em] text-[var(--accent)] uppercase underline-offset-4 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[rgba(4,10,18,0.72)] px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 flex-wrap gap-2 lg:hidden">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${
                    active
                      ? 'border-[var(--accent)] text-[var(--accent-strong)] shadow-[var(--glow)]'
                      : 'border-[var(--border)] text-[var(--fg-muted)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs tracking-[0.12em] text-[var(--fg-muted)] uppercase">
            <span className="hidden items-center gap-2 sm:inline-flex">
              <span className="hud-status-dot" aria-hidden />
              Systems nominal
            </span>
            <span className="text-[var(--fg)]">{user.email}</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

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
      <div className="flex min-h-screen items-center justify-center text-[var(--fg-muted)]">
        Cargando…
      </div>
    );
  }

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] lg:flex">
        <div className="px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Superadmin
          </p>
          <p className="font-display mt-1 text-xl text-white">Cálculo II</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition ${
                  active
                    ? 'bg-[var(--accent-soft)] font-medium text-[var(--accent)]'
                    : 'text-[var(--fg-muted)] hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <p className="truncate text-xs text-[var(--fg-muted)]">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 text-sm text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 lg:px-8">
          <div className="flex flex-wrap gap-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--fg-muted)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="ml-auto text-sm text-[var(--fg-muted)]">{user.email}</p>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

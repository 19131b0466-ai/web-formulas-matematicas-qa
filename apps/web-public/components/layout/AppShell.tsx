'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { SectionSummary } from '@repo/shared-types';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SidebarNav } from './SidebarNav';

type AppShellProps = {
  sections: SectionSummary[];
  children: ReactNode;
};

export function AppShell({ sections, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-[var(--sidebar)] text-[var(--sidebar-fg)] lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <SidebarNav sections={sections} />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <aside
            id="mobile-nav"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-[var(--sidebar)] text-[var(--sidebar-fg)] shadow-2xl"
          >
            <Brand onClose={() => setOpen(false)} />
            <div className="flex-1 overflow-y-auto px-3 pb-8">
              <SidebarNav sections={sections} onNavigate={() => setOpen(false)} />
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
              Menú
            </button>
            <Link
              href="/buscar"
              className="hidden min-h-11 items-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)] sm:inline-flex"
            >
              Buscar fórmulas…
            </Link>
          </div>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>

        <footer className="border-t border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--fg-muted)] sm:px-6">
          <p>
            Formulario de Cálculo II · contenido servido por API ·{' '}
            <Link
              href="/guia"
              className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Guía de métodos
            </Link>
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed">
            Registramos visitas de uso (país, idioma y páginas vistas) para mejorar el servicio. La
            dirección IP se procesa solo en el servidor y no se muestra ni se exporta.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Brand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-start justify-between gap-2 px-5 pb-4 pt-6">
      <Link href="/" onClick={onClose} className="block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-muted)]">
          Cálculo Integral
        </p>
        <p className="font-display mt-1 text-2xl leading-tight text-white">Formulario II</p>
      </Link>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="mt-1 inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 text-sm"
          aria-label="Cerrar"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

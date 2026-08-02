import type { Metadata } from 'next';
import Link from 'next/link';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { fetchMethodGuide, fetchSection } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Guía para elegir un método',
  description:
    'Guía práctica para elegir la técnica de integración adecuada según la forma del integrando.',
  openGraph: {
    title: 'Guía de métodos · Formulario de Cálculo II',
    description:
      'Guía práctica para elegir la técnica de integración adecuada según la forma del integrando.',
  },
};

export const revalidate = 86400;

export default async function GuidePage() {
  const guide = await fetchMethodGuide();
  const section = await fetchSection('guia-metodos');

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Inicio', href: '/' }, { label: 'Guía de métodos' }]} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          Sección 17
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Guía para elegir un método
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--fg-muted)]">
          Usa la señal del integrando para decidir qué técnica conviene intentar primero.
        </p>
        {section ? (
          <p className="mt-3 text-sm">
            <Link
              href="/seccion/guia-metodos"
              className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              Ver sección completa en el índice →
            </Link>
          </p>
        ) : null}
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Señal → método</h2>
        {guide.strategies.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">
            No hay estrategias disponibles. Verifica la API y el seed.
          </p>
        ) : (
          <ol className="space-y-3">
            {guide.strategies.map((row, i) => (
              <li
                key={`${row.signal}-${String(i)}`}
                className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 sm:grid-cols-[1.15fr_1fr]"
              >
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Señal
                  </p>
                  <p>
                    <InlineMarkdown text={row.signal} />
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    Método
                  </p>
                  <p className="font-medium text-[var(--accent-strong)]">
                    <InlineMarkdown text={row.method} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {guide.checklist.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Lista de comprobación</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-base leading-relaxed">
            {guide.checklist.map((item) => (
              <li key={item}>
                <InlineMarkdown text={item} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

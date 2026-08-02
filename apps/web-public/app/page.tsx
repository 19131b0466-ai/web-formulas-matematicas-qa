import type { Metadata } from 'next';
import Link from 'next/link';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { fetchSections, sectionHref } from '@/lib/api';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export const revalidate = 86400;

export default async function HomePage() {
  const sections = await fetchSections();
  const main = sections.filter(
    (s) => !s.slug.startsWith('apendice-') && s.slug !== 'lista-comprobacion',
  );
  const appendices = sections.filter((s) => s.slug.startsWith('apendice-'));

  return (
    <div className="space-y-12">
      <section className="animate-rise relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_88%,transparent)] px-6 py-12 sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[var(--accent)]/15 blur-3xl"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          {SITE_TAGLINE}
        </p>
        <h1 className="font-display mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl">
          Formulario de Cálculo II
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
          Consulta antiderivadas, técnicas de integración, series y aplicaciones. Todo el contenido
          llega desde la API — sin fórmulas hardcodeadas en el frontend.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/buscar"
            className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Buscar fórmulas
          </Link>
          <Link
            href="/guia"
            className="inline-flex min-h-12 items-center rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)]"
          >
            Guía de métodos
          </Link>
        </div>
      </section>

      <section className="animate-rise" style={{ animationDelay: '80ms' }}>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Índice</h2>
        <p className="mt-2 text-[var(--fg-muted)]">
          {main.length} secciones principales
          {appendices.length ? ` y ${String(appendices.length)} apéndices` : ''}.
        </p>

        {main.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--fg-muted)]">
            No hay secciones disponibles. Arranca la API y ejecuta <code>pnpm db:seed</code>.
          </p>
        ) : (
          <ol className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {main.map((section) => (
              <li key={section.slug}>
                <Link
                  href={sectionHref(section.slug)}
                  className="group flex min-h-14 items-baseline justify-between gap-4 py-4 transition hover:text-[var(--accent-strong)]"
                >
                  <span className="flex min-w-0 gap-3">
                    <span className="w-8 shrink-0 tabular-nums text-[var(--fg-muted)]">
                      {section.number}
                    </span>
                    <span className="font-medium">
                      <InlineMarkdown text={section.title} />
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-[var(--fg-muted)] opacity-0 transition group-hover:opacity-100">
                    Ver →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      {appendices.length > 0 ? (
        <section className="animate-rise" style={{ animationDelay: '140ms' }}>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Apéndices</h2>
          <ul className="mt-4 space-y-2">
            {appendices.map((section) => (
              <li key={section.slug}>
                <Link
                  href={sectionHref(section.slug)}
                  className="inline-flex min-h-11 items-center text-[var(--accent-strong)] underline-offset-2 hover:underline"
                >
                  <InlineMarkdown text={section.title} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            learningResourceType: 'Reference',
            inLanguage: 'es',
            educationalLevel: 'University',
            about: 'Cálculo Integral',
          }),
        }}
      />
    </div>
  );
}

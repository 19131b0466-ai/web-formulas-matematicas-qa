import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from '@/i18n/navigation';
import { fetchSubjects } from '@/lib/api';
import type { AppLocale } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('name'),
    description: t('description'),
    openGraph: {
      title: t('name'),
      description: t('description'),
    },
  };
}

/** Always hit the API so a failed build-time fetch cannot stick for 24h. */
export const dynamic = 'force-dynamic';

const SUBJECT_COPY: Record<string, { accent: string }> = {
  'calculo-ii': { accent: 'from-[var(--accent)]/25 via-transparent to-transparent' },
  'fisica-basica': { accent: 'from-teal-600/20 via-transparent to-transparent' },
};

export default async function HubPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('hub');
  const ts = await getTranslations('site');
  const subjects = await fetchSubjects();

  return (
    <div className="relative z-10 min-h-screen">
      <header className="flex items-center justify-end gap-2 px-4 py-4 sm:px-8">
        <LocaleSwitcher />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center px-4 pb-16 sm:px-8">
        <section className="animate-rise relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_90%,transparent)] px-6 py-14 sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_55%)]"
          />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {ts('tagline')}
          </p>
          <h1 className="font-display relative mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-[var(--fg)] sm:text-6xl">
            {ts('name')}
          </h1>
          <p className="relative mt-5 max-w-xl text-lg leading-relaxed text-[var(--fg-muted)]">
            {t('intro')}
          </p>

          <div className="relative mt-12 grid gap-4 sm:grid-cols-2">
            {subjects.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--fg-muted)] sm:col-span-2">
                {t('empty')}
              </p>
            ) : (
              subjects.map((subject, index) => {
                const visual = SUBJECT_COPY[subject.slug] ?? SUBJECT_COPY['calculo-ii']!;
                return (
                  <Link
                    key={subject.slug}
                    href={`/${subject.slug}` as '/'}
                    className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-6 py-8 transition hover:border-[var(--accent)] animate-rise`}
                    style={{ animationDelay: `${80 + index * 60}ms` }}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.accent}`}
                    />
                    <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)]">
                      {t('subjectLabel')}
                    </p>
                    <h2 className="font-display relative mt-2 text-3xl font-semibold tracking-tight group-hover:text-[var(--accent-strong)]">
                      {subject.title}
                    </h2>
                    {subject.description ? (
                      <p className="relative mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                        {subject.description}
                      </p>
                    ) : null}
                    <span className="relative mt-6 inline-flex text-sm font-semibold text-[var(--accent-strong)]">
                      {t('open')} →
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

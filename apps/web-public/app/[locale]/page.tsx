import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroMathPlane } from '@/components/site/HeroMathPlane';
import { SiteShell } from '@/components/site/SiteShell';
import { Link } from '@/i18n/navigation';
import { fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import type { AppLocale } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  const th = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('name'),
    description: t('description'),
    openGraph: {
      title: t('name'),
      description: th('headline'),
    },
  };
}

/** Short ISR window: avoids hung SSR if the API is slow, without sticking empty forever. */
export const revalidate = 60;

const SUBJECT_COPY: Record<string, { accent: string; tone: string }> = {
  'calculo-ii': {
    accent: 'from-[var(--accent)]/30 via-transparent to-transparent',
    tone: 'text-[var(--accent-strong)]',
  },
  'fisica-basica': {
    accent: 'from-teal-600/25 via-transparent to-transparent',
    tone: 'text-teal-800 dark:text-teal-300',
  },
  algebra: {
    accent: 'from-amber-700/25 via-transparent to-transparent',
    tone: 'text-amber-900 dark:text-amber-300',
  },
};

export default async function HubPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const th = await getTranslations('hub');
  const ts = await getTranslations('site');
  const subjects = await localizeContent(await fetchSubjects(), locale);

  return (
    <SiteShell>
      {/* Hero: one composition — brand, headline, support, CTAs, full-bleed visual */}
      <section className="relative isolate min-h-[min(92vh,56rem)] overflow-hidden border-b border-[var(--border)]">
        <HeroMathPlane />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--bg)_35%,transparent)_0%,color-mix(in_oklab,var(--bg)_88%,transparent)_72%,var(--bg)_100%)]"
        />

        <div className="relative mx-auto flex min-h-[min(92vh,56rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-8 sm:pb-20">
          <h1 className="font-display animate-rise max-w-4xl text-5xl font-semibold tracking-tight text-[var(--fg)] sm:text-7xl lg:text-8xl">
            {ts('name')}
          </h1>
          <p
            className="animate-rise mt-5 max-w-xl text-xl leading-snug text-[var(--fg)] sm:text-2xl"
            style={{ animationDelay: '80ms' }}
          >
            {t('headline')}
          </p>
          <p
            className="animate-rise mt-4 max-w-lg text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg"
            style={{ animationDelay: '140ms' }}
          >
            {t('support')}
          </p>
          <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '200ms' }}>
            <a
              href="#materias"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              {t('ctaSubjects')}
            </a>
            <Link
              href="/acerca"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_80%,transparent)] px-6 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)]"
            >
              {t('ctaAbout')}
            </Link>
          </div>
        </div>
      </section>

      <section id="materias" className="scroll-mt-24 mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--fg)] sm:text-4xl">
          {t('subjectsTitle')}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--fg-muted)]">{t('subjectsLead')}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--fg-muted)] sm:col-span-2 lg:col-span-3">
              {th('empty')}
            </p>
          ) : (
            subjects.map((subject, index) => {
              const visual = SUBJECT_COPY[subject.slug] ?? SUBJECT_COPY['calculo-ii']!;
              return (
                <Link
                  key={subject.slug}
                  href={`/${subject.slug}` as '/'}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_92%,transparent)] px-6 py-8 transition hover:border-[var(--accent)] animate-rise"
                  style={{ animationDelay: `${80 + index * 70}ms` }}
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.accent}`}
                  />
                  <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)]">
                    {th('subjectLabel')}
                  </p>
                  <h3 className={`font-display relative mt-2 text-3xl font-semibold tracking-tight ${visual.tone}`}>
                    {subject.title}
                  </h3>
                  {subject.description ? (
                    <p className="relative mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                      {subject.description}
                    </p>
                  ) : null}
                  <span className="relative mt-6 inline-flex text-sm font-semibold text-[var(--accent-strong)]">
                    {th('open')} →
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 sm:px-8 sm:py-20">
          {(['latex', 'viz', 'search'] as const).map((key, i) => (
            <div key={key} className="animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
              <h3 className="font-display text-xl font-semibold text-[var(--fg)]">{t(`features.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{t(`features.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

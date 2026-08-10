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
      {/* First viewport: intro + subject cards together */}
      <section className="relative isolate overflow-hidden border-b border-[var(--border)]">
        <HeroMathPlane />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,color-mix(in_oklab,var(--bg)_72%,transparent)_0%,color-mix(in_oklab,var(--bg)_55%,transparent)_48%,color-mix(in_oklab,var(--bg)_82%,transparent)_100%)]"
        />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] lg:items-center lg:gap-12 lg:py-14">
          <div className="animate-rise order-2 min-w-0 lg:order-1">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl">
              {ts('name')}
            </h1>
            <p className="mt-4 text-lg leading-snug text-[var(--fg)] sm:text-xl">{t('headline')}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
              {t('support')}
            </p>
            <Link
              href="/acerca"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              {t('ctaAbout')} →
            </Link>
          </div>

          <div id="materias" className="order-1 min-w-0 lg:order-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fg-muted)]">
              {t('subjectsTitle')}
            </p>
            <div className="grid gap-3">
              {subjects.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_88%,transparent)] p-5 text-sm text-[var(--fg-muted)]">
                  {th('empty')}
                </p>
              ) : (
                subjects.map((subject, index) => {
                  const visual = SUBJECT_COPY[subject.slug] ?? SUBJECT_COPY['calculo-ii']!;
                  return (
                    <Link
                      key={subject.slug}
                      href={`/${subject.slug}` as '/'}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-elevated)_92%,transparent)] px-5 py-4 transition hover:border-[var(--accent)] animate-rise sm:py-5"
                      style={{ animationDelay: `${60 + index * 60}ms` }}
                    >
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.accent}`}
                      />
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
                            {th('subjectLabel')}
                          </p>
                          <h2 className={`font-display mt-1 text-2xl font-semibold tracking-tight ${visual.tone}`}>
                            {subject.title}
                          </h2>
                          {subject.description ? (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                              {subject.description}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 pt-1 text-sm font-semibold text-[var(--accent-strong)]">
                          {th('open')} →
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-8 sm:py-16">
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

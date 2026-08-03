import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { fetchMethodGuide, fetchSection } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import type { AppLocale } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'guide' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
    },
  };
}

export const revalidate = 86400;

export default async function GuidePage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('guide');
  const tn = await getTranslations('nav');
  const guide = await localizeContent(await fetchMethodGuide(), locale);
  const section = await fetchSection('guia-metodos');

  return (
    <div>
      <Breadcrumbs items={[{ label: tn('home'), href: '/' }, { label: tn('guide') }]} />

      <header className="mb-8 animate-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {t('sectionLabel')}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--fg-muted)]">{t('intro')}</p>
        {section ? (
          <p className="mt-3 text-sm">
            <Link
              href="/seccion/guia-metodos"
              className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
            >
              {t('fullSection')}
            </Link>
          </p>
        ) : null}
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">{t('signalMethod')}</h2>
        {guide.strategies.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">{t('empty')}</p>
        ) : (
          <ol className="space-y-3">
            {guide.strategies.map((row, i) => (
              <li
                key={`${row.signal}-${String(i)}`}
                className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-4 sm:grid-cols-[1.15fr_1fr]"
              >
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t('signal')}
                  </p>
                  <p>
                    <InlineMarkdown text={row.signal} />
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t('method')}
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
          <h2 className="font-display text-xl font-semibold">{t('checklist')}</h2>
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

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Link } from '@/i18n/navigation';
import { fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { breadcrumbJsonLd, buildPageMetadata, topicSeoTitle } from '@/lib/seo';
import { topicHubsForSubject } from '@/lib/topic-hubs';
import { isSubjectSlug, subjectHomeHref, topicHubHref, topicsIndexHref, type SubjectSlug } from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';
import { CATALOG_REVALIDATE_SECONDS } from '@/lib/isr';

export const revalidate = CATALOG_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{ locale: string; subject: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const subject = subjectRaw as SubjectSlug;
  if (topicHubsForSubject(subject).length === 0) return {};

  const t = await getTranslations({ locale, namespace: 'topicHubs' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  return buildPageMetadata({
    locale,
    path: topicsIndexHref(subject),
    title: topicSeoTitle(t('indexTitle'), subjectTitle, locale),
    description: t('indexDescription'),
    siteName: tsite('name'),
    ogType: 'website',
  });
}

export default async function TopicsIndexPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const hubs = topicHubsForSubject(subject);
  if (hubs.length === 0) notFound();

  const t = await getTranslations('topicHubs');
  const tn = await getTranslations('nav');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  return (
    <div className="space-y-8">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          { name: t('indexTitle'), path: topicsIndexHref(subject) },
        ])}
      />
      <Breadcrumbs
        items={[
          { label: tn('home'), href: '/' },
          { label: subjectTitle, href: subjectHomeHref(subject) },
          { label: t('indexTitle') },
        ]}
      />

      <header className="animate-rise">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t('indexTitle')}</h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--fg-muted)]">{t('indexDescription')}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {hubs.map((hub) => (
          <li key={hub.slug}>
            <Link
              href={topicHubHref(subject, hub.slug) as '/'}
              className="flex h-full flex-col rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] p-5 transition hover:border-[var(--accent-strong)]"
            >
              <h2 className="font-display text-lg font-semibold text-[var(--fg)]">
                {t(`${hub.messageKey}.title`)}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--fg-muted)]">
                <InlineMarkdown text={t(`${hub.messageKey}.description`)} />
              </p>
              <span className="mt-4 text-xs font-semibold text-[var(--accent-strong)]">
                {t('formulasHeading')} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

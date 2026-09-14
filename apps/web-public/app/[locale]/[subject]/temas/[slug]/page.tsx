import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TopicHubView } from '@/components/topic/TopicHubView';
import { JsonLd } from '@/components/seo/JsonLd';
import { fetchFormula, fetchSubjects } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  itemListJsonLd,
  topicSeoTitle,
} from '@/lib/seo';
import { findTopicHub } from '@/lib/topic-hubs';
import { fetchSections, flattenSections } from '@/lib/api';
import {
  isSubjectSlug,
  subjectHomeHref,
  topicHubHref,
  topicsIndexHref,
  type SubjectSlug,
} from '@/lib/subjects';
import type { FormulaDetailResponse } from '@repo/shared-types';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 86400;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; subject: string; slug: string }>;
};

export function generateStaticParams() {
  return [] as Array<{ locale: string; subject: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw, slug } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const subject = subjectRaw as SubjectSlug;
  const hub = findTopicHub(subject, slug);
  if (!hub) return {};

  const t = await getTranslations({ locale, namespace: 'topicHubs' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const topicTitle = t(`${hub.messageKey}.title`);

  return buildPageMetadata({
    locale,
    path: topicHubHref(subject, slug),
    title: topicSeoTitle(topicTitle, subjectTitle, locale),
    description: t(`${hub.messageKey}.description`),
    siteName: tsite('name'),
    ogType: 'article',
  });
}

export default async function TopicHubPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw, slug } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const hub = findTopicHub(subject, slug);
  if (!hub) notFound();

  const t = await getTranslations('topicHubs');
  const tn = await getTranslations('nav');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
  const topicTitle = t(`${hub.messageKey}.title`);

  const [formulas, sectionsTree] = await Promise.all([
    Promise.all(
      hub.formulaIds.map(async (id) => {
        try {
          return await localizeContent(await fetchFormula(subject, id), locale);
        } catch {
          return null;
        }
      }),
    ),
    localizeContent(await fetchSections(subject), locale),
  ]);

  const sections = flattenSections(sectionsTree);
  const resolvedFormulas = formulas.filter(
    (formula): formula is FormulaDetailResponse => formula !== null,
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          { name: t('indexTitle'), path: topicsIndexHref(subject) },
          { name: topicTitle, path: topicHubHref(subject, slug) },
        ])}
      />
      {resolvedFormulas.length > 0 ? (
        <JsonLd
          data={itemListJsonLd({
            name: topicTitle,
            locale,
            items: resolvedFormulas.map((f) => ({
              name: f.title ?? f.formulaId,
              path: `/${subject}/formula/${f.formulaId}`,
            })),
          })}
        />
      ) : null}
      <TopicHubView
        subject={subject}
        subjectTitle={subjectTitle}
        hub={hub}
        formulas={resolvedFormulas}
        sections={sections}
      />
    </>
  );
}

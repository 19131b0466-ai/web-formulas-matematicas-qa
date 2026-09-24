import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { HashScroll } from '@/components/navigation/HashScroll';
import { SectionView } from '@/components/section/SectionView';
import { JsonLd } from '@/components/seo/JsonLd';
import { redirect } from '@/i18n/navigation';
import {
  ApiUnavailableError,
  fetchSection,
  fetchSections,
  fetchSubjects,
  flattenSections,
  isAppendixSlug,
} from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { resolveSectionSlugAlias } from '@/lib/section-slug-aliases';
import { breadcrumbJsonLd, buildPageMetadata, learningResourceJsonLd, sectionSeoTitle } from '@/lib/seo';
import { isSubjectSlug, sectionHref, subjectHomeHref, type SubjectSlug } from '@/lib/subjects';
import type { AppLocale } from '@/i18n/routing';
import { sectionStaticParams } from '@/lib/catalog-static-params';

/** Persistent until `revalidateTag`. Unknown slugs still render on first request. */
export const revalidate = false;
export const dynamicParams = true;
/** Cap a hung catalog fetch so loading.tsx cannot stream for Fluid's 300s default. */
export const maxDuration = 60;

type StaticParamProps = { params: { subject?: string } };

/** Non-empty: one published section per subject. Other slugs are on-demand ISR. */
export function generateStaticParams({ params }: StaticParamProps) {
  return sectionStaticParams(params.subject);
}

type PageProps = {
  params: Promise<{ locale: string; subject: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw, slug: slugRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const subject = subjectRaw as SubjectSlug;
  const slug = resolveSectionSlugAlias(subject, slugRaw);
  const t = await getTranslations({ locale, namespace: 'section' });
  const tseo = await getTranslations({ locale, namespace: 'seo' });
  const tsite = await getTranslations({ locale, namespace: 'site' });
  try {
    const [detail, subjects] = await Promise.all([
      localizeContent(await fetchSection(slug, subject), locale),
      localizeContent(await fetchSubjects(), locale),
    ]);
    if (!detail) return { title: t('notFound') };

    const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;
    const sectionName = detail.section.number
      ? `${detail.section.number}. ${detail.section.title}`
      : detail.section.title;
    const title = sectionSeoTitle(sectionName, subjectTitle, locale);
    const description =
      detail.section.description ?? t('metaDescription', { title: detail.section.title });

    return buildPageMetadata({
      locale,
      path: `/${subject}/seccion/${slug}`,
      title,
      description,
      siteName: tsite('name'),
      ogType: 'article',
    });
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    return { title: t('content') };
  }
}

export default async function SectionPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw, slug: slugRaw } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const canonical = resolveSectionSlugAlias(subject, slugRaw);
  if (canonical !== slugRaw) {
    redirect({ href: `/${subject}/seccion/${canonical}`, locale });
  }
  const slug = canonical;

  const t = await getTranslations('section');
  const ts = await getTranslations('site');
  const tn = await getTranslations('nav');
  const subjects = await localizeContent(await fetchSubjects(), locale);
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  if (isAppendixSlug(slug)) {
    redirect({ href: `/${subject}/apendice/${slug}`, locale });
  }

  const detail = await localizeContent(await fetchSection(slug, subject), locale);
  if (!detail) notFound();

  let parent: { slug: string; title: string } | null = null;
  const tree = await localizeContent(await fetchSections(subject), locale);
  const flat = flattenSections(tree);
  const current = flat.find((s) => s.slug === slug);
  if (current?.parentSlug) {
    const parentNode = flat.find((s) => s.slug === current.parentSlug);
    if (parentNode) parent = { slug: parentNode.slug, title: parentNode.title };
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tn('home'), path: '/' },
          { name: subjectTitle, path: subjectHomeHref(subject) },
          ...(parent
            ? [{ name: parent.title, path: sectionHref(subject, parent.slug) }]
            : []),
          { name: detail.section.title, path: sectionHref(subject, slug) },
        ])}
      />
      <JsonLd
        data={learningResourceJsonLd({
          name: detail.section.title,
          description:
            detail.section.description ??
            t('jsonDescription', {
              number: detail.section.number,
              title: detail.section.title,
            }),
          locale,
          path: `/${subject}/seccion/${slug}`,
          learningResourceType: 'Reference',
          isPartOf: ts('name'),
        })}
      />
      <HashScroll />
      <SectionView
        subject={subject}
        subjectTitle={subjectTitle}
        detail={detail}
        parent={parent}
      />
    </>
  );
}

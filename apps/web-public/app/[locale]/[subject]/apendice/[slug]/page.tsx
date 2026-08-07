import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SectionView } from '@/components/section/SectionView';
import { redirect } from '@/i18n/navigation';
import {
  fetchSection,
  fetchSections,
  fetchSubjects,
  flattenSections,
  isAppendixSlug,
} from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { getSiteUrl } from '@/lib/site';
import { isSubjectSlug, type SubjectSlug } from '@/lib/subjects';
import { routing, type AppLocale } from '@/i18n/routing';

export const revalidate = 86400;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; subject: string; slug: string }>;
};

export async function generateStaticParams() {
  const sections = await fetchSections('calculo-ii');
  const slugs = flattenSections(sections)
    .filter((s) => isAppendixSlug(s.slug))
    .map((s) => s.slug);

  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, subject: 'calculo-ii', slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, subject: subjectRaw, slug } = await params;
  if (!isSubjectSlug(subjectRaw)) return {};
  const locale = raw as AppLocale;
  const subject = subjectRaw as SubjectSlug;
  const t = await getTranslations({ locale, namespace: 'appendix' });
  const ts = await getTranslations({ locale, namespace: 'site' });
  const detail = await localizeContent(await fetchSection(slug, subject), locale);
  if (!detail) return { title: t('notFound') };

  const title = detail.section.title;
  const description = t('metaDescription', { title: detail.section.title });
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const url = `${getSiteUrl()}${prefix}/${subject}/apendice/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} · ${ts('name')}`,
      description,
      url,
      type: 'article',
    },
    alternates: { canonical: url },
  };
}

export default async function AppendixPage({ params }: PageProps) {
  const { locale: raw, subject: subjectRaw, slug } = await params;
  if (!isSubjectSlug(subjectRaw)) notFound();
  const subject = subjectRaw as SubjectSlug;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const subjects = await fetchSubjects();
  const subjectTitle = subjects.find((s) => s.slug === subject)?.title ?? subject;

  if (!isAppendixSlug(slug)) {
    redirect({ href: `/${subject}/seccion/${slug}`, locale });
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
    <SectionView
      subject={subject}
      subjectTitle={subjectTitle}
      detail={detail}
      parent={parent}
    />
  );
}

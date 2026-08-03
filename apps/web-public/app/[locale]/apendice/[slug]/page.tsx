import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SectionView } from '@/components/section/SectionView';
import { redirect } from '@/i18n/navigation';
import { fetchSection, fetchSections, flattenSections, isAppendixSlug } from '@/lib/api';
import { localizeContent } from '@/lib/localize-content';
import { getSiteUrl } from '@/lib/site';
import { routing, type AppLocale } from '@/i18n/routing';

export const revalidate = 86400;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const sections = await fetchSections();
  const slugs = flattenSections(sections)
    .filter((s) => isAppendixSlug(s.slug))
    .map((s) => s.slug);

  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'appendix' });
  const ts = await getTranslations({ locale, namespace: 'site' });
  const detail = await localizeContent(await fetchSection(slug), locale);
  if (!detail) return { title: t('notFound') };

  const title = detail.section.title;
  const description = t('metaDescription', { title: detail.section.title });
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const url = `${getSiteUrl()}${prefix}/apendice/${slug}`;

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
  const { locale: raw, slug } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const ts = await getTranslations('site');

  if (!isAppendixSlug(slug)) {
    redirect({ href: `/seccion/${slug}`, locale });
  }

  const detail = await localizeContent(await fetchSection(slug), locale);
  if (!detail) notFound();

  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <>
      <SectionView detail={detail} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: detail.section.title,
            learningResourceType: 'Reference',
            inLanguage: locale,
            isPartOf: ts('name'),
            url: `${getSiteUrl()}${prefix}/apendice/${slug}`,
          }),
        }}
      />
    </>
  );
}

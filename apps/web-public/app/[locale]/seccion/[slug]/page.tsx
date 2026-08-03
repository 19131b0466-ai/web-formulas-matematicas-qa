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
    .filter((s) => !isAppendixSlug(s.slug))
    .map((s) => s.slug);

  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: 'section' });
  const ts = await getTranslations({ locale, namespace: 'site' });
  const detail = await localizeContent(await fetchSection(slug), locale);
  if (!detail) return { title: t('notFound') };

  const title = detail.section.number
    ? `${detail.section.number}. ${detail.section.title}`
    : detail.section.title;
  const description =
    detail.section.description ?? t('metaDescription', { title: detail.section.title });
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const url = `${getSiteUrl()}${prefix}/seccion/${slug}`;

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

export default async function SectionPage({ params }: PageProps) {
  const { locale: raw, slug } = await params;
  const locale = raw as AppLocale;
  setRequestLocale(locale);

  const t = await getTranslations('section');
  const ts = await getTranslations('site');

  if (isAppendixSlug(slug)) {
    redirect({ href: `/apendice/${slug}`, locale });
  }

  const detail = await localizeContent(await fetchSection(slug), locale);
  if (!detail) notFound();

  let parent: { slug: string; title: string } | null = null;
  const tree = await localizeContent(await fetchSections(), locale);
  const flat = flattenSections(tree);
  const current = flat.find((s) => s.slug === slug);
  if (current?.parentSlug) {
    const parentNode = flat.find((s) => s.slug === current.parentSlug);
    if (parentNode) parent = { slug: parentNode.slug, title: parentNode.title };
  }

  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <>
      <SectionView detail={detail} parent={parent} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: detail.section.title,
            description:
              detail.section.description ??
              t('jsonDescription', {
                number: detail.section.number,
                title: detail.section.title,
              }),
            learningResourceType: 'Reference',
            inLanguage: locale,
            isPartOf: ts('name'),
            url: `${getSiteUrl()}${prefix}/seccion/${slug}`,
          }),
        }}
      />
    </>
  );
}

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SectionView } from '@/components/section/SectionView';
import { fetchSection, fetchSections, flattenSections, isAppendixSlug } from '@/lib/api';
import { SITE_NAME, getSiteUrl } from '@/lib/site';

export const revalidate = 86400;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const sections = await fetchSections();
  return flattenSections(sections)
    .filter((s) => isAppendixSlug(s.slug))
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchSection(slug);
  if (!detail) return { title: 'Apéndice no encontrado' };

  const title = detail.section.title;
  const description = `Apéndice del formulario de Cálculo II: ${detail.section.title}.`;
  const url = `${getSiteUrl()}/apendice/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      type: 'article',
    },
    alternates: { canonical: url },
  };
}

export default async function AppendixPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isAppendixSlug(slug)) {
    redirect(`/seccion/${slug}`);
  }

  const detail = await fetchSection(slug);
  if (!detail) notFound();

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
            inLanguage: 'es',
            isPartOf: SITE_NAME,
            url: `${getSiteUrl()}/apendice/${slug}`,
          }),
        }}
      />
    </>
  );
}

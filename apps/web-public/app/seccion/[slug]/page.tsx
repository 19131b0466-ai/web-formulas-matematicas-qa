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
    .filter((s) => !isAppendixSlug(s.slug))
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchSection(slug);
  if (!detail) return { title: 'Sección no encontrada' };

  const title = detail.section.number
    ? `${detail.section.number}. ${detail.section.title}`
    : detail.section.title;
  const description =
    detail.section.description ??
    `Fórmulas y conceptos de ${detail.section.title} en el formulario de Cálculo II.`;
  const url = `${getSiteUrl()}/seccion/${slug}`;

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

export default async function SectionPage({ params }: PageProps) {
  const { slug } = await params;

  if (isAppendixSlug(slug)) {
    redirect(`/apendice/${slug}`);
  }

  const detail = await fetchSection(slug);
  if (!detail) notFound();

  let parent: { slug: string; title: string } | null = null;
  const tree = await fetchSections();
  const flat = flattenSections(tree);
  const current = flat.find((s) => s.slug === slug);
  if (current?.parentSlug) {
    const parentNode = flat.find((s) => s.slug === current.parentSlug);
    if (parentNode) parent = { slug: parentNode.slug, title: parentNode.title };
  }

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
              `Sección ${detail.section.number}: ${detail.section.title}`,
            learningResourceType: 'Reference',
            inLanguage: 'es',
            isPartOf: SITE_NAME,
            url: `${getSiteUrl()}/seccion/${slug}`,
          }),
        }}
      />
    </>
  );
}

import type { MetadataRoute } from 'next';
import { fetchSections, flattenSections, sectionHref } from '@/lib/api';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const sections = await fetchSections();
  const flat = flattenSections(sections);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${base}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/guia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const sectionRoutes: MetadataRoute.Sitemap = flat.map((s) => ({
    url: `${base}${sectionHref(s.slug)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: s.parentSlug ? 0.6 : 0.8,
  }));

  return [...staticRoutes, ...sectionRoutes];
}

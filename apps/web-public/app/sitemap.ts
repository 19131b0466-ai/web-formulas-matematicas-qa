import type { MetadataRoute } from 'next';
import { fetchSections, flattenSections, sectionHref } from '@/lib/api';
import { getSiteUrl } from '@/lib/site';
import { routing } from '@/i18n/routing';

function localePath(locale: string, path: string): string {
  const base = getSiteUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return `${base}${normalized === '/' ? '' : normalized}` || base;
  }
  return `${base}/${locale}${normalized === '/' ? '' : normalized}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = await fetchSections();
  const flat = flattenSections(sections);
  const staticPaths = ['/', '/buscar', '/guia'];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: localePath(locale, path),
        lastModified: new Date(),
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
        priority: path === '/' ? 1 : 0.75,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((code) => [code, localePath(code, path)]),
          ),
        },
      });
    }

    for (const section of flat) {
      const path = sectionHref(section.slug);
      entries.push({
        url: localePath(locale, path),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: section.parentSlug ? 0.6 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((code) => [code, localePath(code, path)]),
          ),
        },
      });
    }
  }

  return entries;
}

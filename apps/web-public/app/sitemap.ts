import type { MetadataRoute } from 'next';
import { canonicalUrl, languageAlternates } from '@/lib/seo';
import { collectSitemapPathEntries } from '@/lib/sitemap-paths';
import { routing, type AppLocale } from '@/i18n/routing';
import { CATALOG_REVALIDATE_SECONDS } from '@/lib/isr';

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pathEntries = await collectSitemapPathEntries();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const { path, lastModified } of pathEntries) {
      entries.push({
        url: canonicalUrl(locale as AppLocale, path),
        lastModified,
        alternates: { languages: languageAlternates(path) },
      });
    }
  }

  return entries;
}

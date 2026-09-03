import type { MetadataRoute } from 'next';
import { canonicalUrl, languageAlternates } from '@/lib/seo';
import { collectIndexablePaths } from '@/lib/sitemap-paths';
import { routing, type AppLocale } from '@/i18n/routing';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const uniquePaths = await collectIndexablePaths();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of uniquePaths) {
      entries.push({
        url: canonicalUrl(locale as AppLocale, path),
        alternates: { languages: languageAlternates(path) },
      });
    }
  }

  return entries;
}

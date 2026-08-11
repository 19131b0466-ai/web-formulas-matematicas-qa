import type { MetadataRoute } from 'next';
import {
  fetchSections,
  fetchSubjects,
  flattenSections,
} from '@/lib/api';
import { getSiteUrl } from '@/lib/site';
import { isSubjectSlug, sectionHref, subjectHasGuide, type SubjectSlug } from '@/lib/subjects';
import { routing } from '@/i18n/routing';
import type { SectionSummary } from '@repo/shared-types';

function localePath(locale: string, path: string): string {
  const base = getSiteUrl().replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return `${base}${normalized === '/' ? '' : normalized}` || base;
  }
  return `${base}/${locale}${normalized === '/' ? '' : normalized}`;
}

function alternatesFor(path: string): MetadataRoute.Sitemap[number]['alternates'] {
  return {
    languages: Object.fromEntries(
      routing.locales.map((code) => [code, localePath(code, path)]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const subjects = await fetchSubjects();
  const validSubjects = subjects.filter((s) => isSubjectSlug(s.slug));

  // Prefetch section trees in parallel (one round-trip per subject, not per locale).
  const sectionsBySubject = new Map<SubjectSlug, SectionSummary[]>();
  await Promise.all(
    validSubjects.map(async (subjectMeta) => {
      const subject = subjectMeta.slug as SubjectSlug;
      sectionsBySubject.set(subject, flattenSections(await fetchSections(subject)));
    }),
  );

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: localePath(locale, '/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: alternatesFor('/'),
    });

    for (const path of ['/acerca', '/contacto'] as const) {
      entries.push({
        url: localePath(locale, path),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: alternatesFor(path),
      });
    }

    for (const subjectMeta of validSubjects) {
      const subject = subjectMeta.slug as SubjectSlug;
      const staticPaths = [`/${subject}`, `/${subject}/buscar`];
      if (subjectHasGuide(subject)) {
        staticPaths.push(`/${subject}/guia`);
      }

      for (const path of staticPaths) {
        entries.push({
          url: localePath(locale, path),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
          alternates: alternatesFor(path),
        });
      }

      const sections = sectionsBySubject.get(subject) ?? [];
      for (const section of sections) {
        if (section.slug === 'lista-comprobacion') continue;
        const path = sectionHref(subject, section.slug);
        entries.push({
          url: localePath(locale, path),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: section.parentSlug ? 0.6 : 0.8,
          alternates: alternatesFor(path),
        });
      }
    }
  }

  return entries;
}

import { fetchFormulaCodes, fetchSections, fetchSubjects, fetchSitemapEntries, flattenSections } from '@/lib/api';
import { isSearchPath } from '@/lib/seo';
import { collectTopicHubPaths } from '@/lib/topic-hubs';
import { isSubjectSlug, sectionHref, subjectHasGuide, type SubjectSlug } from '@/lib/subjects';
import type { SectionSummary } from '@repo/shared-types';

const STATIC_PATHS = ['/', '/acerca', '/contacto', '/resenas', '/privacidad', '/terminos'] as const;

export type SitemapPathEntry = {
  path: string;
  lastModified?: Date;
};

/** Indexable public paths (locale prefix applied later). Excludes search. */
export async function collectIndexablePaths(): Promise<string[]> {
  const entries = await collectSitemapPathEntries();
  return entries.map((entry) => entry.path);
}

function mergeTopicHubPaths(entries: SitemapPathEntry[]): SitemapPathEntry[] {
  const unique = new Map<string, SitemapPathEntry>();
  for (const entry of entries) {
    if (!isSearchPath(entry.path)) unique.set(entry.path, entry);
  }
  for (const path of collectTopicHubPaths()) {
    if (!unique.has(path)) unique.set(path, { path });
  }
  return [...unique.values()];
}

export async function collectSitemapPathEntries(): Promise<SitemapPathEntry[]> {
  const fromApi = await fetchSitemapEntries();
  if (fromApi.length > 0) {
    return mergeTopicHubPaths(
      fromApi
        .filter((entry) => !isSearchPath(entry.path))
        .map((entry) => ({
          path: entry.path,
          lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
        })),
    );
  }

  return mergeTopicHubPaths(await collectSitemapPathEntriesFallback());
}

async function collectSitemapPathEntriesFallback(): Promise<SitemapPathEntry[]> {
  let subjects: Awaited<ReturnType<typeof fetchSubjects>> = [];
  try {
    subjects = await fetchSubjects();
  } catch {
    subjects = [];
  }
  const validSubjects = subjects.filter((s) => isSubjectSlug(s.slug));

  const sectionsBySubject = new Map<SubjectSlug, SectionSummary[]>();
  const formulasBySubject = new Map<SubjectSlug, string[]>();
  await Promise.all(
    validSubjects.map(async (subjectMeta) => {
      const subject = subjectMeta.slug as SubjectSlug;
      try {
        const [sections, formulas] = await Promise.all([
          fetchSections(subject),
          fetchFormulaCodes(subject),
        ]);
        sectionsBySubject.set(subject, flattenSections(sections));
        formulasBySubject.set(subject, formulas);
      } catch {
        sectionsBySubject.set(subject, []);
        formulasBySubject.set(subject, []);
      }
    }),
  );

  const paths: SitemapPathEntry[] = STATIC_PATHS.map((path) => ({ path }));

  for (const subjectMeta of validSubjects) {
    const subject = subjectMeta.slug as SubjectSlug;
    paths.push({ path: `/${subject}` });
    if (subjectHasGuide(subject)) paths.push({ path: `/${subject}/guia` });
    for (const section of sectionsBySubject.get(subject) ?? []) {
      if (section.slug === 'lista-comprobacion') continue;
      paths.push({ path: sectionHref(subject, section.slug) });
    }
    for (const formulaId of formulasBySubject.get(subject) ?? []) {
      paths.push({ path: `/${subject}/formula/${formulaId}` });
    }
  }

  const unique = new Map<string, SitemapPathEntry>();
  for (const entry of paths) {
    if (!isSearchPath(entry.path)) unique.set(entry.path, entry);
  }
  return [...unique.values()];
}

export function sitemapContainsSearch(urls: string[]): string[] {
  return urls.filter((url) => /\/buscar(?:\/|$|\?)/.test(url));
}

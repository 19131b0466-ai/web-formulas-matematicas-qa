import { fetchFormulaCodes, fetchSections, fetchSubjects, flattenSections } from '@/lib/api';
import { isSearchPath } from '@/lib/seo';
import { isSubjectSlug, sectionHref, subjectHasGuide, type SubjectSlug } from '@/lib/subjects';
import type { SectionSummary } from '@repo/shared-types';

const STATIC_PATHS = ['/', '/acerca', '/contacto', '/resenas', '/privacidad', '/terminos'] as const;

/** Indexable public paths (locale prefix applied later). Excludes search. */
export async function collectIndexablePaths(): Promise<string[]> {
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

  const paths: string[] = [...STATIC_PATHS];

  for (const subjectMeta of validSubjects) {
    const subject = subjectMeta.slug as SubjectSlug;
    paths.push(`/${subject}`);
    if (subjectHasGuide(subject)) paths.push(`/${subject}/guia`);
    for (const section of sectionsBySubject.get(subject) ?? []) {
      if (section.slug === 'lista-comprobacion') continue;
      paths.push(sectionHref(subject, section.slug));
    }
    for (const formulaId of formulasBySubject.get(subject) ?? []) {
      paths.push(`/${subject}/formula/${formulaId}`);
    }
  }

  return [...new Set(paths)].filter((p) => !isSearchPath(p));
}

export function sitemapContainsSearch(urls: string[]): string[] {
  return urls.filter((url) => /\/buscar(?:\/|$|\?)/.test(url));
}

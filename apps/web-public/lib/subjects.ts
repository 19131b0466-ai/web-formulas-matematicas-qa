export const SUBJECT_SLUGS = ['calculo-ii', 'fisica-basica'] as const;
export type SubjectSlug = (typeof SUBJECT_SLUGS)[number];

export function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

export function subjectHomeHref(subject: SubjectSlug): string {
  return `/${subject}`;
}

export function sectionHref(subject: SubjectSlug, slug: string): string {
  if (slug.startsWith('apendice-')) {
    return `/${subject}/apendice/${slug}`;
  }
  return `/${subject}/seccion/${slug}`;
}

export function formulaHref(subject: SubjectSlug, formulaId: string): string {
  return `/${subject}/formula/${formulaId}`;
}

export function searchHref(subject: SubjectSlug): string {
  return `/${subject}/buscar`;
}

export function guideHref(subject: SubjectSlug): string {
  return `/${subject}/guia`;
}

export function subjectHasGuide(subject: SubjectSlug): boolean {
  return subject === 'calculo-ii';
}

export function subjectUsesFormulaCatalog(subject: SubjectSlug): boolean {
  return subject === 'fisica-basica';
}

export const SUBJECT_SLUGS = [
  'calculo-diferencial',
  'calculo-ii',
  'fisica-basica',
  'fisica-electronica',
  'algebra',
] as const;
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
  return (
    subject === 'calculo-diferencial' ||
    subject === 'calculo-ii' ||
    subject === 'fisica-basica' ||
    subject === 'fisica-electronica'
  );
}

/** Section slug that backs `/guia` for each subject. */
export function subjectGuideSectionSlug(subject: SubjectSlug): string {
  return subject === 'fisica-basica' || subject === 'fisica-electronica'
    ? 'guia-enfoque'
    : 'guia-metodos';
}

export function subjectUsesFormulaCatalog(subject: SubjectSlug): boolean {
  return (
    subject === 'calculo-diferencial' ||
    subject === 'fisica-basica' ||
    subject === 'fisica-electronica' ||
    subject === 'calculo-ii' ||
    subject === 'algebra'
  );
}

export function topicHubHref(subject: SubjectSlug, slug: string): string {
  return `/${subject}/temas/${slug}`;
}

export function topicsIndexHref(subject: SubjectSlug): string {
  return `/${subject}/temas`;
}

import type { SubjectSlug } from './subjects';

/** One formula page and its Open Graph image. */
export function formulaCacheTag(subject: SubjectSlug, formulaId: string): string {
  return `formula-${subject}-${formulaId.trim().toUpperCase()}`;
}

/** One section (or appendix) detail payload. */
export function sectionCacheTag(subject: SubjectSlug, slug: string): string {
  return `section-${subject}-${slug.trim()}`;
}

/**
 * Subject home, section tree, and every formula/section/guide fetch for that
 * subject. Invalidating it refreshes the catalog after a reseed.
 */
export function subjectCacheTag(subject: SubjectSlug): string {
  return `subject-${subject}`;
}

/** Method-selection guide for one subject. */
export function guideCacheTag(subject: SubjectSlug): string {
  return `guide-${subject}`;
}

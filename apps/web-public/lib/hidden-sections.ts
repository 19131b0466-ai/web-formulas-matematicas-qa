/** Catalog chapters kept in the markdown for authors, not shown on the public site. */
export const HIDDEN_PUBLIC_SECTION_SLUGS = new Set(['fronteras-materias']);

export function isHiddenPublicSectionSlug(slug: string): boolean {
  return HIDDEN_PUBLIC_SECTION_SLUGS.has(slug);
}

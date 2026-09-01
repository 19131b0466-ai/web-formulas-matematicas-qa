/**
 * ISR / Data Cache TTLs for the public site.
 *
 * Hobby includes 200k ISR Write Units / month. Short windows (60–600s) plus
 * 6 locales were regenerating catalog HTML continuously and approaching pause.
 * Formula/section copy is effectively static; prefer a day over minutes.
 */
export const CATALOG_REVALIDATE_SECONDS = 86_400;
export const HUB_REVALIDATE_SECONDS = 86_400;
export const REVIEWS_REVALIDATE_SECONDS = 3_600;

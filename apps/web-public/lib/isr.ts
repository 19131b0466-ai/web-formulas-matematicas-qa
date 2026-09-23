/**
 * ISR / Data Cache TTLs for the public site.
 *
 * Production (Hobby) uses a day-long window so catalog HTML is not rewritten
 * on every visit. The QA Vercel project must serve seed/i18n changes at once,
 * so it opts out of ISR and the fetch Data Cache.
 */
const PROD_CATALOG_REVALIDATE_SECONDS = 86_400;
const PROD_REVIEWS_REVALIDATE_SECONDS = 3_600;

export type IsrEnv = Record<string, string | undefined>;

function envNumber(env: IsrEnv, name: string): number | undefined {
  const raw = env[name]?.trim();
  if (raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** True for the secondary QA Vercel/GitHub project, or an explicit profile. */
export function isQaSite(env: IsrEnv = process.env): boolean {
  if (env.NEXT_PUBLIC_SITE_PROFILE === 'qa' || env.SITE_PROFILE === 'qa') return true;
  const repo = env.VERCEL_GIT_REPO_SLUG ?? '';
  const host = [
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.NEXT_PUBLIC_VERCEL_URL,
    env.VERCEL_URL,
    env.NEXT_PUBLIC_API_URL,
  ]
    .filter(Boolean)
    .join(' ');
  return repo.includes('web-formulas-matematicas-qa') || /web-formulas-qa/i.test(host);
}

export function catalogRevalidateSeconds(env: IsrEnv = process.env): number {
  return envNumber(env, 'CATALOG_REVALIDATE_SECONDS') ?? (isQaSite(env) ? 0 : PROD_CATALOG_REVALIDATE_SECONDS);
}

export function reviewsRevalidateSeconds(env: IsrEnv = process.env): number {
  return envNumber(env, 'REVIEWS_REVALIDATE_SECONDS') ?? (isQaSite(env) ? 0 : PROD_REVIEWS_REVALIDATE_SECONDS);
}

export const CATALOG_REVALIDATE_SECONDS = catalogRevalidateSeconds();
export const HUB_REVALIDATE_SECONDS = CATALOG_REVALIDATE_SECONDS;
export const REVIEWS_REVALIDATE_SECONDS = reviewsRevalidateSeconds();

/**
 * Next.js rejects imported identifiers in `export const revalidate`.
 * Pages keep numeric literals (86400 / 3600); QA opts out at request time
 * via `optIntoQaDynamicRender()` and `catalogFetchInit()`.
 */

export function catalogFetchInit(): { cache: 'no-store' } | { next: { revalidate: number } } {
  if (CATALOG_REVALIDATE_SECONDS === 0) return { cache: 'no-store' };
  return { next: { revalidate: CATALOG_REVALIDATE_SECONDS } };
}

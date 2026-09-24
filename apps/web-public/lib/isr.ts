/**
 * ISR / Data Cache TTLs for the public site.
 *
 * Production catalog HTML is persistent until `revalidateTag()`. QA renders
 * HTML per request via `connection()` and keeps a short Data Cache so
 * consecutive pages do not stampede the API. `catalogRevalidateSeconds()`
 * remains the numeric TTL (86400 in production) for feeds that are not
 * on-demand, such as the sitemap.
 */
const PROD_CATALOG_REVALIDATE_SECONDS = 86_400;
const PROD_REVIEWS_REVALIDATE_SECONDS = 3_600;
/** Short Data Cache on QA so crawls reuse nav/formula JSON without a 24h HTML ISR. */
export const QA_CATALOG_FETCH_REVALIDATE_SECONDS = 30;
export const QA_REVIEWS_FETCH_REVALIDATE_SECONDS = 30;

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
  return (
    envNumber(env, 'CATALOG_REVALIDATE_SECONDS') ??
    (isQaSite(env) ? QA_CATALOG_FETCH_REVALIDATE_SECONDS : PROD_CATALOG_REVALIDATE_SECONDS)
  );
}

export function reviewsRevalidateSeconds(env: IsrEnv = process.env): number {
  return (
    envNumber(env, 'REVIEWS_REVALIDATE_SECONDS') ??
    (isQaSite(env) ? QA_REVIEWS_FETCH_REVALIDATE_SECONDS : PROD_REVIEWS_REVALIDATE_SECONDS)
  );
}

export const CATALOG_REVALIDATE_SECONDS = catalogRevalidateSeconds();
export const HUB_REVALIDATE_SECONDS = CATALOG_REVALIDATE_SECONDS;
export const REVIEWS_REVALIDATE_SECONDS = reviewsRevalidateSeconds();

/**
 * Next.js rejects imported identifiers in `export const revalidate`.
 * Catalog pages use the literal `false`. QA HTML stays dynamic via
 * `connection()`.
 */
export function catalogFetchInit(
  tags?: string[],
  env: IsrEnv = process.env,
): { cache: 'no-store' } | { next: { revalidate: number | false; tags?: string[] } } {
  const seconds = catalogRevalidateSeconds(env);
  if (seconds === 0) return { cache: 'no-store' };
  const explicit = envNumber(env, 'CATALOG_REVALIDATE_SECONDS');
  // Production catalog stays cached until revalidateTag(). QA and an explicit
  // CATALOG_REVALIDATE_SECONDS keep a numeric Data Cache TTL.
  const revalidate: number | false = isQaSite(env) || explicit !== undefined ? seconds : false;
  const next: { revalidate: number | false; tags?: string[] } = { revalidate };
  if (tags && tags.length > 0) next.tags = tags;
  return { next };
}

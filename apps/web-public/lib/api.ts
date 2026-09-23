import { cache } from 'react';
import type {
  FormulaDetailResponse,
  MethodGuideResponse,
  PublicReviewsResponse,
  SearchResponse,
  SectionDetailResponse,
  SectionSummary,
  SitemapEntriesResponse,
  SubjectSummary,
  TagsResponse,
} from '@repo/shared-types';
import type { SubjectSlug } from './subjects';
import { sectionHref as subjectSectionHref } from './subjects';
import { isHiddenPublicSectionSlug } from './hidden-sections';
import { CATALOG_REVALIDATE_SECONDS, catalogFetchInit, REVIEWS_REVALIDATE_SECONDS } from './isr';

const LOCAL_API = 'http://localhost:3001/v1';
/** Fallback used on Vercel when NEXT_PUBLIC_API_URL is missing/mis-set to localhost. */
const VERCEL_API = 'https://web-formulas-matematicas-api.vercel.app/v1';
const RUNTIME_FETCH_TIMEOUT_MS = 15_000;
const BUILD_FETCH_TIMEOUT_MS = 4_000;

function getFetchTimeoutMs(): number {
  return process.env.NEXT_PHASE === 'phase-production-build'
    ? BUILD_FETCH_TIMEOUT_MS
    : RUNTIME_FETCH_TIMEOUT_MS;
}

/** Thrown when the upstream API is unreachable/slow — must NOT be treated as a 404. */
export class ApiUnavailableError extends Error {
  readonly status: number | null;
  constructor(path: string, status: number | null, cause?: unknown) {
    super(
      status
        ? `API ${path} failed with ${String(status)}`
        : `API ${path} unavailable (timeout or network)`,
    );
    this.name = 'ApiUnavailableError';
    this.status = status;
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

/** Always-available catalog so the hub never renders empty if the API flakes. */
const FALLBACK_SUBJECTS: SubjectSummary[] = [
  {
    slug: 'calculo-diferencial',
    title: 'Cálculo Diferencial',
    description: 'Límites, continuidad, derivadas y aplicaciones',
    sortOrder: 0,
  },
  {
    slug: 'calculo-ii',
    title: 'Cálculo II',
    description: 'Cálculo Integral — fórmulas, métodos y aplicaciones',
    sortOrder: 1,
  },
  {
    slug: 'fisica-basica',
    title: 'Física Básica',
    description: 'Fórmulas de Física General universitaria',
    sortOrder: 2,
  },
  {
    slug: 'fisica-electronica',
    title: 'Física Electrónica',
    description: 'Circuitos, semiconductores, amplificadores y electrónica digital',
    sortOrder: 3,
  },
  {
    slug: 'algebra',
    title: 'Álgebra',
    description: 'Álgebra para Ingeniería y Ciencias de la Computación',
    sortOrder: 4,
  },
];

function normalizeApiBase(url: string): string {
  return url.replace(/\/+$/, '');
}

function isVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV);
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    const normalized = normalizeApiBase(configured);
    // Guard against a leftover local URL on Vercel builds/SSR.
    if (isVercelRuntime() && /localhost|127\.0\.0\.1/.test(normalized)) {
      return VERCEL_API;
    }
    return normalized;
  }
  if (isVercelRuntime()) return VERCEL_API;
  return LOCAL_API;
}

type CatalogFetchInit = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

async function apiFetch<T>(path: string, init?: CatalogFetchInit): Promise<T | null> {
  const url = `${getApiBaseUrl()}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getFetchTimeoutMs());
  const { next, headers, ...restInit } = init ?? {};
  const cacheInit =
    CATALOG_REVALIDATE_SECONDS === 0
      ? { cache: 'no-store' as const }
      : next
        ? { next }
        : catalogFetchInit();
  try {
    const res = await fetch(url, {
      ...restInit,
      ...cacheInit,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      throw new ApiUnavailableError(path, res.status);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    // AbortError / network / DNS — treat as unavailable, not missing content.
    throw new ApiUnavailableError(path, null, err);
  } finally {
    clearTimeout(timer);
  }
}

export const fetchSubjects = cache(async (): Promise<SubjectSummary[]> => {
  try {
    const data = await apiFetch<{ subjects: SubjectSummary[] }>('/subjects', {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    });
    if (!data) return FALLBACK_SUBJECTS;
    return data.subjects.length > 0 ? data.subjects : FALLBACK_SUBJECTS;
  } catch (err) {
    console.error('[fetchSubjects]', getApiBaseUrl(), err);
    return FALLBACK_SUBJECTS;
  }
});

export const fetchSections = cache(
  async (subject: SubjectSlug = 'calculo-ii'): Promise<SectionSummary[]> => {
    try {
      const data = await apiFetch<{ sections: SectionSummary[] }>(
        `/subjects/${encodeURIComponent(subject)}/sections`,
        { next: { revalidate: CATALOG_REVALIDATE_SECONDS } },
      );
      return (data?.sections ?? []).filter((section) => !isHiddenPublicSectionSlug(section.slug));
    } catch (err) {
      console.error('[fetchSections]', subject, getApiBaseUrl(), err);
      return [];
    }
  },
);

export const fetchSection = cache(
  async (
    slug: string,
    subject: SubjectSlug = 'calculo-ii',
  ): Promise<SectionDetailResponse | null> => {
    // Propagates ApiUnavailableError; returns null only for true 404.
    if (isHiddenPublicSectionSlug(slug)) return null;
    return apiFetch<SectionDetailResponse>(
      `/subjects/${encodeURIComponent(subject)}/sections/${encodeURIComponent(slug)}`,
      { next: { revalidate: CATALOG_REVALIDATE_SECONDS } },
    );
  },
);

export const fetchFormulaCodes = cache(async (subject: SubjectSlug): Promise<string[]> => {
  try {
    const data = await apiFetch<{ formulas: string[] }>(
      `/subjects/${encodeURIComponent(subject)}/formulas`,
      { next: { revalidate: CATALOG_REVALIDATE_SECONDS } },
    );
    return data?.formulas ?? [];
  } catch {
    return [];
  }
});

export const fetchSitemapEntries = cache(async (): Promise<SitemapEntriesResponse['entries']> => {
  try {
    const data = await apiFetch<SitemapEntriesResponse>('/sitemap/entries', {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    });
    return data?.entries ?? [];
  } catch {
    return [];
  }
});

export const fetchFormula = cache(
  async (
    subject: SubjectSlug,
    formulaId: string,
  ): Promise<FormulaDetailResponse | null> => {
    // Propagates ApiUnavailableError; returns null only for true 404.
    return apiFetch<FormulaDetailResponse>(
      `/subjects/${encodeURIComponent(subject)}/formulas/${encodeURIComponent(formulaId)}`,
      {
        next: {
          revalidate: CATALOG_REVALIDATE_SECONDS,
          tags: ['formulas', `formula-${subject}-${formulaId.trim().toUpperCase()}`],
        },
      },
    );
  },
);

export async function fetchSearch(params: {
  subject?: SubjectSlug;
  q?: string;
  tags?: string;
  limit?: number;
}): Promise<SearchResponse> {
  const subject = params.subject ?? 'calculo-ii';
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.tags) sp.set('tags', params.tags);
  if (params.limit) sp.set('limit', String(params.limit));
  const url = `${getApiBaseUrl()}/subjects/${encodeURIComponent(subject)}/search?${sp.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getFetchTimeoutMs());
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (res.status === 404) {
      return { results: [], total: 0, query: params.q ?? '' };
    }
    if (!res.ok) {
      throw new ApiUnavailableError(`/subjects/.../search`, res.status);
    }
    return res.json() as Promise<SearchResponse>;
  } catch (err) {
    if (err instanceof ApiUnavailableError) throw err;
    throw new ApiUnavailableError(`/subjects/.../search`, null, err);
  } finally {
    clearTimeout(timer);
  }
}

export const fetchTags = cache(async (subject: SubjectSlug = 'calculo-ii'): Promise<TagsResponse> => {
  try {
    const data = await apiFetch<TagsResponse>(`/subjects/${encodeURIComponent(subject)}/tags`, {
      next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    });
    return data ?? { tags: [] };
  } catch {
    return { tags: [] };
  }
});

export const fetchMethodGuide = cache(
  async (subject: SubjectSlug = 'calculo-ii'): Promise<MethodGuideResponse> => {
    try {
      const qs = new URLSearchParams({ subject });
      const data = await apiFetch<MethodGuideResponse>(`/guide/method-selection?${qs.toString()}`, {
        next: { revalidate: CATALOG_REVALIDATE_SECONDS },
      });
      return data ?? { strategies: [], checklist: [] };
    } catch {
      return { strategies: [], checklist: [] };
    }
  },
);

const EMPTY_REVIEWS: PublicReviewsResponse = { reviews: [], averageRating: null, count: 0 };

export const fetchPublicReviews = cache(async (): Promise<PublicReviewsResponse> => {
  try {
    const data = await apiFetch<PublicReviewsResponse>('/reviews', {
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
    });
    return data ?? EMPTY_REVIEWS;
  } catch (err) {
    console.error('[fetchPublicReviews]', getApiBaseUrl(), err);
    return EMPTY_REVIEWS;
  }
});

export function flattenSections(sections: SectionSummary[]): SectionSummary[] {
  const out: SectionSummary[] = [];
  for (const s of sections) {
    out.push(s);
    if (s.children?.length) out.push(...flattenSections(s.children));
  }
  return out;
}

export function isAppendixSlug(slug: string): boolean {
  return slug.startsWith('apendice-');
}

/** Subject-first href helper (same signature as `@/lib/subjects`). */
export function sectionHref(subject: SubjectSlug, slug: string): string {
  return subjectSectionHref(subject, slug);
}

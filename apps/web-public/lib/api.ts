import { cache } from 'react';
import type {
  FormulaDetailResponse,
  MethodGuideResponse,
  SearchResponse,
  SectionDetailResponse,
  SectionSummary,
  SubjectSummary,
  TagsResponse,
} from '@repo/shared-types';
import type { SubjectSlug } from './subjects';
import { sectionHref as subjectSectionHref } from './subjects';

const LOCAL_API = 'http://localhost:3001/v1';
/** Fallback used on Vercel when NEXT_PUBLIC_API_URL is missing/mis-set to localhost. */
const VERCEL_API = 'https://web-formulas-matematicas-api.vercel.app/v1';
const FETCH_TIMEOUT_MS = 10_000;
/** Always-available catalog so the hub never renders empty if the API flakes. */
const FALLBACK_SUBJECTS: SubjectSummary[] = [
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
    slug: 'algebra',
    title: 'Álgebra',
    description: 'Álgebra para Ingeniería y Ciencias de la Computación',
    sortOrder: 3,
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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...init?.headers,
      },
      next: init?.next ?? { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`API ${path} failed with ${String(res.status)}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchSubjects = cache(async (): Promise<SubjectSummary[]> => {
  try {
    const data = await apiFetch<{ subjects: SubjectSummary[] }>('/subjects', {
      next: { revalidate: 300 },
    });
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
        { next: { revalidate: 300 } },
      );
      return data.sections;
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
    try {
      return await apiFetch<SectionDetailResponse>(
        `/subjects/${encodeURIComponent(subject)}/sections/${encodeURIComponent(slug)}`,
        { next: { revalidate: 600 } },
      );
    } catch {
      return null;
    }
  },
);

export const fetchFormula = cache(
  async (
    subject: SubjectSlug,
    formulaId: string,
  ): Promise<FormulaDetailResponse | null> => {
    try {
      return await apiFetch<FormulaDetailResponse>(
        `/subjects/${encodeURIComponent(subject)}/formulas/${encodeURIComponent(formulaId)}`,
        { next: { revalidate: 600 } },
      );
    } catch {
      return null;
    }
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
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API /search failed with ${String(res.status)}`);
    }
    return res.json() as Promise<SearchResponse>;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchTags = cache(async (subject: SubjectSlug = 'calculo-ii'): Promise<TagsResponse> => {
  try {
    return await apiFetch<TagsResponse>(`/subjects/${encodeURIComponent(subject)}/tags`, {
      next: { revalidate: 600 },
    });
  } catch {
    return { tags: [] };
  }
});

export const fetchMethodGuide = cache(
  async (subject: SubjectSlug = 'calculo-ii'): Promise<MethodGuideResponse> => {
    try {
      const qs = new URLSearchParams({ subject });
      return await apiFetch<MethodGuideResponse>(`/guide/method-selection?${qs.toString()}`, {
        next: { revalidate: 600 },
      });
    } catch {
      return { strategies: [], checklist: [] };
    }
  },
);

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

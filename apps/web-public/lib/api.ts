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

function normalizeApiBase(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    const normalized = normalizeApiBase(configured);
    // Guard against a leftover local URL on Vercel builds/SSR.
    if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(normalized)) {
      return VERCEL_API;
    }
    return normalized;
  }
  if (process.env.VERCEL) return VERCEL_API;
  return LOCAL_API;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    next: init?.cache === 'no-store' ? undefined : (init?.next ?? { revalidate: 300 }),
  });

  if (!res.ok) {
    throw new Error(`API ${path} failed with ${String(res.status)}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchSubjects(): Promise<SubjectSummary[]> {
  try {
    const data = await apiFetch<{ subjects: SubjectSummary[] }>('/subjects', {
      cache: 'no-store',
    });
    return data.subjects;
  } catch (err) {
    console.error('[fetchSubjects]', getApiBaseUrl(), err);
    return [];
  }
}

export async function fetchSections(subject: SubjectSlug = 'calculo-ii'): Promise<SectionSummary[]> {
  try {
    const data = await apiFetch<{ sections: SectionSummary[] }>(
      `/subjects/${encodeURIComponent(subject)}/sections`,
      { cache: 'no-store' },
    );
    return data.sections;
  } catch (err) {
    console.error('[fetchSections]', subject, getApiBaseUrl(), err);
    return [];
  }
}

export async function fetchSection(
  slug: string,
  subject: SubjectSlug = 'calculo-ii',
): Promise<SectionDetailResponse | null> {
  try {
    return await apiFetch<SectionDetailResponse>(
      `/subjects/${encodeURIComponent(subject)}/sections/${encodeURIComponent(slug)}`,
    );
  } catch {
    return null;
  }
}

export async function fetchFormula(
  subject: SubjectSlug,
  formulaId: string,
): Promise<FormulaDetailResponse | null> {
  try {
    return await apiFetch<FormulaDetailResponse>(
      `/subjects/${encodeURIComponent(subject)}/formulas/${encodeURIComponent(formulaId)}`,
    );
  } catch {
    return null;
  }
}

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
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API /search failed with ${String(res.status)}`);
  }
  return res.json() as Promise<SearchResponse>;
}

export async function fetchTags(subject: SubjectSlug = 'calculo-ii'): Promise<TagsResponse> {
  try {
    return await apiFetch<TagsResponse>(`/subjects/${encodeURIComponent(subject)}/tags`);
  } catch {
    return { tags: [] };
  }
}

export async function fetchMethodGuide(): Promise<MethodGuideResponse> {
  try {
    return await apiFetch<MethodGuideResponse>('/guide/method-selection');
  } catch {
    return { strategies: [], checklist: [] };
  }
}

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

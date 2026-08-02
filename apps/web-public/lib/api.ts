import type {
  MethodGuideResponse,
  SearchResponse,
  SectionDetailResponse,
  SectionSummary,
  TagsResponse,
} from '@repo/shared-types';

const DEFAULT_API = 'http://localhost:3001/v1';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`API ${path} failed with ${String(res.status)}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchSections(): Promise<SectionSummary[]> {
  try {
    const data = await apiFetch<{ sections: SectionSummary[] }>('/sections');
    return data.sections;
  } catch {
    return [];
  }
}

export async function fetchSection(slug: string): Promise<SectionDetailResponse | null> {
  try {
    return await apiFetch<SectionDetailResponse>(`/sections/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function fetchSearch(params: {
  q?: string;
  tags?: string;
  limit?: number;
}): Promise<SearchResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.tags) sp.set('tags', params.tags);
  if (params.limit) sp.set('limit', String(params.limit));
  const url = `${getApiBaseUrl()}/search?${sp.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`API /search failed with ${String(res.status)}`);
  }
  return res.json() as Promise<SearchResponse>;
}

export async function fetchTags(): Promise<TagsResponse> {
  try {
    return await apiFetch<TagsResponse>('/tags');
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

export function sectionHref(slug: string): string {
  return isAppendixSlug(slug) ? `/apendice/${slug}` : `/seccion/${slug}`;
}

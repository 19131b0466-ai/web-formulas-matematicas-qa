import type {
  AdminReviewsResponse,
  AnalyticsOverview,
  AuthTokenResponse,
  BotsAnalytics,
  GeoCityCount,
  GeoCountryCount,
  NamedCount,
  RpmStats,
  TimeseriesPoint,
  TrafficAudience,
  VisitLogAdminDto,
} from '@repo/shared-types';

const API = () => process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

const ACCESS_KEY = 'admin_access_token';
const REFRESH_KEY = 'admin_refresh_token';
const USER_KEY = 'admin_user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser(): { id: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as { id: string; email: string; role: string }) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistAuth(tokens: AuthTokenResponse): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
}

export async function login(email: string, password: string): Promise<AuthTokenResponse> {
  const res = await fetch(`${API()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Login failed');
  }
  const tokens = (await res.json()) as AuthTokenResponse;
  persistAuth(tokens);
  return tokens;
}

export async function refreshAuth(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;
  const res = await fetch(`${API()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearAuth();
    return false;
  }
  const tokens = (await res.json()) as AuthTokenResponse;
  persistAuth(tokens);
  return true;
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error('Unauthorized');

  const doFetch = (access: string) =>
    fetch(`${API()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${access}`,
        ...init?.headers,
      },
      cache: 'no-store',
    });

  let res = await doFetch(token);
  if (res.status === 401) {
    const ok = await refreshAuth();
    if (!ok) throw new Error('Unauthorized');
    const next = getAccessToken();
    if (!next) throw new Error('Unauthorized');
    res = await doFetch(next);
  }

  if (!res.ok) {
    throw new Error(`API ${path} failed (${String(res.status)})`);
  }

  if (res.headers.get('content-type')?.includes('text/csv')) {
    return (await res.text()) as T;
  }

  return res.json() as Promise<T>;
}

function rangeParams(
  from?: string,
  to?: string,
  extra?: Record<string, string | undefined>,
): string {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) sp.set(key, value);
    }
  }
  return sp.toString();
}

export function fetchOverview() {
  return adminFetch<AnalyticsOverview>('/admin/analytics/overview');
}

export function fetchTimeseries(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ points: TimeseriesPoint[] }>(
    `/admin/analytics/timeseries?${rangeParams(from, to, { audience })}`,
  );
}

export function fetchGeo(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ countries: GeoCountryCount[]; cities: GeoCityCount[] }>(
    `/admin/analytics/geo?${rangeParams(from, to, { audience })}`,
  );
}

export function fetchPages(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ pages: NamedCount[] }>(
    `/admin/analytics/pages?${rangeParams(from, to, { audience, limit: '20' })}`,
  );
}

export function fetchSubjectsAnalytics(
  from?: string,
  to?: string,
  audience: TrafficAudience = 'human',
) {
  return adminFetch<{ subjects: NamedCount[] }>(
    `/admin/analytics/subjects?${rangeParams(from, to, { audience, limit: '20' })}`,
  );
}

export function fetchReferrers(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ referrers: NamedCount[] }>(
    `/admin/analytics/referrers?${rangeParams(from, to, { audience })}`,
  );
}

export function fetchDevices(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ devices: NamedCount[]; browsers: NamedCount[]; os: NamedCount[] }>(
    `/admin/analytics/devices?${rangeParams(from, to, { audience })}`,
  );
}

export function fetchLanguages(from?: string, to?: string, audience: TrafficAudience = 'human') {
  return adminFetch<{ languages: NamedCount[] }>(
    `/admin/analytics/languages?${rangeParams(from, to, { audience })}`,
  );
}

export function fetchRecent(limit = 50, audience: TrafficAudience = 'all') {
  return adminFetch<{ visits: VisitLogAdminDto[] }>(
    `/admin/analytics/recent?limit=${String(limit)}&audience=${audience}`,
  );
}

export function fetchBotsAnalytics(from?: string, to?: string) {
  return adminFetch<BotsAnalytics>(`/admin/analytics/bots?${rangeParams(from, to)}`);
}

export function fetchRpm(from?: string, to?: string, audience: TrafficAudience = 'all') {
  return adminFetch<RpmStats>(`/admin/analytics/rpm?${rangeParams(from, to, { audience })}`);
}

export function fetchAdminReviews(status?: 'pending' | 'approved' | 'rejected') {
  const sp = new URLSearchParams();
  if (status) sp.set('status', status);
  const q = sp.toString();
  return adminFetch<AdminReviewsResponse>(`/admin/reviews${q ? `?${q}` : ''}`);
}

export function moderateReview(id: string, status: 'pending' | 'approved' | 'rejected') {
  return adminFetch<{ ok: true }>(`/admin/reviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminReview(id: string) {
  return adminFetch<{ ok: true }>(`/admin/reviews/${id}`, { method: 'DELETE' });
}

export async function downloadExportCsv(
  from?: string,
  to?: string,
  audience: TrafficAudience = 'all',
  format: 'csv' | 'json' = 'csv',
): Promise<void> {
  const sp = new URLSearchParams({ format, audience });
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  const token = getAccessToken();
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API()}/admin/analytics/export?${sp}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = format === 'json' ? 'visit-logs.json' : 'visit-logs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

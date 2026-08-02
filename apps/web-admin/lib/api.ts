import type {
  AnalyticsOverview,
  AuthTokenResponse,
  GeoCityCount,
  GeoCountryCount,
  NamedCount,
  TimeseriesPoint,
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

export function fetchOverview() {
  return adminFetch<AnalyticsOverview>('/admin/analytics/overview');
}

export function fetchTimeseries(from?: string, to?: string) {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ points: TimeseriesPoint[] }>(`/admin/analytics/timeseries?${sp}`);
}

export function fetchGeo(from?: string, to?: string) {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ countries: GeoCountryCount[]; cities: GeoCityCount[] }>(
    `/admin/analytics/geo?${sp}`,
  );
}

export function fetchPages(from?: string, to?: string) {
  const sp = new URLSearchParams({ limit: '20' });
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ pages: NamedCount[] }>(`/admin/analytics/pages?${sp}`);
}

export function fetchReferrers(from?: string, to?: string) {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ referrers: NamedCount[] }>(`/admin/analytics/referrers?${sp}`);
}

export function fetchDevices(from?: string, to?: string) {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ devices: NamedCount[]; browsers: NamedCount[]; os: NamedCount[] }>(
    `/admin/analytics/devices?${sp}`,
  );
}

export function fetchLanguages(from?: string, to?: string) {
  const sp = new URLSearchParams();
  if (from) sp.set('from', from);
  if (to) sp.set('to', to);
  return adminFetch<{ languages: NamedCount[] }>(`/admin/analytics/languages?${sp}`);
}

export function fetchRecent(limit = 50) {
  return adminFetch<{ visits: VisitLogAdminDto[] }>(
    `/admin/analytics/recent?limit=${String(limit)}`,
  );
}

export async function downloadExportCsv(from?: string, to?: string): Promise<void> {
  const sp = new URLSearchParams({ format: 'csv' });
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
  a.download = 'visit-logs.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

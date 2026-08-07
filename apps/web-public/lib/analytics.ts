import type { TrackVisitRequest, TrackVisitResponse } from '@repo/shared-types';

const SESSION_KEY = 'formulas_session_id';
const DEDUPE_KEY = 'formulas_visit_dedupe';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;
const PRODUCTION_API = 'https://web-formulas-matematicas-api.vercel.app/v1';

type DedupeMap = Record<string, number>;

function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    const normalized = configured.replace(/\/+$/, '');
    const isLocal = /localhost|127\.0\.0\.1/.test(normalized);
    const onVercelHost =
      typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
    if (isLocal && (process.env.VERCEL || onVercelHost)) {
      return PRODUCTION_API;
    }
    return normalized;
  }
  if (process.env.VERCEL) return PRODUCTION_API;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
    return PRODUCTION_API;
  }
  return 'http://localhost:3001/v1';
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateSessionId(): string {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; createdAt: number };
      if (parsed.id && Date.now() - parsed.createdAt < SESSION_TTL_MS) {
        return parsed.id;
      }
    }
  } catch {
    // ignore
  }

  const id = uuid();
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, createdAt: Date.now() }));
  } catch {
    // ignore
  }
  return id;
}

function shouldSkipClientDedupe(path: string): boolean {
  try {
    const raw = sessionStorage.getItem(DEDUPE_KEY);
    const map = (raw ? JSON.parse(raw) : {}) as DedupeMap;
    const last = map[path];
    if (last && Date.now() - last < DEDUPE_WINDOW_MS) return true;
    map[path] = Date.now();
    sessionStorage.setItem(DEDUPE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
  return false;
}

export type TrackVisitOptions = {
  path: string;
  sectionSlug?: string | null;
  subjectSlug?: string | null;
  searchQuery?: string | null;
  queryString?: string | null;
  force?: boolean;
};

/**
 * Envía evento de visita al backend. Nunca lee ni transmite IP.
 *
 * Nota: no usamos sendBeacon con application/json en cross-origin — el preflight
 * CORS suele fallar en silencio y sendBeacon igual retorna true.
 */
export function trackVisit(options: TrackVisitOptions): void {
  if (typeof window === 'undefined') return;
  if (!options.force && shouldSkipClientDedupe(options.path)) return;

  const payload: TrackVisitRequest = {
    sessionId: getOrCreateSessionId(),
    path: options.path,
    referer: document.referrer || null,
    acceptLanguage: navigator.language || null,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    sectionSlug: options.sectionSlug ?? null,
    subjectSlug: options.subjectSlug ?? null,
    searchQuery: options.searchQuery ?? null,
    queryString: options.queryString ?? null,
  };

  // Defensa: nunca adjuntar campos de IP aunque exista en el entorno
  const unsafe = payload as TrackVisitRequest & { ip?: unknown; ipAddress?: unknown };
  delete unsafe.ip;
  delete unsafe.ipAddress;

  const url = `${apiBase()}/analytics/visit`;
  const body = JSON.stringify(payload);

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body,
    keepalive: true,
    mode: 'cors',
  })
    .then(async (res) => {
      if (!res.ok) return;
      const data = (await res.json()) as TrackVisitResponse;
      if ('ipAddress' in (data as object) || 'ip' in (data as object)) {
        console.warn('[analytics] unexpected IP field in response — ignored');
      }
    })
    .catch(() => {
      // silent — analytics must not break UX
    });
}

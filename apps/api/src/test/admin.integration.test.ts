import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { recordVisit } from '../services/analytics.js';
import { createTestDb, type TestDatabase } from './setup-db.js';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'test-password-123';

describe('Admin auth + analytics (PGlite)', () => {
  let db: TestDatabase;
  let client: Awaited<ReturnType<typeof createTestDb>>['client'];
  let app: ReturnType<typeof createApp>;
  let accessToken = '';

  beforeAll(async () => {
    process.env.JWT_SECRET = 'phase4-test-secret';
    process.env.ADMIN_EMAIL = ADMIN_EMAIL;
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    const setup = await createTestDb();
    db = setup.db;
    client = setup.client;
    app = createApp(() => db as never);

    // Seed a few visits
    const headers = new Headers({
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'x-forwarded-for': '190.10.20.30',
      'x-vercel-ip-country': 'PE',
      'x-vercel-ip-city': 'Lima',
    });

    await recordVisit(
      db as never,
      {
        sessionId: '22222222-2222-4222-8222-222222222222',
        path: '/seccion/integracion-por-partes',
        sectionSlug: 'integracion-por-partes',
        acceptLanguage: 'es-PE',
      },
      headers,
    );
    await recordVisit(
      db as never,
      {
        sessionId: '33333333-3333-4333-8333-333333333333',
        path: '/guia',
        acceptLanguage: 'es',
      },
      headers,
    );
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it('rejects admin endpoints without token', async () => {
    const res = await app.request('/v1/admin/analytics/overview');
    expect(res.status).toBe(401);
  });

  it('logs in with local admin credentials', async () => {
    const res = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      user: { email: string };
    };
    expect(body.accessToken).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.user.email).toBe(ADMIN_EMAIL);
    accessToken = body.accessToken;
  });

  it('refreshes access token', async () => {
    const loginRes = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const loginBody = (await loginRes.json()) as { refreshToken: string };

    const res = await app.request('/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginBody.refreshToken }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { accessToken: string };
    expect(body.accessToken).toBeTruthy();
  });

  it('serves overview and recent without IP fields', async () => {
    const overviewRes = await app.request('/v1/admin/analytics/overview', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(overviewRes.status).toBe(200);
    const overview = (await overviewRes.json()) as Record<string, unknown>;
    expect(overview.totalVisits).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(overview)).not.toMatch(/190\.10\.20\.30/);
    expect(overview).not.toHaveProperty('ipAddress');

    const recentRes = await app.request('/v1/admin/analytics/recent?limit=10', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(recentRes.status).toBe(200);
    const recent = (await recentRes.json()) as { visits: Array<Record<string, unknown>> };
    expect(recent.visits.length).toBeGreaterThan(0);
    for (const v of recent.visits) {
      expect(v).not.toHaveProperty('ipAddress');
      expect(v).not.toHaveProperty('ip');
    }
  });

  it('exports CSV without ip column', async () => {
    const res = await app.request('/v1/admin/analytics/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status).toBe(200);
    const csv = await res.text();
    const header = csv.split('\n')[0] ?? '';
    expect(header.split(',')).not.toContain('ipAddress');
    expect(header.split(',')).not.toContain('ip_address');
    expect(csv).not.toContain('190.10.20.30');
  });

  it('returns timeseries and geo aggregates', async () => {
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    const to = new Date().toISOString();

    const ts = await app.request(
      `/v1/admin/analytics/timeseries?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    expect(ts.status).toBe(200);
    const tsBody = (await ts.json()) as { points: unknown[] };
    expect(Array.isArray(tsBody.points)).toBe(true);

    const geo = await app.request(
      `/v1/admin/analytics/geo?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    expect(geo.status).toBe(200);
    const geoBody = (await geo.json()) as { countries: Array<{ countryCode: string | null }> };
    expect(geoBody.countries.some((c) => c.countryCode === 'PE')).toBe(true);
  });
});

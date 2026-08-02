import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.js';
import { visitLogs } from '../db/schema.js';
import {
  assertNoIpFields,
  listRecentVisitsAdmin,
  visitsToCsv,
  VISIT_CSV_COLUMNS,
} from '../services/analytics.js';
import { createTestDb, type TestDatabase } from './setup-db.js';

const SESSION = '11111111-1111-4111-8111-111111111111';

function visitBody(overrides: Record<string, unknown> = {}) {
  return {
    sessionId: SESSION,
    path: '/seccion/integracion-por-partes',
    referer: 'https://www.google.com/',
    acceptLanguage: 'es-PE,es;q=0.9',
    screen: { width: 1440, height: 900 },
    sectionSlug: 'integracion-por-partes',
    searchQuery: null,
    ...overrides,
  };
}

describe('Analytics visit tracking (PGlite)', () => {
  let db: TestDatabase;
  let client: Awaited<ReturnType<typeof createTestDb>>['client'];
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const setup = await createTestDb();
    db = setup.db;
    client = setup.client;
    app = createApp(() => db as never);
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it('POST /v1/analytics/visit stores geo/UA and returns ok without IP', async () => {
    const res = await app.request('/v1/analytics/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-forwarded-for': '200.1.2.3',
        'x-vercel-ip-country': 'PE',
        'x-vercel-ip-city': 'Lima',
        'x-vercel-ip-country-region': 'LIM',
        'x-vercel-ip-timezone': 'America/Lima',
        'x-vercel-ip-latitude': '-12.0464',
        'x-vercel-ip-longitude': '-77.0428',
      },
      body: JSON.stringify(visitBody({ path: '/guia' })),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(body).not.toHaveProperty('ipAddress');
    expect(body).not.toHaveProperty('ip');
    expect(JSON.stringify(body)).not.toMatch(/200\.1\.2\.3/);

    const recent = await listRecentVisitsAdmin(db as never, 5);
    expect(recent.length).toBeGreaterThan(0);
    const visit = recent.find((v) => v.path === '/guia');
    expect(visit).toBeDefined();
    expect(visit?.countryCode).toBe('PE');
    expect(visit?.city).toBe('Lima');
    expect(visit?.deviceType).toBe('desktop');
    expect(visit?.browser).toMatch(/Chrome/i);
    expect(visit?.primaryLanguage).toBe('es-PE');
    assertNoIpFields(visit);
    expect(visit).not.toHaveProperty('ipAddress');
  });

  it('deduplicates same session+path within 30 minutes', async () => {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'x-forwarded-for': '10.0.0.8',
    };

    const first = await app.request('/v1/analytics/visit', {
      method: 'POST',
      headers,
      body: JSON.stringify(visitBody({ path: '/buscar', searchQuery: 'taylor' })),
    });
    expect(first.status).toBe(200);
    expect(((await first.json()) as { deduplicated?: boolean }).deduplicated).toBeUndefined();

    const second = await app.request('/v1/analytics/visit', {
      method: 'POST',
      headers,
      body: JSON.stringify(visitBody({ path: '/buscar', searchQuery: 'taylor' })),
    });
    expect(second.status).toBe(200);
    const body = (await second.json()) as { ok: boolean; deduplicated?: boolean };
    expect(body.ok).toBe(true);
    expect(body.deduplicated).toBe(true);
  });

  it('rejects client-supplied IP fields', async () => {
    const res = await app.request('/v1/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...visitBody({ path: '/evil' }),
        ipAddress: '8.8.8.8',
      }),
    });
    expect(res.status).toBe(400);
  });

  it('admin DTO and CSV never include ip_address column', async () => {
    const recent = await listRecentVisitsAdmin(db as never, 20);
    expect(recent.length).toBeGreaterThan(0);
    assertNoIpFields(recent);
    for (const dto of recent) {
      expect(Object.keys(dto)).not.toContain('ipAddress');
      expect(Object.keys(dto)).not.toContain('ip_address');
      expect(Object.keys(dto)).not.toContain('ip');
    }

    expect(VISIT_CSV_COLUMNS).not.toContain('ipAddress');
    expect(VISIT_CSV_COLUMNS).not.toContain('ip_address');
    const csv = visitsToCsv(recent);
    const header = csv.split('\n')[0] ?? '';
    expect(header.split(',')).not.toContain('ipAddress');
    expect(header.split(',')).not.toContain('ip_address');
    expect(csv).not.toContain('200.1.2.3');
  });

  it('GET /v1/cron/purge-visits deletes logs older than 12 months', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400);

    await db.insert(visitLogs).values({
      id: '22222222-2222-4222-8222-222222222222',
      sessionId: SESSION,
      ipAddress: '127.0.0.1',
      path: '/old',
      visitedAt: oldDate,
    });

    const res = await app.request('/v1/cron/purge-visits');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; deleted: number };
    expect(body.ok).toBe(true);
    expect(body.deleted).toBeGreaterThanOrEqual(1);

    const remaining = await db.select({ id: visitLogs.id }).from(visitLogs).where(eq(visitLogs.path, '/old'));
    expect(remaining.length).toBe(0);
  });

  it('rejects cron purge when CRON_SECRET mismatches', async () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'expected-secret';
    try {
      const res = await app.request('/v1/cron/purge-visits', {
        headers: { Authorization: 'Bearer wrong' },
      });
      expect(res.status).toBe(401);
    } finally {
      if (prev === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = prev;
    }
  });
});

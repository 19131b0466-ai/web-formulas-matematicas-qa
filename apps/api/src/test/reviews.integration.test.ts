import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.js';
import { createTestDb, type TestDatabase } from './setup-db.js';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'test-password-123';

describe('Reviews (PGlite)', () => {
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

    const login = await app.request('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const tokens = (await login.json()) as { accessToken: string };
    accessToken = tokens.accessToken;
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it('does not list pending reviews publicly', async () => {
    const submitted = await app.request('/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: 'Ana',
        rating: 5,
        body: 'Las visualizaciones de álgebra me ayudaron a entender códigos lineales.',
        locale: 'es',
      }),
    });
    expect(submitted.status).toBe(201);

    const pub = await app.request('/v1/reviews');
    expect(pub.status).toBe(200);
    const body = (await pub.json()) as { reviews: unknown[]; count: number };
    expect(body.count).toBe(0);
    expect(body.reviews).toHaveLength(0);
  });

  it('publishes a review after admin approval', async () => {
    const pending = await app.request('/v1/admin/reviews?status=pending', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(pending.status).toBe(200);
    const list = (await pending.json()) as { reviews: Array<{ id: string }>; pendingCount: number };
    expect(list.pendingCount).toBeGreaterThan(0);
    const id = list.reviews[0]?.id;
    expect(id).toBeTruthy();

    const patch = await app.request(`/v1/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'approved' }),
    });
    expect(patch.status).toBe(200);

    const pub = await app.request('/v1/reviews');
    const body = (await pub.json()) as {
      reviews: Array<{ displayName: string; rating: number }>;
      count: number;
      averageRating: number | null;
    };
    expect(body.count).toBe(1);
    expect(body.reviews[0]?.displayName).toBe('Ana');
    expect(body.reviews[0]?.rating).toBe(5);
    expect(body.averageRating).toBe(5);
  });

  it('rejects invalid ratings and unauthenticated moderation', async () => {
    const bad = await app.request('/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 9, body: 'texto suficientemente largo' }),
    });
    expect(bad.status).toBe(400);

    const unauth = await app.request('/v1/admin/reviews');
    expect(unauth.status).toBe(401);
  });
});

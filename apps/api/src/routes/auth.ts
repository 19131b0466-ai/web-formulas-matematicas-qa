import { Hono } from 'hono';
import { z } from 'zod';
import type { Database } from '../db/client.js';
import { allowLoginAttempt, AuthError, login, refresh } from '../lib/auth.js';
import { extractIp } from '../lib/request-meta.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export function createAuthRoutes(getDb: () => Database) {
  const routes = new Hono();

  routes.post('/login', async (c) => {
    const ip = extractIp(c.req.raw.headers);
    if (!allowLoginAttempt(`login:${ip}`)) {
      return c.json({ error: 'Too many login attempts. Try again later.' }, 429);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = credentialsSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid credentials payload' }, 400);
    }

    try {
      const tokens = await login(getDb(), parsed.data.email, parsed.data.password);
      return c.json(tokens);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ error: err.message }, err.status as 401 | 503);
      }
      console.error(err);
      return c.json({ error: 'Login failed' }, 500);
    }
  });

  routes.post('/refresh', async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Invalid refresh payload' }, 400);
    }

    try {
      const tokens = await refresh(parsed.data.refreshToken);
      return c.json(tokens);
    } catch (err) {
      if (err instanceof AuthError) {
        return c.json({ error: err.message }, err.status as 401);
      }
      return c.json({ error: 'Refresh failed' }, 401);
    }
  });

  return routes;
}

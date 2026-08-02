import { createMiddleware } from 'hono/factory';
import type { AuthUser } from '@repo/shared-types';
import { AuthError, verifyAccessToken } from '../lib/auth.js';

export type AdminEnv = {
  Variables: {
    admin: AuthUser;
  };
};

export const requireAdmin = createMiddleware<AdminEnv>(async (c, next) => {
  const header = c.req.header('authorization') ?? c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const user = await verifyAccessToken(token);
    c.set('admin', user);
    await next();
  } catch (err) {
    if (err instanceof AuthError) {
      return c.json({ error: err.message }, err.status as 401);
    }
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

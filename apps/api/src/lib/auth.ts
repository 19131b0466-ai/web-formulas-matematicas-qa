import { createHash, randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import type { AuthTokenResponse, AuthUser } from '@repo/shared-types';
import type { Database } from '../db/client.js';
import { adminUsers } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export type AuthConfig = {
  jwtSecret: Uint8Array;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseJwtSecret: Uint8Array | null;
  adminEmail: string | null;
  adminPassword: string | null;
};

export function getAuthConfig(): AuthConfig {
  const jwtSecretRaw =
    process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET ?? 'dev-only-change-me';
  const supabaseJwt = process.env.SUPABASE_JWT_SECRET;

  return {
    jwtSecret: new TextEncoder().encode(jwtSecretRaw),
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
    supabaseJwtSecret: supabaseJwt ? new TextEncoder().encode(supabaseJwt) : null,
    adminEmail: process.env.ADMIN_EMAIL ?? null,
    adminPassword: process.env.ADMIN_PASSWORD ?? null,
  };
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function allowLoginAttempt(key: string, limit = 5, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const bucket = loginAttempts.get(key);
  if (!bucket || now >= bucket.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

async function issueLocalTokens(user: AuthUser, secret: Uint8Array): Promise<AuthTokenResponse> {
  const accessToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    typ: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  const refreshToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    typ: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user,
  };
}

async function loginWithSupabase(
  email: string,
  password: string,
  config: AuthConfig,
): Promise<AuthTokenResponse> {
  const url = `${config.supabaseUrl!.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: config.supabaseAnonKey!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new AuthError('Invalid credentials', 401);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 3600,
    user: {
      id: data.user.id,
      email: data.user.email ?? email,
      role: 'superadmin',
    },
  };
}

async function refreshWithSupabase(
  refreshToken: string,
  config: AuthConfig,
): Promise<AuthTokenResponse> {
  const url = `${config.supabaseUrl!.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: config.supabaseAnonKey!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new AuthError('Invalid refresh token', 401);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: { id: string; email?: string };
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 3600,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      role: 'superadmin',
    },
  };
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function login(
  db: Database,
  email: string,
  password: string,
  config: AuthConfig = getAuthConfig(),
): Promise<AuthTokenResponse> {
  const normalized = email.trim().toLowerCase();

  if (config.supabaseUrl && config.supabaseAnonKey) {
    const tokens = await loginWithSupabase(normalized, password, config);
    await ensureAdminUser(db, tokens.user);
    return tokens;
  }

  if (!config.adminEmail || !config.adminPassword) {
    throw new AuthError('Auth is not configured (set Supabase or ADMIN_EMAIL/ADMIN_PASSWORD)', 503);
  }

  if (normalized !== config.adminEmail.toLowerCase() || password !== config.adminPassword) {
    throw new AuthError('Invalid credentials', 401);
  }

  const user: AuthUser = {
    id: stableAdminId(normalized),
    email: normalized,
    role: 'superadmin',
  };
  await ensureAdminUser(db, user);
  return issueLocalTokens(user, config.jwtSecret);
}

export async function refresh(
  refreshToken: string,
  config: AuthConfig = getAuthConfig(),
): Promise<AuthTokenResponse> {
  if (config.supabaseUrl && config.supabaseAnonKey) {
    // Prefer Supabase refresh when configured
    try {
      return await refreshWithSupabase(refreshToken, config);
    } catch {
      // fall through to local JWT refresh (hybrid/dev)
    }
  }

  const payload = await verifyLocalToken(refreshToken, config.jwtSecret, 'refresh');
  const user: AuthUser = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
  return issueLocalTokens(user, config.jwtSecret);
}

export async function verifyAccessToken(
  token: string,
  config: AuthConfig = getAuthConfig(),
): Promise<AuthUser> {
  // Try local JWT first (dev mode / our issued tokens)
  try {
    const local = await verifyLocalToken(token, config.jwtSecret, 'access');
    return { id: local.sub, email: local.email, role: local.role };
  } catch {
    // continue
  }

  if (config.supabaseJwtSecret) {
    const { payload } = await jwtVerify(token, config.supabaseJwtSecret, {
      algorithms: ['HS256'],
    });
    const email = typeof payload.email === 'string' ? payload.email : '';
    const sub = typeof payload.sub === 'string' ? payload.sub : '';
    if (!sub) throw new AuthError('Invalid token', 401);
    return { id: sub, email, role: 'superadmin' };
  }

  throw new AuthError('Unauthorized', 401);
}

async function verifyLocalToken(
  token: string,
  secret: Uint8Array,
  typ: 'access' | 'refresh',
): Promise<{ sub: string; email: string; role: string }> {
  const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
  if (payload.typ !== typ) throw new AuthError('Invalid token type', 401);
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const email = typeof payload.email === 'string' ? payload.email : '';
  const role = typeof payload.role === 'string' ? payload.role : 'superadmin';
  if (!sub) throw new AuthError('Invalid token', 401);
  return { sub, email, role };
}

function stableAdminId(email: string): string {
  const hash = createHash('sha256').update(`admin:${email}`).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(12, 15)}`,
    `a${hash.slice(15, 18)}`,
    hash.slice(18, 30),
  ].join('-');
}

async function ensureAdminUser(db: Database, user: AuthUser): Promise<void> {
  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, user.email))
    .limit(1);
  if (existing.length > 0) return;

  try {
    await db.insert(adminUsers).values({
      id: user.id || randomUUID(),
      email: user.email,
      role: user.role || 'superadmin',
    });
  } catch {
    // ignore unique races / FK issues in environments without auth.users
  }
}

import { lt } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';

const RETENTION_MONTHS = 12;

function authorizeCron(authHeader: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    return authHeader === `Bearer ${secret}`;
  }
  // Without CRON_SECRET: reject on Vercel, allow local/dev.
  return process.env.VERCEL !== '1';
}

async function purgeOldVisits(db: Database) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);

  const deleted = await db
    .delete(visitLogs)
    .where(lt(visitLogs.visitedAt, cutoff))
    .returning({ id: visitLogs.id });

  return {
    ok: true as const,
    deleted: deleted.length,
    cutoff: cutoff.toISOString(),
  };
}

export function createCronRoutes(dbProvider: () => Database) {
  const routes = new Hono();

  // Vercel Cron issues GET; POST kept for manual ops.
  for (const method of ['get', 'post'] as const) {
    routes[method]('/purge-visits', async (c) => {
      if (!authorizeCron(c.req.header('authorization'))) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      return c.json(await purgeOldVisits(dbProvider()));
    });
  }

  return routes;
}

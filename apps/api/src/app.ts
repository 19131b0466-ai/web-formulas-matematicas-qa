import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AuthUser } from '@repo/shared-types';
import type { Database } from './db/client.js';
import { getDb } from './db/index.js';
import { createAdminAnalyticsRoutes } from './routes/admin-analytics.js';
import { createAnalyticsRoutes } from './routes/analytics.js';
import { createAuthRoutes } from './routes/auth.js';
import { createCronRoutes } from './routes/cron.js';
import { createGuideRoutes } from './routes/guide.js';
import { healthRoutes } from './routes/health.js';
import { createSearchRoutes } from './routes/search.js';
import { createSectionsRoutes } from './routes/sections.js';
import { createTagsRoutes } from './routes/tags.js';

//app

export type AppEnv = {
  Variables: {
    db: Database;
    admin: AuthUser;
  };
};

export function createApp(dbProvider: () => Database = getDb) {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? defaultOrigins;

  const app = new Hono<AppEnv>().basePath('/v1');

  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: corsOrigins,
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Health must stay DB-free so cold starts / bad DATABASE_URL don't 504 the probe.
  app.route('/health', healthRoutes);

  app.use('*', async (c, next) => {
    c.set('db', dbProvider());
    await next();
  });
  app.route('/cron', createCronRoutes(dbProvider));
  app.route('/auth', createAuthRoutes(dbProvider));
  app.route('/sections', createSectionsRoutes(dbProvider));
  app.route('/search', createSearchRoutes(dbProvider));
  app.route('/tags', createTagsRoutes(dbProvider));
  app.route('/guide', createGuideRoutes(dbProvider));
  app.route('/analytics', createAnalyticsRoutes(dbProvider));
  app.route('/admin/analytics', createAdminAnalyticsRoutes(dbProvider));

  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  return app;
}

export type AppType = ReturnType<typeof createApp>;

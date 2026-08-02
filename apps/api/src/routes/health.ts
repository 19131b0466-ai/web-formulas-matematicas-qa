import type { HealthResponse } from '@repo/shared-types';
import { Hono } from 'hono';

const API_VERSION = '0.1.0';

export const healthRoutes = new Hono().get('/', (c) => {
  const body: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  };
  return c.json(body);
});

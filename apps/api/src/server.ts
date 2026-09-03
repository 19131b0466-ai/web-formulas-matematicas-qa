import { serve } from '@hono/node-server';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from './index.js';

try {
  process.loadEnvFile(resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'));
} catch {
  // Vercel and CI already inject env vars; a missing local .env is fine.
}

const port = Number(process.env.PORT ?? 3001);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`API listening on http://localhost:${String(info.port)}/v1`);
  },
);

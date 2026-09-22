import { serve } from '@hono/node-server';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setDb } from './db/index.js';
import { app } from './index.js';

try {
  process.loadEnvFile(resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env'));
} catch {
  // Vercel and CI already inject env vars; a missing local .env is fine.
}

const port = Number(process.env.PORT ?? 3001);

function isPostgresTimeout(err: unknown): boolean {
  return Boolean(
    err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: unknown }).code === '57014',
  );
}

process.on('unhandledRejection', (reason) => {
  if (isPostgresTimeout(reason)) {
    console.error('Postgres statement timeout — keeping API process alive');
    return;
  }
  console.error('unhandledRejection', reason);
});

async function main(): Promise<void> {
  if (process.env.QA_PGLITE === '1') {
    const { bootQaPglite } = await import('./db/qa-pglite.js');
    setDb(await bootQaPglite());
  }

  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`API listening on http://localhost:${String(info.port)}/v1`);
    },
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

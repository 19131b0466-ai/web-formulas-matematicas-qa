import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from '../db/schema.js';

const DIR = dirname(fileURLToPath(import.meta.url));
const SCHEMA_SQL = readFileSync(resolve(DIR, 'schema.sql'), 'utf8');

export type TestDatabase = ReturnType<typeof drizzle<typeof schema>>;

export async function createTestDb(): Promise<{
  client: PGlite;
  db: TestDatabase;
}> {
  const client = new PGlite();
  await client.exec(SCHEMA_SQL);
  const db = drizzle(client, { schema });
  return { client, db };
}

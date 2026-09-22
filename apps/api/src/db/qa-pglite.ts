import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { seedAllSubjects } from '../seed/import-markdown.js';
import type { Database } from './client.js';
import * as schema from './schema.js';
import { subjects } from './schema.js';

const SCHEMA_SQL = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../test/schema.sql'),
  'utf8',
);

/** Local QA database: avoids the remote pooler so ChatGPT inventory does not 502. */
export async function bootQaPglite(): Promise<Database> {
  const dir = process.env.QA_PGLITE_DIR ?? '/tmp/formulas-qa-pglite';
  mkdirSync(dir, { recursive: true });
  const client = new PGlite(dir);
  await client.exec(SCHEMA_SQL);
  const db = drizzle(client, { schema });
  const rows = await db.select({ id: subjects.id }).from(subjects).limit(1);
  if (!rows[0]) {
    console.log(`QA PGlite: seeding catalogs into ${dir}`);
    const stats = await seedAllSubjects(db as never);
    for (const item of stats) {
      console.log(
        `QA PGlite: [${item.subjectSlug}] ${String(item.formulaCount)} formulas`,
      );
    }
  } else {
    console.log(`QA PGlite: reusing ${dir}`);
  }
  return db as unknown as Database;
}

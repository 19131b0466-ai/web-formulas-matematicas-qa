import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type Database = ReturnType<typeof createDb>;

/** Supabase transaction pooler cannot safely hold more than one client per invocation. */
export function usesTransactionPooler(connectionString: string): boolean {
  try {
    const parsed = new URL(connectionString);
    return parsed.port === '6543' || /pooler\.supabase\.com$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function createDb(connectionString: string) {
  // Transaction-mode pooler (Supabase :6543) requires prepare: false.
  // max: 1 keeps serverless invocations from exhausting the pool.
  const pooler = usesTransactionPooler(connectionString);
  const client = postgres(connectionString, {
    max: pooler ? 1 : 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: pooler ? undefined : { statement_timeout: 15_000 },
  });
  return drizzle(client, { schema });
}

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ?? 'postgresql://formulas:formulas_dev@localhost:5432/formulas_db'
  );
}

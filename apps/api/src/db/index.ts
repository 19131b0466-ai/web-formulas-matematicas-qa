import { createDb, getDatabaseUrl, type Database } from './client.js';

export type { Database } from './client.js';
export * from './schema.js';

let _db: Database | null = null;

export function getDb(): Database {
  _db ??= createDb(getDatabaseUrl());
  return _db;
}

/** Test helper: replace the singleton db instance. */
export function setDb(db: Database): void {
  _db = db;
}

/**
 * Backfill visit_logs.subject_slug for historical rows created before multi-subject.
 * Does NOT delete any analytics data.
 *
 * Usage (from apps/api, with DATABASE_URL set):
 *   pnpm exec tsx src/scripts/backfill-visit-subjects.ts
 */
import { sql } from 'drizzle-orm';
import { createDb, getDatabaseUrl } from '../db/client.js';

async function main() {
  const db = createDb(getDatabaseUrl());

  const fisica = await db.execute(sql`
    UPDATE visit_logs
    SET subject_slug = 'fisica-basica'
    WHERE subject_slug IS NULL
      AND path LIKE '%fisica-basica%'
  `);

  const calculo = await db.execute(sql`
    UPDATE visit_logs
    SET subject_slug = 'calculo-ii'
    WHERE subject_slug IS NULL
  `);

  console.log('backfill complete', {
    fisica: (fisica as { count?: number }).count ?? fisica,
    calculo: (calculo as { count?: number }).count ?? calculo,
  });
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

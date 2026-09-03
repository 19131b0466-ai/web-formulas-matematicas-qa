/**
 * Classify historical visit_logs from user_agent and fill ip_hash / ip_network.
 * Idempotent. Does not delete rows. Skips classification_version starting with "manual".
 *
 * Usage (from apps/api, DATABASE_URL and ANALYTICS_IP_HASH_SECRET set):
 *   pnpm exec tsx src/scripts/backfill-visit-classification.ts --dry-run
 *   pnpm exec tsx src/scripts/backfill-visit-classification.ts
 */
import { createDb, getDatabaseUrl } from '../db/client.js';
import { backfillVisitClassification } from '../services/analytics-backfill.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const db = createDb(getDatabaseUrl());
  const counts = await backfillVisitClassification(db, { dryRun, batchSize: 200 });
  console.log(dryRun ? 'backfill dry-run' : 'backfill complete', counts);
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

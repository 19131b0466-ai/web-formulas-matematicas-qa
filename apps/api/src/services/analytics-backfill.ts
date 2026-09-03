import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { visitLogs } from '../db/schema.js';
import { anonymizeIpNetwork, hashIp } from '../lib/ip-privacy.js';
import { CLASSIFICATION_VERSION, classifyTraffic } from '../lib/traffic-classifier.js';

export type BackfillCounts = {
  scanned: number;
  updated: number;
  human: number;
  bot: number;
  unknown: number;
  hashed: number;
  skippedManual: number;
};

type BackfillPatch = {
  id: string;
  isBot: boolean;
  trafficClass: 'human' | 'bot' | 'unknown';
  botId: string | null;
  botCategory: string | null;
  reason: string;
  confidence: string;
  ipHash: string | null;
  ipNetwork: string | null;
};

function isManualVersion(version: string | null | undefined): boolean {
  return Boolean(version && version.toLowerCase().startsWith('manual'));
}

async function applyPatches(db: Database, patches: BackfillPatch[]): Promise<void> {
  if (patches.length === 0) return;
  const values = sql.join(
    patches.map(
      (p) =>
        sql`(${p.id}::uuid, ${p.isBot}::boolean, ${p.trafficClass}, ${p.botId}, ${p.botCategory}, ${p.reason}, ${p.confidence}, ${p.ipHash}, ${p.ipNetwork})`,
    ),
    sql`, `,
  );
  await db.execute(sql`
    UPDATE visit_logs AS v SET
      is_bot = u.is_bot,
      traffic_class = u.traffic_class,
      bot_id = u.bot_id,
      bot_category = u.bot_category,
      bot_detection_reason = u.reason,
      bot_confidence = u.confidence,
      classification_version = ${CLASSIFICATION_VERSION},
      ip_hash = u.ip_hash,
      ip_network = u.ip_network
    FROM (
      VALUES ${values}
    ) AS u(id, is_bot, traffic_class, bot_id, bot_category, reason, confidence, ip_hash, ip_network)
    WHERE v.id = u.id
      AND v.classification_version NOT ILIKE 'manual%'
  `);
}

export async function backfillVisitClassification(
  db: Database,
  options: { batchSize?: number; dryRun?: boolean } = {},
): Promise<BackfillCounts> {
  const batchSize = options.batchSize ?? 200;
  const dryRun = options.dryRun ?? false;
  const counts: BackfillCounts = {
    scanned: 0,
    updated: 0,
    human: 0,
    bot: 0,
    unknown: 0,
    hashed: 0,
    skippedManual: 0,
  };

  let lastId: string | null = null;
  for (;;) {
    const rows = await db
      .select({
        id: visitLogs.id,
        userAgent: visitLogs.userAgent,
        ipAddress: visitLogs.ipAddress,
        trafficClass: visitLogs.trafficClass,
        classificationVersion: visitLogs.classificationVersion,
        ipHash: visitLogs.ipHash,
        ipNetwork: visitLogs.ipNetwork,
        botDetectionReason: visitLogs.botDetectionReason,
      })
      .from(visitLogs)
      .where(
        and(
          lastId ? gt(visitLogs.id, lastId) : sql`true`,
          or(
            eq(visitLogs.trafficClass, 'unknown'),
            isNull(visitLogs.ipHash),
            isNull(visitLogs.botDetectionReason),
          ),
        ),
      )
      .orderBy(visitLogs.id)
      .limit(batchSize);

    if (rows.length === 0) break;

    const patches: BackfillPatch[] = [];
    for (const row of rows) {
      lastId = row.id;
      counts.scanned += 1;
      if (isManualVersion(row.classificationVersion)) {
        counts.skippedManual += 1;
        continue;
      }

      const classified = classifyTraffic(row.userAgent);
      const ipValue = typeof row.ipAddress === 'string' ? row.ipAddress : String(row.ipAddress);
      const ipHash = row.ipHash ?? hashIp(ipValue);
      const ipNetwork = row.ipNetwork ?? anonymizeIpNetwork(ipValue);
      counts[classified.trafficClass] += 1;
      if (!row.ipHash && ipHash) counts.hashed += 1;

      const unchanged =
        row.trafficClass === classified.trafficClass &&
        row.botDetectionReason === classified.reason &&
        row.ipHash === ipHash &&
        row.ipNetwork === ipNetwork;
      if (unchanged) continue;
      patches.push({
        id: row.id,
        isBot: classified.isBot,
        trafficClass: classified.trafficClass,
        botId: classified.botId,
        botCategory: classified.botCategory,
        reason: classified.reason,
        confidence: classified.confidence,
        ipHash,
        ipNetwork,
      });
    }

    if (!dryRun && patches.length > 0) {
      await applyPatches(db, patches);
      counts.updated += patches.length;
    }
  }

  return counts;
}

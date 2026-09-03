import { eq, type SQL } from 'drizzle-orm';
import { visitLogs } from '../db/schema.js';

export type TrafficAudience = 'human' | 'bot' | 'unknown' | 'all';

export const TRAFFIC_AUDIENCES: TrafficAudience[] = ['human', 'bot', 'unknown', 'all'];

export function isTrafficAudience(value: string | undefined): value is TrafficAudience {
  return value === 'human' || value === 'bot' || value === 'unknown' || value === 'all';
}

/** Centralized audience predicate. Unclassified historical rows are `unknown`, never mixed into human KPIs. */
export function audienceCondition(audience: TrafficAudience = 'human'): SQL | undefined {
  if (audience === 'all') return undefined;
  return eq(visitLogs.trafficClass, audience);
}

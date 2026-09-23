import { unstable_noStore as noStore } from 'next/cache';
import { connection } from 'next/server';
import { isQaSite } from './isr';

/**
 * Next.js requires `export const revalidate` / `dynamic` / `fetchCache` to be
 * statically analyzable literals, so QA cannot export `revalidate = 0` from
 * `@/lib/isr`. Pages keep production ISR numbers; this call opts the request
 * into dynamic rendering and skips the Full Route Cache.
 */
export async function optIntoQaDynamicRender(): Promise<void> {
  if (!isQaSite()) return;
  noStore();
  await connection();
}

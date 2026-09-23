import { connection } from 'next/server';
import { isQaSite } from './isr';

/**
 * Next.js requires `export const revalidate` to be a numeric literal, so QA
 * cannot export `revalidate = 0`. Pages keep production ISR numbers; this
 * opts the HTML into dynamic rendering. Do not call `noStore()` here: that
 * would also disable the fetch Data Cache and stampede the API.
 */
export async function optIntoQaDynamicRender(): Promise<void> {
  if (!isQaSite()) return;
  await connection();
}

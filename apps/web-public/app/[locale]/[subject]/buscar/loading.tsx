import { getLoadingCopy } from '@/lib/loading-copy';

/** Avoid next-intl here — loading can render before setRequestLocale. */
export default async function Loading() {
  const copy = await getLoadingCopy();
  return <p className="text-sm text-[var(--fg-muted)]">{copy.search}</p>;
}

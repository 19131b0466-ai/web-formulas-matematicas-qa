'use client';

import { useLocale } from 'next-intl';
import { LOADING_COPY } from '@/lib/loading-copy';
import type { AppLocale } from '@/i18n/routing';

/** Client loading UI — must not call cookies()/headers() (breaks ISR with DYNAMIC_SERVER_USAGE). */
export default function Loading() {
  const locale = useLocale() as AppLocale;
  return (
    <p className="text-sm text-[var(--fg-muted)]">
      {LOADING_COPY[locale]?.section ?? LOADING_COPY.es.section}
    </p>
  );
}

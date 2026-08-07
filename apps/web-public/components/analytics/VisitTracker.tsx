'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackVisit } from '@/lib/analytics';
import { isSubjectSlug } from '@/lib/subjects';

/**
 * Registra visitas de página. No captura ni envía IP.
 */
export function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const queryString = searchParams.toString();
    const key = `${pathname}?${queryString}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    const parts = pathname.split('/').filter(Boolean);
    // Strip locale prefix if present (en/de/…)
    const maybeLocale = parts[0];
    const locales = new Set(['en', 'de', 'pt', 'fr', 'it']);
    const pathParts = locales.has(maybeLocale ?? '') ? parts.slice(1) : parts;

    const subjectCandidate = pathParts[0] ?? null;
    const subjectSlug = subjectCandidate && isSubjectSlug(subjectCandidate) ? subjectCandidate : null;

    let sectionSlug: string | null = null;
    if (subjectSlug) {
      const kind = pathParts[1];
      if (kind === 'seccion' || kind === 'apendice') {
        sectionSlug = pathParts[2] ?? null;
      } else if (kind === 'formula') {
        sectionSlug = pathParts[2] ?? null;
      }
    }

    const searchQuery = pathname.includes('/buscar') ? searchParams.get('q') : null;

    trackVisit({
      path: pathname,
      sectionSlug,
      subjectSlug,
      searchQuery,
      queryString: queryString || null,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const onHide = () => {
      trackVisit({
        path: window.location.pathname,
        queryString: window.location.search.replace(/^\?/, '') || null,
        force: false,
      });
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  return null;
}

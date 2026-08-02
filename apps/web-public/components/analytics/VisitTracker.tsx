'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackVisit } from '@/lib/analytics';

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

    const sectionMatch = pathname.match(/^\/(?:seccion|apendice)\/([^/]+)/);
    const sectionSlug = sectionMatch?.[1] ?? null;
    const searchQuery = pathname.startsWith('/buscar') ? searchParams.get('q') : null;

    trackVisit({
      path: pathname,
      sectionSlug,
      searchQuery,
      queryString: queryString || null,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const onHide = () => {
      // Respaldo: re-enviar path actual si el usuario cierra la pestaña
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

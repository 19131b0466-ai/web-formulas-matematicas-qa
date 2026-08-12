'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Shown when the formula API is temporarily unavailable (timeout/5xx),
 * as opposed to a true missing formula (which uses not-found).
 */
export default function FormulaError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[formula page]', error);
  }, [error]);

  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        Temporal
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">No se pudo cargar la fórmula</h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">
        La API no respondió a tiempo o falló temporalmente. Esto no significa que la fórmula no
        exista: vuelve a intentarlo en unos segundos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-xl border border-[var(--border)] px-5 text-sm font-semibold"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

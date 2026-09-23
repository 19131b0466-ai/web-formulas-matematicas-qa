'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SectionError({ error }: Props) {
  useEffect(() => {
    console.error('[section page]', error);
  }, [error]);

  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        Temporal
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">No se pudo cargar la sección</h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">
        La API no respondió a tiempo o falló temporalmente. Vuelve a intentarlo en unos segundos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            window.setTimeout(() => {
              window.location.reload();
            }, 600);
          }}
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

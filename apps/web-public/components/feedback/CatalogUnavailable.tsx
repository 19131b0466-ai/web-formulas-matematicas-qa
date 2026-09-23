'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

type CatalogUnavailableProps = {
  title: string;
  logLabel: string;
  error?: Error & { digest?: string };
  detail?: string;
};

export function CatalogUnavailable({
  title,
  logLabel,
  error,
  detail = 'La API no respondió a tiempo o falló temporalmente. Vuelve a intentarlo en unos segundos.',
}: CatalogUnavailableProps) {
  useEffect(() => {
    if (error) console.error(logLabel, error);
  }, [error, logLabel]);

  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        Temporal
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-[var(--fg-muted)]">{detail}</p>
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

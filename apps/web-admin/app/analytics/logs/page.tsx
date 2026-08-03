'use client';

import { useEffect, useMemo, useState } from 'react';
import type { VisitLogAdminDto } from '@repo/shared-types';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { fetchRecent } from '@/lib/api';

const PAGE_SIZE = 20;

export default function LogsPage() {
  const [visits, setVisits] = useState<VisitLogAdminDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchRecent(200)
      .then((res) => {
        // Guardrail: never render IP if somehow present
        const cleaned = res.visits.map((v) => {
          const clone = { ...v } as VisitLogAdminDto & { ipAddress?: unknown; ip?: unknown };
          delete clone.ipAddress;
          delete clone.ip;
          return clone;
        });
        setVisits(cleaned);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  const totalPages = Math.max(1, Math.ceil(visits.length / PAGE_SIZE));
  const slice = useMemo(
    () => visits.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [visits, page],
  );

  return (
    <div>
      <PageHeader
        title="Logs recientes"
        subtitle="Visitas recientes sin columna IP (país, ciudad, path, dispositivo)."
      />
      {error ? <ErrorBox message={error} /> : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="hud-table min-w-[56rem]">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>País</th>
                <th>Ciudad</th>
                <th>Path</th>
                <th>Dispositivo</th>
                <th>Browser</th>
                <th>Idioma</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((v) => (
                <tr key={v.id}>
                  <td className="whitespace-nowrap">{new Date(v.visitedAt).toLocaleString()}</td>
                  <td>{v.countryCode ?? '—'}</td>
                  <td>{v.city ?? '—'}</td>
                  <td className="font-mono text-xs text-[var(--accent-strong)]">{v.path}</td>
                  <td>{v.deviceType ?? '—'}</td>
                  <td>{v.browser ?? '—'}</td>
                  <td>{v.primaryLanguage ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.1em] text-[var(--fg-muted)] uppercase">
            Página {page + 1} de {totalPages} · {visits.length} registros
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="hud-btn px-3 text-xs disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="hud-btn px-3 text-xs disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

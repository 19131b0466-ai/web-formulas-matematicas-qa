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
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--fg-muted)]">
              <tr>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">País</th>
                <th className="px-3 py-3">Ciudad</th>
                <th className="px-3 py-3">Path</th>
                <th className="px-3 py-3">Dispositivo</th>
                <th className="px-3 py-3">Browser</th>
                <th className="px-3 py-3">Idioma</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)]">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {new Date(v.visitedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">{v.countryCode ?? '—'}</td>
                  <td className="px-3 py-3">{v.city ?? '—'}</td>
                  <td className="px-3 py-3 font-mono text-xs">{v.path}</td>
                  <td className="px-3 py-3">{v.deviceType ?? '—'}</td>
                  <td className="px-3 py-3">{v.browser ?? '—'}</td>
                  <td className="px-3 py-3">{v.primaryLanguage ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--fg-muted)]">
            Página {page + 1} de {totalPages} · {visits.length} registros
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

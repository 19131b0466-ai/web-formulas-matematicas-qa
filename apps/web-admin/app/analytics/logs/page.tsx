'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import type { TrafficClass, VisitLogAdminDto } from '@repo/shared-types';
import { useTrafficFilter } from '@/components/TrafficFilter';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { fetchRecent } from '@/lib/api';
import { displayBotLabel, shortenId, trafficClassLabel } from '@/lib/traffic';

const PAGE_SIZE = 20;

function ClassBadge({ trafficClass }: { trafficClass: TrafficClass }) {
  const styles: Record<TrafficClass, string> = {
    human: 'border-[var(--lime)] text-[var(--lime)]',
    bot: 'border-[var(--secondary)] text-[var(--secondary)]',
    unknown: 'border-[var(--fg-muted)] text-[var(--fg-muted)]',
  };
  return (
    <span className={`inline-block border px-1.5 py-0.5 text-[10px] tracking-[0.08em] uppercase ${styles[trafficClass]}`}>
      {trafficClassLabel(trafficClass)}
    </span>
  );
}

export default function LogsPage() {
  const { audience } = useTrafficFilter();
  const [visits, setVisits] = useState<VisitLogAdminDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecent(200, audience)
      .then((res) => {
        const cleaned = res.visits.map((v) => {
          const clone = { ...v } as VisitLogAdminDto & { ipAddress?: unknown; ip?: unknown };
          delete clone.ipAddress;
          delete clone.ip;
          return clone;
        });
        setVisits(cleaned);
        setPage(0);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, [audience]);

  const totalPages = Math.max(1, Math.ceil(visits.length / PAGE_SIZE));
  const slice = useMemo(
    () => visits.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [visits, page],
  );

  return (
    <div>
      <PageHeader
        title="Logs recientes"
        subtitle="Por defecto, todo el tráfico. Nunca se muestra la IP completa. Día/hora en zona local del navegador; métricas agregadas del API usan UTC."
      />
      {error ? <ErrorBox message={error} /> : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="hud-table min-w-[72rem]">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Clase</th>
                <th>Bot ID</th>
                <th>Categoría</th>
                <th>País</th>
                <th>Ciudad</th>
                <th>Path</th>
                <th>Dispositivo</th>
                <th>Navegador</th>
                <th>Idioma</th>
                <th>IP hash</th>
                <th>Red</th>
                <th>Sesión</th>
                <th>Fuente</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((v) => (
                <Fragment key={v.id}>
                  <tr
                    className="cursor-pointer"
                    onClick={() => setOpenId((id) => (id === v.id ? null : v.id))}
                  >
                    <td className="whitespace-nowrap">{new Date(v.visitedAt).toLocaleString()}</td>
                    <td>
                      <ClassBadge trafficClass={v.trafficClass} />
                    </td>
                    <td>{v.botId ? displayBotLabel(v.botId) : '—'}</td>
                    <td>{v.botCategory ?? '—'}</td>
                    <td>{v.countryCode ?? '—'}</td>
                    <td>{v.city ?? '—'}</td>
                    <td className="font-mono text-xs text-[var(--accent-strong)]">{v.path}</td>
                    <td>{v.deviceType ?? '—'}</td>
                    <td>
                      {v.trafficClass === 'bot' ? (
                        <span>
                          <span className="block">{displayBotLabel(v.botId)}</span>
                          <span className="text-[10px] text-[var(--fg-muted)]">
                            {v.browser ? `${v.browser} declarado en UA` : 'sin navegador declarado'}
                          </span>
                        </span>
                      ) : (
                        (v.browser ?? '—')
                      )}
                    </td>
                    <td>{v.primaryLanguage ?? '—'}</td>
                    <td className="font-mono text-[10px]">{v.ipHash ?? '—'}</td>
                    <td className="font-mono text-[10px]">{v.ipNetwork ?? '—'}</td>
                    <td className="font-mono text-[10px]" title={v.sessionId}>
                      {shortenId(v.sessionId)}
                    </td>
                    <td>{v.eventSource}</td>
                  </tr>
                  {openId === v.id ? (
                    <tr>
                      <td colSpan={14} className="bg-[rgba(0,240,255,0.03)] text-xs">
                        <dl className="grid gap-2 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <dt className="hud-label">Raw User-Agent</dt>
                            <dd className="mt-1 break-all font-mono text-[11px]">{v.userAgent ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Motivo</dt>
                            <dd className="mt-1">{v.botDetectionReason ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Confianza</dt>
                            <dd className="mt-1">{v.botConfidence ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Clasificador</dt>
                            <dd className="mt-1">{v.classificationVersion}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Path completo</dt>
                            <dd className="mt-1 font-mono">
                              {v.path}
                              {v.queryString ? `?${v.queryString}` : ''}
                            </dd>
                          </div>
                          <div>
                            <dt className="hud-label">Referente</dt>
                            <dd className="mt-1 break-all">{v.referer ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Identificador de sesión</dt>
                            <dd className="mt-1 font-mono">{v.sessionId}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">IP hash</dt>
                            <dd className="mt-1 font-mono">{v.ipHash ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Red anonimizada</dt>
                            <dd className="mt-1 font-mono">{v.ipNetwork ?? '—'}</dd>
                          </div>
                          <div>
                            <dt className="hud-label">Fuente del evento</dt>
                            <dd className="mt-1">{v.eventSource}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
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

'use client';

import { useEffect, useState } from 'react';
import type { BotsAnalytics } from '@repo/shared-types';
import { HorizontalBars, VisitsLineChart } from '@/components/charts';
import { Card, ErrorBox, Kpi, PageHeader } from '@/components/ui';
import { defaultRange, fetchBotsAnalytics, fetchTimeseries } from '@/lib/api';
import { displayBotLabel } from '@/lib/traffic';

export default function BotsPage() {
  const [data, setData] = useState<BotsAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<Array<{ date: string; visits: number; uniqueSessions: number }>>(
    [],
  );

  useEffect(() => {
    const { from, to } = defaultRange();
    Promise.all([fetchBotsAnalytics(from, to), fetchTimeseries(from, to, 'bot')])
      .then(([bots, ts]) => {
        setData(bots);
        setPoints(ts.points);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader
        title="Bots"
        subtitle="Crawlers que alcanzaron la app (VisitTracker). El tráfico bloqueado por el Firewall de Vercel no aparece aquí. País/ciudad de datacenter no es ubicación de un usuario. Los UUID de bot son identificadores de ejecución, no sesiones humanas."
      />
      {error ? <ErrorBox message={error} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Solicitudes de bots" value={data?.totalBotRequests ?? '—'} />
        <Kpi label="% del tráfico" value={data ? `${data.botPercent}%` : '—'} />
        <Kpi label="Bot principal" value={data?.topBotId ?? '—'} />
        <Kpi
          label="RPM máximo"
          value={data?.rpm.maxPerMinute ?? '—'}
          hint={data ? `media ${data.rpm.mean} · p95 ${data.rpm.p95} · max IP hash ${data.rpm.maxPerIpHash}` : undefined}
        />
      </div>

      <div className="mt-4">
        <Card title="Serie temporal de solicitudes de bots">
          <VisitsLineChart data={points} />
        </Card>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card title="Categorías">
          <HorizontalBars data={data?.categories ?? []} />
        </Card>
        <Card title="Rutas más rastreadas">
          <HorizontalBars data={data?.paths ?? []} />
        </Card>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card title="Países reportados (datacenter, no usuarios)">
          <HorizontalBars
            data={(data?.countries ?? []).map((c) => ({
              name: c.countryName ?? c.countryCode ?? 'N/D',
              count: c.count,
            }))}
          />
        </Card>
        <Card title="Ciudades reportadas">
          <HorizontalBars
            data={(data?.cities ?? []).map((c) => ({
              name: c.city ?? c.countryCode ?? 'N/D',
              count: c.count,
            }))}
          />
        </Card>
      </div>

      <div className="hud-panel mt-4 overflow-x-auto p-2">
        <table className="hud-table min-w-[64rem]">
          <thead>
            <tr>
              <th>Bot</th>
              <th>Categoría</th>
              <th>Solicitudes</th>
              <th>Rutas únicas</th>
              <th>IP hashes</th>
              <th>Redes</th>
              <th>Primera actividad</th>
              <th>Última actividad</th>
              <th>RPM máximo</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {(data?.bots ?? []).map((row) => (
              <tr key={`${row.botId}-${row.category ?? ''}`}>
                <td>{displayBotLabel(row.botId)}</td>
                <td>{row.category ?? '—'}</td>
                <td>{row.requests}</td>
                <td>{row.uniquePaths}</td>
                <td>{row.uniqueIpHashes}</td>
                <td>{row.uniqueNetworks}</td>
                <td className="whitespace-nowrap text-[11px]">
                  {row.firstSeen ? new Date(row.firstSeen).toLocaleString() : '—'}
                </td>
                <td className="whitespace-nowrap text-[11px]">
                  {row.lastSeen ? new Date(row.lastSeen).toLocaleString() : '—'}
                </td>
                <td>{row.maxRpm}</td>
                <td>{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

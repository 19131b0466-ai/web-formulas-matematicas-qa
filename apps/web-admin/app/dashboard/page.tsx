'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsOverview, NamedCount, TimeseriesPoint } from '@repo/shared-types';
import { DevicePie, HorizontalBars, VisitsLineChart } from '@/components/charts';
import { Card, ErrorBox, Kpi, PageHeader } from '@/components/ui';
import { defaultRange, fetchDevices, fetchOverview, fetchPages, fetchTimeseries } from '@/lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [pages, setPages] = useState<NamedCount[]>([]);
  const [devices, setDevices] = useState<NamedCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    Promise.all([
      fetchOverview(),
      fetchTimeseries(from, to),
      fetchPages(from, to),
      fetchDevices(from, to),
    ])
      .then(([ov, ts, pg, dv]) => {
        setOverview(ov);
        setPoints(ts.points);
        setPages(pg.pages.slice(0, 10));
        setDevices(dv.devices);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error cargando dashboard');
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Command Overview"
        subtitle="Telemetría de uso del sitio público (sin exponer IPs)."
      />
      {error ? <ErrorBox message={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Visitas hoy" value={overview?.visitsToday ?? '—'} />
        <Kpi label="Únicos 7d" value={overview?.uniqueSessionsWeek ?? '—'} />
        <Kpi
          label="Top país"
          value={overview?.topCountry?.name ?? overview?.topCountry?.code ?? '—'}
          hint={overview?.topCountry ? `${overview.topCountry.count} visitas` : undefined}
        />
        <Kpi
          label="Top sección"
          value={overview?.topSection?.slug ?? '—'}
          hint={overview?.topSection ? `${overview.topSection.count} visitas` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Visitas últimos 30 días" className="lg:col-span-3">
          <VisitsLineChart data={points} />
        </Card>
        <Card title="Dispositivos" className="lg:col-span-2">
          <DevicePie data={devices} />
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Top 10 secciones / páginas">
          <HorizontalBars data={pages} />
        </Card>
      </div>
    </div>
  );
}

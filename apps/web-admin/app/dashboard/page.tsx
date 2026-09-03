'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsOverview, NamedCount, TimeseriesPoint } from '@repo/shared-types';
import { DevicePie, HorizontalBars, VisitsLineChart } from '@/components/charts';
import { useTrafficFilter } from '@/components/TrafficFilter';
import { Card, ErrorBox, Kpi, PageHeader } from '@/components/ui';
import { defaultRange, fetchDevices, fetchOverview, fetchPages, fetchTimeseries } from '@/lib/api';

const VISITS_TOOLTIP =
  'Páginas vistas humanas o probablemente humanas desde medianoche UTC. Excluye bots identificados por User-Agent y tráfico desconocido. No es una certeza absoluta: el User-Agent puede falsificarse.';

export default function DashboardPage() {
  const { audience } = useTrafficFilter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [pages, setPages] = useState<NamedCount[]>([]);
  const [devices, setDevices] = useState<NamedCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    Promise.all([
      fetchOverview(),
      fetchTimeseries(from, to, audience),
      fetchPages(from, to, audience),
      fetchDevices(from, to, audience),
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
  }, [audience]);

  return (
    <div>
      <PageHeader
        title="Command Overview"
        subtitle="Telemetría UTC del sitio público. “Visitas” es solo tráfico humano probable. Los bots se registran aparte."
      />
      {error ? <ErrorBox message={error} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Visitas hoy"
          value={overview?.visitsToday ?? '—'}
          hint="Humanas · UTC"
          tooltip={VISITS_TOOLTIP}
        />
        <Kpi
          label="Sesiones humanas 7d"
          value={overview?.uniqueSessionsWeek ?? '—'}
          hint="session_id distintos, sin bots"
          tooltip="Identificadores de sesión humana (localStorage 30 días). Los UUID de crawlers no cuentan."
        />
        <Kpi
          label="Top país"
          value={overview?.topCountry?.name ?? overview?.topCountry?.code ?? '—'}
          hint={overview?.topCountry ? `${overview.topCountry.count} visitas humanas` : undefined}
        />
        <Kpi
          label="Top sección"
          value={overview?.topSection?.slug ?? '—'}
          hint={overview?.topSection ? `${overview.topSection.count} visitas humanas` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi label="Tráfico total hoy" value={overview?.totalTrafficToday ?? '—'} hint="Humanos + bots + desconocidos · UTC" />
        <Kpi label="Visitas humanas hoy" value={overview?.humanVisitsToday ?? '—'} />
        <Kpi
          label="Solicitudes de bots hoy"
          value={overview?.botRequestsToday ?? '—'}
          hint={overview ? `${overview.botPercentToday}% del tráfico de hoy` : undefined}
        />
        <Kpi label="Tráfico desconocido hoy" value={overview?.unknownTrafficToday ?? '—'} />
        <Kpi
          label="Porcentaje de bots hoy"
          value={overview ? `${overview.botPercentToday}%` : '—'}
        />
        <Kpi
          label="Bots (histórico)"
          value={overview?.botRequestsAll ?? '—'}
          hint={overview ? `${overview.botPercentAll}% del tráfico total` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        <Card title="Serie (filtro de audiencia) · 30 días" className="lg:col-span-3">
          <VisitsLineChart data={points} />
        </Card>
        <Card title="Dispositivos (filtro)" className="lg:col-span-2">
          <DevicePie data={devices} />
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Top 10 secciones / páginas (filtro)">
          <HorizontalBars data={pages} />
        </Card>
      </div>
    </div>
  );
}

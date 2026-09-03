'use client';

import { useEffect, useState } from 'react';
import type { TimeseriesPoint } from '@repo/shared-types';
import { VisitsLineChart } from '@/components/charts';
import { useTrafficFilter } from '@/components/TrafficFilter';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchTimeseries } from '@/lib/api';

export default function TrafficPage() {
  const { audience } = useTrafficFilter();
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    fetchTimeseries(from, to, audience)
      .then((res) => setPoints(res.points))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, [audience]);

  return (
    <div>
      <PageHeader
        title="Tráfico"
        subtitle="Serie temporal. Por defecto, visitas humanas y sesiones humanas (UTC). Los bots no se mezclan con visitantes."
      />
      {error ? <ErrorBox message={error} /> : null}
      <Card title="Últimos 30 días">
        <VisitsLineChart data={points} />
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { TimeseriesPoint } from '@repo/shared-types';
import { VisitsLineChart } from '@/components/charts';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchTimeseries } from '@/lib/api';

export default function TrafficPage() {
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    fetchTimeseries(from, to)
      .then((res) => setPoints(res.points))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader title="Tráfico" subtitle="Serie temporal de visitas y sesiones únicas." />
      {error ? <ErrorBox message={error} /> : null}
      <Card title="Últimos 30 días">
        <VisitsLineChart data={points} />
      </Card>
    </div>
  );
}

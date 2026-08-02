'use client';

import { useEffect, useState } from 'react';
import type { NamedCount } from '@repo/shared-types';
import { DevicePie, HorizontalBars } from '@/components/charts';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchDevices, fetchLanguages, fetchReferrers } from '@/lib/api';

export default function AudiencePage() {
  const [devices, setDevices] = useState<NamedCount[]>([]);
  const [browsers, setBrowsers] = useState<NamedCount[]>([]);
  const [os, setOs] = useState<NamedCount[]>([]);
  const [languages, setLanguages] = useState<NamedCount[]>([]);
  const [referrers, setReferrers] = useState<NamedCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    Promise.all([fetchDevices(from, to), fetchLanguages(from, to), fetchReferrers(from, to)])
      .then(([dv, lang, ref]) => {
        setDevices(dv.devices);
        setBrowsers(dv.browsers);
        setOs(dv.os);
        setLanguages(lang.languages);
        setReferrers(ref.referrers.slice(0, 12));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  return (
    <div>
      <PageHeader title="Audiencia" subtitle="Dispositivos, idiomas y fuentes de tráfico." />
      {error ? <ErrorBox message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Dispositivos">
          <DevicePie data={devices} />
        </Card>
        <Card title="Navegadores" className="lg:col-span-2">
          <HorizontalBars data={browsers.slice(0, 10)} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Sistemas operativos">
          <HorizontalBars data={os.slice(0, 10)} />
        </Card>
        <Card title="Idiomas">
          <HorizontalBars data={languages.slice(0, 10)} />
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Referrers">
          <HorizontalBars
            data={referrers.map((r) => ({
              name: r.name.length > 40 ? `${r.name.slice(0, 40)}…` : r.name,
              count: r.count,
            }))}
          />
        </Card>
      </div>
    </div>
  );
}

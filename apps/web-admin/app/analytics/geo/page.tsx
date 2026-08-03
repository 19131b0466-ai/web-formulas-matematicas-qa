'use client';

import { useEffect, useMemo, useState } from 'react';
import type { GeoCityCount, GeoCountryCount } from '@repo/shared-types';
import { HorizontalBars } from '@/components/charts';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, fetchGeo } from '@/lib/api';

export default function GeoPage() {
  const [countries, setCountries] = useState<GeoCountryCount[]>([]);
  const [cities, setCities] = useState<GeoCityCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to } = defaultRange();
    fetchGeo(from, to)
      .then((res) => {
        setCountries(res.countries);
        setCities(res.cities);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'));
  }, []);

  const bars = useMemo(
    () =>
      countries.slice(0, 15).map((c) => ({
        name: c.countryName ?? c.countryCode ?? 'N/D',
        count: c.count,
      })),
    [countries],
  );

  const max = Math.max(...countries.map((c) => c.count), 1);

  return (
    <div>
      <PageHeader
        title="Geografía"
        subtitle="Distribución por país y ciudad a partir de headers Vercel (sin IPs)."
      />
      {error ? <ErrorBox message={error} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mapa de intensidad por país">
          <div className="space-y-2">
            {countries.slice(0, 12).map((c) => {
              const label = c.countryName ?? c.countryCode ?? 'N/D';
              const width = Math.max(8, Math.round((c.count / max) * 100));
              return (
                <div key={`${c.countryCode ?? label}-${c.count}`}>
                  <div className="mb-1 flex justify-between text-xs text-[var(--fg-muted)]">
                    <span>
                      {c.countryCode ? `${c.countryCode} · ` : ''}
                      {label}
                    </span>
                    <span>{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-[rgba(120,150,180,0.12)]">
                    <div
                      className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-[var(--lime)] to-[var(--secondary)] shadow-[var(--glow)]"
                      style={{ width: `${String(width)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {countries.length === 0 ? (
              <p className="text-sm text-[var(--fg-muted)]">Sin datos geográficos aún.</p>
            ) : null}
          </div>
        </Card>

        <Card title="Top países">
          <HorizontalBars data={bars} />
        </Card>
      </div>

      <div className="hud-panel mt-6 overflow-x-auto p-2">
        <table className="hud-table min-w-[32rem]">
          <thead>
            <tr>
              <th>País</th>
              <th>Ciudad</th>
              <th>Visitas</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((row, i) => (
              <tr key={`${row.city ?? 'x'}-${String(i)}`}>
                <td>{row.countryCode ?? '—'}</td>
                <td>{row.city ?? '—'}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

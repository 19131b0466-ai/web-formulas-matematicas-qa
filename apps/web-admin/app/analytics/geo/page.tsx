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
                  <div className="h-3 rounded-full bg-[var(--bg)]">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[var(--accent)] to-[#3dba95]"
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

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--fg-muted)]">
            <tr>
              <th className="px-4 py-3">País</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Visitas</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((row, i) => (
              <tr
                key={`${row.city ?? 'x'}-${String(i)}`}
                className="border-b border-[var(--border)]"
              >
                <td className="px-4 py-3">{row.countryCode ?? '—'}</td>
                <td className="px-4 py-3">{row.city ?? '—'}</td>
                <td className="px-4 py-3">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

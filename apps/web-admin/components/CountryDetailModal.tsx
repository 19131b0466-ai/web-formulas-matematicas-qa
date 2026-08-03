'use client';

import { useEffect, useId, useMemo } from 'react';
import { geoMercator, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import type { GeoCityCount } from '@repo/shared-types';

export type CountryFeature = {
  type: 'Feature';
  id?: string | number;
  properties?: Record<string, unknown> | null;
  geometry: GeoJSON.Geometry;
};

export type CountrySelection = {
  code: string;
  name: string;
  count: number;
  rank: number;
  totalCountries: number;
  totalVisits: number;
  feature: CountryFeature;
  cities: GeoCityCount[];
};

type CountryDetailModalProps = {
  selection: CountrySelection;
  onClose: () => void;
};

const SILHOUETTE_W = 320;
const SILHOUETTE_H = 220;

function CountrySilhouette({ feature }: { feature: CountryFeature }) {
  const pathD = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [12, 12],
        [SILHOUETTE_W - 12, SILHOUETTE_H - 12],
      ],
      feature as GeoPermissibleObjects,
    );
    const path = geoPath(projection);
    return path(feature as GeoPermissibleObjects) ?? '';
  }, [feature]);

  return (
    <svg
      viewBox={`0 0 ${String(SILHOUETTE_W)} ${String(SILHOUETTE_H)}`}
      className="h-full w-full"
      role="img"
      aria-label="Silueta del país"
    >
      <defs>
        <linearGradient id="country-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(0, 240, 255, 0.55)" />
          <stop offset="100%" stopColor="rgba(184, 255, 60, 0.35)" />
        </linearGradient>
        <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00f0ff" floodOpacity="0.55" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="rgba(7, 11, 16, 0.65)" />
      <path
        d={pathD}
        fill="url(#country-fill)"
        stroke="#7dfff8"
        strokeWidth={1.25}
        filter="url(#country-glow)"
      />
    </svg>
  );
}

export function CountryDetailModal({ selection, onClose }: CountryDetailModalProps) {
  const titleId = useId();
  const share =
    selection.totalVisits > 0
      ? Math.round((selection.count / selection.totalVisits) * 1000) / 10
      : 0;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-[rgba(2,6,11,0.78)] backdrop-blur-sm" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="hud-panel relative z-10 w-full max-w-lg overflow-hidden p-0 shadow-[var(--glow)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            <p className="hud-label">Country telemetry</p>
            <h2
              id={titleId}
              className="font-display mt-1 text-xl font-semibold tracking-wide text-[var(--accent-strong)]"
            >
              {selection.code} · {selection.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 min-w-10 items-center justify-center border border-[var(--border)] bg-[var(--metal-3)] text-sm text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-0 sm:grid-cols-[1.05fr_1fr]">
          <div className="border-b border-[var(--border)] sm:border-b-0 sm:border-r">
            <div className="aspect-[16/11] w-full bg-[radial-gradient(ellipse_at_center,_#12202e_0%,_#070b10_72%)]">
              <CountrySilhouette feature={selection.feature} />
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Visitas" value={String(selection.count)} />
              <Stat label="Share" value={`${String(share)}%`} />
              <Stat
                label="Ranking"
                value={`#${String(selection.rank)}`}
                hint={`de ${String(selection.totalCountries)}`}
              />
              <Stat label="ISO" value={selection.code} />
            </div>

            <div>
              <p className="hud-label mb-2">Ciudades top</p>
              {selection.cities.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)]">Sin ciudades registradas.</p>
              ) : (
                <ul className="space-y-1.5">
                  {selection.cities.slice(0, 6).map((city) => (
                    <li
                      key={`${city.city ?? 'x'}-${String(city.count)}`}
                      className="flex items-center justify-between gap-3 border border-[var(--border)] bg-[rgba(0,240,255,0.03)] px-2.5 py-1.5 text-xs"
                    >
                      <span className="truncate text-[var(--fg)]">{city.city ?? '—'}</span>
                      <span className="font-mono text-[var(--accent-strong)]">{city.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-[var(--border)] bg-[linear-gradient(180deg,rgba(0,240,255,0.06),rgba(10,16,24,0.5))] px-2.5 py-2">
      <p className="hud-label">{label}</p>
      <p className="font-display mt-1 text-lg text-[var(--accent-strong)]">{value}</p>
      {hint ? <p className="text-[10px] text-[var(--fg-muted)]">{hint}</p> : null}
    </div>
  );
}

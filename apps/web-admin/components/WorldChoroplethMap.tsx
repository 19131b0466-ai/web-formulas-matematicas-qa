'use client';

import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  createLatitude,
  createLongitude,
} from '@vnedyalk0v/react19-simple-maps';
import { numericToAlpha2 } from 'i18n-iso-countries';
import type { GeoCountryCount } from '@repo/shared-types';
import countriesTopology from '@/data/countries-110m.json';

const MAP_CENTER = [createLongitude(0), createLatitude(8)] as const;

const LAND = '#121821';
const LAND_EMPTY = '#0a1018';
const STROKE = 'rgba(0, 240, 255, 0.22)';
const STROKE_HOVER = 'rgba(0, 240, 255, 0.85)';
const CYAN = { r: 0, g: 240, b: 255 };
const LIME = { r: 184, g: 255, b: 60 };

type WorldChoroplethMapProps = {
  countries: GeoCountryCount[];
};

function lerpColor(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const r = Math.round(CYAN.r + (LIME.r - CYAN.r) * x);
  const g = Math.round(CYAN.g + (LIME.g - CYAN.g) * x);
  const b = Math.round(CYAN.b + (LIME.b - CYAN.b) * x);
  const alpha = 0.35 + x * 0.55;
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha)})`;
}

function resolveIso2(geo: { id?: string | number; properties?: Record<string, unknown> }): string | null {
  const props = geo.properties ?? {};
  const fromProps = props.ISO_A2 ?? props.iso_a2 ?? props['ISO3166-1-Alpha-2'];
  if (typeof fromProps === 'string' && fromProps.length === 2 && fromProps !== '-99') {
    return fromProps.toUpperCase();
  }
  if (geo.id != null) {
    const alpha = numericToAlpha2(String(geo.id));
    if (alpha) return alpha.toUpperCase();
  }
  return null;
}

export function WorldChoroplethMap({ countries }: WorldChoroplethMapProps) {
  const [hover, setHover] = useState<{ code: string; name: string; count: number } | null>(null);

  const { byCode, max, nameByCode } = useMemo(() => {
    const counts = new Map<string, number>();
    const names = new Map<string, string>();
    let peak = 1;
    for (const row of countries) {
      const code = row.countryCode?.toUpperCase();
      if (!code || code.length !== 2) continue;
      counts.set(code, row.count);
      if (row.countryName) names.set(code, row.countryName);
      if (row.count > peak) peak = row.count;
    }
    return { byCode: counts, max: peak, nameByCode: names };
  }, [countries]);

  return (
    <div className="relative">
      <div className="aspect-[2/1] w-full overflow-hidden border border-[rgba(0,240,255,0.18)] bg-[radial-gradient(ellipse_at_center,_#0f1824_0%,_#070b10_70%)]">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155, center: [...MAP_CENTER] }}
          style={{ width: '100%', height: '100%' }}
        >
          <Sphere id="hud-sphere" fill="transparent" stroke="rgba(0, 240, 255, 0.12)" strokeWidth={0.4} />
          <Graticule stroke="rgba(0, 240, 255, 0.06)" strokeWidth={0.3} />
          {/* Pass topology object directly — URL fetch rejects relative paths (HTTPS-only). */}
          <Geographies geography={countriesTopology}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = resolveIso2(geo);
                const count = code ? (byCode.get(code) ?? 0) : 0;
                const filled = count > 0;
                const fill = filled ? lerpColor(count / max) : LAND_EMPTY;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      if (!code) return;
                      setHover({
                        code,
                        name: nameByCode.get(code) ?? code,
                        count,
                      });
                    }}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      default: {
                        fill: filled ? fill : LAND,
                        stroke: STROKE,
                        strokeWidth: 0.35,
                        outline: 'none',
                      },
                      hover: {
                        fill: filled ? lerpColor(Math.min(1, count / max + 0.15)) : '#1a2636',
                        stroke: STROKE_HOVER,
                        strokeWidth: 0.7,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: filled ? lerpColor(1) : LAND,
                        stroke: STROKE_HOVER,
                        strokeWidth: 0.7,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--fg-muted)]">
        <div className="flex items-center gap-2">
          <span>0</span>
          <div
            className="h-1.5 w-28"
            style={{
              background: 'linear-gradient(90deg, rgba(0,240,255,0.35), rgba(184,255,60,0.9))',
            }}
          />
          <span>{max} visitas</span>
        </div>
        {hover ? (
          <p className="font-mono text-[var(--accent-strong)]">
            {hover.code} · {hover.name} · {hover.count} visita{hover.count === 1 ? '' : 's'}
          </p>
        ) : (
          <p>Pasa el cursor sobre un país</p>
        )}
      </div>
    </div>
  );
}

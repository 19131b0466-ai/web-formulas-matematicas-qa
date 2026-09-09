'use client';

import type { ReactNode } from 'react';

export const ACCENT = 'var(--accent-strong)';
export const TEAL = 'teal';
export const ORANGE = 'orange';
export const MUTED = 'var(--fg-muted)';
export const BORDER = 'var(--border)';
export const FG = 'var(--fg)';

export type PlotMap = {
  W: number;
  H: number;
  X: (x: number) => number;
  Y: (y: number) => number;
  y0: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export function makePlot(opts: {
  W?: number;
  H?: number;
  ml?: number;
  mr?: number;
  mt?: number;
  mb?: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}): PlotMap {
  const W = opts.W ?? 420;
  const H = opts.H ?? 128;
  const ml = opts.ml ?? 40;
  const mr = opts.mr ?? 12;
  const mt = opts.mt ?? 10;
  const mb = opts.mb ?? 22;
  const { xMin, xMax, yMin, yMax } = opts;
  const pw = W - ml - mr;
  const ph = H - mt - mb;
  const X = (x: number) => ml + ((x - xMin) / (xMax - xMin || 1)) * pw;
  const Y = (y: number) => mt + ((yMax - y) / (yMax - yMin || 1)) * ph;
  const y0 = Y(Math.max(yMin, Math.min(yMax, 0)));
  return { W, H, X, Y, y0, xMin, xMax, yMin, yMax };
}

export function padRange(vals: number[], extra = 0.15, minSpan = 1): { yMin: number; yMax: number } {
  const finite = vals.filter((v) => Number.isFinite(v));
  const lo = finite.length ? Math.min(...finite, 0) : -1;
  const hi = finite.length ? Math.max(...finite, 0) : 1;
  const span = Math.max(minSpan, hi - lo);
  const pad = span * extra;
  return { yMin: lo - pad, yMax: hi + pad };
}

export function fnPath(
  f: (x: number) => number,
  x0: number,
  x1: number,
  p: PlotMap,
  n = 160,
): string {
  let d = '';
  let started = false;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) {
      started = false;
      continue;
    }
    const sx = p.X(x);
    const sy = p.Y(y);
    d += started ? ` L${sx},${sy}` : `M${sx},${sy}`;
    started = true;
  }
  return d;
}

export function areaToAxis(
  f: (x: number) => number,
  x0: number,
  x1: number,
  p: PlotMap,
  n = 80,
): string {
  if (x1 <= x0) return '';
  const pts: string[] = [`M${p.X(x0)},${p.y0}`];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push(`L${p.X(x)},${p.Y(f(x))}`);
  }
  pts.push(`L${p.X(x1)},${p.y0} Z`);
  return pts.join(' ');
}

export function ChartFrame({
  plot,
  xLabel,
  yLabel,
  children,
  title,
}: {
  plot: PlotMap;
  xLabel?: string;
  yLabel?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <svg viewBox={`0 0 ${plot.W} ${plot.H}`} className="h-auto w-full" role="img" aria-label={title ?? yLabel ?? 'gráfica'}>
      <line x1={plot.X(plot.xMin)} y1={plot.y0} x2={plot.X(plot.xMax)} y2={plot.y0} stroke={BORDER} />
      <line x1={plot.X(0) >= plot.X(plot.xMin) && plot.X(0) <= plot.X(plot.xMax) ? plot.X(0) : plot.X(plot.xMin)} y1={plot.Y(plot.yMax)} x2={plot.X(0) >= plot.X(plot.xMin) && plot.X(0) <= plot.X(plot.xMax) ? plot.X(0) : plot.X(plot.xMin)} y2={plot.Y(plot.yMin)} stroke={BORDER} />
      {xLabel ? (
        <text x={plot.X(plot.xMax)} y={plot.H - 4} textAnchor="end" fontSize={10} fill={MUTED}>
          {xLabel}
        </text>
      ) : null}
      {yLabel ? (
        <text x={8} y={14} fontSize={10} fill={MUTED}>
          {yLabel}
        </text>
      ) : null}
      {children}
    </svg>
  );
}

export function EnergyBars({
  items,
}: {
  items: Array<{ label: string; value: number; color: string }>;
}) {
  const max = Math.max(1e-9, ...items.map((it) => Math.abs(it.value)));
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 text-[var(--fg-muted)]">{it.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded bg-[var(--border)]">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, (Math.abs(it.value) / max) * 100)}%`,
                background: it.color,
              }}
            />
          </div>
          <span className="w-16 shrink-0 text-right font-mono tabular-nums">{it.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function isoProject(x: number, y: number, z: number, ox: number, oy: number, s: number) {
  return {
    x: ox + (x - y) * s * 0.82,
    y: oy - z * s - (x + y) * s * 0.36,
  };
}

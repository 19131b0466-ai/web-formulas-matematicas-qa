'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { findZeros, fmt } from './calcMath';

type Curve = {
  label: string;
  x: (t: number) => number;
  y: (t: number) => number;
  dx: (t: number) => number;
  dy: (t: number) => number;
  tMin: number;
  tMax: number;
};

const CURVES: Curve[] = [
  { label: 'Cicloide', x: (t) => t - Math.sin(t), y: (t) => 1 - Math.cos(t), dx: (t) => 1 - Math.cos(t), dy: (t) => Math.sin(t), tMin: 0.05, tMax: 4 * Math.PI - 0.05 },
  { label: 'Lissajous 3:2', x: (t) => Math.sin(3 * t), y: (t) => Math.sin(2 * t), dx: (t) => 3 * Math.cos(3 * t), dy: (t) => 2 * Math.cos(2 * t), tMin: 0, tMax: 2 * Math.PI },
  { label: 'Elipse', x: (t) => 3 * Math.cos(t), y: (t) => 2 * Math.sin(t), dx: (t) => -3 * Math.sin(t), dy: (t) => 2 * Math.cos(t), tMin: 0, tMax: 2 * Math.PI },
  { label: 'Cardioide', x: (t) => 2 * Math.cos(t) - Math.cos(2 * t), y: (t) => 2 * Math.sin(t) - Math.sin(2 * t), dx: (t) => -2 * Math.sin(t) + 2 * Math.sin(2 * t), dy: (t) => 2 * Math.cos(t) - 2 * Math.cos(2 * t), tMin: 0, tMax: 2 * Math.PI },
];

const W = 380;
const H = 380;
const M = { l: 28, r: 12, t: 12, b: 28 };

function mapX(v: number, min: number, max: number, Ww = W) {
  return M.l + ((v - min) / (max - min || 1)) * (Ww - M.l - M.r);
}
function mapY(v: number, min: number, max: number, Hh = H) {
  return M.t + ((max - v) / (max - min || 1)) * (Hh - M.t - M.b);
}

export function ParametricTangentViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(2);
  const [showSpec, setShowSpec] = useState(true);
  const [showDer, setShowDer] = useState(true);
  const c = CURVES[idx]!;
  const [t, setT] = useState((c.tMin + c.tMax) / 2);

  const handle = (i: number) => {
    setIdx(i);
    setT((CURVES[i]!.tMin + CURVES[i]!.tMax) / 2);
  };

  const samples = useMemo(() => {
    const n = 360;
    return Array.from({ length: n + 1 }, (_, i) => {
      const ti = c.tMin + (i / n) * (c.tMax - c.tMin);
      return { t: ti, x: c.x(ti), y: c.y(ti) };
    });
  }, [c]);

  const bounds = useMemo(() => {
    const xs = samples.map((s) => s.x);
    const ys = samples.map((s) => s.y);
    const px = (Math.max(...xs) - Math.min(...xs)) * 0.12 || 0.5;
    const py = (Math.max(...ys) - Math.min(...ys)) * 0.12 || 0.5;
    return { xMin: Math.min(...xs) - px, xMax: Math.max(...xs) + px, yMin: Math.min(...ys) - py, yMax: Math.max(...ys) + py };
  }, [samples]);

  const path = samples
    .map((s, i) => `${i === 0 ? 'M' : 'L'}${mapX(s.x, bounds.xMin, bounds.xMax)},${mapY(s.y, bounds.yMin, bounds.yMax)}`)
    .join(' ');

  const xt = c.x(t);
  const yt = c.y(t);
  const dxt = c.dx(t);
  const dyt = c.dy(t);
  const slope = Math.abs(dxt) < 1e-6 ? Infinity : dyt / dxt;
  const hz = useMemo(() => findZeros(c.dy, c.tMin, c.tMax, 400), [c]);
  const vt = useMemo(() => findZeros(c.dx, c.tMin, c.tMax, 400), [c]);

  const cx = mapX(xt, bounds.xMin, bounds.xMax);
  const cy = mapY(yt, bounds.yMin, bounds.yMax);
  const tang = isFinite(slope)
    ? `M${cx - 40},${cy + 40 * slope} L${cx + 40},${cy - 40 * slope}`
    : `M${cx},${cy - 50} L${cx},${cy + 50}`;

  const DW = 200;
  const DH = 90;
  const derPath = (fn: (tt: number) => number) => {
    const vals = samples.map((s) => fn(s.t));
    const lo = Math.min(...vals, 0) - 0.2;
    const hi = Math.max(...vals, 0) + 0.2;
    return samples
      .map((s, i) => `${i === 0 ? 'M' : 'L'}${mapX(s.t, c.tMin, c.tMax, DW)},${mapY(fn(s.t), lo, hi, DH)}`)
      .join(' ');
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
          dy/dx = (dy/dt)/(dx/dt). Si dy/dt = 0 la tangente es horizontal; si dx/dt = 0, vertical.
        </p>
        <div className="flex flex-wrap gap-2">
          {CURVES.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handle(i)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-md" role="img" aria-labelledby={statusId}>
              <path d={path} fill="none" stroke="#3b82f6" opacity={0.45} strokeWidth={2} />
              <path d={tang} stroke="orange" strokeWidth={2} />
              {showSpec
                ? hz.map((ti) => (
                    <circle key={`h${ti}`} cx={mapX(c.x(ti), bounds.xMin, bounds.xMax)} cy={mapY(c.y(ti), bounds.yMin, bounds.yMax)} r={4} fill="#22c55e" />
                  ))
                : null}
              {showSpec
                ? vt.map((ti) => (
                    <circle key={`v${ti}`} cx={mapX(c.x(ti), bounds.xMin, bounds.xMax)} cy={mapY(c.y(ti), bounds.yMin, bounds.yMax)} r={4} fill="#ef4444" />
                  ))
                : null}
              <circle cx={cx} cy={cy} r={6} fill="orange" />
            </svg>
          </div>
          {showDer ? (
            <div className="flex min-w-[200px] flex-1 flex-col gap-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                <p className="px-2 pt-1 text-[10px] uppercase text-[var(--fg-muted)]">dx/dt</p>
                <svg viewBox={`0 0 ${DW} ${DH}`} className="h-auto w-full">
                  <path d={derPath(c.dx)} fill="none" stroke="#ef4444" strokeWidth={1.6} />
                  <line x1={mapX(t, c.tMin, c.tMax, DW)} y1={8} x2={mapX(t, c.tMin, c.tMax, DW)} y2={DH - 8} stroke="orange" strokeDasharray="3 2" />
                </svg>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                <p className="px-2 pt-1 text-[10px] uppercase text-[var(--fg-muted)]">dy/dt</p>
                <svg viewBox={`0 0 ${DW} ${DH}`} className="h-auto w-full">
                  <path d={derPath(c.dy)} fill="none" stroke="#22c55e" strokeWidth={1.6} />
                  <line x1={mapX(t, c.tMin, c.tMax, DW)} y1={8} x2={mapX(t, c.tMin, c.tMax, DW)} y2={DH - 8} stroke="orange" strokeDasharray="3 2" />
                </svg>
              </div>
            </div>
          ) : null}
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          t = {fmt(t, 2)} · (x,y)=({fmt(xt)}, {fmt(yt)}) · dx/dt={fmt(dxt)} · dy/dt={fmt(dyt)} · dy/dx=
          {isFinite(slope) ? fmt(slope) : 'indefinida (vertical)'}
        </div>
        <ControlsStack>
          <SliderRow label={`t = ${fmt(t, 2)}`} value={t} min={c.tMin} max={c.tMax} step={(c.tMax - c.tMin) / 300} onChange={setT} />
          <ToggleRow label="Mostrar puntos horizontales/verticales" checked={showSpec} onChange={setShowSpec} />
          <ToggleRow label="Mostrar panel de derivadas" checked={showDer} onChange={setShowDer} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

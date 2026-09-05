'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type Curve = {
  id: 'cycloid' | 'lissajous32' | 'lissajous54' | 'cardioid' | 'ellipse' | 'spiral' | 'rose4';
  x: (t: number) => number;
  y: (t: number) => number;
  tMin: number;
  tMax: number;
};

const CURVES: Curve[] = [
  { id: 'cycloid', x: (t) => t - Math.sin(t), y: (t) => 1 - Math.cos(t), tMin: 0, tMax: 4 * Math.PI },
  { id: 'lissajous32', x: (t) => Math.sin(3 * t), y: (t) => Math.sin(2 * t), tMin: 0, tMax: 2 * Math.PI },
  { id: 'lissajous54', x: (t) => Math.sin(5 * t), y: (t) => Math.sin(4 * t), tMin: 0, tMax: 2 * Math.PI },
  { id: 'cardioid', x: (t) => 2 * Math.cos(t) - Math.cos(2 * t), y: (t) => 2 * Math.sin(t) - Math.sin(2 * t), tMin: 0, tMax: 2 * Math.PI },
  { id: 'ellipse', x: (t) => 3 * Math.cos(t), y: (t) => 2 * Math.sin(t), tMin: 0, tMax: 2 * Math.PI },
  { id: 'spiral', x: (t) => t * Math.cos(t), y: (t) => t * Math.sin(t), tMin: 0, tMax: 4 * Math.PI },
  { id: 'rose4', x: (t) => Math.cos(2 * t) * Math.cos(t), y: (t) => Math.cos(2 * t) * Math.sin(t), tMin: 0, tMax: 2 * Math.PI },
];

const SPEED = [0.01, 0.03, 0.08];

const XY = { W: 320, H: 320, M: { l: 36, r: 12, t: 12, b: 28 } };
const T = { W: 320, H: 140, M: { l: 36, r: 12, t: 12, b: 28 } };

function mapX(v: number, min: number, max: number, W: number, m: { l: number; r: number }) {
  return m.l + ((v - min) / (max - min || 1)) * (W - m.l - m.r);
}
function mapY(v: number, min: number, max: number, H: number, m: { t: number; b: number }) {
  return m.t + ((max - v) / (max - min || 1)) * (H - m.t - m.b);
}

export function ParametricCurveViz() {
  const statusId = useId();
  const tv = useTranslations('vizCalc');
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showArrows, setShowArrows] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const raf = useRef<number | null>(null);
  const curve = CURVES[idx]!;

  useEffect(() => {
    setT(curve.tMin);
    setPlaying(false);
  }, [idx, curve.tMin]);

  useEffect(() => {
    if (!playing) return;
    const step = () => {
      setT((prev) => {
        const next = prev + SPEED[speed]!;
        if (next >= curve.tMax) return curve.tMin;
        return next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, speed, curve.tMax, curve.tMin]);

  const samples = useMemo(() => {
    const n = 500;
    return Array.from({ length: n + 1 }, (_, i) => {
      const ti = curve.tMin + (i / n) * (curve.tMax - curve.tMin);
      return { t: ti, x: curve.x(ti), y: curve.y(ti) };
    });
  }, [curve]);

  const bounds = useMemo(() => {
    const xs = samples.map((s) => s.x);
    const ys = samples.map((s) => s.y);
    const padX = (Math.max(...xs) - Math.min(...xs)) * 0.12 || 0.5;
    const padY = (Math.max(...ys) - Math.min(...ys)) * 0.12 || 0.5;
    return {
      xMin: Math.min(...xs) - padX,
      xMax: Math.max(...xs) + padX,
      yMin: Math.min(...ys) - padY,
      yMax: Math.max(...ys) + padY,
    };
  }, [samples]);

  const fullPath = useMemo(() => {
    return samples
      .map((s, i) => {
        const sx = mapX(s.x, bounds.xMin, bounds.xMax, XY.W, XY.M);
        const sy = mapY(s.y, bounds.yMin, bounds.yMax, XY.H, XY.M);
        return `${i === 0 ? 'M' : 'L'}${sx},${sy}`;
      })
      .join(' ');
  }, [samples, bounds]);

  const px = curve.x(t);
  const py = curve.y(t);
  const cx = mapX(px, bounds.xMin, bounds.xMax, XY.W, XY.M);
  const cy = mapY(py, bounds.yMin, bounds.yMax, XY.H, XY.M);

  const trail = useMemo(() => {
    const span = (curve.tMax - curve.tMin) * 0.12;
    const from = Math.max(curve.tMin, t - span);
    const n = 40;
    const pts: Array<{ x: number; y: number; a: number }> = [];
    for (let i = 0; i <= n; i++) {
      const ti = from + (i / n) * (t - from);
      pts.push({
        x: mapX(curve.x(ti), bounds.xMin, bounds.xMax, XY.W, XY.M),
        y: mapY(curve.y(ti), bounds.yMin, bounds.yMax, XY.H, XY.M),
        a: i / n,
      });
    }
    return pts;
  }, [curve, t, bounds]);

  const arrows = useMemo(() => {
    if (!showArrows) return [];
    const out: Array<{ x: number; y: number; dx: number; dy: number }> = [];
    const n = 10;
    for (let i = 1; i < n; i++) {
      const ti = curve.tMin + (i / n) * (curve.tMax - curve.tMin);
      const h = 0.05;
      const x0 = curve.x(ti);
      const y0 = curve.y(ti);
      const x1 = curve.x(ti + h);
      const y1 = curve.y(ti + h);
      const sx = mapX(x0, bounds.xMin, bounds.xMax, XY.W, XY.M);
      const sy = mapY(y0, bounds.yMin, bounds.yMax, XY.H, XY.M);
      const ex = mapX(x1, bounds.xMin, bounds.xMax, XY.W, XY.M);
      const ey = mapY(y1, bounds.yMin, bounds.yMax, XY.H, XY.M);
      const len = Math.hypot(ex - sx, ey - sy) || 1;
      out.push({ x: sx, y: sy, dx: ((ex - sx) / len) * 10, dy: ((ey - sy) / len) * 10 });
    }
    return out;
  }, [showArrows, curve, bounds]);

  const tPath = (fn: (tt: number) => number) =>
    samples
      .map((s, i) => {
        const sx = mapX(s.t, curve.tMin, curve.tMax, T.W, T.M);
        const ys = samples.map((p) => fn(p.t));
        const lo = Math.min(...ys) - 0.2;
        const hi = Math.max(...ys) + 0.2;
        const sy = mapY(fn(s.t), lo, hi, T.H, T.M);
        return `${i === 0 ? 'M' : 'L'}${sx},${sy}`;
      })
      .join(' ');

  const xtExt = useMemo(() => {
    const ys = samples.map((s) => s.x);
    return { lo: Math.min(...ys) - 0.2, hi: Math.max(...ys) + 0.2 };
  }, [samples]);
  const ytExt = useMemo(() => {
    const ys = samples.map((s) => s.y);
    return { lo: Math.min(...ys) - 0.2, hi: Math.max(...ys) + 0.2 };
  }, [samples]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{tv('paramCurve.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{tv('paramCurve.note')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {CURVES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {tv(`paramCurve.${c.id}`)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
            <svg viewBox={`0 0 ${XY.W} ${XY.H}`} className="mx-auto h-auto w-full max-w-sm" role="img" aria-labelledby={statusId}>
              <path d={fullPath} fill="none" stroke="currentColor" opacity={0.22} strokeWidth={2} />
              {showTrail
                ? trail.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2} fill="orange" opacity={0.15 + 0.85 * p.a} />)
                : null}
              {arrows.map((a, i) => (
                <polygon
                  key={i}
                  points={`${a.x + a.dx},${a.y + a.dy} ${a.x - a.dy * 0.35},${a.y + a.dx * 0.35} ${a.x + a.dy * 0.35},${a.y - a.dx * 0.35}`}
                  fill="currentColor"
                  opacity={0.45}
                />
              ))}
              <circle cx={cx} cy={cy} r={6} fill="orange" />
              <rect x={cx + 8} y={cy - 18} width={86} height={16} rx={3} fill="var(--formula-bg)" stroke="var(--border)" />
              <text x={cx + 12} y={cy - 6} fontSize={9} fill="currentColor">
                ({fmt(px, 2)}, {fmt(py, 2)})
              </text>
            </svg>
          </div>
          <div className="flex min-w-[240px] flex-1 flex-col gap-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
              <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">x(t), y(t)</p>
              <svg viewBox={`0 0 ${T.W} ${T.H}`} className="h-auto w-full">
                <path d={tPath((tt) => curve.x(tt))} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
                <path d={tPath((tt) => curve.y(tt))} fill="none" stroke="orange" strokeWidth={1.8} />
                <line
                  x1={mapX(t, curve.tMin, curve.tMax, T.W, T.M)}
                  y1={T.M.t}
                  x2={mapX(t, curve.tMin, curve.tMax, T.W, T.M)}
                  y2={T.H - T.M.b}
                  stroke="currentColor"
                  strokeDasharray="4 3"
                  opacity={0.45}
                />
                <circle
                  cx={mapX(t, curve.tMin, curve.tMax, T.W, T.M)}
                  cy={mapY(px, xtExt.lo, xtExt.hi, T.H, T.M)}
                  r={4}
                  fill="#3b82f6"
                />
                <circle
                  cx={mapX(t, curve.tMin, curve.tMax, T.W, T.M)}
                  cy={mapY(py, ytExt.lo, ytExt.hi, T.H, T.M)}
                  r={4}
                  fill="orange"
                />
              </svg>
            </div>
          </div>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm" aria-live="polite">
          t = {fmt(t, 2)} · x(t) = {fmt(px)} · y(t) = {fmt(py)}
        </div>

        <ButtonRow>
          <VizButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? tv('common.pause') : tv('common.play')}
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow
            label={`t = ${fmt(t, 2)}`}
            value={t}
            min={curve.tMin}
            max={curve.tMax}
            step={(curve.tMax - curve.tMin) / 400}
            onChange={(v) => {
              setPlaying(false);
              setT(v);
            }}
          />
          <SliderRow label={[tv('paramCurve.speedSlow'), tv('paramCurve.speedNormal'), tv('paramCurve.speedFast')][speed]!} value={speed} min={0} max={2} step={1} onChange={(v) => setSpeed(Math.round(v))} />
          <ToggleRow label={tv('paramCurve.showArrows')} checked={showArrows} onChange={setShowArrows} />
          <ToggleRow label={tv('paramCurve.showTrail')} checked={showTrail} onChange={setShowTrail} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate } from './calcMath';

type Curve = { label: string; r: (th: number) => number; tMin: number; tMax: number };
const CURVES: Curve[] = [
  { label: 'Rosa 3', r: (th) => Math.cos(3 * th), tMin: 0, tMax: Math.PI },
  { label: 'Rosa 4', r: (th) => Math.cos(2 * th), tMin: 0, tMax: 2 * Math.PI },
  { label: 'Cardioide', r: (th) => 1 + Math.cos(th), tMin: 0, tMax: 2 * Math.PI },
  { label: 'r = 2', r: () => 2, tMin: 0, tMax: 2 * Math.PI },
  { label: 'Limaçon', r: (th) => 1 + 2 * Math.cos(th), tMin: 0, tMax: 2 * Math.PI },
];
const INNER: Curve = { label: 'r=1', r: () => 1, tMin: 0, tMax: 2 * Math.PI };

const CX = 200;
const CY = 200;
const SC = 48;

function toSvg(r: number, th: number) {
  return { sx: CX + r * Math.cos(th) * SC, sy: CY - r * Math.sin(th) * SC };
}

export function PolarAreaViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [two, setTwo] = useState(false);
  const c = CURVES[idx]!;
  const [alpha, setAlpha] = useState(c.tMin);
  const [beta, setBeta] = useState(c.tMax * 0.6);
  const raf = useRef<number | null>(null);

  const handle = (i: number) => {
    setIdx(i);
    setAlpha(CURVES[i]!.tMin);
    setBeta(CURVES[i]!.tMin + 0.8);
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    const step = () => {
      setBeta((prev) => {
        if (prev >= c.tMax) {
          setPlaying(false);
          return c.tMax;
        }
        return prev + 0.03;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, c.tMax]);

  const lo = Math.min(alpha, beta);
  const hi = Math.max(alpha, beta);
  const r2 = (th: number) => (two ? INNER.r(th) : 0);
  const A = useMemo(
    () => 0.5 * integrate((th) => {
      const r = c.r(th);
      const rr = r2(th);
      if (!isFinite(r)) return 0;
      return r * r - rr * rr;
    }, lo, hi),
    [c, lo, hi, two],
  );

  const fullPath = useMemo(() => {
    let d = '';
    let on = false;
    for (let th = c.tMin; th <= c.tMax + 1e-9; th += 0.02) {
      const r = c.r(th);
      if (!isFinite(r)) {
        on = false;
        continue;
      }
      const p = toSvg(r, th);
      d += `${on ? 'L' : 'M'}${p.sx},${p.sy}`;
      on = true;
    }
    return d;
  }, [c]);

  const sectors: string[] = [];
  const step = 0.08;
  for (let th = lo; th < hi; th += step) {
    const th2 = Math.min(hi, th + step);
    const r = Math.abs(c.r((th + th2) / 2));
    if (!isFinite(r)) continue;
    const p0 = toSvg(0, 0);
    const p1 = toSvg(r, th);
    const p2 = toSvg(r, th2);
    const large = th2 - th > Math.PI ? 1 : 0;
    sectors.push(`M${p0.sx},${p0.sy} L${p1.sx},${p1.sy} A${r * SC},${r * SC},0,${large},0,${p2.sx},${p2.sy} Z`);
  }

  const AW = 280;
  const AH = 180;
  const AM = { l: 40, r: 12, t: 12, b: 28 };
  const aPts = useMemo(() => {
    const n = 40;
    return Array.from({ length: n + 1 }, (_, i) => {
      const th = lo + (i / n) * (c.tMax - lo || 0.1);
      const val = 0.5 * integrate((u) => {
        const r = c.r(u);
        return isFinite(r) ? r * r : 0;
      }, lo, th);
      return { th, val };
    });
  }, [c, lo]);
  const aMax = Math.max(...aPts.map((p) => p.val), 0.1);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
          Un sector polar infinitesimal tiene área ½ r² dθ. La integral ½ ∫ r(θ)² dθ suma esos sectores.
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
            <svg viewBox="0 0 400 400" className="mx-auto h-auto w-full max-w-md" role="img" aria-labelledby={statusId}>
              {[1, 2, 3].map((r) => (
                <circle key={r} cx={CX} cy={CY} r={r * SC} fill="none" stroke="currentColor" opacity={0.12} />
              ))}
              {sectors.map((d, i) => (
                <path key={i} d={d} fill={i === sectors.length - 1 ? 'orange' : '#22c55e'} fillOpacity={i === sectors.length - 1 ? 0.45 : 0.22} />
              ))}
              <path d={fullPath} fill="none" stroke="#3b82f6" strokeWidth={2} />
              {two ? <circle cx={CX} cy={CY} r={SC} fill="none" stroke="orange" strokeDasharray="4 3" /> : null}
            </svg>
          </div>
          <div className="min-w-[240px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">A(β)</p>
            <svg viewBox={`0 0 ${AW} ${AH}`} className="h-auto w-full">
              <path
                d={aPts
                  .map(
                    (p, i) =>
                      `${i === 0 ? 'M' : 'L'}${AM.l + ((p.th - lo) / (c.tMax - lo || 1)) * (AW - AM.l - AM.r)},${AM.t + ((aMax - p.val) / aMax) * (AH - AM.t - AM.b)}`,
                  )
                  .join(' ')}
                fill="none"
                stroke="var(--accent-strong)"
                strokeWidth={2}
              />
              <circle
                cx={AM.l + ((hi - lo) / (c.tMax - lo || 1)) * (AW - AM.l - AM.r)}
                cy={AM.t + ((aMax - A) / aMax) * (AH - AM.t - AM.b)}
                r={5}
                fill="orange"
              />
            </svg>
          </div>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          r(β) = {fmt(c.r(hi))} · A = ½ ∫ r² dθ = {fmt(A)} · [α,β]=[{fmt(lo, 2)}, {fmt(hi, 2)}]
        </div>
        <ButtonRow>
          <VizButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? 'Pausar' : 'Animar'}
          </VizButton>
        </ButtonRow>
        <ControlsStack>
          <SliderRow label={`α = ${fmt(alpha, 2)}`} value={alpha} min={c.tMin} max={c.tMax - 0.05} step={0.05} onChange={setAlpha} />
          <SliderRow
            label={`β = ${fmt(beta, 2)}`}
            value={beta}
            min={c.tMin}
            max={c.tMax}
            step={0.05}
            onChange={(v) => {
              setPlaying(false);
              setBeta(v);
            }}
          />
          <ToggleRow label="Área entre dos curvas (r y r=1)" checked={two} onChange={setTwo} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type Example = {
  label: string;
  integral: string;
  a: number;
  b: number;
  u: (t: number) => number;
  v: (t: number) => number;
};

const EXAMPLES: Example[] = [
  { label: 't · eᵗ', integral: '∫ t eᵗ dt', a: 0, b: 1.2, u: (t) => t, v: (t) => Math.exp(t) },
  { label: 't · sen(t)', integral: '∫ t sen(t) dt', a: 0, b: Math.PI, u: (t) => t, v: (t) => Math.sin(t) },
  { label: 'ln(t)', integral: '∫ ln(t) dt', a: 1, b: Math.E, u: (t) => Math.log(t), v: (t) => t },
  { label: 't² · cos(t)', integral: '∫ t² cos(t) dt', a: 0, b: 1.6, u: (t) => t * t, v: (t) => Math.cos(t) },
];

const W = 440;
const H = 380;
const M = { l: 52, r: 20, t: 20, b: 44 };

function toX(u: number, uMin: number, uMax: number) {
  return M.l + ((u - uMin) / (uMax - uMin || 1)) * (W - M.l - M.r);
}
function toY(v: number, vMin: number, vMax: number) {
  return M.t + ((vMax - v) / (vMax - vMin || 1)) * (H - M.t - M.b);
}

export function IntegrationByPartsViz() {
  const tv = useTranslations('vizCalc');
  const statusId = useId();
  const [idx, setIdx] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const ex = EXAMPLES[idx]!;
  const [t, setT] = useState((ex.a + ex.b) / 2);

  const handleEx = (i: number) => {
    setIdx(i);
    const e = EXAMPLES[i]!;
    setT((e.a + e.b) / 2);
  };

  const samples = useMemo(() => {
    const n = 200;
    return Array.from({ length: n + 1 }, (_, i) => {
      const ti = ex.a + (i / n) * (ex.b - ex.a);
      return { t: ti, u: ex.u(ti), v: ex.v(ti) };
    });
  }, [ex]);

  const bounds = useMemo(() => {
    const us = samples.map((s) => s.u);
    const vs = samples.map((s) => s.v);
    const uMin = Math.min(0, ...us);
    const uMax = Math.max(0, ...us);
    const vMin = Math.min(0, ...vs);
    const vMax = Math.max(0, ...vs);
    const pu = (uMax - uMin) * 0.1 || 0.3;
    const pv = (vMax - vMin) * 0.1 || 0.3;
    return { uMin: uMin - pu, uMax: uMax + pu, vMin: vMin - pv, vMax: vMax + pv };
  }, [samples]);

  const ua = ex.u(ex.a);
  const va = ex.v(ex.a);
  const ub = ex.u(ex.b);
  const vb = ex.v(ex.b);
  const ut = ex.u(t);
  const vt = ex.v(t);

  const curve = samples
    .map((s, i) => {
      const x = toX(s.u, bounds.uMin, bounds.uMax);
      const y = toY(s.v, bounds.vMin, bounds.vMax);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const o = { x: toX(0, bounds.uMin, bounds.uMax), y: toY(0, bounds.vMin, bounds.vMax) };
  const pB = { x: toX(ub, bounds.uMin, bounds.uMax), y: toY(vb, bounds.vMin, bounds.vMax) };
  const pA = { x: toX(ua, bounds.uMin, bounds.uMax), y: toY(va, bounds.vMin, bounds.vMax) };

  const under = `${curve} L${pB.x},${o.y} L${pA.x},${o.y} Z`;
  const left = `M${o.x},${pA.y} ${curve.replace(/^M/, 'L')} L${o.x},${pB.y} Z`;

  const uvDelta = ub * vb - ua * va;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{tv('parts.idea')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              type="button"
              onClick={() => handleEx(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-labelledby={statusId}>
            <rect
              x={Math.min(o.x, pB.x)}
              y={Math.min(o.y, pB.y)}
              width={Math.abs(pB.x - o.x)}
              height={Math.abs(pB.y - o.y)}
              fill="none"
              stroke="currentColor"
              opacity={0.25}
            />
            <path d={under} fill="#3b82f6" fillOpacity={0.22} />
            <path d={left} fill="orange" fillOpacity={0.22} />
            <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <line x1={o.x} y1={M.t} x2={o.x} y2={H - M.b} stroke="currentColor" opacity={0.4} />
            <line x1={M.l} y1={o.y} x2={W - M.r} y2={o.y} stroke="currentColor" opacity={0.4} />
            <line
              x1={toX(ut, bounds.uMin, bounds.uMax)}
              y1={toY(vt, bounds.vMin, bounds.vMax)}
              x2={toX(ut, bounds.uMin, bounds.uMax)}
              y2={o.y}
              stroke="orange"
              strokeDasharray="4 3"
            />
            <line
              x1={toX(ut, bounds.uMin, bounds.uMax)}
              y1={toY(vt, bounds.vMin, bounds.vMax)}
              x2={o.x}
              y2={toY(vt, bounds.vMin, bounds.vMax)}
              stroke="orange"
              strokeDasharray="4 3"
            />
            <circle cx={toX(ut, bounds.uMin, bounds.uMax)} cy={toY(vt, bounds.vMin, bounds.vMax)} r={6} fill="orange" />
            {showLabels ? (
              <>
                <text x={(o.x + pB.x) / 2} y={(o.y + toY(vt, bounds.vMin, bounds.vMax)) / 2} textAnchor="middle" fontSize={11} fill="#3b82f6">
                  A = ∫v du
                </text>
                <text x={o.x + 28} y={(o.y + pB.y) / 2} fontSize={11} fill="orange">
                  B = ∫u dv
                </text>
                <text x={(o.x + pB.x) / 2} y={M.t + 14} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
                  A + B = Δ(uv)
                </text>
              </>
            ) : null}
            <text x={W - M.r} y={o.y - 6} textAnchor="end" fontSize={11} opacity={0.5} fill="currentColor">
              u
            </text>
            <text x={o.x + 6} y={M.t + 12} fontSize={11} opacity={0.5} fill="currentColor">
              v
            </text>
          </svg>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>{ex.integral}</p>
          <p>∫ u dv = uv − ∫ v du</p>
          <p>
            t = {fmt(t, 2)} · (u, v) = ({fmt(ut)}, {fmt(vt)})
          </p>
          <p>
            [uv]<sub>a</sub><sup>b</sup> = {fmt(uvDelta)}
          </p>
        </div>

        <ControlsStack>
          <SliderRow
            label={`t = ${fmt(t, 2)}`}
            value={t}
            min={ex.a}
            max={ex.b}
            step={(ex.b - ex.a) / 200}
            onChange={setT}
          />
          <ToggleRow label={tv('parts.showLabels')} checked={showLabels} onChange={setShowLabels} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

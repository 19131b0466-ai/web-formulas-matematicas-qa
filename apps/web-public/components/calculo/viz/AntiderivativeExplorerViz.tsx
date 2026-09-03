'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, safeEval } from './calcMath';

type Pair = {
  label: string;
  f: (x: number) => number;
  F: (x: number, C: number) => number;
  xMin: number;
  xMax: number;
};

const PAIRS: Pair[] = [
  { label: 'xⁿ (n=2)', f: (x) => x * x, F: (x, C) => (x ** 3) / 3 + C, xMin: -2, xMax: 2 },
  { label: 'xⁿ (n=3)', f: (x) => x ** 3, F: (x, C) => (x ** 4) / 4 + C, xMin: -1.6, xMax: 1.6 },
  { label: 'cos(x)', f: (x) => Math.cos(x), F: (x, C) => Math.sin(x) + C, xMin: -Math.PI, xMax: Math.PI },
  { label: 'sen(x)', f: (x) => Math.sin(x), F: (x, C) => -Math.cos(x) + C, xMin: -Math.PI, xMax: Math.PI },
  { label: 'eˣ', f: (x) => Math.exp(x), F: (x, C) => Math.exp(x) + C, xMin: -2, xMax: 2 },
  { label: '1/x', f: (x) => (x !== 0 ? 1 / x : NaN), F: (x, C) => Math.log(Math.abs(x)) + C, xMin: 0.4, xMax: 4 },
  { label: '1/(1+x²)', f: (x) => 1 / (1 + x * x), F: (x, C) => Math.atan(x) + C, xMin: -3, xMax: 3 },
];

const W = 500;
const H = 200;
const M = { l: 44, r: 16, t: 16, b: 28 };

function toX(x: number, a: number, b: number) {
  return M.l + ((x - a) / (b - a || 1)) * (W - M.l - M.r);
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin || 1)) * (H - M.t - M.b);
}

function pathOf(fn: (x: number) => number, a: number, b: number, yMin: number, yMax: number) {
  let d = '';
  let on = false;
  for (let i = 0; i <= 320; i++) {
    const x = a + (i / 320) * (b - a);
    const y = safeEval(fn, x);
    if (!isFinite(y)) {
      on = false;
      continue;
    }
    const sx = toX(x, a, b);
    const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
    d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
    on = true;
  }
  return d;
}

function yRange(fn: (x: number) => number, a: number, b: number) {
  const ys: number[] = [0];
  for (let i = 0; i <= 200; i++) {
    const y = safeEval(fn, a + (i / 200) * (b - a));
    if (isFinite(y)) ys.push(y);
  }
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = (hi - lo) * 0.15 || 0.4;
  return { yMin: lo - pad, yMax: hi + pad };
}

export function AntiderivativeExplorerViz() {
  const statusId = useId();
  const [idx, setIdx] = useState(2);
  const [C, setC] = useState(0);
  const [showT, setShowT] = useState(true);
  const pair = PAIRS[idx]!;
  const [x0, setX0] = useState((pair.xMin + pair.xMax) / 2);

  const handle = (i: number) => {
    setIdx(i);
    setX0((PAIRS[i]!.xMin + PAIRS[i]!.xMax) / 2);
  };

  const Fr = yRange((x) => pair.F(x, C), pair.xMin, pair.xMax);
  const fr = yRange(pair.f, pair.xMin, pair.xMax);
  const Fx = pair.F(x0, C);
  const fx = pair.f(x0);

  const tangent = useMemo(() => {
    const span = (pair.xMax - pair.xMin) * 0.12;
    const x1 = x0 - span;
    const x2 = x0 + span;
    const y1 = Fx + fx * (x1 - x0);
    const y2 = Fx + fx * (x2 - x0);
    return `M${toX(x1, pair.xMin, pair.xMax)},${toY(y1, Fr.yMin, Fr.yMax)} L${toX(x2, pair.xMin, pair.xMax)},${toY(y2, Fr.yMin, Fr.yMax)}`;
  }, [pair, x0, Fx, fx, Fr]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
          F es antiderivada de f si F′(x) = f(x). La pendiente de la tangente a F coincide con el valor de f en el mismo punto.
        </p>
        <div className="flex flex-wrap gap-2">
          {PAIRS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handle(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">F(x)</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <path d={pathOf((x) => pair.F(x, C), pair.xMin, pair.xMax, Fr.yMin, Fr.yMax)} fill="none" stroke="#3b82f6" strokeWidth={2} />
            {showT ? <path d={tangent} stroke="orange" strokeWidth={2} fill="none" /> : null}
            <circle cx={toX(x0, pair.xMin, pair.xMax)} cy={toY(Fx, Fr.yMin, Fr.yMax)} r={5} fill="orange" />
          </svg>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">f(x)</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
            <line
              x1={toX(x0, pair.xMin, pair.xMax)}
              y1={M.t}
              x2={toX(x0, pair.xMin, pair.xMax)}
              y2={H - M.b}
              stroke="orange"
              strokeDasharray="4 3"
            />
            <path d={pathOf(pair.f, pair.xMin, pair.xMax, fr.yMin, fr.yMax)} fill="none" stroke="orange" strokeWidth={2} />
            <circle cx={toX(x0, pair.xMin, pair.xMax)} cy={toY(fx, fr.yMin, fr.yMax)} r={5} fill="orange" />
          </svg>
        </div>
        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          x₀ = {fmt(x0, 3)} · F(x₀) = {fmt(Fx)} · F′(x₀) = f(x₀) = {fmt(fx)}
        </div>
        <ControlsStack>
          <SliderRow label={`x₀ = ${fmt(x0, 2)}`} value={x0} min={pair.xMin} max={pair.xMax} step={0.05} onChange={setX0} />
          <SliderRow label={`C = ${fmt(C, 1)}`} value={C} min={-3} max={3} step={0.5} onChange={setC} />
          <ToggleRow label="Mostrar recta tangente" checked={showT} onChange={setShowT} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

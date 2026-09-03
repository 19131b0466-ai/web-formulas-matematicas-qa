'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { findZeros, fmt, integrate, safeEval } from './calcMath';

type FnOption = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };

const FN_OPTIONS: FnOption[] = [
  { label: 'sen(x)', f: (x) => Math.sin(x), aDefault: 0, bDefault: 2 * Math.PI },
  { label: 'x² − 2', f: (x) => x * x - 2, aDefault: -2, bDefault: 2 },
  { label: 'x(x−1)(x−2)', f: (x) => x * (x - 1) * (x - 2), aDefault: -0.4, bDefault: 2.4 },
  { label: 'cos(x)', f: (x) => Math.cos(x), aDefault: 0, bDefault: 2 * Math.PI },
  { label: 'x − 1', f: (x) => x - 1, aDefault: -1, bDefault: 3 },
];

const W = 500;
const H = 280;
const M = { l: 44, r: 16, t: 16, b: 36 };
const plotW = W - M.l - M.r;
const plotH = H - M.t - M.b;

function toX(x: number, xMin: number, xMax: number) {
  return M.l + ((x - xMin) / (xMax - xMin)) * plotW;
}
function toY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin)) * plotH;
}

function shadePath(
  f: (x: number) => number,
  a: number,
  b: number,
  yMin: number,
  yMax: number,
  positive: boolean,
): string {
  const steps = 360;
  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  let d = '';
  let inside = false;
  let lastX = a;
  for (let i = 0; i <= steps; i++) {
    const x = a + (i / steps) * (b - a);
    const y = safeEval(f, x);
    if (!isFinite(y)) {
      if (inside) {
        d += ` L${toX(lastX, a, b)},${y0} Z`;
        inside = false;
      }
      continue;
    }
    const match = positive ? y >= 0 : y < 0;
    const sx = toX(x, a, b);
    const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
    if (match) {
      if (!inside) {
        d += `M${sx},${y0} L${sx},${sy}`;
        inside = true;
      } else {
        d += ` L${sx},${sy}`;
      }
    } else if (inside) {
      d += ` L${toX(lastX, a, b)},${y0} Z`;
      inside = false;
    }
    lastX = x;
  }
  if (inside) d += ` L${toX(lastX, a, b)},${y0} Z`;
  return d;
}

export function SignedAreaViz() {
  const statusId = useId();
  const [fnIdx, setFnIdx] = useState(0);
  const [showParts, setShowParts] = useState(true);
  const { f, aDefault, bDefault } = FN_OPTIONS[fnIdx]!;
  const [a, setA] = useState(aDefault);
  const [b, setB] = useState(bDefault);

  const handleFnChange = (idx: number) => {
    setFnIdx(idx);
    setA(FN_OPTIONS[idx]!.aDefault);
    setB(FN_OPTIONS[idx]!.bDefault);
  };

  const zeros = useMemo(() => findZeros(f, a, b), [f, a, b]);
  const signed = useMemo(() => integrate(f, a, b), [f, a, b]);
  const geometric = useMemo(() => integrate((x) => Math.abs(safeEval(f, x)), a, b), [f, a, b]);
  const positive = (geometric + signed) / 2;
  const negative = (geometric - signed) / 2;

  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    for (let i = 0; i <= 240; i++) {
      const y = safeEval(f, a + (i / 240) * (b - a));
      if (isFinite(y)) ys.push(y);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const pad = (hi - lo) * 0.14 || 0.5;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [f, a, b]);

  const curvePath = useMemo(() => {
    let d = '';
    let on = false;
    for (let i = 0; i <= 400; i++) {
      const x = a + (i / 400) * (b - a);
      const y = safeEval(f, x);
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
  }, [f, a, b, yMin, yMax]);

  const posPath = useMemo(() => shadePath(f, a, b, yMin, yMax, true), [f, a, b, yMin, yMax]);
  const negPath = useMemo(() => shadePath(f, a, b, yMin, yMax, false), [f, a, b, yMin, yMax]);

  const y0 = toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
  const xTicks: number[] = [];
  const xStep = b - a > 6 ? 1 : 0.5;
  for (let v = Math.ceil(a / xStep) * xStep; v <= b + 1e-9; v += xStep) xTicks.push(+v.toFixed(2));

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            La integral definida mide <strong>área con signo</strong>: las zonas bajo el eje x restan. Dos regiones iguales de signos opuestos se cancelan aunque el área geométrica sea positiva.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Prueba sen(x) de 0 a 2π: la integral vale 0 y el área geométrica vale 4. Luego reduce el intervalo a [0, π].
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--fg-muted)]">f(x) =</span>
          {FN_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleFnChange(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === fnIdx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-labelledby={statusId}>
            <path d={posPath} fill="#22c55e" fillOpacity={0.28} />
            <path d={negPath} fill="#ef4444" fillOpacity={0.28} />
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.7} strokeWidth={1.8} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.4} />
            {xTicks.map((v) => (
              <text key={v} x={toX(v, a, b)} y={y0 + 14} textAnchor="middle" fontSize={9} opacity={0.5} fill="currentColor">
                {v}
              </text>
            ))}
            <path d={curvePath} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            {zeros.map((z) => (
              <circle key={z} cx={toX(z, a, b)} cy={y0} r={4} fill="currentColor" />
            ))}
            <text x={W - M.r} y={y0 - 6} textAnchor="end" fontSize={10} opacity={0.5} fill="currentColor">
              x
            </text>
            <text x={M.l + 6} y={M.t + 11} fontSize={10} opacity={0.5} fill="currentColor">
              f(x)
            </text>
          </svg>
        </div>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 text-sm"
          aria-live="polite"
        >
          <div className="grid gap-1 font-mono text-xs sm:grid-cols-2">
            <span>
              ∫<sub>{fmt(a, 2)}</sub>
              <sup>{fmt(b, 2)}</sup> f = <strong>{fmt(signed)}</strong>
            </span>
            <span>
              ∫ |f| = <strong>{fmt(geometric)}</strong>
            </span>
            {showParts ? (
              <>
                <span className="text-green-600 dark:text-green-400">A⁺ = {fmt(positive)}</span>
                <span className="text-red-500">A⁻ = {fmt(negative)}</span>
              </>
            ) : null}
          </div>
          {showParts ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              Relación: ∫f = A⁺ − A⁻ = {fmt(positive)} − {fmt(negative)}
            </p>
          ) : null}
        </div>

        <ControlsStack>
          <SliderRow label={`a = ${fmt(a, 2)}`} value={a} min={-Math.PI} max={b - 0.1} step={0.1} onChange={setA} />
          <SliderRow label={`b = ${fmt(b, 2)}`} value={b} min={a + 0.1} max={Math.PI + 4} step={0.1} onChange={setB} />
          <ToggleRow label="Separar zonas positivas y negativas" checked={showParts} onChange={setShowParts} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

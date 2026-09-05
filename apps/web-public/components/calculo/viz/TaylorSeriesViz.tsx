'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, safeEval } from './calcMath';

// ─── Taylor series definitions ────────────────────────────────────────────────

type TaylorFn = {
  label: string;
  f: (x: number) => number;
  /** Coefficients of the Maclaurin/Taylor series centered at a=0 */
  coeff: (k: number, a: number) => number;
  /** For display: LaTeX-style text */
  formula: string;
  xMin: number;
  xMax: number;
  /** True if radius of convergence is finite */
  R?: number;
};

// Factorial helper
function fact(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

const TAYLOR_FNS: TaylorFn[] = [
  {
    label: 'eˣ',
    f: (x) => Math.exp(x),
    coeff: (k, a) => Math.exp(a) / fact(k),   // e^a / k!
    formula: 'eˣ = Σ xⁿ/n!',
    xMin: -3, xMax: 3,
  },
  {
    label: 'sen(x)',
    f: (x) => Math.sin(x),
    coeff: (k) => {
      // Only odd terms: k=1,3,5,... → (-1)^((k-1)/2) / k!
      if (k % 2 === 0) return 0;
      return (k % 4 === 1 ? 1 : -1) / fact(k);
    },
    formula: 'sen(x) = x − x³/3! + x⁵/5! − …',
    xMin: -Math.PI, xMax: Math.PI,
  },
  {
    label: 'cos(x)',
    f: (x) => Math.cos(x),
    coeff: (k) => {
      if (k % 2 === 1) return 0;
      return (k % 4 === 0 ? 1 : -1) / fact(k);
    },
    formula: 'cos(x) = 1 − x²/2! + x⁴/4! − …',
    xMin: -Math.PI, xMax: Math.PI,
  },
  {
    label: 'ln(1+x)',
    f: (x) => Math.log(1 + x),
    coeff: (k) => {
      if (k === 0) return 0;
      return (k % 2 === 1 ? 1 : -1) / k;
    },
    formula: 'ln(1+x) = x − x²/2 + x³/3 − …',
    xMin: -0.9, xMax: 1.5,
    R: 1,
  },
  {
    label: '1/(1−x)',
    f: (x) => 1 / (1 - x),
    coeff: () => 1,   // all coefficients = 1
    formula: '1/(1−x) = Σ xⁿ',
    xMin: -0.9, xMax: 0.9,
    R: 1,
  },
  {
    label: 'arctan(x)',
    f: (x) => Math.atan(x),
    coeff: (k) => {
      if (k % 2 === 0) return 0;
      const m = (k - 1) / 2;
      return (m % 2 === 0 ? 1 : -1) / k;
    },
    formula: 'arctan(x) = x − x³/3 + x⁵/5 − …',
    xMin: -1.5, xMax: 1.5,
    R: 1,
  },
];

// ─── Evaluate Taylor polynomial ───────────────────────────────────────────────

function taylorPoly(
  coeff: (k: number, a: number) => number,
  a: number,
  n: number,
  x: number,
): number {
  let sum = 0;
  for (let k = 0; k <= n; k++) {
    const c = coeff(k, a);
    if (!isFinite(c)) continue;
    sum += c * Math.pow(x - a, k);
  }
  return sum;
}

// ─── SVG helpers ─────────────────────────────────────────────────────────────

const W = 500;
const H_APPROX = 240, H_ERROR = 150;
const M = { l: 44, r: 16, t: 14, b: 28 };
const plotW = W - M.l - M.r;

function toX(v: number, xMin: number, xMax: number) {
  return M.l + ((v - xMin) / (xMax - xMin)) * plotW;
}
function toYf(v: number, yMin: number, yMax: number, H: number) {
  return M.t + ((yMax - v) / (yMax - yMin)) * (H - M.t - M.b);
}

function buildCurvePath(
  fn: (x: number) => number,
  xMin: number, xMax: number,
  yMin: number, yMax: number,
  H: number,
  steps = 400,
  clip = 20,
): string {
  let d = '';
  let on = false;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    const y = safeEval(fn, x);
    if (!isFinite(y) || Math.abs(y) > clip) { on = false; continue; }
    const sx = toX(x, xMin, xMax);
    const sy = toYf(Math.max(yMin, Math.min(yMax, y)), yMin, yMax, H);
    d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
    on = true;
  }
  return d;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TaylorSeriesViz() {
  const t = useTranslations('vizCopy');
  const tv = useTranslations('vizCalc');
  const statusId = useId();
  const [fnIdx, setFnIdx]         = useState(0);
  const [degree, setDegree]       = useState(4);
  const [center, setCenter]       = useState(0);
  const [showError, setShowError] = useState(true);
  const [showGoodZone, setShowGoodZone] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [xProbe, setXProbe]       = useState(0.5);

  const tfn = TAYLOR_FNS[fnIdx]!;
  const { f, coeff, xMin, xMax, R } = tfn;

  // ── Y range for approximation panel ──────────────────────────────────────
  const { yMin, yMax } = useMemo(() => {
    const ys: number[] = [0];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const fy = safeEval(f, x);
      const py = taylorPoly(coeff, center, degree, x);
      if (isFinite(fy))  ys.push(fy);
      if (isFinite(py) && Math.abs(py) < 20) ys.push(py);
    }
    const rawMin = Math.min(...ys);
    const rawMax = Math.max(...ys);
    const pad = (rawMax - rawMin) * 0.12 || 0.5;
    return { yMin: rawMin - pad, yMax: rawMax + pad };
  }, [f, coeff, center, degree, xMin, xMax]);

  // ── Error range ───────────────────────────────────────────────────────────
  const { eMax } = useMemo(() => {
    const errs: number[] = [];
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const fy = safeEval(f, x);
      const py = taylorPoly(coeff, center, degree, x);
      if (isFinite(fy) && isFinite(py)) errs.push(Math.abs(fy - py));
    }
    return { eMax: Math.min(Math.max(...errs, 0.01) * 1.15, 5) };
  }, [f, coeff, center, degree, xMin, xMax]);

  // ── Paths ─────────────────────────────────────────────────────────────────
  const fPath = useMemo(
    () => buildCurvePath(f, xMin, xMax, yMin, yMax, H_APPROX),
    [f, xMin, xMax, yMin, yMax],
  );
  const pPath = useMemo(
    () => buildCurvePath(
      (x) => taylorPoly(coeff, center, degree, x),
      xMin, xMax, yMin, yMax, H_APPROX,
    ),
    [coeff, center, degree, xMin, xMax, yMin, yMax],
  );
  const errPath = useMemo(
    () => buildCurvePath(
      (x) => {
        const fy = safeEval(f, x);
        const py = taylorPoly(coeff, center, degree, x);
        return isFinite(fy) && isFinite(py) ? Math.abs(fy - py) : NaN;
      },
      xMin, xMax, 0, eMax, H_ERROR,
    ),
    [f, coeff, center, degree, xMin, xMax, eMax],
  );

  // ── "Good approximation" zone (error < 0.05) ──────────────────────────────
  const goodZone = useMemo(() => {
    if (!showGoodZone) return null;
    let lo: number | null = null, hi: number | null = null;
    const steps = 500;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const fy = safeEval(f, x);
      const py = taylorPoly(coeff, center, degree, x);
      const err = isFinite(fy) && isFinite(py) ? Math.abs(fy - py) : Infinity;
      if (err < 0.05) {
        if (lo === null) lo = x;
        hi = x;
      }
    }
    if (lo === null || hi === null) return null;
    return { lo, hi };
  }, [f, coeff, center, degree, xMin, xMax, showGoodZone]);

  // ── Probe values ──────────────────────────────────────────────────────────
  const probeFy = safeEval(f, xProbe);
  const probePy = taylorPoly(coeff, center, degree, xProbe);
  const probeErr = isFinite(probeFy) && isFinite(probePy) ? Math.abs(probeFy - probePy) : NaN;

  // ── Axis ticks ────────────────────────────────────────────────────────────
  const xRange = xMax - xMin;
  const xStep = xRange > 4 ? 1 : 0.5;
  const xTicks: number[] = [];
  for (let v = Math.ceil(xMin / xStep) * xStep; v <= xMax + 0.01; v += xStep)
    xTicks.push(+v.toFixed(3));

  const yStep = (yMax - yMin) > 8 ? 2 : 1;
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep)
    yTicks.push(+v.toFixed(2));

  // ── Polynomial terms text ─────────────────────────────────────────────────
  const termsText = useMemo(() => {
    const parts: string[] = [];
    for (let k = 0; k <= Math.min(degree, 8); k++) {
      const c = coeff(k, center);
      if (!isFinite(c) || Math.abs(c) < 1e-12) continue;
      const power = k === 0 ? '' : k === 1 ? '·x' : `·x^${k}`;
      parts.push(`${c >= 0 && parts.length > 0 ? '+' : ''}${+c.toFixed(5)}${power}`);
    }
    if (degree > 8) parts.push('…');
    return parts.join(' ');
  }, [coeff, center, degree]);

  // ─ SVG helpers ──────────────────────────────────────────────────────────
  const tx = (x: number) => toX(x, xMin, xMax);
  const ty = (y: number) => toYf(Math.max(yMin, Math.min(yMax, y)), yMin, yMax, H_APPROX);
  const te = (y: number) => toYf(Math.max(0, Math.min(eMax, y)), 0, eMax, H_ERROR);
  const y0approx = ty(0);
  const y0err = te(0);

  return (
    <VizPanel>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{tv('taylor.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{tv.rich('taylor.note', { strong: (c) => <strong>{c}</strong> })}</p>
        </div>

        {/* Function selector */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--fg-muted)]">f(x) =</span>
          {TAYLOR_FNS.map((opt, i) => (
            <button key={opt.label} type="button" onClick={() => { setFnIdx(i); setCenter(0); setXProbe(0.5); }}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === fnIdx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Convergence radius note */}
        {R !== undefined && (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 text-xs text-[var(--fg-muted)]">
            ⚠ {tv('taylor.radiusWarn', { R, center })}
          </p>
        )}

        {/* Approximation panel */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
            {tv('taylor.approx')}<sub>{degree}</sub>(x)
          </p>
          <svg viewBox={`0 0 ${W} ${H_APPROX}`} className="mx-auto h-auto w-full max-w-2xl" role="img">
            {/* Good zone */}
            {goodZone && showGoodZone && (
              <rect
                x={tx(goodZone.lo)} y={M.t}
                width={Math.max(0, tx(goodZone.hi) - tx(goodZone.lo))}
                height={H_APPROX - M.t - M.b}
                fill="#22c55e" fillOpacity={0.08}
              />
            )}

            {/* Grid */}
            {xTicks.map(v => (
              <line key={`gx${v}`} x1={tx(v)} y1={M.t} x2={tx(v)} y2={H_APPROX - M.b}
                stroke="currentColor" opacity={0.07} />
            ))}
            {yTicks.map(v => (
              <line key={`gy${v}`} x1={M.l} y1={ty(v)} x2={W - M.r} y2={ty(v)}
                stroke="currentColor" opacity={0.07} />
            ))}

            {/* Axes */}
            <line x1={M.l} y1={y0approx} x2={W - M.r} y2={y0approx} stroke="currentColor" opacity={0.4} strokeWidth={1.1} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H_APPROX - M.b} stroke="currentColor" opacity={0.4} strokeWidth={1.1} />

            {/* Tick labels */}
            {xTicks.map(v => (
              <text key={`xl${v}`} x={tx(v)} y={y0approx + 12} textAnchor="middle" fontSize={9} opacity={0.5} fill="currentColor">
                {v}
              </text>
            ))}
            {yTicks.filter(v => v !== 0).map(v => (
              <text key={`yl${v}`} x={M.l - 4} y={ty(v) + 3} textAnchor="end" fontSize={9} opacity={0.5} fill="currentColor">
                {v}
              </text>
            ))}

            {/* Center marker */}
            <line x1={tx(center)} y1={M.t} x2={tx(center)} y2={H_APPROX - M.b}
              stroke="currentColor" strokeDasharray="4 3" opacity={0.25} />
            <text x={tx(center)} y={M.t + 10} textAnchor="middle" fontSize={9} opacity={0.45} fill="currentColor">
              a={center}
            </text>

            {/* Taylor polynomial (drawn first, behind f) */}
            <path d={pPath} fill="none" stroke="orange" strokeWidth={2} opacity={0.85} />

            {/* f(x) */}
            <path d={fPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.5} />

            {/* Probe point */}
            {isFinite(probeFy) && (
              <circle cx={tx(xProbe)} cy={ty(probeFy)} r={4} fill="var(--accent-strong)" />
            )}
            {isFinite(probePy) && Math.abs(probePy) < 20 && (
              <circle cx={tx(xProbe)} cy={ty(probePy)} r={4} fill="orange" />
            )}
            {isFinite(probeFy) && isFinite(probePy) && Math.abs(probePy) < 20 && (
              <line x1={tx(xProbe)} y1={ty(probeFy)} x2={tx(xProbe)} y2={ty(probePy)}
                stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
            )}

            {/* Legend */}
            <g transform={`translate(${W - M.r - 80}, ${M.t + 4})`}>
              <line x1={0} y1={6} x2={18} y2={6} stroke="var(--accent-strong)" strokeWidth={2.5} />
              <text x={22} y={10} fontSize={9} fill="currentColor" opacity={0.7}>f(x)</text>
              <line x1={0} y1={18} x2={18} y2={18} stroke="orange" strokeWidth={2} />
              <text x={22} y={22} fontSize={9} fill="currentColor" opacity={0.7}>P_{degree}(x)</text>
            </g>
          </svg>
        </div>

        {/* Error panel */}
        {showError && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              Error |f(x) − P<sub>{degree}</sub>(x)|
            </p>
            <svg viewBox={`0 0 ${W} ${H_ERROR}`} className="mx-auto h-auto w-full max-w-2xl" role="img">
              {/* Reference lines */}
              {[0.1, 0.01].map(eps => (
                <g key={eps}>
                  <line x1={M.l} y1={te(eps)} x2={W - M.r} y2={te(eps)}
                    stroke="#ef4444" strokeOpacity={0.3} strokeDasharray="4 3" />
                  <text x={M.l + 2} y={te(eps) - 2} fontSize={8} fill="#ef4444" opacity={0.5}>ε={eps}</text>
                </g>
              ))}

              {/* Axes */}
              <line x1={M.l} y1={y0err} x2={W - M.r} y2={y0err} stroke="currentColor" opacity={0.35} strokeWidth={1} />
              <line x1={M.l} y1={M.t} x2={M.l} y2={H_ERROR - M.b} stroke="currentColor" opacity={0.35} strokeWidth={1} />

              {/* Error curve */}
              <path d={errPath} fill="none" stroke="#ef4444" strokeWidth={1.8} />

              {/* Probe error */}
              {isFinite(probeErr) && probeErr <= eMax && (
                <circle cx={tx(xProbe)} cy={te(probeErr)} r={3.5} fill="#ef4444" />
              )}

              {/* x ticks */}
              {xTicks.map(v => (
                <text key={v} x={tx(v)} y={H_ERROR - M.b + 12} textAnchor="middle" fontSize={9} opacity={0.45} fill="currentColor">
                  {v}
                </text>
              ))}
            </svg>
          </div>
        )}

        {/* Polynomial terms */}
        {showTerms && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
              P<sub>{degree}</sub>(x) =
            </p>
            <p className="mt-1 break-all font-mono text-xs text-[var(--fg)]">{termsText}</p>
          </div>
        )}

        {/* Status */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <span>x₀ = {fmt(xProbe, 3)}</span>
            <span>f(x₀) = {fmt(probeFy, 5)}</span>
            <span>P<sub>{degree}</sub>(x₀) = {fmt(probePy, 5)}</span>
            <span className="text-[var(--fg-muted)]">Error = {fmt(probeErr, 5)}</span>
          </div>
        </div>

        {/* Controls */}
        <ControlsStack>
          <SliderRow label={`Grado n = ${degree}`} value={degree} min={1} max={12} step={1}
            onChange={v => setDegree(Math.round(v))} />
          <SliderRow label={`Centro a = ${center}`} value={center} min={-2} max={2} step={0.25}
            onChange={v => setCenter(v)} />
          <SliderRow
            label={`${tv('taylor.probe')} = ${fmt(xProbe, 2)}`}
            value={xProbe} min={xMin} max={xMax} step={(xMax - xMin) / 200}
            onChange={v => setXProbe(v)}
          />
          <ToggleRow label={t('showError')} checked={showError} onChange={setShowError} />
          <ToggleRow label={tv('taylor.showZone')} checked={showGoodZone} onChange={setShowGoodZone} />
          <ToggleRow label={tv('taylor.showTerms')} checked={showTerms} onChange={setShowTerms} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

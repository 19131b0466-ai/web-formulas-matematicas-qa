'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { derivative, fmt, integrate, linspace, safeEval } from './calcMath';

// ─── Predefined functions ────────────────────────────────────────────────────

type FnOption = {
  label: string;
  f: (x: number) => number;
  aDefault: number;
  bDefault: number;
  xDefault: number;
};

const FN_OPTIONS: FnOption[] = [
  { label: 'sen(t)',     f: (t) => Math.sin(t),    aDefault: 0,   bDefault: 2 * Math.PI, xDefault: Math.PI / 2 },
  { label: 'cos(t)',     f: (t) => Math.cos(t),    aDefault: 0,   bDefault: 2 * Math.PI, xDefault: Math.PI / 3 },
  { label: 't − 2',     f: (t) => t - 2,           aDefault: 0,   bDefault: 4,           xDefault: 2.5 },
  { label: 't² − 4',    f: (t) => t * t - 4,       aDefault: -3,  bDefault: 3,           xDefault: 1   },
  { label: 'e^(−t)',    f: (t) => Math.exp(-t),    aDefault: 0,   bDefault: 4,           xDefault: 1.5 },
];

const W = 500, H_EACH = 190;
const M = { l: 44, r: 16, t: 14, b: 28 };
const plotW = W - M.l - M.r;
const plotH = H_EACH - M.t - M.b;

function toX(v: number, min: number, max: number) {
  return M.l + ((v - min) / (max - min)) * plotW;
}
function toY(v: number, min: number, max: number) {
  return M.t + ((max - v) / (max - min)) * plotH;
}

function axisY0(yMin: number, yMax: number): number {
  return toY(Math.max(yMin, Math.min(yMax, 0)), yMin, yMax);
}

function buildPath(
  f: (x: number) => number,
  a: number,
  b: number,
  yMin: number,
  yMax: number,
): string {
  const steps = 400;
  let d = '';
  let started = false;
  for (let i = 0; i <= steps; i++) {
    const x = a + (i / steps) * (b - a);
    const y = safeEval(f, x);
    if (!isFinite(y)) { started = false; continue; }
    const sx = toX(x, a, b);
    const sy = toY(Math.max(yMin, Math.min(yMax, y)), yMin, yMax);
    d += started ? ` L${sx},${sy}` : `M${sx},${sy}`;
    started = true;
  }
  return d;
}

function computeYRange(f: (x: number) => number, a: number, b: number, extra = 0.15) {
  const ys: number[] = [0];
  for (let i = 0; i <= 300; i++) {
    const y = safeEval(f, a + (i / 300) * (b - a));
    if (isFinite(y)) ys.push(y);
  }
  const rawMin = Math.min(...ys);
  const rawMax = Math.max(...ys);
  const pad = (rawMax - rawMin) * extra || 0.5;
  return { yMin: rawMin - pad, yMax: rawMax + pad };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TFCAccumulationViz() {
  const statusId = useId();
  const [fnIdx, setFnIdx] = useState(0);
  const [showTangent, setShowTangent] = useState(true);
  const [showNegativeRed, setShowNegativeRed] = useState(true);

  const { f, aDefault, bDefault, xDefault } = FN_OPTIONS[fnIdx]!;
  const a = aDefault;
  const b = bDefault;
  const [x, setX] = useState(xDefault);

  const handleFnChange = (idx: number) => {
    setFnIdx(idx);
    setX(FN_OPTIONS[idx]!.xDefault);
  };

  // ── f panel range ─────────────────────────────────────────────────────────
  const { yMin: fYMin, yMax: fYMax } = useMemo(
    () => computeYRange(f, a, b),
    [f, a, b],
  );

  // ── G(x) values over [a, b] ───────────────────────────────────────────────
  const GPoints = useMemo(() => {
    const steps = 200;
    return linspace(a, b, steps).map((xi) => ({
      x: xi,
      G: integrate(f, a, xi),
    }));
  }, [f, a, b]);

  const GYMin = useMemo(() => {
    const vals = GPoints.map(p => p.G);
    const mn = Math.min(...vals, 0);
    const mx = Math.max(...vals, 0);
    const pad = (mx - mn) * 0.15 || 0.5;
    return { gYMin: mn - pad, gYMax: mx + pad };
  }, [GPoints]);
  const { gYMin, gYMax } = GYMin;

  // ── Current values ────────────────────────────────────────────────────────
  const Gx    = useMemo(() => integrate(f, a, x), [f, a, x]);
  const fx    = safeEval(f, x);
  const Gprime = derivative(f, x);  // G'(x) = f(x), verify numerically

  // ── Shaded area path (f panel) ────────────────────────────────────────────
  const shadedPath = useMemo(() => {
    const steps = 300;
    const points: Array<{ x: number; y: number }> = [];
    const xEnd = x;
    for (let i = 0; i <= steps; i++) {
      const xi = a + (i / steps) * (xEnd - a);
      const yi = safeEval(f, xi);
      if (isFinite(yi)) points.push({ x: xi, y: yi });
    }
    if (points.length < 2) return { pos: '', neg: '' };

    // Split into positive and negative segments
    const seg = (filter: (y: number) => boolean) => {
      let d = '';
      let inside = false;
      for (let i = 0; i < points.length; i++) {
        const p = points[i]!;
        const sx = toX(p.x, a, b);
        const sy = toY(Math.max(fYMin, Math.min(fYMax, p.y)), fYMin, fYMax);
        if (filter(p.y)) {
          if (!inside) {
            const y0 = toY(Math.max(fYMin, Math.min(fYMax, 0)), fYMin, fYMax);
            d += `M${sx},${y0} L${sx},${sy}`;
            inside = true;
          } else {
            d += ` L${sx},${sy}`;
          }
        } else if (inside) {
          const prev = points[i - 1]!;
          const px = toX(prev.x, a, b);
          const y0 = toY(Math.max(fYMin, Math.min(fYMax, 0)), fYMin, fYMax);
          d += ` L${px},${y0} Z`;
          inside = false;
        }
      }
      if (inside) {
        const last = points[points.length - 1]!;
        const y0 = toY(Math.max(fYMin, Math.min(fYMax, 0)), fYMin, fYMax);
        d += ` L${toX(last.x, a, b)},${y0} Z`;
      }
      return d;
    };

    return { pos: seg(y => y >= 0), neg: seg(y => y < 0) };
  }, [f, a, b, x, fYMin, fYMax]);

  // ── Curve paths ───────────────────────────────────────────────────────────
  const fPath  = useMemo(() => buildPath(f, a, b, fYMin, fYMax), [f, a, b, fYMin, fYMax]);
  const GPath  = useMemo(() => {
    let d = '';
    GPoints.forEach((p, i) => {
      const sx = toX(p.x, a, b);
      const sy = toY(Math.max(gYMin, Math.min(gYMax, p.G)), gYMin, gYMax);
      d += i === 0 ? `M${sx},${sy}` : ` L${sx},${sy}`;
    });
    return d;
  }, [GPoints, a, b, gYMin, gYMax]);

  // ── Tangent line at (x, G(x)) ─────────────────────────────────────────────
  const tangentPath = useMemo(() => {
    if (!showTangent || !isFinite(Gx) || !isFinite(fx)) return '';
    const slope = fx;
    const span = (b - a) * 0.08;
    const x1 = x - span, x2 = x + span;
    const y1 = Gx + slope * (x1 - x);
    const y2 = Gx + slope * (x2 - x);
    const sx1 = toX(x1, a, b), sx2 = toX(x2, a, b);
    const sy1 = toY(Math.max(gYMin, Math.min(gYMax, y1)), gYMin, gYMax);
    const sy2 = toY(Math.max(gYMin, Math.min(gYMax, y2)), gYMin, gYMax);
    return `M${sx1},${sy1} L${sx2},${sy2}`;
  }, [showTangent, Gx, fx, x, a, b, gYMin, gYMax]);

  // ── Axis ticks ────────────────────────────────────────────────────────────
  const xRange = b - a;
  const xStep = xRange > 8 ? 2 : xRange > 4 ? 1 : 0.5;
  const xTicks: number[] = [];
  for (let v = Math.ceil(a / xStep) * xStep; v <= b; v += xStep) xTicks.push(+v.toFixed(4));

  const fTicks: number[] = [];
  const fRange = fYMax - fYMin;
  const fStep = fRange > 6 ? 2 : 1;
  for (let v = Math.ceil(fYMin / fStep) * fStep; v <= fYMax; v += fStep) fTicks.push(v);

  const gTicks: number[] = [];
  const gRange = gYMax - gYMin;
  const gStep = gRange > 6 ? 2 : gRange > 3 ? 1 : 0.5;
  for (let v = Math.ceil(gYMin / gStep) * gStep; v <= gYMax; v += gStep) gTicks.push(+v.toFixed(4));

  // ── Shared panel render ───────────────────────────────────────────────────
  function renderPanel(
    title: string,
    path: string,
    yMin: number,
    yMax: number,
    yTicks: number[],
    extras: React.ReactNode,
  ) {
    const y0 = axisY0(yMin, yMax);
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
        <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">
          {title}
        </p>
        <svg viewBox={`0 0 ${W} ${H_EACH}`} className="mx-auto h-auto w-full max-w-2xl" role="img">
          {/* Grid */}
          {xTicks.map(v => (
            <line key={`gx${v}`} x1={toX(v, a, b)} y1={M.t} x2={toX(v, a, b)} y2={H_EACH - M.b}
              stroke="currentColor" opacity={0.07} />
          ))}
          {yTicks.map(v => (
            <line key={`gy${v}`} x1={M.l} y1={toY(v, yMin, yMax)} x2={W - M.r} y2={toY(v, yMin, yMax)}
              stroke="currentColor" opacity={0.07} />
          ))}

          {extras}

          {/* Axes */}
          <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.45} strokeWidth={1.2} />
          <line x1={M.l} y1={M.t} x2={M.l} y2={H_EACH - M.b} stroke="currentColor" opacity={0.45} strokeWidth={1.2} />

          {/* Tick labels */}
          {xTicks.map(v => (
            <text key={`xl${v}`} x={toX(v, a, b)} y={y0 + 12} textAnchor="middle" fontSize={9} opacity={0.55} fill="currentColor">
              {+v.toFixed(2)}
            </text>
          ))}
          {yTicks.filter(v => v !== 0).map(v => (
            <text key={`yl${v}`} x={M.l - 4} y={toY(v, yMin, yMax) + 3} textAnchor="end" fontSize={9} opacity={0.55} fill="currentColor">
              {+v.toFixed(2)}
            </text>
          ))}

          {/* Curve */}
          <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        </svg>
      </div>
    );
  }

  const xSvg = toX(x, a, b);

  return (
    <VizPanel>
      <div className="space-y-4">
        {/* Educational header */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            <strong>TFC Parte I:</strong> Si G(x) = ∫<sub>a</sub><sup>x</sup> f(t) dt, entonces G′(x) = f(x).
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve el slider de <strong>x</strong>. El área sombreada en el panel superior crece o decrece con G(x). La pendiente de la tangente en G (panel inferior) siempre iguala a f(x).
          </p>
        </div>

        {/* Function selector */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--fg-muted)]">f(t) =</span>
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

        {/* Panel 1: f(t) with shaded area */}
        {renderPanel(
          `f(t) — área acumulada hasta x = ${fmt(x, 2)}`,
          fPath,
          fYMin, fYMax, fTicks,
          <>
            {/* Positive shaded area */}
            {shadedPath.pos && (
              <path d={shadedPath.pos} fill="var(--accent-strong)" fillOpacity={0.25} stroke="none" />
            )}
            {/* Negative shaded area */}
            {showNegativeRed && shadedPath.neg && (
              <path d={shadedPath.neg} fill="#ef4444" fillOpacity={0.25} stroke="none" />
            )}
            {/* Vertical line at x */}
            <line x1={xSvg} y1={M.t} x2={xSvg} y2={H_EACH - M.b}
              stroke="orange" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
            {/* Point on curve */}
            {isFinite(fx) && (
              <circle cx={xSvg} cy={toY(Math.max(fYMin, Math.min(fYMax, fx)), fYMin, fYMax)}
                r={5} fill="orange" />
            )}
          </>,
        )}

        {/* Panel 2: G(x) */}
        {renderPanel(
          `G(x) = ∫₍ₐ₎ˣ f(t) dt — función acumulada`,
          GPath,
          gYMin, gYMax, gTicks,
          <>
            {/* Tangent line */}
            {tangentPath && (
              <path d={tangentPath} stroke="orange" strokeWidth={2} fill="none" opacity={0.9} />
            )}
            {/* Vertical line at x */}
            <line x1={xSvg} y1={M.t} x2={xSvg} y2={H_EACH - M.b}
              stroke="orange" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} />
            {/* Point on G */}
            {isFinite(Gx) && (
              <circle cx={xSvg} cy={toY(Math.max(gYMin, Math.min(gYMax, Gx)), gYMin, gYMax)}
                r={5} fill="orange" />
            )}
          </>,
        )}

        {/* Status */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>x = <strong>{fmt(x, 3)}</strong></span>
            <span>f(x) = <strong>{fmt(fx, 4)}</strong></span>
            <span>G(x) = <strong>{fmt(Gx, 4)}</strong></span>
            <span className="text-[var(--fg-muted)]">G′(x) = f(x) = {fmt(Gprime, 4)}</span>
          </div>
        </div>

        {/* Controls */}
        <ControlsStack>
          <SliderRow
            label={`x = ${fmt(x, 3)}`}
            value={x} min={a} max={b} step={(b - a) / 200}
            onChange={v => setX(v)}
          />
          <ToggleRow label="Mostrar recta tangente en G(x)" checked={showTangent} onChange={setShowTangent} />
          <ToggleRow label="Mostrar área negativa en rojo" checked={showNegativeRed} onChange={setShowNegativeRed} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

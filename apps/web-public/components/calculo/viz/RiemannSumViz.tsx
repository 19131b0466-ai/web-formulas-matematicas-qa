'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, riemannSum, safeEval, type SumType } from './calcMath';

// ─── Predefined functions ───────────────────────────────────────────────────

type FnOption = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };

const FN_OPTIONS: FnOption[] = [
  { label: 'x²',       f: (x) => x * x,                       aDefault: 0,  bDefault: 3  },
  { label: 'x³ − 3x',  f: (x) => x * x * x - 3 * x,           aDefault: -2, bDefault: 2  },
  { label: 'sin(x)',   f: (x) => Math.sin(x),                  aDefault: 0,  bDefault: Math.PI },
  { label: 'eˣ',       f: (x) => Math.exp(x),                  aDefault: 0,  bDefault: 2  },
  { label: '√x',       f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), aDefault: 0, bDefault: 4 },
  { label: '1/x',      f: (x) => (x !== 0 ? 1 / x : NaN),     aDefault: 1,  bDefault: 4  },
];

// ─── SVG helpers ────────────────────────────────────────────────────────────

const W = 480, H = 280;
const M = { l: 44, r: 16, t: 16, b: 32 };
const plotW = W - M.l - M.r;
const plotH = H - M.t - M.b;

function toSvgX(x: number, xMin: number, xMax: number) {
  return M.l + ((x - xMin) / (xMax - xMin)) * plotW;
}
function toSvgY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin)) * plotH;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function RiemannSumViz() {
  const t = useTranslations('vizRiemann');
  const statusId = useId();

  const [fnIdx, setFnIdx]     = useState(0);
  const [sumType, setSumType] = useState<SumType>('left');
  const [n, setN]             = useState(6);
  const [showError, setShowError] = useState(true);
  const [hoveredRect, setHoveredRect] = useState<number | null>(null);
  const SUM_TYPES: { label: string; value: SumType }[] = [
    { label: t('left'), value: 'left' },
    { label: t('right'), value: 'right' },
    { label: t('midpoint'), value: 'midpoint' },
    { label: t('trapezoid'), value: 'trapezoid' },
  ];

  const { f, aDefault, bDefault } = FN_OPTIONS[fnIdx]!;
  const [a, setA] = useState(aDefault);
  const [b, setB] = useState(bDefault);

  // Reset a/b when function changes
  const handleFnChange = (idx: number) => {
    setFnIdx(idx);
    setA(FN_OPTIONS[idx]!.aDefault);
    setB(FN_OPTIONS[idx]!.bDefault);
  };

  // ── Compute curve points ─────────────────────────────────────────────────
  const curvePoints = useMemo(() => {
    const pts: string[] = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a);
      const y = safeEval(f, x);
      if (isFinite(y)) pts.push(`${x},${y}`);
    }
    return pts;
  }, [f, a, b]);

  // ── Compute rectangles ───────────────────────────────────────────────────
  const rects = useMemo(() => {
    const dx = (b - a) / n;
    return Array.from({ length: n }, (_, i) => {
      const x0 = a + i * dx;
      const x1 = x0 + dx;
      let height: number;
      let sampleX: number;
      if (sumType === 'left')      { sampleX = x0;           height = safeEval(f, x0); }
      else if (sumType === 'right') { sampleX = x1;           height = safeEval(f, x1); }
      else if (sumType === 'midpoint') { sampleX = (x0+x1)/2; height = safeEval(f, (x0+x1)/2); }
      else                          { sampleX = (x0+x1)/2;   height = (safeEval(f,x0)+safeEval(f,x1))/2; }
      return { x0, x1, height, sampleX, area: isFinite(height) ? height * dx : 0 };
    });
  }, [f, a, b, n, sumType]);

  // ── Compute sum and exact integral ───────────────────────────────────────
  const sumValue = useMemo(
    () => riemannSum(f, a, b, n, sumType),
    [f, a, b, n, sumType],
  );
  const exactValue = useMemo(() => integrate(f, a, b), [f, a, b]);
  const error = Math.abs(sumValue - exactValue);

  // ── Compute SVG scale ────────────────────────────────────────────────────
  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const xs = [a, b];
    const ys: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const y = safeEval(f, a + (i / 200) * (b - a));
      if (isFinite(y)) ys.push(y);
    }
    rects.forEach(r => { if (isFinite(r.height)) ys.push(r.height); });
    ys.push(0);
    const rawYMin = Math.min(...ys);
    const rawYMax = Math.max(...ys);
    const pad = (rawYMax - rawYMin) * 0.12 || 0.5;
    return {
      xMin: xs[0]! - 0.1,
      xMax: xs[1]! + 0.1,
      yMin: rawYMin - pad,
      yMax: rawYMax + pad,
    };
  }, [f, a, b, rects]);

  const tx = (x: number) => toSvgX(x, xMin, xMax);
  const ty = (y: number) => toSvgY(y, yMin, yMax);
  const y0svg = ty(Math.max(yMin, Math.min(yMax, 0)));

  // Build curve path
  const curvePath = useMemo(() => {
    const steps = 400;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const x = a + (i / steps) * (b - a);
      const y = safeEval(f, x);
      if (!isFinite(y)) continue;
      const sx = tx(x), sy = ty(y);
      d += i === 0 ? `M${sx},${sy}` : ` L${sx},${sy}`;
    }
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, a, b, xMin, xMax, yMin, yMax]);

  // Axis ticks
  const xTicks = useMemo(() => {
    const step = (xMax - xMin) > 8 ? 2 : 1;
    const ticks: number[] = [];
    for (let v = Math.ceil(xMin); v <= xMax; v += step) ticks.push(v);
    return ticks;
  }, [xMin, xMax]);
  const yTicks = useMemo(() => {
    const range = yMax - yMin;
    const step = range > 10 ? 5 : range > 4 ? 2 : 1;
    const ticks: number[] = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) ticks.push(v);
    return ticks;
  }, [yMin, yMax]);

  const rectOpacity = n > 50 ? 0.3 : 0.6;
  const strokeOpacity = n > 50 ? 0.3 : 0.8;

  const hovered = hoveredRect !== null ? rects[hoveredRect] : null;

  return (
    <VizPanel>
      <div className="space-y-4">
        {/* Educational header */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('ideaNote')}</p>
        </div>

        {/* Function selector */}
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

        {/* Sum type buttons */}
        <ButtonRow>
          {SUM_TYPES.map(({ label, value }) => (
            <VizButton key={value} active={sumType === value} onClick={() => setSumType(value)}>
              {label}
            </VizButton>
          ))}
        </ButtonRow>

        {/* SVG graph */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto w-full max-w-2xl"
            role="img"
            aria-labelledby={statusId}
          >
            {/* Grid lines */}
            {xTicks.map(v => (
              <line key={`gx${v}`} x1={tx(v)} y1={M.t} x2={tx(v)} y2={H - M.b}
                stroke="currentColor" opacity={0.07} />
            ))}
            {yTicks.map(v => (
              <line key={`gy${v}`} x1={M.l} y1={ty(v)} x2={W - M.r} y2={ty(v)}
                stroke="currentColor" opacity={0.07} />
            ))}

            {/* Rectangles / trapezoids (drawn below curve) */}
            {rects.map((r, i) => {
              if (!isFinite(r.height)) return null;
              const rx0 = tx(r.x0);
              const rx1 = tx(r.x1);
              const isHovered = hoveredRect === i;

              if (sumType === 'trapezoid') {
                const fy0 = ty(safeEval(f, r.x0));
                const fy1 = ty(safeEval(f, r.x1));
                const pathD = `M${rx0},${y0svg} L${rx0},${fy0} L${rx1},${fy1} L${rx1},${y0svg} Z`;
                return (
                  <path
                    key={i}
                    d={pathD}
                    fill="var(--accent-strong)"
                    fillOpacity={isHovered ? 0.55 : rectOpacity * 0.6}
                    stroke="var(--accent-strong)"
                    strokeOpacity={isHovered ? 1 : strokeOpacity}
                    strokeWidth={isHovered ? 1.5 : 1}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredRect(i)}
                    onMouseLeave={() => setHoveredRect(null)}
                  />
                );
              }
              const topY = r.height >= 0 ? ty(r.height) : y0svg;
              const botY = r.height >= 0 ? y0svg : ty(r.height);
              return (
                <rect
                  key={i}
                  x={rx0}
                  y={topY}
                  width={Math.max(0, rx1 - rx0 - 0.5)}
                  height={Math.max(0, botY - topY)}
                  fill="var(--accent-strong)"
                  fillOpacity={isHovered ? 0.55 : rectOpacity * 0.6}
                  stroke="var(--accent-strong)"
                  strokeOpacity={isHovered ? 1 : strokeOpacity}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRect(i)}
                  onMouseLeave={() => setHoveredRect(null)}
                />
              );
            })}

            {/* Axes */}
            <line x1={M.l} y1={y0svg} x2={W - M.r} y2={y0svg} stroke="currentColor" opacity={0.5} strokeWidth={1.2} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.5} strokeWidth={1.2} />

            {/* Axis ticks & labels */}
            {xTicks.map(v => (
              <g key={`xt${v}`}>
                <line x1={tx(v)} y1={y0svg - 3} x2={tx(v)} y2={y0svg + 3} stroke="currentColor" opacity={0.5} />
                <text x={tx(v)} y={y0svg + 13} textAnchor="middle" fontSize={9} opacity={0.6} fill="currentColor">{v}</text>
              </g>
            ))}
            {yTicks.map(v => v !== 0 && (
              <g key={`yt${v}`}>
                <line x1={M.l - 3} y1={ty(v)} x2={M.l + 3} y2={ty(v)} stroke="currentColor" opacity={0.5} />
                <text x={M.l - 5} y={ty(v) + 4} textAnchor="end" fontSize={9} opacity={0.6} fill="currentColor">{v}</text>
              </g>
            ))}
            <text x={W - M.r} y={y0svg - 5} textAnchor="end" fontSize={10} opacity={0.5} fill="currentColor">x</text>
            <text x={M.l + 6} y={M.t + 10} fontSize={10} opacity={0.5} fill="currentColor">f(x)</text>

            {/* Curve (on top) */}
            <path d={curvePath} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />

            {/* Sample points */}
            {rects.map((r, i) => {
              if (!isFinite(r.height)) return null;
              return (
                <circle
                  key={i}
                  cx={tx(r.sampleX)}
                  cy={ty(r.height)}
                  r={hoveredRect === i ? 4 : 2.5}
                  fill={hoveredRect === i ? 'orange' : 'var(--accent-strong)'}
                  opacity={0.9}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRect(i)}
                  onMouseLeave={() => setHoveredRect(null)}
                />
              );
            })}

            {/* Hovered rect tooltip */}
            {hovered && isFinite(hovered.height) && (() => {
              const mx = tx((hovered.x0 + hovered.x1) / 2);
              const topY = ty(Math.max(hovered.height, 0));
              return (
                <g>
                  <rect x={mx - 32} y={topY - 22} width={64} height={16} rx={3}
                    fill="var(--formula-bg)" stroke="var(--border)" strokeWidth={1} />
                  <text x={mx} y={topY - 11} textAnchor="middle" fontSize={9} fill="currentColor">
                    A={fmt(hovered.area, 3)}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Status panel */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>S<sub>n</sub> = <strong>{fmt(sumValue)}</strong></span>
            <span>{t('exactI')} = <strong>{fmt(exactValue)}</strong></span>
            {showError && <span>{t('error')} = <strong>{fmt(error)}</strong></span>}
            <span className="text-[var(--fg-muted)]">n = {n}</span>
          </div>
          {showError && n < 80 && (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              {t('errorShrinks')}
            </p>
          )}
        </div>

        {/* Controls */}
        <ControlsStack>
          <SliderRow label={t('nSubintervals')} value={n} min={1} max={100} step={1}
            onChange={v => setN(Math.round(v))} />
          <SliderRow
            label={`a = ${fmt(a, 2)}`}
            value={a} min={-5} max={b - 0.5} step={0.5}
            onChange={v => setA(v)}
          />
          <SliderRow
            label={`b = ${fmt(b, 2)}`}
            value={b} min={a + 0.5} max={8} step={0.5}
            onChange={v => setB(v)}
          />
          <ToggleRow label={t('showError')} checked={showError} onChange={setShowError} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { solveODE } from './calcMath';

// ─── ODE definitions ─────────────────────────────────────────────────────────

type ODEOption = {
  label: string;
  formula: string;
  f: (x: number, y: number) => number;
};

const ODE_OPTIONS: ODEOption[] = [
  { label: 'y',           formula: "dy/dx = y",              f: (_x, y)  => y },
  { label: '−y',          formula: "dy/dx = −y",             f: (_x, y)  => -y },
  { label: 'x',           formula: "dy/dx = x",              f: (x)      => x },
  { label: 'x + y',       formula: "dy/dx = x + y",          f: (x, y)   => x + y },
  { label: 'y(1−y)',      formula: "dy/dx = y(1−y)",         f: (_x, y)  => y * (1 - y) },
  { label: '−x/y',        formula: "dy/dx = −x/y",           f: (x, y)   => y !== 0 ? -x / y : NaN },
  { label: 'sen(x)cos(y)',formula: "dy/dx = sen(x)·cos(y)",  f: (x, y)   => Math.sin(x) * Math.cos(y) },
  { label: 'y² − x',      formula: "dy/dx = y² − x",         f: (x, y)   => y * y - x },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const W = 520, H = 400;
const M = { l: 44, r: 16, t: 16, b: 36 };
const plotW = W - M.l - M.r;
const plotH = H - M.t - M.b;

const COLORS = ['orange', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];
const Y_LIMIT = 25;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSvgX(x: number, xMin: number, xMax: number) {
  return M.l + ((x - xMin) / (xMax - xMin)) * plotW;
}
function toSvgY(y: number, yMin: number, yMax: number) {
  return M.t + ((yMax - y) / (yMax - yMin)) * plotH;
}

// ─── Component ───────────────────────────────────────────────────────────────

type Solution = { x0: number; y0: number; color: string };

export function DirectionFieldViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const svgRef = useRef<SVGSVGElement>(null);

  const [odeIdx, setOdeIdx]     = useState(0);
  const [density, setDensity]   = useState(14);     // grid n×n
  const [arrowLen, setArrowLen] = useState(0.55);   // arrow half-length in world units
  const [colorByMag, setColorByMag] = useState(false);
  const [solutions, setSolutions]   = useState<Solution[]>([]);
  const [colorIdx, setColorIdx]     = useState(0);

  const xMin = -4, xMax = 4, yMin = -4, yMax = 4;

  const ode = ODE_OPTIONS[odeIdx]!;

  // ── Direction field arrows ────────────────────────────────────────────────
  const arrows = useMemo(() => {
    const result: Array<{ x1: number; y1: number; x2: number; y2: number; angle: number }> = [];
    const dx = (xMax - xMin) / density;
    const dy = (yMax - yMin) / density;
    const halfArrowWorld = arrowLen / 2;

    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const wx = xMin + (i + 0.5) * dx;
        const wy = yMin + (j + 0.5) * dy;
        const slope = ode.f(wx, wy);
        if (!isFinite(slope)) continue;

        // Normalize direction vector (1, slope)
        const len = Math.sqrt(1 + slope * slope);
        const ndx = 1 / len;
        const ndy = slope / len;

        const wx1 = wx - halfArrowWorld * ndx;
        const wy1 = wy - halfArrowWorld * ndy;
        const wx2 = wx + halfArrowWorld * ndx;
        const wy2 = wy + halfArrowWorld * ndy;

        result.push({
          x1: toSvgX(wx1, xMin, xMax),
          y1: toSvgY(wy1, yMin, yMax),
          x2: toSvgX(wx2, xMin, xMax),
          y2: toSvgY(wy2, yMin, yMax),
          angle: Math.atan2(slope, 1),
        });
      }
    }
    return result;
  }, [ode, density, arrowLen, xMin, xMax, yMin, yMax]);

  // ── Compute solution paths ────────────────────────────────────────────────
  const solutionPaths = useMemo(() => {
    return solutions.map(({ x0, y0, color }) => {
      const h = 0.03;
      const steps = 200;
      const fwd = solveODE(ode.f, x0, y0,  h, steps, Y_LIMIT);
      const bwd = solveODE(ode.f, x0, y0, -h, steps, Y_LIMIT);
      // combine: bwd reversed (skip first pt = x0,y0) + fwd
      const allPts = [...bwd.slice(1).reverse(), ...fwd];

      let d = '';
      let on = false;
      for (const pt of allPts) {
        if (pt.x < xMin - 0.2 || pt.x > xMax + 0.2 || pt.y < yMin - 0.2 || pt.y > yMax + 0.2) {
          on = false; continue;
        }
        const sx = toSvgX(pt.x, xMin, xMax);
        const sy = toSvgY(pt.y, yMin, yMax);
        d += on ? ` L${sx},${sy}` : `M${sx},${sy}`;
        on = true;
      }
      return { d, color, x0, y0 };
    });
  }, [solutions, ode, xMin, xMax, yMin, yMax]);

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const svgY = ((e.clientY - rect.top) / rect.height) * H;
    const mathX = xMin + ((svgX - M.l) / plotW) * (xMax - xMin);
    const mathY = yMax - ((svgY - M.t) / plotH) * (yMax - yMin);
    if (mathX < xMin || mathX > xMax || mathY < yMin || mathY > yMax) return;
    if (solutions.length >= 5) return;
    const color = COLORS[colorIdx % COLORS.length]!;
    setSolutions(prev => [...prev, { x0: mathX, y0: mathY, color }]);
    setColorIdx(ci => ci + 1);
  }, [solutions.length, colorIdx, xMin, xMax, yMin, yMax]);

  const clearSolutions = () => { setSolutions([]); setColorIdx(0); };

  // ── Arrow color ───────────────────────────────────────────────────────────
  function arrowColor(angle: number): string {
    if (!colorByMag) return 'currentColor';
    const mag = Math.abs(Math.tan(angle));
    const t = Math.min(mag / 5, 1);
    const r = Math.round(59 + t * (239 - 59));
    const g = Math.round(130 + t * (68 - 130));
    const b = Math.round(246 + t * (68 - 246));
    return `rgb(${r},${g},${b})`;
  }

  // ── Arrowhead path ────────────────────────────────────────────────────────
  function arrowHead(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) return '';
    const ux = dx / len, uy = dy / len;
    const size = 4;
    const bx = x2 - ux * size, by = y2 - uy * size;
    const lx = bx - uy * size * 0.4, ly = by + ux * size * 0.4;
    const rx = bx + uy * size * 0.4, ry = by - ux * size * 0.4;
    return `M${lx},${ly} L${x2},${y2} L${rx},${ry}`;
  }

  // ── Grid ticks ────────────────────────────────────────────────────────────
  const ticks: number[] = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const x0svg = toSvgX(0, xMin, xMax);
  const y0svg = toSvgY(0, yMin, yMax);

  return (
    <VizPanel>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            {t.rich('direction.idea', { strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {t.rich('direction.note', { strong: (chunks) => <strong>{chunks}</strong> })}
          </p>
        </div>

        {/* ODE selector */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--fg-muted)]">dy/dx =</span>
          {ODE_OPTIONS.map((opt, i) => (
            <button key={opt.label} type="button"
              onClick={() => { setOdeIdx(i); clearSolutions(); }}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === odeIdx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <ButtonRow>
          <VizButton onClick={clearSolutions}>
            {t('direction.clear', { n: solutions.length })}
          </VizButton>
        </ButtonRow>

        {/* SVG */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto w-full max-w-2xl cursor-crosshair"
            role="img"
            aria-labelledby={statusId}
            onClick={handleSvgClick}
          >
            {/* Background grid */}
            {ticks.map(v => (
              <g key={v}>
                <line x1={toSvgX(v, xMin, xMax)} y1={M.t} x2={toSvgX(v, xMin, xMax)} y2={H - M.b}
                  stroke="currentColor" opacity={0.08} />
                <line x1={M.l} y1={toSvgY(v, yMin, yMax)} x2={W - M.r} y2={toSvgY(v, yMin, yMax)}
                  stroke="currentColor" opacity={0.08} />
              </g>
            ))}

            {/* Arrows */}
            {arrows.map((a, i) => {
              const col = arrowColor(a.angle);
              return (
                <g key={i} opacity={0.7}>
                  <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                    stroke={col} strokeWidth={1} />
                  <path d={arrowHead(a.x1, a.y1, a.x2, a.y2)}
                    stroke={col} strokeWidth={1} fill="none" />
                </g>
              );
            })}

            {/* Solution curves */}
            {solutionPaths.map((sp, i) => (
              <g key={i}>
                <path d={sp.d} fill="none" stroke={sp.color} strokeWidth={2.2} opacity={0.9} />
                <circle
                  cx={toSvgX(sp.x0, xMin, xMax)}
                  cy={toSvgY(sp.y0, yMin, yMax)}
                  r={5} fill={sp.color}
                />
              </g>
            ))}

            {/* Axes */}
            <line x1={M.l} y1={y0svg} x2={W - M.r} y2={y0svg}
              stroke="currentColor" opacity={0.45} strokeWidth={1.3} />
            <line x1={x0svg} y1={M.t} x2={x0svg} y2={H - M.b}
              stroke="currentColor" opacity={0.45} strokeWidth={1.3} />

            {/* Axis labels and ticks */}
            {ticks.map(v => (
              <g key={`l${v}`}>
                {v !== 0 && <>
                  <line x1={toSvgX(v, xMin, xMax)} y1={y0svg - 3} x2={toSvgX(v, xMin, xMax)} y2={y0svg + 3}
                    stroke="currentColor" opacity={0.4} />
                  <text x={toSvgX(v, xMin, xMax)} y={y0svg + 13} textAnchor="middle"
                    fontSize={9} opacity={0.5} fill="currentColor">{v}</text>
                  <line x1={x0svg - 3} y1={toSvgY(v, yMin, yMax)} x2={x0svg + 3} y2={toSvgY(v, yMin, yMax)}
                    stroke="currentColor" opacity={0.4} />
                  <text x={x0svg - 6} y={toSvgY(v, yMin, yMax) + 3} textAnchor="end"
                    fontSize={9} opacity={0.5} fill="currentColor">{v}</text>
                </>}
              </g>
            ))}
            <text x={W - M.r} y={y0svg - 5} textAnchor="end" fontSize={10} opacity={0.45} fill="currentColor">x</text>
            <text x={x0svg + 6} y={M.t + 11} fontSize={10} opacity={0.45} fill="currentColor">y</text>

            {/* Click instruction if no solutions */}
            {solutions.length === 0 && (
              <text x={W / 2} y={H - M.b - 8} textAnchor="middle" fontSize={10} opacity={0.4} fill="currentColor">
                {t('direction.click')}
              </text>
            )}
          </svg>
        </div>

        {/* Status */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 text-sm"
          aria-live="polite"
        >
          <p className="font-mono">{ode.formula}</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Soluciones trazadas: {solutions.length}/5
            {solutions.length > 0 && ' · ' + solutions.map(s => `y(${+s.x0.toFixed(2)}) = ${+s.y0.toFixed(2)}`).join('  ')}
          </p>
        </div>

        {/* Controls */}
        <ControlsStack>
          <SliderRow label={`Densidad del campo (${density}×${density})`}
            value={density} min={8} max={24} step={1}
            onChange={v => setDensity(Math.round(v))} />
          <SliderRow label="Longitud de flecha"
            value={arrowLen} min={0.2} max={0.9} step={0.05}
            onChange={v => setArrowLen(v)} />
          <ToggleRow label={t('direction.colorByMag')} checked={colorByMag} onChange={setColorByMag} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

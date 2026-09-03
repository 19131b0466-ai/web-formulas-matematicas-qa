'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt, integrate, safeEval } from './calcMath';

// ─── Functions ───────────────────────────────────────────────────────────────

type FnOption = { label: string; f: (x: number) => number; aDefault: number; bDefault: number };
const FN_OPTIONS: FnOption[] = [
  { label: '√x',       f: (x) => Math.sqrt(Math.max(0, x)),  aDefault: 0, bDefault: 4 },
  { label: 'x²',       f: (x) => x * x,                       aDefault: 0, bDefault: 2 },
  { label: 'sen(x)+1', f: (x) => Math.sin(x) + 1,             aDefault: 0, bDefault: Math.PI },
  { label: '2 − x/2',  f: (x) => 2 - x / 2,                  aDefault: 0, bDefault: 4 },
  { label: 'e^(−x/2)', f: (x) => Math.exp(-x / 2),           aDefault: 0, bDefault: 3 },
];

// ─── Isometric projection helpers ────────────────────────────────────────────
// World: x → horizontal axis of revolution, r → radius (vertical in 3D)
// Isometric: world (x, r) → svg (sx, sy) with oblique projection for depth

const ISO_DX  = 1;       // horizontal pixel per world x unit
const ISO_DRY = 1;       // vertical pixel per world r unit (up = negative svg y)
const ISO_PERSP = 0.30;  // perspective factor for "depth" ellipse rx

/** Map world (x, r_y) to SVG, where r_y is the vertical component of radius */
function iso(
  wx: number, wr: number,
  ox: number, oy: number,
  scaleX: number, scaleR: number,
): { sx: number; sy: number } {
  return {
    sx: ox + wx * scaleX,
    sy: oy - wr * scaleR,
  };
}

// ─── SVG dimensions ──────────────────────────────────────────────────────────
const W = 520, H = 320;
const OX = 60, OY = H / 2 + 10;  // origin of the x-axis in SVG

// ─── Ellipse drawing ─────────────────────────────────────────────────────────
function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  // SVG ellipse as path
  return `M${cx - rx},${cy} A${rx},${ry},0,0,1,${cx + rx},${cy} A${rx},${ry},0,0,1,${cx - rx},${cy} Z`;
}

// ─── Component ───────────────────────────────────────────────────────────────

type Mode = 'disk' | 'washer' | 'axisY';

export function SolidsOfRevolutionViz() {
  const statusId = useId();
  const [fnIdx, setFnIdx]     = useState(0);
  const [mode, setMode]       = useState<Mode>('disk');
  const [angle, setAngle]     = useState(360);     // degrees of rotation shown
  const [nDisks, setNDisks]   = useState(12);
  const [showCut, setShowCut] = useState(false);

  const { f, aDefault, bDefault } = FN_OPTIONS[fnIdx]!;
  const [a, setA] = useState(aDefault);
  const [b, setB] = useState(bDefault);

  const handleFnChange = (idx: number) => {
    setFnIdx(idx);
    setA(FN_OPTIONS[idx]!.aDefault);
    setB(FN_OPTIONS[idx]!.bDefault);
  };

  // ── Scale so the solid fits inside the SVG ────────────────────────────────
  const { scaleX, scaleR } = useMemo(() => {
    const rMax = Math.max(...Array.from({ length: 100 }, (_, i) => {
      return Math.abs(safeEval(f, a + (i / 99) * (b - a)));
    }).filter(isFinite), 0.5);
    const availW = W - OX - 40;
    const availH = (H / 2) - 20;
    return {
      scaleX: Math.min(availW / (b - a), 80),
      scaleR: Math.min(availH / rMax, 50),
    };
  }, [f, a, b]);

  // ── Disk data ─────────────────────────────────────────────────────────────
  const disks = useMemo(() => {
    return Array.from({ length: nDisks }, (_, i) => {
      const xi = a + ((i + 0.5) / nDisks) * (b - a);
      const r  = Math.abs(safeEval(f, xi));
      return { xi, r };
    });
  }, [f, a, b, nDisks]);

  // ── Volume ────────────────────────────────────────────────────────────────
  const volume = useMemo(() => {
    if (mode === 'axisY') {
      // V = 2π ∫ x·f(x) dx (shell method around y-axis)
      return 2 * Math.PI * integrate((x) => x * Math.abs(safeEval(f, x)), a, b);
    }
    // V = π ∫ [f(x)]² dx
    return Math.PI * integrate((x) => safeEval(f, x) ** 2, a, b);
  }, [f, a, b, mode]);

  // ── Profile curve path ────────────────────────────────────────────────────
  const profilePath = useMemo(() => {
    const steps = 300;
    let upper = '', lower = '';
    for (let i = 0; i <= steps; i++) {
      const xi = a + (i / steps) * (b - a);
      const r  = Math.abs(safeEval(f, xi));
      if (!isFinite(r)) continue;
      const p = iso(xi, r, OX, OY, scaleX, scaleR);
      const q = iso(xi, -r, OX, OY, scaleX, scaleR);
      upper += i === 0 ? `M${p.sx},${p.sy}` : ` L${p.sx},${p.sy}`;
      lower += i === 0 ? `M${q.sx},${q.sy}` : ` L${q.sx},${q.sy}`;
    }
    return { upper, lower };
  }, [f, a, b, scaleX, scaleR]);

  // ── Angle factor (0 to 1 of circle shown) ────────────────────────────────
  const angleFrac = angle / 360;

  // Render a disk at position xi with radius r (as perspective ellipse)
  function renderDisk(xi: number, r: number, key: string | number, highlighted = false) {
    if (!isFinite(r) || r <= 0) return null;
    const { sx } = iso(xi, 0, OX, OY, scaleX, scaleR);
    const ry  = r * scaleR;
    const rx  = r * scaleR * ISO_PERSP;  // perspective ellipse rx

    // Partial circle arc for angle < 360
    const sweepAngle = angleFrac * 2 * Math.PI;
    const startX = sx - rx;
    const startY = OY;
    const endX   = sx + rx * Math.cos(Math.PI + sweepAngle);
    const endY   = OY  + ry * Math.sin(Math.PI + sweepAngle);
    const largeArc = sweepAngle > Math.PI ? 1 : 0;

    if (angle >= 359) {
      return (
        <ellipse
          key={key}
          cx={sx} cy={OY}
          rx={rx} ry={ry}
          fill={highlighted ? 'orange' : 'var(--accent-strong)'}
          fillOpacity={highlighted ? 0.5 : 0.18}
          stroke={highlighted ? 'orange' : 'var(--accent-strong)'}
          strokeOpacity={highlighted ? 0.9 : 0.45}
          strokeWidth={highlighted ? 1.5 : 0.8}
        />
      );
    }

    // Partial arc
    const d = `M${startX},${startY} A${rx},${ry},0,${largeArc},1,${endX},${endY}`;
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={highlighted ? 'orange' : 'var(--accent-strong)'}
        strokeOpacity={highlighted ? 0.9 : 0.45}
        strokeWidth={highlighted ? 2 : 1}
      />
    );
  }

  // Surface fill (top and bottom outline)
  const surfaceFill = useMemo(() => {
    const steps = 150;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const xi = a + (i / steps) * (b - a);
      const r  = Math.abs(safeEval(f, xi));
      if (!isFinite(r)) continue;
      const { sx, sy } = iso(xi, r, OX, OY, scaleX, scaleR);
      d += i === 0 ? `M${sx},${sy}` : ` L${sx},${sy}`;
    }
    // bottom: go right to left along lower profile
    for (let i = steps; i >= 0; i--) {
      const xi = a + (i / steps) * (b - a);
      const r  = Math.abs(safeEval(f, xi));
      if (!isFinite(r)) continue;
      const { sx, sy } = iso(xi, -r, OX, OY, scaleX, scaleR);
      d += ` L${sx},${sy}`;
    }
    d += ' Z';
    return d;
  }, [f, a, b, scaleX, scaleR]);

  // ── Axis arrow ────────────────────────────────────────────────────────────
  const axisEndX = iso(b, 0, OX, OY, scaleX, scaleR).sx + 20;

  return (
    <VizPanel>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Al rotar la región bajo f(x) alrededor del <strong>eje x</strong>, cada punto describe un círculo. La pila de discos forma el sólido; su volumen es V = π ∫<sub>a</sub><sup>b</sup> [f(x)]² dx.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve el slider de <strong>ángulo</strong> para ver cómo el sólido se forma por rotación. Aumenta <strong>n discos</strong> para una mejor visualización.
          </p>
        </div>

        {/* Function selector */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--fg-muted)]">f(x) =</span>
          {FN_OPTIONS.map((opt, i) => (
            <button key={opt.label} type="button" onClick={() => handleFnChange(i)}
              className={`rounded-md border px-2 py-1 text-xs font-mono transition ${
                i === fnIdx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Mode buttons */}
        <ButtonRow>
          <VizButton active={mode === 'disk'} onClick={() => setMode('disk')}>Discos (eje x)</VizButton>
          <VizButton active={mode === 'washer'} onClick={() => setMode('washer')}>Arandelas</VizButton>
          <VizButton active={mode === 'axisY'} onClick={() => setMode('axisY')}>Eje y (cascarón)</VizButton>
        </ButtonRow>

        {/* SVG */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto w-full max-w-2xl"
            role="img"
            aria-labelledby={statusId}
          >
            {/* Axis of revolution (eje x) */}
            <line x1={OX - 10} y1={OY} x2={axisEndX} y2={OY}
              stroke="currentColor" strokeOpacity={0.35} strokeDasharray="6 3" strokeWidth={1.2} />
            <text x={axisEndX + 5} y={OY + 4} fontSize={11} opacity={0.5} fill="currentColor">x</text>

            {/* Surface fill */}
            <path d={surfaceFill}
              fill="var(--accent-strong)" fillOpacity={0.08}
              stroke="none" />

            {/* Disks (back to front = left to right so painter's algo) */}
            {disks.map((d, i) => renderDisk(d.xi, d.r, `disk-${i}`, showCut && i === Math.floor(nDisks / 2)))}

            {/* Profile curves */}
            <path d={profilePath.upper} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
            <path d={profilePath.lower} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />

            {/* End caps */}
            {(() => {
              const rA = Math.abs(safeEval(f, a));
              const rB = Math.abs(safeEval(f, b));
              const pA = iso(a, 0, OX, OY, scaleX, scaleR);
              const pB = iso(b, 0, OX, OY, scaleX, scaleR);
              return <>
                {isFinite(rA) && <ellipse cx={pA.sx} cy={OY} rx={rA*scaleR*ISO_PERSP} ry={rA*scaleR}
                  fill="var(--accent-strong)" fillOpacity={0.12}
                  stroke="var(--accent-strong)" strokeOpacity={0.5} strokeWidth={1} />}
                {isFinite(rB) && <ellipse cx={pB.sx} cy={OY} rx={rB*scaleR*ISO_PERSP} ry={rB*scaleR}
                  fill="var(--accent-strong)" fillOpacity={0.18}
                  stroke="var(--accent-strong)" strokeOpacity={0.7} strokeWidth={1.5} />}
              </>;
            })()}

            {/* Axis ticks */}
            {Array.from({ length: Math.ceil(b - a) + 1 }, (_, i) => {
              const xv = Math.ceil(a) + i;
              if (xv < a || xv > b) return null;
              const { sx } = iso(xv, 0, OX, OY, scaleX, scaleR);
              return <g key={xv}>
                <line x1={sx} y1={OY - 3} x2={sx} y2={OY + 3} stroke="currentColor" opacity={0.4} />
                <text x={sx} y={OY + 13} textAnchor="middle" fontSize={9} opacity={0.5} fill="currentColor">{xv}</text>
              </g>;
            })}

            {/* Angle arc indicator (top right) */}
            <text x={W - 16} y={22} textAnchor="end" fontSize={10} opacity={0.55} fill="currentColor">
              {angle}°
            </text>
          </svg>
        </div>

        {/* Status */}
        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm"
          aria-live="polite"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>V = π ∫<sub>{fmt(a,1)}</sub><sup>{fmt(b,1)}</sup> [f(x)]² dx = <strong>{fmt(volume, 4)}</strong> u³</span>
            <span className="text-[var(--fg-muted)]">[{fmt(a,1)}, {fmt(b,1)}]</span>
          </div>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            Fórmula de discos: V = π ∫ [f(x)]² dx
          </p>
        </div>

        {/* Controls */}
        <ControlsStack>
          <SliderRow label="Ángulo de rotación (°)" value={angle} min={10} max={360} step={5}
            onChange={v => setAngle(Math.round(v))} />
          <SliderRow label="n discos visibles" value={nDisks} min={3} max={20} step={1}
            onChange={v => setNDisks(Math.round(v))} />
          <SliderRow label={`a = ${fmt(a,2)}`} value={a} min={0} max={b - 0.5} step={0.5}
            onChange={v => setA(v)} />
          <SliderRow label={`b = ${fmt(b,2)}`} value={b} min={a + 0.5} max={5} step={0.5}
            onChange={v => setB(v)} />
          <ToggleRow label="Resaltar disco central" checked={showCut} onChange={setShowCut} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

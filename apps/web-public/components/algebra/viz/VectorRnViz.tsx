'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  SliderRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  VEC_H,
  VEC_W,
  autoScale,
  clampVec,
  formatTuple,
  present,
  useVecDrag,
} from './vectorPlane';
import type { Vec2 } from './math2d';

type Dim = 'R2' | 'R3' | 'R4' | 'Rn';

const SUB = ['₁', '₂', '₃', '₄', '₅'];

function subscript(i: number): string {
  return SUB[i] ?? `${i + 1}`;
}

function superscript(n: number): string {
  const map: Record<number, string> = { 2: '²', 3: '³', 4: '⁴', 5: '⁵' };
  return map[n] ?? `${n}`;
}

function clamp5(v: number) {
  return Math.max(-5, Math.min(5, v));
}

/* ───────── R² sub-view ───────── */
function View2D({ vals, setVals }: { vals: number[]; setVals: (v: number[]) => void }) {
  const W = VEC_W;
  const H = VEC_H;
  const ox = W / 2;
  const oy = H / 2;
  const maxAbs = Math.max(1, Math.abs(vals[0]), Math.abs(vals[1]));
  const S = autoScale(maxAbs, Math.min(W, H));
  const markId = useId();

  const tip = { x: ox + vals[0] * S, y: oy - vals[1] * S };
  const isZero = Math.abs(vals[0]) < 1e-9 && Math.abs(vals[1]) < 1e-9;

  const handleDrag = (p: Vec2) => {
    const clamped = clampVec(p, 5);
    setVals([clamped.x, clamped.y]);
  };
  const drag = useVecDrag(handleDrag, S, { x: ox, y: oy });

  const projH = { x: tip.x, y: oy };
  const projV = { x: ox, y: tip.y };

  const midVec = { x: (ox + tip.x) / 2, y: (oy + tip.y) / 2 };
  const labelOff = { x: midVec.x + 6, y: midVec.y - 8 };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto h-auto w-full max-w-xl touch-none"
      role="img"
    >
      <defs>
        <ArrowMarker id={`${markId}-u`} color={COLOR_U} />
      </defs>

      <Axes W={W} H={H} ox={ox} oy={oy} S={S} ticks={[-4, -2, 2, 4]} xLabel="e₁" yLabel="e₂" />

      {!isZero ? (
        <>
          {/* Dashed projections */}
          <line
            x1={ox}
            y1={oy}
            x2={projH.x}
            y2={projH.y}
            stroke="teal"
            strokeDasharray="4 3"
            strokeWidth={1.2}
            opacity={0.55}
          />
          <line
            x1={tip.x}
            y1={oy}
            x2={tip.x}
            y2={tip.y}
            stroke="orange"
            strokeDasharray="4 3"
            strokeWidth={1.2}
            opacity={0.55}
          />

          {/* v₁·e₁ segment */}
          <line
            x1={ox}
            y1={oy}
            x2={projH.x}
            y2={oy}
            stroke="teal"
            strokeWidth={2}
            opacity={0.7}
            markerEnd={`url(#${markId}-u)`}
          />
          {/* v₂·e₂ segment */}
          <line
            x1={projH.x}
            y1={oy}
            x2={tip.x}
            y2={tip.y}
            stroke="orange"
            strokeWidth={2}
            opacity={0.7}
            markerEnd={`url(#${markId}-u)`}
          />

          {/* Axis labels */}
          <text
            x={(ox + projH.x) / 2}
            y={oy + 16}
            textAnchor="middle"
            fontSize={10}
            fill="teal"
          >
            v₁={present(vals[0])}
          </text>
          <text
            x={tip.x + (vals[0] >= 0 ? 8 : -8)}
            y={(oy + tip.y) / 2 + 4}
            textAnchor={vals[0] >= 0 ? 'start' : 'end'}
            fontSize={10}
            fill="orange"
          >
            v₂={present(vals[1])}
          </text>

          {/* Main vector */}
          <line
            x1={ox}
            y1={oy}
            x2={tip.x}
            y2={tip.y}
            stroke={COLOR_U}
            strokeWidth={2.8}
            markerEnd={`url(#${markId}-u)`}
          />

          {/* Decomposition label */}
          <text
            x={labelOff.x}
            y={labelOff.y}
            fontSize={11}
            fontWeight={600}
            fill={COLOR_U}
          >
            v={formatTuple(vals.slice(0, 2))}
          </text>
        </>
      ) : null}

      {isZero ? (
        <>
          <circle cx={ox} cy={oy} r={7} fill={COLOR_U} opacity={0.9} />
          <text x={ox + 10} y={oy - 10} fontSize={12} fontWeight={600} fill={COLOR_U}>
            Vector cero
          </text>
        </>
      ) : null}

      {/* Draggable tip */}
      <circle
        cx={tip.x}
        cy={tip.y}
        r={8}
        fill={COLOR_U}
        style={{ cursor: 'grab' }}
        {...drag}
      />
    </svg>
  );
}

/* ───────── Isometric R³ sub-view ───────── */
function View3D({ vals }: { vals: number[] }) {
  const W = VEC_W;
  const H = VEC_H;
  const ox = W / 2 + 10;
  const oy = H / 2 + 20;
  const [vx, vy, vz] = [vals[0], vals[1], vals[2]];

  // Isometric projection
  const S = 36;
  const toIso = (x: number, y: number, z: number) => ({
    px: ox + (x - z) * 0.7 * S,
    py: oy - (y + (x + z) * 0.35) * S,
  });

  const tip = toIso(vx, vy, vz);
  const o = toIso(0, 0, 0);

  // Axis endpoints (stretched)
  const axLen = 3.5;
  const axX = toIso(axLen, 0, 0);
  const axY = toIso(0, axLen, 0);
  const axZ = toIso(0, 0, axLen);
  const axXn = toIso(-1, 0, 0);
  const axYn = toIso(0, -1, 0);
  const axZn = toIso(0, 0, -1);

  const projX = toIso(vx, 0, 0);
  const projXY = toIso(vx, vy, 0);
  const isZero = Math.abs(vx) + Math.abs(vy) + Math.abs(vz) < 1e-9;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto h-auto w-full max-w-xl touch-none"
      role="img"
    >
      {/* Axes */}
      <line x1={axXn.px} y1={axXn.py} x2={axX.px} y2={axX.py} stroke="currentColor" opacity={0.28} />
      <line x1={axYn.px} y1={axYn.py} x2={axY.px} y2={axY.py} stroke="currentColor" opacity={0.28} />
      <line x1={axZn.px} y1={axZn.py} x2={axZ.px} y2={axZ.py} stroke="currentColor" opacity={0.28} />

      {/* Axis labels */}
      <text x={axX.px + 6} y={axX.py + 4} fontSize={11} opacity={0.6}>e₁</text>
      <text x={axY.px} y={axY.py - 6} fontSize={11} opacity={0.6}>e₂</text>
      <text x={axZ.px - 16} y={axZ.py + 4} fontSize={11} opacity={0.6}>e₃</text>

      {/* Unit vectors tick marks */}
      {[1, 2, 3].map((t) => {
        const px = toIso(t, 0, 0);
        const py = toIso(0, t, 0);
        const pz = toIso(0, 0, t);
        return (
          <g key={t}>
            <circle cx={px.px} cy={px.py} r={1.5} fill="currentColor" opacity={0.3} />
            <circle cx={py.px} cy={py.py} r={1.5} fill="currentColor" opacity={0.3} />
            <circle cx={pz.px} cy={pz.py} r={1.5} fill="currentColor" opacity={0.3} />
          </g>
        );
      })}

      {!isZero ? (
        <>
          {/* Dashed auxiliary lines: foot of vector */}
          <line x1={o.px} y1={o.py} x2={projX.px} y2={projX.py} stroke="teal" strokeDasharray="3 2" opacity={0.5} />
          <line x1={projX.px} y1={projX.py} x2={projXY.px} y2={projXY.py} stroke="orange" strokeDasharray="3 2" opacity={0.5} />
          <line x1={projXY.px} y1={projXY.py} x2={tip.px} y2={tip.py} stroke="var(--fg-muted)" strokeDasharray="3 2" opacity={0.5} />
          <line x1={tip.px} y1={tip.py} x2={o.px} y2={o.py} stroke={COLOR_U} strokeWidth={2.8} />
          <circle cx={tip.px} cy={tip.py} r={7} fill={COLOR_U} />
          <text x={tip.px + 8} y={tip.py - 10} fontSize={12} fontWeight={600} fill={COLOR_U}>
            v={formatTuple(vals.slice(0, 3))}
          </text>

          {/* Component labels */}
          <text x={(o.px + projX.px) / 2} y={(o.py + projX.py) / 2 + 14} fontSize={9} fill="teal" opacity={0.9}>
            v₁={present(vx)}
          </text>
          <text x={(projX.px + projXY.px) / 2 + 6} y={(projX.py + projXY.py) / 2} fontSize={9} fill="orange" opacity={0.9}>
            v₂={present(vy)}
          </text>
          <text x={projXY.px + 6} y={(projXY.py + tip.py) / 2} fontSize={9} fill="var(--fg-muted)" opacity={0.9}>
            v₃={present(vz)}
          </text>
        </>
      ) : null}

      {isZero ? (
        <>
          <circle cx={o.px} cy={o.py} r={7} fill={COLOR_U} opacity={0.9} />
          <text x={o.px + 10} y={o.py - 10} fontSize={12} fontWeight={600} fill={COLOR_U}>Vector cero</text>
        </>
      ) : null}

      {/* Origin dot */}
      <circle cx={o.px} cy={o.py} r={3} fill="currentColor" opacity={0.4} />
    </svg>
  );
}

/* ───────── R⁴/Rⁿ bar chart sub-view ───────── */
function ViewBars({ vals, dim }: { vals: number[]; dim: number }) {
  const W = VEC_W;
  const H = 240;
  const barW = Math.min(48, (W - 40) / dim - 8);
  const maxAbs = Math.max(...vals.map(Math.abs), 1);
  const S = (H / 2 - 32) / maxAbs;
  const midY = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img">
      {/* zero line */}
      <line x1={16} y1={midY} x2={W - 16} y2={midY} stroke="currentColor" opacity={0.28} />

      {vals.map((v, i) => {
        const cx = 32 + i * ((W - 48) / dim) + (W - 48) / dim / 2;
        const barH = Math.abs(v) * S;
        const barY = v >= 0 ? midY - barH : midY;
        return (
          <g key={i}>
            <rect
              x={cx - barW / 2}
              y={barY}
              width={barW}
              height={barH}
              fill={COLOR_U}
              opacity={0.8}
              rx={3}
            />
            <text x={cx} y={midY + 16} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
              v{subscript(i)}
            </text>
            <text
              x={cx}
              y={v >= 0 ? barY - 4 : barY + barH + 12}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill={COLOR_U}
            >
              {present(v)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── Main component ───────── */
export function VectorRnViz() {
  const [dim, setDim] = useState<Dim>('R2');
  const [vals, setVals] = useState<number[]>([3, 2, 1, 0.5, -1]);
  const guideId = useId();

  const n = dim === 'R2' ? 2 : dim === 'R3' ? 3 : dim === 'R4' ? 4 : 5;
  const current = vals.slice(0, n);

  function setComponent(i: number, v: number) {
    setVals((prev) => {
      const next = [...prev];
      next[i] = clamp5(v);
      return next;
    });
  }

  function setVals2(v: number[]) {
    setVals((prev) => {
      const next = [...prev];
      next[0] = clamp5(v[0]);
      next[1] = clamp5(v[1]);
      return next;
    });
  }

  const notation = `v=${formatTuple(current)}∈ℝ${superscript(n)}`;

  const captionParts: string[] = [`v=${formatTuple(current)}∈ℝ${superscript(n)}`];
  current.forEach((v, i) => captionParts.push(`v${subscript(i)}=${present(v)}`));

  return (
    <VizPanel caption={joinCaption(...captionParts)}>
      <div className="space-y-4">
        {/* Guide */}
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Vas a ver que un vector en ℝⁿ queda determinado por sus <em>n</em> componentes. Cada
            componente indica cuánto avanza el vector en una dirección coordenada.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Pruébalo — Cambia las componentes o arrastra el extremo del vector y observa cómo sus
            coordenadas determinan completamente la flecha.
          </p>
        </div>

        {/* Dimension selector + header notation */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-base font-semibold text-[var(--accent-strong)]">
            {notation}
          </p>
          <ButtonRow>
            {(['R2', 'R3', 'R4', 'Rn'] as Dim[]).map((d) => {
              const label = d === 'R2' ? 'ℝ²' : d === 'R3' ? 'ℝ³' : d === 'R4' ? 'ℝ⁴' : 'ℝⁿ';
              return (
                <VizButton key={d} active={dim === d} onClick={() => setDim(d)}>
                  {label}
                </VizButton>
              );
            })}
          </ButtonRow>
        </div>

        {/* Horizontal component list */}
        <div className="flex flex-wrap gap-3 rounded-lg border border-[var(--border)] px-3 py-2">
          {current.map((v, i) => (
            <span key={i} className="font-mono text-sm">
              <span className="text-[var(--fg-muted)]">v{subscript(i)}=</span>
              <span className="font-semibold">{present(v)}</span>
            </span>
          ))}
          {dim !== 'R2' && (
            <span className="ml-auto font-mono text-xs text-[var(--fg-muted)]">
              v=v₁e₁+…+v{subscript(n - 1)}e{subscript(n - 1)}
            </span>
          )}
          {dim === 'R2' && (
            <span className="ml-auto font-mono text-xs text-[var(--fg-muted)]">
              v=v₁e₁+v₂e₂
            </span>
          )}
        </div>

        {/* Visualization */}
        <section className="rounded-xl border border-[var(--border)] px-2 py-2">
          {dim === 'R2' && <View2D vals={current} setVals={setVals2} />}
          {dim === 'R3' && <View3D vals={current} />}
          {(dim === 'R4' || dim === 'Rn') && <ViewBars vals={current} dim={n} />}

          <p className="mt-1 text-center text-xs text-[var(--fg-muted)]">
            {dim === 'R2'
              ? 'Extremo del vector = punto; flecha = desplazamiento v desde el origen'
              : dim === 'R3'
                ? 'Proyección isométrica — arrastra los sliders para girar el vector'
                : `Barras centradas en 0 — positivo hacia arriba, negativo hacia abajo`}
          </p>
        </section>

        {/* Sliders */}
        <ControlsStack>
          {current.map((v, i) => (
            <SliderRow
              key={i}
              label={`v${subscript(i)}`}
              ariaLabel={`componente v${i + 1}`}
              value={v}
              min={-5}
              max={5}
              step={0.1}
              onChange={(val) => setComponent(i, val)}
            />
          ))}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

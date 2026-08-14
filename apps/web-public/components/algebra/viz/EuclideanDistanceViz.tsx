'use client';

import { useId, useState } from 'react';
import {
  ButtonRow,
  ControlsStack,
  ToggleRow,
  VizButton,
  VizPanel,
  joinCaption,
} from './controls';
import { norm, sub, type Vec2 } from './math2d';
import {
  Axes,
  ArrowMarker,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  present,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const OX = W / 2;
const OY = H / 2;
const S = 42;
const ALIGN_EPS = 0.04; // threshold for axis-aligned detection
const COIN_EPS = 0.05; // threshold for coincident detection

function toPx(p: Vec2) {
  return { x: OX + p.x * S, y: OY - p.y * S };
}

function clampPoint(v: Vec2): Vec2 {
  return clampVec(v, 4.2);
}

export function EuclideanDistanceViz() {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const markerUId = `${uid}u`;
  const markerVId = `${uid}v`;

  // Initial: clear right triangle with |Δx|≈1.5, |Δy|≈1
  const [u, setU] = useState<Vec2>({ x: 0.5, y: 0.5 });
  const [v, setV] = useState<Vec2>({ x: 2.0, y: 1.5 });
  const [showDeltas, setShowDeltas] = useState(true);

  const safeU = clampPoint(u);
  const safeV = clampPoint(v);

  const diff = sub(safeV, safeU); // v − u = (Δx, Δy)
  const dx = diff.x;
  const dy = diff.y;
  const dist = norm(diff);

  const isCoincident = dist < COIN_EPS;
  const isHorizAligned = !isCoincident && Math.abs(dy) < ALIGN_EPS;
  const isVertAligned = !isCoincident && Math.abs(dx) < ALIGN_EPS;
  const showTriangle =
    showDeltas && !isCoincident && !isHorizAligned && !isVertAligned;

  const dragU = useVecDrag((raw) => setU(clampPoint(raw)), S, { x: OX, y: OY });
  const dragV = useVecDrag((raw) => setV(clampPoint(raw)), S, { x: OX, y: OY });

  const pu = toPx(safeU);
  const pv = toPx(safeV);

  // Right-angle corner at (v.x, u.y)
  const corner = { x: safeV.x, y: safeU.y };
  const pc = toPx(corner);

  // Orange segment midpoint — offset label away from the corner
  const midX = (pu.x + pv.x) / 2;
  const midY = (pu.y + pv.y) / 2;
  const fromCornerX = midX - pc.x;
  const fromCornerY = midY - pc.y;
  const fcLen = Math.hypot(fromCornerX, fromCornerY) || 1;
  const dLabelX = midX + (fromCornerX / fcLen) * 16;
  const dLabelY = midY + (fromCornerY / fcLen) * 16;

  // Right-angle mark at corner between horizontal and vertical legs
  const rmPx = 9;
  const signHoriz = Math.sign(safeU.x - safeV.x) || 1; // direction toward u-tip in SVG x
  const signVert = Math.sign(safeV.y - safeU.y) || 1; // direction toward v-tip in SVG y (data)
  // In SVG: arm toward v-tip goes in -signVert * y (because SVG y is inverted)
  const rmPath = showTriangle
    ? `M${pc.x + signHoriz * rmPx},${pc.y} ` +
      `L${pc.x + signHoriz * rmPx},${pc.y - signVert * rmPx} ` +
      `L${pc.x},${pc.y - signVert * rmPx}`
    : '';

  // Δx/Δy label positions
  const midHorizX = (pu.x + pc.x) / 2;
  // Place Δx label above/below the horizontal leg (away from triangle interior)
  const horizLabelY = pc.y + (dy > 0 ? 14 : -6);
  const midVertX = pc.x + (dx > 0 ? 12 : -12);
  const midVertY = (pc.y + pv.y) / 2;

  const dxStr = present(Math.abs(dx));
  const dyStr = present(Math.abs(dy));
  const distStr = isCoincident ? '0' : present(dist);
  const uLab = labelOffset(safeU, pu, OX, OY, 18);
  const vLab = labelOffset(safeV, pv, OX, OY, 18);

  const presets: Record<string, () => void> = {
    Horizontal: () => {
      setU({ x: 0, y: 1 });
      setV({ x: 2, y: 1 });
    },
    Vertical: () => {
      setU({ x: 1, y: 0 });
      setV({ x: 1, y: 2 });
    },
    Diagonal: () => {
      setU({ x: 0.5, y: 0.5 });
      setV({ x: 2.0, y: 1.5 });
    },
    Coincidentes: () => {
      setU({ x: 1.5, y: 1 });
      setV({ x: 1.5, y: 1 });
    },
  };

  const dx2str = present(dx * dx + dy * dy);

  return (
    <VizPanel
      caption={joinCaption(
        `d(u, v) = ${distStr}`,
        isCoincident ? 'Los puntos coinciden' : `Δx = ${present(dx)},  Δy = ${present(dy)}`,
        'd(u,v) = d(v,u)',
      )}
    >
      <div className="space-y-3">
        {/* Pedagogical guide */}
        <div className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)] px-3 py-2 text-sm">
          <p className="font-medium text-[var(--fg)]">
            Vas a ver que la distancia entre dos vectores es la longitud del segmento que une sus
            extremos.
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Pruébalo — Arrastra{' '}
            <span style={{ color: COLOR_U, fontWeight: 700 }}>u</span> y{' '}
            <span style={{ color: COLOR_V, fontWeight: 700 }}>v</span>. Observa cómo Δx y Δy
            forman los catetos de un triángulo rectángulo cuya hipotenusa mide ‖u−v‖.
          </p>
        </div>

        {/* SVG canvas */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-label={`Distancia entre u y v: ${distStr}. Δx = ${present(dx)}, Δy = ${present(dy)}.`}
        >
          <defs>
            <ArrowMarker id={markerUId} color={COLOR_U} />
            <ArrowMarker id={markerVId} color={COLOR_V} />
          </defs>

          <Axes W={W} H={H} ox={OX} oy={OY} S={S} />

          {/* Right triangle (dashed) — full triangle */}
          {showTriangle && (
            <>
              {/* Horizontal leg: u-tip → corner */}
              <line
                x1={pu.x}
                y1={pu.y}
                x2={pc.x}
                y2={pc.y}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.45}
              />
              {/* Vertical leg: corner → v-tip */}
              <line
                x1={pc.x}
                y1={pc.y}
                x2={pv.x}
                y2={pv.y}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.45}
              />
              {/* Right-angle mark at corner */}
              {rmPath && (
                <path
                  d={rmPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  opacity={0.55}
                />
              )}
              {/* |Δx| label along horizontal leg */}
              <text
                x={midHorizX}
                y={horizLabelY}
                textAnchor="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.7}
              >
                |Δx|={dxStr}
              </text>
              {/* |Δy| label along vertical leg */}
              <text
                x={midVertX}
                y={midVertY}
                textAnchor={dx > 0 ? 'start' : 'end'}
                dominantBaseline="middle"
                fontSize={11}
                fill="currentColor"
                opacity={0.7}
              >
                |Δy|={dyStr}
              </text>
            </>
          )}

          {/* Horizontal-only case: just label Δx */}
          {showDeltas && isHorizAligned && (
            <text
              x={midX}
              y={midY + 16}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.7}
            >
              |Δx|={dxStr}
            </text>
          )}

          {/* Vertical-only case: just label Δy */}
          {showDeltas && isVertAligned && (
            <text
              x={midX + 12}
              y={midY}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={11}
              fill="currentColor"
              opacity={0.7}
            >
              |Δy|={dyStr}
            </text>
          )}

          {/* Orange segment (protagonist) between tips */}
          {!isCoincident && (
            <line
              x1={pu.x}
              y1={pu.y}
              x2={pv.x}
              y2={pv.y}
              stroke={COLOR_W}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}

          {/* d(u,v) label at mid-segment */}
          {!isCoincident && (
            <text
              x={dLabelX}
              y={dLabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={700}
              fill={COLOR_W}
            >
              d={distStr}
            </text>
          )}

          {/* Coincident indicator */}
          {isCoincident && (
            <>
              <circle
                cx={pu.x}
                cy={pu.y}
                r={7}
                fill="none"
                stroke={COLOR_W}
                strokeWidth={2}
              />
              <text
                x={pu.x + 14}
                y={pu.y - 8}
                fontSize={11}
                fontWeight={600}
                fill={COLOR_W}
              >
                Los puntos coinciden (d=0)
              </text>
            </>
          )}

          {/* Vector u — arrow from origin to u-tip */}
          <line
            x1={OX}
            y1={OY}
            x2={pu.x}
            y2={pu.y}
            stroke={COLOR_U}
            strokeWidth={2}
            markerEnd={`url(#${markerUId})`}
          />
          <circle
            cx={pu.x}
            cy={pu.y}
            r={11}
            fill={COLOR_U}
            fillOpacity={0.18}
            stroke={COLOR_U}
            strokeWidth={1.2}
            {...dragU}
            style={{ cursor: 'grab' }}
          />
          <text
            x={uLab.x}
            y={uLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill={COLOR_U}
          >
            u
          </text>

          {/* Vector v — arrow from origin to v-tip */}
          <line
            x1={OX}
            y1={OY}
            x2={pv.x}
            y2={pv.y}
            stroke={COLOR_V}
            strokeWidth={2}
            markerEnd={`url(#${markerVId})`}
          />
          <circle
            cx={pv.x}
            cy={pv.y}
            r={11}
            fill={COLOR_V}
            fillOpacity={0.18}
            stroke={COLOR_V}
            strokeWidth={1.2}
            {...dragV}
            style={{ cursor: 'grab' }}
          />
          <text
            x={vLab.x}
            y={vLab.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill={COLOR_V}
          >
            v
          </text>
        </svg>

        {/* Formula */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-sm">
          <p>v − u = {formatPair(dx, dy)}</p>
          <p className="mt-0.5">
            d(u,v) = √(Δx² + Δy²) = √({present(dx)}² + {present(dy)}²) = √{dx2str} ={' '}
            <strong style={{ color: COLOR_W }}>{distStr}</strong>
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            d(u,v) = d(v,u){'  '}·{'  '}En ℝⁿ: d = √(Σᵢ (uᵢ − vᵢ)²)
          </p>
        </div>

        {/* Toggle */}
        <ToggleRow label="Mostrar Δx y Δy" checked={showDeltas} onChange={setShowDeltas} />

        {/* Presets */}
        <ControlsStack>
          <ButtonRow>
            {Object.entries(presets).map(([name, fn]) => (
              <VizButton key={name} onClick={fn}>
                {name}
              </VizButton>
            ))}
          </ButtonRow>
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

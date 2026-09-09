'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { norm, normalize, type Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  present,
  useVecDrag,
} from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';

const H = 360;
const ox = VEC_W / 2;
const oy = H / 2;
const S = 52;
const CLAMP = 3.6;

export function UnitVectorPhysicsViz({ mode }: { mode?: string }) {
  const [a, setA] = useState<Vec2>({ x: 3, y: 2 });
  const uid = useId();
  const na = norm(a);
  const zero = na < 1e-9;
  const hat = zero ? { x: 0, y: 0 } : normalize(a);
  const pa = { x: ox + a.x * S, y: oy - a.y * S };
  const ph = { x: ox + hat.x * S, y: oy - hat.y * S };
  const drag = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const aLbl = labelOffset(a, pa, ox, oy, 18);
  const hLbl = labelOffset(hat, ph, ox, oy, 16);
  const guide = useMemo(() => {
    if (zero) return null;
    const d = normalize(a);
    return {
      x1: ox - d.x * 6 * S,
      y1: oy + d.y * 6 * S,
      x2: ox + d.x * 6 * S,
      y2: oy - d.y * 6 * S,
    };
  }, [a, zero]);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="unit_vector" mode={mode} />
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label="Vector unitario sobre la circunferencia de radio 1"
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
            <ArrowMarker id={`${uid}-h`} color={COLOR_V} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" ticks={[-2, -1, 1, 2]} />
          <circle cx={ox} cy={oy} r={S} fill="none" stroke="var(--border)" strokeWidth={1.5} />
          {guide ? (
            <line {...guide} stroke="var(--fg-muted)" strokeDasharray="3 4" opacity={0.5} />
          ) : null}
          <line
            x1={ox}
            y1={oy}
            x2={pa.x}
            y2={pa.y}
            stroke={COLOR_U}
            strokeWidth={2.4}
            markerEnd={`url(#${uid}-a)`}
          />
          {!zero ? (
            <line
              x1={ox}
              y1={oy}
              x2={ph.x}
              y2={ph.y}
              stroke={COLOR_V}
              strokeWidth={2.6}
              markerEnd={`url(#${uid}-h)`}
            />
          ) : null}
          <text x={aLbl.x} y={aLbl.y} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_U}>
            A
          </text>
          {!zero ? (
            <text x={hLbl.x} y={hLbl.y} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_V}>
              û
            </text>
          ) : null}
          <circle cx={pa.x} cy={pa.y} r={9} fill={COLOR_U} opacity={0.85} style={{ cursor: 'grab' }} {...drag} />
        </svg>
        <PhysStatus id={uid}>
          {zero
            ? 'no hay unitario (condición |A| ≠ 0)'
            : `û = A/|A| = ${formatPair(hat.x, hat.y)} · |A| = ${present(na)} · |û| = 1`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow
            label={`Ax = ${fmt(a.x)}`}
            value={a.x}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(x) => setA((p) => clampVec({ x, y: p.y }, CLAMP))}
          />
          <SliderRow
            label={`Ay = ${fmt(a.y)}`}
            value={a.y}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(y) => setA((p) => clampVec({ x: p.x, y }, CLAMP))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

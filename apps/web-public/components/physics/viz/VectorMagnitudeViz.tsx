'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { norm, type Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_W,
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
const S = 42;
const CLAMP = 4;

export function VectorMagnitudeViz({ mode }: { mode?: string }) {
  const [a, setA] = useState<Vec2>({ x: 3, y: 2 });
  const uid = useId();
  const na = norm(a);
  const pa = { x: ox + a.x * S, y: oy - a.y * S };
  const px = { x: ox + a.x * S, y: oy };
  const drag = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const lbl = labelOffset(a, pa, ox, oy, 18);
  const hypot = Math.hypot(a.x, a.y);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="vector_magnitude" mode={mode} />
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label="Módulo de un vector como hipotenusa de sus componentes"
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
          <line x1={ox} y1={oy} x2={px.x} y2={px.y} stroke={COLOR_W} strokeDasharray="4 3" strokeWidth={1.5} />
          <line x1={px.x} y1={px.y} x2={pa.x} y2={pa.y} stroke={COLOR_W} strokeDasharray="4 3" strokeWidth={1.5} />
          <text x={(ox + px.x) / 2} y={oy + 16} textAnchor="middle" fontSize={11} fill={COLOR_W}>
            Ax
          </text>
          <text x={pa.x + 10} y={(oy + pa.y) / 2} fontSize={11} fill={COLOR_W}>
            Ay
          </text>
          <line
            x1={ox}
            y1={oy}
            x2={pa.x}
            y2={pa.y}
            stroke={COLOR_U}
            strokeWidth={2.5}
            markerEnd={`url(#${uid}-a)`}
          />
          <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLOR_U}>
            A
          </text>
          <circle cx={pa.x} cy={pa.y} r={9} fill={COLOR_U} opacity={0.85} style={{ cursor: 'grab' }} {...drag} />
        </svg>
        <PhysStatus id={uid}>
          |A| = √(Ax² + Ay²) = {present(hypot)} · A = {formatPair(a.x, a.y)}
          {na < 1e-9 ? ' · el módulo es 0; no hay dirección' : ''}
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

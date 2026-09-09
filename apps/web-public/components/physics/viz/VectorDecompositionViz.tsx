'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { type Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  minorArcPath,
  present,
  useVecDrag,
} from '@/components/algebra/viz/vectorPlane';
import { degToRad, hypot2, radToDeg } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';

const H = 360;
const ox = VEC_W / 2;
const oy = H / 2;
const S = 44;
const CLAMP = 4;

export function VectorDecompositionViz({ mode }: { mode?: string }) {
  const pos = mode === 'position';
  const [a, setA] = useState<Vec2>({ x: 2.8, y: 1.6 });
  const uid = useId();
  const mag = hypot2(a.x, a.y);
  const theta = radToDeg(Math.atan2(a.y, a.x));
  const thetaPos = ((theta % 360) + 360) % 360;
  const pa = { x: ox + a.x * S, y: oy - a.y * S };
  const drag = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const lbl = labelOffset(a, pa, ox, oy, 18);
  const arc = mag > 0.2 ? minorArcPath(ox, oy, S, 0.55, 0, degToRad(thetaPos > 180 ? thetaPos - 360 : thetaPos)) : '';

  const setMagTheta = (m: number, th: number) => {
    const r = degToRad(th);
    setA(clampVec({ x: m * Math.cos(r), y: m * Math.sin(r) }, CLAMP));
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="vector_decomposition" mode={mode} />
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label={pos ? 'Vector posición en el plano' : 'Descomposición cartesiana de un vector'}
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
          <line x1={ox} y1={oy} x2={pa.x} y2={oy} stroke={COLOR_V} strokeWidth={2} />
          <line x1={pa.x} y1={oy} x2={pa.x} y2={pa.y} stroke={COLOR_W} strokeWidth={2} />
          {arc ? <path d={arc} fill="none" stroke={COLOR_W} strokeWidth={1.5} /> : null}
          <text x={ox + 28} y={oy - 10} fontSize={11} fill={COLOR_W}>
            θ
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
            {pos ? 'r' : 'A'}
          </text>
          <circle cx={pa.x} cy={pa.y} r={9} fill={COLOR_U} opacity={0.85} style={{ cursor: 'grab' }} {...drag} />
        </svg>
        <PhysStatus id={uid}>
          {pos
            ? `r = ${formatPair(a.x, a.y)} m · |r| = ${present(mag)} m`
            : `A = ${present(mag)} · θ = ${fmt(thetaPos, 1)}° · Ax = A cos θ = ${present(a.x)} · Ay = A sen θ = ${present(a.y)}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow
            label={`${pos ? '|r|' : 'A'} = ${fmt(mag)}`}
            value={mag}
            min={0.5}
            max={4}
            step={0.1}
            onChange={(m) => setMagTheta(m, thetaPos)}
          />
          <SliderRow
            label={`θ = ${fmt(thetaPos, 0)}°`}
            value={thetaPos}
            min={0}
            max={359}
            step={1}
            onChange={(th) => setMagTheta(Math.max(0.5, mag), th)}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

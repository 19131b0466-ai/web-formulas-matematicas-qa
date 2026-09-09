'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { dot, norm, project, type Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_W,
  angleBetween,
  atan2Vec,
  clampVec,
  formatPair,
  minorArcPath,
  useVecDrag,
} from '@/components/algebra/viz/vectorPlane';
import { radToDeg } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';

const H = 360;
const ox = VEC_W / 2;
const oy = H / 2;
const CLAMP = 4;

export function DotProductPhysicsViz({ mode }: { mode?: string }) {
  const [a, setA] = useState<Vec2>({ x: 3.4, y: 0.2 });
  const [b, setB] = useState<Vec2>({ x: 2.2, y: 2.4 });
  const uid = useId();
  const na = norm(a);
  const nb = norm(b);
  const dp = dot(a, b);
  const th = angleBetween(a, b);
  const thDeg = Number.isFinite(th) ? radToDeg(th) : NaN;
  const maxN = Math.max(na, nb, 1.5);
  const S = Math.min(48, Math.max(26, (oy - 36) / maxN));
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const pa = to(a);
  const pb = to(b);
  const foot = na < 1e-9 ? { x: 0, y: 0 } : project(b, a);
  const pf = to(foot);
  const dragA = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragB = useVecDrag((p) => setB(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const right = Number.isFinite(th) && Math.abs(th - Math.PI / 2) < 0.03;
  const arc =
    Number.isFinite(th) && !right ? minorArcPath(ox, oy, S, 0.5, atan2Vec(a), atan2Vec(b)) : '';
  const sign = dp > 0.05 ? 'positivo' : dp < -0.05 ? 'negativo' : 'cero (⟂)';

  const setAngle = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    const mag = Math.max(1.2, nb);
    setB({ x: mag * Math.cos(atan2Vec(a) + r), y: mag * Math.sin(atan2Vec(a) + r) });
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="dot_product" mode={mode} />
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label="Producto escalar y proyección"
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
            <ArrowMarker id={`${uid}-b`} color={COLOR_V} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
          {na > 0.05 ? (
            <line x1={pb.x} y1={pb.y} x2={pf.x} y2={pf.y} stroke={COLOR_W} strokeDasharray="4 3" />
          ) : null}
          {arc ? <path d={arc} fill="none" stroke={COLOR_W} strokeWidth={1.6} /> : null}
          <line x1={ox} y1={oy} x2={pa.x} y2={pa.y} stroke={COLOR_U} strokeWidth={2.5} markerEnd={`url(#${uid}-a)`} />
          <line x1={ox} y1={oy} x2={pb.x} y2={pb.y} stroke={COLOR_V} strokeWidth={2.5} markerEnd={`url(#${uid}-b)`} />
          <text x={pa.x + 8} y={pa.y - 8} fontSize={12} fontWeight={700} fill={COLOR_U}>
            A
          </text>
          <text x={pb.x + 8} y={pb.y - 8} fontSize={12} fontWeight={700} fill={COLOR_V}>
            B
          </text>
          <circle cx={pa.x} cy={pa.y} r={9} fill={COLOR_U} opacity={0.85} style={{ cursor: 'grab' }} {...dragA} />
          <circle cx={pb.x} cy={pb.y} r={9} fill={COLOR_V} opacity={0.85} style={{ cursor: 'grab' }} {...dragB} />
        </svg>
        <PhysStatus id={uid}>
          A·B = |A| |B| cos θ = {fmt(dp)} · θ = {Number.isFinite(thDeg) ? `${fmt(thDeg, 1)}°` : '—'} · {sign}
          {' · A = '}
          {formatPair(a.x, a.y)}
          {' · B = '}
          {formatPair(b.x, b.y)}
        </PhysStatus>
        <ButtonRow>
          <VizButton onClick={() => setAngle(40)}>Agudo</VizButton>
          <VizButton onClick={() => setAngle(90)}>90°</VizButton>
          <VizButton onClick={() => setAngle(130)}>Obtuso</VizButton>
        </ButtonRow>
        <ControlsStack>
          <SliderRow label={`Ax = ${fmt(a.x)}`} value={a.x} min={-CLAMP} max={CLAMP} step={0.1} onChange={(x) => setA((p) => clampVec({ x, y: p.y }, CLAMP))} />
          <SliderRow label={`Ay = ${fmt(a.y)}`} value={a.y} min={-CLAMP} max={CLAMP} step={0.1} onChange={(y) => setA((p) => clampVec({ x: p.x, y }, CLAMP))} />
          <SliderRow label={`Bx = ${fmt(b.x)}`} value={b.x} min={-CLAMP} max={CLAMP} step={0.1} onChange={(x) => setB((p) => clampVec({ x, y: p.y }, CLAMP))} />
          <SliderRow label={`By = ${fmt(b.y)}`} value={b.y} min={-CLAMP} max={CLAMP} step={0.1} onChange={(y) => setB((p) => clampVec({ x: p.x, y }, CLAMP))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

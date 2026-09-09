'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { add, type Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_W,
  clampVec,
  formatPair,
  present,
  useVecDrag,
} from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';

const H = 360;
const ox = VEC_W / 2;
const oy = H / 2;
const S = 40;
const CLAMP = 3.4;

export function VectorAdditionViz({ mode }: { mode?: string }) {
  const t = useTranslations('vizFisica');
  const [a, setA] = useState<Vec2>({ x: 2.2, y: 0.6 });
  const [b, setB] = useState<Vec2>({ x: 0.7, y: 2.1 });
  const [para, setPara] = useState(false);
  const uid = useId();
  const r = add(a, b);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const pa = to(a);
  const pb = to(b);
  const pr = to(r);
  const pbShift = { x: pa.x + (pb.x - ox), y: pa.y + (pb.y - oy) };
  const dragA = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragB = useVecDrag((p) => setB(clampVec(p, CLAMP)), S, { x: ox, y: oy });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="vector_addition" mode={mode} />
        <ButtonRow>
          <VizButton active={!para} onClick={() => setPara(false)}>
            {t('tailToTip')}
          </VizButton>
          <VizButton active={para} onClick={() => setPara(true)}>
            {t('parallelogram')}
          </VizButton>
        </ButtonRow>
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label="Suma de dos vectores"
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COLOR_U} />
            <ArrowMarker id={`${uid}-b`} color={COLOR_V} />
            <ArrowMarker id={`${uid}-r`} color={COLOR_W} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" ticks={[-3, -1, 1, 3]} />
          {para ? (
            <>
              <polygon
                points={`${ox},${oy} ${pa.x},${pa.y} ${pr.x},${pr.y} ${pb.x},${pb.y}`}
                fill={COLOR_W}
                fillOpacity={0.12}
              />
              <line x1={ox} y1={oy} x2={pa.x} y2={pa.y} stroke={COLOR_U} strokeWidth={2.4} markerEnd={`url(#${uid}-a)`} />
              <line x1={ox} y1={oy} x2={pb.x} y2={pb.y} stroke={COLOR_V} strokeWidth={2.4} markerEnd={`url(#${uid}-b)`} />
            </>
          ) : (
            <>
              <line x1={ox} y1={oy} x2={pa.x} y2={pa.y} stroke={COLOR_U} strokeWidth={2.4} markerEnd={`url(#${uid}-a)`} />
              <line
                x1={pa.x}
                y1={pa.y}
                x2={pbShift.x}
                y2={pbShift.y}
                stroke={COLOR_V}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-b)`}
              />
            </>
          )}
          <line x1={ox} y1={oy} x2={pr.x} y2={pr.y} stroke={COLOR_W} strokeWidth={2.8} markerEnd={`url(#${uid}-r)`} />
          <text x={pa.x + 8} y={pa.y - 8} fontSize={12} fontWeight={700} fill={COLOR_U}>
            A
          </text>
          <text
            x={(para ? pb.x : pbShift.x) + 8}
            y={(para ? pb.y : pbShift.y) - 8}
            fontSize={12}
            fontWeight={700}
            fill={COLOR_V}
          >
            B
          </text>
          <text x={pr.x + 8} y={pr.y - 8} fontSize={12} fontWeight={700} fill={COLOR_W}>
            R
          </text>
          <circle cx={pa.x} cy={pa.y} r={9} fill={COLOR_U} opacity={0.85} style={{ cursor: 'grab' }} {...dragA} />
          <circle cx={pb.x} cy={pb.y} r={9} fill={COLOR_V} opacity={0.85} style={{ cursor: 'grab' }} {...dragB} />
        </svg>
        <PhysStatus id={uid}>
          R = A + B = {formatPair(r.x, r.y)} · Rx = Ax + Bx = {present(a.x)} + {present(b.x)} · |R| = {present(
            Math.hypot(r.x, r.y),
          )}
        </PhysStatus>
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

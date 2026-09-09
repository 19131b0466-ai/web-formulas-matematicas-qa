'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import type { Vec2 } from '@/components/algebra/viz/math2d';
import {
  ArrowMarker,
  Axes,
  COLOR_W,
  VEC_W,
  clampVec,
  formatPair,
  labelOffset,
  present,
  useVecDrag,
} from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { vectorMagnitude } from './physLote1Math';
import { PhysDimBadge, PhysPresets, PhysResult } from './physPanel';
import { isoProject, MUTED, ORANGE } from './physPlot';

const H = 360;
const ox = VEC_W / 2;
const oy = H / 2;
const S = 42;
const CLAMP = 5;
const COL_AX = 'var(--accent-strong)';
const COL_AY = 'teal';
const COL_A = ORANGE;

export function VectorMagnitudeViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.vec001');
  const [a, setA] = useState<Vec2>({ x: 3, y: 4 });
  const [az, setAz] = useState(0);
  const [view3d, setView3d] = useState(false);
  const uid = useId();
  const mag = vectorMagnitude(a.x, a.y, az);
  const pa = { x: ox + a.x * S, y: oy - a.y * S };
  const px = { x: ox + a.x * S, y: oy };
  const drag = useVecDrag((p) => setA(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const lbl = labelOffset(a, pa, ox, oy, 18);
  const show3d = view3d && Math.abs(az) > 1e-6;
  const p3 = show3d ? isoProject(a.x, a.y, az, ox - 30, oy + 20, S * 0.55) : null;

  const presets = [
    { id: '345', label: tr('preset345'), x: 3, y: 4, z: 0 },
    { id: 'neg', label: tr('presetNeg'), x: -3, y: 2, z: 0 },
    { id: '3d', label: tr('preset3d'), x: 3, y: 4, z: 2 },
  ];

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="vector_magnitude" mode={mode} />
        {!show3d ? <PhysDimBadge>{tr('badge2d', { az: fmt(az) })}</PhysDimBadge> : null}
        <PhysPresets
          items={presets.map((p) => ({
            id: p.id,
            label: p.label,
            onSelect: () => {
              setA({ x: p.x, y: p.y });
              setAz(p.z);
              setView3d(p.z !== 0);
            },
          }))}
        />
        <svg
          viewBox={`0 0 ${VEC_W} ${H}`}
          className="mx-auto h-auto w-full max-w-lg"
          role="img"
          aria-label={tr('aria')}
        >
          <defs>
            <ArrowMarker id={`${uid}-a`} color={COL_A} />
          </defs>
          <Axes W={VEC_W} H={H} ox={ox} oy={oy} S={S} xLabel="x" yLabel="y" />
          <line x1={ox} y1={oy} x2={px.x} y2={px.y} stroke={COL_AX} strokeWidth={2.5} />
          <line x1={px.x} y1={px.y} x2={pa.x} y2={pa.y} stroke={COL_AY} strokeWidth={2.5} />
          <text x={(ox + px.x) / 2} y={oy + 16} textAnchor="middle" fontSize={11} fill={COL_AX} fontWeight={600}>
            Ax
          </text>
          <text x={pa.x + 10} y={(oy + pa.y) / 2} fontSize={11} fill={COL_AY} fontWeight={600}>
            Ay
          </text>
          <line x1={ox} y1={oy} x2={pa.x} y2={pa.y} stroke={COL_A} strokeWidth={2.5} markerEnd={`url(#${uid}-a)`} />
          <text x={lbl.x} y={lbl.y} textAnchor="middle" fontSize={12} fontWeight={700} fill={COL_A}>
            |A|
          </text>
          <circle cx={pa.x} cy={pa.y} r={9} fill={COL_A} opacity={0.85} style={{ cursor: 'grab' }} {...drag} />
          {show3d && p3 ? (
            <g>
              <line x1={ox} y1={oy} x2={p3.x} y2={p3.y} stroke={MUTED} strokeDasharray="4 3" strokeWidth={2} />
              <text x={p3.x + 8} y={p3.y - 6} fontSize={10} fill={COLOR_W}>Az</text>
            </g>
          ) : null}
        </svg>
        <PhysResult
          primary={`|A| = ${present(mag)}`}
          secondary={`Ax=${fmt(a.x)} · Ay=${fmt(a.y)} · Az=${fmt(az)} · Ax²+Ay²+Az²=${present(a.x * a.x + a.y * a.y + az * az)}`}
        />
        <PhysStatus id={uid}>
          {mag < 1e-9 ? tr('zeroVector') : tr('status', { mag: present(mag), pair: formatPair(a.x, a.y) })}
        </PhysStatus>
        <ControlsStack>
          <SliderRow
            label={`Ax (${fmt(a.x)})`}
            ariaLabel={tr('ax')}
            value={a.x}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(x) => setA((p) => clampVec({ x, y: p.y }, CLAMP))}
          />
          <SliderRow
            label={`Ay (${fmt(a.y)})`}
            ariaLabel={tr('ay')}
            value={a.y}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={(y) => setA((p) => clampVec({ x: p.x, y }, CLAMP))}
          />
          <SliderRow
            label={`Az (${fmt(az)})`}
            ariaLabel={tr('az')}
            value={az}
            min={-CLAMP}
            max={CLAMP}
            step={0.1}
            onChange={setAz}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

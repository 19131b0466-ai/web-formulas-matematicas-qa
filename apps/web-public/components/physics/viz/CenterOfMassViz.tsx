'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function CenterOfMassViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(1);
  const [m3, setM3] = useState(1.5);
  const [x1, setX1] = useState(-1.6);
  const [x2, setX2] = useState(0.8);
  const [x3, setX3] = useState(2);
  const [v1, setV1] = useState(1.2);
  const [v2, setV2] = useState(-0.4);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const vel = mode === 'v_cm';
  useRafPlay(playing, setT, { min: 0, max: 3, speed: 1, loop: true });
  const M = m1 + m2 + m3;
  const P = m1 * v1 + m2 * v2;
  const vcm = P / M;
  const x1t = vel ? x1 + v1 * t : x1;
  const x2t = vel ? x2 + v2 * t : x2;
  const x3t = x3;
  const xcm = (m1 * x1t + m2 * x2t + m3 * x3t) / M;
  const ox = 210;
  const S = 50;
  const to = (x: number) => ox + x * S;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="center_of_mass" mode={mode} />
        {vel ? (
          <PlayRow
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            extra={
              <VizButton
                onClick={() => {
                  setPlaying(false);
                  setT(0);
                }}
              >
                {tr('reset')}
              </VizButton>
            }
          />
        ) : null}
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Centro de masa">
          <line x1={20} y1={90} x2={400} y2={90} stroke={MUTED} />
          <circle cx={to(x1t)} cy={90} r={6 + m1 * 3} fill={ACCENT} />
          <circle cx={to(x2t)} cy={90} r={6 + m2 * 3} fill={TEAL} />
          <circle cx={to(x3t)} cy={90} r={6 + m3 * 3} fill={ORANGE} />
          <line x1={to(xcm)} y1={40} x2={to(xcm)} y2={140} stroke={ORANGE} strokeDasharray="4 3" />
          <text x={to(xcm)} y={32} textAnchor="middle" fontSize={12} fill={ORANGE}>
            CM
          </text>
        </svg>
        <PhysStatus id={uid}>
          {vel
            ? `vCM = P/M = ${present(vcm)} m/s · xCM = ${present(xcm)}`
            : `xCM = Σ mi xi / M = ${present(xcm)} · M = ${present(M)}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="m1" value={m1} min={0.4} max={5} step={0.1} onChange={setM1} />
          <SliderRow label="x1" value={x1} min={-3} max={3} step={0.1} onChange={setX1} />
          <SliderRow label="m2" value={m2} min={0.4} max={5} step={0.1} onChange={setM2} />
          <SliderRow label="x2" value={x2} min={-3} max={3} step={0.1} onChange={setX2} />
          <SliderRow label="m3" value={m3} min={0.4} max={5} step={0.1} onChange={setM3} />
          <SliderRow label="x3" value={x3} min={-3} max={3} step={0.1} onChange={setX3} />
          {vel ? (
            <>
              <SliderRow label="v1" value={v1} min={-3} max={3} step={0.1} onChange={setV1} />
              <SliderRow label="v2" value={v2} min={-3} max={3} step={0.1} onChange={setV2} />
            </>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

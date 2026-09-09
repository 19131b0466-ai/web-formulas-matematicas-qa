'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { clamp, elastic1D, inelastic1D } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

export function Collision1DViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const forcedInel = mode === 'inelastic';
  const [elastic, setElastic] = useState(!forcedInel);
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(2);
  const [v1i, setV1i] = useState(4);
  const [v2i, setV2i] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const useEl = forcedInel ? false : elastic;
  const { v1f, v2f } = useEl
    ? elastic1D(m1, m2, v1i, v2i)
    : { v1f: inelastic1D(m1, m2, v1i, v2i), v2f: inelastic1D(m1, m2, v1i, v2i) };
  const tCol = 1.2;
  const tMax = 2.8;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const hit = t >= tCol;
  const x1 = clamp(40 + v1i * 28 * Math.min(t, tCol) + (hit ? v1f * 28 * (t - tCol) : 0), 20, 250);
  const x2 = clamp(220 + v2i * 28 * Math.min(t, tCol) + (hit ? v2f * 28 * (t - tCol) : 0), 80, 380);
  const pi = m1 * v1i + m2 * v2i;
  const pf = m1 * v1f + m2 * v2f;
  const Ki = 0.5 * m1 * v1i * v1i + 0.5 * m2 * v2i * v2i;
  const Kf = 0.5 * m1 * v1f * v1f + 0.5 * m2 * v2f * v2f;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="collision_1d" mode={mode} />
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
        {!forcedInel ? (
          <ButtonRow>
            <VizButton active={elastic} onClick={() => setElastic(true)}>
              {tr('elastic')}
            </VizButton>
            <VizButton active={!elastic} onClick={() => setElastic(false)}>
              {tr('inelastic')}
            </VizButton>
          </ButtonRow>
        ) : null}
        <svg viewBox="0 0 420 90" className="h-auto w-full" role="img" aria-label="Choque 1D">
          <line x1={16} y1={60} x2={404} y2={60} stroke={MUTED} />
          <rect x={x1} y={36} width={36} height={24} fill={ACCENT} />
          <rect x={Math.max(x1 + 38, x2)} y={36} width={36} height={24} fill={TEAL} />
        </svg>
        <EnergyBars
          items={[
            { label: 'p tot', value: hit ? pf : pi, color: ORANGE },
            { label: 'K tot', value: hit ? Kf : Ki, color: TEAL },
          ]}
        />
        <PhysStatus id={uid}>
          {mode === 'conservation'
            ? `pi = ${present(pi)} = pf = ${present(pf)}`
            : `v1f = ${present(v1f)} · v2f = ${present(v2f)} m/s · K: ${present(Ki)} → ${present(Kf)}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="m1" value={m1} min={0.5} max={8} step={0.1} onChange={setM1} />
          <SliderRow label="m2" value={m2} min={0.5} max={8} step={0.1} onChange={setM2} />
          <SliderRow label="v1i" value={v1i} min={-6} max={8} step={0.1} onChange={setV1i} />
          <SliderRow label="v2i" value={v2i} min={-6} max={8} step={0.1} onChange={setV2i} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

const BETA: Record<string, number> = { aro: 1, disco: 0.5, esfera: 0.4 };

export function RollingViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [shape, setShape] = useState<'aro' | 'disco' | 'esfera'>('disco');
  const [R, setR] = useState(0.4);
  const [vcm, setVcm] = useState(2.5);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const M = 2;
  const beta = BETA[shape]!;
  const I = beta * M * R * R;
  const omega = vcm / R;
  const Ktr = 0.5 * M * vcm * vcm;
  const Krot = 0.5 * I * omega * omega;
  useRafPlay(playing, setT, { min: 0, max: 8, speed: 1, loop: true });
  const x = ((vcm * t) % 6) * 50 + 50;
  const phi = -(vcm * t) / R;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="rolling" mode={mode} />
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
        <ButtonRow>
          {(['aro', 'disco', 'esfera'] as const).map((s) => (
            <VizButton key={s} active={shape === s} onClick={() => setShape(s)}>
              {s} (β={BETA[s]})
            </VizButton>
          ))}
        </ButtonRow>
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Rodadura sin deslizamiento">
          <line x1={20} y1={120} x2={400} y2={120} stroke={MUTED} strokeWidth={2} />
          <circle cx={x} cy={120 - R * 80} r={R * 80} fill={ACCENT} fillOpacity={0.15} stroke={MUTED} />
          <circle
            cx={x + R * 80 * Math.cos(phi)}
            cy={120 - R * 80 + R * 80 * Math.sin(phi)}
            r={5}
            fill={ORANGE}
          />
          <line x1={x} y1={120 - R * 80} x2={x + 40} y2={120 - R * 80} stroke={TEAL} strokeWidth={2} />
          <text x={x + 44} y={120 - R * 80} fontSize={11} fill={TEAL}>
            vCM
          </text>
        </svg>
        <EnergyBars
          items={[
            { label: 'Ktras', value: Ktr, color: TEAL },
            { label: 'Krot', value: Krot, color: ACCENT },
          ]}
        />
        <PhysStatus id={uid}>
          vCM = R ω = {present(vcm)} m/s · ω = {present(omega)} rad/s · Krot = ½ I ω² = {present(Krot)} J · I = β MR²
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="R (m)" value={R} min={0.2} max={0.8} step={0.05} onChange={setR} />
          <SliderRow label="vCM (m/s)" value={vcm} min={0.5} max={6} step={0.1} onChange={setVcm} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

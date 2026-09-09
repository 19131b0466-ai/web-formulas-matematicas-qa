'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function TorqueViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [tau, setTau] = useState(3);
  const [I, setI] = useState(1.2);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const alpha = tau / I;
  useRafPlay(playing, setT, { min: 0, max: 6, speed: 1, loop: true });
  const omega = alpha * t;
  const theta = 0.5 * alpha * t * t;
  const ox = 210;
  const oy = 130;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="torque" mode={mode} />
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
        <svg viewBox="0 0 420 260" className="h-auto w-full" role="img" aria-label="Disco: τ = I α">
          <ellipse cx={ox} cy={oy} rx={90} ry={90} fill={ACCENT} fillOpacity={0.12} stroke={MUTED} />
          <line
            x1={ox}
            y1={oy}
            x2={ox + 80 * Math.cos(theta)}
            y2={oy + 80 * Math.sin(theta)}
            stroke={ORANGE}
            strokeWidth={3}
          />
          <circle cx={ox} cy={oy} r={6} fill={MUTED} />
          <path
            d={`M${ox + 100} ${oy} A 20 20 0 0 ${tau >= 0 ? 1 : 0} ${ox + 92} ${oy + (tau >= 0 ? 28 : -28)}`}
            fill="none"
            stroke={ORANGE}
            strokeWidth={2.4}
          />
          <text x={ox + 110} y={oy + 8} fontSize={12} fill={ORANGE}>
            τ
          </text>
        </svg>
        <PhysStatus id={uid}>
          α = τ/I = {present(alpha)} rad/s² · ω = {present(omega)} rad/s · I = {present(I)} · τ = {present(tau)} N·m
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="τ (N·m)" value={tau} min={-8} max={8} step={0.1} onChange={setTau} />
          <SliderRow label="I (kg·m²)" value={I} min={0.2} max={4} step={0.1} onChange={setI} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

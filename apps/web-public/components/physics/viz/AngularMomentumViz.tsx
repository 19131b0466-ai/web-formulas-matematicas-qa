'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function AngularMomentumViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [r, setR] = useState(1.6);
  const [tauOn, setTauOn] = useState(mode === 'tau_dL');
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const m = 1;
  const I0 = 2 * m * 1.6 * 1.6;
  const L0 = I0 * 2.2;
  const I = 2 * m * r * r;
  const omega = tauOn ? L0 / I0 + (1.5 * t) / I : L0 / I;
  const L = I * omega;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 0.8, loop: true });
  const th = omega * t;
  const ox = 210;
  const oy = 140;
  const S = 50;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="angular_momentum" mode={mode} />
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
        <svg viewBox="0 0 420 280" className="h-auto w-full" role="img" aria-label="Conservación de L al recoger masas">
          <circle cx={ox} cy={oy} r={18} fill={MUTED} />
          {[0, Math.PI].map((off) => (
            <g key={off}>
              <line
                x1={ox}
                y1={oy}
                x2={ox + r * S * Math.cos(th + off)}
                y2={oy + r * S * Math.sin(th + off)}
                stroke={ACCENT}
                strokeWidth={3}
              />
              <circle
                cx={ox + r * S * Math.cos(th + off)}
                cy={oy + r * S * Math.sin(th + off)}
                r={10}
                fill={ORANGE}
              />
            </g>
          ))}
        </svg>
        <PhysStatus id={uid}>
          {mode === 'L_Iomega'
            ? `L = I ω = ${present(L)}`
            : tauOn
              ? `τ ≠ 0 · L = ${present(L)} (ya no constante)`
              : `L = I ω = ${present(L)} (se conserva al cambiar r) · ω = ${present(omega)} rad/s`}
        </PhysStatus>
        <ToggleRow label="Aplicar torque externo" checked={tauOn} onChange={setTauOn} />
        <ControlsStack>
          <SliderRow label="r (m)" value={r} min={0.5} max={2.4} step={0.05} onChange={setR} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

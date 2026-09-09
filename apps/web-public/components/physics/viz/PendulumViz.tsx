'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, degToRad } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function PendulumViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [L, setL] = useState(1.2);
  const [thMax, setThMax] = useState(12);
  const [m, setM] = useState(0.4);
  const [g, setG] = useState(G);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const omega = Math.sqrt(g / L);
  const Tper = 2 * Math.PI * Math.sqrt(L / g);
  useRafPlay(playing, setT, { min: 0, max: Tper, speed: 1, loop: true });
  const th = degToRad(thMax) * Math.cos(omega * t);
  const ox = 210;
  const oy = 20;
  const S = 120;
  const px = ox + L * S * 0.7 * Math.sin(th);
  const py = oy + L * S * 0.7 * Math.cos(th);
  const warn = thMax > 15;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="pendulum" mode={mode} />
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
        <svg viewBox="0 0 420 260" className="h-auto w-full" role="img" aria-label="Péndulo simple">
          <line x1={ox} y1={oy} x2={px} y2={py} stroke={MUTED} strokeWidth={2} />
          <circle cx={px} cy={py} r={8 + m * 4} fill={ORANGE} />
          <path
            d={`M${ox} ${oy + 40} A 40 40 0 0 1 ${ox + 40 * Math.sin(degToRad(thMax))} ${oy + 40 * Math.cos(degToRad(thMax))}`}
            fill="none"
            stroke={ACCENT}
          />
        </svg>
        <PhysStatus id={uid}>
          {mode === 'omega'
            ? `ω = √(g/L) = ${present(omega)} rad/s`
            : `T = 2π √(L/g) = ${present(Tper)} s · m no entra`}
          {warn ? ' · θmax > 15°: senθ ≈ θ ya no es exacta' : ''}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="L (m)" value={L} min={0.3} max={2} step={0.05} onChange={setL} />
          <SliderRow label="θmax (°)" value={thMax} min={2} max={40} step={1} onChange={setThMax} />
          <SliderRow label="m (kg) — no afecta T" value={m} min={0.1} max={2} step={0.05} onChange={setM} />
          <SliderRow label="g" value={g} min={9.8} max={10} step={0.01} onChange={setG} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

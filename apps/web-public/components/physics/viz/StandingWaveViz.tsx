'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function StandingWaveViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [n, setN] = useState(2);
  const [L, setL] = useState(2);
  const [v, setV] = useState(40);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lambda = (2 * L) / n;
  const f = (n * v) / (2 * L);
  const omega = 2 * Math.PI * f;
  const k = (2 * Math.PI) / lambda;
  useRafPlay(playing, setT, { min: 0, max: 1 / f, speed: 1, loop: true });
  const xs = Array.from({ length: 80 }, (_, i) => (i / 79) * L);
  const y = (x: number) => Math.sin(k * x) * Math.cos(omega * t);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="standing_wave" mode={mode} />
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
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Onda estacionaria en cuerda">
          <line x1={30} y1={20} x2={30} y2={120} stroke={MUTED} strokeWidth={4} />
          <line x1={390} y1={20} x2={390} y2={120} stroke={MUTED} strokeWidth={4} />
          <path
            d={xs.map((x, i) => `${i ? 'L' : 'M'}${30 + (x / L) * 360},${70 - y(x) * 40}`).join(' ')}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
          />
          {Array.from({ length: n + 1 }, (_, i) => (
            <circle key={i} cx={30 + (i / n) * 360} cy={70} r={4} fill={ORANGE} />
          ))}
        </svg>
        <PhysStatus id={uid}>
          λn = 2L/n = {present(lambda)} m · fn = n v/(2L) = {present(f)} Hz · nodos naranjas
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="n" value={n} min={1} max={4} step={1} onChange={setN} />
          <SliderRow label="L (m)" value={L} min={1} max={4} step={0.1} onChange={setL} />
          <SliderRow label="v (m/s)" value={v} min={10} max={80} step={1} onChange={setV} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function TravelingWaveViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [A, setA] = useState(0.8);
  const [lambda, setLambda] = useState(2.5);
  const [f, setF] = useState(0.6);
  const [dir, setDir] = useState<1 | -1>(1);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const k = (2 * Math.PI) / lambda;
  const omega = 2 * Math.PI * f;
  const v = lambda * f;
  const Tper = 1 / f;
  useRafPlay(playing, setT, { min: 0, max: Tper * 4, speed: 1, loop: true });
  const y = (x: number) => A * Math.sin(k * x - dir * omega * t);
  const xs = Array.from({ length: 80 }, (_, i) => (i / 79) * 8);
  const crest = ((dir * omega * t) / k + Math.PI / 2 / k) % lambda;

  let status = `y = A sen(kx − ωt) · v = ω/k = λ f = ${present(v)} m/s`;
  if (mode === 'v_lambda_f') status = `v = λ f = ${present(v)} m/s`;
  if (mode === 'T') status = `T = 1/f = ${present(Tper)} s`;
  if (mode === 'k') status = `k = 2π/λ = ${present(k)} rad/m`;
  if (mode === 'omega') status = `ω = 2π f = ${present(omega)} · v = ω/k = ${present(omega / k)}`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="traveling_wave" mode={mode} />
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
          <VizButton active={dir === 1} onClick={() => setDir(1)}>
            +x
          </VizButton>
          <VizButton active={dir === -1} onClick={() => setDir(-1)}>
            −x
          </VizButton>
        </ButtonRow>
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Onda viajera">
          <line x1={20} y1={70} x2={400} y2={70} stroke={MUTED} />
          <path
            d={xs.map((x, i) => `${i ? 'L' : 'M'}${20 + x * 48},${70 - y(x) * 28}`).join(' ')}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
          />
          <circle cx={20 + ((crest + lambda * 4) % 8) * 48} cy={70 - A * 28} r={5} fill={ORANGE} />
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="A" value={A} min={0.2} max={1.4} step={0.05} onChange={setA} />
          <SliderRow label="λ (m)" value={lambda} min={1} max={5} step={0.1} onChange={setLambda} />
          <SliderRow label="f (Hz)" value={f} min={0.2} max={1.5} step={0.05} onChange={setF} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

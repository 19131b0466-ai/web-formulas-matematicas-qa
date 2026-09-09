'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { travelingWaveSpeed } from './physLote5Math';
import { PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

function OtherWaveMode({ mode }: { mode: string }) {
  const uid = useId();
  const [lambda, setLambda] = useState(2.5);
  const [f, setF] = useState(0.6);
  const k = (2 * Math.PI) / lambda;
  const omega = 2 * Math.PI * f;
  const v = travelingWaveSpeed(lambda, f);
  const Tper = 1 / f;
  let status = `v = λ f = ${present(v)} m/s`;
  if (mode === 'v_lambda_f') status = `v = λ f = ${present(v)} m/s`;
  if (mode === 'T') status = `T = 1/f = ${present(Tper)} s`;
  if (mode === 'k') status = `k = 2π/λ = ${present(k)} rad/m`;
  if (mode === 'omega') status = `ω = 2π f = ${present(omega)}`;

  return (
    <div className="space-y-4">
      <PhysGuide type="traveling_wave" mode={mode} />
      <PhysStatus id={uid}>{status}</PhysStatus>
      <ControlsStack>
        <SliderRow label="λ" value={lambda} min={1} max={5} step={0.1} onChange={setLambda} />
        <SliderRow label="f" value={f} min={0.2} max={1.5} step={0.05} onChange={setF} />
      </ControlsStack>
    </div>
  );
}

function TravelingWaveAnchorMode({ mode }: { mode?: string }) {
  const l5 = useTranslations('vizFisica.l5.ond005');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [A, setA] = useState(0.8);
  const [lambda, setLambda] = useState(2.5);
  const [f, setF] = useState(0.6);
  const [dir, setDir] = useState<1 | -1>(1);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const k = (2 * Math.PI) / lambda;
  const omega = 2 * Math.PI * f;
  const v = travelingWaveSpeed(lambda, f);
  const Tper = 1 / f;
  useRafPlay(playing, setT, { min: 0, max: Tper * 4, speed: 1, loop: true });
  const y = (x: number) => A * Math.sin(k * x - dir * omega * t);
  const xs = Array.from({ length: 80 }, (_, i) => (i / 79) * 8);
  const particleX = 4;
  const particleY = y(particleX);

  return (
    <div className="space-y-4">
      <PhysGuide type="traveling_wave" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <ButtonRow>
        <VizButton active={dir === 1} onClick={() => setDir(1)}>{l5('plusX')}</VizButton>
        <VizButton active={dir === -1} onClick={() => setDir(-1)}>{l5('minusX')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={l5('aria')}>
        <line x1={20} y1={80} x2={400} y2={80} stroke={MUTED} />
        <path d={xs.map((x, i) => `${i ? 'L' : 'M'}${20 + x * 48},${80 - y(x) * 28}`).join(' ')} fill="none" stroke={ACCENT} strokeWidth={2} />
        <line x1={20} y1={80 - A * 28} x2={20} y2={80 + A * 28} stroke={ORANGE} strokeDasharray="3 3" />
        <text x={24} y={80 - A * 28 - 4} fontSize={10} fill={ORANGE}>A</text>
        <line x1={20} y1={108} x2={20 + lambda * 48} y2={108} stroke={TEAL} strokeWidth={1.5} />
        <text x={20 + lambda * 24} y={122} fontSize={10} fill={TEAL} textAnchor="middle">λ</text>
        <circle cx={20 + particleX * 48} cy={80 - particleY * 28} r={5} fill={ORANGE} />
        <text x={20 + particleX * 48 + 8} y={80 - particleY * 28} fontSize={10} fill={ORANGE}>{l5('particle')}</text>
      </svg>
      <PhysResult primary={l5('speed', { v: present(v), lambda: present(lambda), f: present(f) })} />
      <PhysStatus id={uid}>{l5('status', { v: present(v), dir: dir > 0 ? '+x' : '−x' })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="A" value={A} min={0.2} max={1.4} step={0.05} onChange={setA} />
        <SliderRow label="λ (m)" value={lambda} min={1} max={5} step={0.1} onChange={setLambda} />
        <SliderRow label="f (Hz)" value={f} min={0.2} max={1.5} step={0.05} onChange={setF} />
      </ControlsStack>
    </div>
  );
}

export function TravelingWaveViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode ? <OtherWaveMode mode={mode} /> : <TravelingWaveAnchorMode mode={mode} />}
    </VizPanel>
  );
}

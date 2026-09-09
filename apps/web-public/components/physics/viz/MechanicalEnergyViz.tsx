'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

export function MechanicalEnergyViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [scene, setScene] = useState<'ramp' | 'spring' | 'friction'>('ramp');
  const [h0, setH0] = useState(4);
  const [m, setM] = useState(1.2);
  const [k, setK] = useState(40);
  const [A, setA] = useState(0.25);
  const [muk, setMuk] = useState(0.15);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tMax = 2.4;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const u = t / tMax;
  let K = 0;
  let U = 0;
  let Wnc = 0;
  if (scene === 'spring') {
    const x = A * Math.cos(Math.PI * u);
    U = 0.5 * k * x * x;
    K = 0.5 * k * A * A - U;
  } else {
    const y = h0 * (1 - u);
    const d = Math.hypot(h0, h0) * u;
    Wnc = scene === 'friction' ? -muk * m * G * d : 0;
    const Emec0 = m * G * h0;
    const Emec = Emec0 + Wnc;
    U = m * G * y;
    K = Math.max(0, Emec - U);
  }
  const Emec = K + U;
  const yPix = scene === 'spring' ? 80 : 30 + (1 - u) * 90;

  let status = `Emec = K + U = ${present(Emec)} J`;
  if (mode === 'kinetic') status = `K = ½ m v² = ${present(K)} J`;
  if (mode === 'grav') status = `Ug = m g y = ${present(U)} J`;
  if (mode === 'spring') status = `Us = ½ k x²`;
  if (mode === 'work_energy') status = `Wneto = ΔK`;
  if (mode === 'total') status = `Emec = K + U = ${present(Emec)}`;
  if (mode === 'nonconservative') status = `ΔEmec = Wnc = ${present(Wnc)} J`;
  if (mode === 'friction_work') status = `Wf = −fk d = ${present(Wnc)} J`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="mechanical_energy" mode={mode} />
        <ButtonRow>
          <VizButton active={scene === 'ramp'} onClick={() => setScene('ramp')}>
            Pendiente
          </VizButton>
          <VizButton active={scene === 'spring'} onClick={() => setScene('spring')}>
            Resorte
          </VizButton>
          <VizButton active={scene === 'friction'} onClick={() => setScene('friction')}>
            Con μk
          </VizButton>
        </ButtonRow>
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
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Energía mecánica">
          {scene !== 'spring' ? (
            <line x1={40} y1={30} x2={360} y2={140} stroke={MUTED} strokeWidth={3} />
          ) : (
            <line x1={40} y1={80} x2={380} y2={80} stroke={MUTED} />
          )}
          <circle cx={scene === 'spring' ? 80 + u * 220 : 50 + u * 280} cy={yPix} r={9} fill={ORANGE} />
        </svg>
        <EnergyBars
          items={[
            { label: 'K', value: K, color: TEAL },
            { label: 'U', value: U, color: ACCENT },
            { label: 'Emec', value: Emec, color: ORANGE },
          ]}
        />
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          {scene !== 'spring' ? <SliderRow label="h0 (m)" value={h0} min={1} max={8} step={0.1} onChange={setH0} /> : null}
          <SliderRow label="m (kg)" value={m} min={0.4} max={5} step={0.1} onChange={setM} />
          {scene === 'spring' ? (
            <>
              <SliderRow label="k" value={k} min={10} max={80} step={1} onChange={setK} />
              <SliderRow label="A (m)" value={A} min={0.05} max={0.4} step={0.01} onChange={setA} />
            </>
          ) : null}
          {scene === 'friction' ? <SliderRow label="μk" value={muk} min={0} max={0.5} step={0.01} onChange={setMuk} /> : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

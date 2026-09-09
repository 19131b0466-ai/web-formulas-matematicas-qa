'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { formatEnergy } from './physFormat';
import { kineticEnergy } from './physLote1Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot, padRange } from './physPlot';

function KineticMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.ene003');
  const uid = useId();
  const [m, setM] = useState(2);
  const [v, setV] = useState(3);
  const K = kineticEnergy(m, v);
  const vMax = 8;
  const kPlot = makePlot({ xMin: -vMax, xMax: vMax, ...padRange(Array.from({ length: 40 }, (_, i) => kineticEnergy(m, -vMax + ((2 * vMax) * i) / 39)), 0.15, 10), H: 120 });
  const presets = [
    { id: 'v', label: tr('presetV'), v: 3 },
    { id: '2v', label: tr('preset2v'), v: 6 },
    { id: 'neg', label: tr('presetNeg'), v: -3 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="mechanical_energy" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => setV(p.v) }))} />
      <ChartFrame plot={kPlot} xLabel="v (m/s)" yLabel="K (J)" title="K(v)">
        <path d={fnPath((vv) => kineticEnergy(m, vv), -vMax, vMax, kPlot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={kPlot.X(v)} cy={kPlot.Y(K)} r={5} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={`K = ½ m v² = ${formatEnergy(K)}`} />
      <PhysStatus id={uid}>{tr('status', { m: present(m), v: present(v), K: formatEnergy(K) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('mass', { m: present(m) })} value={m} min={0.5} max={6} step={0.1} onChange={setM} />
        <SliderRow label={tr('velocity', { v: present(v) })} value={v} min={-6} max={6} step={0.1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function ConservationMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.ene010');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [scene, setScene] = useState<'ramp' | 'spring'>('ramp');
  const [h0, setH0] = useState(4);
  const [m, setM] = useState(1.2);
  const [k, setK] = useState(40);
  const [A, setA] = useState(0.25);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tMax = 2.4;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const u = t / tMax;
  let K = 0;
  let U = 0;
  if (scene === 'spring') {
    const x = A * Math.cos(Math.PI * u);
    U = 0.5 * k * x * x;
    K = 0.5 * k * A * A - U;
  } else {
    const y = h0 * (1 - u);
    U = m * G * y;
    K = m * G * h0 - U;
  }
  const Emec = K + U;
  const E0 = scene === 'spring' ? 0.5 * k * A * A : m * G * h0;

  return (
    <div className="space-y-4">
      <PhysGuide type="mechanical_energy" mode={mode} />
      <ButtonRow>
        <VizButton active={scene === 'ramp'} onClick={() => setScene('ramp')}>{tr('ramp')}</VizButton>
        <VizButton active={scene === 'spring'} onClick={() => setScene('spring')}>{tr('spring')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        {scene === 'ramp' ? <line x1={40} y1={30} x2={360} y2={120} stroke={MUTED} strokeWidth={3} /> : <line x1={40} y1={80} x2={380} y2={80} stroke={MUTED} />}
        <circle cx={scene === 'spring' ? 80 + u * 220 : 50 + u * 280} cy={scene === 'spring' ? 80 : 30 + (1 - u) * 90} r={9} fill={ORANGE} />
        <line x1={20} y1={20} x2={400} y2={20} stroke={ORANGE} strokeDasharray="6 4" strokeWidth={1.5} />
        <text x={24} y={16} fontSize={10} fill={ORANGE}>E = {present(E0)} J</text>
      </svg>
      <EnergyBars items={[{ label: 'K', value: K, color: TEAL }, { label: 'U', value: U, color: ACCENT }, { label: 'E', value: Emec, color: ORANGE }]} />
      <PhysResult primary={`E = K + U = ${formatEnergy(Emec)}`} secondary={tr('constant', { drift: present(Math.abs(Emec - E0)) })} />
      <PhysStatus id={uid}>{tr('status', { E: formatEnergy(Emec) })}</PhysStatus>
      <ControlsStack>
        {scene === 'ramp' ? <SliderRow label="h0 (m)" value={h0} min={1} max={8} step={0.1} onChange={setH0} /> : null}
        <SliderRow label="m (kg)" value={m} min={0.4} max={5} step={0.1} onChange={setM} />
        {scene === 'spring' ? (
          <>
            <SliderRow label="k" value={k} min={10} max={80} step={1} onChange={setK} />
            <SliderRow label="A (m)" value={A} min={0.05} max={0.4} step={0.01} onChange={setA} />
          </>
        ) : null}
      </ControlsStack>
    </div>
  );
}

function NonConservativeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.ene011');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [muk, setMuk] = useState(0.2);
  const [m, setM] = useState(1.2);
  const [h0, setH0] = useState(4);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [compare, setCompare] = useState(false);
  const tMax = 2.4;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const u = t / tMax;
  const d = Math.hypot(h0, h0) * u;
  const Wnc = compare ? 0 : -muk * m * G * d;
  const Emec0 = m * G * h0;
  const y = h0 * (1 - u);
  const U = m * G * y;
  const Emec = Emec0 + Wnc;
  const K = Math.max(0, Emec - U);
  const Qth = -Wnc;

  return (
    <div className="space-y-4">
      <PhysGuide type="mechanical_energy" mode={mode} />
      <ButtonRow>
        <VizButton active={!compare} onClick={() => setCompare(false)}>{tr('withFriction')}</VizButton>
        <VizButton active={compare} onClick={() => setCompare(true)}>{tr('noFriction')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={40} y1={30} x2={360} y2={120} stroke={MUTED} strokeWidth={3} />
        <circle cx={50 + u * 280} cy={30 + (1 - u) * 90} r={9} fill={ORANGE} />
      </svg>
      <EnergyBars items={[
        { label: 'K', value: K, color: TEAL },
        { label: 'U', value: U, color: ACCENT },
        { label: 'Eth', value: Qth, color: MUTED },
        { label: 'E+mec', value: K + U, color: ORANGE },
      ]} />
      <PhysResult primary={tr('balance', { Wnc: present(Wnc), dEmec: present((K + U) - Emec0) })} />
      <PhysStatus id={uid}>{tr('status', { Wnc: present(Wnc) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="μk" value={muk} min={0} max={0.5} step={0.01} onChange={setMuk} />
        <SliderRow label="m (kg)" value={m} min={0.4} max={5} step={0.1} onChange={setM} />
        <SliderRow label="h0 (m)" value={h0} min={1} max={8} step={0.1} onChange={setH0} />
      </ControlsStack>
    </div>
  );
}

function GeneralEnergyMode({ mode }: { mode?: string }) {
  const trBase = useTranslations('vizFisica');
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
  let status = `Emec = K + U = ${present(Emec)} J`;
  if (mode === 'grav') status = `Ug = m g y = ${present(U)} J`;
  if (mode === 'spring') status = `Us = ½ k x²`;
  if (mode === 'work_energy') status = `Wneto = ΔK`;
  if (mode === 'total') status = `Emec = K + U = ${present(Emec)}`;
  if (mode === 'friction_work') status = `Wf = −fk d = ${present(Wnc)} J`;

  return (
    <div className="space-y-4">
      <PhysGuide type="mechanical_energy" mode={mode} />
      <ButtonRow>
        <VizButton active={scene === 'ramp'} onClick={() => setScene('ramp')}>Pendiente</VizButton>
        <VizButton active={scene === 'spring'} onClick={() => setScene('spring')}>Resorte</VizButton>
        <VizButton active={scene === 'friction'} onClick={() => setScene('friction')}>Con μk</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <EnergyBars items={[{ label: 'K', value: K, color: TEAL }, { label: 'U', value: U, color: ACCENT }, { label: 'Emec', value: Emec, color: ORANGE }]} />
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
  );
}

export function MechanicalEnergyViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'kinetic' ? <KineticMode mode={mode} /> :
        mode === 'nonconservative' ? <NonConservativeMode mode={mode} /> :
        !mode ? <ConservationMode mode={mode} /> :
        <GeneralEnergyMode mode={mode} />}
    </VizPanel>
  );
}

'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G_NEWTON } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { gravitationPotential } from './physLote4Math';
import { escapeVelocity, orbitalEnergy, orbitalPeriod, orbitalVelocity } from './physLote5Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function UPotentialMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.gra003');
  const uid = useId();
  const [M, setM] = useState(6);
  const [r, setR] = useState(7);
  const m = 500;
  const mass = M * 1e24;
  const R = r * 1e6;
  const U = gravitationPotential(mass, m, R);
  const plot = makePlot({ xMin: 4, xMax: 14, yMin: -12, yMax: 0, H: 130 });
  const Uof = (rr: number) => gravitationPotential(mass, m, rr * 1e6) / 1e9;

  return (
    <div className="space-y-4">
      <PhysGuide type="orbit" mode={mode} />
      <ChartFrame plot={plot} xLabel="r (10⁶ m)" yLabel="U (×10⁹ J)" title={tr('title')}>
        <path d={fnPath(Uof, 4.2, 13.5, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(r)} cy={plot.Y(Uof(r))} r={5} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('potential', { U: present(U) })} secondary={tr('note')} />
      <PhysStatus id={uid}>{tr('status', { U: present(U), r: present(r) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
        <SliderRow label="r (10⁶ m)" value={r} min={4} max={12} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

function CircularOrbitMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.gra005');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [M, setM] = useState(6);
  const [r, setR] = useState(7);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mass = M * 1e24;
  const R = r * 1e6;
  const mu = G_NEWTON * mass;
  const vorb = orbitalVelocity(mu, R);
  const Tper = orbitalPeriod(mu, R);
  useRafPlay(playing, setT, { min: 0, max: Tper, speed: Tper / 6, loop: true });
  const th = (t / Tper) * 2 * Math.PI;
  const ox = 210;
  const oy = 130;
  const S = 12;
  const px = ox + r * S * Math.cos(th);
  const py = oy + r * S * Math.sin(th);
  const plot = makePlot({ xMin: 4, xMax: 12, yMin: 0, yMax: 12000, H: 100 });
  const vOf = (rr: number) => orbitalVelocity(mu, rr * 1e6);

  return (
    <div className="space-y-4">
      <PhysGuide type="orbit" mode={mode} />
      <PhysPresets items={[
        { id: 'r1', label: tr('presetR1'), onSelect: () => setR(5) },
        { id: 'r2', label: tr('presetR2'), onSelect: () => setR(9) },
      ]} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={ox} cy={oy} r={r * S} fill="none" stroke={MUTED} />
        <circle cx={ox} cy={oy} r={14} fill={ORANGE} />
        <circle cx={px} cy={py} r={7} fill={TEAL} />
        <line x1={px} y1={py} x2={px - Math.sin(th) * 36} y2={py + Math.cos(th) * 36} stroke={ACCENT} strokeWidth={2.2} />
        <line x1={ox} y1={oy} x2={px} y2={py} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={px} y1={py} x2={ox} y2={oy} stroke={TEAL} strokeWidth={2} />
        <text x={24} y={20} fontSize={10} fill={MUTED}>{tr('ideal')}</text>
      </svg>
      <ChartFrame plot={plot} xLabel="r (10⁶ m)" yLabel="v (m/s)" title={tr('vChart')}>
        <path d={fnPath(vOf, 4.2, 11.5, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(r)} cy={plot.Y(vorb)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('vorb', { v: present(vorb) })} secondary={tr('ratio', { r: present(r), v: present(vorb) })} />
      <PhysStatus id={uid}>{tr('status', { v: present(vorb), T: present(Tper) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
        <SliderRow label="r (10⁶ m)" value={r} min={4} max={12} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

function PeriodMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.gra006');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [M, setM] = useState(6);
  const [r1, setR1] = useState(5);
  const [r2, setR2] = useState(9);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mass = M * 1e24;
  const mu = G_NEWTON * mass;
  const T1 = orbitalPeriod(mu, r1 * 1e6);
  const T2 = orbitalPeriod(mu, r2 * 1e6);
  const tMax = T2;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: tMax / 8, loop: true });
  const ox = 210;
  const oy = 140;
  const S = 10;
  const plot = makePlot({ xMin: 4, xMax: 12, yMin: 0, yMax: T2 * 1.1, H: 100 });
  const Tof = (rr: number) => orbitalPeriod(mu, rr * 1e6);

  return (
    <div className="space-y-4">
      <PhysGuide type="orbit" mode={mode} />
      <PhysPresets items={[{ id: 'kepler', label: tr('presetKepler'), onSelect: () => { setR1(5); setR2(9); } }]} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={ox} cy={oy} r={r1 * S} fill="none" stroke={TEAL} />
        <circle cx={ox} cy={oy} r={r2 * S} fill="none" stroke={ACCENT} />
        <circle cx={ox} cy={oy} r={12} fill={ORANGE} />
        <circle cx={ox + r1 * S * Math.cos((t / T1) * 2 * Math.PI)} cy={oy + r1 * S * Math.sin((t / T1) * 2 * Math.PI)} r={5} fill={TEAL} />
        <circle cx={ox + r2 * S * Math.cos((t / T2) * 2 * Math.PI)} cy={oy + r2 * S * Math.sin((t / T2) * 2 * Math.PI)} r={5} fill={ACCENT} />
        <text x={24} y={20} fontSize={10} fill={MUTED}>{tr('accelTime')}</text>
      </svg>
      <ChartFrame plot={plot} xLabel="r (10⁶ m)" yLabel="T (s)" title={tr('tChart')}>
        <path d={fnPath(Tof, 4.2, 11.5, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(r1)} cy={plot.Y(T1)} r={4} fill={TEAL} />
        <circle cx={plot.X(r2)} cy={plot.Y(T2)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('periods', { T1: present(T1), T2: present(T2) })} secondary={tr('kepler', { ratio: present((T2 * T2) / (T1 * T1) / ((r2 / r1) ** 3)) })} />
      <PhysStatus id={uid}>{tr('status', { t: present(t), T1: present(T1), T2: present(T2) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
        <SliderRow label="r1 (10⁶ m)" value={r1} min={4} max={10} step={0.1} onChange={setR1} />
        <SliderRow label="r2 (10⁶ m)" value={r2} min={5} max={12} step={0.1} onChange={setR2} />
      </ControlsStack>
    </div>
  );
}

function EscapeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.gra007');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [M, setM] = useState(6);
  const [r, setR] = useState(7);
  const [vFactor, setVFactor] = useState(1);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const m = 500;
  const mass = M * 1e24;
  const R = r * 1e6;
  const mu = G_NEWTON * mass;
  const vesc = escapeVelocity(mu, R);
  const vorb = orbitalVelocity(mu, R);
  const v0 = vFactor * vesc;
  const E = orbitalEnergy(mu, m, R, v0);
  const U = gravitationPotential(mass, m, R);
  const K = 0.5 * m * v0 * v0;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const radial = R + (v0 * t - 0.5 * (mu / (R * R)) * m * 0 * t * t) * 0.00002;
  const dist = Math.min(R * 2.2, Math.max(R * 0.8, radial));
  const state = E < -1e6 ? tr('bound') : Math.abs(E) < 1e6 ? tr('limit') : tr('escape');

  return (
    <div className="space-y-4">
      <PhysGuide type="orbit" mode={mode} />
      <PhysPresets items={[
        { id: '08', label: '0.8 vesc', onSelect: () => setVFactor(0.8) },
        { id: '10', label: 'vesc', onSelect: () => setVFactor(1) },
        { id: '12', label: '1.2 vesc', onSelect: () => setVFactor(1.2) },
      ]} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={210} cy={100} r={14} fill={ORANGE} />
        <circle cx={210 + (dist / 1e6) * 8} cy={100} r={6} fill={TEAL} />
        <line x1={210 + (dist / 1e6) * 8} y1={100} x2={210 + (dist / 1e6) * 8 + vFactor * 30} y2={100} stroke={ACCENT} strokeWidth={2} />
      </svg>
      <EnergyBars items={[
        { label: 'K', value: K, color: TEAL },
        { label: 'U', value: U, color: ACCENT },
        { label: 'E', value: E, color: ORANGE },
      ]} />
      <PhysResult primary={tr('vesc', { vesc: present(vesc), v0: present(v0) })} secondary={tr('sqrt2', { vorb: present(vorb) })} />
      <PhysStatus id={uid}>{tr('status', { state, E: present(E) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="v0 / vesc" value={vFactor} min={0.5} max={1.5} step={0.05} onChange={setVFactor} />
        <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
        <SliderRow label="r (10⁶ m)" value={r} min={4} max={12} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

function EnergyOrbitMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [M, setM] = useState(6);
  const [r, setR] = useState(7);
  const mass = M * 1e24;
  const R = r * 1e6;
  const mu = G_NEWTON * mass;
  const m = 500;
  const vorb = orbitalVelocity(mu, R);
  const E = -mu * m / (2 * R);

  return (
    <div className="space-y-4">
      <PhysGuide type="orbit" mode={mode} />
      <PhysStatus id={uid}>E = −GMm/(2r) = {present(E)} J · vorb = {present(vorb)} m/s</PhysStatus>
      <ControlsStack>
        <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
        <SliderRow label="r (10⁶ m)" value={r} min={4} max={12} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

export function OrbitViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'U' ? <UPotentialMode mode={mode} /> :
        mode === 'period' ? <PeriodMode mode={mode} /> :
        mode === 'escape' ? <EscapeMode mode={mode} /> :
        mode === 'E' ? <EnergyOrbitMode mode={mode} /> :
        <CircularOrbitMode mode={mode} />}
    </VizPanel>
  );
}

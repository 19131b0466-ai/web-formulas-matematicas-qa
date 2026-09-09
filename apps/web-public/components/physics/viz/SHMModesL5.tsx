'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizButton, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad, shmAfromX, shmV, shmX } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { shmTotalEnergy } from './physLote5Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

const W = 420;

function useSHMState() {
  const [A, setA] = useState(0.22);
  const [m, setM] = useState(0.8);
  const [k, setK] = useState(18);
  const [phiDeg, setPhiDeg] = useState(0);
  const [t, setT] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const [circle, setCircle] = useState(true);
  const omega = Math.sqrt(k / m);
  const Tper = (2 * Math.PI) / omega;
  const phi = degToRad(phiDeg);
  const tMax = Tper * 2;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const x = shmX(A, omega, t, phi);
  const v = shmV(A, omega, t, phi);
  const acc = shmAfromX(x, omega);
  const Us = 0.5 * k * x * x;
  const K = 0.5 * m * v * v;
  const E = shmTotalEnergy(k, A);
  const ox = 60;
  const eq = 200;
  const px = eq + (x / Math.max(A, 0.05)) * 90;
  return {
    A, setA, m, setM, k, setK, phiDeg, setPhiDeg, t, setT, playing, setPlaying, circle, setCircle,
    omega, Tper, phi, tMax, x, v, acc, Us, K, E, ox, eq, px,
  };
}

export function PositionSHMMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.osc003');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const s = useSHMState();
  const plot = makePlot({ xMin: 0, xMax: s.tMax, yMin: -s.A * 1.3, yMax: s.A * 1.3, H: 100, W });

  return (
    <div className="space-y-4">
      <PhysGuide type="shm" mode={mode} />
      <PhysPresets items={[
        { id: 'p0', label: 'φ=0', onSelect: () => s.setPhiDeg(0) },
        { id: 'p90', label: 'φ=90°', onSelect: () => s.setPhiDeg(90) },
        { id: 'p180', label: 'φ=180°', onSelect: () => s.setPhiDeg(180) },
      ]} />
      <PlayRow playing={s.playing} onToggle={() => s.setPlaying((p) => !p)} extra={<VizButton onClick={() => { s.setPlaying(false); s.setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} 88`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={s.ox} y1={20} x2={s.ox} y2={68} stroke={MUTED} strokeWidth={4} />
        <line x1={s.ox} y1={44} x2={s.px - 14} y2={44} stroke={ACCENT} strokeWidth={3} />
        <rect x={s.px - 14} y={30} width={28} height={28} rx={4} fill={ORANGE} />
        <line x1={s.eq - s.A * 90 / Math.max(s.A, 0.05)} y1={18} x2={s.eq + s.A * 90 / Math.max(s.A, 0.05)} y2={18} stroke={ORANGE} strokeDasharray="4 3" />
        <line x1={s.eq} y1={18} x2={s.eq} y2={70} stroke={MUTED} strokeDasharray="3 3" />
        <text x={s.eq + s.A * 90 / Math.max(s.A, 0.05) + 4} y={16} fontSize={10} fill={ORANGE}>±A</text>
      </svg>
      {s.circle ? (
        <svg viewBox="0 0 200 120" className="mx-auto h-auto w-40" role="img" aria-hidden>
          <circle cx={100} cy={60} r={40} fill="none" stroke={MUTED} />
          <circle cx={100 + 40 * Math.cos(s.omega * s.t + s.phi)} cy={60 - 40 * Math.sin(s.omega * s.t + s.phi)} r={5} fill={ORANGE} />
        </svg>
      ) : null}
      <ChartFrame plot={plot} xLabel="t (s)" yLabel="x (m)" title="x(t)">
        <path d={fnPath((ti) => shmX(s.A, s.omega, ti, s.phi), 0, s.tMax, plot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
        <circle cx={plot.X(s.t)} cy={plot.Y(s.x)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('position', { x: present(s.x), A: present(s.A) })} secondary={tr('period', { T: present(s.Tper) })} />
      <PhysStatus id={uid}>{tr('status', { x: present(s.x), phi: s.phiDeg })}</PhysStatus>
      <ToggleRow label={tr('circle')} checked={s.circle} onChange={s.setCircle} />
      <ControlsStack>
        <SliderRow label={`t (${fmt(s.t)} s)`} value={s.t} min={0} max={s.tMax} step={0.02} onChange={s.setT} />
        <SliderRow label="A (m)" value={s.A} min={0.05} max={0.4} step={0.01} onChange={s.setA} />
        <SliderRow label="φ (°)" value={s.phiDeg} min={0} max={359} step={1} onChange={s.setPhiDeg} />
        <SliderRow label="k" value={s.k} min={5} max={50} step={0.5} onChange={s.setK} />
        <SliderRow label="m" value={s.m} min={0.2} max={4} step={0.1} onChange={s.setM} />
      </ControlsStack>
    </div>
  );
}

export function AccelSHMMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.osc004');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const s = useSHMState();
  const aPlot = makePlot({ xMin: -s.A * 1.2, xMax: s.A * 1.2, yMin: -s.A * s.omega * s.omega * 1.3, yMax: s.A * s.omega * s.omega * 1.3, H: 100 });

  return (
    <div className="space-y-4">
      <PhysGuide type="shm" mode={mode} />
      <PhysPresets items={[
        { id: 'c', label: tr('center'), onSelect: () => { s.setPhiDeg(0); s.setT(s.Tper / 4); } },
        { id: 'r', label: tr('right'), onSelect: () => { s.setPhiDeg(0); s.setT(0); } },
        { id: 'l', label: tr('left'), onSelect: () => { s.setPhiDeg(180); s.setT(0); } },
      ]} />
      <PlayRow playing={s.playing} onToggle={() => s.setPlaying((p) => !p)} extra={<VizButton onClick={() => { s.setPlaying(false); s.setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} 100`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={s.px - 14} y={40} width={28} height={28} rx={4} fill={ORANGE} />
        <line x1={s.px} y1={54} x2={s.px + s.x * 80} y2={54} stroke={TEAL} strokeWidth={2} />
        <line x1={s.px} y1={54} x2={s.px - s.acc * 8} y2={54} stroke={ACCENT} strokeWidth={2.4} />
        <text x={s.px + 20} y={48} fontSize={10} fill={TEAL}>x</text>
        <text x={s.px - 50} y={48} fontSize={10} fill={ACCENT}>a</text>
      </svg>
      <ChartFrame plot={aPlot} xLabel="x (m)" yLabel="a (m/s²)" title="a(x) = −ω²x">
        <path d={fnPath((xx) => shmAfromX(xx, s.omega), -s.A, s.A, aPlot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={aPlot.X(s.x)} cy={aPlot.Y(s.acc)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('accel', { a: present(s.acc), x: present(s.x) })} />
      <PhysStatus id={uid}>{tr('status', { a: present(s.acc), omega: present(s.omega) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={`t (${fmt(s.t)} s)`} value={s.t} min={0} max={s.tMax} step={0.02} onChange={s.setT} />
        <SliderRow label="A (m)" value={s.A} min={0.05} max={0.4} step={0.01} onChange={s.setA} />
        <SliderRow label="φ (°)" value={s.phiDeg} min={0} max={359} step={1} onChange={s.setPhiDeg} />
      </ControlsStack>
    </div>
  );
}

export function VelocitySHMMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.osc005');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const s = useSHMState();
  const xPlot = makePlot({ xMin: 0, xMax: s.tMax, yMin: -s.A * 1.3, yMax: s.A * 1.3, H: 90 });
  const vPlot = makePlot({ xMin: 0, xMax: s.tMax, yMin: -s.A * s.omega * 1.3, yMax: s.A * s.omega * 1.3, H: 90 });

  return (
    <div className="space-y-4">
      <PhysGuide type="shm" mode={mode} />
      <PhysPresets items={[
        { id: 'ext', label: tr('extreme'), onSelect: () => { s.setPhiDeg(0); s.setT(0); } },
        { id: 'eqr', label: tr('eqRight'), onSelect: () => { s.setPhiDeg(0); s.setT(s.Tper / 4); } },
        { id: 'eql', label: tr('eqLeft'), onSelect: () => { s.setPhiDeg(0); s.setT(3 * s.Tper / 4); } },
      ]} />
      <PlayRow playing={s.playing} onToggle={() => s.setPlaying((p) => !p)} extra={<VizButton onClick={() => { s.setPlaying(false); s.setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} 88`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={s.px - 14} y={30} width={28} height={28} rx={4} fill={ORANGE} />
        <line x1={s.px} y1={44} x2={s.px + s.v * 18} y2={44} stroke={TEAL} strokeWidth={2.4} />
      </svg>
      <ChartFrame plot={xPlot} xLabel="t" yLabel="x" title="x(t)">
        <path d={fnPath((ti) => shmX(s.A, s.omega, ti, s.phi), 0, s.tMax, xPlot)} fill="none" stroke={ACCENT} strokeWidth={1.6} />
        <circle cx={xPlot.X(s.t)} cy={xPlot.Y(s.x)} r={3} fill={ORANGE} />
      </ChartFrame>
      <ChartFrame plot={vPlot} xLabel="t" yLabel="v" title="v(t)">
        <path d={fnPath((ti) => shmV(s.A, s.omega, ti, s.phi), 0, s.tMax, vPlot)} fill="none" stroke={TEAL} strokeWidth={1.6} />
        <circle cx={vPlot.X(s.t)} cy={vPlot.Y(s.v)} r={3} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('velocity', { v: present(s.v), x: present(s.x) })} secondary={tr('phase')} />
      <PhysStatus id={uid}>{tr('status', { v: present(s.v), vmax: present(s.A * s.omega) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={`t (${fmt(s.t)} s)`} value={s.t} min={0} max={s.tMax} step={0.02} onChange={s.setT} />
        <SliderRow label="A (m)" value={s.A} min={0.05} max={0.4} step={0.01} onChange={s.setA} />
        <SliderRow label="φ (°)" value={s.phiDeg} min={0} max={359} step={1} onChange={s.setPhiDeg} />
      </ControlsStack>
    </div>
  );
}

export function EnergySHMMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.osc008');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const s = useSHMState();
  const uPlot = makePlot({ xMin: -s.A * 1.2, xMax: s.A * 1.2, yMin: 0, yMax: s.E * 1.2, H: 90 });

  return (
    <div className="space-y-4">
      <PhysGuide type="shm" mode={mode} />
      <PlayRow playing={s.playing} onToggle={() => s.setPlaying((p) => !p)} extra={<VizButton onClick={() => { s.setPlaying(false); s.setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} 88`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={s.px - 14} y={30} width={28} height={28} rx={4} fill={ORANGE} />
      </svg>
      <EnergyBars items={[
        { label: 'K', value: s.K, color: TEAL },
        { label: 'Us', value: s.Us, color: ACCENT },
        { label: 'E', value: s.E, color: ORANGE },
      ]} />
      <ChartFrame plot={uPlot} xLabel="x" yLabel="U, K" title={tr('energyChart')}>
        <path d={fnPath((xx) => 0.5 * s.k * xx * xx, -s.A, s.A, uPlot)} fill="none" stroke={ACCENT} strokeWidth={1.6} />
        <path d={fnPath((xx) => s.E - 0.5 * s.k * xx * xx, -s.A, s.A, uPlot)} fill="none" stroke={TEAL} strokeWidth={1.6} strokeDasharray="4 3" />
        <circle cx={uPlot.X(s.x)} cy={uPlot.Y(s.Us)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('total', { E: present(s.E) })} secondary={tr('balance', { sum: present(s.K + s.Us), drift: present(Math.abs(s.K + s.Us - s.E)) })} />
      <PhysStatus id={uid}>{tr('status', { K: present(s.K), U: present(s.Us), E: present(s.E) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={`t (${fmt(s.t)} s)`} value={s.t} min={0} max={s.tMax} step={0.02} onChange={s.setT} />
        <SliderRow label="A (m)" value={s.A} min={0.05} max={0.4} step={0.01} onChange={s.setA} />
        <SliderRow label="k" value={s.k} min={5} max={50} step={0.5} onChange={s.setK} />
        <SliderRow label="m" value={s.m} min={0.2} max={4} step={0.1} onChange={s.setM} />
      </ControlsStack>
    </div>
  );
}

export function GeneralSHMMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const s = useSHMState();
  const vmax = s.A * s.omega;
  const amax = s.A * s.omega * s.omega;
  const f = 1 / s.Tper;
  let status = `ω = ${present(s.omega)} rad/s · T = ${present(s.Tper)} s`;
  if (mode === 'omega_spring') status = `ω = √(k/m) = ${present(s.omega)} rad/s`;
  if (mode === 'period_spring') status = `T = 2π √(m/k) = ${present(s.Tper)} s`;
  if (mode === 'vmax') status = `vmax = A ω = ${present(vmax)} m/s`;
  if (mode === 'amax') status = `amax = A ω² = ${present(amax)} m/s²`;
  if (mode === 'Tf') status = `f = 1/T = ${present(f)} Hz`;
  if (mode === 'omega') status = `ω = 2π f = ${present(s.omega)} rad/s`;

  return (
    <div className="space-y-4">
      <PhysGuide type="shm" mode={mode} />
      <PhysStatus id={uid}>{status}</PhysStatus>
      <ControlsStack>
        <SliderRow label="A (m)" value={s.A} min={0.05} max={0.4} step={0.01} onChange={s.setA} />
        <SliderRow label="m (kg)" value={s.m} min={0.2} max={4} step={0.1} onChange={s.setM} />
        <SliderRow label="k (N/m)" value={s.k} min={5} max={50} step={0.5} onChange={s.setK} />
      </ControlsStack>
    </div>
  );
}

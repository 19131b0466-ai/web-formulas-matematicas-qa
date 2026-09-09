'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { formatValue } from './physFormat';
import { linearMomentum } from './physLote1Math';
import { impulseFromConstantForce, impulseFromTriangularPeak } from './physLote4Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, LinearTrackTicks, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

const W = 420;
const V_SCALE = 18;
const P_SCALE = 12;

function MomentumMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.mom001');
  const uid = useId();
  const [m, setM] = useState(2);
  const [v, setV] = useState(3);
  const p = linearMomentum(m, v);
  const xMin = -8;
  const xMax = 8;
  const toPx = (x: number) => 24 + ((x - xMin) / (xMax - xMin)) * (W - 48);
  const bodyX = toPx(v * 0.8);
  const presets = [
    { id: '2m', label: tr('preset2m'), onSelect: () => { setM(m * 2); } },
    { id: '2v', label: tr('preset2v'), onSelect: () => setV(v * 2) },
    { id: 'neg', label: tr('presetNeg'), onSelect: () => setV(-Math.abs(v) || -2) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="impulse_momentum" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox={`0 0 ${W} 100`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <LinearTrackTicks min={xMin} max={xMax} toX={toPx} y={55} />
        <line x1={24} y1={55} x2={W - 24} y2={55} stroke={MUTED} strokeWidth={2} />
        <rect x={bodyX - 18} y={38} width={36} height={22} rx={4} fill={ORANGE} />
        <line x1={bodyX} y1={49} x2={bodyX + Math.sign(v || 1) * Math.max(20, Math.abs(v) * V_SCALE)} y2={49} stroke={TEAL} strokeWidth={2.5} />
        <line x1={bodyX} y1={68} x2={bodyX + Math.sign(p || 1) * Math.max(16, Math.abs(p) * P_SCALE)} y2={68} stroke={ACCENT} strokeWidth={2.5} />
      </svg>
      <PhysResult primary={`p = m v = ${formatValue(p, 'kg·m/s')}`} secondary={tr('scales', { vScale: V_SCALE, pScale: P_SCALE })} />
      <PhysStatus id={uid}>{tr('status', { m: present(m), v: present(v), p: formatValue(p, 'kg·m/s') })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('mass', { m: present(m) })} value={m} min={0.5} max={8} step={0.1} onChange={setM} />
        <SliderRow label={tr('velocity', { v: present(v) })} value={v} min={-6} max={6} step={0.1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function ImpulseTheoremMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.mom004');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [m, setM] = useState(1.5);
  const [Fmax, setFmax] = useState(20);
  const [dtPulse, setDt] = useState(0.4);
  const [shape, setShape] = useState<'rect' | 'tri'>('rect');
  const [t, setT] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const tMax = 2;
  const t0 = 0.4;
  const t1 = t0 + dtPulse;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const F = (tt: number) => {
    if (tt < t0 || tt > t1) return 0;
    const u = (tt - t0) / dtPulse;
    return shape === 'rect' ? Fmax : Fmax * (1 - Math.abs(2 * u - 1));
  };
  const J = integrate(F, 0, tMax);
  const Jnow = integrate(F, 0, t);
  const dp = Jnow;
  const v = dp / m;
  const fPlot = makePlot({ xMin: 0, xMax: tMax, yMin: -2, yMax: Fmax + 6, H: 110 });
  const pPlot = makePlot({ xMin: 0, xMax: tMax, yMin: -2, yMax: Math.max(J + 2, 8), H: 90 });

  const matchTri = () => {
    setShape('tri');
    setFmax(40);
    setDt(0.4);
  };
  const matchRect = () => {
    setShape('rect');
    setFmax(20);
    setDt(0.4);
  };

  return (
    <div className="space-y-4">
      <PhysGuide type="impulse_momentum" mode={mode} />
      <PhysPresets items={[
        { id: 'rect', label: tr('presetRect'), onSelect: matchRect },
        { id: 'tri', label: tr('presetTri'), onSelect: matchTri },
      ]} />
      <ButtonRow>
        <VizButton active={shape === 'rect'} onClick={() => setShape('rect')}>{tr('rect')}</VizButton>
        <VizButton active={shape === 'tri'} onClick={() => setShape('tri')}>{tr('tri')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <ChartFrame plot={fPlot} xLabel="t (s)" yLabel="F (N)" title={tr('forceTitle')}>
        <path d={areaToAxis(F, 0, t, fPlot)} fill={ACCENT} fillOpacity={0.25} />
        <path d={fnPath(F, 0, tMax, fPlot, 200)} fill="none" stroke={TEAL} strokeWidth={2} />
        <circle cx={fPlot.X(t)} cy={fPlot.Y(F(t))} r={4} fill={ORANGE} />
      </ChartFrame>
      <ChartFrame plot={pPlot} xLabel="t (s)" yLabel="p (kg·m/s)" title={tr('momentumTitle')}>
        <path d={fnPath((tt) => integrate(F, 0, tt), 0, tMax, pPlot, 200)} fill="none" stroke={ORANGE} strokeWidth={2} />
        <circle cx={pPlot.X(t)} cy={pPlot.Y(dp)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult
        primary={tr('impulse', { J: present(J), dp: present(dp) })}
        secondary={tr('matched', { Jrect: present(impulseFromConstantForce(20, 0.4)), Jtri: present(impulseFromTriangularPeak(40, 0.4)) })}
      />
      <PhysStatus id={uid}>{tr('status', { J: present(J), v: present(v), m: present(m) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.4} max={6} step={0.1} onChange={setM} />
        <SliderRow label="Fmax (N)" value={Fmax} min={5} max={40} step={0.5} onChange={setFmax} />
        <SliderRow label="Δt (s)" value={dtPulse} min={0.15} max={1.2} step={0.05} onChange={setDt} />
      </ControlsStack>
    </div>
  );
}

function ImpulseMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [m, setM] = useState(1.5);
  const [Fmax, setFmax] = useState(20);
  const [dtPulse, setDt] = useState(0.4);
  const [shape, setShape] = useState<'rect' | 'tri'>('rect');
  const [t, setT] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const tMax = 2;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const t0 = 0.4;
  const t1 = t0 + dtPulse;
  const F = (tt: number) => {
    if (tt < t0 || tt > t1) return 0;
    const u = (tt - t0) / dtPulse;
    return shape === 'rect' ? Fmax : Fmax * (1 - Math.abs(2 * u - 1));
  };
  const J = integrate(F, 0, tMax);
  const plot = makePlot({ xMin: 0, xMax: tMax, yMin: -2, yMax: Fmax + 6, H: 120 });
  let status = `J = Δp = ${present(J)} N·s`;
  if (mode === 'F_dpdt') status = `ΣF = dp/dt · p(t) = ${present(integrate(F, 0, t))}`;
  if (mode === 'J') status = `J = ∫ F dt = ${present(J)} (área)`;

  return (
    <div className="space-y-4">
      <PhysGuide type="impulse_momentum" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{tr('reset')}</VizButton>} />
      <ButtonRow>
        <VizButton active={shape === 'rect'} onClick={() => setShape('rect')}>rect</VizButton>
        <VizButton active={shape === 'tri'} onClick={() => setShape('tri')}>tri</VizButton>
      </ButtonRow>
      <ChartFrame plot={plot} xLabel="t" yLabel="F" title="F(t)">
        <path d={areaToAxis(F, 0, t, plot)} fill={ACCENT} fillOpacity={0.25} />
        <path d={fnPath(F, 0, tMax, plot, 200)} fill="none" stroke={TEAL} strokeWidth={2} />
      </ChartFrame>
      <PhysStatus id={uid}>{status}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.4} max={6} step={0.1} onChange={setM} />
        <SliderRow label="Fmax (N)" value={Fmax} min={5} max={40} step={0.5} onChange={setFmax} />
        <SliderRow label="Δt (s)" value={dtPulse} min={0.15} max={1.2} step={0.05} onChange={setDt} />
      </ControlsStack>
    </div>
  );
}

export function ImpulseMomentumViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'p' ? <MomentumMode mode={mode} /> :
        !mode ? <ImpulseTheoremMode mode={mode} /> :
        <ImpulseMode mode={mode} />}
    </VizPanel>
  );
}

'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { clamp } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, LinearTrackTicks, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot, padRange } from './physPlot';

const TMAX = 6;
const W = 420;
const TRACK_H = 72;

type Profile = 'const' | 'lineal' | 'escalon';

function mruaState(t: number, x0: number, v0: number, a: number) {
  return {
    x: x0 + v0 * t + 0.5 * a * t * t,
    v: v0 + a * t,
    acc: a,
  };
}

function varAState(t: number, x0: number, v0: number, a: number, profile: Profile) {
  const ts = TMAX / 2;
  if (profile === 'escalon') {
    if (t <= ts) return mruaState(t, x0, v0, a);
    const vPlat = v0 + a * ts;
    const xPlat = x0 + v0 * ts + 0.5 * a * ts * ts;
    return { x: xPlat + vPlat * (t - ts), v: vPlat, acc: 0 };
  }
  if (profile === 'lineal') {
    const k = -a / TMAX;
    return {
      acc: a + k * t,
      v: v0 + a * t + 0.5 * k * t * t,
      x: x0 + v0 * t + 0.5 * a * t * t + (1 / 6) * k * t * t * t,
    };
  }
  return mruaState(t, x0, v0, a);
}

function varVState(t: number, x0: number, v0: number, a: number, profile: Profile) {
  const ts = TMAX / 2;
  if (profile === 'escalon') {
    if (t <= ts) return { x: x0 + v0 * t, v: v0, acc: 0 };
    return { x: x0 + v0 * ts + 0.25 * v0 * (t - ts), v: 0.25 * v0, acc: 0 };
  }
  if (profile === 'lineal') return mruaState(t, x0, v0, a);
  return { x: x0 + v0 * t, v: v0, acc: 0 };
}

function Track({ xMin, xMax, x, v }: { xMin: number; xMax: number; x: number; v: number }) {
  const toPx = (val: number) => 24 + ((val - xMin) / (xMax - xMin)) * (W - 48);
  return (
    <svg viewBox={`0 0 ${W} ${TRACK_H}`} className="h-auto w-full" role="img" aria-hidden>
      <LinearTrackTicks min={xMin} max={xMax} toX={toPx} y={40} />
      <line x1={24} y1={40} x2={W - 24} y2={40} stroke={MUTED} strokeWidth={2} />
      <circle cx={toPx(x)} cy={40} r={9} fill={ORANGE} />
      <line
        x1={toPx(x)}
        y1={40}
        x2={toPx(x) + Math.sign(v || 1) * clamp(Math.abs(v) * 6, 12, 48)}
        y2={40}
        stroke={TEAL}
        strokeWidth={2}
      />
    </svg>
  );
}

function TangentGraph({
  label,
  f,
  t,
  color,
  slopeLabel,
}: {
  label: string;
  f: (tt: number) => number;
  t: number;
  color: string;
  slopeLabel?: string;
}) {
  const samples = Array.from({ length: 80 }, (_, i) => f((i / 79) * TMAX));
  const { yMin, yMax } = padRange(samples, 0.2, 2);
  const p = makePlot({ W, H: 118, xMin: 0, xMax: TMAX, yMin, yMax });
  const y = f(t);
  const dt = 0.08;
  const slope = (f(Math.min(TMAX, t + dt)) - f(Math.max(0, t - dt))) / (2 * dt);
  const x0 = Math.max(0, t - 0.9);
  const x1 = Math.min(TMAX, t + 0.9);
  const y0 = y + slope * (x0 - t);
  const y1 = y + slope * (x1 - t);
  const triX = p.X(t);
  const triY = p.Y(y);
  const triX2 = p.X(t + 0.6);
  const triY2 = p.Y(y);
  const triY3 = p.Y(y + slope * 0.6);

  return (
    <ChartFrame plot={p} xLabel="t (s)" yLabel={label} title={label}>
      <path d={fnPath(f, 0, TMAX, p)} fill="none" stroke={color} strokeWidth={1.8} />
      <line x1={p.X(x0)} y1={p.Y(y0)} x2={p.X(x1)} y2={p.Y(y1)} stroke={ORANGE} strokeWidth={2} />
      <polygon points={`${triX},${triY} ${triX2},${triY2} ${triX2},${triY3}`} fill={ORANGE} fillOpacity={0.2} stroke={ORANGE} />
      {slopeLabel ? (
        <text x={triX2 + 4} y={(triY2 + triY3) / 2} fontSize={9} fill={ORANGE}>{slopeLabel}</text>
      ) : null}
      <circle cx={p.X(t)} cy={p.Y(y)} r={4} fill={ORANGE} />
    </ChartFrame>
  );
}

export function InstVelocityMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.cin004');
  const uid = useId();
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(4);
  const [a, setA] = useState(-1.2);
  const [t, setT] = useState(1.5);
  const [advanced, setAdvanced] = useState(false);
  const st = mruaState(t, x0, v0, a);
  const xOf = (tt: number) => mruaState(tt, x0, v0, a).x;
  const xs = Array.from({ length: 40 }, (_, i) => xOf((i / 39) * TMAX));
  const xMin = Math.min(-8, ...xs) - 1;
  const xMax = Math.max(8, ...xs) + 1;
  const presets = [
    { id: 'pos', label: tr('presetPos'), v0: 4, a: 0 },
    { id: 'zero', label: tr('presetZero'), v0: 4, a: -0.67 },
    { id: 'neg', label: tr('presetNeg'), v0: 4, a: -2 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="kinematics_1d" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setV0(p.v0); setA(p.a); } }))} />
      <Track xMin={xMin} xMax={xMax} x={st.x} v={st.v} />
      <TangentGraph label="x (m)" f={xOf} t={t} color={ACCENT} slopeLabel="Δx/Δt" />
      <PhysResult primary={`v(t) = ${present(st.v)} m/s`} secondary={tr('tangent')} />
      <PhysStatus id={uid}>{tr('status', { v: present(st.v), t: present(t) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('time', { t: fmt(t) })} value={t} min={0} max={TMAX} step={0.05} onChange={setT} />
        <VizButton onClick={() => setAdvanced((q) => !q)}>{advanced ? tr('hideAdvanced') : tr('showAdvanced')}</VizButton>
        {advanced ? (
          <>
            <SliderRow label={`x0 (${fmt(x0)} m)`} value={x0} min={-8} max={8} step={0.1} onChange={setX0} />
            <SliderRow label={`v0 (${fmt(v0)} m/s)`} value={v0} min={-10} max={10} step={0.1} onChange={setV0} />
            <SliderRow label={`a (${fmt(a)} m/s²)`} value={a} min={-6} max={6} step={0.1} onChange={setA} />
          </>
        ) : null}
      </ControlsStack>
    </div>
  );
}

export function InstAccelMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.cin006');
  const uid = useId();
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(4);
  const [a, setA] = useState(-1.2);
  const [t, setT] = useState(1.5);
  const [advanced, setAdvanced] = useState(false);
  const st = mruaState(t, x0, v0, a);
  const vOf = (tt: number) => mruaState(tt, x0, v0, a).v;
  const xs = Array.from({ length: 40 }, (_, i) => mruaState((i / 39) * TMAX, x0, v0, a).x);
  const xMin = Math.min(-8, ...xs) - 1;
  const xMax = Math.max(8, ...xs) + 1;
  const presets = [
    { id: 'apos', label: tr('presetPos'), v0: 2, a: 1.2 },
    { id: 'zero', label: tr('presetZero'), v0: 4, a: 0 },
    { id: 'aneg', label: tr('presetNeg'), v0: 4, a: -1.5 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="kinematics_1d" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setV0(p.v0); setA(p.a); } }))} />
      <Track xMin={xMin} xMax={xMax} x={st.x} v={st.v} />
      <TangentGraph label="v (m/s)" f={vOf} t={t} color={TEAL} slopeLabel="Δv/Δt" />
      <PhysResult
        primary={`a(t) = ${present(st.acc)} m/s²`}
        secondary={tr('signs', { v: present(st.v), a: present(st.acc) })}
      />
      <PhysStatus id={uid}>{tr('status', { a: present(st.acc), v: present(st.v) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('time', { t: fmt(t) })} value={t} min={0} max={TMAX} step={0.05} onChange={setT} />
        <VizButton onClick={() => setAdvanced((q) => !q)}>{advanced ? tr('hideAdvanced') : tr('showAdvanced')}</VizButton>
        {advanced ? (
          <>
            <SliderRow label={`v0 (${fmt(v0)} m/s)`} value={v0} min={-10} max={10} step={0.1} onChange={setV0} />
            <SliderRow label={`a (${fmt(a)} m/s²)`} value={a} min={-6} max={6} step={0.1} onChange={setA} />
          </>
        ) : null}
      </ControlsStack>
    </div>
  );
}

export function VarAccelerationMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.cin012');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(2);
  const [a, setA] = useState(2);
  const [t, setT] = useState(2.5);
  const [t0, setT0] = useState(0.8);
  const [profile, setProfile] = useState<Profile>('const');
  const [playing, setPlaying] = useState(false);
  useRafPlay(playing, setT, { min: 0, max: TMAX, speed: 1, loop: true });
  const aOf = (tt: number) => varAState(tt, x0, v0, a, profile).acc;
  const vOf = (tt: number) => varAState(tt, x0, v0, a, profile).v;
  const dv = vOf(t) - vOf(t0);
  const aPlot = makePlot({ W, H: 100, xMin: 0, xMax: TMAX, ...padRange(Array.from({ length: 40 }, (_, i) => aOf((i / 39) * TMAX)), 0.2, 2) });
  const vPlot = makePlot({ W, H: 100, xMin: 0, xMax: TMAX, ...padRange(Array.from({ length: 40 }, (_, i) => vOf((i / 39) * TMAX)), 0.2, 2) });

  return (
    <div className="space-y-4">
      <PhysGuide type="kinematics_1d" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(t0); }}>{trBase('reset')}</VizButton>} />
      <ChartFrame plot={aPlot} xLabel="t (s)" yLabel="a (m/s²)" title="a(t)">
        <path d={areaToAxis(aOf, t0, t, aPlot)} fill={ORANGE} fillOpacity={0.28} />
        <path d={fnPath(aOf, 0, TMAX, aPlot)} fill="none" stroke={ORANGE} strokeWidth={1.8} />
        <circle cx={aPlot.X(t)} cy={aPlot.Y(aOf(t))} r={4} fill={ORANGE} />
      </ChartFrame>
      <ChartFrame plot={vPlot} xLabel="t (s)" yLabel="v (m/s)" title="v(t)">
        <path d={fnPath(vOf, 0, TMAX, vPlot)} fill="none" stroke={TEAL} strokeWidth={1.8} />
        <circle cx={vPlot.X(t)} cy={vPlot.Y(vOf(t))} r={4} fill={TEAL} />
      </ChartFrame>
      <PhysResult primary={tr('readout', { v0: present(vOf(t0)), dv: present(dv), v: present(vOf(t)) })} />
      <PhysStatus id={uid}>{tr('status', { dv: present(dv) })}</PhysStatus>
      <ButtonRow>
        {(['const', 'lineal', 'escalon'] as const).map((p) => (
          <VizButton key={p} active={profile === p} onClick={() => setProfile(p)}>{p}</VizButton>
        ))}
      </ButtonRow>
      <ControlsStack>
        <SliderRow label={tr('time', { t: fmt(t) })} value={t} min={0} max={TMAX} step={0.05} onChange={setT} />
        <SliderRow label={tr('t0', { t0: fmt(t0) })} value={t0} min={0} max={TMAX - 0.2} step={0.05} onChange={setT0} />
        <SliderRow label={`v0 (${fmt(v0)} m/s)`} value={v0} min={-8} max={8} step={0.1} onChange={setV0} />
        <SliderRow label={`a (${fmt(a)} m/s²)`} value={a} min={-4} max={4} step={0.1} onChange={setA} />
      </ControlsStack>
    </div>
  );
}

export function VarVelocityMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.cin013');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [x0, setX0] = useState(0);
  const [v0, setV0] = useState(3);
  const [a, setA] = useState(-1);
  const [t, setT] = useState(2.5);
  const [t0, setT0] = useState(0.5);
  const [profile, setProfile] = useState<Profile>('lineal');
  const [playing, setPlaying] = useState(false);
  useRafPlay(playing, setT, { min: 0, max: TMAX, speed: 1, loop: true });
  const vOf = (tt: number) => varVState(tt, x0, v0, a, profile).v;
  const xOf = (tt: number) => varVState(tt, x0, v0, a, profile).x;
  const dx = xOf(t) - xOf(t0);
  let dist = 0;
  const steps = 60;
  for (let i = 1; i <= steps; i++) {
    const ta = t0 + ((t - t0) * (i - 1)) / steps;
    const tb = t0 + ((t - t0) * i) / steps;
    dist += Math.abs(xOf(tb) - xOf(ta));
  }
  const st = varVState(t, x0, v0, a, profile);
  const xs = Array.from({ length: 40 }, (_, i) => xOf((i / 39) * TMAX));
  const xMin = Math.min(-8, ...xs) - 1;
  const xMax = Math.max(8, ...xs) + 1;
  const vPlot = makePlot({ W, H: 100, xMin: 0, xMax: TMAX, ...padRange(Array.from({ length: 40 }, (_, i) => vOf((i / 39) * TMAX)), 0.2, 2) });
  const xPlot = makePlot({ W, H: 100, xMin: 0, xMax: TMAX, ...padRange(Array.from({ length: 40 }, (_, i) => xOf((i / 39) * TMAX)), 0.2, 2) });

  return (
    <div className="space-y-4">
      <PhysGuide type="kinematics_1d" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(t0); }}>{trBase('reset')}</VizButton>} />
      <Track xMin={xMin} xMax={xMax} x={st.x} v={st.v} />
      <ChartFrame plot={vPlot} xLabel="t (s)" yLabel="v (m/s)" title="v(t)">
        <path d={areaToAxis(vOf, t0, t, vPlot)} fill={TEAL} fillOpacity={0.25} />
        <path d={fnPath(vOf, 0, TMAX, vPlot)} fill="none" stroke={TEAL} strokeWidth={1.8} />
      </ChartFrame>
      <ChartFrame plot={xPlot} xLabel="t (s)" yLabel="x (m)" title="x(t)">
        <path d={fnPath(xOf, 0, TMAX, xPlot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
        <circle cx={xPlot.X(t)} cy={xPlot.Y(xOf(t))} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('readout', { x0: present(xOf(t0)), dx: present(dx), x: present(xOf(t)) })} secondary={tr('distance', { dist: present(dist) })} />
      <PhysStatus id={uid}>{tr('status', { dx: present(dx), dist: present(dist) })}</PhysStatus>
      <ButtonRow>
        {(['const', 'lineal', 'escalon'] as const).map((p) => (
          <VizButton key={p} active={profile === p} onClick={() => setProfile(p)}>{p}</VizButton>
        ))}
      </ButtonRow>
      <ControlsStack>
        <SliderRow label={tr('time', { t: fmt(t) })} value={t} min={0} max={TMAX} step={0.05} onChange={setT} />
        <SliderRow label={tr('t0', { t0: fmt(t0) })} value={t0} min={0} max={TMAX - 0.2} step={0.05} onChange={setT0} />
        <SliderRow label={`v0 (${fmt(v0)} m/s)`} value={v0} min={-8} max={8} step={0.1} onChange={setV0} />
        {profile === 'lineal' ? <SliderRow label={`a (${fmt(a)} m/s²)`} value={a} min={-4} max={4} step={0.1} onChange={setA} /> : null}
      </ControlsStack>
    </div>
  );
}

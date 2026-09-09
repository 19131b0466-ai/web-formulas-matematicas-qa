'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 160;

function InertiaMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.new001');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [m, setM] = useState(2);
  const [f1, setF1] = useState(8);
  const [f2, setF2] = useState(-8);
  const [v0, setV0] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const Fx = f1 + f2;
  const ax = Math.abs(Fx) < 1e-6 ? 0 : Fx / m;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const x = clamp(40 + (v0 * t + 0.5 * ax * t * t) * 28, 40, W - 60);
  const state =
    Math.abs(Fx) < 1e-6 && Math.abs(v0) < 1e-6
      ? tr('static')
      : Math.abs(Fx) < 1e-6
        ? tr('dynamic')
        : tr('accelerated');
  const presets = [
    { id: 'rest', label: tr('presetRest'), f1: 8, f2: -8, v0: 0 },
    { id: 'mru', label: tr('presetMru'), f1: 10, f2: -10, v0: 3 },
    { id: 'accel', label: tr('presetAccel'), f1: 14, f2: -4, v0: 0 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="newton_second" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setF1(p.f1); setF2(p.f2); setV0(p.v0); } }))} />
      <PlayRow
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={20} y1={110} x2={W - 20} y2={110} stroke={MUTED} strokeWidth={2} />
        <rect x={x} y={78} width={44} height={32} rx={3} fill={ORANGE} />
        <line x1={x + 22} y1={70} x2={x + 22 + Math.sign(f1) * clamp(Math.abs(f1) * 3, 12, 70)} y2={70} stroke={ACCENT} strokeWidth={2} />
        <text x={x + 22} y={58} fontSize={10} fill={ACCENT}>F1</text>
        <line x1={x + 22} y1={94} x2={x + 22 + Math.sign(f2) * clamp(Math.abs(f2) * 3, 12, 70)} y2={94} stroke={TEAL} strokeWidth={2} />
        <text x={x + 22} y={108} fontSize={10} fill={TEAL}>F2</text>
        <line x1={x + 22} y1={50} x2={x + 22 + Math.sign(v0 || Fx || 1) * clamp(Math.abs(v0) * 8 + Math.abs(ax) * 12, 8, 70)} y2={50} stroke={ORANGE} strokeWidth={2} />
        <text x={x + 70} y={48} fontSize={10} fill={ORANGE}>v</text>
      </svg>
      <PhysResult primary={`ΣF = ${present(Fx)} N · a = ${present(ax)} m/s²`} secondary={state} />
      <PhysStatus id={uid}>{tr('status', { Fx: present(Fx), a: present(ax), v: present(v0 + ax * t) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
        <SliderRow label="F1 (N)" value={f1} min={-20} max={20} step={0.5} onChange={setF1} />
        <SliderRow label="F2 (N)" value={f2} min={-20} max={20} step={0.5} onChange={setF2} />
        <SliderRow label={tr('v0', { v0: present(v0) })} value={v0} min={-6} max={6} step={0.1} onChange={setV0} />
      </ControlsStack>
    </div>
  );
}

function WeightMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [m, setM] = useState(2);
  const Fg = m * G;

  return (
    <div className="space-y-4">
      <PhysGuide type="newton_second" mode={mode} />
      <svg viewBox={`0 0 ${W} 200`} className="h-auto w-full" role="img" aria-label="Peso y normal">
        <rect x={80} y={140} width={260} height={12} fill={MUTED} opacity={0.4} />
        <rect x={180} y={100} width={60} height={40} fill={ORANGE} />
        <line x1={210} y1={120} x2={210} y2={120 + clamp(Fg * 1.2, 24, 70)} stroke={ACCENT} strokeWidth={2.4} />
        <line x1={210} y1={120} x2={210} y2={120 - clamp(Fg * 1.2, 24, 70)} stroke={TEAL} strokeWidth={2.4} />
      </svg>
      <PhysStatus id={uid}>Fg = m g = {present(Fg)} N</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
      </ControlsStack>
    </div>
  );
}

function DefaultNewtonMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [m, setM] = useState(2);
  const [f1, setF1] = useState(12);
  const [f2, setF2] = useState(-3);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const Fx = f1 + f2;
  const ax = Fx / m;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const x = clamp(40 + 0.5 * ax * t * t * 28, 40, W - 60);

  return (
    <div className="space-y-4">
      <PhysGuide type="newton_second" mode={mode} />
      <PlayRow
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{tr('reset')}</VizButton>}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Segunda ley">
        <line x1={20} y1={110} x2={W - 20} y2={110} stroke={MUTED} strokeWidth={2} />
        <rect x={x} y={78} width={44} height={32} rx={3} fill={ORANGE} />
        <line x1={x + 22} y1={70} x2={x + 22 + Math.sign(f1) * clamp(Math.abs(f1) * 3, 12, 70)} y2={70} stroke={ACCENT} strokeWidth={2} />
        <line x1={x + 22} y1={94} x2={x + 22 + Math.sign(f2) * clamp(Math.abs(f2) * 3, 12, 70)} y2={94} stroke={TEAL} strokeWidth={2} />
        <line x1={x + 22} y1={50} x2={x + 22 + Math.sign(Fx || 1) * clamp(Math.abs(Fx) * 3, 0, 80)} y2={50} stroke={ORANGE} strokeWidth={2.6} />
      </svg>
      <PhysStatus id={uid}>ΣFx = {present(Fx)} N · a = {present(ax)} m/s²</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
        <SliderRow label="F1 (N)" value={f1} min={-20} max={20} step={0.5} onChange={setF1} />
        <SliderRow label="F2 (N)" value={f2} min={-20} max={20} step={0.5} onChange={setF2} />
      </ControlsStack>
    </div>
  );
}

export function NewtonSecondLawViz({ mode }: { mode?: string }) {
  if (mode === 'inertia') {
    return <VizPanel><InertiaMode mode={mode} /></VizPanel>;
  }
  if (mode === 'weight') {
    return <VizPanel><WeightMode mode={mode} /></VizPanel>;
  }
  return <VizPanel><DefaultNewtonMode mode={mode} /></VizPanel>;
}

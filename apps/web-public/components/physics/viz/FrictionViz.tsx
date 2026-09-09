'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

function KineticFrictionMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.new005');
  const uid = useId();
  const [m, setM] = useState(2);
  const [muk, setMuk] = useState(0.3);
  const [Fapl, setFapl] = useState(10);
  const [v, setV] = useState(2);
  const N = m * G;
  const fk = muk * N;
  const left = v < 0;
  return (
    <div className="space-y-4">
      <PhysGuide type="friction" mode={mode} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={20} y1={100} x2={400} y2={100} stroke={MUTED} strokeWidth={3} />
        <rect x={left ? 120 : 220} y={62} width={70} height={38} fill={ORANGE} />
        <line x1={left ? 120 : 290} y1={80} x2={(left ? 120 : 290) + (left ? -1 : 1) * clamp(Fapl * 4, 8, 90)} y2={80} stroke={ACCENT} strokeWidth={2.4} />
        <line x1={left ? 190 : 220} y1={80} x2={(left ? 190 : 220) + (left ? 1 : -1) * clamp(fk * 4, 8, 90)} y2={80} stroke={TEAL} strokeWidth={2.4} />
        <line x1={255} y1={80} x2={255 + Math.sign(v) * 30} y2={80} stroke={ORANGE} strokeWidth={2} />
      </svg>
      <PhysResult primary={`fk = μk N = ${present(fk)} N`} secondary={tr('opposes', { dir: left ? tr('left') : tr('right') })} />
      <PhysStatus id={uid}>{tr('status', { fk: present(fk), Fapl: present(Fapl) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
        <SliderRow label="μk" value={muk} min={0.1} max={1} step={0.01} onChange={setMuk} />
        <SliderRow label="Fapl (N)" value={Fapl} min={0} max={40} step={0.5} onChange={setFapl} />
        <SliderRow label="v (m/s)" value={v} min={-4} max={4} step={0.1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function StaticFrictionMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.new006');
  const uid = useId();
  const [m, setM] = useState(2);
  const [mus, setMus] = useState(0.5);
  const [muk, setMuk] = useState(0.3);
  const [Fapl, setFapl] = useState(4);
  const N = m * G;
  const fsMax = mus * N;
  const fk = muk * N;
  const sliding = Fapl > fsMax + 1e-6;
  const fs = sliding ? fk : Math.min(Fapl, fsMax);
  const a = sliding ? (Fapl - fk) / m : 0;
  const presets = [
    { id: 'below', label: tr('presetBelow'), F: fsMax * 0.7 },
    { id: 'at', label: tr('presetAt'), F: fsMax },
    { id: 'above', label: tr('presetAbove'), F: fsMax * 1.15 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="friction" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => setFapl(p.F) }))} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={20} y1={100} x2={400} y2={100} stroke={MUTED} strokeWidth={3} />
        <rect x={170} y={62} width={70} height={38} fill={ORANGE} />
        <line x1={240} y1={80} x2={240 + clamp(Fapl * 4, 8, 90)} y2={80} stroke={ACCENT} strokeWidth={2.4} />
        <line x1={170} y1={80} x2={170 - clamp(fs * 4, 8, 90)} y2={80} stroke={TEAL} strokeWidth={2.4} />
        <text x={300} y={54} fontSize={11} fill={sliding ? ORANGE : ACCENT}>{sliding ? tr('sliding') : tr('rest')}</text>
      </svg>
      <PhysResult primary={sliding ? tr('kinetic', { fk: present(fk), a: present(a) }) : tr('static', { fs: present(fs), max: present(fsMax) })} />
      <PhysStatus id={uid}>{tr('status', { fs: present(fs), max: present(fsMax), N: present(N) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
        <SliderRow label="μs" value={mus} min={0.2} max={1.2} step={0.01} onChange={(v) => { setMus(v); if (muk >= v) setMuk(v - 0.05); }} />
        <SliderRow label="μk" value={muk} min={0.1} max={Math.max(0.11, mus - 0.01)} step={0.01} onChange={setMuk} />
        <SliderRow label="Fapl (N)" value={Fapl} min={0} max={40} step={0.5} onChange={setFapl} />
      </ControlsStack>
    </div>
  );
}

export function FrictionViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'kinetic' ? <KineticFrictionMode mode={mode} /> : <StaticFrictionMode mode={mode} />}
    </VizPanel>
  );
}

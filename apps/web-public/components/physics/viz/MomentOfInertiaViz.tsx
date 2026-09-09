'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { momentOfInertiaParticles, particleInertiaContribution } from './physLote4Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

function ParticlesMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.rot005');
  const uid = useId();
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1.5);
  const [m3, setM3] = useState(0.8);
  const [r1, setR1] = useState(1.2);
  const [r2, setR2] = useState(2.1);
  const [r3, setR3] = useState(0.6);
  const I1 = particleInertiaContribution(m1, r1);
  const I2 = particleInertiaContribution(m2, r2);
  const I3 = particleInertiaContribution(m3, r3);
  const Idisc = momentOfInertiaParticles([m1, m2, m3], [r1, r2, r3]);
  const ox = 210;
  const oy = 130;
  const S = 40;
  const masses = [
    { m: m1, r: r1, c: ACCENT, I: I1 },
    { m: m2, r: r2, c: TEAL, I: I2 },
    { m: m3, r: r3, c: ORANGE, I: I3 },
  ];

  const presets = [
    { id: 'eqr', label: tr('presetEqR'), onSelect: () => { setM1(1); setM2(1); setM3(1); setR1(1); setR2(2); setR3(3); } },
    { id: 'eqm', label: tr('presetEqM'), onSelect: () => { setM1(2); setM2(2); setM3(2); setR1(1); setR2(1.5); setR3(2); } },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="moment_of_inertia" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 240" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={ox} y1={20} x2={ox} y2={220} stroke={MUTED} strokeWidth={3} />
        <text x={ox + 8} y={28} fontSize={11} fill={MUTED}>{tr('axis')}</text>
        {masses.map((p, i) => (
          <g key={i}>
            <line x1={ox} y1={oy + (i - 1) * 36} x2={ox + p.r * S} y2={oy + (i - 1) * 36} stroke={p.c} strokeDasharray="3 3" />
            <circle cx={ox + p.r * S} cy={oy + (i - 1) * 36} r={6 + p.m * 4} fill={p.c} />
            <text x={ox + p.r * S + 12} y={oy + (i - 1) * 36 + 4} fontSize={11} fill={p.c}>m{i + 1}, r={present(p.r)}</text>
          </g>
        ))}
      </svg>
      <EnergyBars items={[
        { label: 'I1', value: I1, color: ACCENT },
        { label: 'I2', value: I2, color: TEAL },
        { label: 'I3', value: I3, color: ORANGE },
        { label: 'I', value: Idisc, color: MUTED },
      ]} />
      <PhysResult primary={tr('total', { I: present(Idisc) })} secondary={tr('contrib', { I1: present(I1), I2: present(I2), I3: present(I3) })} />
      <PhysStatus id={uid}>{tr('status', { I: present(Idisc) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m1" value={m1} min={0.3} max={4} step={0.1} onChange={setM1} />
        <SliderRow label="r1" value={r1} min={0} max={3} step={0.1} onChange={setR1} />
        <SliderRow label="m2" value={m2} min={0.3} max={4} step={0.1} onChange={setM2} />
        <SliderRow label="r2" value={r2} min={0} max={3} step={0.1} onChange={setR2} />
        <SliderRow label="m3" value={m3} min={0.3} max={4} step={0.1} onChange={setM3} />
        <SliderRow label="r3" value={r3} min={0} max={3} step={0.1} onChange={setR3} />
      </ControlsStack>
    </div>
  );
}

function OtherInertiaMode({ mode }: { mode: string }) {
  const uid = useId();
  const parallel = mode === 'parallel_axis';
  const cont = mode === 'continuous';
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1.5);
  const [m3, setM3] = useState(0.8);
  const [r1, setR1] = useState(1.2);
  const [r2, setR2] = useState(2.1);
  const [r3, setR3] = useState(0.6);
  const [d, setD] = useState(1.4);
  const Idisc = momentOfInertiaParticles([m1, m2, m3], [r1, r2, r3]);
  const M = m1 + m2 + m3;
  const L = 4;
  const Irod = (1 / 12) * M * L * L;
  const Icm = 2.0;
  const Ipar = Icm + M * d * d;
  const ox = 210;
  const oy = 130;
  const S = 40;

  return (
    <div className="space-y-4">
      <PhysGuide type="moment_of_inertia" mode={mode} />
      <svg viewBox="0 0 420 240" className="h-auto w-full" role="img" aria-label="Momento de inercia">
        <line x1={ox} y1={20} x2={ox} y2={220} stroke={MUTED} strokeWidth={3} />
        {parallel ? (
          <>
            <rect x={ox - 50} y={oy - 30} width={100} height={60} fill={ACCENT} fillOpacity={0.15} stroke={ACCENT} />
            <line x1={ox + d * S} y1={20} x2={ox + d * S} y2={220} stroke={ORANGE} strokeDasharray="4 3" />
          </>
        ) : (
          [{ m: m1, r: r1, c: ACCENT }, { m: m2, r: r2, c: TEAL }, { m: m3, r: r3, c: ORANGE }].map((p, i) => (
            <circle key={i} cx={ox + p.r * S} cy={oy + (i - 1) * 36} r={6 + p.m * 4} fill={p.c} />
          ))
        )}
      </svg>
      <PhysStatus id={uid}>
        {cont ? `I_varilla ≈ (1/12) M L² = ${present(Irod)} · I = Σ m r² = ${present(Idisc)}` :
          parallel ? `I = ICM + M d² = ${present(Ipar)}` : `I = Σ mi ri² = ${present(Idisc)} kg·m²`}
      </PhysStatus>
      <ControlsStack>
        {parallel ? (
          <SliderRow label="d (m)" value={d} min={0} max={3} step={0.05} onChange={setD} />
        ) : (
          <>
            <SliderRow label="m1" value={m1} min={0.3} max={4} step={0.1} onChange={setM1} />
            <SliderRow label="r1" value={r1} min={0.2} max={3} step={0.1} onChange={setR1} />
            <SliderRow label="m2" value={m2} min={0.3} max={4} step={0.1} onChange={setM2} />
            <SliderRow label="r2" value={r2} min={0.2} max={3} step={0.1} onChange={setR2} />
          </>
        )}
      </ControlsStack>
    </div>
  );
}

export function MomentOfInertiaViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {!mode ? <ParticlesMode mode={mode} /> : <OtherInertiaMode mode={mode} />}
    </VizPanel>
  );
}

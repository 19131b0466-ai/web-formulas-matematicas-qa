'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatCapacitance, formatCharge, formatEnergy, formatVoltage } from './physFormat';
import { parallelPlateCapacitance } from './physLote1Math';
import {
  capacitorChargeFromV,
  capacitorEnergyCV,
  capacitorEnergyQC,
  capacitorEnergyQV,
  capacitorVoltageFromQ,
} from './physLote7Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function CapacitanceConceptMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.ele018');
  const uid = useId();
  const [C, setC] = useState(2e-9);
  const [V, setV] = useState(12);
  const Q = C * V;
  const plot = makePlot({ xMin: 0, xMax: V * 1.4 || 20, yMin: 0, yMax: Q * 1.4 || 1e-7, H: 130, ml: 50 });

  const presets = [
    { id: 'lowC', label: tr('presetLowC'), C: 1e-9 },
    { id: 'highC', label: tr('presetHighC'), C: 5e-9 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="parallel_plate" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => setC(p.C) }))} />
      <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={100} y1={40} x2={320} y2={40} stroke={ACCENT} strokeWidth={10} />
        <line x1={100} y1={90} x2={320} y2={90} stroke={TEAL} strokeWidth={10} />
        <text x={210} y={30} textAnchor="middle" fontSize={11} fill={ORANGE}>+Q</text>
        <text x={210} y={108} textAnchor="middle" fontSize={11} fill={TEAL}>−Q</text>
      </svg>
      <ChartFrame plot={plot} xLabel="V" yLabel="Q" title="Q(V)">
        <path d={fnPath((vv) => C * vv, 0, plot.xMax, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(V)} cy={plot.Y(Q)} r={5} fill={ORANGE} />
        <line x1={plot.X(0)} y1={plot.Y(0)} x2={plot.X(V)} y2={plot.Y(Q)} stroke={MUTED} strokeDasharray="4 3" />
      </ChartFrame>
      <PhysResult primary={`C = Q/V = ${formatCapacitance(C)}`} secondary={tr('slope', { Q: formatCharge(Q), V: formatVoltage(V) })} />
      <PhysStatus id={uid}>{tr('status')}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('C', { C: formatCapacitance(C) })} value={C} min={5e-10} max={1e-8} step={1e-10} onChange={setC} />
        <SliderRow label={tr('V', { V: formatVoltage(V) })} value={V} min={1} max={24} step={0.5} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function CapacitorEnergyMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l7.ele020');
  const uid = useId();
  const [A, setA] = useState(0.04);
  const [d, setD] = useState(0.005);
  const [kappa, setKappa] = useState(1);
  const [Q, setQ] = useState(2e-8);
  const [V, setV] = useState(12);
  const [fixed, setFixed] = useState<'Q' | 'V'>('V');
  const C = parallelPlateCapacitance(A, d, kappa);
  const Vuse = fixed === 'Q' ? capacitorVoltageFromQ(Q, C) : V;
  const Quse = fixed === 'Q' ? Q : capacitorChargeFromV(C, V);
  const Ucv = capacitorEnergyCV(C, Vuse);
  const Uqc = capacitorEnergyQC(Quse, C);
  const Uqv = capacitorEnergyQV(Quse, Vuse);
  const fill = Math.min(1, Math.abs(Ucv) / 1e-6);
  const plot = makePlot({ xMin: 0, xMax: fixed === 'V' ? 30 : Quse * 2.2 || 1e-7, yMin: 0, yMax: Ucv * 1.6 || 1e-6, H: 130, ml: 50 });
  const UofV = (vv: number) => capacitorEnergyCV(C, vv);
  const UofQ = (qq: number) => capacitorEnergyQC(qq, C);
  const activeFormula = fixed === 'V' ? tr('cv') : tr('qc');

  return (
    <div className="space-y-4">
      <PhysGuide type="parallel_plate" mode={mode} />
      <ButtonRow>
        <VizButton active={fixed === 'Q'} onClick={() => setFixed('Q')}>{tr('qFixed')}</VizButton>
        <VizButton active={fixed === 'V'} onClick={() => setFixed('V')}>{tr('vFixed')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={100} y1={40} x2={300} y2={40} stroke={ACCENT} strokeWidth={8} />
        <line x1={100} y1={90} x2={300} y2={90} stroke={TEAL} strokeWidth={8} />
        <rect x={110} y={48} width={180} height={34} fill={ORANGE} fillOpacity={0.12 + fill * 0.35} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={120 + i * 36} y1={48} x2={120 + i * 36} y2={82} stroke={ORANGE} opacity={0.35 + fill * 0.4} />
        ))}
      </svg>
      <EnergyBars items={[{ label: 'U', value: Ucv, color: ORANGE }]} />
      <ChartFrame plot={plot} xLabel={fixed === 'V' ? 'V' : 'Q'} yLabel="U" title={tr('chart')}>
        {fixed === 'V' ? (
          <path d={fnPath(UofV, 0.5, plot.xMax, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        ) : (
          <path d={fnPath(UofQ, Quse * 0.2, plot.xMax, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        )}
        <circle cx={plot.X(fixed === 'V' ? Vuse : Quse)} cy={plot.Y(Ucv)} r={5} fill={ORANGE} />
      </ChartFrame>
      <PhysResult
        primary={tr('active', { formula: activeFormula, U: formatEnergy(Ucv) })}
        secondary={tr('equiv', { cv: formatEnergy(Ucv), qc: formatEnergy(Uqc), qv: formatEnergy(Uqv) })}
      />
      <PhysStatus id={uid}>{tr('status', { C: formatCapacitance(C), Q: formatCharge(Quse), V: formatVoltage(Vuse), note: fixed === 'Q' ? tr('qNote') : tr('vNote') })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('A')} value={A} min={0.01} max={0.08} step={0.005} onChange={setA} />
        <SliderRow label={tr('d')} value={d} min={0.002} max={0.02} step={0.001} onChange={setD} />
        <SliderRow label={tr('kappa')} value={kappa} min={1} max={4} step={0.1} onChange={setKappa} />
        {fixed === 'Q' ? (
          <SliderRow label={tr('Q')} value={Q} min={5e-9} max={8e-8} step={1e-9} onChange={setQ} />
        ) : (
          <SliderRow label={tr('V')} value={V} min={1} max={30} step={0.5} onChange={setV} />
        )}
      </ControlsStack>
    </div>
  );
}

function ParallelPlateGeometryMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.ele019');
  const uid = useId();
  const [A, setA] = useState(0.04);
  const [d, setD] = useState(0.005);
  const [kappa, setKappa] = useState(1);
  const [Q, setQ] = useState(2e-8);
  const [V, setV] = useState(12);
  const [fixed, setFixed] = useState<'Q' | 'V'>('Q');
  const C = parallelPlateCapacitance(A, d, kappa);
  const Vcalc = fixed === 'Q' ? Q / C : V;
  const Qcalc = fixed === 'Q' ? Q : C * V;
  const U = 0.5 * C * Vcalc * Vcalc;
  const plateW = Math.min(220, 80 + A * 3000);
  const gap = Math.min(70, 20 + d * 8000);

  let status = `C = ε₀ κ A/d = ${formatCapacitance(C)}`;
  if (mode === 'energy') status = `U = ½ C V² = ${formatEnergy(U)}`;

  return (
    <div className="space-y-4">
      <PhysGuide type="parallel_plate" mode={mode} />
      <ButtonRow>
        <VizButton active={fixed === 'Q'} onClick={() => setFixed('Q')}>{tr('qFixed')}</VizButton>
        <VizButton active={fixed === 'V'} onClick={() => setFixed('V')}>{tr('vFixed')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={100} y1={40} x2={100 + plateW} y2={40} stroke={ACCENT} strokeWidth={8} />
        <line x1={100} y1={40 + gap} x2={100 + plateW} y2={40 + gap} stroke={TEAL} strokeWidth={8} />
        {Array.from({ length: 4 }, (_, i) => (
          <line key={i} x1={120 + i * (plateW / 4)} y1={48} x2={120 + i * (plateW / 4)} y2={40 + gap - 8} stroke={ORANGE} opacity={0.65} />
        ))}
      </svg>
      <PhysResult
        primary={`C = ${formatCapacitance(C)}`}
        secondary={tr('secondary', { Q: formatCharge(Qcalc), V: formatVoltage(Vcalc), kappa: present(kappa) })}
      />
      <PhysStatus id={uid}>{status}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('A', { A: present(A) })} value={A} min={0.01} max={0.08} step={0.005} onChange={setA} />
        <SliderRow label={tr('d', { d: present(d) })} value={d} min={0.002} max={0.02} step={0.001} onChange={setD} />
        <SliderRow label={tr('kappa', { kappa: present(kappa) })} value={kappa} min={1} max={4} step={0.1} onChange={setKappa} />
        {fixed === 'Q' ? (
          <SliderRow label={tr('Q', { Q: formatCharge(Q) })} value={Q} min={5e-9} max={8e-8} step={1e-9} onChange={setQ} />
        ) : (
          <SliderRow label={tr('V', { V: formatVoltage(V) })} value={V} min={1} max={50} step={0.5} onChange={setV} />
        )}
      </ControlsStack>
    </div>
  );
}

export function ParallelPlateViz({ mode }: { mode?: string }) {
  if (mode === 'C_QV') {
    return <VizPanel><CapacitanceConceptMode mode={mode} /></VizPanel>;
  }
  if (mode === 'energy') {
    return <VizPanel><CapacitorEnergyMode mode={mode} /></VizPanel>;
  }
  return <VizPanel><ParallelPlateGeometryMode mode={mode} /></VizPanel>;
}

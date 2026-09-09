'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { R_GAS } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatPressure, formatValue } from './physFormat';
import { idealGasPressure } from './physLote1Math';
import { AdiabaticMode, IsothermalMode, WorkMode } from './PVProcessModesL6';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

type Proc = 'isobar' | 'isochor' | 'isothermal' | 'adiabatic';
type Lock = 'none' | 'P' | 'V' | 'T';

function IdealGasMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.ter010');
  const uid = useId();
  const [n, setN] = useState(1);
  const [T, setT] = useState(300);
  const [V, setV] = useState(0.05);
  const [lock, setLock] = useState<Lock>('none');
  const P = idealGasPressure(n, T, V);
  const U = 1.5 * n * R_GAS * T;
  const pistonY = 40 + (0.11 - V) * 900;
  const agitation = Math.min(1, T / 400);

  const applyLock = (next: Lock) => setLock(next);

  const presets = [
    { id: 'P', label: tr('chipP'), lock: 'P' as Lock },
    { id: 'V', label: tr('chipV'), lock: 'V' as Lock },
    { id: 'T', label: tr('chipT'), lock: 'T' as Lock },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="pv_process" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => applyLock(p.lock) }))} />
      <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={120} y={30} width={180} height={150} fill={MUTED} fillOpacity={0.15} stroke={MUTED} />
        <rect x={125} y={pistonY} width={170} height={150 - pistonY + 30} fill={TEAL} fillOpacity={0.25} stroke={TEAL} />
        <line x1={120} y1={pistonY} x2={300} y2={pistonY} stroke={ORANGE} strokeWidth={4} />
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={140 + (i % 4) * 40 + Math.sin(i * 2) * agitation * 8}
            cy={pistonY + 20 + Math.floor(i / 4) * 30 + Math.cos(i) * agitation * 6}
            r={3 + agitation * 2}
            fill={ACCENT}
            opacity={0.7}
          />
        ))}
      </svg>
      <PhysResult
        primary={`P = nRT/V = ${formatPressure(P)}`}
        secondary={tr('state', { P: formatPressure(P), V: formatValue(V, 'm³'), T: formatValue(T, 'K'), n: present(n), U: formatValue(U, 'J') })}
      />
      <PhysStatus id={uid}>{lock !== 'none' ? tr(`lock${lock}`) : tr('status')}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('n', { n: present(n) })} value={n} min={0.5} max={3} step={0.1} onChange={setN} />
        {lock !== 'T' ? <SliderRow label={tr('T', { T: present(T) })} value={T} min={250} max={500} step={5} onChange={setT} /> : null}
        {lock !== 'V' ? <SliderRow label={tr('V', { V: present(V) })} value={V} min={0.025} max={0.1} step={0.001} onChange={setV} /> : null}
      </ControlsStack>
    </div>
  );
}

function ProcessMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [proc, setProc] = useState<Proc>(
    mode === 'isothermal' ? 'isothermal' : mode === 'adiabatic' ? 'adiabatic' : mode === 'work' ? 'isobar' : 'isothermal',
  );
  const [n, setN] = useState(1);
  const [Ti, setTi] = useState(300);
  const [Vi, setVi] = useState(0.04);
  const [Vf, setVf] = useState(0.08);
  const gamma = 5 / 3;
  const Pi = (n * R_GAS * Ti) / Vi;
  const P = (V: number) => {
    if (proc === 'isobar') return Pi;
    if (proc === 'isochor') return Pi;
    if (proc === 'isothermal') return (n * R_GAS * Ti) / V;
    return Pi * Math.pow(Vi / V, gamma);
  };
  const Tf =
    proc === 'isobar' ? (Ti * Vf) / Vi : proc === 'isochor' ? Ti : proc === 'isothermal' ? Ti : Ti * Math.pow(Vi / Vf, gamma - 1);
  const Ui = 1.5 * n * R_GAS * Ti;
  const Uf = 1.5 * n * R_GAS * Tf;
  const dU = Uf - Ui;
  const W =
    proc === 'isochor' ? 0 : proc === 'isobar' ? Pi * (Vf - Vi) : proc === 'isothermal' ? n * R_GAS * Ti * Math.log(Vf / Vi) : integrate(P, Vi, Vf);
  const Q = dU + W;
  const plot = makePlot({ xMin: 0.02, xMax: 0.12, yMin: 0, yMax: Pi * 1.4, H: 150 });

  let status = `ΔU = Q − W · ΔU=${present(dU)} · Q=${present(Q)} · W=${present(W)} J`;
  if (mode === 'combined') status = `PV/T = ${present((Pi * Vi) / Ti)} constante`;
  if (mode === 'U') status = `U = (3/2) nRT = ${present(Ui)} → ${present(Uf)}`;
  if (mode === 'work') status = `W = ∫ P dV = ${present(W)} J`;
  if (mode === 'isothermal') status = `PV=cte · ΔU=0 · W = nRT ln(Vf/Vi) = ${present(W)}`;
  if (mode === 'adiabatic') status = `PV^γ=cte · γ=5/3 · T baja al expandir`;

  return (
    <div className="space-y-4">
      <PhysGuide type="pv_process" mode={mode} />
      <ButtonRow>
        {(['isobar', 'isochor', 'isothermal', 'adiabatic'] as const).map((p) => (
          <VizButton key={p} active={proc === p} onClick={() => setProc(p)}>{p}</VizButton>
        ))}
      </ButtonRow>
      <ChartFrame plot={plot} xLabel="V" yLabel="P" title="P–V">
        {proc !== 'isochor' ? <path d={areaToAxis(P, Vi, Vf, plot)} fill={ACCENT} fillOpacity={0.2} /> : null}
        <path d={fnPath(P, 0.025, 0.11, plot)} fill="none" stroke={TEAL} strokeWidth={1.6} />
        <circle cx={plot.X(Vi)} cy={plot.Y(Pi)} r={5} fill={ORANGE} />
        <circle cx={plot.X(proc === 'isochor' ? Vi : Vf)} cy={plot.Y(P(proc === 'isochor' ? Vi : Vf))} r={5} fill={ACCENT} />
      </ChartFrame>
      <PhysStatus id={uid}>{status} · convención ΔU = Q − W</PhysStatus>
      <ControlsStack>
        <SliderRow label="n (mol)" value={n} min={0.5} max={3} step={0.1} onChange={setN} />
        <SliderRow label="Ti (K)" value={Ti} min={250} max={500} step={5} onChange={setTi} />
        <SliderRow label="Vi (m³)" value={Vi} min={0.025} max={0.07} step={0.001} onChange={setVi} />
        <SliderRow label="Vf (m³)" value={Vf} min={0.03} max={0.11} step={0.001} onChange={setVf} />
      </ControlsStack>
    </div>
  );
}

export function PVProcessViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'ideal_gas' ? (
        <IdealGasMode mode={mode} />
      ) : mode === 'work' ? (
        <WorkMode mode={mode} />
      ) : mode === 'isothermal' ? (
        <IsothermalMode mode={mode} />
      ) : mode === 'adiabatic' ? (
        <AdiabaticMode mode={mode} />
      ) : (
        <ProcessMode mode={mode} />
      )}
    </VizPanel>
  );
}

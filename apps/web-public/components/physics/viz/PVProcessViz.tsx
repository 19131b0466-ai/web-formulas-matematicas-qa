'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { R_GAS } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

type Proc = 'isobar' | 'isochor' | 'isothermal' | 'adiabatic';

export function PVProcessViz({ mode }: { mode?: string }) {
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
    proc === 'isobar'
      ? (Ti * Vf) / Vi
      : proc === 'isochor'
        ? Ti
        : proc === 'isothermal'
          ? Ti
          : Ti * Math.pow(Vi / Vf, gamma - 1);
  const Ui = 1.5 * n * R_GAS * Ti;
  const Uf = 1.5 * n * R_GAS * Tf;
  const dU = Uf - Ui;
  const W =
    proc === 'isochor'
      ? 0
      : proc === 'isobar'
        ? Pi * (Vf - Vi)
        : proc === 'isothermal'
          ? n * R_GAS * Ti * Math.log(Vf / Vi)
          : integrate(P, Vi, Vf);
  const Q = dU + W;
  const plot = makePlot({ xMin: 0.02, xMax: 0.12, yMin: 0, yMax: Pi * 1.4, H: 150 });

  let status = `ΔU = Q − W · ΔU=${present(dU)} · Q=${present(Q)} · W=${present(W)} J`;
  if (mode === 'ideal_gas') status = `PV = nRT · Pi Vi = ${present(Pi * Vi)} · nRT = ${present(n * R_GAS * Ti)}`;
  if (mode === 'combined') status = `PV/T = ${present((Pi * Vi) / Ti)} constante`;
  if (mode === 'U') status = `U = (3/2) nRT = ${present(Ui)} → ${present(Uf)}`;
  if (mode === 'work') status = `W = ∫ P dV = ${present(W)} J`;
  if (mode === 'isothermal') status = `PV=cte · ΔU=0 · W = nRT ln(Vf/Vi) = ${present(W)}`;
  if (mode === 'adiabatic') status = `PV^γ=cte · γ=5/3 · T baja al expandir`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="pv_process" mode={mode} />
        <ButtonRow>
          {(['isobar', 'isochor', 'isothermal', 'adiabatic'] as const).map((p) => (
            <VizButton key={p} active={proc === p} onClick={() => setProc(p)}>
              {p}
            </VizButton>
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
    </VizPanel>
  );
}

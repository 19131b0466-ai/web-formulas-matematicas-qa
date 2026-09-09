'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function ThermalExpansionViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [L0, setL0] = useState(1);
  const [dT, setDT] = useState(40);
  const [alpha, setAlpha] = useState(2.4e-5);
  const dL = alpha * L0 * dT;
  const dA = 2 * alpha * (L0 * L0) * dT;
  const dV = 3 * alpha * (L0 * L0 * L0) * dT;
  const vis = 1 + Math.min(0.5, Math.abs(dL) * 40);

  let status = `ΔL = α L0 ΔT = ${present(dL)} m`;
  if (mode === 'area') status = `ΔA ≈ 2α A0 ΔT = ${present(dA)} m² · ΔA/A0 ≈ 2 ΔL/L0`;
  if (mode === 'volume') status = `ΔV ≈ 3α V0 ΔT = ${present(dV)} m³ · β ≈ 3α`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="thermal_expansion" mode={mode} />
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Dilatación térmica">
          {mode === 'volume' ? (
            <rect x={80} y={40} width={80 * vis} height={60 * vis} fill={ACCENT} fillOpacity={0.3} stroke={MUTED} />
          ) : mode === 'area' ? (
            <rect x={80} y={50} width={120 * vis} height={50 * vis} fill={ACCENT} fillOpacity={0.3} stroke={MUTED} />
          ) : (
            <rect x={40} y={55} width={200 * vis} height={24} fill={ORANGE} fillOpacity={0.5} stroke={MUTED} />
          )}
          <text x={40} y={120} fontSize={11} fill={MUTED}>
            cambio visual exagerado
          </text>
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="L0 (m)" value={L0} min={0.4} max={3} step={0.05} onChange={setL0} />
          <SliderRow label="ΔT (K)" value={dT} min={-20} max={120} step={1} onChange={setDT} />
          <SliderRow label="α (1/K)" value={alpha} min={1e-5} max={8e-5} step={1e-6} onChange={setAlpha} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

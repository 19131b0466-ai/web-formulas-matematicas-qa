'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ATM, G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function HydrostaticViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [rho, setRho] = useState(1000);
  const [h, setH] = useState(4);
  const [p0on, setP0] = useState(true);
  const [F, setF] = useState(200);
  const [A, setA] = useState(0.05);
  const P0 = p0on ? ATM : 0;
  const P = P0 + rho * G * h;
  const Psimple = F / A;

  let status = `P = P0 + ρ g h = ${present(P)} Pa`;
  if (mode === 'pressure') status = `P = F⊥/A = ${present(Psimple)} Pa`;
  if (mode === 'difference') status = `ΔP = ρ g Δh = ${present(rho * G * 2)} Pa`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="hydrostatic" mode={mode} />
        <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label="Presión hidrostática">
          <rect x={80} y={30} width={160} height={160} fill={ACCENT} fillOpacity={0.15} stroke={MUTED} />
          <rect x={80} y={30 + (10 - h) * 12} width={160} height={h * 12} fill={ACCENT} fillOpacity={0.35} />
          <line x1={250} y1={30 + (10 - h) * 12} x2={300} y2={30 + (10 - h) * 12} stroke={ORANGE} />
          <circle cx={160} cy={30 + (10 - h) * 12 + h * 6} r={6} fill={ORANGE} />
          <text x={310} y={36 + (10 - h) * 12} fontSize={11} fill={ORANGE}>
            sonda h
          </text>
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        {mode === 'pressure' ? (
          <ControlsStack>
            <SliderRow label="F (N)" value={F} min={20} max={800} step={5} onChange={setF} />
            <SliderRow label="A (m²)" value={A} min={0.01} max={0.2} step={0.005} onChange={setA} />
          </ControlsStack>
        ) : (
          <ControlsStack>
            <ToggleRow label="P0 = 1 atm" checked={p0on} onChange={setP0} />
            <SliderRow label="ρ (kg/m³)" value={rho} min={600} max={1400} step={10} onChange={setRho} />
            <SliderRow label="h (m)" value={h} min={0.5} max={10} step={0.1} onChange={setH} />
          </ControlsStack>
        )}
      </div>
    </VizPanel>
  );
}

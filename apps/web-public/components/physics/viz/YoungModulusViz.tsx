'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

const YMAT: Record<string, number> = { acero: 2e11, goma: 5e7 };

export function YoungModulusViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [mat, setMat] = useState<'acero' | 'goma'>('acero');
  const [F, setF] = useState(800);
  const [A, setA] = useState(2e-4);
  const [L0, setL0] = useState(1);
  const Y = YMAT[mat]!;
  const sigma = F / A;
  const eps = sigma / Y;
  const dL = eps * L0;
  const vis = 1 + Math.min(0.8, eps * (mat === 'goma' ? 80 : 4000));

  let status = `Y = σ/ε = ${present(Y)} Pa · σ = ${present(sigma)} Pa · ε = ${present(eps)} · ΔL = ${present(dL)} m (régimen lineal)`;
  if (mode === 'stress') status = `σ = F⊥/A = ${present(sigma)} Pa`;
  if (mode === 'strain') status = `ε = ΔL/L0 = ${present(eps)} (adimensional)`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="young_modulus" mode={mode} />
        <ButtonRow>
          <VizButton active={mat === 'acero'} onClick={() => setMat('acero')}>
            acero
          </VizButton>
          <VizButton active={mat === 'goma'} onClick={() => setMat('goma')}>
            goma
          </VizButton>
        </ButtonRow>
        <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label="Barra que se alarga">
          <rect x={40} y={40} width={120 * vis} height={36} fill={ACCENT} fillOpacity={0.3} stroke={MUTED} />
          <line x1={40 + 120 * vis} y1={58} x2={40 + 120 * vis + 40} y2={58} stroke={ORANGE} strokeWidth={2} />
          <text x={200} y={100} fontSize={11} fill={MUTED}>
            alargamiento exagerado × (caption)
          </text>
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="F (N)" value={F} min={50} max={5000} step={10} onChange={setF} />
          <SliderRow label="A (m²)" value={A} min={5e-5} max={8e-4} step={1e-5} onChange={setA} />
          <SliderRow label="L0 (m)" value={L0} min={0.4} max={3} step={0.05} onChange={setL0} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

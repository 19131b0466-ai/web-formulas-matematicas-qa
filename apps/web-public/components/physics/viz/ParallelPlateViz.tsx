'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { EPS0 } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ORANGE, TEAL } from './physPlot';

export function ParallelPlateViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [A, setA] = useState(0.04);
  const [d, setD] = useState(0.005);
  const [Q, setQ] = useState(2e-8);
  const C = (EPS0 * A) / d;
  const V = Q / C;
  const U = 0.5 * C * V * V;

  let status = `C = ε0 A/d = ${present(C)} F · V = Q/C = ${present(V)} V`;
  if (mode === 'C_QV') status = `C = Q/V = ${present(C)} F · a Q fija, más C ⇒ menos V`;
  if (mode === 'energy') status = `U = ½ C V² = ${present(U)} J`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="parallel_plate" mode={mode} />
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Capacitor de placas paralelas">
          <line x1={90} y1={40} x2={90 + A * 4000} y2={40} stroke={ACCENT} strokeWidth={8} />
          <line x1={90} y1={40 + d * 6000} x2={90 + A * 4000} y2={40 + d * 6000} stroke={TEAL} strokeWidth={8} />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={110 + i * 40}
              y1={48}
              x2={110 + i * 40}
              y2={40 + d * 6000 - 8}
              stroke={ORANGE}
              opacity={0.7}
            />
          ))}
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="A (m²)" value={A} min={0.01} max={0.08} step={0.005} onChange={setA} />
          <SliderRow label="d (m)" value={d} min={0.002} max={0.02} step={0.001} onChange={setD} />
          <SliderRow label="Q (C)" value={Q} min={5e-9} max={8e-8} step={1e-9} onChange={setQ} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

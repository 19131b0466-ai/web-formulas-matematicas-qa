'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function PascalViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [A1, setA1] = useState(0.02);
  const [A2, setA2] = useState(0.2);
  const [F1, setF1] = useState(40);
  const F2 = (F1 * A2) / A1;
  const r1 = 18 + A1 * 200;
  const r2 = 18 + A2 * 80;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="pascal" mode={mode} />
        <svg viewBox="0 0 420 180" className="h-auto w-full" role="img" aria-label="Prensa hidráulica">
          <rect x={40} y={80} width={340} height={50} fill={TEAL} fillOpacity={0.2} stroke={MUTED} />
          <rect x={70} y={40} width={r1} height={40} fill={ACCENT} />
          <rect x={260} y={20} width={r2} height={60} fill={ORANGE} />
          <text x={70} y={30} fontSize={11} fill={ACCENT}>
            F1
          </text>
          <text x={260} y={16} fontSize={11} fill={ORANGE}>
            F2
          </text>
        </svg>
        <PhysStatus id={uid}>
          F1/A1 = F2/A2 · F2 = {present(F2)} N · A2/A1 = {present(A2 / A1)}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="A1 (m²)" value={A1} min={0.01} max={0.08} step={0.005} onChange={setA1} />
          <SliderRow label="A2 (m²)" value={A2} min={0.05} max={0.4} step={0.01} onChange={setA2} />
          <SliderRow label="F1 (N)" value={F1} min={10} max={200} step={1} onChange={setF1} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

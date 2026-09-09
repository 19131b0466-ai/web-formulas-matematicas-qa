'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G_NEWTON } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

export function GravitationViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [m1, setM1] = useState(6);
  const [m2, setM2] = useState(2);
  const [r, setR] = useState(4);
  const M1 = m1 * 1e24;
  const M2 = m2 * 1e24;
  const R = r * 1e6;
  const F = (G_NEWTON * M1 * M2) / (R * R);
  const g = (G_NEWTON * M1) / (R * R);
  const plot = makePlot({ xMin: 1, xMax: 10, yMin: 0, yMax: 80, H: 110 });
  const Fof = (rr: number) => {
    const Rm = rr * 1e6;
    return ((G_NEWTON * M1 * M2) / (Rm * Rm)) / 1e20;
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="gravitation" mode={mode} />
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Atracción gravitatoria">
          <circle cx={120} cy={70} r={12 + m1 * 3} fill={ACCENT} />
          <circle cx={120 + r * 28} cy={70} r={8 + m2 * 3} fill={TEAL} />
          <line x1={120 + 20} y1={70} x2={120 + r * 28 - 16} y2={70} stroke={ORANGE} strokeWidth={2} />
          <text x={200} y={40} fontSize={11} fill={ORANGE}>
            F = F′ (3.ª ley)
          </text>
        </svg>
        <ChartFrame plot={plot} xLabel="r (10⁶ m)" yLabel="F (rel)" title="F ∝ 1/r²">
          <path d={fnPath(Fof, 1.2, 9.5, plot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
          <circle cx={plot.X(r)} cy={plot.Y(Fof(r))} r={4} fill={ORANGE} />
        </ChartFrame>
        <PhysStatus id={uid}>
          {mode === 'field'
            ? `g = GM/r² = ${present(g)} N/kg · no depende de m prueba`
            : `F = G m1 m2 / r² = ${present(F)} N · G = ${G_NEWTON}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="m1 (10²⁴ kg)" value={m1} min={1} max={20} step={0.1} onChange={setM1} />
          <SliderRow label="m2 (10²⁴ kg)" value={m2} min={0.5} max={10} step={0.1} onChange={setM2} />
          <SliderRow label="r (10⁶ m)" value={r} min={1.5} max={10} step={0.1} onChange={setR} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

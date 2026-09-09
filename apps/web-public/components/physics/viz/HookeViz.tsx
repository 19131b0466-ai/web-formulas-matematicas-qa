'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

export function HookeViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [k, setK] = useState(20);
  const [x, setX] = useState(0.15);
  const F = -k * x;
  const eq = 210;
  const px = eq + x * 280;
  const plot = makePlot({ xMin: -0.45, xMax: 0.45, yMin: -22, yMax: 22, H: 120 });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="hooke" mode={mode} />
        <svg viewBox="0 0 420 80" className="h-auto w-full" role="img" aria-label="Resorte y fuerza restauradora">
          <line x1={40} y1={16} x2={40} y2={64} stroke={MUTED} strokeWidth={4} />
          <line x1={40} y1={40} x2={px - 12} y2={40} stroke={ACCENT} strokeWidth={3} />
          <rect x={px - 12} y={26} width={24} height={28} fill={ORANGE} />
          <line x1={eq} y1={10} x2={eq} y2={70} stroke={MUTED} strokeDasharray="3 3" />
          <line x1={px} y1={40} x2={px + Math.sign(F) * Math.min(50, Math.abs(F) * 2)} y2={40} stroke={TEAL} strokeWidth={2.4} />
        </svg>
        <ChartFrame plot={plot} xLabel="x" yLabel="F" title="F(x) = −k x">
          <path d={fnPath((xi) => -k * xi, -0.4, 0.4, plot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
          <circle cx={plot.X(x)} cy={plot.Y(F)} r={5} fill={ORANGE} />
        </ChartFrame>
        <PhysStatus id={uid}>Fx = −k x = {present(F)} N · k = {present(k)} N/m · x = {present(x)} m</PhysStatus>
        <ControlsStack>
          <SliderRow label="k (N/m)" value={k} min={5} max={50} step={0.5} onChange={setK} />
          <SliderRow label="x (m)" value={x} min={-0.4} max={0.4} step={0.01} onChange={setX} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

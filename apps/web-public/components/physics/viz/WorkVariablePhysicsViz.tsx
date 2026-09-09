'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, areaToAxis, fnPath, makePlot } from './physPlot';

export function WorkVariablePhysicsViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [kind, setKind] = useState<'hooke' | 'lineal' | 'constante'>('hooke');
  const [k, setK] = useState(18);
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0.3);
  const F = (x: number) => (kind === 'hooke' ? k * x : kind === 'lineal' ? k * x : k);
  const W = integrate(F, x1, x2);
  const tri = 0.5 * k * (x2 * x2 - x1 * x1);
  const plot = makePlot({ xMin: -0.1, xMax: 0.5, yMin: -2, yMax: Math.max(8, k * 0.5 + 2), H: 140 });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="work_variable" mode={mode} />
        <ButtonRow>
          <VizButton active={kind === 'hooke'} onClick={() => setKind('hooke')}>
            resorte F=kx
          </VizButton>
          <VizButton active={kind === 'lineal'} onClick={() => setKind('lineal')}>
            F=c x
          </VizButton>
          <VizButton active={kind === 'constante'} onClick={() => setKind('constante')}>
            F constante
          </VizButton>
        </ButtonRow>
        <ChartFrame plot={plot} xLabel="x" yLabel="F(x)" title="Área = trabajo">
          <path d={areaToAxis(F, x1, x2, plot)} fill={ACCENT} fillOpacity={0.25} />
          <path d={fnPath(F, -0.05, 0.48, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
          <line x1={plot.X(x1)} y1={plot.Y(plot.yMin)} x2={plot.X(x1)} y2={plot.Y(plot.yMax)} stroke={ORANGE} strokeDasharray="3 3" />
          <line x1={plot.X(x2)} y1={plot.Y(plot.yMin)} x2={plot.X(x2)} y2={plot.Y(plot.yMax)} stroke={ORANGE} strokeDasharray="3 3" />
        </ChartFrame>
        <PhysStatus id={uid}>
          W = ∫ F dx = {present(W)} J
          {kind === 'hooke' ? ` · ½ k (x2²−x1²) = ${present(tri)}` : ''}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label={kind === 'constante' ? 'F (N)' : 'k o c'} value={k} min={5} max={50} step={0.5} onChange={setK} />
          <SliderRow label="x1 (m)" value={x1} min={-0.05} max={0.4} step={0.01} onChange={setX1} />
          <SliderRow label="x2 (m)" value={x2} min={0} max={0.45} step={0.01} onChange={setX2} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

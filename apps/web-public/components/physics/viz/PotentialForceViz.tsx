'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

export function PotentialForceViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [kind, setKind] = useState<'spring' | 'grav' | 'well'>('well');
  const [x, setX] = useState(0.8);
  const [xi, setXi] = useState(-1);
  const k = 12;
  const m = 1;
  const U = (s: number) =>
    kind === 'spring' ? 0.5 * k * s * s : kind === 'grav' ? m * G * (s + 2) : (s * s - 1) * (s * s - 1) * 2;
  const dU = (s: number) =>
    kind === 'spring' ? k * s : kind === 'grav' ? m * G : 8 * s * (s * s - 1);
  const F = -dU(x);
  const Wc = U(xi) - U(x);
  const plot = makePlot({ xMin: -2, xMax: 2, yMin: -1, yMax: 12, H: 150 });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="potential_force" mode={mode} />
        <ButtonRow>
          <VizButton active={kind === 'spring'} onClick={() => setKind('spring')}>
            ½kx²
          </VizButton>
          <VizButton active={kind === 'grav'} onClick={() => setKind('grav')}>
            mgy
          </VizButton>
          <VizButton active={kind === 'well'} onClick={() => setKind('well')}>
            pozo
          </VizButton>
        </ButtonRow>
        <ChartFrame plot={plot} xLabel="x" yLabel="U(x)" title="U(x) y fuerza cuesta abajo">
          <path d={fnPath(U, -2, 2, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
          <circle cx={plot.X(x)} cy={plot.Y(U(x))} r={5} fill={ORANGE} />
          <line x1={plot.X(x)} y1={plot.Y(U(x))} x2={plot.X(x) + Math.sign(F) * 28} y2={plot.Y(U(x))} stroke={TEAL} strokeWidth={2} />
        </ChartFrame>
        <PhysStatus id={uid}>
          {mode === 'conservative_work'
            ? `Wc = Ui − Uf = ${present(Wc)} J`
            : `Fx = −dU/dx = ${present(F)} N · apunta cuesta abajo en U`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="x" value={x} min={-1.8} max={1.8} step={0.05} onChange={setX} />
          {mode === 'conservative_work' ? (
            <SliderRow label="xi" value={xi} min={-1.8} max={1.8} step={0.05} onChange={setXi} />
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

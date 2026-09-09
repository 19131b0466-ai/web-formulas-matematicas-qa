'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function KirchhoffViz({ mode }: { mode?: string }) {
  const uid = useId();
  const loop = mode === 'loop';
  const [I1, setI1] = useState(1.2);
  const [I2, setI2] = useState(0.7);
  const I3 = I1 - I2;
  const [emf, setEmf] = useState(12);
  const [R1, setR1] = useState(4);
  const [R2, setR2] = useState(8);
  const I = emf / (R1 + R2);
  const sumV = emf - I * R1 - I * R2;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="kirchhoff" mode={mode} />
        {loop ? (
          <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Malla de Kirchhoff">
            <rect x={80} y={30} width={260} height={100} fill="none" stroke={MUTED} strokeWidth={2} />
            <rect x={70} y={60} width={20} height={40} fill={ORANGE} />
            <rect x={160} y={20} width={60} height={20} fill={ACCENT} fillOpacity={0.3} />
            <rect x={250} y={20} width={60} height={20} fill={TEAL} fillOpacity={0.3} />
            <text x={90} y={150} fontSize={11}>
              +ε − IR1 − IR2 = 0
            </text>
          </svg>
        ) : (
          <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Nudo de Kirchhoff">
            <circle cx={210} cy={80} r={10} fill={ORANGE} />
            <line x1={80} y1={80} x2={200} y2={80} stroke={ACCENT} strokeWidth={3} />
            <line x1={220} y1={80} x2={340} y2={40} stroke={TEAL} strokeWidth={2} />
            <line x1={220} y1={80} x2={340} y2={120} stroke={MUTED} strokeWidth={2} />
            <text x={90} y={70} fontSize={11} fill={ACCENT}>
              I1
            </text>
            <text x={300} y={36} fontSize={11} fill={TEAL}>
              I2
            </text>
            <text x={300} y={140} fontSize={11}>
              I3
            </text>
          </svg>
        )}
        <PhysStatus id={uid}>
          {loop
            ? `ΣΔV = ${present(sumV)} ≈ 0 · I = ${present(I)} A · +ε − IR1 − IR2`
            : `ΣI = 0 · I1 = I2 + I3 · ${present(I1)} = ${present(I2)} + ${present(I3)}`}
        </PhysStatus>
        <ControlsStack>
          {loop ? (
            <>
              <SliderRow label="ε (V)" value={emf} min={4} max={24} step={0.5} onChange={setEmf} />
              <SliderRow label="R1" value={R1} min={1} max={20} step={0.5} onChange={setR1} />
              <SliderRow label="R2" value={R2} min={1} max={20} step={0.5} onChange={setR2} />
            </>
          ) : (
            <>
              <SliderRow label="I1 (A)" value={I1} min={0.2} max={3} step={0.05} onChange={setI1} />
              <SliderRow label="I2 (A)" value={I2} min={0.1} max={2.5} step={0.05} onChange={setI2} />
            </>
          )}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

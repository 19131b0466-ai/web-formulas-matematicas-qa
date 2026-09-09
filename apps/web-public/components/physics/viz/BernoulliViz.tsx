'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function BernoulliViz({ mode }: { mode?: string }) {
  const uid = useId();
  const tor = mode === 'torricelli';
  const [A1, setA1] = useState(0.04);
  const [A2, setA2] = useState(0.015);
  const [Q, setQ] = useState(0.02);
  const [dy, setDy] = useState(0.4);
  const [rho, setRho] = useState(1000);
  const [h, setH] = useState(2.5);
  const v1 = Q / A1;
  const v2 = Q / A2;
  const P1 = 1.5e5;
  const P2 = P1 + 0.5 * rho * v1 * v1 + rho * G * 0 - (0.5 * rho * v2 * v2 + rho * G * dy);
  const vTor = Math.sqrt(2 * G * h);
  const B = P1 + 0.5 * rho * v1 * v1;

  let status = `P+½ρv²+ρgy = ${present(B)} · v1=${present(v1)} v2=${present(v2)} · P2=${present(P2)} Pa`;
  if (mode === 'Q') status = `Q = A v = ${present(Q)} m³/s`;
  if (mode === 'continuity') status = `A1 v1 = A2 v2 = ${present(A1 * v1)}`;
  if (mode === 'mass_flow') status = `ṁ = ρ Q = ${present(rho * Q)} kg/s`;
  if (tor) status = `v = √(2 g h) = ${present(vTor)} m/s`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="bernoulli" mode={mode} />
        {tor ? (
          <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label="Torricelli">
            <rect x={80} y={30} width={140} height={140} fill={TEAL} fillOpacity={0.2} stroke={MUTED} />
            <rect x={80} y={30 + (8 - h) * 12} width={140} height={h * 12} fill={TEAL} fillOpacity={0.4} />
            <circle cx={260} cy={30 + (8 - h) * 12 + h * 12} r={6} fill={ORANGE} />
            <text x={280} y={40 + (8 - h) * 12 + h * 12} fontSize={11} fill={ORANGE}>
              v=√(2gh)
            </text>
          </svg>
        ) : (
          <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Tubo de Bernoulli">
            <path
              d={`M40,80 h120 v${-20 - A1 * 400} h80 v${40 + dy * 40} h120 v${20 + A2 * 400} h-120 v${-40} h-80 v${20} h-120 z`}
              fill={ACCENT}
              fillOpacity={0.15}
              stroke={MUTED}
            />
            <text x={70} y={30} fontSize={11} fill={TEAL}>
              1
            </text>
            <text x={300} y={30} fontSize={11} fill={ORANGE}>
              2
            </text>
          </svg>
        )}
        <PhysStatus id={uid}>
          {status} · estacionario, incompresible, no viscoso
        </PhysStatus>
        <ControlsStack>
          {tor ? (
            <SliderRow label="h (m)" value={h} min={0.3} max={6} step={0.1} onChange={setH} />
          ) : (
            <>
              <SliderRow label="A1 (m²)" value={A1} min={0.01} max={0.08} step={0.001} onChange={setA1} />
              <SliderRow label="A2 (m²)" value={A2} min={0.005} max={0.06} step={0.001} onChange={setA2} />
              <SliderRow label="Q (m³/s)" value={Q} min={0.005} max={0.05} step={0.001} onChange={setQ} />
              <SliderRow label="Δy (m)" value={dy} min={-1} max={2} step={0.05} onChange={setDy} />
              <SliderRow label="ρ" value={rho} min={800} max={1200} step={10} onChange={setRho} />
            </>
          )}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

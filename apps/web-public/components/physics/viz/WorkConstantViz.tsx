'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function WorkConstantViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [F, setF] = useState(8);
  const [d, setD] = useState(2.5);
  const [theta, setTheta] = useState(40);
  const [dt, setDt] = useState(2);
  const [v, setV] = useState(3);
  const th = degToRad(theta);
  const W = F * d * Math.cos(th);
  const Pavg = W / dt;
  const Pinst = F * v * Math.cos(th);
  const ox = 70;

  let status = `W = F d cos θ = ${present(W)} J · θ = ${theta}°`;
  if (mode === 'power_avg') status = `Pmed = W/Δt = ${present(Pavg)} W`;
  if (mode === 'power_inst') status = `P = F · v = ${present(Pinst)} W`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="work_constant" mode={mode} />
        <svg viewBox="0 0 420 180" className="h-auto w-full" role="img" aria-label="Trabajo F·d">
          <line x1={40} y1={140} x2={380} y2={140} stroke={MUTED} />
          <rect x={ox} y={108} width={50} height={32} fill={ORANGE} />
          <line x1={ox + 25} y1={140} x2={ox + 25 + d * 40} y2={140} stroke={TEAL} strokeWidth={3} />
          <text x={ox + 25 + d * 20} y={168} fontSize={11} fill={TEAL}>
            d
          </text>
          <line
            x1={ox + 25}
            y1={100}
            x2={ox + 25 + F * 6 * Math.cos(th)}
            y2={100 - F * 6 * Math.sin(th)}
            stroke={ACCENT}
            strokeWidth={2.4}
          />
          <text x={ox + 80} y={70} fontSize={11} fill={ACCENT}>
            F
          </text>
        </svg>
        <PhysStatus id={uid}>{status}{theta === 90 ? ' · 90°: W = 0' : ''}{theta === 180 ? ' · 180°: W < 0' : ''}</PhysStatus>
        <ControlsStack>
          <SliderRow label="F (N)" value={F} min={0} max={20} step={0.5} onChange={setF} />
          <SliderRow label="d (m)" value={d} min={0.5} max={6} step={0.1} onChange={setD} />
          <SliderRow label="θ (°)" value={theta} min={0} max={180} step={1} onChange={setTheta} />
          {mode === 'power_avg' ? <SliderRow label="Δt (s)" value={dt} min={0.5} max={8} step={0.1} onChange={setDt} /> : null}
          {mode === 'power_inst' ? <SliderRow label="v (m/s)" value={v} min={0.5} max={10} step={0.1} onChange={setV} /> : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

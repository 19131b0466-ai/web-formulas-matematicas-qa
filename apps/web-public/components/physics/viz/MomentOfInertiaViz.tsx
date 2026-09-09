'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function MomentOfInertiaViz({ mode }: { mode?: string }) {
  const uid = useId();
  const parallel = mode === 'parallel_axis';
  const cont = mode === 'continuous';
  const [m1, setM1] = useState(1);
  const [m2, setM2] = useState(1.5);
  const [m3, setM3] = useState(0.8);
  const [r1, setR1] = useState(1.2);
  const [r2, setR2] = useState(2.1);
  const [r3, setR3] = useState(0.6);
  const [d, setD] = useState(1.4);
  const Idisc = m1 * r1 * r1 + m2 * r2 * r2 + m3 * r3 * r3;
  const M = m1 + m2 + m3;
  const L = 4;
  const Irod = (1 / 12) * M * L * L;
  const Icm = 2.0;
  const Ipar = Icm + M * d * d;
  const ox = 210;
  const oy = 130;
  const S = 40;
  const masses = [
    { m: m1, r: r1, c: ACCENT },
    { m: m2, r: r2, c: TEAL },
    { m: m3, r: r3, c: ORANGE },
  ];

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="moment_of_inertia" mode={mode} />
        <svg viewBox="0 0 420 240" className="h-auto w-full" role="img" aria-label="Momento de inercia respecto de un eje">
          <line x1={ox} y1={20} x2={ox} y2={220} stroke={MUTED} strokeWidth={3} />
          <text x={ox + 8} y={28} fontSize={11} fill={MUTED}>
            eje
          </text>
          {parallel ? (
            <>
              <rect x={ox - 50} y={oy - 30} width={100} height={60} fill={ACCENT} fillOpacity={0.15} stroke={ACCENT} />
              <line x1={ox + d * S} y1={20} x2={ox + d * S} y2={220} stroke={ORANGE} strokeDasharray="4 3" />
              <text x={ox + d * S + 6} y={40} fontSize={11} fill={ORANGE}>
                eje ∥, d
              </text>
            </>
          ) : (
            masses.map((p, i) => (
              <g key={i}>
                <circle cx={ox + p.r * S} cy={oy + (i - 1) * 36} r={6 + p.m * 4} fill={p.c} />
                <text x={ox + p.r * S + 12} y={oy + (i - 1) * 36 + 4} fontSize={11} fill={p.c}>
                  m{i + 1}
                </text>
              </g>
            ))
          )}
        </svg>
        <PhysStatus id={uid}>
          {cont
            ? `I_varilla (centro) ≈ (1/12) M L² = ${present(Irod)} · suma discreta I = Σ m r² = ${present(Idisc)}`
            : parallel
              ? `I = ICM + M d² = ${present(Icm)} + ${present(M)}·${present(d)}² = ${present(Ipar)}`
              : `I = Σ mi ri² = ${present(Idisc)} kg·m²`}
        </PhysStatus>
        <ControlsStack>
          {parallel ? (
            <SliderRow label="d (m)" value={d} min={0} max={3} step={0.05} onChange={setD} />
          ) : (
            <>
              <SliderRow label="m1" value={m1} min={0.3} max={4} step={0.1} onChange={setM1} />
              <SliderRow label="r1" value={r1} min={0.2} max={3} step={0.1} onChange={setR1} />
              <SliderRow label="m2" value={m2} min={0.3} max={4} step={0.1} onChange={setM2} />
              <SliderRow label="r2" value={r2} min={0.2} max={3} step={0.1} onChange={setR2} />
              <SliderRow label="m3" value={m3} min={0.3} max={4} step={0.1} onChange={setM3} />
              <SliderRow label="r3" value={r3} min={0.2} max={3} step={0.1} onChange={setR3} />
            </>
          )}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

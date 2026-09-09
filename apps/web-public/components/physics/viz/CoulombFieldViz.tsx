'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { KE } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ORANGE, TEAL } from './physPlot';

export function CoulombFieldViz({ mode }: { mode?: string }) {
  const uid = useId();
  const uniform = mode === 'uniform';
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(-1);
  const [r, setR] = useState(0.12);
  const [qp, setQp] = useState(1);
  const [d, setD] = useState(0.04);
  const [Euni, setEuni] = useState(200);
  const Q1 = q1 * 1e-6;
  const Q2 = q2 * 1e-6;
  const F = (KE * Math.abs(Q1 * Q2)) / (r * r);
  const attract = Q1 * Q2 < 0;
  const E = (KE * Math.abs(Q1)) / (r * r);
  const Fq = qp * 1e-6 * E * Math.sign(Q1);
  const dV = Euni * d;

  if (uniform) {
    return (
      <VizPanel>
        <div className="space-y-4">
          <PhysGuide type="coulomb_field" mode={mode} />
          <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Campo uniforme entre placas">
            <line x1={80} y1={30} x2={340} y2={30} stroke={ACCENT} strokeWidth={6} />
            <line x1={80} y1={30 + d * 1200} x2={340} y2={30 + d * 1200} stroke={TEAL} strokeWidth={6} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={100 + i * 50} y1={40} x2={100 + i * 50} y2={30 + d * 1200 - 10} stroke={ORANGE} />
            ))}
          </svg>
          <PhysStatus id={uid}>|ΔV| = E d = {present(dV)} V</PhysStatus>
          <ControlsStack>
            <SliderRow label="E (N/C)" value={Euni} min={50} max={500} step={5} onChange={setEuni} />
            <SliderRow label="d (m)" value={d} min={0.01} max={0.08} step={0.005} onChange={setD} />
          </ControlsStack>
        </div>
      </VizPanel>
    );
  }

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="coulomb_field" mode={mode} />
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Ley de Coulomb">
          <circle cx={140} cy={80} r={14} fill={q1 >= 0 ? ORANGE : TEAL} />
          <circle cx={140 + r * 800} cy={80} r={12} fill={q2 >= 0 ? ORANGE : TEAL} />
          <line
            x1={154}
            y1={80}
            x2={140 + r * 800 - 14}
            y2={80}
            stroke={ACCENT}
            strokeWidth={2}
            strokeDasharray={attract ? undefined : '6 3'}
          />
        </svg>
        <PhysStatus id={uid}>
          {mode === 'field'
            ? `E = ke |Q|/r² = ${present(E)} N/C · prueba + sigue E`
            : mode === 'force_on_q'
              ? `F = q E · q prueba = ${qp} μC · F = ${present(Fq)} N (q<0 invierte)`
              : `F = ke |q1 q2|/r² = ${present(F)} N · ${attract ? 'atracción' : 'repulsión'}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="q1 (μC)" value={q1} min={-4} max={4} step={0.1} onChange={setQ1} />
          <SliderRow label="q2 (μC)" value={q2} min={-4} max={4} step={0.1} onChange={setQ2} />
          <SliderRow label="r (m)" value={r} min={0.05} max={0.3} step={0.01} onChange={setR} />
          {mode === 'force_on_q' ? <SliderRow label="q prueba (μC)" value={qp} min={-3} max={3} step={0.1} onChange={setQp} /> : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

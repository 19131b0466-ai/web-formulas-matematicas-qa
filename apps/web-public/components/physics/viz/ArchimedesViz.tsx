'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function ArchimedesViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [rhoO, setRhoO] = useState(700);
  const [rhoF, setRhoF] = useState(1000);
  const [V, setV] = useState(0.02);
  const weight = rhoO * V * G;
  const float = rhoO < rhoF;
  const Vdisp = float ? (rhoO / rhoF) * V : V;
  const FB = rhoF * G * Vdisp;
  const frac = Vdisp / V;
  const waterTop = 90;
  const blockH = 50;
  const submerged = frac * blockH;
  const y = float ? waterTop - (blockH - submerged) : waterTop + 20;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="archimedes" mode={mode} />
        <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label="Empuje de Arquímedes">
          <rect x={40} y={waterTop} width={340} height={90} fill={TEAL} fillOpacity={0.25} />
          <rect x={160} y={y} width={80} height={blockH} fill={ORANGE} fillOpacity={0.8} />
          <rect x={160} y={Math.max(y, waterTop)} width={80} height={Math.min(submerged, blockH)} fill={ACCENT} fillOpacity={0.35} />
          <line x1={200} y1={y + 25} x2={200} y2={y + 25 + 40} stroke={MUTED} strokeWidth={2} />
          <text x={250} y={y + 20} fontSize={11} fill={ORANGE}>
            mg
          </text>
          <line x1={200} y1={y + 25} x2={200} y2={y - 20} stroke={TEAL} strokeWidth={2} />
          <text x={250} y={y} fontSize={11} fill={TEAL}>
            FB
          </text>
        </svg>
        <PhysStatus id={uid}>
          FB = ρfl g Vdespl = {present(FB)} N · mg = {present(weight)} N · {float ? `flota, Vdespl/V = ${present(frac)}` : 'se hunde, Vdespl = V'}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="ρ objeto" value={rhoO} min={200} max={2000} step={10} onChange={setRhoO} />
          <SliderRow label="ρ fluido" value={rhoF} min={600} max={1400} step={10} onChange={setRhoF} />
          <SliderRow label="V (m³)" value={V} min={0.005} max={0.05} step={0.001} onChange={setV} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

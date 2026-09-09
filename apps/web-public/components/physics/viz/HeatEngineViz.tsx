'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function HeatEngineViz({ mode }: { mode?: string }) {
  const uid = useId();
  const carnot = mode === 'carnot';
  const [QH, setQH] = useState(400);
  const [QC, setQC] = useState(250);
  const [TH, setTH] = useState(373);
  const [TC, setTC] = useState(273);
  const W = QH - QC;
  const eta = W / QH;
  const etaC = 1 - TC / TH;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="heat_engine" mode={mode} />
        <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label="Máquina térmica">
          <rect x={80} y={20} width={260} height={40} fill={ORANGE} fillOpacity={0.25} stroke={MUTED} />
          <text x={210} y={44} textAnchor="middle" fontSize={12} fill={ORANGE}>
            foco caliente TH
          </text>
          <rect x={140} y={80} width={140} height={50} fill={ACCENT} fillOpacity={0.2} stroke={MUTED} />
          <text x={210} y={110} textAnchor="middle" fontSize={12}>
            motor
          </text>
          <rect x={80} y={150} width={260} height={40} fill={TEAL} fillOpacity={0.25} stroke={MUTED} />
          <text x={210} y={174} textAnchor="middle" fontSize={12} fill={TEAL}>
            foco frío TC
          </text>
          <text x={330} y={100} fontSize={11} fill={ACCENT}>
            W
          </text>
        </svg>
        <PhysStatus id={uid}>
          {carnot
            ? `ηC = 1 − TC/TH = ${present(etaC)} · usa kelvin (0 °C = 273 K, 100 °C = 373 K)`
            : `W = QH − QC = ${present(W)} · η = W/QH = ${present(eta)} (no W/QC)`}
        </PhysStatus>
        <ControlsStack>
          {carnot ? (
            <>
              <SliderRow label="TH (K)" value={TH} min={300} max={600} step={1} onChange={setTH} />
              <SliderRow label="TC (K)" value={TC} min={200} max={350} step={1} onChange={setTC} />
            </>
          ) : (
            <>
              <SliderRow label="QH (J)" value={QH} min={100} max={800} step={10} onChange={setQH} />
              <SliderRow label="QC (J)" value={QC} min={50} max={700} step={10} onChange={setQC} />
            </>
          )}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

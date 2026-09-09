'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ATM, G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { FLUID_PRESETS, hydrostaticPressure } from './physLote5Math';
import { formatPressure } from './physFormat';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, fnPath, makePlot } from './physPlot';

function HydrostaticAnchorMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.flu003');
  const uid = useId();
  const [rho, setRho] = useState(1000);
  const [h, setH] = useState(4);
  const [p0on, setP0] = useState(true);
  const [g, setG] = useState(G);
  const P0 = p0on ? ATM : 0;
  const Ph = rho * g * h;
  const P = hydrostaticPressure(P0, rho, h, g);
  const plot = makePlot({ xMin: 0, xMax: 10, yMin: P0, yMax: P0 + 140000, H: 110 });
  const Pof = (hh: number) => hydrostaticPressure(P0, rho, hh, g);
  const tankH = 10;
  const surfaceY = 30 + (tankH - h) * 12;

  const presets = [
    { id: 'water', label: tr('water'), onSelect: () => setRho(FLUID_PRESETS.water.rho) },
    { id: 'oil', label: tr('oil'), onSelect: () => setRho(FLUID_PRESETS.oil.rho) },
    { id: 'mercury', label: tr('mercury'), onSelect: () => setRho(FLUID_PRESETS.mercury.rho) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="hydrostatic" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={80} y={30} width={160} height={160} fill={ACCENT} fillOpacity={0.08} stroke={MUTED} />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={80} y={30 + i * 20} width={160} height={20} fill={ACCENT} fillOpacity={0.06 + i * 0.04} />
        ))}
        <rect x={80} y={surfaceY} width={160} height={h * 12} fill={ACCENT} fillOpacity={0.35} />
        <line x1={250} y1={surfaceY} x2={300} y2={surfaceY} stroke={ORANGE} strokeWidth={1.5} />
        <line x1={250} y1={30} x2={300} y2={30} stroke={MUTED} strokeDasharray="3 3" />
        <circle cx={160} cy={surfaceY + h * 6} r={6} fill={ORANGE} />
        <text x={310} y={surfaceY + 4} fontSize={11} fill={ORANGE}>h = {present(h)} m</text>
        <text x={310} y={36} fontSize={10} fill={MUTED}>P0</text>
      </svg>
      <ChartFrame plot={plot} xLabel="h (m)" yLabel="P (Pa)" title={tr('pChart')}>
        <path d={fnPath(Pof, 0, 10, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(h)} cy={plot.Y(P)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult
        primary={tr('total', { P: formatPressure(P) })}
        secondary={tr('parts', { P0: formatPressure(P0), Ph: formatPressure(Ph) })}
      />
      <PhysStatus id={uid}>{tr('status', { P: formatPressure(P), h: present(h), rho: present(rho) })}</PhysStatus>
      <ToggleRow label="P0 = 1 atm" checked={p0on} onChange={setP0} />
      <ControlsStack>
        <SliderRow label="ρ (kg/m³)" value={rho} min={600} max={14000} step={10} onChange={setRho} />
        <SliderRow label="h (m)" value={h} min={0} max={10} step={0.1} onChange={setH} />
        <SliderRow label="g (m/s²)" value={g} min={9.5} max={10} step={0.01} onChange={setG} />
      </ControlsStack>
    </div>
  );
}

function OtherHydrostaticMode({ mode }: { mode: string }) {
  const uid = useId();
  const [rho, setRho] = useState(1000);
  const [h, setH] = useState(4);
  const [p0on, setP0] = useState(true);
  const [F, setF] = useState(200);
  const [A, setA] = useState(0.05);
  const P0 = p0on ? ATM : 0;
  const P = hydrostaticPressure(P0, rho, h);
  const Psimple = F / A;

  let status = `P = P0 + ρ g h = ${present(P)} Pa`;
  if (mode === 'pressure') status = `P = F⊥/A = ${present(Psimple)} Pa`;
  if (mode === 'difference') status = `ΔP = ρ g Δh = ${present(rho * G * 2)} Pa`;

  return (
    <div className="space-y-4">
      <PhysGuide type="hydrostatic" mode={mode} />
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label="Presión hidrostática">
        <rect x={80} y={30} width={160} height={160} fill={ACCENT} fillOpacity={0.15} stroke={MUTED} />
        <rect x={80} y={30 + (10 - h) * 12} width={160} height={h * 12} fill={ACCENT} fillOpacity={0.35} />
        <circle cx={160} cy={30 + (10 - h) * 12 + h * 6} r={6} fill={ORANGE} />
      </svg>
      <PhysStatus id={uid}>{status}</PhysStatus>
      {mode === 'pressure' ? (
        <ControlsStack>
          <SliderRow label="F (N)" value={F} min={20} max={800} step={5} onChange={setF} />
          <SliderRow label="A (m²)" value={A} min={0.01} max={0.2} step={0.005} onChange={setA} />
        </ControlsStack>
      ) : (
        <ControlsStack>
          <ToggleRow label="P0 = 1 atm" checked={p0on} onChange={setP0} />
          <SliderRow label="ρ (kg/m³)" value={rho} min={600} max={1400} step={10} onChange={setRho} />
          <SliderRow label="h (m)" value={h} min={0.5} max={10} step={0.1} onChange={setH} />
        </ControlsStack>
      )}
    </div>
  );
}

export function HydrostaticViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {!mode ? <HydrostaticAnchorMode mode={mode} /> : <OtherHydrostaticMode mode={mode} />}
    </VizPanel>
  );
}

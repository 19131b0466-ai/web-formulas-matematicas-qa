'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G_NEWTON } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { gravitationForce } from './physLote4Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function UniversalGravityMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.gra001');
  const uid = useId();
  const [m1, setM1] = useState(6);
  const [m2, setM2] = useState(2);
  const [r, setR] = useState(4);
  const M1 = m1 * 1e24;
  const M2 = m2 * 1e24;
  const R = r * 1e6;
  const F = gravitationForce(M1, M2, R);
  const F2r = gravitationForce(M1, M2, 2 * R);
  const plot = makePlot({ xMin: 1, xMax: 10, yMin: 0, yMax: 80, H: 110 });
  const Fof = (rr: number) => gravitationForce(M1, M2, rr * 1e6) / 1e20;

  const presets = [
    { id: 'r', label: tr('presetR'), onSelect: () => setR(4) },
    { id: '2r', label: tr('preset2R'), onSelect: () => setR(8) },
    { id: '3r', label: tr('preset3R'), onSelect: () => setR(12) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="gravitation" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={120} cy={70} r={14} fill={ACCENT} />
        <circle cx={120 + r * 22} cy={70} r={10} fill={TEAL} />
        <line x1={132} y1={70} x2={120 + r * 22 - 12} y2={70} stroke={ORANGE} strokeWidth={2} />
        <line x1={120 + r * 22 + 12} y1={70} x2={132} y2={70} stroke={ORANGE} strokeWidth={2} />
        <text x={200} y={36} fontSize={10} fill={MUTED}>{tr('notToScale')}</text>
      </svg>
      <ChartFrame plot={plot} xLabel="r (10⁶ m)" yLabel="F (×10²⁰ N)" title={tr('chartTitle')}>
        <path d={fnPath(Fof, 1.2, 9.5, plot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
        <circle cx={plot.X(r)} cy={plot.Y(Fof(r))} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult
        primary={tr('force', { F: present(F) })}
        secondary={tr('ratio', { F0: present(F), Fr: present(F2r), factor: present(F / F2r) })}
      />
      <PhysStatus id={uid}>{tr('status', { F: present(F), r: present(r) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m1 (10²⁴ kg)" value={m1} min={1} max={20} step={0.1} onChange={setM1} />
        <SliderRow label="m2 (10²⁴ kg)" value={m2} min={0.5} max={10} step={0.1} onChange={setM2} />
        <SliderRow label="r (10⁶ m)" value={r} min={1.5} max={12} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

function FieldMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [m1, setM1] = useState(6);
  const [r, setR] = useState(4);
  const M1 = m1 * 1e24;
  const R = r * 1e6;
  const g = (G_NEWTON * M1) / (R * R);

  return (
    <div className="space-y-4">
      <PhysGuide type="gravitation" mode={mode} />
      <PhysStatus id={uid}>g = GM/r² = {present(g)} N/kg · no depende de m prueba</PhysStatus>
      <ControlsStack>
        <SliderRow label="M (10²⁴ kg)" value={m1} min={1} max={20} step={0.1} onChange={setM1} />
        <SliderRow label="r (10⁶ m)" value={r} min={1.5} max={10} step={0.1} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

export function GravitationViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'field' ? <FieldMode mode={mode} /> : <UniversalGravityMode mode={mode} />}
    </VizPanel>
  );
}

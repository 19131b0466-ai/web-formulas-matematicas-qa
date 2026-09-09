'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { beamSupports, torqueAboutPivot } from './physLote3Math';
import { PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function BeamEquilibriumViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.equ002');
  const uid = useId();
  const L = 4;
  const [x1, setX1] = useState(1.2);
  const [x2, setX2] = useState(3.1);
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(3);
  const [pivot, setPivot] = useState<'left' | 'right' | 'cm'>('left');
  const W1 = m1 * G;
  const W2 = m2 * G;
  const { N1, N2 } = beamSupports(W1, x1, W2, x2, L);
  const pv = pivot === 'left' ? 0 : pivot === 'right' ? L : (m1 * x1 + m2 * x2) / (m1 + m2);
  const sumT = torqueAboutPivot(0, -N1, pv) + torqueAboutPivot(x1, W1, pv) + torqueAboutPivot(x2, W2, pv) + torqueAboutPivot(L, -N2, pv);
  const S = 80;
  const ox = 40;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="beam_equilibrium" mode={mode} />
        <ButtonRow>
          <VizButton active={pivot === 'left'} onClick={() => setPivot('left')}>{tr('pivotLeft')}</VizButton>
          <VizButton active={pivot === 'right'} onClick={() => setPivot('right')}>{tr('pivotRight')}</VizButton>
          <VizButton active={pivot === 'cm'} onClick={() => setPivot('cm')}>{tr('pivotCm')}</VizButton>
        </ButtonRow>
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
          <line x1={ox} y1={80} x2={ox + L * S} y2={80} stroke={MUTED} strokeWidth={6} />
          <polygon points={`${ox},80 ${ox - 10},110 ${ox + 10},110`} fill={TEAL} />
          <polygon points={`${ox + L * S},80 ${ox + L * S - 10},110 ${ox + L * S + 10},110`} fill={TEAL} />
          <line x1={ox + x1 * S} y1={80} x2={ox + x1 * S} y2={80 + 40} stroke={ACCENT} strokeWidth={2} />
          <line x1={ox + x2 * S} y1={80} x2={ox + x2 * S} y2={80 + 48} stroke={ORANGE} strokeWidth={2} />
          <line x1={ox + pv * S} y1={40} x2={ox + pv * S} y2={80} stroke={ORANGE} strokeDasharray="3 3" />
          <text x={ox} y={28} fontSize={11} fill={TEAL}>N1={present(N1)}</text>
          <text x={ox + L * S - 40} y={28} fontSize={11} fill={TEAL}>N2={present(N2)}</text>
        </svg>
        <PhysResult primary={tr('forces', { N1: present(N1), N2: present(N2), W: present(W1 + W2) })} secondary={tr('torque', { tau: present(sumT) })} />
        <PhysStatus id={uid}>{tr('status', { tau: present(sumT), Nsum: present(N1 + N2) })}</PhysStatus>
        <ControlsStack>
          <SliderRow label="x1 (m)" value={x1} min={0.3} max={3.5} step={0.05} onChange={setX1} />
          <SliderRow label="m1" value={m1} min={0.5} max={6} step={0.1} onChange={setM1} />
          <SliderRow label="x2 (m)" value={x2} min={0.5} max={3.8} step={0.05} onChange={setX2} />
          <SliderRow label="m2" value={m2} min={0.5} max={6} step={0.1} onChange={setM2} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

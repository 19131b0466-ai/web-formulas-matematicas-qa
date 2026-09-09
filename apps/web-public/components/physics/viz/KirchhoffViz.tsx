'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { kirchhoffLoopVoltage } from './physLote4Math';
import { kirchhoffNodeCurrent } from './physLote3Math';
import { PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

function NodeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.ele016');
  const uid = useId();
  const [I1, setI1] = useState(1.2);
  const [I2, setI2] = useState(0.7);
  const I3 = kirchhoffNodeCurrent(I1, I2);

  return (
    <div className="space-y-4">
      <PhysGuide type="kirchhoff" mode={mode} />
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={210} cy={80} r={10} fill={ORANGE} />
        <line x1={80} y1={80} x2={200} y2={80} stroke={ACCENT} strokeWidth={3} />
        <line x1={220} y1={80} x2={340} y2={40} stroke={TEAL} strokeWidth={2} />
        <line x1={220} y1={80} x2={340} y2={120} stroke={MUTED} strokeWidth={2} />
        <text x={90} y={70} fontSize={11} fill={ACCENT}>I1</text>
        <text x={300} y={36} fontSize={11} fill={TEAL}>I2</text>
        <text x={300} y={140} fontSize={11}>I3</text>
      </svg>
      <PhysResult primary={tr('balance', { I1: present(I1), I2: present(I2), I3: present(I3) })} />
      <PhysStatus id={uid}>{tr('status', { I1: present(I1), I2: present(I2), I3: present(I3) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="I1 (A)" value={I1} min={0.2} max={3} step={0.05} onChange={setI1} />
        <SliderRow label="I2 (A)" value={I2} min={0.1} max={2.5} step={0.05} onChange={setI2} />
      </ControlsStack>
    </div>
  );
}

function LoopMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.ele017');
  const uid = useId();
  const [emf, setEmf] = useState(12);
  const [R1, setR1] = useState(4);
  const [R2, setR2] = useState(8);
  const [cw, setCw] = useState(true);
  const I = emf / (R1 + R2);
  const dVemf = cw ? emf : -emf;
  const dVR1 = -I * R1;
  const dVR2 = -I * R2;
  const sumV = kirchhoffLoopVoltage(emf, I, R1, R2, cw);
  const arrow = cw ? 'M300,70 L320,80 L300,90' : 'M300,90 L320,80 L300,70';

  return (
    <div className="space-y-4">
      <PhysGuide type="kirchhoff" mode={mode} />
      <ButtonRow>
        <VizButton active={cw} onClick={() => setCw(true)}>{tr('cw')}</VizButton>
        <VizButton active={!cw} onClick={() => setCw(false)}>{tr('ccw')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 180" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={80} y={40} width={260} height={100} fill="none" stroke={MUTED} strokeWidth={2} />
        <path d={arrow} fill={ORANGE} />
        <rect x={70} y={70} width={20} height={40} fill={ORANGE} />
        <text x={62} y={66} fontSize={10} fill={ORANGE}>+ε</text>
        <rect x={160} y={30} width={60} height={20} fill={ACCENT} fillOpacity={0.35} />
        <text x={168} y={26} fontSize={10} fill={ACCENT}>R1</text>
        <rect x={250} y={30} width={60} height={20} fill={TEAL} fillOpacity={0.35} />
        <text x={258} y={26} fontSize={10} fill={TEAL}>R2</text>
        <line x1={120} y1={80} x2={150} y2={80} stroke={ORANGE} strokeWidth={2} markerEnd="url(#kir-i)" />
        <defs>
          <marker id="kir-i" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={ORANGE} />
          </marker>
        </defs>
      </svg>
      <div className="grid grid-cols-3 gap-2 font-mono text-xs text-[var(--fg-muted)]">
        <div>+ε: {present(dVemf)} V</div>
        <div>−IR1: {present(dVR1)} V</div>
        <div>−IR2: {present(dVR2)} V</div>
      </div>
      <PhysResult primary={tr('sum', { sum: present(sumV), I: present(I) })} secondary={tr('table', { emf: present(emf), vr1: present(I * R1), vr2: present(I * R2) })} />
      <PhysStatus id={uid}>{tr('status', { sum: present(sumV), I: present(I) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="ε (V)" value={emf} min={4} max={24} step={0.5} onChange={setEmf} />
        <SliderRow label="R1" value={R1} min={1} max={20} step={0.5} onChange={setR1} />
        <SliderRow label="R2" value={R2} min={1} max={20} step={0.5} onChange={setR2} />
      </ControlsStack>
    </div>
  );
}

export function KirchhoffViz({ mode }: { mode?: string }) {
  if (!mode) {
    return <VizPanel><NodeMode mode={mode} /></VizPanel>;
  }
  if (mode === 'loop') {
    return <VizPanel><LoopMode mode={mode} /></VizPanel>;
  }
  return <VizPanel><NodeMode mode={mode} /></VizPanel>;
}

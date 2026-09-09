'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, degToRad } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { inclinedWeightComponents } from './physLote4Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 260;

export function InclinedPlaneViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.new008');
  const uid = useId();
  const [m, setM] = useState(2);
  const [theta, setTheta] = useState(30);
  const [axisMode, setAxisMode] = useState<'plane' | 'global'>('plane');
  const th = degToRad(theta);
  const mg = m * G;
  const { parallel: par, perpendicular: perp } = inclinedWeightComponents(mg, th);
  const N = perp;
  const ox = 80;
  const oy = 210;
  const L = 280;
  const x2 = ox + L * Math.cos(th);
  const y2 = oy - L * Math.sin(th);
  const mx = ox + 150 * Math.cos(th);
  const my = oy - 150 * Math.sin(th);
  const nx = Math.sin(th);
  const ny = Math.cos(th);
  const bx = mx - 14 * nx;
  const by = my - 14 * ny;

  const presets = [
    { id: '0', label: '0°', onSelect: () => setTheta(0) },
    { id: '30', label: '30°', onSelect: () => setTheta(30) },
    { id: '45', label: '45°', onSelect: () => setTheta(45) },
    { id: '90', label: '90°', onSelect: () => setTheta(90) },
  ];

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="inclined_plane" mode={mode} />
        <PhysPresets items={presets} />
        <ButtonRow>
          <VizButton active={axisMode === 'plane'} onClick={() => setAxisMode('plane')}>{tr('planeAxes')}</VizButton>
          <VizButton active={axisMode === 'global'} onClick={() => setAxisMode('global')}>{tr('globalAxes')}</VizButton>
        </ButtonRow>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
          {axisMode === 'global' ? (
            <>
              <line x1={40} y1={oy} x2={W - 20} y2={oy} stroke={MUTED} strokeDasharray="4 3" />
              <line x1={40} y1={30} x2={40} y2={oy} stroke={MUTED} strokeDasharray="4 3" />
              <text x={W - 36} y={oy - 6} fontSize={10} fill={MUTED}>x</text>
              <text x={44} y={38} fontSize={10} fill={MUTED}>y</text>
            </>
          ) : null}
          <polygon points={`${ox},${oy} ${x2},${y2} ${x2},${oy}`} fill={MUTED} fillOpacity={0.12} />
          <line x1={ox} y1={oy} x2={x2} y2={y2} stroke={MUTED} strokeWidth={3} />
          <rect x={bx - 16} y={by - 12} width={32} height={24} fill={ORANGE} transform={`rotate(${-theta} ${bx} ${by})`} />
          <line x1={bx} y1={by} x2={bx} y2={by + 50} stroke={ACCENT} strokeWidth={2.2} />
          <text x={bx + 8} y={by + 58} fontSize={11} fill={ACCENT}>mg</text>
          <line x1={bx} y1={by} x2={bx + Math.cos(th) * 48} y2={by - Math.sin(th) * 48} stroke={TEAL} strokeWidth={2.2} />
          <text x={bx + Math.cos(th) * 52} y={by - Math.sin(th) * 52} fontSize={11} fill={TEAL}>mg sinθ</text>
          <line x1={bx} y1={by} x2={bx + nx * 40} y2={by + ny * 40} stroke={ORANGE} strokeWidth={2.2} />
          <text x={bx + nx * 46} y={by + ny * 46} fontSize={11} fill={ORANGE}>N</text>
        </svg>
        <PhysResult
          primary={tr('components', { par: present(par), perp: present(perp) })}
          secondary={tr('note', { N: present(N) })}
        />
        <PhysStatus id={uid}>{tr('status', { par: present(par), perp: present(perp), N: present(N), theta })}</PhysStatus>
        <ControlsStack>
          <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
          <SliderRow label="θ (°)" value={theta} min={0} max={90} step={1} onChange={setTheta} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

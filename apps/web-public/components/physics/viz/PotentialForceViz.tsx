'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function ConservativeWorkMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [kind, setKind] = useState<'spring' | 'grav' | 'well'>('well');
  const [x, setX] = useState(0.8);
  const [xi, setXi] = useState(-1);
  const k = 12;
  const m = 1;
  const U = (s: number) => (kind === 'spring' ? 0.5 * k * s * s : kind === 'grav' ? m * G * (s + 2) : (s * s - 1) * (s * s - 1) * 2);
  const Wc = U(xi) - U(x);
  const plot = makePlot({ xMin: -2, xMax: 2, yMin: -1, yMax: 12, H: 150 });

  return (
    <div className="space-y-4">
      <PhysGuide type="potential_force" mode={mode} />
      <ButtonRow>
        <VizButton active={kind === 'spring'} onClick={() => setKind('spring')}>½kx²</VizButton>
        <VizButton active={kind === 'grav'} onClick={() => setKind('grav')}>mgy</VizButton>
        <VizButton active={kind === 'well'} onClick={() => setKind('well')}>pozo</VizButton>
      </ButtonRow>
      <ChartFrame plot={plot} xLabel="x" yLabel="U(x)" title="U(x)">
        <path d={fnPath(U, -2, 2, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(x)} cy={plot.Y(U(x))} r={5} fill={ORANGE} />
      </ChartFrame>
      <PhysStatus id={uid}>Wc = Ui − Uf = {present(Wc)} J</PhysStatus>
      <ControlsStack>
        <SliderRow label="x" value={x} min={-1.8} max={1.8} step={0.05} onChange={setX} />
        <SliderRow label="xi" value={xi} min={-1.8} max={1.8} step={0.05} onChange={setXi} />
      </ControlsStack>
    </div>
  );
}

function ForceFromUMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.ene008');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [kind, setKind] = useState<'spring' | 'grav' | 'well'>('well');
  const [x, setX] = useState(0.8);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const k = 12;
  const m = 1;
  const U = (s: number) => (kind === 'spring' ? 0.5 * k * s * s : kind === 'grav' ? m * G * (s + 2) : (s * s - 1) * (s * s - 1) * 2);
  const dU = (s: number) => (kind === 'spring' ? k * s : kind === 'grav' ? m * G : 8 * s * (s * s - 1));
  const F = -dU(x);
  const slope = dU(x);
  const plot = makePlot({ xMin: -2, xMax: 2, yMin: -1, yMax: 12, H: 150 });
  useRafPlay(playing, setT, { min: -1.8, max: 1.8, speed: 0.6, loop: true });
  const px = playing ? t : x;
  const stable = kind === 'well' ? 'x=0 estable' : kind === 'spring' ? 'x=0 estable' : '';

  return (
    <div className="space-y-4">
      <PhysGuide type="potential_force" mode={mode} />
      <ButtonRow>
        <VizButton active={kind === 'spring'} onClick={() => setKind('spring')}>{tr('spring')}</VizButton>
        <VizButton active={kind === 'grav'} onClick={() => setKind('grav')}>{tr('grav')}</VizButton>
        <VizButton active={kind === 'well'} onClick={() => setKind('well')}>{tr('well')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(x); }}>{trBase('reset')}</VizButton>} />
      <ChartFrame plot={plot} xLabel="x (m)" yLabel="U (J)" title={tr('title')}>
        <path d={fnPath(U, -2, 2, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(px)} cy={plot.Y(U(px))} r={6} fill={ORANGE} />
        <line x1={plot.X(px) - 20} y1={plot.Y(U(px) + slope * 0.05)} x2={plot.X(px) + 20} y2={plot.Y(U(px) - slope * 0.05)} stroke={MUTED} strokeWidth={1.5} />
        <line x1={plot.X(px)} y1={plot.Y(U(px))} x2={plot.X(px) + Math.sign(F || 1) * 32} y2={plot.Y(U(px))} stroke={TEAL} strokeWidth={2.5} />
      </ChartFrame>
      <PhysResult primary={tr('force', { F: present(F), dU: present(slope) })} secondary={stable} />
      <PhysStatus id={uid}>{tr('status', { F: present(F), x: present(px) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="x (m)" value={x} min={-1.8} max={1.8} step={0.05} onChange={(v) => { setX(v); if (!playing) setT(v); }} />
      </ControlsStack>
    </div>
  );
}

export function PotentialForceViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'conservative_work' ? <ConservativeWorkMode mode={mode} /> : <ForceFromUMode mode={mode} />}
    </VizPanel>
  );
}

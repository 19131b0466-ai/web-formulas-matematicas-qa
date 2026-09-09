'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { waveSum } from './physLote5Math';
import { interferenceKind, pathDifference } from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function SuperpositionMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l5.ond008');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [A1, setA1] = useState(1);
  const [A2, setA2] = useState(0.8);
  const [phase, setPhase] = useState(0);
  const [t, setT] = useState(1.2);
  const [playing, setPlaying] = useState(false);
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const plot = makePlot({ xMin: 0, xMax: 4, yMin: -2.5, yMax: 2.5, H: 220 });
  const y1 = (tt: number) => A1 * Math.sin(2 * Math.PI * (tt / 2));
  const y2 = (tt: number) => A2 * Math.sin(2 * Math.PI * (tt / 2) + phase);
  const ysum = (tt: number) => waveSum(y1(tt), y2(tt));
  const y1t = y1(t);
  const y2t = y2(t);
  const yst = ysum(t);

  const presets = [
    { id: 'in', label: tr('inPhase'), onSelect: () => setPhase(0) },
    { id: 'out', label: tr('opposition'), onSelect: () => setPhase(Math.PI) },
    { id: 'part', label: tr('partial'), onSelect: () => setPhase(Math.PI / 3) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="interference" mode={mode} />
      <PhysPresets items={presets} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <ChartFrame plot={plot} xLabel="t" yLabel="y" title={tr('title')}>
        <path d={fnPath(y1, 0, 4, plot)} fill="none" stroke={TEAL} strokeWidth={1.4} />
        <path d={fnPath(y2, 0, 4, plot)} fill="none" stroke={ACCENT} strokeWidth={1.4} />
        <path d={fnPath(ysum, 0, 4, plot)} fill="none" stroke={ORANGE} strokeWidth={2.2} />
        <line x1={plot.X(t)} y1={plot.Y(plot.yMax)} x2={plot.X(t)} y2={plot.Y(plot.yMin)} stroke={ORANGE} strokeDasharray="4 3" opacity={0.6} />
        <circle cx={plot.X(t)} cy={plot.Y(yst)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('sum', { y1: present(y1t), y2: present(y2t), y: present(yst) })} secondary={tr('check', { calc: present(waveSum(y1t, y2t)) })} />
      <PhysStatus id={uid}>{tr('status', { phase: present(phase), y: present(yst) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="A1" value={A1} min={0.2} max={1.5} step={0.05} onChange={setA1} />
        <SliderRow label="A2" value={A2} min={0.2} max={1.5} step={0.05} onChange={setA2} />
        <SliderRow label={tr('phase')} value={phase} min={0} max={Math.PI} step={0.05} onChange={setPhase} />
      </ControlsStack>
    </div>
  );
}

const S1 = { x: 1, y: 1.5 };
const S2 = { x: 2.6, y: 1.5 };

function findPxForDeltaR(targetDr: number, py: number, lambda: number): number {
  const mid = (S1.x + S2.x) / 2;
  if (targetDr <= 0.01) return mid;
  let lo = mid;
  let hi = 5.5;
  for (let i = 0; i < 40; i++) {
    const midx = (lo + hi) / 2;
    const dr = pathDifference(Math.hypot(midx - S1.x, py - S1.y), Math.hypot(midx - S2.x, py - S2.y));
    if (dr < targetDr) lo = midx;
    else hi = midx;
  }
  return (lo + hi) / 2;
}

function InterferencePathMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ond009');
  const uid = useId();
  const [lambda, setLambda] = useState(1.2);
  const [px, setPx] = useState(1.8);
  const [py, setPy] = useState(2.5);
  const r1 = Math.hypot(px - S1.x, py - S1.y);
  const r2 = Math.hypot(px - S2.x, py - S2.y);
  const dr = pathDifference(r1, r2);
  const drLambda = dr / lambda;
  const kind = interferenceKind(dr, lambda);
  const kindLabel = kind === 'constructive' ? tr('constructive') : kind === 'destructive' ? tr('destructive') : tr('partial');
  const ox = 40;
  const oy = 130;
  const S = 70;
  const pxs = ox + px * S;
  const pys = oy - (py - 1.5) * S;

  const presets = [
    { id: '0', label: tr('dr0'), onSelect: () => { setPy(2.5); setPx(findPxForDeltaR(0, 2.5, lambda)); } },
    { id: 'h', label: tr('drHalf'), onSelect: () => { setPy(2.5); setPx(findPxForDeltaR(lambda / 2, 2.5, lambda)); } },
    { id: '1', label: tr('dr1'), onSelect: () => { setPy(2.5); setPx(findPxForDeltaR(lambda, 2.5, lambda)); } },
    { id: '3h', label: tr('drThreeHalf'), onSelect: () => { setPy(2.5); setPx(findPxForDeltaR(1.5 * lambda, 2.5, lambda)); } },
  ];

  const intensity = kind === 'constructive' ? 1 : kind === 'destructive' ? 0.15 : 0.55;

  return (
    <div className="space-y-4">
      <PhysGuide type="interference" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 220" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={ox} y={oy - 80} width={340} height={8} fill={ACCENT} fillOpacity={0.08 * intensity} />
        <circle cx={ox + S1.x * S} cy={oy} r={6} fill={TEAL} />
        <circle cx={ox + S2.x * S} cy={oy} r={6} fill={ACCENT} />
        <text x={ox + S1.x * S - 18} y={oy + 22} fontSize={10} fill={TEAL}>S1</text>
        <text x={ox + S2.x * S - 18} y={oy + 22} fontSize={10} fill={ACCENT}>S2</text>
        {[1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={ox + S1.x * S} cy={oy} r={i * lambda * S * 0.45} fill="none" stroke={TEAL} opacity={0.3} />
            <circle cx={ox + S2.x * S} cy={oy} r={i * lambda * S * 0.45} fill="none" stroke={ACCENT} opacity={0.3} />
          </g>
        ))}
        <line x1={ox + S1.x * S} y1={oy} x2={pxs} y2={pys} stroke={TEAL} strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={ox + S2.x * S} y1={oy} x2={pxs} y2={pys} stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={pxs} cy={pys} r={7} fill={ORANGE} />
        <text x={pxs + 10} y={pys - 6} fontSize={10} fill={ORANGE}>P</text>
      </svg>
      <PhysResult
        primary={tr('paths', { r1: present(r1), r2: present(r2), dr: present(dr) })}
        secondary={tr('lambda', { ratio: present(drLambda), kind: kindLabel })}
      />
      <PhysStatus id={uid}>{tr('status', { dr: present(dr), ratio: present(drLambda), kind: kindLabel })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="λ (m)" value={lambda} min={0.6} max={2} step={0.05} onChange={setLambda} />
        <SliderRow label="Px" value={px} min={1.2} max={5} step={0.05} onChange={setPx} />
        <SliderRow label="Py" value={py} min={0.5} max={3.5} step={0.05} onChange={setPy} />
      </ControlsStack>
    </div>
  );
}

export function InterferenceViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'superposition' ? <SuperpositionMode mode={mode} /> : <InterferencePathMode mode={mode} />}
    </VizPanel>
  );
}

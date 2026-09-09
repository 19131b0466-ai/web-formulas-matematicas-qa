'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 160;

export function NewtonSecondLawViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const inertia = mode === 'inertia';
  const weight = mode === 'weight';
  const [m, setM] = useState(2);
  const [f1, setF1] = useState(inertia ? 8 : 12);
  const [f2, setF2] = useState(inertia ? -8 : -3);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [v0] = useState(inertia ? 3 : 0);
  const Fx = inertia ? 0 : f1 + f2;
  const ax = weight ? 0 : Fx / m;
  const Fg = m * G;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const x = clamp(40 + (v0 * t + 0.5 * ax * t * t) * 28, 40, W - 60);

  if (weight) {
    return (
      <VizPanel>
        <div className="space-y-4">
          <PhysGuide type="newton_second" mode={mode} />
          <svg viewBox={`0 0 ${W} 200`} className="h-auto w-full" role="img" aria-label="Peso y normal">
            <rect x={80} y={140} width={260} height={12} fill={MUTED} opacity={0.4} />
            <rect x={180} y={100} width={60} height={40} fill={ORANGE} />
            <line x1={210} y1={120} x2={210} y2={120 + clamp(Fg * 1.2, 24, 70)} stroke={ACCENT} strokeWidth={2.4} />
            <text x={218} y={160} fontSize={12} fill={ACCENT}>
              Fg = mg
            </text>
            <line x1={210} y1={120} x2={210} y2={120 - clamp(Fg * 1.2, 24, 70)} stroke={TEAL} strokeWidth={2.4} />
            <text x={218} y={70} fontSize={12} fill={TEAL}>
              N
            </text>
          </svg>
          <PhysStatus id={uid}>
            Fg = m g = {present(Fg)} N · g = {G} m/s² (misma para cualquier m)
          </PhysStatus>
          <ControlsStack>
            <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
          </ControlsStack>
        </div>
      </VizPanel>
    );
  }

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="newton_second" mode={mode} />
        <PlayRow
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          extra={
            <VizButton
              onClick={() => {
                setPlaying(false);
                setT(0);
              }}
            >
              {tr('reset')}
            </VizButton>
          }
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Segunda ley: bloque y fuerzas horizontales">
          <line x1={20} y1={110} x2={W - 20} y2={110} stroke={MUTED} strokeWidth={2} />
          <rect x={x} y={78} width={44} height={32} rx={3} fill={ORANGE} />
          {!inertia ? (
            <>
              <line x1={x + 22} y1={70} x2={x + 22 + Math.sign(f1) * clamp(Math.abs(f1) * 3, 12, 70)} y2={70} stroke={ACCENT} strokeWidth={2} />
              <text x={x + 22} y={22} fontSize={11} fill={ACCENT}>
                F1
              </text>
              <line x1={x + 22} y1={94} x2={x + 22 + Math.sign(f2) * clamp(Math.abs(f2) * 3, 12, 70)} y2={94} stroke={TEAL} strokeWidth={2} />
            </>
          ) : null}
          <line x1={x + 22} y1={50} x2={x + 22 + Math.sign(Fx || 1) * clamp(Math.abs(Fx) * 3, 0, 80)} y2={50} stroke={ORANGE} strokeWidth={2.6} />
          <text x={x + 80} y={48} fontSize={11} fill={ORANGE}>
            ΣF
          </text>
        </svg>
        <PhysStatus id={uid}>
          {inertia
            ? `ΣF = 0 · a = 0 · v = ${present(v0)} m/s (reposo o MRU)`
            : `ΣFx = ${present(Fx)} N · a = ΣF/m = ${present(ax)} m/s² · no dibujamos «ma» en el DCL`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
          {!inertia ? (
            <>
              <SliderRow label="F1 (N)" value={f1} min={-20} max={20} step={0.5} onChange={setF1} />
              <SliderRow label="F2 (N)" value={f2} min={-20} max={20} step={0.5} onChange={setF2} />
            </>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

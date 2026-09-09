'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G_NEWTON } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function OrbitViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [M, setM] = useState(6);
  const [r, setR] = useState(7);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mass = M * 1e24;
  const R = r * 1e6;
  const mu = G_NEWTON * mass;
  const vorb = Math.sqrt(mu / R);
  const vesc = Math.sqrt((2 * mu) / R);
  const Tper = 2 * Math.PI * Math.sqrt((R * R * R) / mu);
  const m = 500;
  const U = (-mu * m) / R;
  const K = 0.5 * m * vorb * vorb;
  const E = -mu * m / (2 * R);
  useRafPlay(playing, setT, { min: 0, max: Tper, speed: Tper / 8, loop: true });
  const th = (t / Tper) * 2 * Math.PI;
  const ox = 210;
  const oy = 140;
  const S = 12;

  let status = `v = √(GM/r) = ${present(vorb)} m/s · T = ${present(Tper)} s`;
  if (mode === 'period') status = `T² ∝ r³ · T = ${present(Tper)} s`;
  if (mode === 'escape') status = `vesc = √(2GM/R) = ${present(vesc)} = √2 vorb = ${present(Math.SQRT2 * vorb)}`;
  if (mode === 'U') status = `U = −GMm/r = ${present(U)} J`;
  if (mode === 'E') status = `E = K+U = −GMm/(2r) = ${present(E)} · K = ${present(K)}`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="orbit" mode={mode} />
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
        <svg viewBox="0 0 420 280" className="h-auto w-full" role="img" aria-label="Órbita circular">
          <circle cx={ox} cy={oy} r={r * S} fill="none" stroke={MUTED} />
          <circle cx={ox} cy={oy} r={16} fill={ORANGE} />
          <circle cx={ox + r * S * Math.cos(th)} cy={oy + r * S * Math.sin(th)} r={7} fill={TEAL} />
          <line
            x1={ox + r * S * Math.cos(th)}
            y1={oy + r * S * Math.sin(th)}
            x2={ox + r * S * Math.cos(th) - Math.sin(th) * 36}
            y2={oy + r * S * Math.sin(th) + Math.cos(th) * 36}
            stroke={ACCENT}
            strokeWidth={2}
          />
          <text x={24} y={24} fontSize={11} fill={ACCENT}>
            vorb
          </text>
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="M (10²⁴ kg)" value={M} min={1} max={20} step={0.1} onChange={setM} />
          <SliderRow label="r (10⁶ m)" value={r} min={4} max={12} step={0.1} onChange={setR} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

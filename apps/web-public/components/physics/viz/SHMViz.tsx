'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad, shmAfromX, shmV, shmX } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

const W = 420;

export function SHMViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [A, setA] = useState(0.22);
  const [m, setM] = useState(0.8);
  const [k, setK] = useState(18);
  const [phiDeg, setPhiDeg] = useState(0);
  const [t, setT] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const [circle, setCircle] = useState(false);
  const omega = Math.sqrt(k / m);
  const Tper = (2 * Math.PI) / omega;
  const phi = degToRad(phiDeg);
  const tMax = Tper * 2;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const x = shmX(A, omega, t, phi);
  const v = shmV(A, omega, t, phi);
  const acc = shmAfromX(x, omega);
  const Us = 0.5 * k * x * x;
  const K = 0.5 * m * v * v;
  const E = 0.5 * k * A * A;
  const vmax = A * omega;
  const amax = A * omega * omega;
  const f = 1 / Tper;
  const ox = 60;
  const eq = 200;
  const px = eq + (x / Math.max(A, 0.05)) * 90;
  const plot = makePlot({ xMin: 0, xMax: tMax, yMin: -A * 1.3, yMax: A * 1.3, H: 100, W });

  let status = `x = A cos(ωt+φ) = ${present(x)} m · ω = ${present(omega)} rad/s · T = ${present(Tper)} s`;
  if (mode === 'a') status = `a = −ω² x = ${present(acc)} m/s² · en x=0, a=0; en ±A, |a| máxima`;
  if (mode === 'v') status = `v = −A ω sen(ωt+φ) = ${present(v)} m/s · vmax = Aω = ${present(vmax)}`;
  if (mode === 'omega_spring') status = `ω = √(k/m) = ${present(omega)} rad/s`;
  if (mode === 'period_spring') status = `T = 2π √(m/k) = ${present(Tper)} s`;
  if (mode === 'energy') status = `K + Us = ${present(K + Us)} = ½ k A² = ${present(E)} J`;
  if (mode === 'vmax') status = `vmax = A ω = ${present(vmax)} m/s (en x = 0)`;
  if (mode === 'amax') status = `amax = A ω² = ${present(amax)} m/s² (en x = ±A)`;
  if (mode === 'Tf') status = `f = 1/T = ${present(f)} Hz · T = ${present(Tper)} s`;
  if (mode === 'omega') status = `ω = 2π f = 2π/T = ${present(omega)} rad/s`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="shm" mode={mode} />
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
        <svg viewBox={`0 0 ${W} 88`} className="h-auto w-full" role="img" aria-label="Masa-resorte en MAS">
          <line x1={ox} y1={20} x2={ox} y2={68} stroke={MUTED} strokeWidth={4} />
          <line x1={ox} y1={44} x2={px - 14} y2={44} stroke={ACCENT} strokeWidth={3} />
          <rect x={px - 14} y={30} width={28} height={28} rx={4} fill={ORANGE} />
          <line x1={eq} y1={18} x2={eq} y2={70} stroke={MUTED} strokeDasharray="3 3" />
        </svg>
        {circle ? (
          <svg viewBox="0 0 200 120" className="mx-auto h-auto w-40" role="img" aria-label="Referencia circular">
            <circle cx={100} cy={60} r={40} fill="none" stroke={MUTED} />
            <circle cx={100 + 40 * Math.cos(omega * t + phi)} cy={60 - 40 * Math.sin(omega * t + phi)} r={5} fill={TEAL} />
            <line
              x1={100 + 40 * Math.cos(omega * t + phi)}
              y1={60}
              x2={100 + 40 * Math.cos(omega * t + phi)}
              y2={60 - 40 * Math.sin(omega * t + phi)}
              stroke={ORANGE}
              strokeDasharray="3 3"
            />
          </svg>
        ) : null}
        <ChartFrame plot={plot} xLabel="t" yLabel="x" title="x(t)">
          <path d={fnPath((ti) => shmX(A, omega, ti, phi), 0, tMax, plot)} fill="none" stroke={ACCENT} strokeWidth={1.8} />
          <circle cx={plot.X(t)} cy={plot.Y(x)} r={4} fill={ORANGE} />
        </ChartFrame>
        {(mode === 'energy' || mode === undefined || mode === '') && (
          <EnergyBars
            items={[
              { label: 'K', value: K, color: TEAL },
              { label: 'Us', value: Us, color: ACCENT },
              { label: 'E', value: E, color: ORANGE },
            ]}
          />
        )}
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ToggleRow label="Referencia circular" checked={circle} onChange={setCircle} />
        <ControlsStack>
          <SliderRow label={`t (${fmt(t)} s)`} value={t} min={0} max={tMax} step={0.02} onChange={setT} />
          <SliderRow label="A (m)" value={A} min={0.05} max={0.4} step={0.01} onChange={setA} />
          <SliderRow label="m (kg)" value={m} min={0.2} max={4} step={0.1} onChange={setM} />
          <SliderRow label="k (N/m)" value={k} min={5} max={50} step={0.5} onChange={setK} />
          <SliderRow label="φ (°)" value={phiDeg} min={0} max={359} step={1} onChange={setPhiDeg} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

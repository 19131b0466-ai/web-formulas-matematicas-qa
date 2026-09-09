'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import {
  G,
  clamp,
  projectileH,
  projectileRange,
  projectileState,
  projectileTflight,
  projectileTmax,
} from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, fnPath, makePlot, padRange } from './physPlot';

const W = 420;
const H = 240;

function RangeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.mov014');
  const uid = useId();
  const [v0, setV0] = useState(22);
  const [theta, setTheta] = useState(45);
  const [g, setG] = useState(G);
  const angles = [30, 45, 60] as const;
  const colors: Record<number, string> = { 30: TEAL, 45: ORANGE, 60: ACCENT };
  const ranges = angles.map((a) => ({ a, R: projectileRange(v0, a, g) }));
  const xScale = Math.max(...ranges.map((r) => r.R), 8);
  const yScale = Math.max(projectileH(v0, 45, g), 4);
  const toX = (x: number) => 28 + (x / xScale) * (W - 48);
  const toY = (y: number) => H - 28 - (y / yScale) * (H - 48);
  const R = projectileRange(v0, theta, g);
  const isMax45 = Math.abs(theta - 45) < 0.5;

  return (
    <div className="space-y-4">
      <PhysGuide type="projectile_motion" mode={mode} />
      <PhysPresets items={angles.map((a) => ({ id: String(a), label: `${a}°`, onSelect: () => setTheta(a) }))} />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <line x1={20} y1={H - 28} x2={W - 12} y2={H - 28} stroke={MUTED} />
        {angles.map((a) => {
          const tf = projectileTflight(v0, a, g);
          const traj = Array.from({ length: 50 }, (_, i) => projectileState(v0, a, (i / 49) * tf, g));
          const active = a === theta;
          return (
            <g key={a} opacity={active ? 1 : 0.45}>
              <path
                d={traj.map((p, i) => `${i ? 'L' : 'M'}${toX(p.x)},${toY(p.y)}`).join(' ')}
                fill="none"
                stroke={colors[a]}
                strokeWidth={active ? 2.4 : 1.4}
              />
              <line x1={toX(projectileRange(v0, a, g))} y1={H - 28} x2={toX(projectileRange(v0, a, g))} y2={H - 34} stroke={colors[a]} strokeWidth={2} />
              <text x={toX(projectileRange(v0, a, g))} y={H - 8} textAnchor="middle" fontSize={9} fill={colors[a]}>{a}°</text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--fg-muted)]">
        {angles.map((a) => (
          <span key={a} style={{ color: colors[a] }}>{a}°: R = {present(projectileRange(v0, a, g))} m</span>
        ))}
      </div>
      <PhysResult primary={`R = ${present(R)} m`} secondary={isMax45 ? tr('max45') : tr('notMax45')} />
      <PhysStatus id={uid}>{tr('status', { R: present(R), theta: present(theta) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="v0 (m/s)" value={v0} min={5} max={40} step={0.5} onChange={setV0} />
        <SliderRow label="θ (°)" value={theta} min={5} max={85} step={1} onChange={setTheta} />
        <SliderRow label="g (m/s²)" value={g} min={9.8} max={10} step={0.01} onChange={setG} />
      </ControlsStack>
    </div>
  );
}

export function ProjectileMotionViz({ mode = 'range' }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [v0, setV0] = useState(22);
  const [theta, setTheta] = useState(40);
  const [g, setG] = useState(G);
  const [t, setT] = useState(0.6);
  const [playing, setPlaying] = useState(false);
  const [graphs, setGraphs] = useState(mode === 'x' || mode === 'y' || mode === 'vx' || mode === 'vy');

  if (mode === 'range') {
    return <VizPanel><RangeMode mode={mode} /></VizPanel>;
  }

  const tmax = projectileTmax(v0, theta, g);
  const Hmax = projectileH(v0, theta, g);
  const tFlight = projectileTflight(v0, theta, g);
  const R = projectileRange(v0, theta, g);
  const tClamped = clamp(t, 0, Math.max(tFlight, 0.2));
  useRafPlay(playing, setT, { min: 0, max: Math.max(tFlight, 0.2), speed: 1, loop: true });
  const st = projectileState(v0, theta, tClamped, g);
  const xScale = Math.max(R, 8);
  const yScale = Math.max(Hmax, 4);
  const toX = (x: number) => 28 + (x / xScale) * (W - 48);
  const toY = (y: number) => H - 28 - (y / yScale) * (H - 48);
  const traj = Array.from({ length: 80 }, (_, i) => projectileState(v0, theta, (i / 79) * tFlight, g));
  const until = Array.from({ length: 50 }, (_, i) => projectileState(v0, theta, (i / 49) * tClamped, g));
  const vx0 = v0 * Math.cos((theta * Math.PI) / 180);
  const vy0 = v0 * Math.sin((theta * Math.PI) / 180);

  const tPlot = makePlot({ xMin: 0, xMax: tFlight || 1, ...padRange([0, R, Hmax, vy0, -vy0], 0.1, 4), H: 100 });
  const vPlot = makePlot({ xMin: 0, xMax: tFlight || 1, ...padRange([vx0, vy0, -vy0], 0.1, 4), H: 100 });

  let status = `R = ${present(R)} m · H = ${present(Hmax)} m · t_vuelo = ${present(tFlight)} s · tmax = ${present(tmax)} s`;
  if (mode === 'components') status = `v0x = v0 cos θ = ${present(vx0)} · v0y = v0 sen θ = ${present(vy0)} m/s`;
  if (mode === 'x') status = `x = (v0 cos θ) t = ${present(st.x)} m · ax = 0`;
  if (mode === 'y') status = `y = (v0 sen θ) t − ½ g t² = ${present(st.y)} m`;
  if (mode === 'vy') status = `vy = v0 sen θ − g t = ${present(st.vy)} m/s · en tmax, vy = 0`;
  if (mode === 'vx') status = `vx = v0 cos θ = ${present(st.vx)} m/s (constante)`;
  if (mode === 'tmax') status = `tmax = v0 sen θ / g = ${present(tmax)} s · vy = ${present(st.vy)}`;
  if (mode === 'hmax') status = `H = v0² sen²θ / (2g) = ${present(Hmax)} m`;
  if (mode === 'tflight') status = `t_vuelo = 2 tmax = ${present(tFlight)} s`;
  if (mode === 'range') status = `R = v0² sen(2θ)/g = ${present(R)} m · 45° es máximo; 30° y 60° igualan R`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="projectile_motion" mode={mode} />
        <PlayRow
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          extra={
            <>
              <VizButton onClick={() => setTheta(45)}>45°</VizButton>
              <VizButton
                onClick={() => {
                  setPlaying(false);
                  setT(0);
                }}
              >
                {tr('reset')}
              </VizButton>
            </>
          }
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Parábola de un proyectil">
          <line x1={20} y1={H - 28} x2={W - 12} y2={H - 28} stroke={MUTED} />
          <path
            d={traj.map((p, i) => `${i ? 'L' : 'M'}${toX(p.x)},${toY(p.y)}`).join(' ')}
            fill="none"
            stroke={MUTED}
            strokeWidth={1.4}
          />
          <path
            d={until.map((p, i) => `${i ? 'L' : 'M'}${toX(p.x)},${toY(p.y)}`).join(' ')}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2.2}
          />
          <line x1={toX(R)} y1={H - 28} x2={toX(R)} y2={H - 22} stroke={ORANGE} />
          <text x={toX(R)} y={H - 8} textAnchor="middle" fontSize={10} fill={ORANGE}>
            R
          </text>
          <line x1={toX(R / 2)} y1={toY(Hmax)} x2={toX(R / 2) + 40} y2={toY(Hmax)} stroke={TEAL} strokeDasharray="3 3" />
          <text x={toX(R / 2) + 44} y={toY(Hmax) + 4} fontSize={10} fill={TEAL}>
            H
          </text>
          <circle cx={toX(st.x)} cy={toY(Math.max(0, st.y))} r={7} fill={ORANGE} />
          <line x1={toX(st.x)} y1={toY(st.y)} x2={toX(st.x) + st.vx * 1.4} y2={toY(st.y)} stroke={TEAL} strokeWidth={2} />
          <line x1={toX(st.x)} y1={toY(st.y)} x2={toX(st.x)} y2={toY(st.y) - st.vy * 1.4} stroke={ACCENT} strokeWidth={2} />
        </svg>
        {graphs ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <ChartFrame plot={tPlot} xLabel="t" yLabel="x,y" title="x(t), y(t)">
              <path d={fnPath((ti) => projectileState(v0, theta, ti, g).x, 0, tFlight, tPlot)} fill="none" stroke={TEAL} strokeWidth={1.6} />
              <path d={fnPath((ti) => projectileState(v0, theta, ti, g).y, 0, tFlight, tPlot)} fill="none" stroke={ACCENT} strokeWidth={1.6} />
              <circle cx={tPlot.X(tClamped)} cy={tPlot.Y(st.x)} r={3} fill={TEAL} />
              <circle cx={tPlot.X(tClamped)} cy={tPlot.Y(st.y)} r={3} fill={ACCENT} />
            </ChartFrame>
            <ChartFrame plot={vPlot} xLabel="t" yLabel="v" title="vx, vy">
              <path d={fnPath(() => vx0, 0, tFlight, vPlot)} fill="none" stroke={TEAL} strokeWidth={1.6} />
              <path d={fnPath((ti) => projectileState(v0, theta, ti, g).vy, 0, tFlight, vPlot)} fill="none" stroke={ACCENT} strokeWidth={1.6} />
              <circle cx={vPlot.X(tClamped)} cy={vPlot.Y(st.vx)} r={3} fill={TEAL} />
              <circle cx={vPlot.X(tClamped)} cy={vPlot.Y(st.vy)} r={3} fill={ACCENT} />
            </ChartFrame>
          </div>
        ) : null}
        <PhysStatus id={uid}>{status} · misma altura inicial y final; ax = 0</PhysStatus>
        <ToggleRow label="Gráficas x(t), y(t), v" checked={graphs} onChange={setGraphs} />
        <ButtonRow>
          <VizButton onClick={() => setTheta(30)}>30°</VizButton>
          <VizButton onClick={() => setTheta(60)}>60°</VizButton>
        </ButtonRow>
        <ControlsStack>
          <SliderRow label={`t (${fmt(tClamped)} s)`} value={tClamped} min={0} max={Math.max(tFlight, 0.2)} step={0.05} onChange={setT} />
          <SliderRow label="v0 (m/s)" value={v0} min={5} max={40} step={0.5} onChange={setV0} />
          <SliderRow label="θ (°)" value={theta} min={5} max={85} step={1} onChange={setTheta} />
          <SliderRow label="g (m/s²)" value={g} min={9.8} max={10} step={0.01} onChange={setG} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

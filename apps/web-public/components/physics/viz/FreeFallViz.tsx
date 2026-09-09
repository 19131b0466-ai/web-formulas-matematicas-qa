'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { G, clamp, vMrua, xMrua } from './physMath';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, fnPath, makePlot, padRange } from './physPlot';

const W = 220;
const H = 280;

export function FreeFallViz({ mode = 'position' }: { mode?: string }) {
  const tf = useTranslations('vizFisica');
  const uid = useId();
  const [y0, setY0] = useState(12);
  const [v0y, setV0y] = useState(18);
  const [g, setG] = useState(G);
  const [t, setT] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [ground, setGround] = useState(true);

  const a = -g;
  const tUp = v0y > 0 ? v0y / g : 0;
  const hExtra = v0y > 0 ? (v0y * v0y) / (2 * g) : 0;
  const yMax = y0 + hExtra;

  const tHit = useMemo(() => {
    // y = y0 + v0 t - ½ g t² = 0
    const disc = v0y * v0y + 2 * g * y0;
    if (disc < 0) return 8;
    const t1 = (v0y + Math.sqrt(disc)) / g;
    return Math.max(0.2, t1);
  }, [y0, v0y, g]);

  const tFlightSame = v0y > 0 ? (2 * v0y) / g : 0;
  const tMax = ground ? tHit : Math.max(tFlightSame, tUp, 2);
  const tClamped = clamp(t, 0, tMax);
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });

  const y = xMrua(y0, v0y, a, tClamped);
  const vy = vMrua(v0y, a, tClamped);
  const yDraw = ground ? Math.max(0, y) : y;
  const yTop = Math.max(yMax, y0, 8) + 4;
  const py = (yy: number) => 16 + ((yTop - yy) / yTop) * (H - 36);

  const yPlot = makePlot({ xMin: 0, xMax: tMax, ...padRange([0, y0, yMax], 0.1, 4), H: 110 });
  const vPlot = makePlot({ xMin: 0, xMax: tMax, ...padRange([v0y, -v0y - 4], 0.1, 6), H: 110 });

  const vy2 = vy * vy;
  const tor = v0y * v0y - 2 * g * (y - y0);

  let status = `t = ${present(tClamped)} s · y = ${present(y)} m · vy = ${present(vy)} m/s · ay = −${present(g)}`;
  if (mode === 'velocity') status = `vy = v0y − g t = ${present(vy)} m/s · pendiente = −g = ${present(-g)}`;
  if (mode === 'position') status = `y = y0 + v0y t − ½ g t² = ${present(y)} m`;
  if (mode === 'torricelli') status = `vy² = ${present(vy2)} · v0y² − 2g Δy = ${present(tor)}`;
  if (mode === 'hmax') status = `H extra = v0²/(2g) = ${present(hExtra)} m · ymax = ${present(yMax)} m · vy(cima) = 0`;
  if (mode === 't_up') status = `t_subida = v0/g = ${present(tUp)} s · en la cima vy = 0`;
  if (mode === 't_flight') status = `t_vuelo (mismo y0) = 2 v0/g = ${present(tFlightSame)} s · 2 t_subida = ${present(2 * tUp)}`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="free_fall" mode={mode} />
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
              {tf('reset')}
            </VizButton>
          }
        />
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label="Caída libre, eje y hacia arriba">
            {ground ? <rect x={20} y={py(0)} width={W - 40} height={8} fill={MUTED} opacity={0.35} /> : null}
            <line x1={40} y1={py(yTop)} x2={40} y2={py(0)} stroke={MUTED} />
            <text x={28} y={py(y0) + 4} fontSize={10} fill={MUTED} textAnchor="end">
              y0
            </text>
            <line x1={36} y1={py(y0)} x2={44} y2={py(y0)} stroke={MUTED} />
            {v0y > 0 ? (
              <>
                <line x1={36} y1={py(yMax)} x2={180} y2={py(yMax)} stroke={ACCENT} strokeDasharray="4 3" />
                <text x={184} y={py(yMax) + 4} fontSize={10} fill={ACCENT}>
                  ymax
                </text>
              </>
            ) : null}
            <circle cx={110} cy={py(yDraw)} r={9} fill={ORANGE} />
            <line x1={110} y1={py(yDraw)} x2={110} y2={py(yDraw) - Math.sign(vy || 1) * Math.min(40, 6 + Math.abs(vy))} stroke={TEAL} strokeWidth={2} />
          </svg>
          <div className="space-y-2">
            <ChartFrame plot={yPlot} xLabel="t" yLabel="y(t)" title="y(t)">
              <path d={fnPath((ti) => xMrua(y0, v0y, a, ti), 0, tMax, yPlot)} fill="none" stroke={mode === 'position' || mode === 'hmax' ? ACCENT : MUTED} strokeWidth={2} />
              <circle cx={yPlot.X(tClamped)} cy={yPlot.Y(y)} r={4} fill={ORANGE} />
            </ChartFrame>
            <ChartFrame plot={vPlot} xLabel="t" yLabel="vy(t)" title="vy(t)">
              <path d={fnPath((ti) => vMrua(v0y, a, ti), 0, tMax, vPlot)} fill="none" stroke={mode === 'velocity' ? ACCENT : TEAL} strokeWidth={2} />
              <circle cx={vPlot.X(tClamped)} cy={vPlot.Y(vy)} r={4} fill={ORANGE} />
            </ChartFrame>
          </div>
        </div>
        <PhysStatus id={uid}>{status} · eje y hacia arriba, ay = −g</PhysStatus>
        <ToggleRow label="Suelo en y = 0" checked={ground} onChange={setGround} />
        <ControlsStack>
          <SliderRow label="t (s)" value={tClamped} min={0} max={tMax} step={0.05} onChange={setT} />
          <SliderRow label="y0 (m)" value={y0} min={0} max={40} step={0.5} onChange={setY0} />
          <SliderRow label="v0y (m/s)" value={v0y} min={-5} max={25} step={0.5} onChange={setV0y} />
          <SliderRow label="g (m/s²)" value={g} min={9.8} max={10} step={0.01} onChange={setG} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

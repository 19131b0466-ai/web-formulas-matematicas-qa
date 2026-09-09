'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, ToggleRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, degToRad } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 260;

export function InclinedPlaneViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [m, setM] = useState(2);
  const [theta, setTheta] = useState(30);
  const [axes, setAxes] = useState(true);
  const [mu, setMu] = useState(false);
  const th = degToRad(theta);
  const mg = m * G;
  const par = mg * Math.sin(th);
  const perp = mg * Math.cos(th);
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

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="inclined_plane" mode={mode} />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Componentes del peso en un plano inclinado">
          <polygon points={`${ox},${oy} ${x2},${y2} ${x2},${oy}`} fill={MUTED} fillOpacity={0.12} />
          <line x1={ox} y1={oy} x2={x2} y2={y2} stroke={MUTED} strokeWidth={3} />
          <rect x={bx - 16} y={by - 12} width={32} height={24} fill={ORANGE} transform={`rotate(${-theta} ${bx} ${by})`} />
          <line x1={bx} y1={by} x2={bx} y2={by + 50} stroke={ACCENT} strokeWidth={2.2} />
          <text x={bx + 8} y={by + 58} fontSize={11} fill={ACCENT}>
            mg
          </text>
          {axes ? (
            <>
              <line
                x1={bx}
                y1={by}
                x2={bx + Math.cos(th) * 48}
                y2={by - Math.sin(th) * 48}
                stroke={TEAL}
                strokeWidth={2.2}
              />
              <text x={bx + Math.cos(th) * 52} y={by - Math.sin(th) * 52} fontSize={11} fill={TEAL}>
                mg senθ
              </text>
              <line
                x1={bx}
                y1={by}
                x2={bx + nx * 40}
                y2={by + ny * 40}
                stroke={ORANGE}
                strokeWidth={2.2}
              />
              <text x={bx + nx * 46} y={by + ny * 46} fontSize={11} fill={ORANGE}>
                N = mg cosθ
              </text>
            </>
          ) : null}
        </svg>
        <PhysStatus id={uid}>
          mg senθ = {present(par)} N · mg cosθ = {present(perp)} N · N = {present(N)} N
          {theta === 0 ? ' · θ = 0: no hay paralela, N = mg' : ''}
          {mu ? ` · fk ≤ μk N (opcional)` : ''}
        </PhysStatus>
        <ToggleRow label="Ejes del plano (∥ y ⊥)" checked={axes} onChange={setAxes} />
        <ToggleRow label="Mostrar fricción (concepto)" checked={mu} onChange={setMu} />
        <ControlsStack>
          <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
          <SliderRow label="θ (°)" value={theta} min={0} max={60} step={1} onChange={setTheta} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad, hypot2 } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL, isoProject } from './physPlot';

const W = 420;
const H = 340;

export function CrossProductViz({ mode }: { mode?: string }) {
  const uid = useId();
  const torque = mode === 'torque';
  const ang = mode === 'angular_momentum';
  const [ax, setAx] = useState(2.2);
  const [ay, setAy] = useState(0.4);
  const [bMag, setBMag] = useState(2);
  const [theta, setTheta] = useState(70);

  const aAng = Math.atan2(ay, ax);
  const th = degToRad(theta);
  const bx = bMag * Math.cos(aAng + th);
  const by = bMag * Math.sin(aAng + th);
  const aMag = hypot2(ax, ay);
  const cz = ax * by - ay * bx;
  const area = Math.abs(cz);
  const sinTh = Math.sin(th);
  const mag = aMag * bMag * Math.abs(sinTh);
  const toward = cz >= 0;

  const ox = 210;
  const oy = 210;
  const s = 42;
  const o = isoProject(0, 0, 0, ox, oy, s);
  const pa = isoProject(ax, ay, 0, ox, oy, s);
  const pb = isoProject(bx, by, 0, ox, oy, s);
  const pab = isoProject(ax + bx, ay + by, 0, ox, oy, s);
  const pz = isoProject(0, 0, toward ? Math.min(2.6, 0.6 + area * 0.35) : -Math.min(2.6, 0.6 + area * 0.35), ox, oy, s);
  const px = isoProject(2.4, 0, 0, ox, oy, s);
  const py = isoProject(0, 2.4, 0, ox, oy, s);
  const pzp = isoProject(0, 0, 2.4, ox, oy, s);

  const labA = torque ? 'r' : ang ? 'r' : 'A';
  const labB = torque ? 'F' : ang ? 'p' : 'B';
  const labC = torque ? 'τ' : ang ? 'L' : 'A×B';

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="cross_product" mode={mode} />
        <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-label="Producto vectorial y área del paralelogramo">
          <line x1={o.x} y1={o.y} x2={px.x} y2={px.y} stroke={MUTED} />
          <line x1={o.x} y1={o.y} x2={py.x} y2={py.y} stroke={MUTED} />
          <line x1={o.x} y1={o.y} x2={pzp.x} y2={pzp.y} stroke={MUTED} />
          <text x={px.x + 6} y={px.y} fontSize={11} fill={MUTED}>
            x
          </text>
          <text x={py.x + 6} y={py.y} fontSize={11} fill={MUTED}>
            y
          </text>
          <text x={pzp.x + 6} y={pzp.y} fontSize={11} fill={MUTED}>
            z
          </text>
          <polygon
            points={`${o.x},${o.y} ${pa.x},${pa.y} ${pab.x},${pab.y} ${pb.x},${pb.y}`}
            fill={ORANGE}
            fillOpacity={0.18}
            stroke={ORANGE}
          />
          <line x1={o.x} y1={o.y} x2={pa.x} y2={pa.y} stroke={ACCENT} strokeWidth={2.4} />
          <line x1={o.x} y1={o.y} x2={pb.x} y2={pb.y} stroke={TEAL} strokeWidth={2.4} />
          <line x1={o.x} y1={o.y} x2={pz.x} y2={pz.y} stroke={ORANGE} strokeWidth={2.8} />
          <text x={pa.x + 8} y={pa.y} fontSize={12} fontWeight={700} fill={ACCENT}>
            {labA}
          </text>
          <text x={pb.x + 8} y={pb.y} fontSize={12} fontWeight={700} fill={TEAL}>
            {labB}
          </text>
          <text x={pz.x + 8} y={pz.y} fontSize={12} fontWeight={700} fill={ORANGE}>
            {labC}
          </text>
          <text x={W / 2} y={24} textAnchor="middle" fontSize={14} fill={ORANGE}>
            {toward ? '⊙ hacia +z' : '⊗ hacia −z'}
          </text>
        </svg>
        <PhysStatus id={uid}>
          {torque
            ? `τ = r F sen θ = ${present(mag)} N·m · θ = ${fmt(theta, 0)}° · ${toward ? '+z' : '−z'}`
            : ang
              ? `L = r p sen θ = ${present(mag)} · θ = ${fmt(theta, 0)}° · ${toward ? '+z' : '−z'}`
              : `|A×B| = AB sen θ = ${present(area)} · AxBy − AyBx = ${present(cz)} · ${toward ? 'hacia +z' : 'hacia −z'}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label={`${labA}x`} value={ax} min={-3} max={3} step={0.1} onChange={setAx} />
          <SliderRow label={`${labA}y`} value={ay} min={-3} max={3} step={0.1} onChange={setAy} />
          <SliderRow label={`|${labB}|`} value={bMag} min={0.4} max={3} step={0.1} onChange={setBMag} />
          <SliderRow label={`θ (${fmt(theta, 0)}°)`} value={theta} min={0} max={180} step={1} onChange={setTheta} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

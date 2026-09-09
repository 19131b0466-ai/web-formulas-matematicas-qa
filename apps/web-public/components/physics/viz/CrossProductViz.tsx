'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad, hypot2 } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { crossProductMagnitude } from './physLote4Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL, isoProject } from './physPlot';

const W = 420;
const H = 340;

function CrossProductMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.vec006');
  const uid = useId();
  const [ax, setAx] = useState(2.2);
  const [ay, setAy] = useState(0.4);
  const [bMag, setBMag] = useState(2);
  const [theta, setTheta] = useState(70);
  const [hand, setHand] = useState(0);

  const aAng = Math.atan2(ay, ax);
  const th = degToRad(theta);
  const bx = bMag * Math.cos(aAng + th);
  const by = bMag * Math.sin(aAng + th);
  const aMag = hypot2(ax, ay);
  const cz = ax * by - ay * bx;
  const area = Math.abs(cz);
  const mag = crossProductMagnitude(aMag, bMag, Math.sin(th));
  const toward = cz >= 0;

  const ox = 210;
  const oy = 210;
  const s = 42;
  const o = isoProject(0, 0, 0, ox, oy, s);
  const pa = isoProject(ax, ay, 0, ox, oy, s);
  const pb = isoProject(bx, by, 0, ox, oy, s);
  const pab = isoProject(ax + bx, ay + by, 0, ox, oy, s);
  const pz = isoProject(0, 0, toward ? Math.min(2.6, 0.6 + area * 0.35) : -Math.min(2.6, 0.6 + area * 0.35), ox, oy, s);

  const presets = [
    { id: '0', label: '0°', onSelect: () => setTheta(0) },
    { id: '90', label: '90°', onSelect: () => setTheta(90) },
    { id: '180', label: '180°', onSelect: () => setTheta(180) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="cross_product" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-label={tr('aria')}>
        <polygon points={`${o.x},${o.y} ${pa.x},${pa.y} ${pab.x},${pab.y} ${pb.x},${pb.y}`} fill={ORANGE} fillOpacity={0.18} stroke={ORANGE} />
        <line x1={o.x} y1={o.y} x2={pa.x} y2={pa.y} stroke={ACCENT} strokeWidth={2.4} />
        <line x1={o.x} y1={o.y} x2={pb.x} y2={pb.y} stroke={TEAL} strokeWidth={2.4} />
        <line x1={o.x} y1={o.y} x2={pz.x} y2={pz.y} stroke={ORANGE} strokeWidth={2.8} />
        <text x={pa.x + 8} y={pa.y} fontSize={12} fontWeight={700} fill={ACCENT}>A</text>
        <text x={pb.x + 8} y={pb.y} fontSize={12} fontWeight={700} fill={TEAL}>B</text>
        <text x={pz.x + 8} y={pz.y} fontSize={12} fontWeight={700} fill={ORANGE}>A×B</text>
        <text x={W / 2} y={24} textAnchor="middle" fontSize={14} fill={ORANGE}>{toward ? tr('out') : tr('in')}</text>
        <text x={24} y={H - 16} fontSize={11} fill={MUTED}>{tr('hand', { step: (hand % 3) + 1 })}</text>
      </svg>
      <PhysResult primary={tr('mag', { mag: present(mag), area: present(area) })} secondary={tr('dir', { dir: toward ? '+z' : '−z' })} />
      <PhysStatus id={uid}>{tr('status', { mag: present(mag), cz: present(cz), theta: fmt(theta, 0) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="Ax" value={ax} min={-3} max={3} step={0.1} onChange={setAx} />
        <SliderRow label="Ay" value={ay} min={-3} max={3} step={0.1} onChange={setAy} />
        <SliderRow label="|B|" value={bMag} min={0.4} max={3} step={0.1} onChange={setBMag} />
        <SliderRow label={`θ (${fmt(theta, 0)}°)`} value={theta} min={0} max={180} step={1} onChange={(v) => { setTheta(v); setHand((h) => h + 1); }} />
      </ControlsStack>
    </div>
  );
}

function TorqueCrossMode({ mode }: { mode: string }) {
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
  const mag = Math.abs(aMag * bMag * Math.sin(th));
  const toward = cz >= 0;
  const ox = 210;
  const oy = 210;
  const s = 42;
  const o = isoProject(0, 0, 0, ox, oy, s);
  const pa = isoProject(ax, ay, 0, ox, oy, s);
  const pb = isoProject(bx, by, 0, ox, oy, s);
  const pab = isoProject(ax + bx, ay + by, 0, ox, oy, s);
  const pz = isoProject(0, 0, toward ? 1.8 : -1.8, ox, oy, s);
  const labA = torque || ang ? 'r' : 'A';
  const labB = torque ? 'F' : ang ? 'p' : 'B';
  const labC = torque ? 'τ' : ang ? 'L' : 'A×B';

  return (
    <div className="space-y-4">
      <PhysGuide type="cross_product" mode={mode} />
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-label="Producto vectorial">
        <polygon points={`${o.x},${o.y} ${pa.x},${pa.y} ${pab.x},${pab.y} ${pb.x},${pb.y}`} fill={ORANGE} fillOpacity={0.18} stroke={ORANGE} />
        <line x1={o.x} y1={o.y} x2={pa.x} y2={pa.y} stroke={ACCENT} strokeWidth={2.4} />
        <line x1={o.x} y1={o.y} x2={pb.x} y2={pb.y} stroke={TEAL} strokeWidth={2.4} />
        <line x1={o.x} y1={o.y} x2={pz.x} y2={pz.y} stroke={ORANGE} strokeWidth={2.8} />
        <text x={pa.x + 8} y={pa.y} fontSize={12} fontWeight={700} fill={ACCENT}>{labA}</text>
        <text x={pb.x + 8} y={pb.y} fontSize={12} fontWeight={700} fill={TEAL}>{labB}</text>
        <text x={pz.x + 8} y={pz.y} fontSize={12} fontWeight={700} fill={ORANGE}>{labC}</text>
      </svg>
      <PhysStatus id={uid}>
        {torque ? `τ = r F sen θ = ${present(mag)} N·m` : ang ? `L = r p sen θ = ${present(mag)}` : `|A×B| = ${present(mag)}`}
      </PhysStatus>
      <ControlsStack>
        <SliderRow label={`${labA}x`} value={ax} min={-3} max={3} step={0.1} onChange={setAx} />
        <SliderRow label={`${labA}y`} value={ay} min={-3} max={3} step={0.1} onChange={setAy} />
        <SliderRow label={`|${labB}|`} value={bMag} min={0.4} max={3} step={0.1} onChange={setBMag} />
        <SliderRow label={`θ (${fmt(theta, 0)}°)`} value={theta} min={0} max={180} step={1} onChange={setTheta} />
      </ControlsStack>
    </div>
  );
}

export function CrossProductViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'torque' || mode === 'angular_momentum' ? <TorqueCrossMode mode={mode} /> : <CrossProductMode mode={mode} />}
    </VizPanel>
  );
}

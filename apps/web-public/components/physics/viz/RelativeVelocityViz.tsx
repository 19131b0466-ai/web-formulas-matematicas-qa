'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { degToRad } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 240;

export function RelativeVelocityViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [scene, setScene] = useState<'river' | 'wind'>('river');
  const [vp, setVp] = useState(4);
  const [thP, setThP] = useState(90);
  const [vb, setVb] = useState(2.5);
  const [thB, setThB] = useState(0);
  const pth = degToRad(thP);
  const bth = degToRad(thB);
  const vpx = vp * Math.cos(pth);
  const vpy = vp * Math.sin(pth);
  const vbx = vb * Math.cos(bth);
  const vby = vb * Math.sin(bth);
  const rx = vpx + vbx;
  const ry = vpy + vby;
  const ox = 80;
  const oy = 140;
  const S = 22;
  const labP = scene === 'river' ? 'v barca/agua' : 'v avión/aire';
  const labB = scene === 'river' ? 'v agua/tierra' : 'v viento';

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="relative_velocity" mode={mode} />
        <ButtonRow>
          <VizButton active={scene === 'river'} onClick={() => setScene('river')}>
            Cruzar el río
          </VizButton>
          <VizButton active={scene === 'wind'} onClick={() => setScene('wind')}>
            Viento cruzado
          </VizButton>
        </ButtonRow>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Composición de velocidades relativas">
          {scene === 'river' ? (
            <rect x={20} y={40} width={380} height={160} fill={TEAL} fillOpacity={0.12} />
          ) : (
            <rect x={20} y={40} width={380} height={160} fill={MUTED} fillOpacity={0.08} />
          )}
          <line x1={ox} y1={oy} x2={ox + vpx * S} y2={oy - vpy * S} stroke={ACCENT} strokeWidth={2.4} />
          <line x1={ox + vpx * S} y1={oy - vpy * S} x2={ox + rx * S} y2={oy - ry * S} stroke={TEAL} strokeWidth={2.4} />
          <line x1={ox} y1={oy} x2={ox + rx * S} y2={oy - ry * S} stroke={ORANGE} strokeWidth={2.8} />
          <text x={ox + vpx * S} y={oy - vpy * S - 8} fontSize={11} fill={ACCENT}>
            {labP}
          </text>
          <text x={ox + rx * S + 6} y={oy - ry * S} fontSize={11} fill={ORANGE}>
            v P/A
          </text>
        </svg>
        <PhysStatus id={uid}>
          vP/A = vP/B + vB/A = ({present(rx)}, {present(ry)}) m/s · |vP/A| = {present(Math.hypot(rx, ry))}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label={`|vP/B| (${labP})`} value={vp} min={0.5} max={10} step={0.1} onChange={setVp} />
          <SliderRow label="ángulo P/B (°)" value={thP} min={0} max={180} step={1} onChange={setThP} />
          <SliderRow label={`|vB/A| (${labB})`} value={vb} min={0} max={8} step={0.1} onChange={setVb} />
          <SliderRow label="ángulo B/A (°)" value={thB} min={-30} max={180} step={1} onChange={setThB} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

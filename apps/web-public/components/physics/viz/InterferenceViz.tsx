'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

export function InterferenceViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const superpos = mode === 'superposition';
  const [lambda, setLambda] = useState(1.2);
  const [px, setPx] = useState(3);
  const [py, setPy] = useState(1.5);
  const [phase, setPhase] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 1, loop: true });
  const s1 = { x: 1, y: 1.5 };
  const s2 = { x: 2.6, y: 1.5 };
  const r1 = Math.hypot(px - s1.x, py - s1.y);
  const r2 = Math.hypot(px - s2.x, py - s2.y);
  const dr = Math.abs(r1 - r2);
  const mInt = dr / lambda;
  const construct = Math.abs(mInt - Math.round(mInt)) < 0.08;
  const ox = 40;
  const oy = 120;
  const S = 70;
  const plot = makePlot({ xMin: 0, xMax: 4, yMin: -2.2, yMax: 2.2, H: 110 });
  const y1 = (tt: number) => Math.sin(2 * Math.PI * (tt / 2));
  const y2 = (tt: number) => Math.sin(2 * Math.PI * (tt / 2) + phase);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="interference" mode={mode} />
        {superpos ? (
          <>
            <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => setT(0)}>{tr('reset')}</VizButton>} />
            <ChartFrame plot={plot} xLabel="t" yLabel="y" title="y1+y2">
              <path d={fnPath(y1, 0, 4, plot)} fill="none" stroke={TEAL} strokeWidth={1.4} />
              <path d={fnPath(y2, 0, 4, plot)} fill="none" stroke={ACCENT} strokeWidth={1.4} />
              <path d={fnPath((tt) => y1(tt) + y2(tt), 0, 4, plot)} fill="none" stroke={ORANGE} strokeWidth={2} />
              <circle cx={plot.X(t)} cy={plot.Y(y1(t) + y2(t))} r={4} fill={ORANGE} />
            </ChartFrame>
            <PhysStatus id={uid}>y = y1 + y2 · desfase = {present(phase)} rad</PhysStatus>
            <ControlsStack>
              <SliderRow label="desfase (rad)" value={phase} min={0} max={Math.PI} step={0.05} onChange={setPhase} />
            </ControlsStack>
          </>
        ) : (
          <>
            <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label="Interferencia de dos fuentes">
              <circle cx={ox + s1.x * S} cy={oy} r={5} fill={TEAL} />
              <circle cx={ox + s2.x * S} cy={oy} r={5} fill={ACCENT} />
              {[1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <circle cx={ox + s1.x * S} cy={oy} r={i * lambda * S * 0.5} fill="none" stroke={TEAL} opacity={0.35} />
                  <circle cx={ox + s2.x * S} cy={oy} r={i * lambda * S * 0.5} fill="none" stroke={ACCENT} opacity={0.35} />
                </g>
              ))}
              <circle cx={ox + px * S} cy={oy - (py - 1.5) * S} r={7} fill={ORANGE} />
              <text x={ox + px * S + 8} y={oy - (py - 1.5) * S} fontSize={12} fill={ORANGE}>
                P
              </text>
            </svg>
            <PhysStatus id={uid}>
              Δr = {present(dr)} · Δr/λ = {present(mInt)} · {construct ? 'máximo (m λ)' : Math.abs(mInt - Math.floor(mInt) - 0.5) < 0.08 ? 'mínimo ((m+½)λ)' : 'intermedio'}
            </PhysStatus>
            <ControlsStack>
              <SliderRow label="λ" value={lambda} min={0.6} max={2} step={0.05} onChange={setLambda} />
              <SliderRow label="Px" value={px} min={1.5} max={5} step={0.05} onChange={setPx} />
              <SliderRow label="Py" value={py} min={0.2} max={3} step={0.05} onChange={setPy} />
            </ControlsStack>
          </>
        )}
      </div>
    </VizPanel>
  );
}

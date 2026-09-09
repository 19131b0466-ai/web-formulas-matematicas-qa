'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

export function ImpulseMomentumViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [m, setM] = useState(1.5);
  const [Fmax, setFmax] = useState(20);
  const [dtPulse, setDt] = useState(0.4);
  const [shape, setShape] = useState<'rect' | 'tri'>('rect');
  const [t, setT] = useState(0.2);
  const [playing, setPlaying] = useState(false);
  const tMax = 2;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const t0 = 0.4;
  const t1 = t0 + dtPulse;
  const F = (tt: number) => {
    if (tt < t0 || tt > t1) return 0;
    const u = (tt - t0) / dtPulse;
    return shape === 'rect' ? Fmax : Fmax * (1 - Math.abs(2 * u - 1));
  };
  const J = integrate(F, 0, tMax);
  const Jnow = integrate(F, 0, t);
  const pi = 0;
  const pf = pi + J;
  const p = pi + Jnow;
  const v = p / m;
  const plot = makePlot({ xMin: 0, xMax: tMax, yMin: -2, yMax: Fmax + 6, H: 120 });

  let status = `J = Δp = ${present(J)} N·s · pf − pi = ${present(pf - pi)}`;
  if (mode === 'p') status = `p = m v = ${present(p)} kg·m/s`;
  if (mode === 'F_dpdt') status = `ΣF = dp/dt · p(t) = ${present(p)}`;
  if (mode === 'J') status = `J = ∫ F dt = ${present(J)} (área)`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="impulse_momentum" mode={mode} />
        <PlayRow
          playing={playing}
          onToggle={() => setPlaying((q) => !q)}
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
        <ButtonRow>
          <VizButton active={shape === 'rect'} onClick={() => setShape('rect')}>
            pulso rectangular
          </VizButton>
          <VizButton active={shape === 'tri'} onClick={() => setShape('tri')}>
            triangular
          </VizButton>
        </ButtonRow>
        <svg viewBox="0 0 420 70" className="h-auto w-full" role="img" aria-label="Carrito impulsado">
          <line x1={20} y1={50} x2={400} y2={50} stroke={MUTED} />
          <rect x={40 + v * 40} y={28} width={40} height={22} fill={ORANGE} />
        </svg>
        <ChartFrame plot={plot} xLabel="t" yLabel="F" title="F(t)">
          <path d={areaToAxis(F, 0, t, plot)} fill={ACCENT} fillOpacity={0.25} />
          <path d={fnPath(F, 0, tMax, plot, 200)} fill="none" stroke={TEAL} strokeWidth={2} />
          <circle cx={plot.X(t)} cy={plot.Y(F(t))} r={4} fill={ORANGE} />
        </ChartFrame>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          <SliderRow label="m (kg)" value={m} min={0.4} max={6} step={0.1} onChange={setM} />
          <SliderRow label="Fmax (N)" value={Fmax} min={5} max={40} step={0.5} onChange={setFmax} />
          <SliderRow label="Δt pulso (s)" value={dtPulse} min={0.15} max={1.2} step={0.05} onChange={setDt} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

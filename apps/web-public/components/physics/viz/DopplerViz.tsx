'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { SOUND_V } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ORANGE, TEAL } from './physPlot';

export function DopplerViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [f, setF] = useState(400);
  const [vs, setVs] = useState(20);
  const [vo, setVo] = useState(0);
  const [srcToward, setSrcToward] = useState(true);
  const [obsToward, setObsToward] = useState(true);
  const v = SOUND_V;
  const num = v + (obsToward ? vo : -vo);
  const den = v - (srcToward ? vs : -vs);
  const fp = f * (num / den);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="doppler" mode={mode} />
        <ButtonRow>
          <VizButton active={srcToward} onClick={() => setSrcToward(true)}>
            fuente se acerca
          </VizButton>
          <VizButton active={!srcToward} onClick={() => setSrcToward(false)}>
            fuente se aleja
          </VizButton>
        </ButtonRow>
        <ButtonRow>
          <VizButton active={obsToward} onClick={() => setObsToward(true)}>
            observador se acerca
          </VizButton>
          <VizButton active={!obsToward} onClick={() => setObsToward(false)}>
            observador se aleja
          </VizButton>
        </ButtonRow>
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Frentes de onda Doppler">
          <circle cx={140} cy={70} r={8} fill={ACCENT} />
          <text x={120} y={24} fontSize={11} fill={ACCENT}>
            fuente
          </text>
          <circle cx={320} cy={70} r={8} fill={TEAL} />
          <text x={290} y={24} fontSize={11} fill={TEAL}>
            observador
          </text>
          {[18, 32, 48, 66].map((r, i) => (
            <circle
              key={r}
              cx={140 + (srcToward ? 8 * i : -4 * i)}
              cy={70}
              r={r}
              fill="none"
              stroke={ORANGE}
              opacity={0.5}
            />
          ))}
        </svg>
        <PhysStatus id={uid}>
          f′ = f (v {obsToward ? '+' : '−'} vo)/(v {srcToward ? '−' : '+'} vs) = {present(fp)} Hz · v = {v} m/s
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="f (Hz)" value={f} min={100} max={800} step={10} onChange={setF} />
          <SliderRow label="vs (m/s)" value={vs} min={0} max={80} step={1} onChange={setVs} />
          <SliderRow label="vo (m/s)" value={vo} min={0} max={40} step={1} onChange={setVo} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

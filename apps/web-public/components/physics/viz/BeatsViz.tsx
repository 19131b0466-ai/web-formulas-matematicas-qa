'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, ChartFrame, ORANGE, fnPath, makePlot } from './physPlot';

export function BeatsViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [f1, setF1] = useState(200);
  const [f2, setF2] = useState(208);
  const fbat = Math.abs(f1 - f2);
  const T = 0.08;
  const plot = makePlot({ xMin: 0, xMax: T, yMin: -2.2, yMax: 2.2, H: 140 });
  const sum = (t: number) => Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t);
  const env = (t: number) => 2 * Math.cos(2 * Math.PI * (fbat / 2) * t);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="beats" mode={mode} />
        <ChartFrame plot={plot} xLabel="t (s)" yLabel="y" title="Batidos">
          <path d={fnPath(sum, 0, T, plot, 400)} fill="none" stroke={ACCENT} strokeWidth={1.4} />
          <path d={fnPath(env, 0, T, plot, 200)} fill="none" stroke={ORANGE} strokeDasharray="4 3" />
          <path d={fnPath((t) => -env(t), 0, T, plot, 200)} fill="none" stroke={ORANGE} strokeDasharray="4 3" />
        </ChartFrame>
        <PhysStatus id={uid}>fbat = |f1 − f2| = {present(fbat)} Hz</PhysStatus>
        <ControlsStack>
          <SliderRow label="f1 (Hz)" value={f1} min={180} max={240} step={1} onChange={setF1} />
          <SliderRow label="f2 (Hz)" value={f2} min={180} max={240} step={1} onChange={setF2} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

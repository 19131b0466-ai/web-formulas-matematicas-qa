'use client';

import { VizPanel } from '@/components/algebra/viz/controls';
import { AccelSHMMode, EnergySHMMode, GeneralSHMMode, PositionSHMMode, VelocitySHMMode } from './SHMModesL5';

export function SHMViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {!mode ? <PositionSHMMode mode={mode} /> :
        mode === 'a' ? <AccelSHMMode mode={mode} /> :
        mode === 'v' ? <VelocitySHMMode mode={mode} /> :
        mode === 'energy' ? <EnergySHMMode mode={mode} /> :
        <GeneralSHMMode mode={mode} />}
    </VizPanel>
  );
}

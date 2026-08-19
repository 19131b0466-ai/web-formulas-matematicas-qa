'use client';

import { useVizLabels } from '@/lib/viz-labels';
import { VizPanel } from './controls';
import { PrimeFiniteFieldVisualizer } from './PrimeFiniteFieldVisualizer';

type Props = { formulaId: string; idea?: string };

function LinearCodeSubspaceDemo() {
  const v = useVizLabels();
  const codeWords = [
    [0, 0, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
  ];

  return (
    <VizPanel>
      <div className="space-y-1 font-mono text-sm">
        {codeWords.map((w, i) => (
          <div key={i}>c{i} = [{w.join(', ')}]</div>
        ))}
        <p className="text-[var(--fg-muted)]">{v.subspaceNote}</p>
      </div>
    </VizPanel>
  );
}

export function FiniteFieldViz({ formulaId }: Props) {
  if (formulaId.includes('EST-006')) return <PrimeFiniteFieldVisualizer />;
  if (formulaId.includes('COD-001')) return <LinearCodeSubspaceDemo />;
  return null;
}

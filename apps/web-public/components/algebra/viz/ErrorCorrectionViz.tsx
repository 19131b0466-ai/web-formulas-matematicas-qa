'use client';

import { MinimumDistanceVisualizer } from './MinimumDistanceVisualizer';
import { HammingDistanceWeightVisualizer } from './HammingDistanceWeightVisualizer';
import { SyndromeVisualizer } from './SyndromeVisualizer';
import { LinearCodeRateVisualizer } from './LinearCodeRateVisualizer';

type Props = { formulaId: string; idea?: string };

export function ErrorCorrectionViz({ formulaId }: Props) {
  if (/COD-004/.test(formulaId)) return <SyndromeVisualizer />;
  if (/COD-005/.test(formulaId)) return <HammingDistanceWeightVisualizer />;
  if (/COD-006/.test(formulaId)) return <MinimumDistanceVisualizer />;
  if (/COD-007/.test(formulaId)) return <LinearCodeRateVisualizer />;
  return null;
}

'use client';

import { PrimeFiniteFieldVisualizer } from './PrimeFiniteFieldVisualizer';
import { LinearCodeVisualizer } from './LinearCodeVisualizer';

type Props = { formulaId: string; idea?: string };

export function FiniteFieldViz({ formulaId }: Props) {
  if (formulaId.includes('EST-006')) return <PrimeFiniteFieldVisualizer />;
  if (formulaId.includes('COD-001')) return <LinearCodeVisualizer />;
  return null;
}

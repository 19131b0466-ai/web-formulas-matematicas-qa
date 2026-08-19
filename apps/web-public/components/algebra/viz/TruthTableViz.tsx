'use client';

import { BooleanAbsorptionVisualizer } from './BooleanAbsorptionVisualizer';
import { BooleanDistributivityVisualizer } from './BooleanDistributivityVisualizer';
import { BooleanEquivalenceVisualizer } from './BooleanEquivalenceVisualizer';
import { BooleanIdentityVisualizer } from './BooleanIdentityVisualizer';
import { IdempotenceComplementVisualizer } from './IdempotenceComplementVisualizer';
import { ProductOfSumsVisualizer } from './ProductOfSumsVisualizer';
import { SumOfProductsVisualizer } from './SumOfProductsVisualizer';
import { XorVisualizer } from './XorVisualizer';

type Props = { formulaId: string; idea?: string; mode?: string };

export function TruthTableViz({ formulaId }: Props) {
  if (formulaId.includes('BOO-001')) return <BooleanIdentityVisualizer />;
  if (formulaId.includes('BOO-002')) return <IdempotenceComplementVisualizer />;
  if (formulaId.includes('BOO-003')) return <BooleanDistributivityVisualizer />;
  if (formulaId.includes('BOO-005')) return <XorVisualizer />;
  if (formulaId.includes('BOO-006')) return <BooleanAbsorptionVisualizer />;
  if (formulaId.includes('BOO-007')) return <SumOfProductsVisualizer />;
  if (formulaId.includes('BOO-008')) return <ProductOfSumsVisualizer />;
  if (formulaId.includes('BOO-009')) return <BooleanEquivalenceVisualizer />;

  return null;
}

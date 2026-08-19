'use client';

import { ChineseRemainderTheoremVisualizer } from './ChineseRemainderTheoremVisualizer';
import { FermatLittleTheoremVisualizer } from './FermatLittleTheoremVisualizer';
import { ModularCongruenceVisualizer } from './ModularCongruenceVisualizer';
import { ModularInverseVisualizer } from './ModularInverseVisualizer';
import { ModularOperationsVisualizer } from './ModularOperationsVisualizer';

type Props = { formulaId: string; idea?: string; mode?: string };

export function ModularClockViz({ formulaId }: Props) {
  if (formulaId.includes('MOD-001')) return <ModularCongruenceVisualizer />;
  if (formulaId.includes('MOD-002')) return <ModularOperationsVisualizer />;
  if (formulaId.includes('MOD-003')) return <ModularInverseVisualizer />;
  if (formulaId.includes('MOD-005')) return <ChineseRemainderTheoremVisualizer />;
  if (formulaId.includes('MOD-006')) return <FermatLittleTheoremVisualizer />;
  return null;
}

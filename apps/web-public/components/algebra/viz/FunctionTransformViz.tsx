'use client';

import { CompositionViz } from './CompositionViz';
import { ScalingReflectionViz } from './ScalingReflectionViz';
import { TranslationViz } from './TranslationViz';

type Props = { formulaId: string; idea?: string };

/**
 * Routes function-transform formulas to dedicated pedagogical viz panels.
 */
export function FunctionTransformViz({ formulaId }: Props) {
  if (formulaId.includes('FUN-002')) {
    return <CompositionViz />;
  }
  if (formulaId.includes('FUN-007')) {
    return <TranslationViz />;
  }
  if (formulaId.includes('FUN-008')) {
    return <ScalingReflectionViz />;
  }
  return <TranslationViz />;
}

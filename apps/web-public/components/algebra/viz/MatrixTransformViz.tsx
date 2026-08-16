'use client';

import { LinearityViz } from './LinearityViz';
import { MatrixMapViz } from './MatrixMapViz';
import { CompositionLinearViz } from './CompositionLinearViz';
import { InverseTransformViz } from './InverseTransformViz';
import { MatrixTransformVizLegacy } from './MatrixTransformVizLegacy';

type Props = { formulaId: string; idea?: string; mode?: string };

/**
 * Router for matrix_transform lessons.
 * TRA-001/002/005/006 get dedicated pedagogy; EIG/DEC/SVD/QR keep the legacy lab.
 */
export function MatrixTransformViz({ formulaId, idea, mode }: Props) {
  if (formulaId.includes('TRA-001')) return <LinearityViz />;
  if (formulaId.includes('TRA-002')) return <MatrixMapViz />;
  if (formulaId.includes('TRA-005')) return <CompositionLinearViz />;
  if (formulaId.includes('TRA-006')) return <InverseTransformViz />;

  return <MatrixTransformVizLegacy formulaId={formulaId} idea={idea} mode={mode} />;
}

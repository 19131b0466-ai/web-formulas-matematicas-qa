'use client';

import { LinearityViz } from './LinearityViz';
import { MatrixMapViz } from './MatrixMapViz';
import { CompositionLinearViz } from './CompositionLinearViz';
import { InverseTransformViz } from './InverseTransformViz';
import { EigenEquationViz } from './EigenEquationViz';
import { DiagonalizationViz } from './DiagonalizationViz';
import { MatrixPowerDiagViz } from './MatrixPowerDiagViz';
import { SpectralTheoremViz } from './SpectralTheoremViz';
import { OrthogonalMatrixViz } from './OrthogonalMatrixViz';
import { MatrixTransformVizLegacy } from './MatrixTransformVizLegacy';

type Props = { formulaId: string; idea?: string; mode?: string };

/**
 * Router for matrix_transform lessons.
 * TRA-001/002/005/006, EIG-001/004/005/006, and ORT-003 get dedicated pedagogy;
 * other EIG/DEC/SVD/QR keep the legacy lab.
 */
export function MatrixTransformViz({ formulaId, idea, mode }: Props) {
  if (formulaId.includes('TRA-001')) return <LinearityViz />;
  if (formulaId.includes('TRA-002')) return <MatrixMapViz />;
  if (formulaId.includes('TRA-005')) return <CompositionLinearViz />;
  if (formulaId.includes('TRA-006')) return <InverseTransformViz />;
  if (formulaId.includes('EIG-001')) return <EigenEquationViz />;
  if (formulaId.includes('EIG-004')) return <DiagonalizationViz />;
  if (formulaId.includes('EIG-005')) return <MatrixPowerDiagViz />;
  if (formulaId.includes('EIG-006')) return <SpectralTheoremViz />;
  if (formulaId.includes('ORT-003')) return <OrthogonalMatrixViz />;

  return <MatrixTransformVizLegacy formulaId={formulaId} idea={idea} mode={mode} />;
}

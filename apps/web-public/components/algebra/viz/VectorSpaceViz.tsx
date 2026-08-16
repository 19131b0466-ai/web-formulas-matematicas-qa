'use client';

import { SpanViz } from './SpanViz';
import { LinearIndependenceViz } from './LinearIndependenceViz';
import { BasisDimensionViz } from './BasisDimensionViz';
import { CoordinatesBasisViz } from './CoordinatesBasisViz';
import { NullityViz } from './NullityViz';
import { RankNullityViz } from './RankNullityViz';
import { KernelViz } from './KernelViz';
import { ImageViz } from './ImageViz';
import { ChangeOfBasisViz } from './ChangeOfBasisViz';
import { EigenspaceViz } from './EigenspaceViz';
import { GramSchmidtViz } from './GramSchmidtViz';
import { VectorSpaceVizLegacy } from './VectorSpaceVizLegacy';

type Props = { formulaId: string; idea?: string };

/**
 * Router for vector_space lessons.
 * ESP-001…007, TRA-003/004/007, EIG-003, and ORT-004 get dedicated pedagogy.
 */
export function VectorSpaceViz({ formulaId }: Props) {
  if (formulaId.includes('ESP-001')) return <SpanViz />;
  if (formulaId.includes('ESP-002')) return <LinearIndependenceViz />;
  if (formulaId.includes('ESP-003')) return <BasisDimensionViz />;
  if (formulaId.includes('ESP-004')) return <CoordinatesBasisViz />;
  if (formulaId.includes('ESP-006')) return <NullityViz />;
  if (formulaId.includes('ESP-007')) return <RankNullityViz />;
  if (formulaId.includes('TRA-003')) return <KernelViz />;
  if (formulaId.includes('TRA-004')) return <ImageViz />;
  if (formulaId.includes('TRA-007')) return <ChangeOfBasisViz />;
  if (formulaId.includes('EIG-003')) return <EigenspaceViz />;
  if (formulaId.includes('ORT-004')) return <GramSchmidtViz />;

  return <VectorSpaceVizLegacy formulaId={formulaId} />;
}

'use client';

import { SpanViz } from './SpanViz';
import { LinearIndependenceViz } from './LinearIndependenceViz';
import { BasisDimensionViz } from './BasisDimensionViz';
import { CoordinatesBasisViz } from './CoordinatesBasisViz';
import { NullityViz } from './NullityViz';
import { RankNullityViz } from './RankNullityViz';
import { VectorSpaceVizLegacy } from './VectorSpaceVizLegacy';

type Props = { formulaId: string; idea?: string };

/**
 * Router for vector_space lessons.
 * ESP-001…007 (and rank via matrix type) get dedicated pedagogy.
 * Remaining formulas (ORT-004 Gram–Schmidt, TRA-*, …) keep the legacy lab.
 */
export function VectorSpaceViz({ formulaId }: Props) {
  if (formulaId.includes('ESP-001')) return <SpanViz />;
  if (formulaId.includes('ESP-002')) return <LinearIndependenceViz />;
  if (formulaId.includes('ESP-003')) return <BasisDimensionViz />;
  if (formulaId.includes('ESP-004')) return <CoordinatesBasisViz />;
  if (formulaId.includes('ESP-006')) return <NullityViz />;
  if (formulaId.includes('ESP-007')) return <RankNullityViz />;

  return <VectorSpaceVizLegacy formulaId={formulaId} />;
}

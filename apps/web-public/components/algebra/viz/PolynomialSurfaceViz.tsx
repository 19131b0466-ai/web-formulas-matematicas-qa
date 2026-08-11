'use client';

import { HomogeneousPolyViz } from './HomogeneousPolyViz';
import { MultivariablePolyViz } from './MultivariablePolyViz';

type Props = { formulaId: string; idea?: string };

/**
 * Routes polynomial_surface formulas to dedicated pedagogical panels.
 */
export function PolynomialSurfaceViz({ formulaId }: Props) {
  if (formulaId.includes('POL-009')) {
    return <HomogeneousPolyViz />;
  }
  return <MultivariablePolyViz />;
}

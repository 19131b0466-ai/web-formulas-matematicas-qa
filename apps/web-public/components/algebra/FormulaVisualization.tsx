'use client';

import type { ReactNode } from 'react';
import type { FormulaVisual } from '@repo/shared-types';
import { useVizLabels } from '@/lib/viz-labels';
import {
  AlgebraTilesViz,
  ErrorCorrectionViz,
  FiniteFieldViz,
  FunctionTransformViz,
  GeometryViz,
  GraphViz,
  LogicGateViz,
  MatrixTransformViz,
  MatrixViz,
  ModularClockViz,
  NumberLineViz,
  PolynomialSurfaceViz,
  TruthTableViz,
  VectorSpaceViz,
  VectorViz,
} from './viz';

type Props = {
  formulaId: string;
  visual: FormulaVisual;
  title?: string;
};

export function FormulaVisualization({ formulaId, visual, title }: Props) {
  const v = useVizLabels();
  const idea = visual.idea || visual.concept;
  const type = visual.type;

  let body: ReactNode;
  switch (type) {
    case 'number_line':
      body = <NumberLineViz formulaId={formulaId} idea={idea} />;
      break;
    case 'algebra_tiles':
      body = <AlgebraTilesViz formulaId={formulaId} idea={idea} />;
      break;
    case 'graph':
      body = <GraphViz formulaId={formulaId} idea={idea} />;
      break;
    case 'function_transform':
      body = <FunctionTransformViz formulaId={formulaId} idea={idea} />;
      break;
    case 'vector':
      body = <VectorViz formulaId={formulaId} idea={idea} />;
      break;
    case 'vector_space':
      body = <VectorSpaceViz formulaId={formulaId} idea={idea} />;
      break;
    case 'matrix':
      body = <MatrixViz formulaId={formulaId} idea={idea} />;
      break;
    case 'matrix_transform':
      body = <MatrixTransformViz formulaId={formulaId} idea={idea} />;
      break;
    case 'geometry':
      body = <GeometryViz formulaId={formulaId} idea={idea} />;
      break;
    case 'truth_table':
      body = <TruthTableViz formulaId={formulaId} idea={idea} />;
      break;
    case 'logic_gate':
      body = <LogicGateViz formulaId={formulaId} idea={idea} />;
      break;
    case 'modular_clock':
      body = <ModularClockViz formulaId={formulaId} idea={idea} />;
      break;
    case 'finite_field':
      body = <FiniteFieldViz formulaId={formulaId} idea={idea} />;
      break;
    case 'polynomial_surface':
      body = <PolynomialSurfaceViz formulaId={formulaId} idea={idea} />;
      break;
    case 'error_correction':
      body = <ErrorCorrectionViz formulaId={formulaId} idea={idea} />;
      break;
    default:
      body = (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm text-[var(--fg-muted)]">
          {v.fallbackViz} <code>{type}</code>: {visual.concept}
        </div>
      );
  }

  return (
    <section className="animate-rise" style={{ animationDelay: '90ms' }}>
      {title ? (
        <h2 className="font-display mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      ) : null}
      {visual.learningObjective ? (
        <p className="mb-3 text-sm leading-relaxed text-[var(--fg-muted)]">{visual.learningObjective}</p>
      ) : null}
      {body}
    </section>
  );
}

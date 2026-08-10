'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { FormulaVisual } from '@repo/shared-types';
import { InlineMarkdown } from '@/components/content/InlineMarkdown';
import { useVizLabels } from '@/lib/viz-labels';
import { resolveMode } from '@/lib/viz-modes';
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
  const t = useTranslations('formula');
  const guide = visual.idea || visual.concept;
  const type = visual.type;
  const mode = resolveMode(formulaId, type, visual.mode);

  // Guide copy lives above the panel; viz captions keep only live feedback.
  let body: ReactNode;
  switch (type) {
    case 'number_line':
      body = <NumberLineViz formulaId={formulaId} />;
      break;
    case 'algebra_tiles':
      body = <AlgebraTilesViz formulaId={formulaId} mode={mode} />;
      break;
    case 'graph':
      body = <GraphViz formulaId={formulaId} mode={mode} />;
      break;
    case 'function_transform':
      body = <FunctionTransformViz formulaId={formulaId} />;
      break;
    case 'vector':
      body = <VectorViz formulaId={formulaId} mode={mode} />;
      break;
    case 'vector_space':
      body = <VectorSpaceViz formulaId={formulaId} />;
      break;
    case 'matrix':
      body = <MatrixViz formulaId={formulaId} mode={mode} />;
      break;
    case 'matrix_transform':
      body = <MatrixTransformViz formulaId={formulaId} mode={mode} />;
      break;
    case 'geometry':
      body = <GeometryViz formulaId={formulaId} mode={mode} />;
      break;
    case 'truth_table':
      body = <TruthTableViz formulaId={formulaId} mode={mode} />;
      break;
    case 'logic_gate':
      body = <LogicGateViz formulaId={formulaId} />;
      break;
    case 'modular_clock':
      body = <ModularClockViz formulaId={formulaId} mode={mode} />;
      break;
    case 'finite_field':
      body = <FiniteFieldViz formulaId={formulaId} />;
      break;
    case 'polynomial_surface':
      body = <PolynomialSurfaceViz formulaId={formulaId} />;
      break;
    case 'error_correction':
      body = <ErrorCorrectionViz formulaId={formulaId} />;
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
        <p className="mb-2 text-sm leading-relaxed text-[var(--fg)]">
          <InlineMarkdown text={visual.learningObjective} />
        </p>
      ) : null}
      {guide ? (
        <p className="mb-3 text-sm leading-relaxed text-[var(--fg-muted)]">
          <span className="font-medium text-[var(--fg)]">{t('vizTry')} — </span>
          <InlineMarkdown text={guide} />
        </p>
      ) : null}
      {body}
    </section>
  );
}

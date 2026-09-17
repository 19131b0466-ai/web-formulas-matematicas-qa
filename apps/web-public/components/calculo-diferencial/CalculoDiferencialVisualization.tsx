'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export type DifVizType =
  | 'limit_explorer'
  | 'tangent_line'
  | 'derivative_from_graph'
  | 'taylor_approximation'
  | 'continuity_checker'
  | 'intermediate_value'
  | 'product_rule'
  | 'chain_rule'
  | 'log_diff'
  | 'mean_value_theorem'
  | 'concavity_analyzer'
  | 'optimization_scenario'
  | 'linear_approximation'
  | 'lhopital_explorer'
  | 'implicit_curve'
  | 'related_rates'
  | 'asymptote_explorer'
  | 'derivation_decision_tree';

type VizProps = { mode?: string };

type Props = {
  type: DifVizType | string;
  concept?: string;
  mode?: string;
  formulaId?: string;
};

function viz(loader: () => Promise<{ default: ComponentType<VizProps> }>) {
  return dynamic(loader, {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]" />
    ),
  });
}

const LimitExplorerViz = viz(() =>
  import('./viz/LimitExplorerViz').then((m) => ({ default: m.LimitExplorerViz })),
);
const TangentLineViz = viz(() =>
  import('./viz/TangentLineViz').then((m) => ({ default: m.TangentLineViz })),
);
const DerivativeFromGraphViz = viz(() =>
  import('./viz/DerivativeFromGraphViz').then((m) => ({ default: m.DerivativeFromGraphViz })),
);
const TaylorApproximationViz = viz(() =>
  import('@/components/calculo/viz/TaylorSeriesViz').then((m) => ({ default: m.TaylorSeriesViz })),
);
const ContinuityCheckerViz = viz(() =>
  import('./viz/ContinuityCheckerViz').then((m) => ({ default: m.ContinuityCheckerViz })),
);
const IntermediateValueViz = viz(() =>
  import('./viz/IntermediateValueViz').then((m) => ({ default: m.IntermediateValueViz })),
);
const ProductRuleViz = viz(() =>
  import('./viz/ProductRuleViz').then((m) => ({ default: m.ProductRuleViz })),
);
const ChainRuleViz = viz(() =>
  import('./viz/ChainRuleViz').then((m) => ({ default: m.ChainRuleViz })),
);
const LogDiffViz = viz(() =>
  import('./viz/LogDiffViz').then((m) => ({ default: m.LogDiffViz })),
);
const MeanValueTheoremViz = viz(() =>
  import('./viz/MeanValueTheoremViz').then((m) => ({ default: m.MeanValueTheoremViz })),
);
const ConcavityAnalyzerViz = viz(() =>
  import('./viz/ConcavityAnalyzerViz').then((m) => ({ default: m.ConcavityAnalyzerViz })),
);
const OptimizationScenarioViz = viz(() =>
  import('./viz/OptimizationScenarioViz').then((m) => ({ default: m.OptimizationScenarioViz })),
);
const LinearApproximationViz = viz(() =>
  import('./viz/LinearApproximationViz').then((m) => ({ default: m.LinearApproximationViz })),
);
const LhopitalExplorerViz = viz(() =>
  import('./viz/LhopitalExplorerViz').then((m) => ({ default: m.LhopitalExplorerViz })),
);
const ImplicitCurveViz = viz(() =>
  import('./viz/ImplicitCurveViz').then((m) => ({ default: m.ImplicitCurveViz })),
);
const RelatedRatesViz = viz(() =>
  import('./viz/RelatedRatesViz').then((m) => ({ default: m.RelatedRatesViz })),
);
const AsymptoteExplorerViz = viz(() =>
  import('./viz/AsymptoteExplorerViz').then((m) => ({ default: m.AsymptoteExplorerViz })),
);
const DerivationDecisionTreeViz = viz(() =>
  import('./viz/DerivationDecisionTreeViz').then((m) => ({ default: m.DerivationDecisionTreeViz })),
);

export function CalculoDiferencialVisualization({ type, concept, mode }: Props) {
  const t = useTranslations('seo');
  let body: ReactNode;

  switch (type) {
    case 'limit_explorer':
      body = <LimitExplorerViz mode={mode} />;
      break;
    case 'tangent_line':
      body = <TangentLineViz mode={mode} />;
      break;
    case 'derivative_from_graph':
      body = <DerivativeFromGraphViz mode={mode} />;
      break;
    case 'taylor_approximation':
      body = <TaylorApproximationViz />;
      break;
    case 'continuity_checker':
      body = <ContinuityCheckerViz mode={mode} />;
      break;
    case 'intermediate_value':
      body = <IntermediateValueViz />;
      break;
    case 'product_rule':
      body = <ProductRuleViz />;
      break;
    case 'chain_rule':
      body = <ChainRuleViz />;
      break;
    case 'log_diff':
      body = <LogDiffViz />;
      break;
    case 'mean_value_theorem':
      body = <MeanValueTheoremViz mode={mode} />;
      break;
    case 'concavity_analyzer':
      body = <ConcavityAnalyzerViz />;
      break;
    case 'optimization_scenario':
      body = <OptimizationScenarioViz mode={mode} />;
      break;
    case 'linear_approximation':
      body = <LinearApproximationViz />;
      break;
    case 'lhopital_explorer':
      body = <LhopitalExplorerViz />;
      break;
    case 'implicit_curve':
      body = <ImplicitCurveViz mode={mode} />;
      break;
    case 'related_rates':
      body = <RelatedRatesViz mode={mode} />;
      break;
    case 'asymptote_explorer':
      body = <AsymptoteExplorerViz />;
      break;
    case 'derivation_decision_tree':
      body = <DerivationDecisionTreeViz />;
      break;
    default:
      body = (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm text-[var(--fg-muted)]">
          {t('comingSoonViz', { type: concept ? `${type}: ${concept}` : type })}
        </div>
      );
  }

  return (
    <section className="animate-rise" style={{ animationDelay: '90ms' }}>
      {body}
    </section>
  );
}

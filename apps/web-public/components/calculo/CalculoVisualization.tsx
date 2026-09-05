'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Visualization types for the Cálculo Integral course.
 */
export type CalcVizType =
  | 'riemann_sum'
  | 'tfc_accumulation'
  | 'solids_of_revolution'
  | 'taylor_series'
  | 'direction_field'
  | 'signed_area'
  | 'trig_substitution'
  | 'improper_integral'
  | 'parametric_curve'
  | 'polar_grid'
  | 'series_partial_sums'
  | 'substitution_viz'
  | 'integration_by_parts'
  | 'area_between_curves'
  | 'arc_length'
  | 'numerical_integration'
  | 'integration_decision_tree'
  | 'antiderivative_explorer'
  | 'average_value'
  | 'shell_method'
  | 'work_integral'
  | 'parametric_tangent'
  | 'polar_area'
  | 'sequence_convergence'
  | 'integral_test'
  | 'radius_of_convergence'
  | 'separable_ode'
  | 'population_model';

type Props = {
  type: CalcVizType | string;
  concept?: string;
  formulaId?: string;
};

function viz(loader: () => Promise<{ default: ComponentType }>) {
  return dynamic(loader, {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]" />
    ),
  });
}

const RiemannSumViz = viz(() =>
  import('./viz/RiemannSumViz').then((m) => ({ default: m.RiemannSumViz })),
);
const TFCAccumulationViz = viz(() =>
  import('./viz/TFCAccumulationViz').then((m) => ({ default: m.TFCAccumulationViz })),
);
const SolidsOfRevolutionViz = viz(() =>
  import('./viz/SolidsOfRevolutionViz').then((m) => ({ default: m.SolidsOfRevolutionViz })),
);
const TaylorSeriesViz = viz(() =>
  import('./viz/TaylorSeriesViz').then((m) => ({ default: m.TaylorSeriesViz })),
);
const DirectionFieldViz = viz(() =>
  import('./viz/DirectionFieldViz').then((m) => ({ default: m.DirectionFieldViz })),
);
const SignedAreaViz = viz(() =>
  import('./viz/SignedAreaViz').then((m) => ({ default: m.SignedAreaViz })),
);
const TrigSubstitutionViz = viz(() =>
  import('./viz/TrigSubstitutionViz').then((m) => ({ default: m.TrigSubstitutionViz })),
);
const ImproperIntegralViz = viz(() =>
  import('./viz/ImproperIntegralViz').then((m) => ({ default: m.ImproperIntegralViz })),
);
const ParametricCurveViz = viz(() =>
  import('./viz/ParametricCurveViz').then((m) => ({ default: m.ParametricCurveViz })),
);
const PolarGridViz = viz(() =>
  import('./viz/PolarGridViz').then((m) => ({ default: m.PolarGridViz })),
);
const SeriesPartialSumsViz = viz(() =>
  import('./viz/SeriesPartialSumsViz').then((m) => ({ default: m.SeriesPartialSumsViz })),
);
const SubstitutionViz = viz(() =>
  import('./viz/SubstitutionViz').then((m) => ({ default: m.SubstitutionViz })),
);
const IntegrationByPartsViz = viz(() =>
  import('./viz/IntegrationByPartsViz').then((m) => ({ default: m.IntegrationByPartsViz })),
);
const AreaBetweenCurvesViz = viz(() =>
  import('./viz/AreaBetweenCurvesViz').then((m) => ({ default: m.AreaBetweenCurvesViz })),
);
const ArcLengthViz = viz(() =>
  import('./viz/ArcLengthViz').then((m) => ({ default: m.ArcLengthViz })),
);
const NumericalIntegrationViz = viz(() =>
  import('./viz/NumericalIntegrationViz').then((m) => ({ default: m.NumericalIntegrationViz })),
);
const IntegrationDecisionTreeViz = viz(() =>
  import('./viz/IntegrationDecisionTreeViz').then((m) => ({
    default: m.IntegrationDecisionTreeViz,
  })),
);
const AntiderivativeExplorerViz = viz(() =>
  import('./viz/AntiderivativeExplorerViz').then((m) => ({ default: m.AntiderivativeExplorerViz })),
);
const AverageValueViz = viz(() =>
  import('./viz/AverageValueViz').then((m) => ({ default: m.AverageValueViz })),
);
const ShellMethodViz = viz(() =>
  import('./viz/ShellMethodViz').then((m) => ({ default: m.ShellMethodViz })),
);
const WorkIntegralViz = viz(() =>
  import('./viz/WorkIntegralViz').then((m) => ({ default: m.WorkIntegralViz })),
);
const ParametricTangentViz = viz(() =>
  import('./viz/ParametricTangentViz').then((m) => ({ default: m.ParametricTangentViz })),
);
const PolarAreaViz = viz(() =>
  import('./viz/PolarAreaViz').then((m) => ({ default: m.PolarAreaViz })),
);
const SequenceConvergenceViz = viz(() =>
  import('./viz/SequenceConvergenceViz').then((m) => ({ default: m.SequenceConvergenceViz })),
);
const IntegralTestViz = viz(() =>
  import('./viz/IntegralTestViz').then((m) => ({ default: m.IntegralTestViz })),
);
const RadiusOfConvergenceViz = viz(() =>
  import('./viz/RadiusOfConvergenceViz').then((m) => ({ default: m.RadiusOfConvergenceViz })),
);
const SeparableODEViz = viz(() =>
  import('./viz/SeparableODEViz').then((m) => ({ default: m.SeparableODEViz })),
);
const PopulationModelViz = dynamic(
  () => import('./viz/PopulationModelViz').then((m) => ({ default: m.PopulationModelViz })),
  {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]" />
    ),
  },
);

export function CalculoVisualization({ type, concept, formulaId }: Props) {
  const t = useTranslations('seo');
  let body: ReactNode;

  switch (type) {
    case 'riemann_sum':
      body = <RiemannSumViz />;
      break;
    case 'tfc_accumulation':
      body = <TFCAccumulationViz />;
      break;
    case 'solids_of_revolution':
      body = <SolidsOfRevolutionViz />;
      break;
    case 'taylor_series':
      body = <TaylorSeriesViz />;
      break;
    case 'direction_field':
      body = <DirectionFieldViz />;
      break;
    case 'signed_area':
      body = <SignedAreaViz />;
      break;
    case 'trig_substitution':
      body = <TrigSubstitutionViz />;
      break;
    case 'improper_integral':
      body = <ImproperIntegralViz />;
      break;
    case 'parametric_curve':
      body = <ParametricCurveViz />;
      break;
    case 'polar_grid':
      body = <PolarGridViz />;
      break;
    case 'series_partial_sums':
      body = <SeriesPartialSumsViz />;
      break;
    case 'substitution_viz':
      body = <SubstitutionViz />;
      break;
    case 'integration_by_parts':
      body = <IntegrationByPartsViz />;
      break;
    case 'area_between_curves':
      body = <AreaBetweenCurvesViz />;
      break;
    case 'arc_length':
      body = <ArcLengthViz />;
      break;
    case 'numerical_integration':
      body = <NumericalIntegrationViz />;
      break;
    case 'integration_decision_tree':
      body = <IntegrationDecisionTreeViz />;
      break;
    case 'antiderivative_explorer':
      body = <AntiderivativeExplorerViz />;
      break;
    case 'average_value':
      body = <AverageValueViz />;
      break;
    case 'shell_method':
      body = <ShellMethodViz />;
      break;
    case 'work_integral':
      body = <WorkIntegralViz />;
      break;
    case 'parametric_tangent':
      body = <ParametricTangentViz />;
      break;
    case 'polar_area':
      body = <PolarAreaViz />;
      break;
    case 'sequence_convergence':
      body = <SequenceConvergenceViz />;
      break;
    case 'integral_test':
      body = <IntegralTestViz />;
      break;
    case 'radius_of_convergence':
      body = <RadiusOfConvergenceViz />;
      break;
    case 'separable_ode':
      body = <SeparableODEViz />;
      break;
    case 'population_model':
      body = (
        <PopulationModelViz initialMode={formulaId === 'INT-163' ? 'grow' : 'logistic'} />
      );
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

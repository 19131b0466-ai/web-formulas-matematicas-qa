/**
 * Interactive viz for Cálculo II.
 *
 * Formula-hosted: one defining INT-### (same idea as algebra: the graphic lives on
 * the related formula detail, not on every sibling card).
 * Section-hosted: only when the graphic is a topic overview with no single formula
 * (EDO slope field, integration method guide). Rendered after the formulas.
 */
export type CalculoSectionViz = {
  type: string;
  concept: string;
};

export const CALCULO_VIZ_BY_FORMULA_ID: Record<string, CalculoSectionViz> = {
  'INT-009': {
    type: 'antiderivative_explorer',
    concept: 'f(x) y su antiderivada F(x), con F′(x) = f(x)',
  },
  'INT-014': {
    type: 'riemann_sum',
    concept: 'Sumas de Riemann y el límite que define la integral definida',
  },
  'INT-022': {
    type: 'tfc_accumulation',
    concept: 'Función acumulada G(x) = ∫ₐˣ f y el Teorema Fundamental',
  },
  'INT-027': {
    type: 'signed_area',
    concept: 'Área con signo frente al área geométrica ∫|f|',
  },
  'INT-028': {
    type: 'average_value',
    concept: 'Valor promedio de f en [a, b] y el rectángulo equivalente',
  },
  'INT-030': {
    type: 'substitution_viz',
    concept: 'Sustitución u = g(x) y el cambio de variable',
  },
  'INT-037': {
    type: 'integration_by_parts',
    concept: 'Integración por partes: ∫ u dv = uv − ∫ v du',
  },
  'INT-071': {
    type: 'trig_substitution',
    concept: 'Triángulos de referencia para √(a²±x²) y √(x²−a²)',
  },
  'INT-085': {
    type: 'improper_integral',
    concept: 'Integrales impropias con límite infinito',
  },
  'INT-092': {
    type: 'area_between_curves',
    concept: 'Área entre dos curvas',
  },
  'INT-096': {
    type: 'solids_of_revolution',
    concept: 'Volumen por discos y arandelas',
  },
  'INT-098': {
    type: 'shell_method',
    concept: 'Volumen por capas cilíndricas',
  },
  'INT-100': {
    type: 'arc_length',
    concept: 'Longitud de arco como límite de una poligonal',
  },
  'INT-104': {
    type: 'work_integral',
    concept: 'Trabajo como integral de una fuerza variable',
  },
  'INT-112': {
    type: 'riemann_sum',
    concept: 'Sumas izquierda, derecha y punto medio',
  },
  'INT-115': {
    type: 'numerical_integration',
    concept: 'Regla del trapecio y de Simpson',
  },
  'INT-120': {
    type: 'parametric_curve',
    concept: 'Trazado de curvas paramétricas (x(t), y(t))',
  },
  'INT-121': {
    type: 'parametric_tangent',
    concept: 'Pendiente dy/dx = (dy/dt)/(dx/dt) en una curva paramétrica',
  },
  'INT-126': {
    type: 'polar_grid',
    concept: 'Curvas en coordenadas polares r = f(θ)',
  },
  'INT-129': {
    type: 'polar_area',
    concept: 'Área en coordenadas polares',
  },
  'INT-132': {
    type: 'sequence_convergence',
    concept: 'Convergencia de sucesiones',
  },
  'INT-133': {
    type: 'series_partial_sums',
    concept: 'Series y sumas parciales',
  },
  'INT-140': {
    type: 'integral_test',
    concept: 'Criterio integral para series',
  },
  'INT-148': {
    type: 'radius_of_convergence',
    concept: 'Serie de potencias: radio e intervalo de convergencia',
  },
  'INT-151': {
    type: 'taylor_series',
    concept: 'Polinomios de Taylor',
  },
  'INT-161': {
    type: 'separable_ode',
    concept: 'Ecuaciones de variables separables',
  },
  'INT-163': {
    type: 'population_model',
    concept: 'Crecimiento y decaimiento exponencial',
  },
};

/** Topic overviews with no single defining formula. */
export const CALCULO_VIZ_BY_SECTION_NUMBER: Record<string, CalculoSectionViz> = {
  '16': {
    type: 'direction_field',
    concept: 'Campo de pendientes de una EDO',
  },
  '17': {
    type: 'integration_decision_tree',
    concept: 'Cómo elegir un método de integración',
  },
};

export function calculoVizForFormulaId(formulaId: string): CalculoSectionViz | undefined {
  return CALCULO_VIZ_BY_FORMULA_ID[formulaId];
}

export function calculoVizForSectionNumber(number: string): CalculoSectionViz | undefined {
  return CALCULO_VIZ_BY_SECTION_NUMBER[number];
}

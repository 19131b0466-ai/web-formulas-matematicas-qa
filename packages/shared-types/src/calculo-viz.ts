/**
 * Maps Cálculo II section numbers (from `formulas-calculo-ii.md`) to interactive viz types.
 * Used by the public site (section + formula pages) and by the markdown enricher.
 */
export type CalculoSectionViz = {
  type: string;
  concept: string;
};

export const CALCULO_VIZ_BY_SECTION_NUMBER: Record<string, CalculoSectionViz> = {
  '2.2': {
    type: 'antiderivative_explorer',
    concept: 'f(x) y su antiderivada F(x), con F′(x) = f(x)',
  },
  '2.3': {
    type: 'antiderivative_explorer',
    concept: 'Comprobar una antiderivada derivando: F′(x) = f(x)',
  },
  '3.1': {
    type: 'riemann_sum',
    concept: 'Sumas de Riemann y el límite que define la integral definida',
  },
  '3.3': {
    type: 'tfc_accumulation',
    concept: 'Función acumulada G(x) = ∫ₐˣ f y el Teorema Fundamental',
  },
  '3.4': {
    type: 'signed_area',
    concept: 'Área con signo frente al área geométrica ∫|f|',
  },
  '3.5': {
    type: 'average_value',
    concept: 'Valor promedio de f en [a, b] y el rectángulo equivalente',
  },
  '4': {
    type: 'substitution_viz',
    concept: 'Sustitución u = g(x) y el cambio de variable',
  },
  '4.1': {
    type: 'substitution_viz',
    concept: 'Procedimiento de sustitución u',
  },
  '4.2': {
    type: 'substitution_viz',
    concept: 'Sustitución en integrales definidas: límites g(a) y g(b)',
  },
  '5': {
    type: 'integration_by_parts',
    concept: 'Integración por partes: ∫ u dv = uv − ∫ v du',
  },
  '5.1': {
    type: 'integration_by_parts',
    concept: 'Elección de u (LIATE) en integración por partes',
  },
  '7.1': {
    type: 'trig_substitution',
    concept: 'Triángulos de referencia para √(a²±x²) y √(x²−a²)',
  },
  '9.1': {
    type: 'improper_integral',
    concept: 'Integrales impropias con límite infinito',
  },
  '9.3': {
    type: 'improper_integral',
    concept: 'Integrales tipo p y convergencia',
  },
  '10.1': {
    type: 'area_between_curves',
    concept: 'Área entre dos curvas',
  },
  '10.3': {
    type: 'solids_of_revolution',
    concept: 'Volumen por discos y arandelas',
  },
  '10.4': {
    type: 'shell_method',
    concept: 'Volumen por capas cilíndricas',
  },
  '10.5': {
    type: 'arc_length',
    concept: 'Longitud de arco como límite de una poligonal',
  },
  '10.7': {
    type: 'work_integral',
    concept: 'Trabajo como integral de una fuerza variable',
  },
  '11.1': {
    type: 'riemann_sum',
    concept: 'Sumas izquierda, derecha y punto medio',
  },
  '11.2': {
    type: 'numerical_integration',
    concept: 'Regla del trapecio',
  },
  '11.3': {
    type: 'numerical_integration',
    concept: 'Regla de Simpson',
  },
  '12': {
    type: 'parametric_curve',
    concept: 'Trazado de curvas paramétricas (x(t), y(t))',
  },
  '12.1': {
    type: 'parametric_tangent',
    concept: 'Pendiente dy/dx = (dy/dt)/(dx/dt) en una curva paramétrica',
  },
  '13': {
    type: 'polar_grid',
    concept: 'Curvas en coordenadas polares r = f(θ)',
  },
  '13.1': {
    type: 'polar_grid',
    concept: 'Pendiente de una curva polar',
  },
  '13.2': {
    type: 'polar_area',
    concept: 'Área en coordenadas polares',
  },
  '14.1': {
    type: 'sequence_convergence',
    concept: 'Convergencia de sucesiones',
  },
  '14.2': {
    type: 'series_partial_sums',
    concept: 'Series y sumas parciales',
  },
  '14.3': {
    type: 'series_partial_sums',
    concept: 'Serie geométrica y suma de la serie',
  },
  '14.6': {
    type: 'integral_test',
    concept: 'Criterio integral para series',
  },
  '15.1': {
    type: 'radius_of_convergence',
    concept: 'Serie de potencias: radio e intervalo de convergencia',
  },
  '15.3': {
    type: 'taylor_series',
    concept: 'Polinomios de Taylor',
  },
  '15.5': {
    type: 'taylor_series',
    concept: 'Series de Maclaurin fundamentales',
  },
  '16': {
    type: 'direction_field',
    concept: 'Campo de pendientes de una EDO',
  },
  '16.1': {
    type: 'separable_ode',
    concept: 'Ecuaciones de variables separables',
  },
  '16.2': {
    type: 'population_model',
    concept: 'Crecimiento y decaimiento exponencial',
  },
  '16.3': {
    type: 'population_model',
    concept: 'Modelo logístico',
  },
  '17': {
    type: 'integration_decision_tree',
    concept: 'Cómo elegir un método de integración',
  },
  '17.1': {
    type: 'integration_decision_tree',
    concept: 'Orden práctico de revisión de técnicas',
  },
};

export function calculoVizForSectionNumber(number: string): CalculoSectionViz | undefined {
  return CALCULO_VIZ_BY_SECTION_NUMBER[number];
}

/**
 * Interactive viz for Cálculo Diferencial.
 *
 * Formula-hosted: one defining DIF-### per viz (same pattern as calculo-viz / fisica-viz).
 * Section-hosted: reserved for guía de métodos (§16) in a later phase.
 */

export type CalculoDiferencialSectionViz = {
  type: string;
  concept: string;
  mode?: string;
};

function v(type: string, concept: string, mode?: string): CalculoDiferencialSectionViz {
  return mode ? { type, concept, mode } : { type, concept };
}

export const CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID: Record<string, CalculoDiferencialSectionViz> = {
  // §2 Límites (Fase 1)
  'DIF-011': v(
    'limit_explorer',
    'Aproximación informal: f(x) se acerca a L cuando x se acerca a a',
    'informal',
  ),
  'DIF-012': v(
    'limit_explorer',
    'Definición ε-δ: bandas de tolerancia alrededor de L y de a',
    'epsilon_delta',
  ),
  'DIF-013': v(
    'limit_explorer',
    'Límites laterales: comparar L⁻ y L⁺ para decidir si existe el bilateral',
    'lateral',
  ),
  'DIF-020': v(
    'limit_explorer',
    'Límite notable: sen(x)/x → 1 cuando x → 0',
    'notable',
  ),
  'DIF-024': v(
    'limit_explorer',
    'Definición del número e: (1+x)^(1/x) → e cuando x → 0',
    'e_definition',
  ),
  // §3 Continuidad (Fase 1)
  'DIF-030': v(
    'continuity_checker',
    'Continuidad en a: el límite coincide con f(a)',
    'definition',
  ),
  'DIF-032': v(
    'continuity_checker',
    'Tipos de discontinuidad: removible, salto e infinita',
    'discontinuity',
  ),
  'DIF-031': v(
    'intermediate_value',
    'Teorema del valor intermedio: una curva continua alcanza todo valor entre f(a) y f(b)',
  ),
  // §4 Derivada geométrica (Fase 2)
  'DIF-038': v(
    'limit_explorer',
    'Cociente incremental: la secante tiende a la tangente cuando h → 0',
    'secante',
  ),
  'DIF-040': v(
    'tangent_line',
    'Recta tangente y pendiente f′(a) en un punto deslizable',
    'tangent',
  ),
  'DIF-041': v(
    'tangent_line',
    'Recta normal perpendicular a la tangente; pendiente −1/f′(a)',
    'normal',
  ),
  'DIF-043': v(
    'derivative_from_graph',
    'Posición s(t) y velocidad v(t)=s′(t) sincronizadas',
    'kinematics',
  ),
  'DIF-044': v(
    'derivative_from_graph',
    'Posición, velocidad y aceleración como derivadas sucesivas',
    'kinematics_accel',
  ),
  // §5 Reglas de derivación (Fase 3)
  'DIF-051': v(
    'product_rule',
    'Regla del producto: (fg)′ = f′g + fg′ con términos coloreados',
  ),
  'DIF-054': v(
    'chain_rule',
    'Regla de la cadena: (f∘g)′(x) = f′(g(x)) · g′(x)',
  ),
  'DIF-074': v(
    'log_diff',
    'Derivación logarítmica: de y = f(x)^g(x) a y′ paso a paso',
  ),
  // §7 Teorema del valor medio (Fase 4)
  'DIF-081': v(
    'mean_value_theorem',
    'Teorema de Rolle: tangente horizontal cuando f(a)=f(b)',
    'rolle',
  ),
  'DIF-082': v(
    'mean_value_theorem',
    'Teorema del valor medio: tangente paralela a la secante en algún c',
    'mvt',
  ),
  // §8 Análisis de funciones (Fase 4)
  'DIF-089': v(
    'concavity_analyzer',
    'Gráficas de f, f′ y f″: crecimiento, concavidad y puntos críticos',
  ),
  // §9 Optimización (Fase 5)
  'DIF-098': v(
    'optimization_scenario',
    'Área máxima con perímetro fijo: rectángulo → cuadrado',
    'rectangle',
  ),
  'DIF-099': v(
    'optimization_scenario',
    'Volumen máximo de cilindro con superficie fija',
    'cylinder',
  ),
  // §10 Aproximación lineal (Fase 5)
  'DIF-102': v(
    'linear_approximation',
    'Aproximación lineal L(x)=f(a)+f′(a)(x−a) y error',
  ),
  // §11 Taylor (Fase 0)
  'DIF-106': v('taylor_approximation', 'Polinomio de Taylor: aproximación local de f cerca de a'),
  // §12 L'Hôpital (Fase 5)
  'DIF-114': v(
    'lhopital_explorer',
    'Cociente f/g vs f′/g′ al acercarse al punto de indeterminación',
  ),
  // §13 Implícitas (Fase 5)
  'DIF-121': v(
    'implicit_curve',
    'Circunferencia x²+y²=r² con tangente vía dy/dx=−x/y',
    'circle',
  ),
  // §14 Tasas relacionadas (Fase 5)
  'DIF-124': v(
    'related_rates',
    'Esfera inflándose: dV/dt y dr/dt enlazados',
    'sphere',
  ),
  // §15 Asíntotas (Fase 5)
  'DIF-128': v(
    'asymptote_explorer',
    'Asíntotas vertical, horizontal y oblicua en una racional',
  ),
};

/** Topic overviews with no single defining formula (§16 guía de métodos). */
export const CALCULO_DIFERENCIAL_VIZ_BY_SECTION_NUMBER: Record<string, CalculoDiferencialSectionViz> = {
  '16': v(
    'derivation_decision_tree',
    'Señal en la función → técnica de derivación o análisis',
  ),
};

export function calculoDiferencialVizForFormulaId(
  formulaId: string,
): CalculoDiferencialSectionViz | undefined {
  return CALCULO_DIFERENCIAL_VIZ_BY_FORMULA_ID[formulaId];
}

export function calculoDiferencialVizForSectionNumber(
  number: string,
): CalculoDiferencialSectionViz | undefined {
  return CALCULO_DIFERENCIAL_VIZ_BY_SECTION_NUMBER[number];
}

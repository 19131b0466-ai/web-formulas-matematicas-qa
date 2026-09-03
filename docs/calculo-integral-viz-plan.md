# Recursos Gráficos para el Curso de Cálculo Integral

Propuesta de visualizaciones interactivas por tema, siguiendo el mismo modelo implementado en el curso de Álgebra (componentes React/TSX con controles interactivos, canvas SVG y animaciones).

---

## Sección 2 — Integral Indefinida y Propiedades

### 2.1 Linealidad de la integral
**Tipo sugerido:** `function_graph`  
**Descripción:** Dos sliders controlan las constantes α y β. Se grafican `f(x)`, `g(x)` y `αf(x) + βg(x)` superpuestas con colores distintos. El área sombreada bajo cada curva actualiza en tiempo real para que el estudiante vea que el área total es la suma ponderada de las áreas individuales.

### 2.2 Reglas elementales (tabla de antiderivadas básicas)
**Tipo sugerido:** `antiderivative_explorer`  
**Descripción:** Selector de función (xⁿ, eˣ, sen x, cos x, 1/x, etc.). Se grafican simultáneamente `f(x)` y su antiderivada `F(x)`. Un punto deslizable en la curva de `f` muestra el valor instantáneo de la pendiente de `F`, reforzando la relación `F'(x) = f(x)`.

---

## Sección 3 — Integral Definida y Teorema Fundamental del Cálculo

### 3.1 Sumas de Riemann
**Tipo sugerido:** `riemann_sum`  
**Descripción:** Panel principal con la gráfica de `f(x)` sobre `[a, b]`. Sliders para `a`, `b` y el número de subintervalos `n`. Selector de tipo de suma: izquierda, derecha, punto medio, trapezoidal. Los rectángulos (o trapecios) se dibujan y actualizan animadamente. Se muestra el valor numérico de la suma y su convergencia al valor exacto conforme `n → ∞`. Recurso visual central de todo el curso.

### 3.3 Teorema Fundamental del Cálculo — Parte I
**Tipo sugerido:** `tfc_accumulation`  
**Descripción:** Se grafica `f(t)` fija. Un punto móvil `x` sobre el eje horizontal actúa como límite superior de integración. El área sombreada bajo `f(t)` desde `a` hasta `x` se acumula visualmente mientras `x` se desplaza. Una segunda gráfica muestra en tiempo real la función acumulada `G(x) = ∫_a^x f(t) dt`, y se marca que `G'(x) = f(x)`. Ideal para hacer intuitivo el TFC I.

### 3.4 Área con signo vs. área geométrica
**Tipo sugerido:** `signed_area`  
**Descripción:** Gráfica de `f(x)` sobre `[a, b]` con regiones positivas (sombreado verde) y negativas (sombreado rojo). Se muestran dos valores numéricos: la integral con signo y el área geométrica total `∫|f(x)|dx`. Sliders para `a` y `b`. Permite ver claramente por qué una función que oscila puede tener integral cero aunque tenga área geométrica positiva.

### 3.5 Valor promedio
**Tipo sugerido:** `average_value`  
**Descripción:** Gráfica de `f(x)` sobre `[a, b]`. Se dibuja una línea horizontal `y = f_prom` y se resalta el punto `c` donde `f(c) = f_prom` (Teorema del Valor Medio para Integrales). El rectángulo de altura `f_prom` y base `b-a` tiene la misma área que la región bajo `f`.

---

## Sección 4 — Método de Sustitución

### 4.1 Sustitución u
**Tipo sugerido:** `substitution_viz`  
**Descripción:** Panel de dos ejes: eje `x` (integral original) y eje `u` (integral transformada). El usuario elige `u = g(x)` desde un selector de ejemplos. La gráfica del integrando `f(g(x))g'(x)` en `x` se transforma y aparece como `f(u)` en el eje `u`. La región de integración `[a,b]` se convierte a `[g(a), g(b)]` con animación. Refuerza visualmente el cambio de variable.

---

## Sección 5 — Integración por Partes

### 5.1 Interpretación geométrica de ∫u dv + ∫v du = uv
**Tipo sugerido:** `parts_geometry`  
**Descripción:** Diagrama rectangular clásico: un rectángulo de lados `u(x)` y `v(x)`. Las dos áreas complementarias bajo las curvas `v(u)` y `u(v)` muestran visualmente que `∫u dv + ∫v du = uv`. Sliders para desplazar el punto `(u, v)` a lo largo de las curvas paramétricas.

### 5.2 Tabla LIATE y elección de u
**Tipo sugerido:** `liate_guide`  
**Descripción:** Árbol de decisión interactivo. El usuario selecciona el tipo de integrando (producto de funciones) y el diagrama sugiere qué elegir como `u` según la regla LIATE, mostrando el resultado de aplicar por partes una o dos veces.

---

## Sección 6 — Integrales Trigonométricas

### 6.1 Potencias de seno y coseno
**Tipo sugerido:** `trig_integral`  
**Descripción:** Gráfica de `senⁿ(x) cosᵐ(x)`. Sliders para `n` y `m` (enteros 1–8). Se colorea el área bajo la curva en `[0, 2π]`. Se muestra la identidad de reducción utilizada (paridad de los exponentes) y el resultado analítico. Permite ver el efecto de cambiar la paridad de los exponentes.

---

## Sección 7 — Sustitución Trigonométrica

### 7.1 Los tres triángulos de referencia
**Tipo sugerido:** `trig_substitution`  
**Descripción:** Tres fichas seleccionables: `√(a²−x²)`, `√(a²+x²)`, `√(x²−a²)`. Cada una muestra el triángulo rectángulo de referencia con las sustituciones (`x = a senθ`, `x = a tanθ`, `x = a secθ`). Un slider para `θ` mueve el punto sobre la circunferencia o hipérbola asociada, actualizando los lados del triángulo y la expresión simplificada.

---

## Sección 8 — Funciones Racionales y Fracciones Parciales

### 8.1 Descomposición en fracciones parciales
**Tipo sugerido:** `partial_fractions`  
**Descripción:** El usuario selecciona un denominador polinomial (factores lineales, cuadráticos irreducibles, repetidos). Se muestra la descomposición como ecuación y se grafican simultáneamente la función original y cada fracción parcial, mostrando que son su suma.

---

## Sección 9 — Integrales Impropias

### 9.1 Convergencia con límite infinito
**Tipo sugerido:** `improper_integral`  
**Descripción:** Gráfica de `f(x) = 1/xᵖ` (parámetro `p` con slider). Un límite superior `b → ∞` se desplaza y el área sombreada crece. Una segunda gráfica muestra la función de área acumulada `A(b)`. El estudiante ve visualmente cuándo converge (`p > 1`) y cuándo diverge (`p ≤ 1`).

### 9.2 Convergencia en discontinuidad interna
**Tipo sugerido:** `improper_singularity`  
**Descripción:** Para `f(x)` con singularidad en `c ∈ (a, b)`, los límites de integración se aproximan a `c` desde ambos lados con animación. Muestra la diferencia entre el límite `lim_{ε→0}` y el valor principal de Cauchy.

---

## Sección 10 — Aplicaciones de la Integral

### 10.1 Área entre dos curvas
**Tipo sugerido:** `area_between_curves`  
**Descripción:** Dos funciones `f(x)` y `g(x)` seleccionables. Se calculan automáticamente sus intersecciones y la región entre ellas se sombrea. Sliders para los límites de integración. Opción para integrar respecto a `x` o respecto a `y`.

### 10.2 Volumen por discos y arandelas (sólidos de revolución)
**Tipo sugerido:** `solids_of_revolution`  
**Descripción:** Vista 3D (proyección isométrica SVG o Three.js) del sólido generado al rotar `f(x)` alrededor del eje `x` o del eje `y`. Slider para el ángulo de rotación (0° a 360°). Un corte transversal muestra el disco o la arandela con su radio `f(x)`. Se muestra la fórmula `V = π∫[f(x)]²dx` con valor numérico actualizado. **Es el recurso más impactante visualmente de todo el curso.**

### 10.3 Volumen por capas cilíndricas (método del cascarón)
**Tipo sugerido:** `shell_method`  
**Descripción:** Animación de una capa cilíndrica fina a radio `x` con altura `f(x)` y grosor `dx`. El slider desplaza el radio y la capa se mueve, llenando el sólido. Contrasta con el método de discos para ayudar al estudiante a elegir el mejor enfoque.

### 10.4 Longitud de arco
**Tipo sugerido:** `arc_length`  
**Descripción:** Gráfica de `f(x)`. Una poligonal de `n` segmentos aproxima la curva. Slider para `n`. Se muestra la longitud de cada segmento `√(1 + (Δy/Δx)²)Δx` y la suma total convergiendo a `∫√(1 + [f'(x)]²)dx`.

### 10.5 Trabajo mecánico
**Tipo sugerido:** `work_integral`  
**Descripción:** Animación de un objeto desplazándose bajo una fuerza variable `F(x)`. Selector de fuerzas (resorte de Hooke, vaciado de tanque, etc.). El área bajo la curva representa el trabajo. Slider para el intervalo de desplazamiento.

---

## Sección 11 — Integración Numérica

### 11.1 Regla del Trapecio y Regla de Simpson
**Tipo sugerido:** `numerical_integration`  
**Descripción:** Extiende la visualización de sumas de Riemann. Modos: Trapecio y Simpson 1/3. Para Simpson se muestran las parábolas que aproximan cada par de subintervalos. Tabla comparativa de error absoluto. Slider para `n`. Muestra que Simpson converge mucho más rápido que el trapecio.

---

## Sección 12 — Curvas Paramétricas

### 12.1 Trazado de curvas paramétricas
**Tipo sugerido:** `parametric_curve`  
**Descripción:** `x(t)` y `y(t)` editables (o selector de ejemplos: cicloides, espirales, curvas de Lissajous, cardioide). Un punto animado recorre la curva conforme `t` avanza. Gráficas paralelas de `x(t)` y `y(t)` vs `t`. Área y longitud de arco paramétrica calculadas en tiempo real.

### 12.2 Tangente a la curva paramétrica
**Tipo sugerido:** `parametric_tangent`  
**Descripción:** Punto deslizable sobre la curva paramétrica con la recta tangente de pendiente `dy/dx = (dy/dt)/(dx/dt)`. Se marcan visualmente los puntos de tangente horizontal (`dy/dt = 0`) y vertical (`dx/dt = 0`).

---

## Sección 13 — Coordenadas Polares

### 13.1 Sistema de coordenadas polares y curvas
**Tipo sugerido:** `polar_grid`  
**Descripción:** Plano polar interactivo. El usuario introduce `r = f(θ)` o selecciona del catálogo (rosas, cardioide, lemniscata, espiral de Arquímedes). La curva se traza animadamente conforme `θ` va de `0` a `2π`. Se muestra la conversión `(r, θ) → (x, y)` para un punto seleccionable.

### 13.2 Área en coordenadas polares
**Tipo sugerido:** `polar_area`  
**Descripción:** Los sectores de área `½r²Δθ` se colorean conforme `θ` aumenta, mostrando la acumulación. Sliders para `α` y `β`. Para área entre dos curvas polares, se colorean las regiones de intersección con distinto tono.

---

## Sección 14 — Sucesiones y Series

### 14.1 Convergencia de sucesiones
**Tipo sugerido:** `sequence_convergence`  
**Descripción:** Gráfica de puntos `(n, aₙ)`. Selector de sucesiones conocidas (1/n, (−1)ⁿ/n, (1+1/n)ⁿ, etc.). Línea horizontal en el límite `L`. Se resaltan los términos dentro de un ε-entorno del límite (visualización de la definición formal).

### 14.2 Series: sumas parciales y convergencia
**Tipo sugerido:** `series_partial_sums`  
**Descripción:** Dos gráficas: la sucesión de términos `aₙ` y la de sumas parciales `Sₙ`. Para la serie geométrica se muestra la suma exacta. Para la armónica, `Sₙ` crece sin límite. Selector de criterios de convergencia: razón, raíz, comparación, integral.

### 14.3 Criterio integral para series
**Tipo sugerido:** `integral_test`  
**Descripción:** Gráfica de `f(x)` continua, positiva y decreciente. Los rectángulos de altura `f(n)` y base 1 se superponen a la curva, mostrando la relación entre `Σaₙ` y `∫f(x)dx`. Selector para `f(x) = 1/xᵖ` con distintos valores de `p` para ilustrar la serie p.

---

## Sección 15 — Series de Potencias y Taylor

### 15.1 Polinomios de Taylor/Maclaurin
**Tipo sugerido:** `taylor_series`  
**Descripción:** Gráfica de `f(x)` (seleccionable: eˣ, senx, cosx, ln(1+x), 1/(1−x), etc.) y su polinomio de Taylor de grado `n` centrado en `a`. Sliders para `n` (1–12) y `a`. El polinomio se actualiza en tiempo real y la zona de buena aproximación se resalta. Gráfica del error `|f(x) − Pₙ(x)|`. **Uno de los recursos más llamativos del curso.**

### 15.2 Radio e intervalo de convergencia
**Tipo sugerido:** `radius_of_convergence`  
**Descripción:** Para una serie de potencias dada, se muestran las sumas parciales `Sₙ(x)` para distintos `x`. Dentro del intervalo de convergencia las curvas convergen a `f(x)`; fuera divergen visiblemente. La frontera del intervalo se marca con líneas verticales. Slider para `n`.

---

## Sección 16 — Ecuaciones Diferenciales Elementales

### 16.1 Campo de pendientes (direction field)
**Tipo sugerido:** `direction_field`  
**Descripción:** Cuadrícula del plano `(x, y)` con pequeñas flechas cuya inclinación es `dy/dx = f(x, y)`. El usuario ingresa `f(x, y)` o selecciona ejemplos (separables, lineales, logísticas). Al hacer clic, se traza la solución particular que pasa por ese punto (integración numérica Euler/RK4). **Visualización fundamental para EDOs.**

### 16.2 Ecuaciones separables — separación visual
**Tipo sugerido:** `separable_ode`  
**Descripción:** Panel con dos ejes: integral de `g(y)` vs. `y` e integral de `f(x)` vs. `x`. La solución implícita se traza como curva de nivel de `G(y) = F(x) + C`. Slider para `C` para mostrar la familia de soluciones.

### 16.3 Crecimiento/decaimiento exponencial y modelo logístico
**Tipo sugerido:** `population_model`  
**Descripción:** Gráfica de `y(t)` con sliders para condición inicial `y₀`, tasa `k` y capacidad de carga `K`. Se muestran simultáneamente la curva solución y el campo de pendientes simplificado. Permite ver la diferencia entre crecimiento ilimitado y logístico.

---

## Sección 17 — Guía para Elegir un Método

### 17.1 Árbol de decisión de técnicas de integración
**Tipo sugerido:** `integration_decision_tree`  
**Descripción:** Diagrama de flujo interactivo. El usuario responde preguntas sobre la forma del integrando (¿es un producto? ¿tiene radicales? ¿es racional? ¿es trigonométrico?) y el árbol lo guía hacia la técnica apropiada. Cada nodo enlaza al formulario de la sección correspondiente.

---

## Resumen — Mapa de prioridades

| Prioridad | Sección | Recurso | Impacto didáctico |
|-----------|---------|---------|-------------------|
| ⭐⭐⭐ | 3.1 | Sumas de Riemann | Concepto central del curso |
| ⭐⭐⭐ | 3.3 | TFC — Función acumulada | Teorema más importante |
| ⭐⭐⭐ | 10.2 | Sólidos de revolución (3D) | Mayor impacto visual |
| ⭐⭐⭐ | 15.1 | Polinomios de Taylor | Muy intuitivo y llamativo |
| ⭐⭐⭐ | 16.1 | Campo de pendientes (EDOs) | Fundamental para EDOs |
| ⭐⭐ | 3.4 | Área con signo | Confusión frecuente |
| ⭐⭐ | 7.1 | Triángulos de sustitución trig. | Origen geométrico del método |
| ⭐⭐ | 9.1 | Integrales impropias | Convergencia/divergencia visual |
| ⭐⭐ | 12.1 | Curvas paramétricas animadas | Punto recorriendo la curva |
| ⭐⭐ | 13.1 | Coordenadas polares | Curvas exóticas animadas |
| ⭐⭐ | 14.2 | Sumas parciales de series | Convergencia visual |
| ⭐ | 4.1 | Sustitución u (doble eje) | Cambio de variable visual |
| ⭐ | 5.1 | Integración por partes geométrica | Diagrama rectangular |
| ⭐ | 10.1 | Área entre curvas | Extensión directa de §3.4 |
| ⭐ | 10.4 | Longitud de arco | Poligonal → integral |
| ⭐ | 11.1 | Trapecio y Simpson | Error numérico comparativo |
| ⭐ | 17.1 | Árbol de decisión | Orientación metodológica |

---

## Checklist de implementación

### Fase 1 — Núcleo del curso (prioridad ⭐⭐⭐)
> Estos cinco recursos cubren los conceptos más fundamentales. Deben desarrollarse primero porque otros recursos de fases posteriores los referencian o extienden.

- [x] `RiemannSumViz` — Sumas de Riemann (§3.1)
- [x] `TFCAccumulationViz` — Función acumulada / TFC Parte I (§3.3)
- [x] `SolidsOfRevolutionViz` — Sólidos de revolución 3D (§10.2)
- [x] `TaylorSeriesViz` — Polinomios de Taylor/Maclaurin (§15.1)
- [x] `DirectionFieldViz` — Campo de pendientes / EDOs (§16.1)

---

### Fase 2 — Conceptos de alta dificultad conceptual (prioridad ⭐⭐)
> Temas donde los estudiantes cometen más errores de interpretación. El recurso gráfico reduce significativamente la confusión.

- [x] `SignedAreaViz` — Área con signo vs. área geométrica (§3.4)
- [x] `TrigSubstitutionViz` — Triángulos de sustitución trigonométrica (§7.1)
- [x] `ImproperIntegralViz` — Convergencia con límite infinito (§9.1)
- [x] `ParametricCurveViz` — Curvas paramétricas animadas (§12.1)
- [x] `PolarGridViz` — Coordenadas polares y curvas (§13.1)
- [x] `SeriesPartialSumsViz` — Sumas parciales y convergencia de series (§14.2)

---

### Fase 3 — Técnicas y aplicaciones (prioridad ⭐)
> Recursos que complementan las técnicas de integración y aplicaciones geométricas/físicas.

- [x] `SubstitutionViz` — Sustitución u con doble eje (§4.1)
- [x] `IntegrationByPartsViz` — Integración por partes geométrica (§5.1)
- [x] `AreaBetweenCurvesViz` — Área entre dos curvas (§10.1)
- [x] `ArcLengthViz` — Longitud de arco (§10.4)
- [x] `NumericalIntegrationViz` — Trapecio y Simpson comparativo (§11.1)
- [x] `IntegrationDecisionTreeViz` — Árbol de decisión de técnicas (§17.1)

---

### Fase 4 — Recursos complementarios
> Recursos adicionales que enriquecen la experiencia pero no son bloqueantes para las fases anteriores.

- [x] `AntiderivativeExplorerViz` — Reglas elementales / antiderivadas (§2.2)
- [x] `AverageValueViz` — Valor promedio de una función (§3.5)
- [x] `ShellMethodViz` — Volumen por capas cilíndricas (§10.3)
- [x] `WorkIntegralViz` — Trabajo mecánico (§10.5)
- [x] `NumericalIntegrationViz` (extensión) — Convergencia del error (§11.1)
- [x] `ParametricTangentViz` — Tangente a curva paramétrica (§12.2)
- [x] `PolarAreaViz` — Área en coordenadas polares (§13.2)
- [x] `SequenceConvergenceViz` — Convergencia de sucesiones (§14.1)
- [x] `IntegralTestViz` — Criterio integral para series (§14.3)
- [x] `RadiusOfConvergenceViz` — Radio e intervalo de convergencia (§15.2)
- [x] `SeparableODEViz` — Ecuaciones separables — separación visual (§16.2)
- [x] `PopulationModelViz` — Crecimiento exponencial y modelo logístico (§16.3)

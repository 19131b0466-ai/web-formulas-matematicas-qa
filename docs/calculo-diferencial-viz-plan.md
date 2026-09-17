# Recursos Gráficos para el Curso de Cálculo Diferencial

Propuesta de visualizaciones interactivas por tema, siguiendo el modelo de Cálculo II y Álgebra (componentes React/TSX con controles, SVG y animaciones).

**Registro previsto:** `packages/shared-types/src/calculo-diferencial-viz.ts`  
**Componentes:** `apps/web-public/components/calculo-diferencial/viz/`

---

## Sección 2 — Límites

### 2.1 Definición ε-δ (`DIF-012`)
**Tipo sugerido:** `limit_explorer`  
**Descripción:** Gráfica de \(f(x)\) con punto \(a\) marcado. Sliders para \(\varepsilon\) y \(\delta\): se sombrea la banda horizontal \((L-\varepsilon, L+\varepsilon)\) y la banda vertical \((a-\delta, a+\delta)\). El estudiante ve cuándo la definición formal se cumple. Selector de funciones ejemplo (lineal, salto, oscilación).

### 2.2 Límites laterales (`DIF-013`, `DIF-014`)
**Tipo sugerido:** `limit_explorer` (modo `lateral`)  
**Descripción:** Mismo panel con aproximación desde izquierda/derecha por separado. Muestra \(L_L\), \(L_R\) y si el límite bilateral existe.

### 2.3 Límite notable sen x / x (`DIF-019`)
**Tipo sugerido:** `limit_explorer` (modo `notable`)  
**Descripción:** Animación de \(x\to0\): tabla de valores y gráfica de \(\operatorname{sen}x/x\) acercándose a 1.

---

## Sección 3 — Continuidad

### 3.1 Continuidad en un punto (`DIF-033`)
**Tipo sugerido:** `continuity_checker`  
**Descripción:** Selector de tipo de discontinuidad (removible, salto, infinita). Gráfica con \(f(a)\), \(\lim_{x\to a}f(x)\) y verificación visual de la definición.

---

## Sección 4 — Derivada geométrica

### 4.1 Definición de derivada (`DIF-041`)
**Tipo sugerido:** `limit_explorer` (modo `secante`)  
**Descripción:** Punto fijo \(x\) y slider \(h\to0\). Secante que rota hacia tangente; valor del cociente incremental en tiempo real.

### 4.2 Recta tangente (`DIF-043`)
**Tipo sugerido:** `tangent_line`  
**Descripción:** Gráfica de \(f(x)\), punto deslizable \(a\), tangente \(y-f(a)=f'(a)(x-a)\). Muestra pendiente y ecuación actualizada.

### 4.3 Interpretación física (`DIF-046`, `DIF-047`)
**Tipo sugerido:** `derivative_from_graph` (modo `kinematics`)  
**Descripción:** Gráficas sincronizadas \(s(t)\), \(v(t)=s'(t)\), \(a(t)=s''(t)\). Enlace conceptual con Física (`CIN-004`, `CIN-006`).

---

## Sección 5 — Reglas de derivación

### 5.1 Regla del producto (`DIF-053`)
**Tipo sugerido:** `product_rule`  
**Descripción:** Dos curvas \(f\), \(g\) y la curva producto \(fg\). Al activar la regla se colorean los términos \(f'g\) y \(fg'\).

### 5.2 Regla de la cadena (`DIF-056`)
**Tipo sugerido:** `chain_rule`  
**Descripción:** Diagrama de composición \(u=g(x)\), \(y=f(u)\). Cadena de tasas \(dy/dx=(dy/du)(du/dx)\) con valores numéricos en un punto.

### 5.3 Derivación logarítmica (`DIF-068`)
**Tipo sugerido:** `log_diff`  
**Descripción:** Función \(y=f(x)^{g(x)}\); panel muestra \(\ln y\) y la derivada resultante paso a paso.

---

## Sección 8 — Análisis de funciones

### 8.1 Crecimiento y concavidad (`DIF-082`–`DIF-089`)
**Tipo sugerido:** `concavity_analyzer`  
**Descripción:** Gráfica de \(f\), \(f'\), \(f''\) apiladas. Regiones verde/roja para crecimiento; curvatura hacia arriba/abajo. Marca puntos críticos e inflexión.

---

## Sección 9 — Optimización

### 9.1 Problema geométrico (`DIF-093`, `DIF-094`)
**Tipo sugerido:** `optimization_scenario`  
**Descripción:** Escenario visual (rectángulo de perímetro fijo, cilindro de superficie fija). Slider de parámetro y gráfica de \(Q(x)\) con máximo marcado.

---

## Sección 10 — Aproximaciones lineales

### 10.1 Diferencial y linealización (`DIF-096`, `DIF-098`)
**Tipo sugerido:** `linear_approximation`  
**Descripción:** \(f(x)\) y recta tangente \(L(x)\) en \(a\). Slider \(x\) muestra error \(f(x)-L(x)\) y \(\Delta y\approx f'(a)\Delta x\).

---

## Sección 11 — Taylor

### 11.1 Polinomio de Taylor (`DIF-101`)
**Tipo sugerido:** `taylor_approximation`  
**Descripción:** Reutilizar/adaptar `TaylorSeriesViz` de Cálculo II. Sliders \(n\) y \(a\); funciones \(e^x\), \(\operatorname{sen}x\), \(\cos x\), \(\ln(1+x)\).

---

## Sección 12 — L'Hôpital

### 12.1 Regla de L'Hôpital (`DIF-108`)
**Tipo sugerido:** `lhopital_explorer`  
**Descripción:** Cociente \(f/g\) con forma \(0/0\). Tabla de valores y comparación con \(f'/g'\) al acercarse al punto.

---

## Sección 13 — Implícitas

### 13.1 Derivación implícita (`DIF-113`, `DIF-114`)
**Tipo sugerido:** `implicit_curve`  
**Descripción:** Curva \(F(x,y)=0\) (círculo, elipse). Punto deslizable con tangente calculada por \(-F_x/F_y\).

---

## Sección 14 — Tasas relacionadas

### 14.1 Esfera inflándose (`DIF-118`)
**Tipo sugerido:** `related_rates`  
**Descripción:** Animación 3D/SVG de esfera con \(dV/dt\) y \(dr/dt\) enlazados por \(dV/dt=4\pi r^2\,dr/dt\).

---

## Sección 15 — Asíntotas

### 15.1 Asíntotas oblicuas (`DIF-122`, `DIF-123`)
**Tipo sugerido:** `asymptote_explorer`  
**Descripción:** Función racional con asíntota \(y=mx+b\) superpuesta. Sliders de dominio para ver comportamiento en \(\pm\infty\).

---

## Sección 16 — Guía de métodos

### 16.1 Árbol de decisión
**Tipo sugerido:** `derivation_decision_tree` (sección, no fórmula)  
**Descripción:** Árbol interactivo: señal en la función → técnica (cadena, producto, implícita, L'Hôpital…). Similar a `IntegrationDecisionTreeViz` de Cálculo II.

---

## Priorización de implementación

| Oleada | Viz | Fórmulas ancla |
|--------|-----|----------------|
| P0 | `limit_explorer`, `tangent_line`, `derivative_from_graph`, `taylor_approximation` | DIF-041, DIF-043, DIF-046, DIF-101 |
| P1 | `chain_rule`, `lhopital_explorer`, `continuity_checker`, `linear_approximation` | DIF-056, DIF-108, DIF-033, DIF-098 |
| P2 | `optimization_scenario`, `related_rates`, `concavity_analyzer`, `implicit_curve` | DIF-093, DIF-118, DIF-082, DIF-114 |

---

## Enlaces cruzados con otras materias

| Viz / concepto | Materia relacionada |
|----------------|---------------------|
| TFC (preview) | `INT-022`, `INT-014` (Cálculo II) |
| Taylor completo | `INT-163+` (Cálculo II) |
| Velocidad/aceleración | `CIN-004`, `CIN-006` (Física) |
| Tabla de derivadas ↔ antiderivadas | `INT-001` (Cálculo II §1.1) |

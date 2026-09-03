# Prompt de desarrollo — `SeparableODEViz`

**Sección del curso:** §16.2 — Ecuaciones diferenciales separables  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/SeparableODEViz.tsx`

---

## Contexto

Visualiza el proceso de separación de variables: `dy/g(y) = f(x)dx`, mostrando las integrales de cada lado y la solución implícita como curva de nivel de `G(y) = F(x) + C`. Un slider para `C` muestra la familia de soluciones.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal — Plano xy con curvas de nivel
- Las curvas de nivel `G(y) − F(x) = C` para 5–7 valores de `C` distintos (familia de soluciones)
- La curva correspondiente al `C` seleccionado con el slider se resalta en naranja más grueso
- Los demás en azul atenuado
- El punto de condición inicial `(x₀, y₀)` se puede colocar con clic o slider, calculando automáticamente `C = G(y₀) − F(x₀)`

### Paneles laterales
- **Panel izquierdo:** gráfica de `1/g(y)` vs. `y` (integrando del lado izquierdo)
- **Panel derecho:** gráfica de `f(x)` vs. `x` (integrando del lado derecho)

### Controles
| Control | Tipo |
|--------|------|
| Ecuación | Selector predefinido |
| `C` | Slider −3 a 3 |
| Condición inicial `y(x₀) = y₀` | Sliders para `x₀` y `y₀` |
| Mostrar paneles laterales | Toggle |

### Ecuaciones predefinidas
```
dy/dx = y        → dy/y = dx       → ln|y| = x + C → y = Ae^x
dy/dx = −y       → dy/y = −dx      → y = Ae^(−x)
dy/dx = xy       → dy/y = x dx     → y = Ae^(x²/2)
dy/dx = y(1−y)   → dy/[y(1-y)] = dx (logística)
dy/dx = x/y      → y dy = x dx     → y² − x² = C (hipérbolas)
dy/dx = −x/y     → y dy = −x dx    → x² + y² = C (circunferencias)
```

---

## Panel de proceso de separación (texto)

```
EDO:       dy/dx = f(x) · g(y)
Separar:   dy/g(y) = f(x) dx
Integrar:  ∫ dy/g(y) = ∫ f(x) dx
           G(y) = F(x) + C
Solución:  [expresión explícita si existe]
```

---

## Especificaciones SVG

```
Gráfica principal: viewBox 380 × 360
Paneles laterales: viewBox 160 × 160 cada uno
Márgenes: { l:40, r:12, t:12, b:32 }
```

Las curvas de nivel se calculan por muestreo de la función `G(y) − F(x) − C` en una cuadrícula y trazado de la isocurva con el algoritmo de "marching squares" simplificado, o con un conjunto de puntos integrados numéricamente desde condiciones iniciales distribuidas en el eje.

---

## Texto educativo

> **Idea clave:** En una EDO separable, podemos "separar" las variables `x` e `y` a lados distintos de la ecuación e integrar cada lado. Las soluciones forman una **familia de curvas** parametrizadas por la constante `C`.

> Mueve el slider de `C` y observa cómo toda la familia de soluciones se desplaza. La condición inicial `y(x₀) = y₀` fija un único valor de `C` y selecciona una sola curva de la familia.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SeparableODEViz.tsx
```

Exportar como `export function SeparableODEViz()`.

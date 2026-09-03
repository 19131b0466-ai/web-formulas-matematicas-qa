# Prompt de desarrollo — `TaylorSeriesViz`

**Sección del curso:** §15.1 — Series de Potencias y Taylor  
**Fase:** 1 (Núcleo)  
**Componente:** `apps/web-public/components/calculo/viz/TaylorSeriesViz.tsx`

---

## Contexto

Muestra el polinomio de Taylor de grado `n` de una función `f(x)` centrado en `a`, y cómo la aproximación mejora al aumentar `n`. Incluye la gráfica del error `|f(x) − Pₙ(x)|`. Es uno de los recursos más llamativos del curso.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel superior — Aproximación
- Gráfica de `f(x)` en color sólido (azul o `--accent-strong`)
- Gráfica de `Pₙ(x)` en color naranja/amarillo superpuesta
- Ambas curvas sobre el rango `[centro − rango, centro + rango]`
- El rango se calcula automáticamente según la función para mostrar zona interesante
- Resaltar en verde la región donde el error `|f(x) − Pₙ(x)| < 0.05` (zona de "buena aproximación")
- Un punto deslizable `x₀` muestra los valores `f(x₀)` y `Pₙ(x₀)` con sus diferencias

### Panel inferior — Error
- Gráfica de `|f(x) − Pₙ(x)|` en color rojo/naranja
- Líneas horizontales en `ε = 0.1` y `ε = 0.01` para referencia
- A medida que `n` crece, la curva de error desciende

### Controles
| Control | Tipo | Rango / Opciones |
|--------|------|-----------------|
| Función `f(x)` | Selector | Lista predefinida |
| Grado `n` | Slider | 1 a 12, paso 1 |
| Centro `a` | Slider | −3 a 3, paso 0.25 |
| Mostrar panel de error | Toggle | on/off |
| Mostrar zona verde | Toggle | on/off (región de buena aproximación) |
| Mostrar términos | Toggle | Muestra la fórmula del polinomio expandida |

### Funciones predefinidas
```
f(x) = eˣ          (radio de convergencia ∞, centro en a=0)
f(x) = sen(x)      (radio de convergencia ∞, centro en a=0)
f(x) = cos(x)      (radio de convergencia ∞, centro en a=0)
f(x) = ln(1+x)     (radio de convergencia 1,  centro en a=0)
f(x) = 1/(1−x)     (radio de convergencia 1,  centro en a=0)
f(x) = arctan(x)   (radio de convergencia 1,  centro en a=0)
f(x) = √(1+x)      (radio de convergencia 1,  centro en a=0)
```

### Cálculo del polinomio de Taylor

Para cada función, calcular los coeficientes `f⁽ᵏ⁾(a)/k!` analíticamente (no con diferencias finitas) usando tablas de derivadas precalculadas:

```typescript
// Ejemplo para eˣ centrado en a:
// Pₙ(x) = Σ_{k=0}^{n} e^a / k! * (x-a)^k

// Para sen(x) centrado en 0:
// Términos no nulos: x, −x³/6, x⁵/120, −x⁷/5040, ...

// Para ln(1+x) centrado en 0:
// Pₙ(x) = Σ_{k=1}^{n} (−1)^(k+1) / k * x^k
```

### Panel de fórmula (cuando "Mostrar términos" está activo)

Mostrar la expansión textual del polinomio, por ejemplo para `eˣ`, `n=4`:
```
P₄(x) = 1 + x + x²/2! + x³/3! + x⁴/4!
       = 1 + x + x²/2 + x³/6 + x⁴/24
```

---

## Especificaciones SVG

```
Panel superior: viewBox 500 × 240, márgenes { l:44, r:16, t:16, b:28 }
Panel inferior (error): viewBox 500 × 140, márgenes { l:44, r:16, t:8, b:28 }
```

- La curva de `f(x)` siempre visible; la curva `Pₙ(x)` se recorta si sale del viewBox
- No mostrar la curva `Pₙ` donde diverge visualmente (limitar a ±10 en el eje y)

---

## Panel de estado (aria-live)

```
n = [grado] · Centro a = [valor]
f(x₀) = [valor] · P_n(x₀) = [valor]
Error en x₀: |f(x₀) − P_n(x₀)| = [valor]
```

---

## Texto educativo

> **Idea clave:** El polinomio de Taylor de grado `n` es la mejor aproximación polinomial de `f` cerca del punto `a`. Cada término nuevo añade una "corrección" que reduce el error.

> Mueve el slider de **n** y observa cómo el polinomio abraza progresivamente a `f`. Prueba `ln(1+x)`: nota que para `x > 1` la aproximación diverge sin importar cuánto aumentes `n` — el radio de convergencia impone un límite.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/TaylorSeriesViz.tsx
```

Exportar como `export function TaylorSeriesViz()`.

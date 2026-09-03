# Prompt de desarrollo — `NumericalIntegrationViz`

**Sección del curso:** §11.1 — Integración numérica (Trapecio y Simpson)  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/NumericalIntegrationViz.tsx`

---

## Contexto

Extiende la visualización de sumas de Riemann para mostrar la Regla del Trapecio y la Regla de Simpson 1/3. Hace énfasis en la comparación del error entre métodos para ilustrar por qué Simpson converge mucho más rápido.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva `f(x)` sobre `[a, b]`
- Los `n` subintervalos se dibujan con el método seleccionado:
  - **Trapecio:** trapecios (líneas oblicuas entre `f(xᵢ)` y `f(xᵢ₊₁)`)
  - **Simpson:** parábolas que pasan por `f(xᵢ)`, `f((xᵢ+xᵢ₊₁)/2)` y `f(xᵢ₊₁)` (un par de subintervalos a la vez)
- Colores distintos para cada método cuando se comparan simultáneamente

### Modo comparación
Toggle "Comparar métodos": muestra Trapecio y Simpson en la misma gráfica con colores distintos (semitransparentes para no saturar), y la tabla de error comparativa debajo.

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `n` (subintervalos) | Slider | 2 a 30, paso 2 (par para Simpson) |
| Método | Botones | Trapecio · Simpson · Comparar |
| Función | Selector | Lista predefinida |
| `a`, `b` | Sliders | −2 a 5 |

### Funciones predefinidas
```
f(x) = x²
f(x) = sen(x)
f(x) = eˣ
f(x) = 1/x   [x ∈ [1, 4]]
f(x) = √x
```

---

## Tabla de comparación de errores

| n | Trapecio (Tₙ) | Error |T| | Simpson (Sₙ) | Error |S| |
|---|---|---|---|---|
| 2 | ... | ... | ... | ... |
| 4 | ... | ... | ... | ... |
| 8 | ... | ... | ... | ... |

Mostrar esta tabla debajo de la gráfica cuando el modo "Comparar" está activo.

---

## Fórmulas mostradas

Regla del Trapecio:
```
Tₙ = (b−a)/(2n) · [f(x₀) + 2f(x₁) + ... + 2f(xₙ₋₁) + f(xₙ)]
```

Regla de Simpson 1/3 (n par):
```
Sₙ = (b−a)/(3n) · [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + 4f(xₙ₋₁) + f(xₙ)]
```

---

## Panel de estado (aria-live)

```
Método: [Trapecio | Simpson]
n = [valor]
Resultado ≈ [valor numérico]
Valor exacto = [valor]
Error absoluto = [valor]
```

---

## Especificaciones SVG

```
viewBox: 520 × 280
Márgenes: { l:44, r:16, t:16, b:36 }
Las parábolas de Simpson se dibujan como <path> con curva de Bézier cúbica
```

---

## Texto educativo

> **Idea clave:** El método del Trapecio aproxima la función con segmentos rectos; Simpson usa parábolas. Las parábolas capturan mejor la curvatura, por lo que Simpson tiene un error del orden `O(h⁴)` versus `O(h²)` del Trapecio — converge **mucho** más rápido.

> Con solo `n = 4` intervalos, Simpson es a menudo más preciso que el Trapecio con `n = 20`. La tabla de errores lo ilustra cuantitativamente.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/NumericalIntegrationViz.tsx
```

Exportar como `export function NumericalIntegrationViz()`.

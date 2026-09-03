# Prompt de desarrollo — `SequenceConvergenceViz`

**Sección del curso:** §14.1 — Sucesiones y convergencia  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/SequenceConvergenceViz.tsx`

---

## Contexto

Grafica los términos `(n, aₙ)` de una sucesión y visualiza la definición formal de convergencia (ε-N): para un ε dado, hay un N a partir del cual todos los términos están dentro del ε-entorno del límite L.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Puntos `(n, aₙ)` con barras verticales desde el eje x
- Línea horizontal en `y = L` (límite) en color naranja
- Banda horizontal `[L − ε, L + ε]` sombreada en verde semitransparente
- A partir del índice `N(ε)` (calculado automáticamente), los puntos que están dentro de la banda se muestran en verde; los que están fuera en azul
- Etiqueta dinámica: "A partir de n = [N], todos los términos están dentro del ε-entorno"

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| Sucesión | Selector | Lista predefinida |
| `N` (número de términos a mostrar) | Slider | 5 a 60 |
| `ε` (tolerancia) | Slider | 0.01 a 1, paso 0.01 |
| Mostrar banda ε | Toggle | on/off |
| Mostrar L | Toggle | on/off |

### Sucesiones predefinidas
```
aₙ = 1/n              → L = 0
aₙ = (−1)ⁿ/n          → L = 0  (alternada convergente)
aₙ = (1 + 1/n)ⁿ       → L = e ≈ 2.718
aₙ = (−1)ⁿ            → diverge (oscila)
aₙ = n/(n+1)           → L = 1
aₙ = (2n+1)/(n+3)      → L = 2
aₙ = sen(n)/n          → L = 0
aₙ = 2ⁿ/n!             → L = 0  (factorial domina)
```

---

## Especificaciones SVG

```
viewBox: 520 × 300
Márgenes: { l:52, r:16, t:16, b:36 }
```

---

## Panel de estado (aria-live)

```
Sucesión: aₙ = [expresión]
Límite: L = [valor o "no converge"]
ε = [valor]
N(ε) = [índice a partir del cual |aₙ − L| < ε]
```

---

## Texto educativo

> **Idea clave:** `{aₙ} → L` significa que para cualquier `ε > 0`, existe `N` tal que para todo `n > N`, `|aₙ − L| < ε`. La banda verde visualiza el ε-entorno: todos los puntos que entran en la banda y no vuelven a salir cumplen la definición.

> Reduce `ε` y observa cómo `N` crece: necesitas más términos para garantizar la precisión pedida.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SequenceConvergenceViz.tsx
```

Exportar como `export function SequenceConvergenceViz()`.

# Prompt de desarrollo — `RadiusOfConvergenceViz`

**Sección del curso:** §15.2 — Radio e intervalo de convergencia  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/RadiusOfConvergenceViz.tsx`

---

## Contexto

Muestra las sumas parciales `Sₙ(x)` de una serie de potencias para distintos valores de `x`. Dentro del intervalo de convergencia las curvas convergen a `f(x)`; fuera divergen visiblemente. El radio de convergencia se marca con líneas verticales.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- La función `f(x)` trazada en azul sólido (referencia)
- Las sumas parciales `S₁(x)`, `S₂(x)`, ..., `Sₙ(x)` superpuestas con degradado de color (de claro a oscuro/naranja conforme `n` aumenta)
- Dos líneas verticales rojas en `x = a − R` y `x = a + R` (fronteras del intervalo de convergencia)
- La región dentro del intervalo `(a−R, a+R)` sombreada en verde muy claro
- La región fuera del intervalo sombreada en rojo muy claro
- El centro `x = a` marcado con línea punteada

### Panel de estado de convergencia
Para el valor de `x` seleccionado con un slider horizontal:
- Indicador: "x = [valor]: [converge | diverge]"
- Valor de `Sₙ(x)` y `f(x)` si `x` está en la zona de convergencia

### Controles
| Control | Tipo |
|--------|------|
| Grado `n` | Slider 1 a 15 |
| Función / serie | Selector |
| `x` inspeccionado | Slider sobre el rango visible |
| Centro `a` | Slider (para series centradas en `a ≠ 0`) |

### Series predefinidas
```
Σ xⁿ                → f(x) = 1/(1−x), R = 1, a = 0
Σ (−1)ⁿ xⁿ/n        → f(x) = ln(1+x), R = 1, a = 0  (excluye x=1)
Σ xⁿ/n!             → f(x) = eˣ,       R = ∞, a = 0
Σ (−1)ⁿ x^(2n+1)/(2n+1)! → f(x)=sen(x), R = ∞
Σ (x−1)ⁿ/2ⁿ         → f(x) = 2/(3−x), R = 2, a = 1
```

---

## Especificaciones SVG

```
viewBox: 540 × 300
Márgenes: { l:44, r:16, t:16, b:36 }
Las sumas parciales se recortan al rango visual [−10, 10] en el eje y para evitar overflow
```

---

## Panel de estado (aria-live)

```
Serie: [expresión]
Centro a = [valor], Radio R = [valor]
Intervalo de convergencia: ([a−R], [a+R])
En x = [valor]: [converge / diverge]
```

---

## Texto educativo

> **Idea clave:** Una serie de potencias `Σ cₙ(x−a)ⁿ` converge en un intervalo centrado en `a` de radio `R` (el radio de convergencia). Fuera de ese intervalo las sumas parciales crecen sin límite.

> Observa `Σxⁿ = 1/(1−x)`: para `|x| < 1` las sumas parciales convergen perfectamente a `1/(1−x)`. Para `x = 0.99` converge muy lentamente; para `x = 1.01` diverge a ±∞.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/RadiusOfConvergenceViz.tsx
```

Exportar como `export function RadiusOfConvergenceViz()`.

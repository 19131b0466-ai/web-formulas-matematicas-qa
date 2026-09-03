# Prompt de desarrollo — `SeriesPartialSumsViz`

**Sección del curso:** §14.2 — Sucesiones y series: sumas parciales y convergencia  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/SeriesPartialSumsViz.tsx`

---

## Contexto

Muestra simultáneamente la sucesión de términos `aₙ` y la sucesión de sumas parciales `Sₙ = Σa_k`. El estudiante ve visualmente la diferencia entre términos que tienden a cero y series que convergen.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel superior — Términos `aₙ`
- Gráfica de puntos `(n, aₙ)` con barras verticales desde el eje x
- Línea horizontal en `y = 0`
- Cuando `n` es grande y `aₙ → 0`, mostrar un indicador textual "aₙ → 0"
- Para series alternadas, colorear los términos positivos en azul y negativos en rojo

### Panel inferior — Sumas parciales `Sₙ`
- Gráfica de puntos `(n, Sₙ)` conectados por segmentos
- Si la serie converge: línea horizontal punteada en el valor límite `S = Σaₙ`
- Si la serie diverge: la escala del eje y se amplía automáticamente y se muestra un mensaje "→ ∞"
- Resaltar el último punto `(N, Sₙ)` con un círculo más grande

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `N` (número de términos) | Slider | 1 a 50, paso 1 |
| Serie | Selector | Lista predefinida |
| Mostrar criterio aplicado | Toggle | Panel con el nombre del criterio y resultado |
| Mostrar suma exacta | Toggle | Muestra el valor límite si es conocido |

### Series predefinidas
```
Geométrica r=1/2:    aₙ = (1/2)ⁿ        → converge a 1
Geométrica r=0.9:    aₙ = (0.9)ⁿ        → converge a 9
Geométrica r=1.1:    aₙ = (1.1)ⁿ        → diverge
Armónica:            aₙ = 1/n            → diverge  (aunque aₙ→0)
Serie p (p=2):       aₙ = 1/n²           → converge a π²/6 ≈ 1.6449
Alternada armónica:  aₙ = (−1)^(n+1)/n  → converge a ln(2) ≈ 0.6931
Telescópica:         aₙ = 1/n − 1/(n+1) → converge a 1
```

---

## Panel de criterio (cuando el toggle está activo)

Para cada serie, mostrar:
```
Criterio aplicado: [nombre del criterio]
aₙ → [límite de aₙ]        (si ≠ 0, diverge por test de término general)
Resultado: [Converge / Diverge]
Suma: S = [valor si converge]
```

---

## Especificaciones SVG

```
Panel superior (aₙ): viewBox 500 × 180, márgenes { l:52, r:16, t:12, b:28 }
Panel inferior (Sₙ): viewBox 500 × 200, márgenes { l:52, r:16, t:12, b:32 }
```

Para series que divergen, el eje y del panel inferior se reescala automáticamente para acomodar `S_N`.

---

## Panel de estado (aria-live)

```
N = [valor términos]
a_N = [valor del N-ésimo término]
S_N = [suma parcial hasta N]
[Converge a S = valor] | [Diverge]
```

---

## Texto educativo

> **Idea clave:** Una serie converge si sus sumas parciales `Sₙ` se acercan a un valor fijo. ¡Que los términos `aₙ` tiendan a cero es **necesario** pero **no suficiente**! La serie armónica tiene `aₙ→0` y aún así diverge.

> Compara la **serie armónica** con la **serie p (p=2)**: ambas tienen términos que tienden a 0, pero solo la segunda converge. El crecimiento de `Sₙ` en la harmónica es muy lento (logarítmico), pero imparable.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SeriesPartialSumsViz.tsx
```

Exportar como `export function SeriesPartialSumsViz()`.

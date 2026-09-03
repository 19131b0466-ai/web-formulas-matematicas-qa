# Prompt de desarrollo — `PolarAreaViz`

**Sección del curso:** §13.2 — Área en coordenadas polares  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/PolarAreaViz.tsx`

---

## Contexto

Muestra la acumulación del área polar `A = ½ ∫_α^β r² dθ` mediante la coloración progresiva de sectores circulares. Extiende `PolarGridViz`.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal — Plano polar
- Cuadrícula polar de fondo (circunferencias y rayos atenuados)
- La curva `r = f(θ)` completa trazada en azul
- Los sectores de área `½ r(θ)² Δθ` coloreados en verde semitransparente conforme `θ` avanza
- El sector activo (en la posición del slider `β`) resaltado en naranja más opaco
- Los ángulos `α` y `β` marcados con rayos en el plano

### Panel lateral — Función de área acumulada `A(β)`
- Gráfica de `A(β) = ½ ∫_α^β [r(θ)]² dθ` vs. `β`
- Punto `(β, A(β))` se mueve con el slider

### Controles
| Control | Tipo |
|--------|------|
| `α` | Slider (ángulo inicial) |
| `β` | Slider (ángulo final) |
| Curva `r = f(θ)` | Selector (mismas que PolarGridViz) |
| Animar | Botón play/pause |
| Mostrar área entre dos curvas | Toggle (activa un selector para `r₂`) |

### Modo área entre dos curvas polares
Cuando está activo: se muestran `r₁ = f(θ)` y `r₂ = g(θ)`. La región entre ellas se colorea con tono diferente.
Fórmula: `A = ½ ∫_α^β ([r₁]² − [r₂]²) dθ`

---

## Especificaciones SVG

```
Plano polar: viewBox 400 × 400, centro (200, 200)
Panel A(β): viewBox 280 × 180
```

---

## Panel de estado (aria-live)

```
r(θ) = [valor en β]
A = ½ ∫_α^β r² dθ = [valor]
Intervalo: α = [valor], β = [valor]
```

---

## Texto educativo

> **Idea clave:** El área de un sector polar infinitesimal de ángulo `dθ` y radio `r` es `½ r² dθ` (como un sector circular). La integral `½ ∫_α^β r(θ)² dθ` suma todos esos sectores.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/PolarAreaViz.tsx
```

Exportar como `export function PolarAreaViz()`.

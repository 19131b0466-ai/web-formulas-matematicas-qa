# Prompt de desarrollo — `PolarGridViz`

**Sección del curso:** §13.1 — Coordenadas polares  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/PolarGridViz.tsx`

---

## Contexto

Introduce el sistema de coordenadas polares y muestra curvas polares `r = f(θ)` trazadas animadamente. Incluye la conversión bidireccional entre coordenadas polares y cartesianas para un punto seleccionable.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal — Plano polar
- Cuadrícula polar: circunferencias concéntricas cada unidad y rayos de ángulo cada `π/6`
- La curva `r = f(θ)` se traza desde `θ = 0` hasta el valor actual del slider `θ`
- Un punto naranja se mueve sobre la curva en `(r(θ), θ)`
- El segmento desde el origen hasta el punto (radio vector) se dibuja en naranja
- El ángulo `θ` se marca con un arco desde el eje polar positivo

### Conversión cartesiana
- Líneas punteadas que muestran `x = r·cos(θ)` y `y = r·sen(θ)` para el punto actual
- Panel de texto: `(r, θ) = ([r], [θ])  →  (x, y) = ([x], [y])`

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `θ` (ángulo de barrido) | Slider | 0 a `θ_max` de la curva |
| Reproducir animación | Botón play/pause | Traza la curva animadamente |
| Curva | Selector | Lista predefinida |
| Mostrar eje cartesiano superpuesto | Toggle | on/off |
| Mostrar conversión | Toggle | on/off |

### Curvas predefinidas
```
Rosa de 3 pétalos:   r = cos(3θ),             θ ∈ [0, π]
Rosa de 4 pétalos:   r = cos(2θ),             θ ∈ [0, 2π]
Cardioide:           r = 1 + cos(θ),          θ ∈ [0, 2π]
Lemniscata:          r = √(cos(2θ)),          θ ∈ [−π/4, π/4] ∪ [3π/4, 5π/4]
Espiral de Arquímedes: r = θ/π,              θ ∈ [0, 4π]
Circunferencia:      r = 2,                  θ ∈ [0, 2π]
Limaçon:             r = 1 + 2cos(θ),        θ ∈ [0, 2π]
```

---

## Especificaciones SVG

```
viewBox: 480 × 480
Centro del plano polar en (240, 240)
Escala: 60px por unidad
Circunferencias: r = 1, 2, 3 (hasta el borde del viewBox)
Rayos: θ = 0, π/6, π/4, π/3, π/2, 2π/3, 3π/4, 5π/6, π (y sus análogos en el semiplano inferior)
Etiquetas de ángulos: 0, π/6, π/4, π/3, π/2, ... (en las puntas de los rayos)
```

La curva se dibuja con `<polyline>` o `<path>` calculado punto a punto con paso `Δθ = 0.01`.

Para la lemniscata, verificar que `cos(2θ) ≥ 0` antes de calcular `r = √(cos(2θ))`.

---

## Panel de estado (aria-live)

```
θ = [valor en radianes] ([valor en grados]°)
r = f(θ) = [valor]
(x, y) = ([valor], [valor])
```

---

## Texto educativo

> **Idea clave:** En coordenadas polares, cada punto se describe por su distancia al origen `r` y su ángulo `θ` respecto al eje polar. Las curvas que son complicadas en cartesianas (como rosas y cardioide) tienen ecuaciones polares muy simples.

> Observa la **rosa de 3 pétalos** `r = cos(3θ)`: solo se necesita barrer `θ` de `0` a `π` para trazar los 3 pétalos (los valores negativos de `r` dibujan el pétalo en la dirección opuesta). Prueba la **espiral de Arquímedes**: el radio crece linealmente con θ.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/PolarGridViz.tsx
```

Exportar como `export function PolarGridViz()`.

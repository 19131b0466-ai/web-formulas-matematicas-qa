# Prompt de desarrollo — `ParametricTangentViz`

**Sección del curso:** §12.2 — Tangente a la curva paramétrica  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/ParametricTangentViz.tsx`

---

## Contexto

Muestra la recta tangente a una curva paramétrica `(x(t), y(t))` en un punto variable `t`, con pendiente `dy/dx = (dy/dt)/(dx/dt)`. Identifica visualmente los puntos de tangente horizontal y vertical.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva paramétrica completa en azul atenuado
- Punto naranja `(x(t), y(t))` en la posición actual del slider `t`
- Recta tangente en el punto actual (naranja)
- Puntos donde `dy/dt = 0` marcados en verde (tangente horizontal)
- Puntos donde `dx/dt = 0` marcados en rojo (tangente vertical / punto de inflexión vertical)
- Orientación de la curva: flechas pequeñas en la dirección de `t` creciente

### Panel lateral — Gráficas de `dx/dt` y `dy/dt`
- Dos gráficas compactas de `dx/dt` vs. `t` y `dy/dt` vs. `t`
- Línea horizontal en `y = 0` en cada gráfica
- Una línea vertical punteada en el valor actual de `t`
- Los ceros de `dx/dt` y `dy/dt` se marcan

### Controles
| Control | Tipo |
|--------|------|
| `t` | Slider en el rango de la curva |
| Curva | Selector (mismas que `ParametricCurveViz`) |
| Mostrar puntos especiales | Toggle (horizontal/vertical) |
| Mostrar panel de derivadas | Toggle |

---

## Panel de estado (aria-live)

```
t = [valor]
(x, y) = ([x(t)], [y(t)])
dx/dt = [valor],   dy/dt = [valor]
dy/dx = [valor]   [o "indefinida (tangente vertical)"]
```

---

## Especificaciones SVG

```
Gráfica principal: viewBox 380 × 380
Panel derivadas: viewBox 200 × 200 (compacto)
Disposición: flex-row en pantallas anchas
```

---

## Texto educativo

> **Idea clave:** La pendiente `dy/dx = (dy/dt)/(dx/dt)` se calcula dividiendo las derivadas paramétricas. Cuando `dy/dt = 0` (pero `dx/dt ≠ 0`), la tangente es horizontal. Cuando `dx/dt = 0` (pero `dy/dt ≠ 0`), la tangente es vertical.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/ParametricTangentViz.tsx
```

Exportar como `export function ParametricTangentViz()`.

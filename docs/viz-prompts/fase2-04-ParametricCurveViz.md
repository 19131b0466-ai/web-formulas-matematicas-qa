# Prompt de desarrollo — `ParametricCurveViz`

**Sección del curso:** §12.1 — Curvas paramétricas  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/ParametricCurveViz.tsx`

---

## Contexto

Anima el trazado de una curva paramétrica `(x(t), y(t))` con un punto que recorre la curva conforme `t` avanza. Muestra en paralelo las gráficas de `x(t)` y `y(t)` vs `t` para conectar las dos representaciones.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel principal — Curva paramétrica en el plano xy
- Trazar la curva completa en gris claro/atenuado
- Un punto naranja se mueve sobre la curva conforme avanza `t`
- Una "estela" de los últimos pasos del punto en color degradado (más opaco cerca del punto actual)
- Flechas de dirección cada cierto número de pasos (indicando el sentido de recorrido)
- El punto actual `(x(t), y(t))` se muestra con sus coordenadas en un tooltip

### Panel derecho (o inferior) — `x(t)` y `y(t)` vs `t`
- Dos gráficas superpuestas: `x(t)` en azul, `y(t)` en naranja
- Una línea vertical punteada en el valor actual de `t`
- Los puntos `(t, x(t))` y `(t, y(t))` se marcan con círculos del mismo color

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `t` actual | Slider | `t_min` a `t_max`, paso fino |
| Reproducir animación | Botón play/pause | Avanza `t` automáticamente |
| Velocidad | Slider | Lenta · Normal · Rápida |
| Curva | Selector | Lista predefinida |
| Mostrar flechas de dirección | Toggle | on/off |
| Mostrar estela | Toggle | on/off |

### Curvas predefinidas
```
Cicloide:         x(t) = t − sen(t),    y(t) = 1 − cos(t),       t ∈ [0, 4π]
Lissajous 3:2:    x(t) = sen(3t),       y(t) = sen(2t),           t ∈ [0, 2π]
Lissajous 5:4:    x(t) = sen(5t),       y(t) = sen(4t),           t ∈ [0, 2π]
Cardioide:        x(t) = 2cos(t)−cos(2t), y(t) = 2sen(t)−sen(2t), t ∈ [0, 2π]
Elipse:           x(t) = 3cos(t),       y(t) = 2sen(t),           t ∈ [0, 2π]
Espiral:          x(t) = t·cos(t),      y(t) = t·sen(t),          t ∈ [0, 4π]
Rosa de 4 pétalos: x(t) = cos(2t)cos(t), y(t) = cos(2t)sen(t),   t ∈ [0, 2π]
```

---

## Especificaciones SVG

```
Panel xy:        viewBox 320 × 320
Paneles x(t), y(t): viewBox 320 × 140 cada uno
Los tres paneles se disponen en flex-row en pantallas anchas, flex-col en móvil
Márgenes: { l:36, r:12, t:12, b:28 }
```

La escala del panel xy se ajusta automáticamente al rango de la curva seleccionada.

---

## Animación

```typescript
// Usar requestAnimationFrame con useEffect
// Velocidad lenta: avanza 0.01 en t por frame
// Velocidad normal: avanza 0.03 en t por frame
// Velocidad rápida: avanza 0.08 en t por frame
// Al llegar a t_max, reiniciar desde t_min automáticamente
```

---

## Panel de estado (aria-live)

```
t = [valor con 2 decimales]
x(t) = [valor],  y(t) = [valor]
```

---

## Texto educativo

> **Idea clave:** En una curva paramétrica, `x` e `y` dependen ambas de un tercer parámetro `t` (que puede representar tiempo). La curva en el plano xy no muestra cómo varía `t`; las gráficas laterales revelan ese comportamiento.

> Observa la **cicloide**: el punto naranja rueda sobre el eje x como un punto en la llanta de una rueda. Prueba las curvas de **Lissajous**: la razón entre las frecuencias determina el número de lóbulos.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/ParametricCurveViz.tsx
```

Exportar como `export function ParametricCurveViz()`.

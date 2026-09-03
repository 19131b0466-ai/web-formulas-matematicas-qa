# Prompt de desarrollo — `IntegrationByPartsViz`

**Sección del curso:** §5.1 — Integración por partes  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/IntegrationByPartsViz.tsx`

---

## Contexto

Muestra la interpretación geométrica del teorema de integración por partes mediante el diagrama rectangular clásico: el rectángulo de lados `u` y `v` cuyas dos áreas complementarias corresponden a `∫u dv` y `∫v du`, sumando al área total `uv`.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal — Diagrama rectangular
- Eje horizontal: valores de `u`, de 0 a `u(b)`
- Eje vertical: valores de `v`, de 0 a `v(b)`
- La curva paramétrica `(u(t), v(t))` para `t ∈ [a, b]` se traza en el interior
- El rectángulo de esquinas `(0,0)` y `(u(b), v(b))` se dibuja
- Región A (bajo la curva respecto al eje u): `∫v du`, sombreada en azul semitransparente → corresponde a `∫_a^b v(t) u'(t) dt`
- Región B (a la izquierda de la curva respecto al eje v): `∫u dv`, sombreada en naranja semitransparente → corresponde a `∫_a^b u(t) v'(t) dt`
- Etiqueta en el rectángulo: `A + B = u(b)·v(b) − u(a)·v(a)`

### Punto deslizable
- Un punto `t` se mueve sobre la curva paramétrica con un slider
- Las coordenadas actuales `(u(t), v(t))` se muestran
- Líneas punteadas desde el punto hasta ambos ejes

### Controles
| Control | Tipo |
|--------|------|
| Ejemplo / función | Selector predefinido |
| `t` | Slider `[a, b]` |
| Mostrar etiquetas de área | Toggle |

### Ejemplos predefinidos
```
u(t) = t,    v(t) = e^t       (∫t·eᵗ dt)
u(t) = t,    v(t) = sen(t)    (∫t·sen(t) dt)
u(t) = ln(t), v(t) = t        (∫ln(t) dt)
u(t) = t²,   v(t) = cos(t)   (∫t²·cos(t) dt, requiere 2 veces por partes)
```

### Panel de fórmula
```
∫u dv = uv − ∫v du
∫_a^b u dv = [u·v]_a^b − ∫_a^b v du
           = u(b)v(b) − u(a)v(a) − ∫_a^b v du
```

---

## Especificaciones SVG

```
viewBox: 440 × 380
Márgenes: { l:52, r:20, t:20, b:44 }
El rectángulo ocupa el espacio interior del gráfico
La curva paramétrica se traza con 200 puntos
```

---

## Texto educativo

> **Idea clave:** La fórmula `∫u dv = uv − ∫v du` tiene una interpretación geométrica: el rectángulo de lados `u` y `v` tiene área `uv`, y se puede dividir en dos regiones — la que está debajo de la curva (`∫v du`) y la que está a su izquierda (`∫u dv`).

> El diagrama muestra que las dos integrales son complementarias: si una es grande, la otra es pequeña.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/IntegrationByPartsViz.tsx
```

Exportar como `export function IntegrationByPartsViz()`.

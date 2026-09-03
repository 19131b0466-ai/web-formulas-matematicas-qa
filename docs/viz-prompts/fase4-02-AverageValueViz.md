# Prompt de desarrollo — `AverageValueViz`

**Sección del curso:** §3.5 — Valor promedio de una función  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/AverageValueViz.tsx`

---

## Contexto

Visualiza el valor promedio `f_prom = 1/(b-a) ∫_a^b f(x)dx` y el Teorema del Valor Medio para Integrales: existe un punto `c` donde `f(c) = f_prom`. El rectángulo de igual área ilustra el concepto.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva `f(x)` sobre `[a, b]`
- Región bajo la curva sombreada en azul semitransparente
- Línea horizontal roja punteada en `y = f_prom`
- Rectángulo verde semitransparente de base `[a, b]` y altura `f_prom` (misma área que la región bajo la curva)
- Punto(s) `c` donde `f(c) = f_prom` marcados con círculos naranjas y líneas verticales punteadas

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `a` | Slider | −3 a 3, paso 0.25 |
| `b` | Slider | `a+0.5` a 5, paso 0.25 |
| Función | Selector | Lista predefinida |
| Mostrar rectángulo equivalente | Toggle | on/off |
| Mostrar puntos c | Toggle | on/off |

### Funciones predefinidas
```
f(x) = x²
f(x) = sen(x)     [a=0, b=π sugerido]
f(x) = eˣ
f(x) = x(4−x)    [parábola con ceros en 0 y 4]
f(x) = cos(x)
```

---

## Especificaciones SVG

```
viewBox: 500 × 280
Márgenes: { l:44, r:16, t:16, b:36 }
```

Los puntos `c` se calculan numéricamente (bisección en subintervalos donde `f(x) − f_prom` cambia de signo).

---

## Panel de estado (aria-live)

```
f_prom = 1/(b−a) · ∫_a^b f(x)dx = [valor]
c ∈ [a,b] con f(c) = f_prom: c ≈ [valor(es)]
Área bajo f = Área del rectángulo = [valor]
```

---

## Texto educativo

> **Idea clave:** El valor promedio de `f` en `[a, b]` es la altura del rectángulo que tiene la misma área que la región bajo la curva. El Teorema del Valor Medio para Integrales garantiza que `f` alcanza ese valor promedio en al menos un punto `c`.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/AverageValueViz.tsx
```

Exportar como `export function AverageValueViz()`.

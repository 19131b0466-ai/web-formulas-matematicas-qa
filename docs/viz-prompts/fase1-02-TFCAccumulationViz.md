# Prompt de desarrollo — `TFCAccumulationViz`

**Sección del curso:** §3.3 — Teorema Fundamental del Cálculo, Parte I  
**Fase:** 1 (Núcleo)  
**Componente:** `apps/web-public/components/calculo/viz/TFCAccumulationViz.tsx`

---

## Contexto

Visualiza el TFC Parte I: la función acumulada `G(x) = ∫_a^x f(t) dt` y la relación `G'(x) = f(x)`. Es el recurso que hace intuitivo el teorema más importante del Cálculo.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel superior — Gráfica de `f(t)`
- Grafica la función `f(t)` sobre un rango fijo (ej. `[−0.5, 6]`)
- Un punto deslizable `x` se mueve sobre el eje horizontal (inicialmente en `x = 3`)
- El área bajo `f(t)` desde `a` hasta `x` se sombrea en color `--accent-strong` con opacidad 0.25
- Cuando `f(t) < 0` en algún subintervalo, esa región se sombrea en rojo semitransparente
- Una línea vertical punteada marca la posición actual de `x`
- El punto `(x, f(x))` se resalta con un círculo naranja sobre la curva

### Panel inferior — Gráfica de `G(x)`
- Grafica la función acumulada `G(x) = ∫_a^x f(t) dt` calculada numéricamente
- Traza el punto `(x, G(x))` como un círculo que se mueve al mover el slider
- Una línea tangente en `(x, G(x))` con pendiente `G'(x) = f(x)` se dibuja opcionalmente (toggle "Mostrar tangente")

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `x` (límite superior) | Slider | `a` a `b`, paso 0.05 |
| Función `f` | Selector | Lista predefinida (ver abajo) |
| `a` (límite inferior fijo) | Selector simple | 0, −1, −2 |
| Mostrar tangente | Toggle | on/off |
| Mostrar área negativa en rojo | Toggle | on/off |

### Funciones predefinidas
```
f(t) = sen(t)
f(t) = cos(t)
f(t) = t − 2
f(t) = t² − 4
f(t) = e^(−t)
```

---

## Panel de estado (aria-live)

```
G(x) = ∫_0^x f(t)dt = [valor con 4 decimales]
G'(x) = f(x) = [valor de f en x con 4 decimales]
```

---

## Especificaciones SVG

Dos gráficas apiladas verticalmente:
```
Panel superior (f): viewBox 480×200, márgenes { l:44, r:16, t:16, b:28 }
Panel inferior (G): viewBox 480×200, márgenes { l:44, r:16, t:16, b:32 }
```

Ambas comparten el mismo rango `[a, b]` en el eje x con escala idéntica para que los puntos `x` estén alineados visualmente.

---

## Texto educativo

> **Idea clave:** La función `G(x) = ∫_a^x f(t) dt` acumula el área bajo `f`. El TFC afirma que `G'(x) = f(x)`: la tasa de cambio de la acumulación es exactamente el valor de la función original.

> Mueve el slider de **x**. Cuando `f(x) > 0`, G crece; cuando `f(x) < 0`, G decrece. La pendiente de la tangente en G(x) siempre iguala el valor de f(x).

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/TFCAccumulationViz.tsx
```

Exportar como `export function TFCAccumulationViz()`.

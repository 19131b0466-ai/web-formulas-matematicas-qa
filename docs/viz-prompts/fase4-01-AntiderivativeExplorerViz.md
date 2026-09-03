# Prompt de desarrollo — `AntiderivativeExplorerViz`

**Sección del curso:** §2.2 — Reglas elementales de integración  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/AntiderivativeExplorerViz.tsx`

---

## Contexto

Muestra simultáneamente `f(x)` y su antiderivada `F(x)`, con un punto deslizable que ilustra la relación `F'(x) = f(x)` — la pendiente de `F` en cada punto iguala el valor de `f`.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Dos paneles apilados

#### Panel superior — `F(x)` (antiderivada)
- Gráfica de `F(x)` en azul
- En el punto `x₀` (slider): círculo naranja + recta tangente de pendiente `F'(x₀) = f(x₀)`
- La recta tangente se extiende ±1 unidad a cada lado

#### Panel inferior — `f(x)` (función original)
- Gráfica de `f(x)` en naranja
- En `x₀`: línea vertical punteada y el valor `f(x₀)` destacado
- El valor `f(x₀)` y la pendiente de `F` en `x₀` se muestran iguales → refuerza `F'(x₀) = f(x₀)`

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| Función `f(x)` | Selector | Lista predefinida |
| `x₀` | Slider | Rango del dominio |
| Constante `C` | Slider | −3 a 3, paso 0.5 |
| Mostrar recta tangente | Toggle | on/off |

### Pares `f` / `F` predefinidos
```
f(x) = xⁿ       →  F(x) = xⁿ⁺¹/(n+1)   (selector para n = 1..5)
f(x) = cos(x)   →  F(x) = sen(x)
f(x) = sen(x)   →  F(x) = −cos(x)
f(x) = eˣ       →  F(x) = eˣ
f(x) = 1/x      →  F(x) = ln|x|
f(x) = 1/(1+x²) →  F(x) = arctan(x)
```

---

## Panel de estado (aria-live)

```
x₀ = [valor]
F(x₀) = [valor]
F'(x₀) = f(x₀) = [valor]   ← pendiente de F = valor de f
```

---

## Especificaciones SVG

```
Cada panel: viewBox 500 × 200, márgenes { l:44, r:16, t:16, b:28 }
Los dos paneles comparten la misma escala en el eje x
```

---

## Texto educativo

> **Idea clave:** `F` es antiderivada de `f` si `F'(x) = f(x)`. La recta tangente a `F` en cualquier punto tiene una pendiente que coincide exactamente con el valor de `f` en ese mismo punto.

> Mueve el slider de `x₀`. Cuando `f(x₀) > 0`, la curva `F` sube; cuando `f(x₀) < 0`, la curva `F` baja.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/AntiderivativeExplorerViz.tsx
```

Exportar como `export function AntiderivativeExplorerViz()`.

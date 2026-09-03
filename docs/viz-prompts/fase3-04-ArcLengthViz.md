# Prompt de desarrollo — `ArcLengthViz`

**Sección del curso:** §10.4 — Aplicaciones de la integral: longitud de arco  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/ArcLengthViz.tsx`

---

## Contexto

Visualiza cómo la longitud de arco de una curva se aproxima mediante una poligonal de `n` segmentos, y cómo esa aproximación converge a `∫_a^b √(1 + [f'(x)]²) dx` conforme `n → ∞`.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva `f(x)` sobre `[a, b]` en azul
- Poligonal de `n` segmentos sobre la misma curva en naranja
- Al hacer hover sobre un segmento, mostrar su longitud `√(Δx² + Δy²)` en un tooltip
- Sombreado leve bajo la curva para contexto

### Panel de convergencia
- Gráfica de `Lₙ` (longitud de la poligonal) vs. `n`
- Línea horizontal punteada en el valor exacto `L = ∫_a^b √(1 + [f'(x)]²) dx`
- El punto `(n, Lₙ)` se resalta y muestra el error `|Lₙ − L|`

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `n` (segmentos) | Slider | 2 a 50, paso 1 |
| `a` | Slider | −3 a 2, paso 0.5 |
| `b` | Slider | `a+0.5` a 6, paso 0.5 |
| Función | Selector | Lista predefinida |
| Mostrar panel de convergencia | Toggle | on/off |
| Resaltar segmentos individuales | Toggle | on/off |

### Funciones predefinidas
```
f(x) = x²          [derivada simple]
f(x) = sen(x)
f(x) = x^(3/2)     [curva de longitud conocida]
f(x) = ln(x)       [x ∈ [1, 4]]
f(x) = cosh(x)     [catenary, longitud = senh(b) − senh(a)]
```

---

## Cálculo de longitud de arco

```typescript
// Longitud exacta (cuadratura de Gauss-Legendre de 20 puntos)
function arcLength(f: (x:number)=>number, df: (x:number)=>number, a: number, b: number): number

// Longitud poligonal
function polylineLength(f: (x:number)=>number, a: number, b: number, n: number): number {
  let L = 0;
  const dx = (b - a) / n;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx, x1 = x0 + dx;
    const dy = f(x1) - f(x0);
    L += Math.sqrt(dx*dx + dy*dy);
  }
  return L;
}
```

---

## Panel de estado (aria-live)

```
Longitud poligonal (n=[valor]):  Lₙ = [valor]
Longitud exacta:                  L = [valor]
Error:                           |Lₙ − L| = [valor]
```

---

## Especificaciones SVG

```
Panel principal: viewBox 500 × 260, márgenes { l:44, r:16, t:16, b:32 }
Panel convergencia: viewBox 500 × 160, márgenes { l:60, r:16, t:12, b:32 }
```

---

## Texto educativo

> **Idea clave:** Para medir la longitud de una curva, la aproximamos con `n` segmentos de recta. Cada segmento tiene longitud `√(Δx² + Δy²)`. Al tomar el límite `n → ∞`, la suma converge a la integral `∫_a^b √(1 + [f'(x)]²) dx`.

> Aumenta `n` y observa cómo la poligonal naranja se pega a la curva azul. La tabla de convergencia muestra que el error disminuye con cada segmento adicional.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/ArcLengthViz.tsx
```

Exportar como `export function ArcLengthViz()`.

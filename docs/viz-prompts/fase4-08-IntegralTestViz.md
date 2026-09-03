# Prompt de desarrollo — `IntegralTestViz`

**Sección del curso:** §14.3 — Criterio integral para series  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/IntegralTestViz.tsx`

---

## Contexto

Muestra la relación visual entre la serie `Σaₙ` y la integral `∫f(x)dx` para una función `f` continua, positiva y decreciente. Los rectángulos de altura `f(n)` y base 1 se superponen a la curva, ilustrando por qué ambas convergen o divergen juntas.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva `f(x)` continua y decreciente sobre `[1, N]`
- Rectángulos de anchura 1 y altura `f(n)` para `n = 1, 2, ..., N-1`
- Modo "Acotación superior": rectángulos desplazados a la izquierda → `Σf(n) ≥ ∫_1^N f(x)dx`
- Modo "Acotación inferior": rectángulos desplazados a la derecha → `Σf(n+1) ≤ ∫_1^N f(x)dx`
- Toggle para alternar entre ambas acotaciones

### Panel de valores
```
Σ_{n=1}^{N} f(n) = [valor]
∫_1^N f(x)dx = [valor]
Relación: [desigualdad apropiada con valor numérico]
```

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `N` (número de términos) | Slider | 2 a 30 |
| Función `f(x) = 1/xᵖ` | Slider para `p` | 0.5 a 3, paso 0.1 |
| Función | Selector adicional | Ver abajo |
| Modo (acotación sup/inf) | Toggle |

### Funciones predefinidas
```
f(x) = 1/xᵖ    (slider para p — serie p)
f(x) = 1/(x·ln²x)   (converge, x > 1)
f(x) = e^(−x)        (converge)
f(x) = 1/(x·ln x)   (diverge)
```

---

## Especificaciones SVG

```
viewBox: 520 × 280
Márgenes: { l:44, r:16, t:16, b:36 }
```

---

## Texto educativo

> **Idea clave:** Si `f` es continua, positiva y decreciente, los rectángulos de altura `f(n)` acotan la integral por arriba y por abajo. Por tanto, `Σaₙ` y `∫f(x)dx` convergen o divergen juntas (aunque sus valores exactos difieran).

> Para `f(x) = 1/xᵖ`: la integral `∫_1^∞ 1/xᵖ dx` converge si `p > 1` y diverge si `p ≤ 1`. El criterio integral permite extender esto a la **serie p** `Σ1/nᵖ`.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/IntegralTestViz.tsx
```

Exportar como `export function IntegralTestViz()`.

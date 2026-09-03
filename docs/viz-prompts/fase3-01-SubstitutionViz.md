# Prompt de desarrollo — `SubstitutionViz`

**Sección del curso:** §4.1 — Método de sustitución  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/SubstitutionViz.tsx`

---

## Contexto

Muestra visualmente el cambio de variable `u = g(x)` en una integral definida: cómo la región de integración `[a, b]` en el eje `x` se transforma en `[g(a), g(b)]` en el eje `u`, y cómo el integrando cambia de forma.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Dos paneles horizontales

#### Panel izquierdo — Eje x (integral original)
- Gráfica de `f(g(x)) · g'(x)` sobre `[a, b]`
- Región sombreada bajo la curva
- El eje x etiquetado con `x`

#### Panel derecho — Eje u (integral transformada)
- Gráfica de `f(u)` sobre `[g(a), g(b)]`
- Región sombreada bajo la curva (misma área)
- El eje u etiquetado con `u`

### Animación de transformación
- Botón "Transformar": anima el paso del panel izquierdo al derecho (la región se "mueve" hacia la derecha con una transición suave)
- Una flecha curva sobre los dos paneles con la etiqueta `u = g(x)`

### Controles
| Control | Tipo |
|--------|------|
| Ejemplo | Selector de integrales predefinidas |
| `a` | Slider (límite inferior en x) |
| `b` | Slider (límite superior en x) |
| Mostrar `du = g'(x)dx` | Toggle |

### Ejemplos predefinidos
```
∫_0^1 2x · cos(x²) dx     → u = x²,  ∫_0^1 cos(u) du
∫_1^2 2x / (x²+1) dx      → u = x²+1, ∫_2^5 1/u du
∫_0^π/2 sen(x)cos(x) dx   → u = sen(x), ∫_0^1 u du
∫_0^1 x · e^(x²) dx       → u = x², ∫_0^1 e^u/2 du
```

---

## Panel de sustitución (texto)

```
u = [g(x)]       du = [g'(x)] dx
[a, b] en x  →  [g(a), g(b)] en u
∫_a^b [integrando en x] dx  =  ∫_{g(a)}^{g(b)} [integrando en u] du
```

---

## Especificaciones SVG

```
Cada panel: viewBox 280 × 220, márgenes { l:40, r:12, t:12, b:28 }
Flecha de transformación entre paneles: SVG path con flecha curva
```

---

## Texto educativo

> **Idea clave:** La sustitución `u = g(x)` transforma la integral original en una más simple. Lo crucial: **los límites de integración también cambian** de `x = a, b` a `u = g(a), g(b)`. El área sombreada es la misma en ambos ejes.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SubstitutionViz.tsx
```

Exportar como `export function SubstitutionViz()`.

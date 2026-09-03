# Prompt de desarrollo — `WorkIntegralViz`

**Sección del curso:** §10.5 — Aplicaciones: trabajo mecánico  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/WorkIntegralViz.tsx`

---

## Contexto

Muestra un objeto que se desplaza bajo una fuerza variable `F(x)`. El área bajo la curva `F(x)` representa el trabajo realizado. Incluye aplicaciones físicas concretas (resorte de Hooke, vaciado de tanque).

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel superior — Animación física
Escena animada que corresponde al ejemplo seleccionado:

- **Resorte de Hooke:** un resorte horizontal que se estira. La longitud del resorte cambia con el slider de desplazamiento `x`. Se muestra la fuerza `F = k·x` como flecha proporcional.
- **Vaciado de tanque:** tanque rectangular con nivel de agua. Un slider baja el nivel y muestra la fuerza (peso del agua) necesaria en cada altura.
- **Fuerza constante vs. variable:** comparación directa con fuerza constante (rectángulo) vs. variable (área bajo la curva).

### Panel inferior — Gráfica de `F(x)`
- Gráfica de `F(x)` sobre el intervalo de desplazamiento `[a, b]`
- Región sombreada = trabajo realizado
- Slider para el límite superior `x` que "completa" el trabajo progresivamente

### Controles
| Control | Tipo |
|--------|------|
| Ejemplo | Selector (Resorte · Tanque · Fuerza cuadrática) |
| Constante `k` (Hooke) | Slider 1 a 10 |
| Límite `b` | Slider |
| Mostrar unidades (N, J) | Toggle |

### Ejemplos predefinidos
```
Resorte de Hooke:    F(x) = k·x,         W = k·b²/2
Fuerza cuadrática:   F(x) = k·x²,        W = k·b³/3
Fuerza gravitacional: F(x) = mg (cte),    W = mg·(b−a)
Vaciado de tanque*:  F(y) = ρ·g·A·(H−y), W = ρ·g·A·H²/2
  * A = área de la sección transversal, H = altura del tanque
```

---

## Panel de estado (aria-live)

```
F(x) = [expresión]
W = ∫_a^b F(x)dx = [valor] J
Desplazamiento: [a, b] = [[a], [b]] m
```

---

## Especificaciones SVG

```
Panel animación: viewBox 480 × 180
Panel gráfica: viewBox 480 × 200
Márgenes: { l:52, r:16, t:12, b:32 }
```

---

## Texto educativo

> **Idea clave:** Cuando la fuerza es constante, `W = F · d`. Cuando varía, hay que integrar: `W = ∫_a^b F(x) dx`. El área bajo la curva `F(x)` representa visualmente el trabajo total acumulado.

> En el **resorte de Hooke** (`F = kx`), se necesita más fuerza cuanto más estirado está. Por eso el área bajo la recta `F = kx` es un triángulo: el trabajo crece cuadráticamente con el desplazamiento.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/WorkIntegralViz.tsx
```

Exportar como `export function WorkIntegralViz()`.

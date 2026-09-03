# Prompt de desarrollo — `AreaBetweenCurvesViz`

**Sección del curso:** §10.1 — Aplicaciones de la integral: área entre dos curvas  
**Fase:** 3 (Técnicas y aplicaciones)  
**Componente:** `apps/web-public/components/calculo/viz/AreaBetweenCurvesViz.tsx`

---

## Contexto

Visualiza el área entre dos curvas `f(x)` y `g(x)`, incluyendo el cálculo automático de sus intersecciones y la región sombreada. Extiende directamente la visualización de §3.4 (área con signo).

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Graficar `f(x)` (azul) y `g(x)` (naranja) sobre `[a, b]`
- La región entre las dos curvas se sombrea en verde semitransparente
- Los puntos de intersección se marcan con círculos negros y etiquetas `(xᵢ, yᵢ)`
- Si en algún subintervalo `g(x) > f(x)`, esa subregión se sombrea en rojo (área negativa, si el usuario no usa valores absolutos)

### Modo de integración
Botones para seleccionar:
- **Respecto a x:** `A = ∫_a^b [f(x) − g(x)] dx` (horizontal)
- **Respecto a y:** `A = ∫_c^d [f_inv(y) − g_inv(y)] dy` (vertical, solo para pares predefinidos con inversas conocidas)

### Controles
| Control | Tipo |
|--------|------|
| Ejemplo | Selector predefinido |
| `a` | Slider (límite izquierdo) |
| `b` | Slider (límite derecho) |
| Modo | Botones: Respecto a x · Respecto a y |
| Usar |f−g| (área geométrica) | Toggle |
| Mostrar intersecciones | Toggle |

### Pares predefinidos
```
f(x) = x²,       g(x) = x         → A = ∫_0^1 (x − x²) dx = 1/6
f(x) = √x,       g(x) = x²        → A = ∫_0^1 (√x − x²) dx = 1/3
f(x) = sen(x),   g(x) = cos(x)    → intersecciones en π/4, 5π/4
f(x) = 4 − x²,  g(x) = x + 2     → A = ∫_{-3}^{1} ...
f(x) = x³,       g(x) = x         → intersecciones en −1, 0, 1
```

---

## Panel de resultado

```
f(x) = [función]
g(x) = [función]
Intersecciones: x = [lista de valores]
A = ∫_a^b [f(x) − g(x)] dx = [valor]
```

---

## Especificaciones SVG

```
viewBox: 520 × 300
Márgenes: { l:44, r:16, t:16, b:36 }
```

Las intersecciones se calculan numéricamente con bisección (tolerancia 1e-6).

---

## Texto educativo

> **Idea clave:** El área entre dos curvas es `∫_a^b [f(x) − g(x)] dx`, donde `f(x)` es la curva superior y `g(x)` la inferior. Si las curvas se cruzan dentro de `[a, b]`, hay que dividir el intervalo en los cruces y sumar las áreas de cada parte.

> Prueba `f(x) = x³` y `g(x) = x`: tienen tres intersecciones (en x = −1, 0, 1). El área entre ellas no es simplemente `∫_{-1}^{1}(x³−x)dx = 0` — debes integrar por partes separadas y sumar los valores absolutos.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/AreaBetweenCurvesViz.tsx
```

Exportar como `export function AreaBetweenCurvesViz()`.

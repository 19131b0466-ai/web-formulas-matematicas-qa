# Prompt de desarrollo — `RiemannSumViz`

**Sección del curso:** §3.1 — Integral Definida y Teorema Fundamental del Cálculo  
**Fase:** 1 (Núcleo)  
**Componente:** `apps/web-public/components/calculo/viz/RiemannSumViz.tsx`

---

## Contexto

Este es el recurso gráfico más importante del curso de Cálculo Integral. Debe mostrar visualmente cómo las sumas de Riemann aproximan el área bajo una curva y cómo esa aproximación converge a la integral definida conforme `n → ∞`.

El componente sigue el mismo patrón que los viz del curso de Álgebra en este proyecto:
- Es un componente React con `'use client'`
- Usa SVG inline para el gráfico (sin librerías de terceros como Chart.js)
- Usa los primitivos de `./controls` (ya existentes en el proyecto): `VizPanel`, `SliderRow`, `ControlsStack`, `ButtonRow`, `VizButton`
- Usa `useState` y `useMemo` de React
- Admite temas claro/oscuro mediante variables CSS (`--fg`, `--fg-muted`, `--border`, `--accent-strong`, `--formula-bg`)
- Es completamente accesible (atributos `aria-*`, `role="img"`, `aria-live`)

---

## Comportamiento esperado

### Gráfica principal
- Dibujar la función `f(x)` como una curva SVG continua sobre el intervalo `[a, b]`
- Dibujar `n` rectángulos (o trapecios en modo trapezoidal) cuyo alto está determinado por `f(x_i*)` según el tipo de suma seleccionado
- Los rectángulos deben tener borde de color `--accent-strong` y relleno semitransparente
- Al pasar el cursor sobre un rectángulo, resaltarlo y mostrar su área individual en un tooltip o en el panel de estado

### Controles
| Control | Tipo | Rango / Opciones |
|--------|------|-----------------|
| `a` (límite inferior) | Slider | −5 a 4, paso 0.5 |
| `b` (límite superior) | Slider | `a + 0.5` a 8, paso 0.5 |
| `n` (subintervalos) | Slider | 1 a 100, paso 1 |
| Tipo de suma | Botones (`ButtonRow`) | Izquierda · Derecha · Punto medio · Trapezoidal |
| Función | Selector (`<select>`) | Lista de funciones predefinidas (ver abajo) |

### Funciones predefinidas
```
f(x) = x²
f(x) = x³ − 3x
f(x) = sen(x)
f(x) = eˣ
f(x) = √x   (solo x ≥ 0)
f(x) = 1/x  (solo x > 0)
```

### Panel de estado (aria-live)
Mostrar en todo momento:
- Valor de la suma de Riemann `Sₙ` con 4 decimales
- Valor exacto de la integral `∫_a^b f(x)dx` (calculado por cuadratura de Gauss-Legendre de alta precisión interna o con fórmula cerrada para los casos predefinidos)
- Error absoluto `|Sₙ − I|`
- Mensaje: "Conforme n aumenta, el error disminuye hacia 0."

---

## Especificaciones SVG

```
Dimensiones del viewBox: 480 × 280
Márgenes: { l: 44, r: 16, t: 16, b: 32 }
Ejes: línea horizontal (eje x) y vertical (eje y) con marcas de graduación cada unidad
Etiquetas de ejes: "x" al final del eje horizontal, "f(x)" al final del eje vertical
```

- Los rectángulos deben dibujarse **debajo** de la curva (la curva se dibuja encima en un `<g>` posterior)
- Para `n > 50` reducir la opacidad del borde de los rectángulos a `0.3` para evitar saturación visual
- El eje x se dibuja en `y = f(x) = 0` si `0` está dentro del rango visible, o en el borde inferior en caso contrario

---

## Detalles de implementación

```tsx
// Cálculo de la suma de Riemann
function riemannSum(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number,
  type: 'left' | 'right' | 'midpoint' | 'trapezoid'
): number

// Para tipo 'trapezoid':
// S = (b-a)/n * [ f(x_0)/2 + f(x_1) + ... + f(x_{n-1}) + f(x_n)/2 ]

// Para tipos 'left', 'right', 'midpoint':
// S = Σ f(x_i*) * Δx  donde x_i* depende del tipo
```

- Usar `useMemo` para recalcular los rectángulos solo cuando cambie `f`, `a`, `b`, `n` o `type`
- Usar `useMemo` separado para el valor exacto de la integral

---

## Texto educativo (en español)

Panel de guía en la parte superior del componente (dentro de `VizPanel`):

> **Idea clave:** La integral definida ∫_a^b f(x)dx es el límite de las sumas de Riemann cuando el número de subintervalos n tiende a infinito.

> Mueve el slider de **n** y observa cómo los rectángulos llenan el área bajo la curva con mayor precisión. Cambia el tipo de suma para ver cómo la elección del punto de muestra x_i* afecta el error.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/RiemannSumViz.tsx
```

El componente se exportará como `export function RiemannSumViz()` sin props requeridas (los parámetros son todos internos con `useState`).

Agregar la exportación en:
```
apps/web-public/components/calculo/viz/index.ts
```

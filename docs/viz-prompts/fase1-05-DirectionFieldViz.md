# Prompt de desarrollo — `DirectionFieldViz`

**Sección del curso:** §16.1 — Ecuaciones Diferenciales Elementales  
**Fase:** 1 (Núcleo)  
**Componente:** `apps/web-public/components/calculo/viz/DirectionFieldViz.tsx`

---

## Contexto

Visualiza el campo de pendientes (campo de direcciones) de una EDO `dy/dx = f(x, y)`. Al hacer clic en el plano, traza la solución particular que pasa por ese punto usando el método de Euler mejorado (RK4). Es la visualización fundamental para comprender las ecuaciones diferenciales de primer orden.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica — Campo de pendientes
- Una cuadrícula de puntos `(xᵢ, yⱼ)` uniformemente distribuidos en el plano visible
- En cada punto, una pequeña línea centrada con pendiente `f(xᵢ, yⱼ)` (longitud fija ≈ 0.4 unidades)
- Si `|f(x,y)| > umbral` (ej. > 10), recortar la pendiente para no saturar visualmente
- Las flechas se colorean según la magnitud de la pendiente (degradado de color opcional, toggle)

### Soluciones particulares
- El usuario hace clic en cualquier punto `(x₀, y₀)` del plano para trazar la solución particular
- La solución se integra hacia adelante y hacia atrás desde `(x₀, y₀)` con RK4
- Se pueden trazar hasta 5 soluciones simultáneas, en colores distintos
- Un botón "Limpiar soluciones" elimina todas las trazadas
- Al hacer hover sobre una solución, se muestra su condición inicial `y(x₀) = y₀`

### Controles
| Control | Tipo | Opciones |
|--------|------|---------|
| EDO `f(x,y)` | Selector | Lista predefinida (ver abajo) |
| Densidad de flechas | Slider | 8×8 a 24×24 puntos |
| Longitud de flecha | Slider | Pequeña · Media · Grande |
| Colorear por magnitud | Toggle | on/off |
| Paso de integración RK4 `h` | Slider | 0.005 a 0.05 |
| Ventana x | Slider doble | [−5, 5] ajustable |
| Ventana y | Slider doble | [−4, 4] ajustable |

### EDOs predefinidas
```
dy/dx = y                        (crecimiento exponencial)
dy/dx = −y                       (decaimiento exponencial)
dy/dx = x                        (parábolass)
dy/dx = x + y                    (lineal de primer orden)
dy/dx = y(1 − y)                 (modelo logístico, K=1)
dy/dx = −x/y                     (circunferencias, y≠0)
dy/dx = sen(x) · cos(y)          (separable trigonométrica)
dy/dx = y² − x                   (Riccati simple)
```

---

## Integración numérica (RK4)

```typescript
function rk4Step(
  f: (x: number, y: number) => number,
  x: number,
  y: number,
  h: number
): { x: number; y: number } {
  const k1 = f(x, y);
  const k2 = f(x + h/2, y + h/2 * k1);
  const k3 = f(x + h/2, y + h/2 * k2);
  const k4 = f(x + h, y + h * k3);
  return { x: x + h, y: y + h * (k1 + 2*k2 + 2*k3 + k4) / 6 };
}

// Integrar hacia adelante: pasos con h > 0
// Integrar hacia atrás:    pasos con h < 0
// Detener si |y| > límite visible * 2 o después de 2000 pasos
```

---

## Interacción al hacer clic

```tsx
const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
  // Convertir coordenadas SVG → coordenadas matemáticas
  const svgRect = svgRef.current.getBoundingClientRect();
  const svgX = e.clientX - svgRect.left;
  const svgY = e.clientY - svgRect.top;
  const mathX = xMin + (svgX - M.l) / plotW * (xMax - xMin);
  const mathY = yMax - (svgY - M.t) / plotH * (yMax - yMin);
  // Agregar nueva solución particular a la lista
  addSolution(mathX, mathY);
};
```

---

## Especificaciones SVG

```
viewBox: 520 × 400
Márgenes: { l:44, r:16, t:16, b:36 }
Ejes: x e y con etiquetas y marcas de graduación
Cuadrícula suave: líneas de cuadrícula en cada unidad entera con opacidad 0.12
```

---

## Panel de estado (aria-live)

```
EDO: dy/dx = [función seleccionada]
Soluciones trazadas: [n] / 5
Haz clic en el plano para trazar una solución particular.
```

---

## Texto educativo

> **Idea clave:** El campo de pendientes muestra, en cada punto `(x, y)` del plano, la dirección que tomaría la solución si pasara por ahí. Las soluciones particulares son curvas que "fluyen" siguiendo esas flechas.

> Haz clic en distintos puntos del plano y observa cómo pequeños cambios en la condición inicial `y(x₀) = y₀` producen trayectorias muy diferentes. Prueba el **modelo logístico**: todas las soluciones convergen a `y = 1`.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/DirectionFieldViz.tsx
```

Exportar como `export function DirectionFieldViz()`.

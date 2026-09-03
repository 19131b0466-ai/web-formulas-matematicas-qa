# Prompt de desarrollo — `PopulationModelViz`

**Sección del curso:** §16.3 — Crecimiento exponencial y modelo logístico  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/PopulationModelViz.tsx`

---

## Contexto

Grafica la solución `y(t)` del modelo de crecimiento/decaimiento exponencial y del modelo logístico, con sliders para los parámetros. Conecta visualmente la EDO con su solución y con el comportamiento a largo plazo.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel superior — Solución `y(t)`
- Gráfica de `y(t)` sobre `[0, T]`
- Para el modelo logístico: línea horizontal punteada en `y = K` (capacidad de carga)
- Para el modelo exponencial: línea de `y = 0` como referencia
- Un punto deslizable `t₀` muestra el valor actual de `y(t₀)` y `y'(t₀)`

### Panel inferior — Diagrama de fase `y' vs. y` (portrait de fase)
- Eje horizontal: valores de `y` (0 a 1.5K)
- Eje vertical: valores de `y' = r·y·(1 − y/K)` o `y' = k·y`
- Flecha en el eje horizontal que muestra si `y` crece (y' > 0) o decrece (y' < 0)
- Puntos de equilibrio marcados: `y = 0` (inestable) y `y = K` (estable, solo en logístico)
- El valor `y(t₀)` se proyecta en el diagrama de fase

### Modos
Botones para seleccionar:
- **Crecimiento exponencial:** `dy/dt = ky`, `y(t) = y₀·eᵏᵗ`
- **Decaimiento exponencial:** `dy/dt = −ky` (k > 0), `y(t) = y₀·e^(−kt)`
- **Logístico:** `dy/dt = r·y·(1 − y/K)`, `y(t) = K/(1 + ((K−y₀)/y₀)·e^(−rt))`

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `y₀` (condición inicial) | Slider | 0.01 a 2K |
| `k` o `r` (tasa) | Slider | 0.1 a 3, paso 0.1 |
| `K` (capacidad de carga) | Slider | 0.5 a 10 (solo modo logístico) |
| `T` (tiempo máximo) | Slider | 1 a 20 |
| Modo | Botones (3 modos) |
| Mostrar diagrama de fase | Toggle |

---

## Panel de estado (aria-live)

```
Modelo: [nombre]
EDO: dy/dt = [expresión]
Solución: y(t) = [expresión]
y(t₀) = [valor],  y'(t₀) = [valor]
Comportamiento: [y → ∞ | y → 0 | y → K]
```

---

## Especificaciones SVG

```
Panel solución: viewBox 520 × 240
Panel fase: viewBox 520 × 180
Márgenes: { l:52, r:16, t:12, b:32 }
```

---

## Texto educativo

> **Idea clave:** El modelo exponencial `y' = ky` produce crecimiento (k>0) o decaimiento (k<0) ilimitado. El modelo logístico `y' = ry(1−y/K)` frena el crecimiento al acercarse a la capacidad de carga `K`: todas las soluciones convergen a `K`.

> Prueba el logístico con `y₀ < K`: la curva tiene forma de "S" (sigmoide). Con `y₀ > K`: la curva decrece suavemente hasta `K`. Con `y₀ = K/2`: el crecimiento es máximo en ese punto (punto de inflexión).

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/PopulationModelViz.tsx
```

Exportar como `export function PopulationModelViz()`.

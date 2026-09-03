# Prompt de desarrollo — `ShellMethodViz`

**Sección del curso:** §10.3 — Volumen por capas cilíndricas (método del cascarón)  
**Fase:** 4 (Complementaria)  
**Componente:** `apps/web-public/components/calculo/viz/ShellMethodViz.tsx`

---

## Contexto

Anima una capa cilíndrica fina de radio `x`, altura `f(x)` y grosor `dx`. El estudiante ve cómo la integral `V = 2π ∫_a^b x·f(x) dx` acumula el volumen de todas las capas. Complementa `SolidsOfRevolutionViz` (método de discos).

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel izquierdo — Vista del plano xy (perfil)
- Gráfica de `f(x)` sobre `[a, b]`
- La capa activa se resalta: un rectángulo vertical de base `Δx` centrado en `x₀` con altura `f(x₀)`
- El radio `x₀` se marca sobre el eje x
- Slider para mover `x₀` a lo largo de `[a, b]`

### Panel derecho — Vista isométrica del cascarón 3D
- Representar el cascarón cilíndrico en proyección isométrica SVG:
  - Dos elipses (tapa superior e inferior del cascarón)
  - Cuatro líneas verticales conectando las elipses (aristas exteriores)
  - El cascarón tiene radio exterior `x₀ + Δx/2` y radio interior `x₀ − Δx/2`
  - Altura `f(x₀)`
- Botón "Ver sólido completo": muestra todos los cascarones apilados (superposición semitransparente)

### Controles
| Control | Tipo |
|--------|------|
| `x₀` (radio del cascarón activo) | Slider |
| `Δx` (grosor) | Slider (0.1 a 0.5) |
| Función `f(x)` | Selector |
| Eje de rotación | Botones: Eje x · Eje y |
| `a`, `b` | Sliders |

### Funciones predefinidas
```
f(x) = √x
f(x) = x²
f(x) = 4 − x²
f(x) = 2·x − x²
```

---

## Panel de fórmula

```
Volumen de un cascarón:
  ΔV ≈ 2π · x₀ · f(x₀) · Δx

Volumen total:
  V = 2π ∫_a^b x·f(x) dx ≈ [valor]
```

---

## Especificaciones SVG

```
Panel izquierdo: viewBox 280 × 240
Panel derecho (3D isométrico): viewBox 280 × 280
Márgenes: { l:40, r:12, t:12, b:28 }
```

---

## Texto educativo

> **Idea clave:** En el método del cascarón, cada "rodaja" vertical de la región se enrolla para formar un cilindro delgado (cascarón). El volumen de cada cascarón es `2π · radio · altura · grosor`. La integral suma todos los cascarones.

> Compara con el método de **discos**: los discos cortan el sólido horizontalmente (perpendicular al eje), los cascarones lo envuelven en capas cilíndricas. Para ciertos sólidos, uno de los dos métodos es más fácil de integrar.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/ShellMethodViz.tsx
```

Exportar como `export function ShellMethodViz()`.

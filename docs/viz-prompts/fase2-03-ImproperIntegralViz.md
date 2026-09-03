# Prompt de desarrollo — `ImproperIntegralViz`

**Sección del curso:** §9.1 — Integrales impropias (límite infinito)  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/ImproperIntegralViz.tsx`

---

## Contexto

Visualiza la convergencia o divergencia de integrales impropias con límite infinito. El estudiante ve animadamente cómo el área bajo la curva crece (o se estabiliza) conforme el límite superior `b → ∞`.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Panel izquierdo — Gráfica de `f(x)`
- Gráfica de `f(x)` desde `x = 1` hasta el valor actual de `b`
- Región bajo la curva sombreada (color `--accent-strong` semitransparente)
- El límite derecho `b` se desplaza con el slider y la región crece
- Una flecha hacia la derecha sobre el eje x indica `b → ∞`
- Si `b` está en su máximo (ej. 30), añadir `"…"` con puntos suspensivos en el eje

### Panel derecho — Función de área acumulada `A(b)`
- Grafica `A(b) = ∫_1^b f(x) dx` como función del límite superior
- El punto `(b, A(b))` se mueve al desplazar el slider
- Para funciones convergentes: la curva se estabiliza y se dibuja una línea horizontal punteada en el valor límite
- Para funciones divergentes: la curva crece sin límite (la escala del eje y se ajusta automáticamente)
- Etiqueta el valor límite: `→ [valor]` o `→ ∞`

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `b` (límite superior) | Slider | 1.5 a 40, paso 0.5 |
| Función / exponente `p` | Selector + slider | Ver abajo |
| Animar `b → ∞` | Botón | Reproduce la animación automáticamente |
| Mostrar valor límite | Toggle | on/off |

### Funciones predefinidas
Centradas en la familia `1/xᵖ` con un slider para `p`:
```
p = 0.5   → diverge  (∫_1^∞ 1/√x dx = ∞)
p = 1.0   → diverge  (serie armónica)
p = 1.5   → converge (= 2)
p = 2.0   → converge (= 1)
p = 3.0   → converge (= 0.5)
```
Además, funciones adicionales seleccionables:
```
f(x) = e^(−x)     → converge a 1
f(x) = 1/(x·ln x) → diverge  (para x > 1)
f(x) = x·e^(−x²)  → converge a 0.5
```

---

## Lógica de convergencia

```typescript
// Para f(x) = 1/x^p con p ≠ 1:
// A(b) = [x^(1-p)/(1-p)]_1^b = b^(1-p)/(1-p) - 1/(1-p)
// Límite cuando b→∞: converge si p > 1 → L = 1/(p-1)

// Para p = 1: A(b) = ln(b) → diverge

const converges = p > 1;
const limitValue = converges ? 1 / (p - 1) : Infinity;
```

---

## Especificaciones SVG

```
Panel izquierdo:  viewBox 280 × 240
Panel derecho:    viewBox 280 × 240
Ambos con márgenes { l:44, r:16, t:16, b:32 }
Mostrar en una fila o apilados según el ancho de pantalla (usar CSS flex-wrap)
```

---

## Panel de estado (aria-live)

```
f(x) = 1/xᵖ,  p = [valor]
∫_1^b f(x)dx = [valor numérico]  (b = [valor])
Límite cuando b→∞: [valor o "diverge"]
```

---

## Texto educativo

> **Idea clave:** Una integral impropia `∫_1^∞ f(x)dx` se define como el límite `lim_{b→∞} ∫_1^b f(x)dx`. Si el área bajo la curva se estabiliza, la integral **converge**; si crece sin límite, **diverge**.

> Para `f(x) = 1/xᵖ`: si `p > 1` el área converge a `1/(p−1)`; si `p ≤ 1` diverge. Sorprendentemente, la curva `1/x` parece "aplastarse" al crecer `x`, pero su área acumulada crece para siempre.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/ImproperIntegralViz.tsx
```

Exportar como `export function ImproperIntegralViz()`.

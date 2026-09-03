# Prompt de desarrollo — `SignedAreaViz`

**Sección del curso:** §3.4 — Área con signo vs. área geométrica  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/SignedAreaViz.tsx`

---

## Contexto

Ilustra la diferencia entre la integral definida (área con signo) y el área geométrica total `∫|f(x)|dx`. Es un tema donde los estudiantes cometen errores frecuentes al interpretar el resultado negativo de una integral.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Gráfica principal
- Curva `f(x)` sobre `[a, b]`
- Regiones donde `f(x) > 0` sombreadas en **verde** semitransparente (área positiva)
- Regiones donde `f(x) < 0` sombreadas en **rojo** semitransparente (área negativa)
- Los ceros de `f(x)` en `[a, b]` marcados con puntos negros sobre el eje x
- Eje x destacado con línea más gruesa

### Panel de valores
Mostrar simultáneamente:
```
Integral con signo:   ∫_a^b f(x)dx = [valor]   (puede ser negativo)
Área geométrica:      ∫_a^b |f(x)|dx = [valor]  (siempre positivo)
Área positiva:        A⁺ = [valor]
Área negativa:        A⁻ = [valor]  (valor absoluto)
Relación:             ∫f = A⁺ − A⁻
```

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| `a` | Slider | −π a π, paso 0.1 |
| `b` | Slider | `a+0.1` a π+1, paso 0.1 |
| Función | Selector | Lista predefinida |
| Separar zonas positivas/negativas | Toggle | Muestra A⁺ y A⁻ por separado |

### Funciones predefinidas
```
f(x) = sen(x)        [zeros en 0, π, 2π...]
f(x) = x² − 2       [zeros en ±√2]
f(x) = x(x−1)(x−2)  [zeros en 0, 1, 2]
f(x) = cos(x)
f(x) = x − 1
```

---

## Especificaciones SVG

```
viewBox: 500 × 280
Márgenes: { l:44, r:16, t:16, b:36 }
```

- Los ceros de `f` en `[a, b]` se calculan numéricamente (bisección con tolerancia 1e-6)
- El área se calcula por subintervalos delimitados por ceros

---

## Texto educativo

> **Idea clave:** La integral definida mide *área con signo*: las zonas bajo el eje x contribuyen negativamente. Dos regiones iguales, una positiva y una negativa, se cancelan y dan integral cero — aunque el área geométrica sea positiva.

> Pon `f(x) = sen(x)` e integra de `0` a `2π`. La integral vale **cero**, pero el área geométrica es **4**. Ahora integra solo de `0` a `π` para capturar solo la región positiva.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SignedAreaViz.tsx
```

Exportar como `export function SignedAreaViz()`.

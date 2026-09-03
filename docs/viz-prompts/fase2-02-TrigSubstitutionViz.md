# Prompt de desarrollo — `TrigSubstitutionViz`

**Sección del curso:** §7.1 — Sustitución trigonométrica y radicales cuadráticos  
**Fase:** 2 (Alta dificultad conceptual)  
**Componente:** `apps/web-public/components/calculo/viz/TrigSubstitutionViz.tsx`

---

## Contexto

Muestra el origen geométrico de las tres sustituciones trigonométricas estándar mediante triángulos rectángulos interactivos. El estudiante ve por qué cada sustitución simplifica cada tipo de radical.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Tres fichas (tabs)
Una para cada caso:

#### Ficha 1 — `√(a²−x²)` → `x = a·sen(θ)`
- Dibujar un triángulo rectángulo con:
  - Hipotenusa = `a` (lado opuesto al ángulo recto)
  - Cateto opuesto a `θ` = `x`
  - Cateto adyacente a `θ` = `√(a²−x²)`
- El ángulo `θ` se mueve con un slider (`0` a `π/2`)
- Se actualiza en tiempo real: `x = a·sen(θ)`, `√(a²−x²) = a·cos(θ)`
- Superponer un arco de circunferencia de radio `a` para mostrar que el punto `(√(a²−x²), x)` recorre un cuadrante del círculo
- Mostrar la simplificación: `√(a²−x²) = √(a²−a²sen²θ) = a·cos(θ)` (para `cos(θ)≥0`)

#### Ficha 2 — `√(a²+x²)` → `x = a·tan(θ)`
- Dibujar un triángulo rectángulo con:
  - Cateto adyacente a `θ` = `a`
  - Cateto opuesto a `θ` = `x`
  - Hipotenusa = `√(a²+x²)`
- Slider `θ` de `0` a `π/2 − 0.05`
- Actualización: `x = a·tan(θ)`, `√(a²+x²) = a·sec(θ)`
- Mostrar la simplificación: `√(a²+tan²θ·a²) = a·sec(θ)`

#### Ficha 3 — `√(x²−a²)` → `x = a·sec(θ)`
- Dibujar un triángulo rectángulo con:
  - Hipotenusa = `x`
  - Cateto adyacente a `θ` = `a`
  - Cateto opuesto a `θ` = `√(x²−a²)`
- Slider `θ` de `0` a `π/2 − 0.05` (con `x = a·sec(θ) ≥ a > 0`)
- Actualización: `x = a·sec(θ)`, `√(x²−a²) = a·tan(θ)`
- Mostrar la simplificación: `√(sec²θ·a²−a²) = a·tan(θ)`

### Controles comunes
| Control | Tipo | Rango |
|--------|------|-------|
| `a` | Slider | 0.5 a 4, paso 0.5 |
| `θ` | Slider | 0 a límite del caso, paso 0.02 |
| Mostrar ángulo θ en el triángulo | Toggle | on/off |
| Mostrar simplificación algebraica | Toggle | on/off |

---

## Especificaciones SVG (por ficha)

```
viewBox: 460 × 300
El triángulo ocupa el centro del viewBox
Ángulo recto marcado con el símbolo □
Ángulo θ marcado con un arco de color naranja
Lados etiquetados con sus expresiones matemáticas
Flechas bidireccionales entre la expresión original y la simplificada
```

---

## Panel de sustitución (debajo del triángulo)

Para la ficha activa, mostrar:
```
Sustitución:   x = a · [función](θ)
dx =           [diferencial] dθ
√[radical] =   [expresión simplificada]
Restricción:   [rango de θ]
```

---

## Texto educativo

> **Idea clave:** Cuando el integrando contiene `√(a²−x²)`, `√(a²+x²)` o `√(x²−a²)`, la sustitución trigonométrica elimina el radical usando identidades de Pitágoras. El triángulo de referencia ayuda a convertir de vuelta a la variable `x` al final.

> Mueve el slider de **θ** y observa cómo varían los lados del triángulo. La simplificación del radical se actualiza en tiempo real.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/TrigSubstitutionViz.tsx
```

Exportar como `export function TrigSubstitutionViz()`.

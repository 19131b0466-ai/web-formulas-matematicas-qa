# Prompt de desarrollo — `SolidsOfRevolutionViz`

**Sección del curso:** §10.2 — Volumen por discos y arandelas  
**Fase:** 1 (Núcleo)  
**Componente:** `apps/web-public/components/calculo/viz/SolidsOfRevolutionViz.tsx`

---

## Contexto

Visualiza el sólido de revolución generado al rotar una curva `f(x)` alrededor del eje `x` (o eje `y`). Es el recurso más impactante visualmente del curso. Usa proyección isométrica SVG (sin Three.js ni WebGL) para mantener compatibilidad con el resto del proyecto.

Sigue el mismo patrón de los viz del curso de Álgebra: componente React `'use client'`, SVG inline, controles de `./controls`, variables CSS para temas.

---

## Comportamiento esperado

### Vista principal — Proyección isométrica SVG
Representar el sólido mediante una proyección isométrica (o pseudo-3D con perspectiva paralela oblicua) usando solo SVG paths y elipses:

1. **Curva generatriz:** dibujar `f(x)` y su reflejo `−f(x)` en el plano de perfil
2. **Discos:** dibujar `n` elipses (representando los discos transversales) espaciadas uniformemente en `[a, b]`. Cada elipse tiene radio `f(xᵢ)` en el eje "vertical" y anchura reducida por el factor de perspectiva en el eje "profundidad"
3. **Superficie exterior:** rellenar el área entre las dos curvas proyectadas con degradado semitransparente
4. **Eje de rotación:** línea horizontal discontinua que representa el eje x

### Slider de ángulo de rotación
- Slider de `0°` a `360°` que "abre" el sólido progresivamente
- A `360°` el sólido está cerrado. A `180°` se ve el corte transversal interior
- Al ángulo parcial, dibujar un sector del disco más cercano al usuario como arco de elipse

### Modos
Botones para seleccionar:
- **Discos** — eje de rotación es el eje x, `V = π ∫_a^b [f(x)]² dx`
- **Arandelas** — requiere una segunda función `g(x) < f(x)`, `V = π ∫_a^b ([f(x)]² − [g(x)]²) dx`
- **Eje y** — rotación alrededor del eje y (cascarón, usa la misma visualización invertida)

### Controles
| Control | Tipo | Rango |
|--------|------|-------|
| Función `f(x)` | Selector | Lista predefinida |
| `a` | Slider | 0 a 3, paso 0.5 |
| `b` | Slider | `a+0.5` a 5, paso 0.5 |
| Ángulo de apertura | Slider | 0° a 360°, paso 5° |
| Número de discos visibles `n` | Slider | 3 a 20, paso 1 |
| Modo | Botones | Discos · Arandelas · Eje Y |
| Mostrar disco activo | Toggle | Resalta el disco donde está el cursor |

### Funciones predefinidas
```
f(x) = √x
f(x) = x²
f(x) = sen(x) + 1   [solo en [0, π]]
f(x) = 2 − x/2
f(x) = e^(−x/2)
```

Para modo Arandelas:
```
f(x) = √x,  g(x) = x     (región entre parabola y recta)
f(x) = 2,   g(x) = x²    (disco con agujero)
```

---

## Especificaciones SVG

```
viewBox: 520 × 320
Proyección isométrica: eje x → dirección (1, 0), eje z (profundidad) → dirección (cos(30°), sin(30°))
Escala: 55px por unidad en el eje x, radio escalado a 40px por unidad
```

### Algoritmo de dibujo de discos (proyección oblicua)
```
Para cada disco i en posición xᵢ:
  cx = M.l + xᵢ * scaleX                      // posición horizontal en SVG
  cy = midY                                    // línea central
  rx = perspectiveFactor * f(xᵢ) * scaleR     // semieje horizontal del elipse
  ry = f(xᵢ) * scaleR                         // semieje vertical del elipse
  
  Dibujar <ellipse cx cy rx ry> con fill semitransparente y stroke --accent-strong
```

- Ordenar los discos de atrás hacia adelante (painter's algorithm) para simular profundidad
- El disco en la posición del cursor del usuario se resalta con opacidad plena

---

## Panel de estado (aria-live)

```
f(x) = [función seleccionada]
V = π ∫_a^b [f(x)]² dx ≈ [valor numérico] unidades³
Intervalo: [a, b] = [[valor a], [valor b]]
```

---

## Texto educativo

> **Idea clave:** Al rotar la región bajo `f(x)` alrededor del eje x, cada punto genera un círculo. La "pila" de todos esos círculos (discos) forma el sólido. Su volumen es la suma (integral) de las áreas de los discos: `V = π ∫_a^b [f(x)]² dx`.

> Mueve el slider de **ángulo** para ver cómo el sólido se forma por rotación. Activa el modo **Arandelas** cuando la región a rotar tiene un agujero en el centro.

---

## Estructura del archivo

```
apps/web-public/components/calculo/viz/SolidsOfRevolutionViz.tsx
```

Exportar como `export function SolidsOfRevolutionViz()`.

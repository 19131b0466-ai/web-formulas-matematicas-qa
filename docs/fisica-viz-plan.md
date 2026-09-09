# Recursos gráficos — Física Básica

Plan de implementación. Fuente de verdad del catálogo: `content/formulas-fisica-basica.md` (195 fórmulas con ID). Este documento fija **qué** se construye, **dónde** se monta, **cómo** se comporta y **qué texto** lleva cada recurso.

No se implementa nada aquí: es la especificación para construir.

---

## 0. Estado actual (revisión)

### Álgebra — modelo de contenido + familias

| Pieza | Dónde | Qué hace |
|---|---|---|
| Copy y contrato visual | `content/formulas-algebra.md` | Bloque `### Visualización sugerida` con **Tipo**, **Modo**, **Concepto visual**, **Elementos**, **Idea**, **Objetivo educativo**, **Interactividad sugerida**. ~100 bloques. |
| Parser | `packages/content-parser/src/parse-algebra-markdown.ts` | Guarda el bloque en `FormulaContent.visual`. |
| Tipos | `packages/shared-types` → `FormulaVisual` | `type` es una familia (`vector`, `algebra_tiles`, …); `mode` es la lección concreta (`dot`, `commute`, …). |
| Router | `apps/web-public/components/algebra/FormulaVisualization.tsx` | `switch (visual.type)` → un componente familia. |
| Modos | `apps/web-public/lib/viz-modes.ts` | `resolveMode(formulaId, type, visual.mode)`. Inferencia por `formulaId.includes(...)`. |
| Guía embebida | `vizHasEmbeddedGuide(formulaId)` | Si el panel ya trae “Vas a ver que…”, **no** se duplica Idea/Objetivo encima (principio P0). |
| Pedagogía | `docs/algebra-viz-interaction-plan.md` | P0 una explicación; P1 acción/reorden en un lienzo; P2 dual solo si hay dos construcciones distintas; P3 descomposición in situ; P4 toggle que **reemplaza** la escena. |
| Primitivos | `apps/web-public/components/algebra/viz/controls.tsx` | `VizPanel`, `SliderRow`, `ControlsStack`, `ButtonRow`, `VizButton`, `ToggleRow`, `fmt`, `joinCaption`. |
| Vectores 2D | `math2d.ts`, `vectorPlane.tsx` | `VEC_W=420`, `VEC_H=320`, `COLOR_U/V/W`, `useVecDrag`, ejes, arco menor. |
| Render | SVG inline, `'use client'`, variables CSS (`--fg`, `--fg-muted`, `--border`, `--accent-strong`, `--formula-bg`). Sin Chart.js. |
| Copy | Segunda persona, tú: **“Vas a ver que…”** + instrucción de qué mover. |

`VectorViz` **no** es un gráfico genérico: despacha por ID de álgebra (`ALG-VEC-001` → `VectorRnViz`, `ALG-VEC-004` → `DotProductViz`, …). Usa `formulaId.includes('VEC-001')`, que **también coincidiría** con física `VEC-001`.

### Cálculo integral — modelo de mapa por ID

| Pieza | Dónde | Qué hace |
|---|---|---|
| Mapa | `packages/shared-types/src/calculo-viz.ts` | `CALCULO_VIZ_BY_FORMULA_ID` y `CALCULO_VIZ_BY_SECTION_NUMBER`. Un `type` por concepto. |
| Enrich | `packages/content-parser/src/enrich-calculo.ts` → `attachFormulaVisuals` | Rellena `content.visual` para el badge del catálogo. |
| Router | `apps/web-public/components/calculo/CalculoVisualization.tsx` | `dynamic()` por componente; 28 viz. |
| Montaje fórmula | `FormulaDetail.tsx` | Si `subject === 'calculo-ii'` usa el mapa, no `content.visual` de álgebra. |
| Montaje sección | `SectionView.tsx` | Solo `7.1` y `17` (no hay una sola fórmula ancla). |
| Copy | `messages/*/vizCalc` (y namespaces por viz) | Guía **dentro** del `VizPanel`. |
| Plan original | `docs/calculo-integral-viz-plan.md` | Fases 1–4, todas hechas. |

Regla de cálculo (reutilizarla): **formula-hosted** si hay un ID que define la idea; **section-hosted** solo si no hay fórmula única (guía de métodos).

### Física hoy

- 195 fórmulas, parser `parse-physics-markdown.ts`, **cero** bloques de visualización.
- Detalle: `apps/web-public/components/physics/FormulaDetail.tsx` — rama cálculo o `content.visual`. Física nunca entra en la primera y no tiene la segunda.
- Catálogo: el badge `viz` solo mira `calculoVizForFormulaId` o `content.visual`.
- SEO en `formula/[id]/page.tsx`: `hasVisualization` ignora física.
- Slug del curso: `fisica-basica`. Rutas: `/fisica-basica/formula/{ID}`, `/fisica-basica/seccion/{slug}`, guía `/fisica-basica/guia` (`guia-enfoque`).
- Convención del catálogo (obligatoria en todos los viz): eje vertical **positivo hacia arriba** ⇒ \(a_y=-g\).

---

## 1. Arquitectura de implementación (cerrada)

Física sigue el **cableado de cálculo** (mapa TypeScript por ID exacto) y la **pedagogía de álgebra** (una lección por escena, guía embebida, P0–P4, primitivos SVG).

### 1.1 Por qué no reutilizar `FormulaVisualization` / `VectorViz`

1. `VectorViz` despacha con `includes('VEC-001')`. Física `VEC-001` es **módulo**; álgebra `ALG-VEC-001` es **vector en ℝⁿ**. El alumno vería el gráfico equivocado.
2. IDs cortos de física (`EQU-001`, `VEC-005`, …) no son el mismo concepto que `ALG-EQU-001` / `ALG-VEC-005`.
3. El markdown de física no tiene `Visualización sugerida`; extender el parser a 195 bloques no es necesario para montar el recuso.

**Prohibido:** montar un viz de álgebra o de cálculo en una página de física (copy, símbolos y unidades distintos). Sí se **importan primitivos** (`controls`, `math2d`, `vectorPlane`, `integrate` de `calcMath`).

### 1.2 Archivos nuevos

```
packages/shared-types/src/fisica-viz.ts
apps/web-public/components/physics/PhysicsVisualization.tsx
apps/web-public/components/physics/viz/physMath.ts
apps/web-public/components/physics/viz/index.ts
apps/web-public/components/physics/viz/*.tsx     # un archivo por componente de la §4
```

Mapa (mismo contrato que cálculo):

```ts
export type FisicaSectionViz = { type: string; concept: string; mode?: string };

export const FISICA_VIZ_BY_FORMULA_ID: Record<string, FisicaSectionViz> = { /* §6 */ };
export const FISICA_VIZ_BY_SECTION_NUMBER: Record<string, FisicaSectionViz> = {
  '18': { type: 'approach_guide', concept: 'Elegir el bloque de fórmulas según la señal del enunciado' },
};

export function fisicaVizForFormulaId(id: string): FisicaSectionViz | undefined;
export function fisicaVizForSectionNumber(number: string): FisicaSectionViz | undefined;
```

Comparar IDs con igualdad estricta (`VEC-001`), nunca `includes`.

### 1.3 Cableado (orden de trabajo, independiente de las fases de viz)

1. Exportar el mapa desde `packages/shared-types/src/index.ts`.
2. `PhysicsVisualization.tsx`: `dynamic()` como `CalculoVisualization`; props `{ type, mode?, formulaId? }`.
3. `FormulaDetail.tsx`: si `subject === 'fisica-basica'`, montar `PhysicsVisualization` **después de Detalle y antes de Variables** (mismo sitio que cálculo). Título de sección: traducción `formula.visualization`.
4. `FormulaCatalog.tsx`: badge `viz` también si `fisicaVizForFormulaId(id)`.
5. `SectionView.tsx`: si física, `fisicaVizForSectionNumber(section.number)` al pie (solo cap. 18).
6. `app/[locale]/[subject]/formula/[id]/page.tsx`: `hasVisualization` incluye física.
7. Copy i18n: namespace `vizFisica` en `apps/web-public/messages/{es,en,de,fr,it,pt}.json`. El español de las fichas es la fuente; los otros idiomas se traducen en la misma PR o inmediatamente después, no se dejan claves vacías.
8. **No** hace falta reseed de base de datos: el mapa se consume en render, como el detalle de cálculo.

### 1.4 Contrato de cada componente

- `'use client'`. Export nombrado `export function FooViz({ mode }: { mode?: string })`.
- Primitivos: solo `controls.tsx` de álgebra.
- Tema: variables CSS; colores de vector `COLOR_U` / `COLOR_V` / `COLOR_W` (posición / velocidad / aceleración o \(\vec A\) / \(\vec B\) / resultado).
- Accesibilidad: el SVG tiene `role="img"` y `aria-label`; el bloque numérico tiene `aria-live="polite"`.
- Guía **dentro** del panel (P0). No pintar Idea/Objetivo otra vez en `FormulaDetail`.
- Unidades SI en el caption (`m`, `m/s`, `m/s²`, `N`, `J`, …). Toggle “mostrar unidades” solo si el recuso mezcla lecturas (trabajo, energía).
- Animación: patrón de `ParametricCurveViz` (`requestAnimationFrame`, Play/Pausa, slider de \(t\)).
- \(g=9.81\,\mathrm{m/s^2}\) por defecto. Slider opcional \(9.80\)–\(10.00\) solo en caída libre, proyectil y péndulo.
- Sin resistencia del aire en v1. Si hay toggle, va desactivado y el label es “Resistencia del aire (fuera del catálogo)”.

### 1.5 `physMath.ts` (obligatorio antes de cinemática)

```ts
export const G = 9.81;
export function clamp(n, a, b)
export function hypot2(x, y)
// MRUA (eje con signo; a puede ser −g)
export function vMrua(v0, a, t)           // v0 + a t
export function xMrua(x0, v0, a, t)       // x0 + v0 t + ½ a t²
export function torricelli(v0, a, dx)     // v0² + 2 a Δx
// Proyectil, y hacia arriba, a_x=0, a_y=−g, mismo nivel
export function projectileState(v0, theta, t, g, x0=0, y0=0)
  // { x, y, vx, vy, speed }
export function projectileTmax(v0, theta, g)      // v0 sinθ / g
export function projectileH(v0, theta, g)         // v0² sin²θ / (2g)
export function projectileTflight(v0, theta, g)   // 2 v0 sinθ / g   (y_f = y0)
export function projectileRange(v0, theta, g)     // v0² sin(2θ) / g
// MAS
export function shmX(A, omega, t, phi)    // A cos(ωt+φ)
export function shmV(A, omega, t, phi)    // −A ω sin(ωt+φ)
export function shmA(x, omega)            // −ω² x
```

Ángulos de UI en **grados**; conversión interna a radianes en un solo sitio (`degToRad`).

### 1.6 Chrome SVG por defecto (no repetir en cada ficha)

**Gráfica \(f(t)\) o \(f(x)\):** viewBox `480×280`, márgenes `{ l: 48, r: 16, t: 16, b: 36 }`, eje con ticks, etiqueta de magnitud y unidad. Curva `stroke=var(--accent-strong)` ancho 2. Área `fillOpacity=0.22`.

**Plano vectorial:** `420×360` (o `VEC_W` × 360), origen centrado, escala 1:1, arrastre en la punta, círculo de hit `r=9`.

**Escena de movimiento (proyectil, MAS, circular):** viewBox `480×240` para la escena + gráficas debajo. Suelo / eje con línea `--border`.

**Isométrico 3D (solo producto cruz y órbita):** proyección \(x'=x-z\), \(y'=y+(x+z)/2\) o equivalente documentada en el archivo; no Three.js en v1.

---

## 2. Principios pedagógicos (física)

Se copian de álgebra y se añade uno de física.

| Id | Regla |
|---|---|
| **P0** | Una explicación. Guía embebida; no duplicar el **Detalle** del markdown. |
| **P1** | Reorden / misma cantidad: un lienzo + acción (p. ej. punta-cola ↔ paralelogramo por **botón**, no dual permanente). |
| **P2** | Dual solo si hay **dos construcciones distintas** (área bajo \(F(x)\) vs resorte deformado). |
| **P3** | Descomposición in situ (peso en el plano: \(mg\sin\theta\) y \(mg\cos\theta\) sobre el mismo dibujo). |
| **P4** | Dos representaciones que el alumno debe **alternar** (elástico ↔ inelástico reemplazan la escena). |
| **P-PHYS** | La escena y las gráficas \(x(t),v(t),a(t)\) (o \(F\), \(K\), \(U\)) están **acopladas al mismo \(t\)**. Un punto naranja es “ahora”. |

**No hacer un viz** si la fórmula es: conversión de unidades, constante tabulada, reescritura algebraica ya leída en el recuso ancla, o un cociente sin geometría (`ENE-015`, `TER-001`). En ese caso la página **no** monta gráfico (el alumno usa Relacionadas).

**Sí montar el mismo componente en IDs hermanos** con `mode` que cambia el resalte y el texto, como `INT-163` / `INT-165` en cálculo. Eso cubre familias (proyectil, MRUA, MAS) sin 195 componentes.

---

## 3. Mapa de prioridades

| Prioridad | Recurso | IDs ancla | Por qué |
|---|---|---|---|
| ★★★ | `ProjectileMotionViz` | MOV-014 | Recurso central del curso; une vectores + cinemática 1D |
| ★★★ | `Kinematics1DViz` | CIN-009 | Pendiente = \(v\), área = \(\Delta x\); base de todo lo demás |
| ★★★ | `SHMViz` | OSC-003 | \(x,v,a\) y \(K\leftrightarrow U\) en un ciclo |
| ★★★ | `InclinedPlaneViz` | NEW-008 | Error clásico de componentes del peso |
| ★★★ | `CircularMotionViz` | CIR-006 | \(a_c\) hacia el centro, no “fuerza centrífuga” |
| ★★ | `CrossProductViz` | VEC-006 | No existe en álgebra; hace falta para torque y \(L\) |
| ★★ | `FreeFallViz` | CIN-015 | Convención \(y\) arriba, \(a_y=-g\) |
| ★★ | `Collision1DViz` | MOM-007 | Elástico vs inelástico, \(p\) vs \(K\) |
| ★★ | `WorkVariablePhysicsViz` | ENE-002 | Área = trabajo (pariente de `WorkIntegralViz`, copy de física) |
| ★★ | `BernoulliViz` | FLU-009 | Continuidad + altura + presión |
| ★★ | `TravelingWaveViz` | OND-005 | \(y(x,t)\) que realmente viaja |
| ★★ | `NewtonSecondLawViz` | NEW-002 | DCL + \(\sum F=ma\) |
| ★ | resto de la §4 | — | Complemento; no bloquean la fase 1 |

---

## 4. Fichas de recursos

En cada ficha, **lugar** = página de detalle `/{locale}/fisica-basica/formula/{ID}` salvo que se diga sección. El componente se monta en el bloque Visualización.

Los textos **Idea** y **Prueba** van dentro del `VizPanel`, en ese orden, `text-sm`. Idea en `text-[var(--fg)]`; Prueba en `text-[var(--fg-muted)]`.

---

### 4.1 Vectores (cap. 1) — sección `vectores`

#### VectorMagnitudeViz

| Campo | Valor |
|---|---|
| **Tipo** | `vector_magnitude` |
| **Componente** | `physics/viz/VectorMagnitudeViz.tsx` |
| **Ancla** | `VEC-001` §1.1 Magnitud |
| **También** | — |
| **Enseña** | \(\lvert\vec A\rvert=\sqrt{A_x^2+A_y^2}\) es la longitud de la flecha, no la suma \(\lvert A_x\rvert+\lvert A_y\rvert\). |
| **Principio** | P3 |
| **Layout** | Un plano. Flecha \(\vec A\) arrastrable; triángulo rectángulo punteado \(A_x\) (eje \(x\)), \(A_y\) (eje \(y\)); hipotenusa = módulo. |
| **Controles** | Sliders \(A_x,A_y\in[-4,4]\) paso 0.1; arrastre de la punta. Sin \(A_z\) en v1 (el catálogo da 3D; el gráfico 2D basta y el caption dice “en el plano; en 3D se suma \(A_z^2\)”). |
| **Estado** | \(\lvert\vec A\rvert=…\,\mathrm{m}\) (o u.a.) · \(A_x\) · \(A_y\). Si \(\vec A=\vec 0\), “el módulo es 0; no hay dirección”. |
| **Idea** | Vas a ver que el módulo es la longitud de la flecha: la hipotenusa del triángulo de componentes, no \(\lvert A_x\rvert+\lvert A_y\rvert\). |
| **Prueba** | Arrastra la punta o mueve \(A_x\) y \(A_y\). Compara el número \(\sqrt{A_x^2+A_y^2}\) con la longitud dibujada. |
| **Reutilizar** | `vectorPlane.tsx`, `norm` de `math2d`. **No** montar `NormEuclideanViz` (símbolos \(u\), copy de álgebra). |
| **No hacer** | Dual “fórmula vs flecha” en dos paneles. |

#### UnitVectorPhysicsViz

| Campo | Valor |
|---|---|
| **Tipo** | `unit_vector` |
| **Componente** | `physics/viz/UnitVectorPhysicsViz.tsx` |
| **Ancla** | `VEC-002` §1.2 |
| **Enseña** | \(\hat u_A=\vec A/\lvert\vec A\rvert\) conserva dirección; longitud 1. |
| **Principio** | P3 |
| **Layout** | Un plano. \(\vec A\) (accent) y \(\hat u_A\) (teal) sobre la **misma** recta soporte; circunferencia unidad. |
| **Controles** | Arrastre de \(\vec A\); sliders \(A_x,A_y\). |
| **Estado** | \(\lvert\vec A\rvert\), \(\lvert\hat u\rvert=1\), componentes de \(\hat u\). Si \(\lvert\vec A\rvert=0\): “no hay unitario (condición del catálogo)”. |
| **Idea** | Vas a ver que normalizar un vector deja la dirección igual y fija la longitud en 1. |
| **Prueba** | Alarga o acorta \(\vec A\): \(\hat u_A\) no se sale de la circunferencia unidad. |
| **Reutilizar** | Geometría de `UnitVectorViz`; copy y símbolos \(\vec A\), \(\hat u_A\) propios. |

#### VectorDecompositionViz

| Campo | Valor |
|---|---|
| **Tipo** | `vector_decomposition` |
| **Componente** | `physics/viz/VectorDecompositionViz.tsx` |
| **Ancla** | `VEC-003` §1.3 |
| **También** | `MOV-001` modo `position` — el mismo dibujo con etiqueta \(\vec r=(x,y)\) y punto en el plano. |
| **Enseña** | \(A_x=A\cos\theta\), \(A_y=A\sin\theta\); \(\theta\) desde \(+x\), sentido antihorario. |
| **Principio** | P3 |
| **Layout** | Polar + cartesiano en un plano: flecha, arco \(\theta\), proyecciones a los ejes. |
| **Controles** | Slider \(A\in[0.5,4]\); slider \(\theta\in[0,360)\)° paso 1; arrastre de la punta (actualiza \(A\) y \(\theta\)). |
| **Estado** | \(A\), \(\theta\), \(A_x\), \(A_y\). Modo `position`: \(x\), \(y\), \(\lvert\vec r\rvert\). |
| **Idea (VEC-003)** | Vas a ver que un vector en el plano son dos catetos: \(A\cos\theta\) horizontal y \(A\sin\theta\) vertical. |
| **Prueba (VEC-003)** | Gira \(\theta\). En 0° solo hay \(A_x\); en 90° solo \(A_y\); en 180° \(A_x\) es negativo. |
| **Idea (MOV-001)** | Vas a ver que la posición es un vector desde el origen hasta el punto: \(\vec r=x\,\hat\imath+y\,\hat\jmath\). |
| **Prueba (MOV-001)** | Mueve el punto: las coordenadas son las componentes de \(\vec r\). |
| **No hacer** | Segundo panel con la misma flecha. |

#### VectorAdditionViz

| Campo | Valor |
|---|---|
| **Tipo** | `vector_addition` |
| **Componente** | `physics/viz/VectorAdditionViz.tsx` |
| **Ancla** | `VEC-004` §1.4 |
| **Enseña** | \(\vec R=\vec A+\vec B\) por componentes y por punta-cola: el mismo \(\vec R\). |
| **Principio** | P4 (no dual permanente) |
| **Layout** | Un plano. Botón **Punta-cola** / **Paralelogramo** **reemplaza** la construcción. \(\vec R\) siempre visible. |
| **Controles** | Arrastre de \(\vec A\) y \(\vec B\); toggle de construcción. |
| **Estado** | \(R_x=A_x+B_x\), \(R_y=A_y+B_y\), \(\lvert\vec R\rvert\). |
| **Idea** | Vas a ver que sumar vectores es sumar componentes: punta-cola y paralelogramo construyen el mismo \(\vec R\). |
| **Prueba** | Cambia de construcción: \(\vec R\) no se mueve. Arrastra \(\vec A\) o \(\vec B\) y mira \(R_x=A_x+B_x\). |
| **No hacer** | Dos filas fijas “antes / después”. |

#### DotProductPhysicsViz

| Campo | Valor |
|---|---|
| **Tipo** | `dot_product` |
| **Componente** | `physics/viz/DotProductPhysicsViz.tsx` |
| **Ancla** | `VEC-005` §1.5 |
| **Enseña** | \(\vec A\cdot\vec B=AB\cos\theta=A_xB_x+A_yB_y\); signo = alineación; 90° ⇒ 0. Base de \(W=\vec F\cdot\vec d\). |
| **Layout** | Como `DotProductViz` de álgebra: proyección de \(\vec B\) sobre \(\vec A\), arco \(\theta\), marca de 90°. Símbolos \(\vec A,\vec B\). |
| **Controles** | Arrastre; presets Agudo / 90° / Obtuso; sliders de componentes \(\in[-4,4]\). |
| **Estado** | \(A\cdot B\), \(\theta\), \(\mathrm{comp}_A(B)\). Badge: positivo / cero / negativo. |
| **Idea** | Vas a ver que el producto escalar mide cuánto apunta un vector en la dirección del otro: máximo si van juntos, cero si son perpendiculares, negativo si se oponen. |
| **Prueba** | Pon 90°: el producto se anula y la proyección se reduce a un punto. Abre el ángulo y mira el signo. |
| **Reutilizar** | Copiar geometría de `DotProductViz`; no importar el componente (copy \(u,v\)). |

#### CrossProductViz

| Campo | Valor |
|---|---|
| **Tipo** | `cross_product` |
| **Componente** | `physics/viz/CrossProductViz.tsx` |
| **Ancla** | `VEC-006` §1.6 |
| **También** | `ROT-008` modo `torque` (\(\vec\tau=\vec r\times\vec F\)); `ROT-012` modo `angular_momentum` (\(\vec L=\vec r\times\vec p\)). **No** ROT-009 (\(\tau=I\alpha\): eso es `TorqueViz`). |
| **Enseña** | \(\lvert\vec A\times\vec B\rvert=AB\sin\theta\) = área del paralelogramo; dirección perpendicular (regla de la derecha). |
| **Principio** | P2 justificado: plano del paralelogramo + eje del producto (no es la misma construcción). |
| **Layout** | Vista isométrica de tres ejes. \(\vec A\), \(\vec B\) en un plano; paralelogramo semitransparente; \(\vec A\times\vec B\) según el eje \(z\) de la escena (signo: \(\odot\) hacia el observador si \(A_xB_y-A_yB_x>0\)). |
| **Controles** | Sliders \(A_x,A_y,B_x,B_y\in[-3,3]\); slider \(\theta\) opcional que rota \(\vec B\) respecto de \(\vec A\). Modo torque: sliders \(r\), \(F\), \(\theta\) entre \(\vec r\) y \(\vec F\). |
| **Estado** | \(AB\sin\theta\), signo, “hacia +z / hacia −z”. Modo torque: \(\tau=rF\sin\theta\) en N·m. |
| **Idea (VEC-006)** | Vas a ver que el producto vectorial es un vector perpendicular al plano de \(\vec A\) y \(\vec B\), y que su módulo es el área del paralelogramo. |
| **Prueba (VEC-006)** | Pon \(\theta=0^\circ\): el área y el producto se anulan. En 90° el área es máxima. |
| **Idea (ROT-008)** | Vas a ver que el torque \(\vec\tau=\vec r\times\vec F\) es máximo cuando la fuerza es perpendicular a \(\vec r\), y nulo si \(\vec F\) va a lo largo de \(\vec r\). |
| **Prueba (ROT-008)** | Alinea \(\vec F\) con \(\vec r\): \(\tau=0\) y no hay giro. |
| **Idea (ROT-012)** | Vas a ver que \(\vec L=\vec r\times\vec p\) usa la misma geometría: momento lineal “cruzado” con la posición. |
| **No hacer** | Animación de mano realista; basta la convención \(\odot/\otimes\) y el eje dibujado. |

---

### 4.2 Cinemática 1D (cap. 2) — sección `cinematica-1d`

#### Kinematics1DViz

Recurso de familia. Tres gráficas apiladas \(x(t)\), \(v(t)\), \(a(t)\) (misma escala de tiempo) + escena 1D (punto en una recta horizontal).

| Campo | Valor |
|---|---|
| **Tipo** | `kinematics_1d` |
| **Componente** | `physics/viz/Kinematics1DViz.tsx` |
| **Ancla por modo** | ver tabla |
| **Enseña** | \(v\) es la pendiente de \(x(t)\); \(a\) es la pendiente de \(v(t)\); el área bajo \(v\) es \(\Delta x\). |
| **Principio** | P-PHYS |
| **Layout** | Escena arriba (punto, \(x_0\), \(x(t)\), flecha \(v\)). Debajo, 1–3 gráficas según modo (no mostrar las tres siempre: el modo decide el foco; las otras pueden ir en trazo gris). |
| **Ley de movimiento** | Por defecto MRUA: sliders \(x_0\in[-8,8]\,\mathrm{m}\), \(v_0\in[-10,10]\,\mathrm{m/s}\), \(a\in[-6,6]\,\mathrm{m/s^2}\), \(t\in[0,t_{\max}]\) con \(t_{\max}=6\,\mathrm{s}\). Modos `var_a` / `var_v`: \(a(t)\) o \(v(t)\) eligiendo un perfil (`const`, `lineal`, `escalón`). |
| **Animación** | Play / Pausa; el punto naranja recorre las tres gráficas. |

**Modos y copy**

| Modo | ID | Foco visual | Idea | Prueba |
|---|---|---|---|---|
| `displacement` | CIN-001 | Recta: marcas \(x_i\), \(x_f\), flecha \(\Delta x=x_f-x_i\) (puede ser negativa). | Vas a ver que el desplazamiento es \(x_f-x_i\), con signo: no es lo mismo que la distancia recorrida. | Pon \(x_f<x_i\): \(\Delta x\) apunta a la izquierda y el número es negativo. |
| `avg_velocity` | CIN-002 | En \(x(t)\), cuerda entre \((t_i,x_i)\) y \((t_f,x_f)\); pendiente \(=\Delta x/\Delta t\). | Vas a ver que la velocidad media es la pendiente de la cuerda que une dos instantes, no la pendiente local. | Acorta \(\Delta t\): la cuerda se parece a la tangente (puente a CIN-004). |
| `avg_speed` | CIN-003 | Trayectoria de ida y vuelta en la recta; \(\Delta x\) vs longitud de arco \(d_{\text{total}}\). | Vas a ver que la rapidez media usa la distancia total, no el desplazamiento: puedes volver al origen con rapidez media > 0 y \(v_{\mathrm{med}}=0\). | Haz ir y volver al mismo \(x\): \(\Delta x=0\) y \(d_{\text{total}}>0\). |
| `inst_velocity` | CIN-004 | Tangente a \(x(t)\) en \(t\); valor \(=v(t)\). | Vas a ver que la velocidad instantánea es la pendiente de la tangente a \(x(t)\). | Mueve \(t\) y compara la pendiente dibujada con el número \(v(t)\). |
| `avg_accel` | CIN-005 | Cuerda en \(v(t)\). | Vas a ver que la aceleración media es el cambio de velocidad por unidad de tiempo: pendiente de la cuerda en \(v(t)\). | Igual que en velocidad media, ahora sobre \(v(t)\). |
| `inst_accel` | CIN-006 | Tangente a \(v(t)\); también \(a=d^2x/dt^2\). | Vas a ver que la aceleración instantánea es la pendiente de \(v(t)\), igual a la derivada segunda de \(x(t)\). | Con \(a\) constante, \(v(t)\) es una recta y la pendiente no cambia. |
| `mru` | CIN-007 | \(a=0\) bloqueado; \(x(t)\) recta; \(v(t)\) horizontal. | Vas a ver que si \(a=0\), \(x=x_0+vt\) es una recta y \(v\) no cambia. | Cambia \(v\): la pendiente de \(x(t)\) es exactamente ese valor. |
| `mrua_v` | CIN-008 | Resalte \(v=v_0+at\); gráfica \(v(t)\) lineal. | Vas a ver que con \(a\) constante la velocidad cambia linealmente: \(v=v_0+at\). | Pon \(a<0\): \(v(t)\) baja y puede cruzar cero (cambio de sentido). |
| `mrua_x` | CIN-009 | Resalte \(x=x_0+v_0t+\tfrac12 at^2\); parábola. | Vas a ver que la posición con aceleración constante es una parábola en el tiempo. | Cambia el signo de \(a\) y de \(v_0\): la concavidad sigue el signo de \(a\). |
| `torricelli` | CIN-010 | Gráfica \(v\) vs \(x\) (no vs \(t\)); etiqueta \(v_f^2=v_0^2+2a\Delta x\). | Vas a ver que Torricelli relaciona velocidades y desplazamiento **sin** usar \(t\). | Ajusta \(a\) y \(\Delta x\); el \(t\) no aparece en el caption. |
| `mrua_avg` | CIN-011 | En \(v(t)\), rectángulo de altura \((v_0+v_f)/2\) y base \(t\); área \(=\Delta x\). | Vas a ver que, con \(a\) constante, \(\Delta x\) es la velocidad media por el tiempo. | Compara el área del trapecio \(v(t)\) con el rectángulo de altura \((v_0+v_f)/2\). |
| `var_a` | CIN-012 | Área bajo \(a(t)\) desde \(t_0\) hasta \(t\) = \(\Delta v\). | Vas a ver que \(v(t)=v(t_0)+\int_{t_0}^{t}a(\tau)\,d\tau\): el área bajo \(a(t)\) es el cambio de velocidad. | Elige el perfil escalón: \(v\) gana una rampa solo mientras \(a\neq 0\). |
| `var_v` | CIN-013 | Área bajo \(v(t)\) = \(\Delta x\). | Vas a ver que \(x(t)=x(t_0)+\int_{t_0}^{t}v(\tau)\,d\tau\): el área bajo \(v(t)\) es el desplazamiento. | Área sobre el eje \(t\) suma; área bajo el eje resta (signo). |

**Reutilizar:** idea visual de `TFCAccumulationViz` / `RiemannSumViz` solo en `var_a` y `var_v` (área). No montar esos componentes.

#### FreeFallViz

| Campo | Valor |
|---|---|
| **Tipo** | `free_fall` |
| **Componente** | `physics/viz/FreeFallViz.tsx` |
| **Ancla** | `CIN-015` posición |
| **También** | CIN-014 `velocity`; CIN-016 `torricelli`; CIN-017 `hmax`; CIN-018 `t_up`; CIN-019 `t_flight` |
| **Enseña** | Eje \(y\) hacia arriba, \(a_y=-g\); en la cima \(v_y=0\); ida y vuelta simétricas si se vuelve a \(y_0\). |
| **Layout** | Torre / suelo; partícula; marcas \(y_0\), \(y_{\max}\). Gráficas \(y(t)\) (parábola invertida) y \(v_y(t)\) (recta de pendiente \(-g\)). |
| **Controles** | \(y_0\in[0,40]\,\mathrm{m}\); \(v_{0y}\in[-5,25]\,\mathrm{m/s}\); \(g\in[9.80,10.00]\); \(t\) animado hasta \(t_{\mathrm{vuelo}}\) o impacto en \(y=0\) si hay suelo. Toggle **Suelo en y=0** (por defecto on). |
| **Fórmulas** | \(v_y=v_{0y}-gt\); \(y=y_0+v_{0y}t-\tfrac12 gt^2\); \(v_y^2=v_{0y}^2-2g(y-y_0)\); si \(v_{0y}>0\) y mismo nivel: \(\Delta h_{\max}=v_0^2/(2g)\), \(t_{\mathrm{subida}}=v_0/g\), \(t_{\mathrm{vuelo}}=2v_0/g\). |
| **Idea (CIN-015)** | Vas a ver que, con el eje hacia arriba, la posición es \(y=y_0+v_{0y}t-\tfrac12 gt^2\): el término de \(g\) resta. |
| **Prueba (CIN-015)** | Lanza hacia arriba y observa la parábola \(y(t)\). En la cima \(v_y=0\) y \(y\) es máximo. |
| **Idea (CIN-014)** | Vas a ver que \(v_y\) baja en \(g\) metros por segundo cada segundo (\(v_y=v_{0y}-gt\)). |
| **Prueba (CIN-014)** | Mira la recta \(v_y(t)\): la pendiente es \(-g\), no \(+g\). |
| **Idea (CIN-016)** | Vas a ver la relación \(v_y^2=v_{0y}^2-2g\Delta y\) sin leer el reloj. |
| **Idea (CIN-017)** | Vas a ver que la altura extra respecto del lanzamiento es \(v_0^2/(2g)\), con \(v_y=0\) arriba. |
| **Idea (CIN-018)** | Vas a ver que el tiempo de subida es \(v_0/g\): el tiempo que tarda \(v_y\) en llegar a cero. |
| **Idea (CIN-019)** | Vas a ver que, si vuelves a la misma altura, el vuelo dura el doble del tiempo de subida. |
| **No hacer** | Eje \(y\) hacia abajo “porque cae”. El catálogo fija \(a_y=-g\). |

---

### 4.3 Movimiento 2D (cap. 3) — sección `movimiento-2d-3d`

#### VelocityAcceleration2DViz

| Campo | Valor |
|---|---|
| **Tipo** | `velocity_accel_2d` |
| **Componente** | `physics/viz/VelocityAcceleration2DViz.tsx` |
| **Ancla** | `MOV-004` |
| **También** | MOV-002 `displacement`; MOV-003 `avg_velocity`; MOV-005 `acceleration` |
| **Enseña** | \(\vec v\) es tangente a la trayectoria; \(\vec a\) **no** tiene por qué serlo. \(\Delta\vec r=\vec r_f-\vec r_i\) es cuerda, no arco. |
| **Layout** | Trayectoria predefinida (selector: **parábola de proyectil**, **circunferencia**, **recta**). Punto animado; flechas \(\vec v\) (teal), \(\vec a\) (naranja) en la partícula. |
| **Controles** | Selector de curva; Play/Pausa; \(t\). Modo displacement: dos puntos \(i,f\) y flecha \(\Delta\vec r\). |
| **Idea (MOV-004)** | Vas a ver que la velocidad instantánea es tangente a la trayectoria: apunta hacia donde el móvil **sigue**, no hacia el origen. |
| **Prueba (MOV-004)** | En la circunferencia, \(\vec v\) es tangente; no apunta al centro. |
| **Idea (MOV-005)** | Vas a ver que \(\vec a=d\vec v/dt\) puede tener componente normal (cambia dirección) y tangencial (cambia rapidez). |
| **Prueba (MOV-005)** | Compara circunferencia ( \(a\) hacia el centro) y recta ( \(a\) paralela a \(v\) o cero). |
| **Idea (MOV-002)** | Vas a ver que el desplazamiento \(\Delta\vec r\) es la cuerda del origen inicial al final, no el camino. |
| **Idea (MOV-003)** | Vas a ver que \(\vec v_{\mathrm{med}}=\Delta\vec r/\Delta t\) va en la dirección de esa cuerda. |

#### ProjectileMotionViz

| Campo | Valor |
|---|---|
| **Tipo** | `projectile_motion` |
| **Componente** | `physics/viz/ProjectileMotionViz.tsx` |
| **Ancla** | `MOV-014` alcance |
| **También** | MOV-006 `components`; MOV-007 `x`; MOV-008 `y`; MOV-009 `vy`; MOV-010 `vx`; MOV-011 `tmax`; MOV-012 `hmax`; MOV-013 `tflight` |
| **Enseña** | \(a_x=0\), \(a_y=-g\); la parábola es la composición de MRU horizontal y caída vertical. |
| **Layout** | Escena \(x\)–\(y\) (suelo \(y=0\), lanzamiento en origen). Trayectoria completa en gris; trazo hasta \(t\) en accent; punto; \(\vec v\) descompuesto en \(v_x\), \(v_y\) en la partícula. Marcas \(H\), \(R\), \(t_{\max}\). Debajo, opcional (toggle): \(x(t)\) lineal, \(y(t)\) parábola, \(v_y(t)\) lineal, \(v_x(t)\) horizontal. |
| **Controles** | \(v_0\in[5,40]\,\mathrm{m/s}\) paso 0.5; \(\theta\in[5,85]^\circ\) paso 1; \(g\in[9.80,10.00]\); \(t\in[0,t_{\mathrm{vuelo}}]\); Play/Pausa. Botón **45°** (alcance máximo). |
| **Condición** | \(y_0=y_f=0\), sin aire (como el catálogo). Caption fijo: “misma altura inicial y final; \(a_x=0\)”. |
| **Números** | \(v_{0x}=v_0\cos\theta\), \(v_{0y}=v_0\sin\theta\), \(t_{\max}\), \(H\), \(t_{\mathrm{vuelo}}\), \(R\). |
| **Idea (MOV-014)** | Vas a ver que el alcance en suelo horizontal es \(R=v_0^2\sin(2\theta)/g\): máximo a \(45^\circ\), y \(30^\circ\) y \(60^\circ\) llegan igual de lejos. |
| **Prueba (MOV-014)** | Pon 30° y 60° con el mismo \(v_0\): \(R\) coincide; \(H\) no. |
| **Idea (MOV-006)** | Vas a ver que \(\vec v_0\) se parte en \(v_0\cos\theta\) (nunca cambia) y \(v_0\sin\theta\) (sí cambia por \(g\)). |
| **Prueba (MOV-006)** | En \(t=0\) las dos componentes forman el ángulo \(\theta\) con el suelo. |
| **Idea (MOV-007)** | Vas a ver que \(x=(v_0\cos\theta)t\) es MRU: \(x(t)\) es una recta. |
| **Idea (MOV-008)** | Vas a ver que \(y=(v_0\sin\theta)t-\tfrac12 gt^2\) es la caída libre vertical. |
| **Idea (MOV-009)** | Vas a ver que \(v_y=v_0\sin\theta-gt\) se anula en la cima; no se queda en \(v_0\sin\theta\). |
| **Idea (MOV-010)** | Vas a ver que \(v_x=v_0\cos\theta\) es constante: las flechas horizontales tienen la misma longitud en todo el vuelo. |
| **Idea (MOV-011)** | Vas a ver que \(t_{\max}=v_0\sin\theta/g\) es el instante en que \(v_y=0\). |
| **Idea (MOV-012)** | Vas a ver que \(H=v_0^2\sin^2\theta/(2g)\) es la altura **adicional** sobre el lanzamiento. |
| **Idea (MOV-013)** | Vas a ver que, al volver a \(y=0\), el vuelo dura \(2t_{\max}\). |
| **No hacer** | Resistencia del aire; suelo inclinado (fuera de estas fórmulas). |

#### RelativeVelocityViz

| Campo | Valor |
|---|---|
| **Tipo** | `relative_velocity` |
| **Componente** | `physics/viz/RelativeVelocityViz.tsx` |
| **Ancla** | `MOV-015` |
| **Enseña** | \(\vec v_{P/A}=\vec v_{P/B}+\vec v_{B/A}\) (composición, mismo dibujo que suma de vectores con etiquetas de marcos). |
| **Layout** | Río + barca **o** avión + viento (selector). Vectores \(\vec v_{P/B}\), \(\vec v_{B/A}\), resultante \(\vec v_{P/A}\). |
| **Controles** | Módulos y ángulos de los dos vectores; presets “cruzar el río” / “viento cruzado”. |
| **Idea** | Vas a ver que la velocidad respecto de A se obtiene sumando la velocidad respecto de B y la de B respecto de A. |
| **Prueba** | En “cruzar el río”, apunta la barca perpendicular a la orilla: respecto de tierra la trayectoria se desvía aguas abajo. |

---

### 4.4 Newton (cap. 4) — sección `leyes-de-newton`

#### NewtonSecondLawViz

| Campo | Valor |
|---|---|
| **Tipo** | `newton_second` |
| **Componente** | `physics/viz/NewtonSecondLawViz.tsx` |
| **Ancla** | `NEW-002` |
| **También** | NEW-001 `inertia`; NEW-004 `weight`; EQU-001 `inertia` (misma escena: \(\sum F=0\Rightarrow a=0\)) |
| **Enseña** | \(\sum\vec F=m\vec a\); \(a\) sigue a \(\vec F_{\mathrm{neta}}\), no a una fuerza suelta. |
| **Layout** | Bloque sobre recta horizontal sin fricción. Flechas de fuerzas aplicadas (hasta 2 horizontales, + peso y normal en vertical que se anulan). Resultante aparte, etiquetada \(\sum F\). Debajo, \(a=\sum F_x/m\). |
| **Controles** | \(m\in[0.5,10]\,\mathrm{kg}\); \(F_1,F_2\in[-20,20]\,\mathrm{N}\); Play (el bloque acelera; reset a \(v=0\)). |
| **Modo `inertia`** | Forzar \(F_1=-F_2\) o ambas 0; \(v\) constante (puede no ser 0). Caption: “reposo o MRU”. |
| **Modo `weight`** | Cuerpo colgando o en mesa; flecha \(mg\) hacia \(-y\), \(N\) si hay mesa. Slider \(m\); \(\lvert\vec F_g\rvert=mg\). |
| **Idea (NEW-002)** | Vas a ver que la aceleración la fija la **suma** de fuerzas dividida por la masa, no la fuerza “más grande” por sí sola. |
| **Prueba (NEW-002)** | Pon dos fuerzas opuestas: si se cancelan, \(a=0\) aunque cada flecha sea grande. Sube \(m\): el mismo \(\sum F\) produce menos \(a\). |
| **Idea (NEW-001)** | Vas a ver que si \(\sum\vec F=0\), el cuerpo no se frena solo: sigue en reposo o con \(v\) constante. |
| **Idea (NEW-004)** | Vas a ver que el peso es \(mg\) hacia abajo: más masa, más flecha, misma \(g\). |
| **No hacer** | Flecha de “ma” como si fuera una fuerza más en el DCL. |

#### NewtonThirdLawViz

| Campo | Valor |
|---|---|
| **Tipo** | `newton_third` |
| **Componente** | `physics/viz/NewtonThirdLawViz.tsx` |
| **Ancla** | `NEW-003` |
| **Enseña** | \(\vec F_{A\to B}=-\vec F_{B\to A}\) actúan en **cuerpos distintos**. |
| **Principio** | P1 (mismo par, dos cuerpos) |
| **Layout** | Dos bloques A y B. El par acción-reacción se colorea igual y se anima un pulso. Un DCL **por cuerpo** (P4: toggle A / B / ambos). |
| **Controles** | Magnitud del par; toggle de vista. |
| **Idea** | Vas a ver que acción y reacción son opuestas e iguales, y que **no** se cancelan porque no están en el mismo cuerpo. |
| **Prueba** | Mira el DCL de A: solo aparece \(\vec F_{B\to A}\). La de A sobre B está en el otro diagrama. |
| **No hacer** | Un solo DCL con las dos flechas “cancelándose”. |

#### FrictionViz

| Campo | Valor |
|---|---|
| **Tipo** | `friction` |
| **Componente** | `physics/viz/FrictionViz.tsx` |
| **Ancla** | `NEW-006` (estática, más sutil) |
| **También** | NEW-005 `kinetic` |
| **Enseña** | \(f_s\le\mu_s N\) se ajusta; \(f_k=\mu_k N\) es constante al deslizar. |
| **Layout** | Bloque en horizontal. Slider de \(F_{\mathrm{apl}}\). Barra \(f_s\) que crece hasta \(\mu_s N\) y luego salta a \(f_k\). |
| **Controles** | \(m\), \(\mu_s\in[0.2,1.2]\), \(\mu_k\in[0.1,\mu_s)\), \(F_{\mathrm{apl}}\). |
| **Estado** | “en reposo, \(f_s=F_{\mathrm{apl}}\)” / “desliza, \(f_k=\mu_k N\)”. |
| **Idea (NEW-006)** | Vas a ver que la fricción estática no es \(\mu_s N\) siempre: vale lo que haga falta hasta el máximo \(\mu_s N\). |
| **Prueba (NEW-006)** | Sube \(F_{\mathrm{apl}}\) despacio: \(f_s\) la iguala. Al superar \(\mu_s N\), el bloque arranca. |
| **Idea (NEW-005)** | Vas a ver que, una vez desliza, \(f_k=\mu_k N\) es constante (aquí) y se opone a la velocidad. |

#### HookeViz

| Campo | Valor |
|---|---|
| **Tipo** | `hooke` |
| **Componente** | `physics/viz/HookeViz.tsx` |
| **Ancla** | `NEW-007` |
| **Enseña** | \(F_x=-kx\): restauradora, opuesta a \(x\). |
| **Layout** | Resorte horizontal, equilibrio marcado. Flecha \(F\) siempre hacia el equilibrio. Gráfica \(F(x)\) recta de pendiente \(-k\). |
| **Controles** | \(k\in[5,50]\,\mathrm{N/m}\); \(x\in[-0.4,0.4]\,\mathrm{m}\). |
| **Idea** | Vas a ver que la fuerza del resorte tira **hacia** el equilibrio y vale \(kx\) en módulo: \(F_x=-kx\). |
| **Prueba** | Estira y comprime: la flecha cambia de sentido y el punto \((x,F)\) recorre la recta. |
| **No hacer** | Oscilación (eso es `SHMViz`). Aquí \(x\) lo fija el alumno. |

#### InclinedPlaneViz

| Campo | Valor |
|---|---|
| **Tipo** | `inclined_plane` |
| **Componente** | `physics/viz/InclinedPlaneViz.tsx` |
| **Ancla** | `NEW-008` |
| **Enseña** | \(F_{g\parallel}=mg\sin\theta\), \(F_{g\perp}=mg\cos\theta\), \(N=mg\cos\theta\) si no hay otras perpendiculares. |
| **Principio** | P3 |
| **Layout** | Plano de ángulo \(\theta\). Peso \(mg\) vertical. Componentes **sobre el plano** (paralela hacia abajo del plano, perpendicular hacia el plano). Toggle **ejes del plano** / **ejes xy**. Opcional: incluir \(f_k\) (enlace conceptual a NEW-005, no sustituye ese viz). |
| **Controles** | \(m\in[0.5,10]\); \(\theta\in[0,60]^\circ\); \(g\) fijo 9.81; toggle fricción off por defecto. |
| **Estado** | \(mg\sin\theta\), \(mg\cos\theta\), \(N\). Si \(\theta=0\): \(F_\parallel=0\), \(N=mg\). |
| **Idea** | Vas a ver que el peso se parte respecto del plano: \(mg\sin\theta\) empuja cuesta abajo y \(mg\cos\theta\) determina la normal. |
| **Prueba** | Sube \(\theta\): crece la paralela y baja la normal. En 0° no hay paralela. |
| **No hacer** | Usar \(\sin/\cos\) intercambiados; el catálogo fija \(\parallel=\sin\theta\), \(\perp=\cos\theta\) con \(\theta\) respecto de la horizontal. |

---

### 4.5 Circular y rotación (cap. 5 y 8)

#### CircularMotionViz

| Campo | Valor |
|---|---|
| **Tipo** | `circular_motion` |
| **Componente** | `physics/viz/CircularMotionViz.tsx` |
| **Ancla** | `CIR-006` |
| **También** | CIR-001 `dtheta`; CIR-002 `omega_avg`; CIR-003 `omega`; CIR-004 `v_omega_r`; CIR-005 `omega_freq`; CIR-007 `Fc`; CIR-008 `tangential`; ROT-001 `alpha`; ROT-002 `omega_alpha`; ROT-003 `theta_alpha`; ROT-004 `ang_torricelli` |
| **Enseña** | En circular uniforme, \(v=\omega r\), \(a_c=v^2/r\) **hacia el centro**. \(F_c\) no es un tipo nuevo de fuerza. Si \(\alpha\neq 0\), aparece \(a_t=\alpha r\). |
| **Layout** | Circunferencia de radio \(r\); punto; \(\vec v\) tangente; \(\vec a_c\) radial interior; \(\vec a_t\) tangente si \(\alpha\neq 0\). Arco \(\Delta\theta\). Readout \(\omega,f,T\). |
| **Controles** | \(r\in[0.5,4]\,\mathrm{m}\); \(\omega\in[0.5,6]\,\mathrm{rad/s}\) o \(v\); \(\alpha\in[-2,2]\) (0 por defecto); Play. |
| **Idea (CIR-006)** | Vas a ver que, aunque la rapidez sea constante, hay aceleración hacia el centro: \(a_c=v^2/r=\omega^2 r\). |
| **Prueba (CIR-006)** | Sube \(v\) a \(r\) fijo: \(a_c\) crece con \(v^2\). La flecha naranja no apunta “hacia fuera”. |
| **Idea (CIR-004)** | Vas a ver que \(v=\omega r\): más lejos del eje, más rapidez lineal a igual \(\omega\). |
| **Idea (CIR-007)** | Vas a ver que \(F_c=ma_c\) es la **componente radial neta** (tensión, gravedad, …), no una fuerza extra en el DCL. |
| **Idea (CIR-008)** | Vas a ver que \(a_t=\alpha r\) cambia la rapidez; \(a_c\) cambia la dirección. |
| **Idea (CIR-001–003, CIR-005)** | (dtheta) Vas a ver que \(\Delta\theta=\theta_f-\theta_i\) es el arco recorrido en radianes. (omega) \(\omega=d\theta/dt\). (omega_freq) \(\omega=2\pi f=2\pi/T\). |
| **Idea (ROT-001–004)** | Vas a ver que \(\theta,\omega,\alpha\) cumplen las mismas relaciones que \(x,v,a\) del MRUA, con \(a\to\alpha\). |
| **Prueba (ROT-002)** | \(\omega_f=\omega_0+\alpha t\) en el readout; la flecha \(a_t\) aparece si \(\alpha\neq 0\). |

#### MomentOfInertiaViz

| Campo | Valor |
|---|---|
| **Tipo** | `moment_of_inertia` |
| **Componente** | `physics/viz/MomentOfInertiaViz.tsx` |
| **Ancla** | `ROT-005` |
| **También** | ROT-006 `continuous` (varilla uniforme = límite de partículas); ROT-007 `parallel_axis` |
| **Enseña** | \(I=\sum m_i r_i^2\); lejos del eje pesa más. Ejes paralelos: \(I=I_{\mathrm{CM}}+Md^2\). |
| **Layout** | Eje (punto o recta). Hasta 4 masas arrastrables. \(I\) numérico. Modo parallel_axis: figura rígida + eje desplazado distancia \(d\). |
| **Controles** | Masas \(m_i\); arrastre de posiciones; \(d\) en modo paralelo. |
| **Idea (ROT-005)** | Vas a ver que el momento de inercia suma \(m r^2\): alejar una masa del eje sube \(I\) aunque \(m\) no cambie. |
| **Prueba** | Acerca todas las masas al eje: \(I\) cae y, a igual \(\tau\), \(\alpha=\tau/I\) subiría (caption). |
| **Idea (ROT-007)** | Vas a ver que un eje paralelo no por el CM añade \(Md^2\). |

#### TorqueViz

| Campo | Valor |
|---|---|
| **Tipo** | `torque` |
| **Componente** | `physics/viz/TorqueViz.tsx` |
| **Ancla** | `ROT-009` |
| **Enseña** | \(\sum\tau=I\alpha\): análogo rotacional de \(\sum F=ma\). El isométrico \(\vec r\times\vec F\) vive en `CrossProductViz` (ROT-008). |
| **Layout** | Disco (vista 2D) con eje; flecha de torque; \(\omega\) y \(\alpha\) en el disco. Readout \(I\), \(\tau\), \(\alpha=\tau/I\). |
| **Controles** | \(\tau\in[-8,8]\,\mathrm{N\cdot m}\); \(I\in[0.2,4]\,\mathrm{kg\cdot m^2}\); Play. |
| **Idea** | Vas a ver que \(\sum\tau=I\alpha\) es la segunda ley para la rotación: más \(I\), menos \(\alpha\) a igual torque. |
| **Prueba** | Sube \(I\): el disco gana \(\omega\) más despacio. |

#### RollingViz

| Campo | Valor |
|---|---|
| **Tipo** | `rolling` |
| **Componente** | `physics/viz/RollingViz.tsx` |
| **Ancla** | `ROT-011` |
| **También** | ROT-010 `krot` (resalta \(\tfrac12 I\omega^2\)) |
| **Enseña** | Sin deslizamiento: \(v_{\mathrm{CM}}=R\omega\); \(K=\tfrac12 Mv_{\mathrm{CM}}^2+\tfrac12 I_{\mathrm{CM}}\omega^2\). |
| **Layout** | Rueda + suelo; punto pintado en el borde (cicloide). Vectores \(v_{\mathrm{CM}}\) y \(R\omega\). Barras de energía \(K_{\mathrm{tras}}\) / \(K_{\mathrm{rot}}\). |
| **Controles** | \(R\), \(v_{\mathrm{CM}}\); selector \(I=\beta MR^2\) (aro \(\beta=1\), disco \(1/2\), esfera \(2/5\)). |
| **Idea** | Vas a ver que, si no desliza, \(v_{\mathrm{CM}}=R\omega\) y la energía se parte en traslación más rotación. |
| **Prueba** | Elige aro vs disco a igual \(v_{\mathrm{CM}}\): el aro guarda más fracción en rotación. |
| **Idea (ROT-010)** | Vas a ver que \(K_{\mathrm{rot}}=\tfrac12 I\omega^2\) es la parte que gira. |

#### AngularMomentumViz

| Campo | Valor |
|---|---|
| **Tipo** | `angular_momentum` |
| **Componente** | `physics/viz/AngularMomentumViz.tsx` |
| **Ancla** | `ROT-015` |
| **También** | ROT-013 `L_Iomega`; ROT-014 `tau_dL` |
| **Enseña** | Si \(\sum\tau_{\mathrm{ext}}=0\), \(I_i\omega_i=I_f\omega_f\). |
| **Layout** | “Patinador”: dos masas a radio \(r(t)\) sobre un eje. \(\omega\) sube al recoger los brazos. |
| **Controles** | Slider \(r\); Play de recoger/extender; \(I=2mr^2\) (modelo). |
| **Estado** | \(L=I\omega\) constante (dentro de 1e-6 relativo) si no hay \(\tau\). |
| **Idea (ROT-015)** | Vas a ver que, sin torque externo, \(L\) se conserva: al reducir \(I\), \(\omega\) sube para que \(I\omega\) no cambie. |
| **Prueba** | Recoge las masas: el disco gira más rápido y \(L\) del caption no cambia. |
| **Idea (ROT-013)** | \(L=I\omega\) para eje fijo. |
| **Idea (ROT-014)** | Si aplicas un \(\tau\) (toggle), \(L\) deja de ser constante: \(\tau=dL/dt\). |

---

### 4.6 Trabajo y energía (cap. 6) — sección `trabajo-energia-potencia`

#### WorkConstantViz

| Campo | Valor |
|---|---|
| **Tipo** | `work_constant` |
| **Componente** | `physics/viz/WorkConstantViz.tsx` |
| **Ancla** | `ENE-001` |
| **También** | ENE-013 `power_avg`; ENE-014 `power_inst` |
| **Enseña** | \(W=\vec F\cdot\vec d=Fd\cos\theta\). 90° ⇒ trabajo nulo. |
| **Layout** | Bloque, desplazamiento \(\vec d\) fijo en \(+x\); \(\vec F\) orientable. Proyección \(F\cos\theta\) sobre \(\vec d\). |
| **Controles** | \(F\), \(d\), \(\theta\in[0,180]^\circ\). |
| **Idea** | Vas a ver que el trabajo de una fuerza constante es \(Fd\cos\theta\): solo cuenta la componente a lo largo del desplazamiento. |
| **Prueba** | Pon 90°: \(W=0\) aunque \(F\) y \(d\) no sean cero. En 180° el trabajo es negativo. |
| **Idea (ENE-014)** | Vas a ver que la potencia instantánea es \(\vec F\cdot\vec v\): a igual \(F\), más rapidez, más vatios. |
| **Idea (ENE-013)** | \(P_{\mathrm{med}}=W/\Delta t\). |

#### WorkVariablePhysicsViz

| Campo | Valor |
|---|---|
| **Tipo** | `work_variable` |
| **Componente** | `physics/viz/WorkVariablePhysicsViz.tsx` |
| **Ancla** | `ENE-002` |
| **Enseña** | \(W=\int_{x_1}^{x_2} F_x(x)\,dx\) es el área bajo \(F(x)\). |
| **Layout** | P2 permitido: escena (resorte **o** \(F=cx^2\)) + gráfica \(F(x)\) con área. **No** copiar el copy de `WorkIntegralViz` (habla de integral de cálculo). |
| **Controles** | Tipo `hooke` / `lineal` / `constante`; \(x_1,x_2\); \(k\) o \(c\). |
| **Idea** | Vas a ver que, si \(F\) cambia a lo largo del camino, el trabajo es el área bajo \(F(x)\), no \(F\cdot\Delta x\) con un solo valor de \(F\). |
| **Prueba** | En el resorte, compara \(\int_0^x kx\,dx=\tfrac12 kx^2\) con el área del triángulo. |
| **Reutilizar** | `integrate` de `calcMath`. No montar `WorkIntegralViz`. |

#### PotentialForceViz

| Campo | Valor |
|---|---|
| **Tipo** | `potential_force` |
| **Componente** | `physics/viz/PotentialForceViz.tsx` |
| **Ancla** | `ENE-008` |
| **También** | ENE-006 `conservative_work` |
| **Enseña** | \(F_x=-dU/dx\); \(W_c=-\Delta U\). |
| **Layout** | \(U(x)\) (selector: \(\tfrac12 kx^2\), \(mgy\), pozo). Punto en \(x\); pendiente; flecha \(F\) opuesta a la pendiente. |
| **Idea (ENE-008)** | Vas a ver que la fuerza conservativa apunta cuesta abajo en \(U(x)\): \(F_x=-dU/dx\). |
| **Prueba** | En el pozo, a la derecha de del mínimo \(F\) tira a la izquierda. |
| **Idea (ENE-006)** | Vas a ver que el trabajo conservativo es \(U_i-U_f\): bajar en \(U\) da \(W_c>0\). |

#### MechanicalEnergyViz

| Campo | Valor |
|---|---|
| **Tipo** | `mechanical_energy` |
| **Componente** | `physics/viz/MechanicalEnergyViz.tsx` |
| **Ancla** | `ENE-010` |
| **También** | ENE-003 `kinetic`; ENE-004 `grav`; ENE-005 `spring`; ENE-007 `work_energy`; ENE-009 `total`; ENE-011 `nonconservative`; ENE-012 `friction_work` |
| **Enseña** | \(E_{\mathrm{mec}}=K+U\) se conserva si solo hay conservativas; \(W_{\mathrm{neto}}=\Delta K\); fricción: \(W_f=-f_k d\). |
| **Layout** | Selector de escena: **pendiente sin fricción**, **resorte horizontal**, **pendiente + \(\mu_k\)**. Barras apiladas \(K\) (teal) y \(U\) (accent). Punto animado. |
| **Controles** | \(m\), altura o \(A\) del resorte, \(\mu_k\) (0 por defecto). |
| **Idea (ENE-010)** | Vas a ver que, sin fricción, \(K+U\) no cambia: lo que pierde \(U\) lo gana \(K\). |
| **Prueba (ENE-010)** | Suelta desde lo alto: arriba todo \(U\), abajo todo \(K\), la suma plana. |
| **Idea (ENE-007)** | Vas a ver que el trabajo neto (área o \(Fd\cos\theta\)) es exactamente \(\Delta K\). |
| **Idea (ENE-003)** | \(K=\tfrac12 mv^2\) crece con \(v^2\), no con \(v\). |
| **Idea (ENE-004)** | \(U_g=mgy\) (eje \(y\) arriba, \(g\) constante). |
| **Idea (ENE-005)** | \(U_s=\tfrac12 kx^2\). |
| **Idea (ENE-009)** | \(E_{\mathrm{mec}}=K+U\) es la suma de las barras. |
| **Idea (ENE-011)** | Vas a ver que la fricción reduce \(E_{\mathrm{mec}}\): \(\Delta E_{\mathrm{mec}}=W_{\mathrm{nc}}\). |
| **Idea (ENE-012)** | Vas a ver que \(W_f=-f_k d\) es negativo: la distancia cuenta, no el desplazamiento neto si el modelo es cinético constante. |

---

### 4.7 Momento y colisiones (cap. 7) — sección `momento-impulso-colisiones`

#### ImpulseMomentumViz

| Campo | Valor |
|---|---|
| **Tipo** | `impulse_momentum` |
| **Componente** | `physics/viz/ImpulseMomentumViz.tsx` |
| **Ancla** | `MOM-004` |
| **También** | MOM-001 `p`; MOM-002 `F_dpdt`; MOM-003 `J` |
| **Enseña** | \(\vec J=\int\vec F\,dt=\Delta\vec p\). Área bajo \(F(t)\) = cambio de \(mv\). |
| **Layout** | \(F(t)\) (pulso rectangular o triangular); área sombreada; barra \(p_i\to p_f\). Escena: carrito que cambia \(v\) durante el pulso. |
| **Controles** | \(m\); \(F_{\max}\); \(\Delta t\); forma del pulso. |
| **Idea (MOM-004)** | Vas a ver que el impulso (área de \(F\) contra \(t\)) es el cambio de momento: \(\vec J=\vec p_f-\vec p_i\). |
| **Prueba** | Un pulso alto y corto con la misma área que uno bajo y largo deja el mismo \(\Delta v\). |
| **Idea (MOM-001)** | \(\vec p=m\vec v\): a igual \(v\), más masa, más \(p\). |
| **Idea (MOM-002)** | \(\sum F=dp/dt\): la pendiente de \(p(t)\) es la fuerza neta. |
| **Idea (MOM-003)** | \(J=\int F\,dt\). |

#### Collision1DViz

| Campo | Valor |
|---|---|
| **Tipo** | `collision_1d` |
| **Componente** | `physics/viz/Collision1DViz.tsx` |
| **Ancla** | `MOM-007` |
| **También** | MOM-005 `conservation`; MOM-006 `inelastic` |
| **Enseña** | \(p\) total se conserva (si \(J_{\mathrm{ext}}=0\)). Elástico: también \(K\). Inelástico perfecto: un solo \(v_f\). |
| **Principio** | P4: elástico / inelástico **reemplazan** el resultado, no dual permanente. |
| **Layout** | Dos bloques en 1D; animación antes/después. Barras \(p_1,p_2,p_{\mathrm{tot}}\) y \(K_1,K_2,K_{\mathrm{tot}}\). |
| **Controles** | \(m_1,m_2,v_{1i},v_{2i}\); botón Elástica / Inelástica. |
| **Fórmulas** | Inelástica: \(v_f=(m_1v_{1i}+m_2v_{2i})/(m_1+m_2)\). Elástica 1D: fórmulas estándar de \(v_{1f},v_{2f}\). |
| **Idea (MOM-007)** | Vas a ver que en un choque elástico se conservan el momento **y** la energía cinética: los bloques rebotan con \(K\) total igual. |
| **Prueba (MOM-007)** | Choque igual masas, uno en reposo: se intercambian las velocidades. |
| **Idea (MOM-006)** | Vas a ver que, si quedan unidos, hay un solo \(v_f\) y \(K\) disminuye. |
| **Idea (MOM-005)** | Vas a ver que \(p_{1i}+p_{2i}=p_{1f}+p_{2f}\) en ambos modos si no hay impulso externo. |
| **No hacer** | Choque 2D en v1. |

#### CenterOfMassViz

| Campo | Valor |
|---|---|
| **Tipo** | `center_of_mass` |
| **Componente** | `physics/viz/CenterOfMassViz.tsx` |
| **Ancla** | `MOM-008` |
| **También** | MOM-009 `v_cm` |
| **Enseña** | \(\vec r_{\mathrm{CM}}=\sum m_i\vec r_i/M\); \(\vec v_{\mathrm{CM}}=\vec P/M\). |
| **Layout** | 2–3 masas en el plano; punto CM; opcional velocidades y flecha \(v_{\mathrm{CM}}\). |
| **Idea** | Vas a ver que el centro de masa es el promedio de posiciones ponderado por masa: más masa “tira” del CM. |
| **Prueba** | Duplica una masa: el CM se acerca a ella. En modo \(v_{\mathrm{CM}}\), el CM se mueve como si toda \(M\) estuviera ahí. |

---

### 4.8 Equilibrio (cap. 9) — sección `equilibrio-elasticidad`

#### BeamEquilibriumViz

| Campo | Valor |
|---|---|
| **Tipo** | `beam_equilibrium` |
| **Componente** | `physics/viz/BeamEquilibriumViz.tsx` |
| **Ancla** | `EQU-002` |
| **Enseña** | \(\sum\tau=0\) (y \(\sum F=0\)): elegir un pivote conviene. |
| **Layout** | Viga apoyada; pesos arrastrables; soportes \(N_1,N_2\). Arcos de torque respecto de un pivote seleccionable. |
| **Controles** | Posiciones de cargas; selector de pivote. |
| **Idea** | Vas a ver que en equilibrio el torque neto es cero: las fuerzas de los soportes se ajustan para cancelar los momentos de las cargas. |
| **Prueba** | Acerca una carga a un extremo: ese soporte crece. Cambia el pivote: los \(\tau\) individuales cambian, la suma sigue 0. |

#### YoungModulusViz

| Campo | Valor |
|---|---|
| **Tipo** | `young_modulus` |
| **Componente** | `physics/viz/YoungModulusViz.tsx` |
| **Ancla** | `EQU-005` |
| **También** | EQU-003 `stress`; EQU-004 `strain` |
| **Enseña** | \(Y=\sigma/\varepsilon=(F_\perp L_0)/(A\Delta L)\) en régimen lineal. |
| **Layout** | Barra que se alarga (exageración visual × factor declarado en caption). Readouts \(\sigma\), \(\varepsilon\), \(Y\). |
| **Controles** | \(F\), \(A\), \(L_0\); \(Y\) de material (acero / goma, valores de orden de magnitud). |
| **Idea** | Vas a ver que Young relaciona esfuerzo \(F/A\) y deformación \(\Delta L/L_0\): a igual \(Y\), más fuerza o menos área, más alargamiento. |
| **Prueba** | Sube \(A\): \(\Delta L\) baja. El caption recuerda el régimen elástico lineal. |

---

### 4.9 Gravitación (cap. 10) — sección `gravitacion`

#### GravitationViz

| Campo | Valor |
|---|---|
| **Tipo** | `gravitation` |
| **Componente** | `physics/viz/GravitationViz.tsx` |
| **Ancla** | `GRA-001` |
| **También** | GRA-002 `field` |
| **Enseña** | \(F=G m_1 m_2/r^2\) (atractiva); \(g=GM/r^2\). |
| **Layout** | Dos masas; flechas iguales y opuestas (enlace con tercera ley). Gráfica \(F(r)\) tipo \(1/r^2\). |
| **Controles** | \(m_1,m_2,r\). \(G\) mostrado como constante (no slider). |
| **Idea (GRA-001)** | Vas a ver que la gravedad entre dos masas cae con \(r^2\) y que las dos flechas son un par acción-reacción. |
| **Prueba** | Duplica \(r\): \(F\) se divide por 4. |
| **Idea (GRA-002)** | \(g=GM/r^2\) es \(F/m\) sobre una masa de prueba. |

#### OrbitViz

| Campo | Valor |
|---|---|
| **Tipo** | `orbit` |
| **Componente** | `physics/viz/OrbitViz.tsx` |
| **Ancla** | `GRA-005` |
| **También** | GRA-006 `period`; GRA-007 `escape`; GRA-003 `U`; GRA-008 `E` |
| **Enseña** | Órbita circular: \(v=\sqrt{GM/r}\), \(T=2\pi\sqrt{r^3/GM}\); escape \(v_{\mathrm{esc}}=\sqrt{2GM/R}\); \(E=-GMm/(2r)\). |
| **Layout** | Masa central + órbita circular animada. Comparación de \(v_{\mathrm{orb}}\) vs \(v_{\mathrm{esc}}\) (flechas). |
| **Controles** | \(M\), \(r\); Play. |
| **Idea (GRA-005)** | Vas a ver que en órbita circular \(v=\sqrt{GM/r}\): más cerca, más rápido. |
| **Idea (GRA-006)** | Vas a ver Kepler 3 para circular: \(T^2\propto r^3\). |
| **Idea (GRA-007)** | Vas a ver que escapar exige \(\sqrt{2}\) veces la \(v\) circular a ese \(R\) (\(\sqrt{2GM/R}\)). |
| **Idea (GRA-003 / GRA-008)** | \(U=-GMm/r<0\); en circular \(E=K+U=-GMm/(2r)\). |
| **GRA-004** | Sin viz propio (potencial = \(U/m\)); Relacionadas hacia GRA-003. |

---

### 4.10 Fluidos (cap. 11) — sección `mecanica-de-fluidos`

#### HydrostaticViz

| Campo | Valor |
|---|---|
| **Tipo** | `hydrostatic` |
| **Componente** | `physics/viz/HydrostaticViz.tsx` |
| **Ancla** | `FLU-003` |
| **También** | FLU-002 `pressure`; FLU-004 `difference` |
| **Enseña** | \(P=P_0+\rho g h\); la presión depende de la profundidad, no de la forma del recipiente (en v1 un tanque rectangular basta). |
| **Layout** | Tanque; sonda a profundidad \(h\); escala de color; readout \(P\). |
| **Controles** | \(\rho\), \(h\), \(P_0=1\,\mathrm{atm}\) toggle. |
| **Idea** | Vas a ver que la presión en un fluido en reposo sube linealmente con la profundidad: \(P=P_0+\rho gh\). |
| **Prueba** | Baja la sonda: \(P\) crece. Cambia \(\rho\): agua vs “aceite” más ligero. |
| **Idea (FLU-002)** | \(P=F_\perp/A\). |
| **Idea (FLU-004)** | \(P_2-P_1=\rho g(y_1-y_2)\). |

#### PascalViz

| Campo | Valor |
|---|---|
| **Tipo** | `pascal` |
| **Componente** | `physics/viz/PascalViz.tsx` |
| **Ancla** | `FLU-005` |
| **Enseña** | \(\Delta P\) se transmite; \(F_1/A_1=F_2/A_2\). |
| **Layout** | Prensa: dos émbolos. |
| **Controles** | \(A_1,A_2,F_1\); \(F_2=F_1 A_2/A_1\). |
| **Idea** | Vas a ver que un cambio de presión es el mismo en ambos émbolos: la fuerza grande vive en el área grande. |
| **Prueba** | \(A_2=10 A_1\): \(F_2=10 F_1\). |

#### ArchimedesViz

| Campo | Valor |
|---|---|
| **Tipo** | `archimedes` |
| **Componente** | `physics/viz/ArchimedesViz.tsx` |
| **Ancla** | `FLU-006` |
| **Enseña** | \(F_B=\rho_{\mathrm{fl}} g V_{\mathrm{despl}}\); flota si \(F_B\) puede igualar el peso. |
| **Layout** | Bloque parcialmente sumergido; \(V_{\mathrm{despl}}\) sombreado; flechas \(mg\) y \(F_B\). |
| **Controles** | \(\rho_{\mathrm{obj}}\), \(\rho_{\mathrm{fl}}\), volumen del sólido. |
| **Idea** | Vas a ver que el empuje es el peso del fluido **desplazado**, no del objeto. |
| **Prueba** | Objeto menos denso: flota con \(V_{\mathrm{despl}}/V=\rho_{\mathrm{obj}}/\rho_{\mathrm{fl}}\). Más denso: se hunde y \(F_B=\rho_{\mathrm{fl}} g V_{\mathrm{total}}<mg\). |

#### BernoulliViz

| Campo | Valor |
|---|---|
| **Tipo** | `bernoulli` |
| **Componente** | `physics/viz/BernoulliViz.tsx` |
| **Ancla** | `FLU-009` |
| **También** | FLU-007 `Q`; FLU-008 `continuity`; FLU-010 `torricelli`; FLU-011 `mass_flow` |
| **Enseña** | \(A_1 v_1=A_2 v_2\); \(P+\tfrac12\rho v^2+\rho gy=\mathrm{cte}\) a lo largo de una línea de corriente (ideal). |
| **Layout** | Tubo de sección variable + desnivel. Números \(A,v,P,y\) en dos estaciones. Color de presión. Modo Torricelli: tanque + orificio, \(v=\sqrt{2gh}\). |
| **Controles** | \(A_1,A_2\), \(\Delta y\), \(\rho\); caudal \(Q\). |
| **Idea (FLU-009)** | Vas a ver que, si el tubo se estrecha, \(v\) sube y \(P\) baja (a igual altura), de modo que \(P+\tfrac12\rho v^2+\rho gy\) se mantiene. |
| **Prueba** | Sube \(A_2\): \(v_2\) baja. Sube el tubo 2: hace falta más \(P_1\) o más \(v_1\). |
| **Idea (FLU-008)** | Vas a ver que \(A v\) se conserva (incompresible): lo que entra sale. |
| **Idea (FLU-007)** | \(Q=Av\). |
| **Idea (FLU-010)** | Vas a ver que la salida por un orificio a profundidad \(h\) sale a \(v=\sqrt{2gh}\) (Bernoulli con \(P\) atmósferica a ambos lados). |
| **Caption de condiciones** | “estacionario, incompresible, no viscoso, a lo largo de una línea de corriente”. |

---

### 4.11 Oscilaciones (cap. 12) — sección `oscilaciones`

#### SHMViz

| Campo | Valor |
|---|---|
| **Tipo** | `shm` |
| **Componente** | `physics/viz/SHMViz.tsx` |
| **Ancla** | `OSC-003` |
| **También** | OSC-001 `Tf`; OSC-002 `omega`; OSC-004 `a`; OSC-005 `v`; OSC-006 `omega_spring`; OSC-007 `period_spring`; OSC-008 `energy`; OSC-009 `vmax`; OSC-010 `amax` |
| **Enseña** | \(x=A\cos(\omega t+\phi)\); \(a=-\omega^2 x\); \(v_{\max}=A\omega\); \(E=\tfrac12 kA^2=\tfrac12 mv^2+\tfrac12 kx^2\); masa-resorte \(\omega=\sqrt{k/m}\). |
| **Layout** | Resorte + masa (escena). Referencia circular (proyección) opcional con toggle. Gráficas \(x(t),v(t),a(t)\) acopladas. Barras \(K\) y \(U_s\). |
| **Controles** | \(A\in[0.05,0.4]\,\mathrm{m}\); \(m\); \(k\) **o** \(\omega\); \(\phi\in[0,360)^\circ\); Play. |
| **Idea (OSC-003)** | Vas a ver que el MAS es \(x(t)=A\cos(\omega t+\phi)\): \(A\) es el máximo alejamiento, no un extra. |
| **Prueba** | Cambia \(\phi\): el movimiento es el mismo desplazado en el tiempo. |
| **Idea (OSC-004)** | Vas a ver que \(a=-\omega^2 x\): máxima en los extremos, cero en el equilibrio, siempre hacia el centro. |
| **Idea (OSC-005)** | \(v=-A\omega\sin(\omega t+\phi)\); \(v^2=\omega^2(A^2-x^2)\). Rápido en el centro. |
| **Idea (OSC-006 / 007)** | \(\omega=\sqrt{k/m}\), \(T=2\pi\sqrt{m/k}\): más masa, más lento; más \(k\), más rápido. |
| **Idea (OSC-008)** | \(K+U_s\) plana e igual a \(\tfrac12 kA^2\). |
| **Idea (OSC-009 / 010)** | \(v_{\max}=A\omega\) en \(x=0\); \(a_{\max}=A\omega^2\) en \(x=\pm A\). |
| **Idea (OSC-001 / 002)** | \(f=1/T\), \(\omega=2\pi f\). |

#### PendulumViz

| Campo | Valor |
|---|---|
| **Tipo** | `pendulum` |
| **Componente** | `physics/viz/PendulumViz.tsx` |
| **Ancla** | `OSC-012` |
| **También** | OSC-011 `omega` |
| **Enseña** | Para \(\theta\) pequeño, \(T=2\pi\sqrt{L/g}\), independiente de \(m\) y (aprox.) de la amplitud. |
| **Layout** | Péndulo; arco \(\theta\); warning si \(\theta_{\max}>15^\circ\) (“fuera de \(\sin\theta\approx\theta\)”). |
| **Controles** | \(L\in[0.3,2]\,\mathrm{m}\); \(\theta_{\max}\in[2,40]^\circ\); \(g\). \(m\) visible pero no afecta \(T\) en la aproximación. |
| **Idea** | Vas a ver que, en ángulo pequeño, el periodo solo depende de \(L\) y \(g\): \(T=2\pi\sqrt{L/g}\). |
| **Prueba** | Cambia \(m\): \(T\) no cambia. Cambia \(L\): \(T\) crece con \(\sqrt{L}\). Abre a 40°: el caption avisa que la fórmula del catálogo ya no es exacta. |

OSC-013 y OSC-014: sin viz en v1 (péndulo físico / torsión). Relacionadas a OSC-012 y ROT-009.

---

### 4.12 Ondas y sonido (cap. 13–14)

#### TravelingWaveViz

| Campo | Valor |
|---|---|
| **Tipo** | `traveling_wave` |
| **Componente** | `physics/viz/TravelingWaveViz.tsx` |
| **Ancla** | `OND-005` |
| **También** | OND-001 `v_lambda_f`; OND-002 `T`; OND-003 `k`; OND-004 `omega`; SON-001 mismo `v_lambda_f` |
| **Enseña** | \(y=A\sin(kx\mp\omega t+\phi)\) se **traslada**; \(v=\omega/k=\lambda f\). |
| **Layout** | Cuerda; un máximo marcado que viaja. Toggle \(+x\) / \(-x\). |
| **Controles** | \(A\), \(\lambda\), \(f\) (o \(T\)); Play. \(k=2\pi/\lambda\), \(\omega=2\pi f\) en el estado. |
| **Idea (OND-005)** | Vas a ver que una onda armónica no sube y baja en bloque: el patrón \(A\sin(kx-\omega t)\) se desplaza con \(v=\omega/k\). |
| **Prueba** | Sigue un cresta. Invierte el signo: viaja al otro lado. |
| **Idea (OND-001)** | \(v=\lambda f\). |
| **Idea (OND-003 / 004)** | \(k=2\pi/\lambda\), \(\omega=2\pi f\). |

#### StandingWaveViz

| Campo | Valor |
|---|---|
| **Tipo** | `standing_wave` |
| **Componente** | `physics/viz/StandingWaveViz.tsx` |
| **Ancla** | `OND-007` |
| **Enseña** | Cuerda fija-fija: \(\lambda_n=2L/n\), \(f_n=nv/(2L)\); nodos inmóviles. |
| **Layout** | Cuerda; nodos; \(n=1,2,3,4\). |
| **Controles** | \(n\) enteros; \(L\); \(v\) (o \(F_T,\mu\) en caption, sin sliders extra en v1). |
| **Idea** | Vas a ver que en una cuerda fija en los dos extremos solo caben enteros de medio \(\lambda\): hay puntos que no se mueven (nodos). |
| **Prueba** | Sube \(n\): más nodos, \(f\) proporcional a \(n\). |

#### InterferenceViz

| Campo | Valor |
|---|---|
| **Tipo** | `interference` |
| **Componente** | `physics/viz/InterferenceViz.tsx` |
| **Ancla** | `OND-009` |
| **También** | OND-008 `superposition` (suma de dos senos en un punto) |
| **Enseña** | Constructiva \(\Delta r=m\lambda\); destructiva \(\Delta r=(m+\tfrac12)\lambda\). |
| **Layout** | Dos fuentes; punto P arrastrable; \(\Delta r\); ondas (arcos). En modo superposición: dos \(y(t)\) y la suma. |
| **Idea (OND-009)** | Vas a ver que la interferencia la decide la diferencia de camino en unidades de \(\lambda\). |
| **Prueba** | Coloca P donde \(\Delta r=\lambda\): máxima; en \(\lambda/2\): silencio. |
| **Idea (OND-008)** | El desplazamiento total es la suma \(y_1+y_2\). |

#### DopplerViz

| Campo | Valor |
|---|---|
| **Tipo** | `doppler` |
| **Componente** | `physics/viz/DopplerViz.tsx` |
| **Ancla** | `SON-004` |
| **Enseña** | \(f'=f(v\pm v_o)/(v\mp v_s)\) con la convención del catálogo. |
| **Layout** | Fuente y observador en 1D; frentes de onda más juntos delante de la fuente. |
| **Controles** | \(f\), \(v_s\), \(v_o\), \(v_{\mathrm{sonido}}=343\) por defecto. Botones “acercarse / alejarse”. |
| **Estado** | \(f'\) y la fórmula con los signos **ya sustituidos**. |
| **Idea** | Vas a ver que si la fuente se acerca los frentes se aprietan y \(f'\) sube; el observador que se acerca también sube \(f'\), pero en el numerador. |
| **Prueba** | Fuente hacia el observador, observador en reposo: \(f'=f\,v/(v-v_s)\). |

#### BeatsViz

| Campo | Valor |
|---|---|
| **Tipo** | `beats` |
| **Componente** | `physics/viz/BeatsViz.tsx` |
| **Ancla** | `SON-005` |
| **Enseña** | \(f_{\mathrm{bat}}=\lvert f_1-f_2\rvert\); envolvente lenta. |
| **Layout** | Dos senos + suma; envolvente. |
| **Controles** | \(f_1,f_2\) cercanas (p. ej. 200 y 208 Hz). |
| **Idea** | Vas a ver que dos frecuencias cercanas producen un vaivén de intensidad a \(\lvert f_1-f_2\rvert\). |
| **Prueba** | Acerca \(f_2\) a \(f_1\): los batidos se espacian. |

#### ResonanceTubeViz

| Campo | Valor |
|---|---|
| **Tipo** | `resonance_tube` |
| **Componente** | `physics/viz/ResonanceTubeViz.tsx` |
| **Ancla** | `SON-006` abierto |
| **También** | SON-007 `closed` |
| **Enseña** | Abierto-abierto: \(f_n=nv/(2L)\), \(n=1,2,3,\ldots\). Cerrado-abierto: \(f_n=nv/(4L)\), \(n\) impar. |
| **Layout** | Tubo; nodos de desplazamiento; P4 toggle abierto / cerrado. |
| **Controles** | \(L\); \(n\) permitido según modo; \(v=343\). |
| **Idea (SON-006)** | Vas a ver que un tubo abierto en los dos extremos se parece a la cuerda fija-fija en las frecuencias \(nv/(2L)\), con vientres en las bocas. |
| **Idea (SON-007)** | Vas a ver que, cerrado en un extremo, hay nodo de desplazamiento en el cerrado y solo armónicos impares \(nv/(4L)\). |
| **Prueba** | En cerrado, \(n=2\) está deshabilitado. |

---

### 4.13 Termodinámica (cap. 15)

#### ThermalExpansionViz

| Campo | Valor |
|---|---|
| **Tipo** | `thermal_expansion` |
| **Componente** | `physics/viz/ThermalExpansionViz.tsx` |
| **Ancla** | `TER-003` |
| **También** | TER-004 `area`; TER-005 `volume` |
| **Enseña** | \(\Delta L=\alpha L_0\Delta T\); área \(\approx 2\alpha\); volumen \(\beta\approx 3\alpha\). |
| **Layout** | Barra / placa / cubo (según modo) con alargamiento exagerado y factor en el caption. |
| **Idea (TER-003)** | Vas a ver que el cambio de longitud es proporcional a \(L_0\) y a \(\Delta T\). |
| **Prueba** | Doble \(L_0\) o doble \(\Delta T\): doble \(\Delta L\). |

#### PVProcessViz

| Campo | Valor |
|---|---|
| **Tipo** | `pv_process` |
| **Componente** | `physics/viz/PVProcessViz.tsx` |
| **Ancla** | `TER-016` |
| **También** | TER-010 `ideal_gas`; TER-011 `combined`; TER-014 `U`; TER-015 `work`; TER-017 `isothermal`; TER-018 `adiabatic` |
| **Enseña** | Punto en el plano \(P\)–\(V\); \(W=\int P\,dV\) = área; \(\Delta U=Q-W\) (convención del catálogo); isotermo \(PV=\mathrm{cte}\), adiabática \(PV^\gamma=\mathrm{cte}\). |
| **Layout** | Diagrama \(P\)–\(V\); camino según proceso; área sombreada bajo el camino (trabajo). Readout \(\Delta U,Q,W\). |
| **Controles** | Proceso: isobárico / isocoro / isotermo / adiabático; \(n\), \(T_i\) o \(P_i,V_i\); \(V_f\). \(\gamma=5/3\) (monoatómico) por defecto. |
| **Idea (TER-016)** | Vas a ver la primera ley \(\Delta U=Q-W\): el trabajo es el área en el plano \(P\)–\(V\) (positivo si el gas se expande). |
| **Prueba** | Isocoro: área 0 ⇒ \(W=0\), \(\Delta U=Q\). Isotermo de ideal: \(\Delta U=0\), \(Q=W\). |
| **Idea (TER-015)** | \(W=\int P\,dV\). |
| **Idea (TER-017)** | \(PV=\mathrm{cte}\), \(\Delta U=0\), \(W=nRT\ln(V_f/V_i)\). |
| **Idea (TER-018)** | \(PV^\gamma=\mathrm{cte}\), más empinada que el isotermo. |
| **Idea (TER-010 / 011 / 014)** | El estado es un punto \(PV=nRT\); \(U=\tfrac32 nRT\) (monoatómico). |

#### HeatEngineViz

| Campo | Valor |
|---|---|
| **Tipo** | `heat_engine` |
| **Componente** | `physics/viz/HeatEngineViz.tsx` |
| **Ancla** | `TER-019` |
| **También** | TER-020 `carnot` |
| **Enseña** | \(\eta=W/Q_H=1-Q_C/Q_H\); Carnot \(\eta_C=1-T_C/T_H\). |
| **Layout** | Focos \(T_H,T_C\); flechas \(Q_H,Q_C,W\). En Carnot, \(\eta\) solo depende de temperaturas en kelvin. |
| **Controles** | \(Q_H,Q_C\) o \(T_H,T_C\). |
| **Idea (TER-019)** | Vas a ver que la eficiencia es el trabajo neto partido por el calor que entra del foco caliente, no \(W/Q_C\). |
| **Idea (TER-020)** | Vas a ver que Carnot solo mira \(T_C/T_H\) (kelvin): bajar \(T_C\) o subir \(T_H\) mejora \(\eta_C\). |
| **Prueba** | \(T_C=0^\circ\mathrm{C}\), \(T_H=100^\circ\mathrm{C}\) ⇒ usar 273 y 373, no 0 y 100. |

---

### 4.14 Electricidad (cap. 16) — sección `electricidad-basica`

#### CoulombFieldViz

| Campo | Valor |
|---|---|
| **Tipo** | `coulomb_field` |
| **Componente** | `physics/viz/CoulombFieldViz.tsx` |
| **Ancla** | `ELE-002` |
| **También** | ELE-003 `field`; ELE-004 `force_on_q`; ELE-007 `uniform` (placas → campo uniforme, \(\lvert\Delta V\rvert=Ed\)) |
| **Enseña** | Coulomb \(1/r^2\); \(\vec F=q\vec E\); signo de \(q\) invierte \(\vec F\) respecto de \(\vec E\). |
| **Layout** | 1–2 cargas en el plano; carga de prueba \(q\); flecha \(F\) o campo. Modo uniform: dos placas. |
| **Controles** | \(q_1,q_2,r\); signo. \(k_e\) constante mostrada. |
| **Idea (ELE-002)** | Vas a ver que la fuerza entre puntuales cae con \(r^2\) y es repulsiva si las cargas se parecen. |
| **Prueba** | Cambia un signo: las flechas se invierten (atracción). |
| **Idea (ELE-003)** | \(\vec E=\vec F/q\) de una prueba positiva. |
| **Idea (ELE-004)** | \(q<0\) siente \(\vec F\) opuesta a \(\vec E\). |
| **Idea (ELE-007)** | Entre placas, \(\lvert\Delta V\rvert=Ed\). |

#### ResistorNetworkViz

| Campo | Valor |
|---|---|
| **Tipo** | `resistor_network` |
| **Componente** | `physics/viz/ResistorNetworkViz.tsx` |
| **Ancla** | `ELE-014` serie |
| **También** | ELE-015 `parallel`; ELE-009 `ohm`; ELE-010 `resistivity` |
| **Enseña** | Serie: misma \(I\), \(R_{\mathrm{eq}}=\sum R\). Paralelo: misma \(V\), \(1/R_{\mathrm{eq}}=\sum 1/R\). Ohm \(V=IR\). \(R=\rho L/A\). |
| **Principio** | P4 serie ↔ paralelo |
| **Layout** | Esquema de 2–3 resistencias + fuente. Grosor de trazo ~ corriente. |
| **Controles** | \(R_i\), \(\mathcal{E}\); toggle serie/paralelo. Modo resistivity: sliders \(L,A,\rho\). |
| **Idea (ELE-014)** | Vas a ver que en serie la corriente es la misma y las resistencias se suman. |
| **Idea (ELE-015)** | Vas a ver que en paralelo la tensión es la misma y la equivalente es **menor** que cualquiera. |
| **Prueba (ELE-015)** | Dos iguales \(R\): \(R_{\mathrm{eq}}=R/2\) y cada rama lleva \(I/2\). |
| **Idea (ELE-009)** | \(V=IR\) en cada elemento óhmico. |
| **Idea (ELE-010)** | Más largo o más estrecho ⇒ más \(R\). |

#### KirchhoffViz

| Campo | Valor |
|---|---|
| **Tipo** | `kirchhoff` |
| **Componente** | `physics/viz/KirchhoffViz.tsx` |
| **Ancla** | `ELE-016` nudo |
| **También** | ELE-017 `loop` |
| **Enseña** | \(\sum I=0\) en un nudo; \(\sum\Delta V=0\) en una malla. |
| **Layout** | Circuito mínimo (una malla con 2 R y 1 fuente, o nudo de 3 corrientes). Flechas de \(I\); recorrido de malla con caídas. |
| **Idea (ELE-016)** | Vas a ver que lo que entra a un nudo sale: las corrientes se conservan como un caudal. |
| **Idea (ELE-017)** | Vas a ver que al cerrar una malla las subidas y bajadas de potencial suman cero. |
| **Prueba** | Recorre la malla: \(+\mathcal{E}-IR_1-IR_2=0\). |

#### ParallelPlateViz

| Campo | Valor |
|---|---|
| **Tipo** | `parallel_plate` |
| **Componente** | `physics/viz/ParallelPlateViz.tsx` |
| **Ancla** | `ELE-019` |
| **También** | ELE-018 `C_QV`; ELE-020 `energy` |
| **Enseña** | \(C=\varepsilon_0 A/d\); \(C=Q/V\); \(U=\tfrac12 CV^2\). |
| **Layout** | Placas; \(d\) y \(A\) variables; líneas de \(E\). |
| **Idea (ELE-019)** | Vas a ver que acercar las placas o agrandar el área sube \(C=\varepsilon_0 A/d\). |
| **Idea (ELE-018)** | A igual \(Q\), más \(C\) ⇒ menos \(V\). |
| **Idea (ELE-020)** | \(U=\tfrac12 CV^2\). |

---

### 4.15 Guía (cap. 18) — **section-hosted**

#### PhysicsGuideViz

| Campo | Valor |
|---|---|
| **Tipo** | `approach_guide` |
| **Componente** | `physics/viz/PhysicsGuideViz.tsx` |
| **Lugar** | Pie de `/fisica-basica/guia` y `/fisica-basica/seccion/guia-enfoque` (`FISICA_VIZ_BY_SECTION_NUMBER['18']`). **No** en una fórmula. |
| **Modelo** | `IntegrationDecisionTreeViz`: preguntas sí/no o chips de “señal”. |
| **Señales** | Exactamente las filas de la tabla del catálogo §18 (vectores, cinemática 1D, proyectil, Newton, …). Cada hoja enlaza a `sectionHref('fisica-basica', slug)`. |
| **Idea** | Vas a ver que el enunciado ya dice el bloque: la señal (choque, órbita, DCL, …) apunta a una sección, no a memorizar 195 IDs. |
| **Prueba** | Elige “proyectil, alcance”: el árbol termina en Movimiento 2D y 3D y abre esa sección. |

---

## 5. Matriz de cobertura (195 IDs)

Leyenda: **ancla** = página principal del recuso; **modo** = mismo componente, otro resalte; **—** = sin viz (usar Relacionadas).

### Cap. 1 Vectores (6)

| ID | Tipo | Modo |
|---|---|---|
| VEC-001 | vector_magnitude | — |
| VEC-002 | unit_vector | — |
| VEC-003 | vector_decomposition | — |
| VEC-004 | vector_addition | — |
| VEC-005 | dot_product | — |
| VEC-006 | cross_product | — |

### Cap. 2 Cinemática 1D (19)

| ID | Tipo | Modo |
|---|---|---|
| CIN-001 | kinematics_1d | displacement |
| CIN-002 | kinematics_1d | avg_velocity |
| CIN-003 | kinematics_1d | avg_speed |
| CIN-004 | kinematics_1d | inst_velocity |
| CIN-005 | kinematics_1d | avg_accel |
| CIN-006 | kinematics_1d | inst_accel |
| CIN-007 | kinematics_1d | mru |
| CIN-008 | kinematics_1d | mrua_v |
| CIN-009 | kinematics_1d | mrua_x |
| CIN-010 | kinematics_1d | torricelli |
| CIN-011 | kinematics_1d | mrua_avg |
| CIN-012 | kinematics_1d | var_a |
| CIN-013 | kinematics_1d | var_v |
| CIN-014 | free_fall | velocity |
| CIN-015 | free_fall | position |
| CIN-016 | free_fall | torricelli |
| CIN-017 | free_fall | hmax |
| CIN-018 | free_fall | t_up |
| CIN-019 | free_fall | t_flight |

### Cap. 3 Movimiento 2D (15)

| ID | Tipo | Modo |
|---|---|---|
| MOV-001 | vector_decomposition | position |
| MOV-002 | velocity_accel_2d | displacement |
| MOV-003 | velocity_accel_2d | avg_velocity |
| MOV-004 | velocity_accel_2d | inst_velocity |
| MOV-005 | velocity_accel_2d | acceleration |
| MOV-006 | projectile_motion | components |
| MOV-007 | projectile_motion | x |
| MOV-008 | projectile_motion | y |
| MOV-009 | projectile_motion | vy |
| MOV-010 | projectile_motion | vx |
| MOV-011 | projectile_motion | tmax |
| MOV-012 | projectile_motion | hmax |
| MOV-013 | projectile_motion | tflight |
| MOV-014 | projectile_motion | range |
| MOV-015 | relative_velocity | — |

### Cap. 4 Newton (8)

| ID | Tipo | Modo |
|---|---|---|
| NEW-001 | newton_second | inertia |
| NEW-002 | newton_second | — |
| NEW-003 | newton_third | — |
| NEW-004 | newton_second | weight |
| NEW-005 | friction | kinetic |
| NEW-006 | friction | — |
| NEW-007 | hooke | — |
| NEW-008 | inclined_plane | — |

### Cap. 5 Circular (8)

| ID | Tipo | Modo |
|---|---|---|
| CIR-001 | circular_motion | dtheta |
| CIR-002 | circular_motion | omega_avg |
| CIR-003 | circular_motion | omega |
| CIR-004 | circular_motion | v_omega_r |
| CIR-005 | circular_motion | omega_freq |
| CIR-006 | circular_motion | — |
| CIR-007 | circular_motion | Fc |
| CIR-008 | circular_motion | tangential |

### Cap. 6 Energía (15)

| ID | Tipo | Modo |
|---|---|---|
| ENE-001 | work_constant | — |
| ENE-002 | work_variable | — |
| ENE-003 | mechanical_energy | kinetic |
| ENE-004 | mechanical_energy | grav |
| ENE-005 | mechanical_energy | spring |
| ENE-006 | potential_force | conservative_work |
| ENE-007 | mechanical_energy | work_energy |
| ENE-008 | potential_force | — |
| ENE-009 | mechanical_energy | total |
| ENE-010 | mechanical_energy | — |
| ENE-011 | mechanical_energy | nonconservative |
| ENE-012 | mechanical_energy | friction_work |
| ENE-013 | work_constant | power_avg |
| ENE-014 | work_constant | power_inst |
| ENE-015 | — | cociente \(\eta\); sin geometría |

### Cap. 7 Momento (9)

| ID | Tipo | Modo |
|---|---|---|
| MOM-001 | impulse_momentum | p |
| MOM-002 | impulse_momentum | F_dpdt |
| MOM-003 | impulse_momentum | J |
| MOM-004 | impulse_momentum | — |
| MOM-005 | collision_1d | conservation |
| MOM-006 | collision_1d | inelastic |
| MOM-007 | collision_1d | — |
| MOM-008 | center_of_mass | — |
| MOM-009 | center_of_mass | v_cm |

### Cap. 8 Rotación (15)

| ID | Tipo | Modo |
|---|---|---|
| ROT-001 | circular_motion | alpha |
| ROT-002 | circular_motion | omega_alpha |
| ROT-003 | circular_motion | theta_alpha |
| ROT-004 | circular_motion | ang_torricelli |
| ROT-005 | moment_of_inertia | — |
| ROT-006 | moment_of_inertia | continuous |
| ROT-007 | moment_of_inertia | parallel_axis |
| ROT-008 | cross_product | torque |
| ROT-009 | torque | — |
| ROT-010 | rolling | krot |
| ROT-011 | rolling | — |
| ROT-012 | cross_product | angular_momentum |
| ROT-013 | angular_momentum | L_Iomega |
| ROT-014 | angular_momentum | tau_dL |
| ROT-015 | angular_momentum | — |

### Cap. 9 Equilibrio (8)

| ID | Tipo | Modo |
|---|---|---|
| EQU-001 | newton_second | inertia |
| EQU-002 | beam_equilibrium | — |
| EQU-003 | young_modulus | stress |
| EQU-004 | young_modulus | strain |
| EQU-005 | young_modulus | — |
| EQU-006 | — | cortante; v2 |
| EQU-007 | — | módulo de corte; v2 |
| EQU-008 | — | volumétrico; v2 |

### Cap. 10 Gravitación (8)

| ID | Tipo | Modo |
|---|---|---|
| GRA-001 | gravitation | — |
| GRA-002 | gravitation | field |
| GRA-003 | orbit | U |
| GRA-004 | — | \(\Phi=U/m\); ver GRA-003 |
| GRA-005 | orbit | — |
| GRA-006 | orbit | period |
| GRA-007 | orbit | escape |
| GRA-008 | orbit | E |

### Cap. 11 Fluidos (11)

| ID | Tipo | Modo |
|---|---|---|
| FLU-001 | — | definición \(\rho=m/V\) |
| FLU-002 | hydrostatic | pressure |
| FLU-003 | hydrostatic | — |
| FLU-004 | hydrostatic | difference |
| FLU-005 | pascal | — |
| FLU-006 | archimedes | — |
| FLU-007 | bernoulli | Q |
| FLU-008 | bernoulli | continuity |
| FLU-009 | bernoulli | — |
| FLU-010 | bernoulli | torricelli |
| FLU-011 | bernoulli | mass_flow |

### Cap. 12 Oscilaciones (14)

| ID | Tipo | Modo |
|---|---|---|
| OSC-001 | shm | Tf |
| OSC-002 | shm | omega |
| OSC-003 | shm | — |
| OSC-004 | shm | a |
| OSC-005 | shm | v |
| OSC-006 | shm | omega_spring |
| OSC-007 | shm | period_spring |
| OSC-008 | shm | energy |
| OSC-009 | shm | vmax |
| OSC-010 | shm | amax |
| OSC-011 | pendulum | omega |
| OSC-012 | pendulum | — |
| OSC-013 | — | péndulo físico; v2 |
| OSC-014 | — | torsión; v2 |

### Cap. 13 Ondas (10)

| ID | Tipo | Modo |
|---|---|---|
| OND-001 | traveling_wave | v_lambda_f |
| OND-002 | traveling_wave | T |
| OND-003 | traveling_wave | k |
| OND-004 | traveling_wave | omega |
| OND-005 | traveling_wave | — |
| OND-006 | — | \(v=\sqrt{F_T/\mu}\); caption en standing_wave |
| OND-007 | standing_wave | — |
| OND-008 | interference | superposition |
| OND-009 | interference | — |
| OND-010 | — | \(I=P/A\); v2 |

### Cap. 14 Sonido (7)

| ID | Tipo | Modo |
|---|---|---|
| SON-001 | traveling_wave | v_lambda_f |
| SON-002 | — | intensidad; v2 |
| SON-003 | — | dB; v2 |
| SON-004 | doppler | — |
| SON-005 | beats | — |
| SON-006 | resonance_tube | — |
| SON-007 | resonance_tube | closed |

### Cap. 15 Termodinámica (22)

| ID | Tipo | Modo |
|---|---|---|
| TER-001 | — | conversión K |
| TER-002 | — | conversión °F |
| TER-003 | thermal_expansion | — |
| TER-004 | thermal_expansion | area |
| TER-005 | thermal_expansion | volume |
| TER-006 | — | \(Q=mc\Delta T\) |
| TER-007 | — | capacidad |
| TER-008 | — | latente |
| TER-009 | — | calorimetría |
| TER-010 | pv_process | ideal_gas |
| TER-011 | pv_process | combined |
| TER-012 | — | \(\langle K\rangle=\tfrac32 k_BT\) |
| TER-013 | — | \(v_{\mathrm{rms}}\) |
| TER-014 | pv_process | U |
| TER-015 | pv_process | work |
| TER-016 | pv_process | — |
| TER-017 | pv_process | isothermal |
| TER-018 | pv_process | adiabatic |
| TER-019 | heat_engine | — |
| TER-020 | heat_engine | carnot |
| TER-021 | — | conducción |
| TER-022 | — | Stefan–Boltzmann |

### Cap. 16 Electricidad (20)

| ID | Tipo | Modo |
|---|---|---|
| ELE-001 | — | \(q=ne\) |
| ELE-002 | coulomb_field | — |
| ELE-003 | coulomb_field | field |
| ELE-004 | coulomb_field | force_on_q |
| ELE-005 | — | potencial; v2 |
| ELE-006 | — | \(U=qV\); v2 |
| ELE-007 | coulomb_field | uniform |
| ELE-008 | — | \(I=dQ/dt\) |
| ELE-009 | resistor_network | ohm |
| ELE-010 | resistor_network | resistivity |
| ELE-011 | — | \(R(T)\) |
| ELE-012 | — | \(P=VI\) |
| ELE-013 | — | \(E=Pt\) |
| ELE-014 | resistor_network | — |
| ELE-015 | resistor_network | parallel |
| ELE-016 | kirchhoff | — |
| ELE-017 | kirchhoff | loop |
| ELE-018 | parallel_plate | C_QV |
| ELE-019 | parallel_plate | — |
| ELE-020 | parallel_plate | energy |

### Cap. 17 Constantes

Sin IDs de fórmula. Sin viz.

### Cap. 18 Guía

Section `18` → `approach_guide`.

---

## 6. Fases de implementación

Cada fase incluye: componente(s), entradas en `fisica-viz.ts`, rama en `PhysicsVisualization`, claves `vizFisica`, y verificación en las páginas ancla (detalle + badge de catálogo).

### Fase 0 — Cableado (antes de cualquier gráfico)

- [ ] `fisica-viz.ts` + exports
- [ ] `PhysicsVisualization.tsx` (fallback “próximamente” si el type no existe)
- [ ] `FormulaDetail` / `FormulaCatalog` / `SectionView` / SEO `hasVisualization`
- [ ] `physMath.ts` + tests unitarios de proyectil, MRUA y MAS (números del catálogo: p. ej. \(v_0=20\), \(\theta=45^\circ\), \(g=9.81\) ⇒ \(R=v_0^2/g\))

### Fase 1 — Núcleo ★★★ (12 componentes; familias cinemática, proyectil, vectores 2D, Newton, circular, MAS)

Orden de construcción (dependencias):

1. Vectores 2D: magnitude, unit, decomposition, addition, dot (`vectorPlane`)
2. `Kinematics1DViz` + `physMath`
3. `FreeFallViz`
4. `ProjectileMotionViz`
5. `NewtonSecondLawViz` + `InclinedPlaneViz`
6. `CircularMotionViz`
7. `SHMViz`

Sin estos no se entiende el resto del curso.

### Fase 2 — Confusiones frecuentes ★★

- `CrossProductViz` + `TorqueViz` (ROT-009)
- `NewtonThirdLawViz`, `FrictionViz`, `HookeViz`
- `WorkConstantViz`, `WorkVariablePhysicsViz`, `MechanicalEnergyViz`
- `ImpulseMomentumViz`, `Collision1DViz`
- `VelocityAcceleration2DViz`, `RelativeVelocityViz`

### Fase 3 — Aplicaciones

- `PotentialForceViz`, `CenterOfMassViz`
- `MomentOfInertiaViz`, `RollingViz`, `AngularMomentumViz`
- `BeamEquilibriumViz`, `YoungModulusViz`
- `GravitationViz`, `OrbitViz`
- `HydrostaticViz`, `PascalViz`, `ArchimedesViz`, `BernoulliViz`
- `PendulumViz`

### Fase 4 — Ondas, termo, electricidad, guía

- `TravelingWaveViz`, `StandingWaveViz`, `InterferenceViz`, `DopplerViz`, `BeatsViz`, `ResonanceTubeViz`
- `ThermalExpansionViz`, `PVProcessViz`, `HeatEngineViz`
- `CoulombFieldViz`, `ResistorNetworkViz`, `KirchhoffViz`, `ParallelPlateViz`
- `PhysicsGuideViz` en sección 18

### Inventario de `type` (52) — para `fisica-viz.ts`

`vector_magnitude`, `unit_vector`, `vector_decomposition`, `vector_addition`, `dot_product`, `cross_product`, `kinematics_1d`, `free_fall`, `velocity_accel_2d`, `projectile_motion`, `relative_velocity`, `newton_second`, `newton_third`, `friction`, `hooke`, `inclined_plane`, `circular_motion`, `moment_of_inertia`, `torque`, `rolling`, `angular_momentum`, `work_constant`, `work_variable`, `potential_force`, `mechanical_energy`, `impulse_momentum`, `collision_1d`, `center_of_mass`, `beam_equilibrium`, `young_modulus`, `gravitation`, `orbit`, `hydrostatic`, `pascal`, `archimedes`, `bernoulli`, `shm`, `pendulum`, `traveling_wave`, `standing_wave`, `interference`, `doppler`, `beats`, `resonance_tube`, `thermal_expansion`, `pv_process`, `heat_engine`, `coulomb_field`, `resistor_network`, `kirchhoff`, `parallel_plate`, `approach_guide`.

### Fuera de v1 (29 IDs)

`ENE-015`, `EQU-006`, `EQU-007`, `EQU-008`, `GRA-004`, `FLU-001`, `OSC-013`, `OSC-014`, `OND-006`, `OND-010`, `SON-002`, `SON-003`, `TER-001`, `TER-002`, `TER-006`, `TER-007`, `TER-008`, `TER-009`, `TER-012`, `TER-013`, `TER-021`, `TER-022`, `ELE-001`, `ELE-005`, `ELE-006`, `ELE-008`, `ELE-011`, `ELE-012`, `ELE-013`.

Capítulo 17 (tabla de constantes) no tiene IDs.

---

## 7. Checklist de aceptación (por viz)

Un recuso no se da por cerrado si falla alguno:

1. La fórmula del caption es la del ID ancla (LaTeX del catálogo, misma convención de signos).
2. Idea + Prueba están **dentro** del panel; no hay párrafo duplicado encima.
3. Play/Pausa no desincroniza escena y gráficas (un solo estado `t`).
4. \(g\) y eje \(y\) arriba en caída libre y proyectil.
5. Tema claro/oscuro: solo tokens CSS.
6. Teclado: sliders nativos; botones con `type="button"`.
7. `aria-live` actualiza el valor principal.
8. El badge `viz` aparece en el catálogo de esa sección.
9. Cambiar `mode` por ID no remonta otro componente (mismo import, distinto resalte).
10. No se usa `formulaId.includes('VEC-')` ni ningún viz de álgebra/cálculo como página.

---

## 8. Relación con el copy de álgebra (para no copiar mal)

| Álgebra | Física | Qué se copia | Qué no |
|---|---|---|---|
| “Vas a ver que…” | Igual | Tono | Símbolos \(u,v\) |
| P0–P4 | P0–P4 + P-PHYS | Dual / toggle | Baldosas, matrices |
| `DotProductViz` | `DotProductPhysicsViz` | Proyección y arco | Componente montado |
| `WorkIntegralViz` | `WorkVariablePhysicsViz` | Área + `integrate` | Copy de integral indefinida / tanque de cálculo |
| `IntegrationDecisionTreeViz` | `PhysicsGuideViz` | Árbol + enlaces a sección | Preguntas de técnicas de integración |
| Modos en `viz-modes.ts` | Modos en el mapa `fisica-viz.ts` | Idea de familia | Inferencia por `includes` |

No añadir `### Visualización sugerida` al markdown de física en v1 (el mapa TypeScript es la fuente). Si más adelante se quiere el mismo contrato editorial que álgebra, se extiende `parse-physics-markdown.ts` **después**, copiando los campos Idea/Objetivo ya cerrados aquí.

---

## 9. Conteo

| | |
|---|---|
| Fórmulas en el catálogo | 195 |
| IDs con viz en v1 (ancla o modo) | 166 |
| IDs sin viz en v1 | 29 |
| Componentes React distintos | 52 |
| Section-hosted | 1 (cap. 18) |
| Familias más grandes | `kinematics_1d` (13 modos), `circular_motion` (12), `shm` (10), `projectile_motion` (9) |

52 componentes está por encima de cálculo (28) porque física mezcla geometría vectorial, escenas de movimiento y diagramas (P–V, circuitos). Sigue **sin** ser un componente por fórmula: 166 IDs se cubren con modos.

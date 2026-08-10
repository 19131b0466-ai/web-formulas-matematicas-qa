# Plan de interacción pedagógica — viz de Álgebra

Documento de criterios para diseñar e implementar recursos gráficos. Objetivo: que cada viz **enseñe** el concepto sin convertirse en ruido (p. ej. duales “2 en 1” aplicados por costumbre).

Fuente de verdad del runtime: modos en `apps/web-public/lib/viz-modes.ts`, componentes en `apps/web-public/components/algebra/viz/`, copy en `content/formulas-algebra.md`.

---

## 1. Principios (cerrados)

### P0 — Una sola explicación

**No duplicar** Idea / Objetivo / instrucción encima del card si el gráfico ya trae ese texto dentro del panel.

- Si el viz embebe guía pedagógica → ocultar copy externo (`vizHasEmbeddedGuide` en `viz-modes.ts`).
- Al rediseñar un gráfico con texto interno, añadir su ID a esa lista.
- El título de sección (“Explora la idea”) puede quedarse; el párrafo duplicado no.

### P1 — Acción / reorder

**Qué enseña:** el mismo objeto cambia de orden o de agrupación; el resultado no cambia.

**Layout:** un solo lienzo. El estudiante provoca el cambio.

**Interacción:** botón o control explícito (Intercambiar, Agrupar izquierda/derecha). No arrastrar obligatorio si el botón basta.

**No hacer:** dos filas estáticas “antes / después” a la vez. Eso elimina el “aha” de la acción.

**Aplica a:** `commute`, `associate`.

### P2 — Reescritura / dos formas geométricas

**Qué enseña:** dos construcciones distintas representan la misma cantidad (área, valor).

**Layout:** dual panel o overlay justificado (LHS ↔ RHS con formas diferentes).

**Interacción:** sliders actualizan ambas formas; caption confirma igualdad.

**Aplica a:** `distribute`, `square_minus` (forma limpia vs expansión), De Morgan en `logic_gate`.

### P3 — Descomposición en sitio

**Qué enseña:** un todo se parte en piezas etiquetadas.

**Layout:** un diagrama con regiones (p. ej. \((a+b)^2\), rejilla \((ax+b)(cx+d)\)).

**No hacer:** duplicar el mismo diagrama “expandido” al lado si las piezas ya están en el original.

**Aplica a:** `square`, `poly_grid`, `binomial` (fila de Pascal / coeficientes).

### P4 — Toggle de forma

**Qué enseña:** la misma identidad en dos representaciones; el estudiante **cambia** de una a otra.

**Layout:** un lienzo que **reemplaza** la escena al pulsar (no dual permanente).

**Aplica a:** `diff_sq` (expandido ↔ factorizado), `complete_square` (añadir/quitar el cuadrado del hueco).

### Regla de oro

Si quitar el segundo panel **no pierde** el concepto y un botón/acción lo demuestra **mejor**, **no uses dual**.

```mermaid
flowchart TD
  start[Nueva viz o cambio de layout]
  q1{Es reorder o agrupacion del mismo objeto?}
  q2{Son dos construcciones geometricas distintas de la misma cantidad?}
  q3{Son dos representaciones que el alumno debe alternar?}
  action[P1: un lienzo + accion]
  rewrite[P2: dual o overlay]
  toggle[P4: un lienzo + toggle que reemplaza]
  decomp[P3: un diagrama con partes]
  start --> q1
  q1 -->|si| action
  q1 -->|no| q2
  q2 -->|si| rewrite
  q2 -->|no| q3
  q3 -->|si| toggle
  q3 -->|no| decomp
```

---

## 2. Fichas por modo `algebra_tiles`

### `commute` (ALG-FND-001)

| Campo | Decisión |
|---|---|
| **Enseña** | El orden de sumandos no cambia el total. |
| **Layout** | Una fila: bloques \(a\), \(b\) + barra de longitud \(a+b\). Etiqueta refleja el orden actual. |
| **Interacción** | Solo botón **Intercambiar** (`swapped`). Valores \(a\), \(b\) fijos (distintos) para que el reorden se note. Sin sliders. |
| **Técnico** | Estado `swapped: boolean`. Caption: orden actual = total. Labels: `swap`, `orderAb`. |
| **Veredicto** | **RESTORE** — single + botón (no dual-row). |

### `associate` (ALG-FND-002)

| Campo | Decisión |
|---|---|
| **Enseña** | Cambiar la agrupación no cambia el total; importa qué se suma primero. |
| **Layout** | Paso 1: trío \(a,b,c\) con recuadro en la pareja; Paso 2: bloque del parcial + el sumando restante + barra de total. |
| **Interacción** | Solo botón **Agrupar izquierda / derecha** (`assocRight`). Valores fijos. Sin sliders. |
| **Técnico** | Estado `assocRight: boolean`. Caption: `1º parcial` · `2º total`. Labels: `groupLeft`, `groupRight`. |
| **Veredicto** | Single + toggle; enfatizar cálculo parcial (no solo mover el recuadro). |

### `distribute` (ALG-FND-003, ALG-FAC-001)

| Campo | Decisión |
|---|---|
| **Enseña** | \(a(b+c)\) y \(ab+ac\) son la misma área (expandir / factor común). |
| **Layout** | Dual panel: rectángulo único vs dos rectángulos separados. FAC-001 invierte lados (flecha ←). |
| **Interacción** | Sliders \(a,b,c\); ambas áreas se actualizan; caption confirma igualdad. |
| **Técnico** | `fitScale`; `formulaId.includes('FAC-001')` para invertir paneles. |
| **Veredicto** | **KEEP** dual — es reescritura (P2). |

### `square` (IDN-001, FAC-003)

| Campo | Decisión |
|---|---|
| **Enseña** | \((a+b)^2=a^2+2ab+b^2\): misma área como lado total y como \(a^2+ab+ab+b^2\); el 2 de \(2ab\) son dos rectángulos. |
| **Layout** | Cuadrado exterior fijo; divisiones proporcionales \(a:(a+b)\); etiquetas dimensionales; pasos de construcción; identidad ≠ ejemplo numérico. |
| **Interacción** | Sliders \(a,b\ge0\); Anterior/Siguiente/Ver todo. Guía embebida. |
| **Componente** | `SquareSumViz.tsx` |
| **Veredicto** | Demostración geométrica completa (P3). |

### `square_minus` (IDN-002)

| Campo | Decisión |
|---|---|
| **Enseña** | \((a-b)^2\) vs expansión \(a^2-2ab+b^2\). |
| **Layout** | Dual: cuadrado limpio de lado \(a-b\) ↔ cuadrado \(a\) con piezas \(\pm ab\), \(+b^2\). |
| **Veredicto** | **KEEP** dual — reescritura geométrica (P2). |

### `diff_sq` (IDN-003, FAC-002)

| Campo | Decisión |
|---|---|
| **Enseña** | \(a^2-b^2 = (a-b)(a+b)\). |
| **Layout** | Toggle que **reemplaza**: L-región (\(a^2\) con hueco \(b^2\)) **o** rectángulo \((a-b)\times(a+b)\). No dual permanente al factorizar. |
| **Interacción** | Botón expandido ↔ factorizado. |
| **Veredicto** | **ADJUST** — restaurar reemplazo de escena (P4). |

### `poly_grid` (EXP-003)

| Campo | Decisión |
|---|---|
| **Enseña** | \((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\): productos parciales, semejantes y resultado. |
| **Layout** | Cuadrícula \(2\times2\) de términos (tamaño fijo, no áreas); secuencia expansión → agrupación → simplificado; convolución opcional. |
| **Interacción** | Sliders \(a,b,c,d\). Guía embebida. |
| **Componente** | `PolynomialProductViz.tsx` |
| **Veredicto** | No usar \((a+b)(c+d)\) como ejemplo principal. |

### `binomial` (IDN-008)

| Campo | Decisión |
|---|---|
| **Enseña** | Coeficientes de \((a+b)^n\) (fila de Pascal). |
| **Layout** | Una fila / diagrama de coeficientes. |
| **Veredicto** | **KEEP**. |

### `complete_square` (EQU-005)

| Campo | Decisión |
|---|---|
| **Enseña** | Completar el cuadrado añadiendo/restando \((b/2)^2\). |
| **Layout** | Un diagrama; toggle muestra/oculta el hueco. |
| **Veredicto** | **KEEP** (P4). |

### `degree` (POL-008)

| Campo | Decisión |
|---|---|
| **Enseña** | Grado como suma de exponentes en monomio. |
| **Layout** | Representación simple de exponentes (no dual de identidades). |
| **Veredicto** | **KEEP**. |

### `power` (ALG-POT-001)

| Campo | Decisión |
|---|---|
| **Enseña** | \(a^n\cdot a^m=a^{n+m}\) porque se reúnen \(n+m\) factores \(a\). |
| **Layout** | Dos grupos con \(\times\); luego secuencia unida (borde sólido / discontinuo); resultado \(a^{n+m}\). |
| **Interacción** | Sliders enteros \(n,m\in[1,6]\). Guía embebida (sin Idea/Objetivo duplicados). |
| **Componente** | `PowerProductViz.tsx` |
| **Veredicto** | Factores explícitos con letra \(a\); no bloques vacíos. |

### `conjugate_rationalize` (ALG-POT-008)

| Campo | Decisión |
|---|---|
| **Enseña** | Racionalizar \(1/(a+\sqrt{b})\) multiplicando por conjugado/conjugado (=1). |
| **Layout** | Tres etapas: original → × conjugado → resultado; panel expandible de la identidad. |
| **Interacción** | Sliders \(a\), \(b\ge0\); bloqueo/aviso si \(a^2-b=0\). Guía embebida. |
| **Componente** | `ConjugateRationalizeViz.tsx` |
| **Veredicto** | Proceso completo, no solo “sale \(a^2-b\)”. |

---

## 3. Criterios breves por tipo de viz

| Tipo | Criterio | Duales actuales |
|---|---|---|
| `graph` | Overlay en **mismos** ejes (curvas, raíces, intersección). No dos paneles de la misma función. | `system`, `poly_system`, `inverse_pair` OK como overlay. |
| `matrix` | Panel resultado solo si aporta info nueva (A vs Aᵀ, L·U). No clonar A “por si acaso”. | `transpose`, `lu`, ops: OK si RHS ≠ copia cosmélica. |
| `matrix_transform` | Pasos de descomposición secuenciales, no dual estático inútil. | SVD/QR: etapas, no 2-en-1 forzado. |
| `vector` | Un plano; proyecciones/ángulos en sitio. | No dual paneles. |
| `logic_gate` | Dual OK para De Morgan: LHS y RHS son expresiones lógicas distintas (P2). | **Pasa** el criterio. |
| `truth_table` | Columnas de comparación en tabla (no SVG dual). | OK. |
| `number_line` / `modular_clock` | Un eje / un reloj. Absoluto (FND-006): segmento \(x\)–\(0\). Distancia (FND-007): segmento \(a\)–\(b\) con \(d=|a-b|\), simétrica. | No dual. |
| `error_correction` | Estado del código + síndrome; no duplicar la misma trama. | — |

**Prohibido por defecto:** aplicar “dos paneles siempre que haya una igualdad \(A=B\)”. Solo si \(A\) y \(B\) son **construcciones visuales distintas** (P2) o el alumno debe **alternar** representaciones (P4).

---

## 4. Checklist de implementación (esta pasada)

1. [x] Este documento en `docs/algebra-viz-interaction-plan.md`.
2. [x] Restaurar `commute` y `associate` a single + botón en `AlgebraTilesViz.tsx`.
3. [x] Ajustar `diff_sq` factored a reemplazo de escena (no dual permanente).
4. [x] Mantener `distribute` y `square_minus` duales.
5. [x] Actualizar Idea / Elementos / Interactividad de FND-001 y FND-002 en `content/formulas-algebra.md`.
6. [x] Actualizar claves en `apps/web-public/content-i18n/{en,de,fr,it,pt}.json`.
7. [x] Seed de contenido algebra si el entorno tiene `DATABASE_URL` (prod/local habitual).

Fuera de alcance aquí: rehacer matrices/SVD/QR u otras familias; solo se fijan criterios para no repetir el error.

---

## 5. Criterio de aceptación

- **FND-001:** el estudiante pulsa Intercambiar y ve el mismo total en una sola fila.
- **FND-002:** alterna agrupación en el mismo trío de bloques.
- **FND-003:** sigue viendo dos construcciones de área.
- **IDN-003 / FAC-002:** al factorizar, la escena se reemplaza (no un segundo panel fijo permanente).
- Futuras viz consultan este documento antes de añadir duales.

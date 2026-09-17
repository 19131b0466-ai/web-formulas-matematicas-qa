# Rutas para revisión manual — Cálculo Diferencial

Base: `https://<tu-dominio>/calculo-diferencial/...` (español sin prefijo `/es`; otros idiomas: `/en`, `/de`, `/pt`, `/fr`, `/it`)

**Total:** 161 fórmulas `DIF-###` + 5 topic hubs + guía §16 + 27 visualizaciones interactivas.

## Checklist QA automatizado

```bash
pnpm --filter @repo/content-parser build
node scripts/verify-calculo-diferencial.mjs
pnpm typecheck && pnpm test && pnpm build
pnpm seo:sitemap-audit   # tras deploy
```

## Checklist manual (6 idiomas)

- [ ] Home `/calculo-diferencial` y `/en/calculo-diferencial`: título y descripción localizados
- [ ] KaTeX renderiza en ES, EN, DE, FR, IT, PT (muestra: DIF-038, DIF-114, DIF-106)
- [ ] Fórmulas relacionadas cross-subject: DIF-038 → INT-024; DIF-043 → CIN-004
- [ ] Topic hubs: `/calculo-diferencial/temas/regla-cadena`
- [ ] Guía: `/calculo-diferencial/guia` (tabla señal→método + árbol interactivo §16)
- [ ] Visualizaciones muestra: DIF-038 (secante), DIF-098 (optimización), DIF-114 (L'Hôpital), DIF-106 (Taylor)
- [ ] Búsqueda: `DIF-054`, `regla de la cadena`, `L'Hôpital`
- [ ] Sitemap incluye `/calculo-diferencial/guia` y topic hubs

## Deploy

1. Seed en staging (desde `apps/api`): `pnpm db:seed -- ../../content/formulas-calculo-diferencial.md`
2. `pnpm build` en CI verde
3. Deploy API + web-public (Vercel u host configurado)
4. `SEO_AUDIT_ORIGIN=https://<staging> pnpm seo:sitemap-audit`
5. Repetir en producción tras merge a `main`

## 1. Notación, funciones y dominios

Índice: [/calculo-diferencial/seccion/notacion-funciones](/calculo-diferencial/seccion/notacion-funciones)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-001 | [/calculo-diferencial/formula/DIF-001](/calculo-diferencial/formula/DIF-001) | 1.1 Definición por casos del valor absoluto. | — |
| DIF-002 | [/calculo-diferencial/formula/DIF-002](/calculo-diferencial/formula/DIF-002) | 1.1 Entorno simétrico de radio \(\delta\) alrededor de \(a\). | — |
| DIF-003 | [/calculo-diferencial/formula/DIF-003](/calculo-diferencial/formula/DIF-003) | 1.1 DIF-003 | — |
| DIF-004 | [/calculo-diferencial/formula/DIF-004](/calculo-diferencial/formula/DIF-004) | 1.2 Dominio natural de una función real. | — |
| DIF-005 | [/calculo-diferencial/formula/DIF-005](/calculo-diferencial/formula/DIF-005) | 1.2 Imagen o rango de la función. | — |
| DIF-006 | [/calculo-diferencial/formula/DIF-006](/calculo-diferencial/formula/DIF-006) | 1.3 Composición de funciones; requiere \(x\in\operatorname{Dom}(g)\) y \(… | — |
| DIF-007 | [/calculo-diferencial/formula/DIF-007](/calculo-diferencial/formula/DIF-007) | 1.3 Identidades de una función biyectiva y su inversa en sus dominios res… | — |
| DIF-008 | [/calculo-diferencial/formula/DIF-008](/calculo-diferencial/formula/DIF-008) | 1.4 Identidad pitagórica fundamental. | — |
| DIF-009 | [/calculo-diferencial/formula/DIF-009](/calculo-diferencial/formula/DIF-009) | 1.4 DIF-009 | — |
| DIF-010 | [/calculo-diferencial/formula/DIF-010](/calculo-diferencial/formula/DIF-010) | 1.4 DIF-010 | — |

## 2. Límites

Índice: [/calculo-diferencial/seccion/limites](/calculo-diferencial/seccion/limites)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-011 | [/calculo-diferencial/formula/DIF-011](/calculo-diferencial/formula/DIF-011) | 2.1 El valor \(f(x)\) se acerca a \(L\) cuando \(x\) se acerca a \(a\) (s… | limit_explorer (informal) |
| DIF-012 | [/calculo-diferencial/formula/DIF-012](/calculo-diferencial/formula/DIF-012) | 2.2 Definición formal de límite finito. | limit_explorer (epsilon_delta) |
| DIF-013 | [/calculo-diferencial/formula/DIF-013](/calculo-diferencial/formula/DIF-013) | 2.3 DIF-013 | limit_explorer (lateral) |
| DIF-014 | [/calculo-diferencial/formula/DIF-014](/calculo-diferencial/formula/DIF-014) | 2.3 El límite bilateral existe si y solo si coinciden los laterales. | — |
| DIF-015 | [/calculo-diferencial/formula/DIF-015](/calculo-diferencial/formula/DIF-015) | 2.4 Válido si los límites de \(f\) y \(g\) existen. | — |
| DIF-016 | [/calculo-diferencial/formula/DIF-016](/calculo-diferencial/formula/DIF-016) | 2.4 DIF-016 | — |
| DIF-017 | [/calculo-diferencial/formula/DIF-017](/calculo-diferencial/formula/DIF-017) | 2.4 DIF-017 | — |
| DIF-018 | [/calculo-diferencial/formula/DIF-018](/calculo-diferencial/formula/DIF-018) | 2.4 DIF-018 | — |
| DIF-019 | [/calculo-diferencial/formula/DIF-019](/calculo-diferencial/formula/DIF-019) | 2.4 DIF-019 | — |
| DIF-020 | [/calculo-diferencial/formula/DIF-020](/calculo-diferencial/formula/DIF-020) | 2.5 DIF-020 | limit_explorer (notable) |
| DIF-021 | [/calculo-diferencial/formula/DIF-021](/calculo-diferencial/formula/DIF-021) | 2.5 DIF-021 | — |
| DIF-022 | [/calculo-diferencial/formula/DIF-022](/calculo-diferencial/formula/DIF-022) | 2.5 DIF-022 | — |
| DIF-023 | [/calculo-diferencial/formula/DIF-023](/calculo-diferencial/formula/DIF-023) | 2.5 DIF-023 | — |
| DIF-024 | [/calculo-diferencial/formula/DIF-024](/calculo-diferencial/formula/DIF-024) | 2.5 DIF-024 | limit_explorer (e_definition) |
| DIF-025 | [/calculo-diferencial/formula/DIF-025](/calculo-diferencial/formula/DIF-025) | 2.5 DIF-025 | — |
| DIF-026 | [/calculo-diferencial/formula/DIF-026](/calculo-diferencial/formula/DIF-026) | 2.6 DIF-026 | — |
| DIF-027 | [/calculo-diferencial/formula/DIF-027](/calculo-diferencial/formula/DIF-027) | 2.6 Comportamiento de cocientes de polinomios cuando \(x o\infty\). | — |
| DIF-028 | [/calculo-diferencial/formula/DIF-028](/calculo-diferencial/formula/DIF-028) | 2.7 DIF-028 | — |
| DIF-029 | [/calculo-diferencial/formula/DIF-029](/calculo-diferencial/formula/DIF-029) | 2.7 DIF-029 | — |

## 3. Continuidad

Índice: [/calculo-diferencial/seccion/continuidad](/calculo-diferencial/seccion/continuidad)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-030 | [/calculo-diferencial/formula/DIF-030](/calculo-diferencial/formula/DIF-030) | 3.1 DIF-030 | continuity_checker (definition) |
| DIF-031 | [/calculo-diferencial/formula/DIF-031](/calculo-diferencial/formula/DIF-031) | 3.1 Teorema del Valor Intermedio (enunciado cualitativo). | intermediate_value |
| DIF-032 | [/calculo-diferencial/formula/DIF-032](/calculo-diferencial/formula/DIF-032) | 3.2 DIF-032 | continuity_checker (discontinuity) |
| DIF-033 | [/calculo-diferencial/formula/DIF-033](/calculo-diferencial/formula/DIF-033) | 3.2 DIF-033 | — |
| DIF-034 | [/calculo-diferencial/formula/DIF-034](/calculo-diferencial/formula/DIF-034) | 3.2 DIF-034 | — |
| DIF-035 | [/calculo-diferencial/formula/DIF-035](/calculo-diferencial/formula/DIF-035) | 3.3 DIF-035 | — |
| DIF-036 | [/calculo-diferencial/formula/DIF-036](/calculo-diferencial/formula/DIF-036) | 3.3 Teorema del Valor Extremo. | — |
| DIF-037 | [/calculo-diferencial/formula/DIF-037](/calculo-diferencial/formula/DIF-037) | 3.3 Para todo \(k\) entre \(f(a)\) y \(f(b)\) (TVI). | — |

## 4. Derivada e interpretación geométrica

Índice: [/calculo-diferencial/seccion/derivada-geometrica](/calculo-diferencial/seccion/derivada-geometrica)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-038 | [/calculo-diferencial/formula/DIF-038](/calculo-diferencial/formula/DIF-038) | 4.1 Definición de derivada por límite del cociente incremental. | limit_explorer (secante) |
| DIF-039 | [/calculo-diferencial/formula/DIF-039](/calculo-diferencial/formula/DIF-039) | 4.1 DIF-039 | — |
| DIF-040 | [/calculo-diferencial/formula/DIF-040](/calculo-diferencial/formula/DIF-040) | 4.2 Ecuación de la recta tangente a \(y=f(x)\) en \(x=a\). | tangent_line (tangent) |
| DIF-041 | [/calculo-diferencial/formula/DIF-041](/calculo-diferencial/formula/DIF-041) | 4.2 Ecuación de la recta normal. | tangent_line (normal) |
| DIF-042 | [/calculo-diferencial/formula/DIF-042](/calculo-diferencial/formula/DIF-042) | 4.2 Pendiente de la tangente. | — |
| DIF-043 | [/calculo-diferencial/formula/DIF-043](/calculo-diferencial/formula/DIF-043) | 4.3 Velocidad instantánea como derivada de la posición. | derivative_from_graph (kinematics) |
| DIF-044 | [/calculo-diferencial/formula/DIF-044](/calculo-diferencial/formula/DIF-044) | 4.3 Aceleración instantánea. | derivative_from_graph (kinematics_accel) |
| DIF-045 | [/calculo-diferencial/formula/DIF-045](/calculo-diferencial/formula/DIF-045) | 4.4 DIF-045 | — |
| DIF-046 | [/calculo-diferencial/formula/DIF-046](/calculo-diferencial/formula/DIF-046) | 4.4 DIF-046 | — |

## 5. Reglas de derivación

Índice: [/calculo-diferencial/seccion/reglas-derivacion](/calculo-diferencial/seccion/reglas-derivacion)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-047 | [/calculo-diferencial/formula/DIF-047](/calculo-diferencial/formula/DIF-047) | 5.1 DIF-047 | — |
| DIF-048 | [/calculo-diferencial/formula/DIF-048](/calculo-diferencial/formula/DIF-048) | 5.1 DIF-048 | — |
| DIF-049 | [/calculo-diferencial/formula/DIF-049](/calculo-diferencial/formula/DIF-049) | 5.1 DIF-049 | — |
| DIF-050 | [/calculo-diferencial/formula/DIF-050](/calculo-diferencial/formula/DIF-050) | 5.1 DIF-050 | — |
| DIF-051 | [/calculo-diferencial/formula/DIF-051](/calculo-diferencial/formula/DIF-051) | 5.2 DIF-051 | product_rule |
| DIF-052 | [/calculo-diferencial/formula/DIF-052](/calculo-diferencial/formula/DIF-052) | 5.2 Extensión a tres factores. | — |
| DIF-053 | [/calculo-diferencial/formula/DIF-053](/calculo-diferencial/formula/DIF-053) | 5.3 DIF-053 | — |
| DIF-054 | [/calculo-diferencial/formula/DIF-054](/calculo-diferencial/formula/DIF-054) | 5.4 DIF-054 | chain_rule |
| DIF-055 | [/calculo-diferencial/formula/DIF-055](/calculo-diferencial/formula/DIF-055) | 5.4 Notación de Leibniz para composición. | — |
| DIF-056 | [/calculo-diferencial/formula/DIF-056](/calculo-diferencial/formula/DIF-056) | 5.5 DIF-056 | — |
| DIF-057 | [/calculo-diferencial/formula/DIF-057](/calculo-diferencial/formula/DIF-057) | 5.5 DIF-057 | — |
| DIF-058 | [/calculo-diferencial/formula/DIF-058](/calculo-diferencial/formula/DIF-058) | 5.5 DIF-058 | — |
| DIF-059 | [/calculo-diferencial/formula/DIF-059](/calculo-diferencial/formula/DIF-059) | 5.5 DIF-059 | — |
| DIF-060 | [/calculo-diferencial/formula/DIF-060](/calculo-diferencial/formula/DIF-060) | 5.5 DIF-060 | — |
| DIF-061 | [/calculo-diferencial/formula/DIF-061](/calculo-diferencial/formula/DIF-061) | 5.5 DIF-061 | — |
| DIF-062 | [/calculo-diferencial/formula/DIF-062](/calculo-diferencial/formula/DIF-062) | 5.6 DIF-062 | — |
| DIF-063 | [/calculo-diferencial/formula/DIF-063](/calculo-diferencial/formula/DIF-063) | 5.6 DIF-063 | — |
| DIF-064 | [/calculo-diferencial/formula/DIF-064](/calculo-diferencial/formula/DIF-064) | 5.6 DIF-064 | — |
| DIF-065 | [/calculo-diferencial/formula/DIF-065](/calculo-diferencial/formula/DIF-065) | 5.6 DIF-065 | — |
| DIF-066 | [/calculo-diferencial/formula/DIF-066](/calculo-diferencial/formula/DIF-066) | 5.6 DIF-066 | — |
| DIF-067 | [/calculo-diferencial/formula/DIF-067](/calculo-diferencial/formula/DIF-067) | 5.7 DIF-067 | — |
| DIF-068 | [/calculo-diferencial/formula/DIF-068](/calculo-diferencial/formula/DIF-068) | 5.7 DIF-068 | — |
| DIF-069 | [/calculo-diferencial/formula/DIF-069](/calculo-diferencial/formula/DIF-069) | 5.7 DIF-069 | — |
| DIF-070 | [/calculo-diferencial/formula/DIF-070](/calculo-diferencial/formula/DIF-070) | 5.7 DIF-070 | — |
| DIF-071 | [/calculo-diferencial/formula/DIF-071](/calculo-diferencial/formula/DIF-071) | 5.7 DIF-071 | — |
| DIF-072 | [/calculo-diferencial/formula/DIF-072](/calculo-diferencial/formula/DIF-072) | 5.7 DIF-072 | — |
| DIF-073 | [/calculo-diferencial/formula/DIF-073](/calculo-diferencial/formula/DIF-073) | 5.8 Útil para potencias variables y productos/cocientes. | — |
| DIF-074 | [/calculo-diferencial/formula/DIF-074](/calculo-diferencial/formula/DIF-074) | 5.8 Paso inicial para derivar \(f^g\) con exponente variable. | log_diff |

## 6. Derivadas de orden superior

Índice: [/calculo-diferencial/seccion/derivadas-superiores](/calculo-diferencial/seccion/derivadas-superiores)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-075 | [/calculo-diferencial/formula/DIF-075](/calculo-diferencial/formula/DIF-075) | 6.1 DIF-075 | — |
| DIF-076 | [/calculo-diferencial/formula/DIF-076](/calculo-diferencial/formula/DIF-076) | 6.1 DIF-076 | — |
| DIF-077 | [/calculo-diferencial/formula/DIF-077](/calculo-diferencial/formula/DIF-077) | 6.2 DIF-077 | — |
| DIF-078 | [/calculo-diferencial/formula/DIF-078](/calculo-diferencial/formula/DIF-078) | 6.2 DIF-078 | — |
| DIF-079 | [/calculo-diferencial/formula/DIF-079](/calculo-diferencial/formula/DIF-079) | 6.2 DIF-079 | — |
| DIF-080 | [/calculo-diferencial/formula/DIF-080](/calculo-diferencial/formula/DIF-080) | 6.2 DIF-080 | — |

## 7. Teorema del Valor Medio

Índice: [/calculo-diferencial/seccion/teorema-valor-medio](/calculo-diferencial/seccion/teorema-valor-medio)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-081 | [/calculo-diferencial/formula/DIF-081](/calculo-diferencial/formula/DIF-081) | 7.1 DIF-081 | mean_value_theorem (rolle) |
| DIF-082 | [/calculo-diferencial/formula/DIF-082](/calculo-diferencial/formula/DIF-082) | 7.2 DIF-082 | mean_value_theorem (mvt) |
| DIF-083 | [/calculo-diferencial/formula/DIF-083](/calculo-diferencial/formula/DIF-083) | 7.2 Forma equivalente del TVM. | — |
| DIF-084 | [/calculo-diferencial/formula/DIF-084](/calculo-diferencial/formula/DIF-084) | 7.3 DIF-084 | — |
| DIF-085 | [/calculo-diferencial/formula/DIF-085](/calculo-diferencial/formula/DIF-085) | 7.3 DIF-085 | — |
| DIF-086 | [/calculo-diferencial/formula/DIF-086](/calculo-diferencial/formula/DIF-086) | 7.3 DIF-086 | — |

## 8. Análisis de funciones

Índice: [/calculo-diferencial/seccion/analisis-funciones](/calculo-diferencial/seccion/analisis-funciones)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-087 | [/calculo-diferencial/formula/DIF-087](/calculo-diferencial/formula/DIF-087) | 8.1 DIF-087 | — |
| DIF-088 | [/calculo-diferencial/formula/DIF-088](/calculo-diferencial/formula/DIF-088) | 8.1 DIF-088 | — |
| DIF-089 | [/calculo-diferencial/formula/DIF-089](/calculo-diferencial/formula/DIF-089) | 8.2 DIF-089 | concavity_analyzer |
| DIF-090 | [/calculo-diferencial/formula/DIF-090](/calculo-diferencial/formula/DIF-090) | 8.2 DIF-090 | — |
| DIF-091 | [/calculo-diferencial/formula/DIF-091](/calculo-diferencial/formula/DIF-091) | 8.3 DIF-091 | — |
| DIF-092 | [/calculo-diferencial/formula/DIF-092](/calculo-diferencial/formula/DIF-092) | 8.3 Criterio de la segunda derivada (mínimo). | — |
| DIF-093 | [/calculo-diferencial/formula/DIF-093](/calculo-diferencial/formula/DIF-093) | 8.3 Criterio de la segunda derivada (máximo). | — |
| DIF-094 | [/calculo-diferencial/formula/DIF-094](/calculo-diferencial/formula/DIF-094) | 8.3 Criterio de la primera derivada. | — |
| DIF-095 | [/calculo-diferencial/formula/DIF-095](/calculo-diferencial/formula/DIF-095) | 8.3 DIF-095 | — |
| DIF-096 | [/calculo-diferencial/formula/DIF-096](/calculo-diferencial/formula/DIF-096) | 8.4 DIF-096 | — |

## 9. Optimización

Índice: [/calculo-diferencial/seccion/optimizacion](/calculo-diferencial/seccion/optimizacion)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-097 | [/calculo-diferencial/formula/DIF-097](/calculo-diferencial/formula/DIF-097) | 9.2 Máximo absoluto en \([a,b]\) comparando críticos \(c_i\) y extremos. | — |
| DIF-098 | [/calculo-diferencial/formula/DIF-098](/calculo-diferencial/formula/DIF-098) | 9.2 Ejemplo tipo: área máxima con perímetro fijo (rectángulo → cuadrado). | optimization_scenario (rectangle) |
| DIF-099 | [/calculo-diferencial/formula/DIF-099](/calculo-diferencial/formula/DIF-099) | 9.2 Ejemplo tipo: cilindro de superficie fija y volumen máximo. | optimization_scenario (cylinder) |

## 10. Aproximaciones lineales y diferenciales

Índice: [/calculo-diferencial/seccion/aproximaciones-diferenciales](/calculo-diferencial/seccion/aproximaciones-diferenciales)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-100 | [/calculo-diferencial/formula/DIF-100](/calculo-diferencial/formula/DIF-100) | 10.1 Diferencial de \(y=f(x)\). | — |
| DIF-101 | [/calculo-diferencial/formula/DIF-101](/calculo-diferencial/formula/DIF-101) | 10.1 Incremento verdadero de la función. | — |
| DIF-102 | [/calculo-diferencial/formula/DIF-102](/calculo-diferencial/formula/DIF-102) | 10.2 Polinomio de Taylor de grado 1 (aproximación lineal en \(a\)). | linear_approximation |
| DIF-103 | [/calculo-diferencial/formula/DIF-103](/calculo-diferencial/formula/DIF-103) | 10.2 DIF-103 | — |
| DIF-104 | [/calculo-diferencial/formula/DIF-104](/calculo-diferencial/formula/DIF-104) | 10.2 Aproximación del incremento para \(\Delta x\) pequeño. | — |
| DIF-105 | [/calculo-diferencial/formula/DIF-105](/calculo-diferencial/formula/DIF-105) | 10.2 Aproximación lineal clásica. | — |

## 11. Series de Taylor (introducción)

Índice: [/calculo-diferencial/seccion/series-taylor](/calculo-diferencial/seccion/series-taylor)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-106 | [/calculo-diferencial/formula/DIF-106](/calculo-diferencial/formula/DIF-106) | 11.1 Polinomio de Taylor de orden \(n\) centrado en \(a\). | taylor_approximation |
| DIF-107 | [/calculo-diferencial/formula/DIF-107](/calculo-diferencial/formula/DIF-107) | 11.1 Descomposición función = aproximación + resto. | — |
| DIF-108 | [/calculo-diferencial/formula/DIF-108](/calculo-diferencial/formula/DIF-108) | 11.2 DIF-108 | — |
| DIF-109 | [/calculo-diferencial/formula/DIF-109](/calculo-diferencial/formula/DIF-109) | 11.2 DIF-109 | — |
| DIF-110 | [/calculo-diferencial/formula/DIF-110](/calculo-diferencial/formula/DIF-110) | 11.2 DIF-110 | — |
| DIF-111 | [/calculo-diferencial/formula/DIF-111](/calculo-diferencial/formula/DIF-111) | 11.2 DIF-111 | — |
| DIF-112 | [/calculo-diferencial/formula/DIF-112](/calculo-diferencial/formula/DIF-112) | 11.2 DIF-112 | — |
| DIF-113 | [/calculo-diferencial/formula/DIF-113](/calculo-diferencial/formula/DIF-113) | 11.3 DIF-113 | — |

## 12. L'Hôpital y límites indeterminados

Índice: [/calculo-diferencial/seccion/lhopital](/calculo-diferencial/seccion/lhopital)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-114 | [/calculo-diferencial/formula/DIF-114](/calculo-diferencial/formula/DIF-114) | 12.1 Cuando el límite original es \(0/0\) o \(\infty/\infty\) y se cumplen… | lhopital_explorer |
| DIF-115 | [/calculo-diferencial/formula/DIF-115](/calculo-diferencial/formula/DIF-115) | 12.1 DIF-115 | — |
| DIF-116 | [/calculo-diferencial/formula/DIF-116](/calculo-diferencial/formula/DIF-116) | 12.2 Reescritura para aplicar L'Hôpital. | — |
| DIF-117 | [/calculo-diferencial/formula/DIF-117](/calculo-diferencial/formula/DIF-117) | 12.2 DIF-117 | — |
| DIF-118 | [/calculo-diferencial/formula/DIF-118](/calculo-diferencial/formula/DIF-118) | 12.2 DIF-118 | — |

## 13. Funciones implícitas y relacionadas

Índice: [/calculo-diferencial/seccion/funciones-implicitas](/calculo-diferencial/seccion/funciones-implicitas)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-119 | [/calculo-diferencial/formula/DIF-119](/calculo-diferencial/formula/DIF-119) | 13.1 Fórmula general; \(F_x=\partial F/\partial x\), \(F_y=\partial F/\par… | — |
| DIF-120 | [/calculo-diferencial/formula/DIF-120](/calculo-diferencial/formula/DIF-120) | 13.1 DIF-120 | — |
| DIF-121 | [/calculo-diferencial/formula/DIF-121](/calculo-diferencial/formula/DIF-121) | 13.1 Ejemplo: circunferencia. | implicit_curve (circle) |
| DIF-122 | [/calculo-diferencial/formula/DIF-122](/calculo-diferencial/formula/DIF-122) | 13.2 DIF-122 | — |

## 14. Tasas relacionadas

Índice: [/calculo-diferencial/seccion/tasas-relacionadas](/calculo-diferencial/seccion/tasas-relacionadas)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-123 | [/calculo-diferencial/formula/DIF-123](/calculo-diferencial/formula/DIF-123) | 14.2 Tasa relacionada en circunferencia (radio constante). | — |
| DIF-124 | [/calculo-diferencial/formula/DIF-124](/calculo-diferencial/formula/DIF-124) | 14.2 Esfera inflándose. | related_rates (sphere) |
| DIF-125 | [/calculo-diferencial/formula/DIF-125](/calculo-diferencial/formula/DIF-125) | 14.2 Distancia en el plano. | — |

## 15. Gráficas y comportamiento asintótico

Índice: [/calculo-diferencial/seccion/graficas-asintotas](/calculo-diferencial/seccion/graficas-asintotas)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-126 | [/calculo-diferencial/formula/DIF-126](/calculo-diferencial/formula/DIF-126) | 15.1 DIF-126 | — |
| DIF-127 | [/calculo-diferencial/formula/DIF-127](/calculo-diferencial/formula/DIF-127) | 15.2 DIF-127 | — |
| DIF-128 | [/calculo-diferencial/formula/DIF-128](/calculo-diferencial/formula/DIF-128) | 15.3 DIF-128 | asymptote_explorer |
| DIF-129 | [/calculo-diferencial/formula/DIF-129](/calculo-diferencial/formula/DIF-129) | 15.3 Cálculo de pendiente e intercepto para asíntotas oblicuas. | — |
| DIF-130 | [/calculo-diferencial/formula/DIF-130](/calculo-diferencial/formula/DIF-130) | 15.4 Orden recomendado para esbozar \(y=f(x)\). | — |

## A. Apéndice A: tabla extensa de derivadas

Índice: [/calculo-diferencial/apendice/apendice-tabla-derivadas](/calculo-diferencial/apendice/apendice-tabla-derivadas)

| ID | Ruta | Título | Viz |
|---|---|---|---|
| DIF-131 | [/calculo-diferencial/formula/DIF-131](/calculo-diferencial/formula/DIF-131) |  DIF-131 | — |
| DIF-132 | [/calculo-diferencial/formula/DIF-132](/calculo-diferencial/formula/DIF-132) |  DIF-132 | — |
| DIF-133 | [/calculo-diferencial/formula/DIF-133](/calculo-diferencial/formula/DIF-133) |  DIF-133 | — |
| DIF-134 | [/calculo-diferencial/formula/DIF-134](/calculo-diferencial/formula/DIF-134) |  DIF-134 | — |
| DIF-135 | [/calculo-diferencial/formula/DIF-135](/calculo-diferencial/formula/DIF-135) |  DIF-135 | — |
| DIF-136 | [/calculo-diferencial/formula/DIF-136](/calculo-diferencial/formula/DIF-136) |  DIF-136 | — |
| DIF-137 | [/calculo-diferencial/formula/DIF-137](/calculo-diferencial/formula/DIF-137) |  DIF-137 | — |
| DIF-138 | [/calculo-diferencial/formula/DIF-138](/calculo-diferencial/formula/DIF-138) |  DIF-138 | — |
| DIF-139 | [/calculo-diferencial/formula/DIF-139](/calculo-diferencial/formula/DIF-139) |  DIF-139 | — |
| DIF-140 | [/calculo-diferencial/formula/DIF-140](/calculo-diferencial/formula/DIF-140) |  DIF-140 | — |
| DIF-141 | [/calculo-diferencial/formula/DIF-141](/calculo-diferencial/formula/DIF-141) |  DIF-141 | — |
| DIF-142 | [/calculo-diferencial/formula/DIF-142](/calculo-diferencial/formula/DIF-142) |  DIF-142 | — |
| DIF-143 | [/calculo-diferencial/formula/DIF-143](/calculo-diferencial/formula/DIF-143) |  DIF-143 | — |
| DIF-144 | [/calculo-diferencial/formula/DIF-144](/calculo-diferencial/formula/DIF-144) |  DIF-144 | — |
| DIF-145 | [/calculo-diferencial/formula/DIF-145](/calculo-diferencial/formula/DIF-145) |  DIF-145 | — |
| DIF-146 | [/calculo-diferencial/formula/DIF-146](/calculo-diferencial/formula/DIF-146) |  DIF-146 | — |
| DIF-147 | [/calculo-diferencial/formula/DIF-147](/calculo-diferencial/formula/DIF-147) |  DIF-147 | — |
| DIF-148 | [/calculo-diferencial/formula/DIF-148](/calculo-diferencial/formula/DIF-148) |  DIF-148 | — |
| DIF-149 | [/calculo-diferencial/formula/DIF-149](/calculo-diferencial/formula/DIF-149) |  DIF-149 | — |
| DIF-150 | [/calculo-diferencial/formula/DIF-150](/calculo-diferencial/formula/DIF-150) |  DIF-150 | — |
| DIF-151 | [/calculo-diferencial/formula/DIF-151](/calculo-diferencial/formula/DIF-151) |  DIF-151 | — |
| DIF-152 | [/calculo-diferencial/formula/DIF-152](/calculo-diferencial/formula/DIF-152) |  DIF-152 | — |
| DIF-153 | [/calculo-diferencial/formula/DIF-153](/calculo-diferencial/formula/DIF-153) |  DIF-153 | — |
| DIF-154 | [/calculo-diferencial/formula/DIF-154](/calculo-diferencial/formula/DIF-154) |  DIF-154 | — |
| DIF-155 | [/calculo-diferencial/formula/DIF-155](/calculo-diferencial/formula/DIF-155) |  DIF-155 | — |
| DIF-156 | [/calculo-diferencial/formula/DIF-156](/calculo-diferencial/formula/DIF-156) |  DIF-156 | — |
| DIF-157 | [/calculo-diferencial/formula/DIF-157](/calculo-diferencial/formula/DIF-157) |  DIF-157 | — |
| DIF-158 | [/calculo-diferencial/formula/DIF-158](/calculo-diferencial/formula/DIF-158) |  DIF-158 | — |
| DIF-159 | [/calculo-diferencial/formula/DIF-159](/calculo-diferencial/formula/DIF-159) |  DIF-159 | — |
| DIF-160 | [/calculo-diferencial/formula/DIF-160](/calculo-diferencial/formula/DIF-160) |  DIF-160 | — |
| DIF-161 | [/calculo-diferencial/formula/DIF-161](/calculo-diferencial/formula/DIF-161) |  DIF-161 | — |

## Visualizaciones interactivas

| ID | Ruta | Viz |
|---|---|---|
| DIF-011 | [/calculo-diferencial/formula/DIF-011](/calculo-diferencial/formula/DIF-011) | limit_explorer (informal) |
| DIF-012 | [/calculo-diferencial/formula/DIF-012](/calculo-diferencial/formula/DIF-012) | limit_explorer (epsilon_delta) |
| DIF-013 | [/calculo-diferencial/formula/DIF-013](/calculo-diferencial/formula/DIF-013) | limit_explorer (lateral) |
| DIF-020 | [/calculo-diferencial/formula/DIF-020](/calculo-diferencial/formula/DIF-020) | limit_explorer (notable) |
| DIF-024 | [/calculo-diferencial/formula/DIF-024](/calculo-diferencial/formula/DIF-024) | limit_explorer (e_definition) |
| DIF-030 | [/calculo-diferencial/formula/DIF-030](/calculo-diferencial/formula/DIF-030) | continuity_checker (definition) |
| DIF-031 | [/calculo-diferencial/formula/DIF-031](/calculo-diferencial/formula/DIF-031) | intermediate_value |
| DIF-032 | [/calculo-diferencial/formula/DIF-032](/calculo-diferencial/formula/DIF-032) | continuity_checker (discontinuity) |
| DIF-038 | [/calculo-diferencial/formula/DIF-038](/calculo-diferencial/formula/DIF-038) | limit_explorer (secante) |
| DIF-040 | [/calculo-diferencial/formula/DIF-040](/calculo-diferencial/formula/DIF-040) | tangent_line (tangent) |
| DIF-041 | [/calculo-diferencial/formula/DIF-041](/calculo-diferencial/formula/DIF-041) | tangent_line (normal) |
| DIF-043 | [/calculo-diferencial/formula/DIF-043](/calculo-diferencial/formula/DIF-043) | derivative_from_graph (kinematics) |
| DIF-044 | [/calculo-diferencial/formula/DIF-044](/calculo-diferencial/formula/DIF-044) | derivative_from_graph (kinematics_accel) |
| DIF-051 | [/calculo-diferencial/formula/DIF-051](/calculo-diferencial/formula/DIF-051) | product_rule |
| DIF-054 | [/calculo-diferencial/formula/DIF-054](/calculo-diferencial/formula/DIF-054) | chain_rule |
| DIF-074 | [/calculo-diferencial/formula/DIF-074](/calculo-diferencial/formula/DIF-074) | log_diff |
| DIF-081 | [/calculo-diferencial/formula/DIF-081](/calculo-diferencial/formula/DIF-081) | mean_value_theorem (rolle) |
| DIF-082 | [/calculo-diferencial/formula/DIF-082](/calculo-diferencial/formula/DIF-082) | mean_value_theorem (mvt) |
| DIF-089 | [/calculo-diferencial/formula/DIF-089](/calculo-diferencial/formula/DIF-089) | concavity_analyzer |
| DIF-098 | [/calculo-diferencial/formula/DIF-098](/calculo-diferencial/formula/DIF-098) | optimization_scenario (rectangle) |
| DIF-099 | [/calculo-diferencial/formula/DIF-099](/calculo-diferencial/formula/DIF-099) | optimization_scenario (cylinder) |
| DIF-102 | [/calculo-diferencial/formula/DIF-102](/calculo-diferencial/formula/DIF-102) | linear_approximation |
| DIF-106 | [/calculo-diferencial/formula/DIF-106](/calculo-diferencial/formula/DIF-106) | taylor_approximation |
| DIF-114 | [/calculo-diferencial/formula/DIF-114](/calculo-diferencial/formula/DIF-114) | lhopital_explorer |
| DIF-121 | [/calculo-diferencial/formula/DIF-121](/calculo-diferencial/formula/DIF-121) | implicit_curve (circle) |
| DIF-124 | [/calculo-diferencial/formula/DIF-124](/calculo-diferencial/formula/DIF-124) | related_rates (sphere) |
| DIF-128 | [/calculo-diferencial/formula/DIF-128](/calculo-diferencial/formula/DIF-128) | asymptote_explorer |

## Topic hubs

| Slug | Ruta |
|---|---|
| regla-cadena | [/calculo-diferencial/temas/regla-cadena](/calculo-diferencial/temas/regla-cadena) |
| limites-indeterminados | [/calculo-diferencial/temas/limites-indeterminados](/calculo-diferencial/temas/limites-indeterminados) |
| optimizacion | [/calculo-diferencial/temas/optimizacion](/calculo-diferencial/temas/optimizacion) |
| teorema-valor-medio | [/calculo-diferencial/temas/teorema-valor-medio](/calculo-diferencial/temas/teorema-valor-medio) |
| series-taylor | [/calculo-diferencial/temas/series-taylor](/calculo-diferencial/temas/series-taylor) |
| índice | [/calculo-diferencial/temas](/calculo-diferencial/temas) |

## Guía de métodos (sección 16)

| Recurso | Ruta |
|---|---|
| Guía para derivar y analizar | [/calculo-diferencial/guia](/calculo-diferencial/guia) |
| Sección completa | [/calculo-diferencial/seccion/guia-metodos](/calculo-diferencial/seccion/guia-metodos) |

## Rutas i18n de muestra

| Locale | Home | Fórmula | Guía |
|---|---|---|---|
| es | [/calculo-diferencial](/calculo-diferencial) | [/calculo-diferencial/formula/DIF-038](/calculo-diferencial/formula/DIF-038) | [/calculo-diferencial/guia](/calculo-diferencial/guia) |
| en | [/en/calculo-diferencial](/en/calculo-diferencial) | [/en/calculo-diferencial/formula/DIF-038](/en/calculo-diferencial/formula/DIF-038) | [/en/calculo-diferencial/guia](/en/calculo-diferencial/guia) |
| de | [/de/calculo-diferencial](/de/calculo-diferencial) | [/de/calculo-diferencial/formula/DIF-038](/de/calculo-diferencial/formula/DIF-038) | [/de/calculo-diferencial/guia](/de/calculo-diferencial/guia) |
| fr | [/fr/calculo-diferencial](/fr/calculo-diferencial) | [/fr/calculo-diferencial/formula/DIF-038](/fr/calculo-diferencial/formula/DIF-038) | [/fr/calculo-diferencial/guia](/fr/calculo-diferencial/guia) |
| it | [/it/calculo-diferencial](/it/calculo-diferencial) | [/it/calculo-diferencial/formula/DIF-038](/it/calculo-diferencial/formula/DIF-038) | [/it/calculo-diferencial/guia](/it/calculo-diferencial/guia) |
| pt | [/pt/calculo-diferencial](/pt/calculo-diferencial) | [/pt/calculo-diferencial/formula/DIF-038](/pt/calculo-diferencial/formula/DIF-038) | [/pt/calculo-diferencial/guia](/pt/calculo-diferencial/guia) |

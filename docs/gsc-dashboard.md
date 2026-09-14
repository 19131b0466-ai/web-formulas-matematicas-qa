# Medición SEO — Fase 4 (GSC, A/B títulos, CWV)

## P4.1 — Priorización desde Search Console

1. En [Google Search Console](https://search.google.com/search-console), abre **Rendimiento**.
2. Exporta **Páginas** (CSV) y, opcionalmente, **Consultas** (CSV).
3. Ejecuta:

```bash
node scripts/gsc-prioritize.mjs \
  --pages ~/Downloads/Pages.csv \
  --queries ~/Downloads/Queries.csv
```

Salida:

- `reports/gsc-priority.json` — ranking con score editorial
- `reports/gsc-priority.md` — resumen legible

El score prioriza **muchas impresiones + pocos clics + posición media-alta** y cruza URLs con el catálogo en `content/formulas-*.md`.

### Comparar antes/después (4 semanas)

```bash
node scripts/gsc-prioritize.mjs --compare reports/gsc-2026-08.csv reports/gsc-2026-09.csv
```

Genera `reports/gsc-compare.json` con deltas de clics, impresiones y posición.

---

## P4.2 — A/B de títulos SEO

Configuración: `apps/web-public/lib/seo-title-experiments.ts`

| Variante | Comportamiento |
|---|---|
| **A** (default) | Título actual (`Fórmula: … — Materia`) |
| **B** | Concepto orientado a consulta GSC (unidades, “fórmula”, derivación) |

### Activar variante B en producción

En el proyecto Vercel **web-public**, define:

```
SEO_TITLE_EXPERIMENT_VARIANT=b
```

Redeploy. Las 10 fórmulas del experimento usarán el título B en `<title>` y Open Graph.

### Medición

1. Anota la fecha de activación.
2. A las **4 semanas**, exporta de nuevo el CSV de páginas.
3. Compara con `--compare` o revisa CTR en GSC filtrando por URL de fórmula.
4. Si B mejora CTR sin empeorar posición, deja B como título permanente (mueve el texto a contenido/i18n y elimina el experimento).

---

## P4.3 — Core Web Vitals

### Cambios en código

- `DeferredMount` — monta visualizaciones solo al acercarse al viewport.
- `FormulaVisualizationLazy` — carga el bundle de álgebra bajo demanda.
- Física y cálculo ya usaban `next/dynamic` por tipo de viz.

### Auditoría rápida

```bash
node scripts/cwv-audit.mjs
```

Comprueba TTFB, tamaño HTML y presencia de `data-deferred-viz` en fichas de fórmula.

### Lighthouse (producción)

```bash
npx lighthouse https://www.maththeoryandtools.com/fisica-basica/formula/EQU-005 \
  --only-categories=performance --output=json --output-path=reports/lighthouse-equ-005.json
```

Objetivo: **LCP < 2,5 s** en 4G simulada; la viz no debe competir con el bloque LaTeX inicial.

---

## Flujo recomendado (mensual)

1. Exportar GSC → `gsc-prioritize.mjs`
2. Enriquecer top 5 fórmulas del informe
3. Probar variante B en 1–2 URLs con muchas impresiones
4. `cwv-audit.mjs` tras cada deploy de viz pesada
5. Comparar CSV a las 4 semanas

#!/usr/bin/env python3
"""Merge Cálculo Diferencial phrase translations into content-i18n/*.json (Fase 4)."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
I18N_DIR = ROOT / "apps" / "web-public" / "content-i18n"
SUBTOPIC_TITLES_PATH = ROOT / "scripts" / "calculo-diferencial-subtopic-titles.json"
LOCALE_PHRASES_PATH = ROOT / "scripts" / "calculo-diferencial-locale-phrases.json"
LOCALES = ("en", "de", "fr", "it", "pt")
SUBTOPIC_TITLES: dict[str, dict[str, str]] = json.loads(
    SUBTOPIC_TITLES_PATH.read_text(encoding="utf-8")
) if SUBTOPIC_TITLES_PATH.exists() else {}
LOCALE_PHRASES: dict[str, dict[str, str]] = json.loads(
    LOCALE_PHRASES_PATH.read_text(encoding="utf-8")
) if LOCALE_PHRASES_PATH.exists() else {}

SUBJECT = {
    "en": {
        "Cálculo Diferencial": "Differential Calculus",
        "Límites, continuidad, derivadas y aplicaciones": "Limits, continuity, derivatives and applications",
    },
    "de": {
        "Cálculo Diferencial": "Differentialrechnung",
        "Límites, continuidad, derivadas y aplicaciones": "Grenzwerte, Stetigkeit, Ableitungen und Anwendungen",
    },
    "fr": {
        "Cálculo Diferencial": "Calcul différentiel",
        "Límites, continuidad, derivadas y aplicaciones": "Limites, continuité, dérivées et applications",
    },
    "it": {
        "Cálculo Diferencial": "Calcolo differenziale",
        "Límites, continuidad, derivadas y aplicaciones": "Limiti, continuità, derivate e applicazioni",
    },
    "pt": {
        "Cálculo Diferencial": "Cálculo diferencial",
        "Límites, continuidad, derivadas y aplicaciones": "Limites, continuidade, derivadas e aplicações",
    },
}

TITLES: dict[str, dict[str, str]] = {
    "en": {
        "A.1 Potencias y exponenciales": "A.1 Powers and exponentials",
        "A.2 Trigonométricas": "A.2 Trigonometric",
        "A.3 Inversas trigonométricas": "A.3 Inverse trigonometric",
        "A.4 Hiperbólicas": "A.4 Hyperbolic",
        "A.5 Composiciones frecuentes": "A.5 Common compositions",
        "Análisis de funciones": "Function analysis",
        "Aproximaciones lineales y diferenciales": "Linear approximations and differentials",
        "Aproximación lineal": "Linear approximation",
        "Apéndice A: tabla extensa de derivadas": "Appendix A: extended derivative table",
        "Asíntotas horizontales": "Horizontal asymptotes",
        "Asíntotas oblicuas": "Oblique asymptotes",
        "Asíntotas verticales": "Vertical asymptotes",
        "Composición e inversa": "Composition and inverse",
        "Concavidad": "Concavity",
        "Consecuencias": "Consequences",
        "Continuidad": "Continuity",
        "Crecimiento y decrecimiento": "Increasing and decreasing",
        "Criterios en intervalos cerrados": "Criteria on closed intervals",
        "Definición": "Definition",
        "Definición de derivada": "Definition of the derivative",
        "Definición informal": "Informal definition",
        "Definición ε-δ": "ε-δ definition",
        "Derivación implícita": "Implicit differentiation",
        "Derivación logarítmica": "Logarithmic differentiation",
        "Derivada e interpretación geométrica": "Derivative and geometric interpretation",
        "Derivadas de funciones inversas": "Derivatives of inverse functions",
        "Derivadas de funciones inversas trigonométricas": "Derivatives of inverse trigonometric functions",
        "Derivadas de orden superior": "Higher-order derivatives",
        "Derivadas trigonométricas": "Trigonometric derivatives",
        "Diferenciabilidad": "Differentiability",
        "Diferencial": "Differential",
        "Dominio, rango e imagen": "Domain, range and image",
        "Ejemplos clásicos": "Classic examples",
        "Ejemplos tipo": "Typical examples",
        "Estrategia": "Strategy",
        "Exponenciales y logaritmos": "Exponentials and logarithms",
        "Formas indeterminadas": "Indeterminate forms",
        "Funciones elementales": "Elementary functions",
        "Funciones implícitas y relacionadas": "Implicit and related functions",
        "Fórmulas de Maclaurin (a=0)": "Maclaurin formulas (a=0)",
        "Gráficas y comportamiento asintótico": "Graphs and asymptotic behavior",
        "Guía de graficación": "Graphing guide",
        "Guía para derivar y analizar": "Guide to differentiate and analyze",
        "Interpretación física": "Physical interpretation",
        "Intervalos y valor absoluto": "Intervals and absolute value",
        "L'Hôpital y límites indeterminados": "L'Hôpital and indeterminate limits",
        "Límites": "Limits",
        "Límites al infinito": "Limits at infinity",
        "Límites infinitos": "Infinite limits",
        "Límites laterales": "One-sided limits",
        "Límites notables": "Notable limits",
        "Notación": "Notation",
        "Notación, funciones y dominios": "Notation, functions and domains",
        "Optimización": "Optimization",
        "Orden para analizar una función": "Order to analyze a function",
        "Polinomio de Taylor": "Taylor polynomial",
        "Procedimiento general": "General procedure",
        "Puntos críticos y extremos": "Critical points and extrema",
        "Puntos de inflexión": "Inflection points",
        "Recta tangente y normal": "Tangent and normal lines",
        "Regla de L'Hôpital": "L'Hôpital's rule",
        "Regla de la cadena": "Chain rule",
        "Regla del cociente": "Quotient rule",
        "Regla del producto": "Product rule",
        "Reglas básicas": "Basic rules",
        "Reglas de derivación": "Differentiation rules",
        "Resto de Lagrange": "Lagrange remainder",
        "Series de Taylor (introducción)": "Taylor series (introduction)",
        "Tasas relacionadas": "Related rates",
        "Teorema de Rolle": "Rolle's theorem",
        "Teorema del Valor Medio": "Mean value theorem",
        "Teorema del Valor Medio (TVM)": "Mean value theorem (MVT)",
        "Teoremas sobre funciones continuas": "Theorems on continuous functions",
        "Tipos de discontinuidad": "Types of discontinuity",
        "Álgebra de límites": "Limit algebra",
    },
    "de": {
        "Análisis de funciones": "Funktionsanalyse",
        "Aproximaciones lineales y diferenciales": "Lineare Näherungen und Differentiale",
        "Continuidad": "Stetigkeit",
        "Derivada e interpretación geométrica": "Ableitung und geometrische Interpretation",
        "Límites": "Grenzwerte",
        "Notación, funciones y dominios": "Notation, Funktionen und Definitionsbereiche",
        "Optimización": "Optimierung",
        "Reglas de derivación": "Ableitungsregeln",
        "Series de Taylor (introducción)": "Taylor-Reihen (Einführung)",
        "Teorema del Valor Medio": "Mittelwertsatz",
    },
    "fr": {
        "Análisis de funciones": "Analyse de fonctions",
        "Continuidad": "Continuité",
        "Derivada e interpretación geométrica": "Dérivée et interprétation géométrique",
        "Límites": "Limites",
        "Notación, funciones y dominios": "Notation, fonctions et domaines",
        "Optimización": "Optimisation",
        "Reglas de derivación": "Règles de dérivation",
        "Series de Taylor (introducción)": "Séries de Taylor (introduction)",
        "Teorema del Valor Medio": "Théorème des accroissements finis",
    },
    "it": {
        "Análisis de funciones": "Analisi delle funzioni",
        "Continuidad": "Continuità",
        "Derivada e interpretación geométrica": "Derivata e interpretazione geometrica",
        "Límites": "Limiti",
        "Notación, funciones y dominios": "Notazione, funzioni e domini",
        "Optimización": "Ottimizzazione",
        "Reglas de derivación": "Regole di derivazione",
        "Series de Taylor (introducción)": "Serie di Taylor (introduzione)",
        "Teorema del Valor Medio": "Teorema del valore medio",
    },
    "pt": {
        "Análisis de funciones": "Análise de funções",
        "Continuidad": "Continuidade",
        "Derivada e interpretación geométrica": "Derivada e interpretação geométrica",
        "Límites": "Limites",
        "Notación, funciones y dominios": "Notação, funções e domínios",
        "Optimización": "Otimização",
        "Reglas de derivación": "Regras de derivação",
        "Series de Taylor (introducción)": "Séries de Taylor (introdução)",
        "Teorema del Valor Medio": "Teorema do valor médio",
    },
}

DETAILS: dict[str, dict[str, str]] = {
    "en": {
        "Aceleración instantánea.": "Instantaneous acceleration.",
        "Aproximación del incremento para \\(\\Delta x\\) pequeño.": "Increment approximation for small \\(\\Delta x\\).",
        "Aproximación lineal clásica.": "Classic linear approximation.",
        "Comportamiento de cocientes de polinomios cuando \\(x\\to\\infty\\).": "Behavior of polynomial quotients as \\(x\\to\\infty\\).",
        "Composición de funciones; requiere \\(x\\in\\operatorname{Dom}(g)\\) y \\(g(x)\\in\\operatorname{Dom}(f)\\).": "Function composition; requires \\(x\\in\\operatorname{Dom}(g)\\) and \\(g(x)\\in\\operatorname{Dom}(f)\\).",
        "Criterio de la primera derivada.": "First derivative test.",
        "Criterio de la segunda derivada (máximo).": "Second derivative test (maximum).",
        "Criterio de la segunda derivada (mínimo).": "Second derivative test (minimum).",
        "Cuando el límite original es \\(0/0\\) o \\(\\infty/\\infty\\) y se cumplen las hipótesis.": "When the original limit is \\(0/0\\) or \\(\\infty/\\infty\\) and the hypotheses hold.",
        "Cálculo de pendiente e intercepto para asíntotas oblicuas.": "Slope and intercept for oblique asymptotes.",
        "Definición de derivada por límite del cociente incremental.": "Derivative defined as the limit of the difference quotient.",
        "Definición formal de límite finito.": "Formal definition of a finite limit.",
        "Definición por casos del valor absoluto.": "Piecewise definition of absolute value.",
        "Descomposición función = aproximación + resto.": "Decomposition: function = approximation + remainder.",
        "Diferencial de \\(y=f(x)\\).": "Differential of \\(y=f(x)\\).",
        "Distancia en el plano.": "Distance in the plane.",
        "Dominio natural de una función real.": "Natural domain of a real function.",
        "Ecuación de la recta normal.": "Equation of the normal line.",
        "Ecuación de la recta tangente a \\(y=f(x)\\) en \\(x=a\\).": "Tangent line to \\(y=f(x)\\) at \\(x=a\\).",
        "Ejemplo tipo: cilindro de superficie fija y volumen máximo.": "Typical example: cylinder with fixed surface area and maximum volume.",
        "Ejemplo tipo: área máxima con perímetro fijo (rectángulo → cuadrado).": "Typical example: maximum area with fixed perimeter (rectangle → square).",
        "Ejemplo: circunferencia.": "Example: circle.",
        "El límite bilateral existe si y solo si coinciden los laterales.": "The two-sided limit exists iff the one-sided limits agree.",
        "El valor \\(f(x)\\) se acerca a \\(L\\) cuando \\(x\\) se acerca a \\(a\\) (sin exigir \\(f(a)=L\\)).": "\\(f(x)\\) approaches \\(L\\) as \\(x\\) approaches \\(a\\) (without requiring \\(f(a)=L\\)).",
        "Entorno simétrico de radio \\(\\delta\\) alrededor de \\(a\\).": "Symmetric neighborhood of radius \\(\\delta\\) around \\(a\\).",
        "Esfera inflándose.": "Expanding sphere.",
        "Extensión a tres factores.": "Extension to three factors.",
        "Forma equivalente del TVM.": "Equivalent form of the MVT.",
        "Fórmula general; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).": "General formula; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
        "Identidad pitagórica fundamental.": "Fundamental Pythagorean identity.",
        "Identidades de una función biyectiva y su inversa en sus dominios respectivos.": "Identities of a bijective function and its inverse on their respective domains.",
        "Imagen o rango de la función.": "Image or range of the function.",
        "Incremento verdadero de la función.": "True increment of the function.",
        "Máximo absoluto en \\([a,b]\\) comparando críticos \\(c_i\\) y extremos.": "Absolute maximum on \\([a,b]\\) by comparing critical points \\(c_i\\) and endpoints.",
        "Notación de Leibniz para composición.": "Leibniz notation for composition.",
        "Orden recomendado para esbozar \\(y=f(x)\\).": "Recommended order to sketch \\(y=f(x)\\).",
        "Para todo \\(k\\) entre \\(f(a)\\) y \\(f(b)\\) (TVI).": "For every \\(k\\) between \\(f(a)\\) and \\(f(b)\\) (IVT).",
        "Paso inicial para derivar \\(f^g\\) con exponente variable.": "First step to differentiate \\(f^g\\) with variable exponent.",
        "Pendiente de la tangente.": "Slope of the tangent.",
        "Polinomio de Taylor de grado 1 (aproximación lineal en \\(a\\)).": "Degree-1 Taylor polynomial (linear approximation at \\(a\\)).",
        "Polinomio de Taylor de orden \\(n\\) centrado en \\(a\\).": "Taylor polynomial of order \\(n\\) centered at \\(a\\).",
        "Reescritura para aplicar L'Hôpital.": "Rewrite to apply L'Hôpital.",
        "Tasa relacionada en circunferencia (radio constante).": "Related rate on a circle (constant radius).",
        "Teorema del Valor Extremo.": "Extreme value theorem.",
        "Teorema del Valor Intermedio (enunciado cualitativo).": "Intermediate value theorem (qualitative statement).",
        "Velocidad instantánea como derivada de la posición.": "Instantaneous velocity as the derivative of position.",
        "Válido si los límites de \\(f\\) y \\(g\\) existen.": "Valid if the limits of \\(f\\) and \\(g\\) exist.",
        "Útil para potencias variables y productos/cocientes.": "Useful for variable powers and products/quotients.",
    },
}

EXTRA: dict[str, dict[str, str]] = {
    "en": {
        "Variable independiente": "Independent variable",
        "Tiempo (interpretación física)": "Time (physical interpretation)",
        "Posición o longitud de arco": "Position or arc length",
        "Velocidad o función auxiliar": "Velocity or auxiliary function",
        "Punto o constante real": "Point or real constant",
        "Extremo de intervalo o constante": "Interval endpoint or constant",
        "Punto intermedio (TVM, Rolle)": "Intermediate point (MVT, Rolle)",
        "Incremento en la definición de derivada": "Increment in the derivative definition",
        "Función": "Function",
        "Segunda función o composición interna": "Second function or inner composition",
        "Derivada de \\(f\\)": "Derivative of \\(f\\)",
        "Segunda derivada de \\(f\\)": "Second derivative of \\(f\\)",
        "Orden de derivada o exponente": "Derivative order or exponent",
        "Constante real": "Real constant",
        "Radio en definición ε-δ": "Radius in the ε-δ definition",
        "Tolerancia en definición ε-δ": "Tolerance in the ε-δ definition",
        "Valor del límite": "Limit value",
        "Variable auxiliar (cadena, sustitución)": "Auxiliary variable (chain, substitution)",
        "Variable dependiente": "Dependent variable",
        "Diferencial de \\(y\\)": "Differential of \\(y\\)",
        "Diferencial de \\(x\\)": "Differential of \\(x\\)",
        "Diferencial de \\(u\\)": "Differential of \\(u\\)",
        "Ángulo o parámetro": "Angle or parameter",
        "Constante pi": "Pi constant",
        "Base del logaritmo natural": "Base of the natural logarithm",
        "Logaritmo natural": "Natural logarithm",
        "¿Qué mide la derivada en un punto?": "What does the derivative measure at a point?",
        "La derivada \\(f'(a)\\) es la pendiente de la recta tangente a la gráfica de \\(f\\) en \\(x=a\\), y también el límite del cociente incremental cuando \\(h\\to0\\).": "The derivative \\(f'(a)\\) is the slope of the tangent to the graph of \\(f\\) at \\(x=a\\), and also the limit of the difference quotient as \\(h\\to0\\).",
        "¿Toda función derivable es continua?": "Is every differentiable function continuous?",
        "Sí: si \\(f\\) es derivable en \\(a\\), entonces \\(f\\) es continua en \\(a\\). El recíproco no siempre vale (p. ej. \\(|x|\\) en \\(0\\)).": "Yes: if \\(f\\) is differentiable at \\(a\\), then \\(f\\) is continuous at \\(a\\). The converse need not hold (e.g. \\(|x|\\) at \\(0\\)).",
        "¿Cuándo uso la regla de la cadena?": "When do I use the chain rule?",
        "Cuando derivas una composición \\(f(g(x))\\): la derivada es \\(f'(g(x))\\cdot g'(x)\\). También en notación Leibniz: \\(dy/dx=(dy/du)(du/dx)\\).": "When differentiating a composition \\(f(g(x))\\): the derivative is \\(f'(g(x))\\cdot g'(x)\\). Also in Leibniz notation: \\(dy/dx=(dy/du)(du/dx)\\).",
        "¿Cuándo puedo aplicar L'Hôpital?": "When can I apply L'Hôpital's rule?",
        "Cuando el límite tiene forma indeterminada \\(0/0\\) o \\(\\infty/\\infty\\), las funciones son derivables cerca del punto y \\(g'\\neq0\\) en una vecindad (salvo quizá el punto).": "When the limit has indeterminate form \\(0/0\\) or \\(\\infty/\\infty\\), the functions are differentiable near the point and \\(g'\\neq0\\) in a neighborhood (except possibly at the point).",
        "¿Para qué sirve el polinomio de Taylor?": "What is the Taylor polynomial used for?",
        "Aproxima \\(f(x)\\) cerca de \\(a\\) con un polinomio cuyos coeficientes dependen de las derivadas de \\(f\\) en \\(a\\). Es la base de series de potencias en Cálculo II.": "It approximates \\(f(x)\\) near \\(a\\) with a polynomial whose coefficients depend on the derivatives of \\(f\\) at \\(a\\). It is the foundation of power series in Calculus II.",
        "Polinomio o potencia \\(x^n\\)": "Polynomial or power \\(x^n\\)",
        "Regla de la potencia": "Power rule",
        "Producto de funciones": "Product of functions",
        "Regla del producto": "Product rule",
        "Cociente": "Quotient",
        "Regla del cociente": "Quotient rule",
        "Composición \\(f(g(x))\\)": "Composition \\(f(g(x))\\)",
        "Regla de la cadena": "Chain rule",
        "\\(f^g\\) con exponente variable": "\\(f^g\\) with variable exponent",
        "Logaritmica": "Logarithmic differentiation",
        "Ecuación implícita \\(F(x,y)=0\\)": "Implicit equation \\(F(x,y)=0\\)",
        "Derivación implícita": "Implicit differentiation",
        "Límite \\(0/0\\) o \\(\\infty/\\infty\\)": "Limit \\(0/0\\) or \\(\\infty/\\infty\\)",
        "L'Hôpital o álgebra": "L'Hôpital or algebra",
        "Optimizar en \\([a,b]\\)": "Optimize on \\([a,b]\\)",
        "Críticos + extremos del intervalo": "Critical points + interval endpoints",
        "Aproximar cerca de \\(a\\)": "Approximate near \\(a\\)",
        "Linealización o Taylor": "Linearization or Taylor",
        "Dominio y simetrías.": "Domain and symmetries.",
        "Intersecciones con ejes.": "Axis intercepts.",
        "Asíntotas verticales, horizontales y oblicuas.": "Vertical, horizontal and oblique asymptotes.",
        "f': intervalos de crecimiento/decrecimiento y puntos críticos.": "f': intervals of increase/decrease and critical points.",
        "f'': concavidad y puntos de inflexión.": "f'': concavity and inflection points.",
        "Tabla de signos y esquema final.": "Sign chart and final sketch.",
        "Guía para derivar y analizar": "Guide to differentiate and analyze",
        "> **Regla de uso:** aplicar solo donde las expresiones estén definidas; denominadores distintos de cero.": "> **Usage rule:** apply only where expressions are defined; denominators must be nonzero.",
    },
}


def extract_phrases() -> tuple[list[str], list[str]]:
    cmd = [
        "node",
        "-e",
        """
import { readFileSync } from 'fs';
import { parseCalculoDiferencialMarkdown } from './packages/content-parser/dist/parse-markdown.js';
const md = readFileSync('content/formulas-calculo-diferencial.md','utf8');
const r = parseCalculoDiferencialMarkdown(md);
const titles = new Set();
const details = new Set();
for (const s of r.sections) {
  titles.add(s.title);
  for (const b of s.blocks) {
    if (b.blockType==='formula' && b.content.detail) details.add(b.content.detail);
    if (b.title) titles.add(b.title);
    if (b.blockType==='strategy') {
      details.add(b.content.signal);
      details.add(b.content.method);
    }
    if (b.blockType==='checklist') details.add(b.content.text);
  }
}
console.log(JSON.stringify({titles:[...titles].sort(), details:[...details].sort()}));
""",
    ]
    out = subprocess.check_output(cmd, cwd=ROOT, text=True)
    data = json.loads(out)
    return data["titles"], data["details"]


def build_locale_map(locale: str, titles: list[str], details: list[str]) -> dict[str, str]:
    merged: dict[str, str] = {}
    merged.update(SUBJECT.get(locale, {}))
    merged.update(TITLES.get(locale, {}))
    merged.update(SUBTOPIC_TITLES.get(locale, {}))
    en_titles = TITLES.get("en", {})
    en_details = DETAILS.get("en", {})
    en_extra = EXTRA.get("en", {})
    loc_details = DETAILS.get(locale, {})
    loc_extra = EXTRA.get(locale, {})
    loc_phrases = LOCALE_PHRASES.get(locale, {})

    loc_titles = TITLES.get(locale, {})
    for title in titles:
        if title in merged:
            continue
        if locale == "en" and title in en_titles:
            merged[title] = en_titles[title]
        elif locale != "en":
            merged[title] = loc_titles.get(title, en_titles.get(title, title))

    for detail in details:
        if detail in loc_phrases:
            merged[detail] = loc_phrases[detail]
        elif detail in loc_details:
            merged[detail] = loc_details[detail]
        elif locale == "en" and detail in en_details:
            merged[detail] = en_details[detail]
        elif locale != "en" and detail in en_details:
            merged[detail] = en_details[detail]

    for key, value in en_extra.items():
        if key in loc_phrases:
            merged[key] = loc_phrases[key]
        elif key in loc_extra:
            merged[key] = loc_extra[key]
        elif locale == "en":
            merged[key] = value

    # Subtopic titles and locale phrases win over generic EN fallbacks (e.g. Product rule vs Produktregel).
    merged.update(SUBTOPIC_TITLES.get(locale, {}))
    merged.update(loc_phrases)

    return {k: v for k, v in merged.items() if k != v}


def merge_locale(locale: str, phrases: dict[str, str], force_keys: set[str] | None = None) -> int:
    path = I18N_DIR / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    added = 0
    force = force_keys or set()
    for key, value in phrases.items():
        if key in force and data.get(key) != value:
            data[key] = value
            added += 1
            continue
        if key not in data:
            data[key] = value
            added += 1
        elif data[key] == key:
            data[key] = value
            added += 1
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return added


def main() -> None:
    titles, details = extract_phrases()
    force_keys: set[str] = set(TITLES.get("en", {})) | set(EXTRA.get("en", {}))
    for loc in LOCALES:
        force_keys |= set(SUBTOPIC_TITLES.get(loc, {}))
        force_keys |= set(LOCALE_PHRASES.get(loc, {}))
    total = 0
    for locale in LOCALES:
        phrases = build_locale_map(locale, titles, details)
        n = merge_locale(locale, phrases, force_keys=force_keys if locale != "en" else None)
        print(f"{locale}: merged {n} keys ({len(phrases)} candidates)")
        total += n
    print(f"done, {total} new/updated keys across locales")


if __name__ == "__main__":
    main()

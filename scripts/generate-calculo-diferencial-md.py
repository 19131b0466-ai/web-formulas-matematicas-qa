#!/usr/bin/env python3
"""One-shot generator for content/formulas-calculo-diferencial.md (Fase 0)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content" / "formulas-calculo-diferencial.md"

counter = 0


def fid() -> str:
    global counter
    counter += 1
    return f"DIF-{counter:03d}"


def formula_block(latex: str, detail: str | None = None, related: list[str] | None = None) -> str:
    # Metadata must precede display math: the calculo parser absorbs trailing lines
    # after \\] and would steal the next formula's **ID:** if **Detalle:** follows \\].
    lines = [f"**ID:** `{fid()}`"]
    if detail:
        lines.append(f"**Detalle:** {detail}")
    if related:
        lines.append(f"**Relacionadas:** {', '.join(f'`{r}`' for r in related)}")
    lines.extend(["", latex.strip(), "", "---"])
    return "\n".join(lines) + "\n"


HEADER = """# Fórmulas de Cálculo Diferencial — formulario universitario

Formulario de **Cálculo Diferencial** (Cálculo I en muchas universidades). Cubre límites, continuidad, derivadas, aplicaciones y una tabla extensa de derivadas.

> **Alcance:** la organización exacta de Cálculo Diferencial varía entre instituciones. Este catálogo prioriza el núcleo común: límites, continuidad, reglas de derivación, análisis de funciones, optimización, aproximaciones lineales, Taylor elemental y L'Hôpital.

---

## Índice

1. [Notación, funciones y dominios](#1-notación-funciones-y-dominios)
2. [Límites](#2-límites)
3. [Continuidad](#3-continuidad)
4. [Derivada e interpretación geométrica](#4-derivada-e-interpretación-geométrica)
5. [Reglas de derivación](#5-reglas-de-derivación)
6. [Derivadas de orden superior](#6-derivadas-de-orden-superior)
7. [Teorema del Valor Medio](#7-teorema-del-valor-medio)
8. [Análisis de funciones](#8-análisis-de-funciones)
9. [Optimización](#9-optimización)
10. [Aproximaciones lineales y diferenciales](#10-aproximaciones-lineales-y-diferenciales)
11. [Series de Taylor (introducción)](#11-series-de-taylor-introducción)
12. [L'Hôpital y límites indeterminados](#12-lhôpital-y-límites-indeterminados)
13. [Funciones implícitas y relacionadas](#13-funciones-implícitas-y-relacionadas)
14. [Tasas relacionadas](#14-tasas-relacionadas)
15. [Gráficas y comportamiento asintótico](#15-gráficas-y-comportamiento-asintótico)
16. [Guía para derivar y analizar](#16-guía-para-derivar-y-analizar)
17. [Apéndice A: tabla extensa de derivadas](#apéndice-a-tabla-extensa-de-derivadas)

---

## 1. Notación, funciones y dominios

- Se usa \\(\\operatorname{sen} x\\) para el seno.
- \\(\\csc x=1/\\operatorname{sen} x\\), \\(\\sec x=1/\\cos x\\), \\(\\cot x=\\cos x/\\operatorname{sen} x\\).
- \\(\\operatorname{arcsen} x\\), \\(\\arccos x\\), \\(\\arctan x\\) denotan funciones inversas, no recíprocos.
- \\(f'(x)\\), \\(f''(x)\\) y \\(f^{(n)}(x)\\) denotan derivadas de orden uno, dos y \\(n\\).
- Toda fórmula se aplica solo donde las expresiones estén definidas y los denominadores sean distintos de cero.

### 1.1 Intervalos y valor absoluto

"""

sections: list[str] = [HEADER]

sections.append(
    formula_block(
        r"""\[
|x|=\begin{cases}
x, & x\ge0\\
-x, & x<0
\end{cases}
\]""",
        "Definición por casos del valor absoluto.",
    )
)

sections.append(
    formula_block(
        r"""\[
|x-a|<\delta \quad\Longleftrightarrow\quad a-\delta<x<a+\delta
\]""",
        "Entorno simétrico de radio \\(\\delta\\) alrededor de \\(a\\).",
    )
)

sections.append(
    formula_block(
        r"""\[
\sqrt{x^2}=|x|
\]""",
    )
)

sections.append("### 1.2 Dominio, rango e imagen\n\n")

sections.append(
    formula_block(
        r"""\[
\operatorname{Dom}(f)=\{x\in\mathbb{R}: f(x)\text{ está definido}\}
\]""",
        "Dominio natural de una función real.",
    )
)

sections.append(
    formula_block(
        r"""\[
\operatorname{Im}(f)=\{f(x): x\in\operatorname{Dom}(f)\}
\]""",
        "Imagen o rango de la función.",
    )
)

sections.append("### 1.3 Composición e inversa\n\n")

sections.append(
    formula_block(
        r"""\[
(f\circ g)(x)=f(g(x))
\]""",
        "Composición de funciones; requiere \\(x\in\operatorname{Dom}(g)\\) y \\(g(x)\in\operatorname{Dom}(f)\\).",
    )
)

sections.append(
    formula_block(
        r"""\[
f(f^{-1}(y))=y,\qquad f^{-1}(f(x))=x
\]""",
        "Identidades de una función biyectiva y su inversa en sus dominios respectivos.",
    )
)

sections.append("### 1.4 Funciones elementales\n\n")

sections.append(
    formula_block(
        r"""\[
(\operatorname{sen}^2 x+\cos^2 x=1)
\]""",
        "Identidad pitagórica fundamental.",
    )
)

sections.append(
    formula_block(
        r"""\[
a^x=e^{x\ln a},\qquad a>0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\log_a x=\frac{\ln x}{\ln a},\qquad a>0,\ a\neq1,\ x>0
\]""",
    )
)

# Chapter 2 - Limits
sections.append("""---

## 2. Límites

### 2.1 Definición informal

""")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}f(x)=L
\]""",
        "El valor \\(f(x)\\) se acerca a \\(L\\) cuando \\(x\\) se acerca a \\(a\\) (sin exigir \\(f(a)=L\\)).",
    )
)

sections.append("### 2.2 Definición ε-δ\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}f(x)=L
\quad\Longleftrightarrow\quad
\forall\varepsilon>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow|f(x)-L|<\varepsilon
\]""",
        "Definición formal de límite finito.",
    )
)

sections.append("### 2.3 Límites laterales\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a^-}f(x)=L_L,\qquad \lim_{x\to a^+}f(x)=L_R
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}f(x)=L \quad\Longleftrightarrow\quad L_L=L_R=L
\]""",
        "El límite bilateral existe si y solo si coinciden los laterales.",
    )
)

sections.append("### 2.4 Álgebra de límites\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}[f(x)\pm g(x)]=\lim_{x\to a}f(x)\pm\lim_{x\to a}g(x)
\]""",
        "Válido si los límites de \\(f\\) y \\(g\\) existen.",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}[f(x)g(x)]=\lim_{x\to a}f(x)\cdot\lim_{x\to a}g(x)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}\frac{f(x)}{g(x)}=\frac{\lim_{x\to a}f(x)}{\lim_{x\to a}g(x)},\qquad \lim_{x\to a}g(x)\neq0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}[cf(x)]=c\lim_{x\to a}f(x)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}[f(x)]^n=\left[\lim_{x\to a}f(x)\right]^n,\qquad n\in\mathbb{Z}
\]""",
    )
)

sections.append("### 2.5 Límites notables\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to0}\frac{\operatorname{sen}x}{x}=1
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to0}\frac{1-\cos x}{x}=0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to0}\frac{e^x-1}{x}=1
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to0}\frac{\ln(1+x)}{x}=1
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to0}(1+x)^{1/x}=e
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to\infty}\left(1+\frac{1}{x}\right)^x=e
\]""",
    )
)

sections.append("### 2.6 Límites al infinito\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to\infty}\frac{1}{x^p}=0,\qquad p>0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to\infty}\frac{a_nx^n+\cdots+a_0}{b_mx^m+\cdots+b_0}=
\begin{cases}
0, & n<m\\
\frac{a_n}{b_m}, & n=m\\
\pm\infty, & n>m
\end{cases}
\]""",
        "Comportamiento de cocientes de polinomios cuando \\(x\to\infty\\).",
    )
)

sections.append("### 2.7 Límites infinitos\n\n")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}f(x)=+\infty
\quad\Longleftrightarrow\quad
\forall M>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow f(x)>M
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}f(x)=-\infty
\quad\Longleftrightarrow\quad
\forall M>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow f(x)<-M
\]""",
    )
)

# Chapter 3 - Continuity
sections.append("""---

## 3. Continuidad

### 3.1 Definición

""")

sections.append(
    formula_block(
        r"""\[
f\text{ es continua en }a \quad\Longleftrightarrow\quad \lim_{x\to a}f(x)=f(a)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f\text{ es continua en }[a,b] \Rightarrow f\text{ alcanza todo valor entre }f(a)\text{ y }f(b)
\]""",
        "Teorema del Valor Intermedio (enunciado cualitativo).",
    )
)

sections.append("### 3.2 Tipos de discontinuidad\n\n")

sections.append(
    formula_block(
        r"""\[
\text{Discontinuidad removible en }a:\ \lim_{x\to a}f(x)=L\neq f(a)\ \text{o }f(a)\text{ no definido}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\text{Discontinuidad de salto en }a:\ \lim_{x\to a^-}f(x)\neq\lim_{x\to a^+}f(x)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\text{Discontinuidad infinita en }a:\ \lim_{x\to a}f(x)=\pm\infty
\]""",
    )
)

sections.append("### 3.3 Teoremas sobre funciones continuas\n\n")

sections.append(
    formula_block(
        r"""\[
f,g\text{ continuas en }a \Rightarrow f\pm g,\ fg,\ \frac{f}{g}\text{ continuas en }a\ (g(a)\neq0)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f\text{ continua en }[a,b] \Rightarrow f\text{ tiene máximo y mínimo absolutos en }[a,b]
\]""",
        "Teorema del Valor Extremo.",
    )
)

sections.append(
    formula_block(
        r"""\[
f\text{ continua en }[a,b],\ f(a)\neq f(b) \Rightarrow \exists c\in(a,b): f(c)=k
\]""",
        "Para todo \\(k\\) entre \\(f(a)\\) y \\(f(b)\\) (TVI).",
    )
)

# Chapter 4 - Derivative
sections.append("""---

## 4. Derivada e interpretación geométrica

### 4.1 Definición de derivada

""")

sections.append(
    formula_block(
        r"""\[
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}
\]""",
        "Definición de derivada por límite del cociente incremental.",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(a)=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}
\]""",
    )
)

sections.append("### 4.2 Recta tangente y normal\n\n")

sections.append(
    formula_block(
        r"""\[
y-f(a)=f'(a)(x-a)
\]""",
        "Ecuación de la recta tangente a \\(y=f(x)\\) en \\(x=a\\).",
    )
)

sections.append(
    formula_block(
        r"""\[
y-f(a)=-\frac{1}{f'(a)}(x-a),\qquad f'(a)\neq0
\]""",
        "Ecuación de la recta normal.",
    )
)

sections.append(
    formula_block(
        r"""\[
m_{\mathrm{tan}}=f'(a)
\]""",
        "Pendiente de la tangente.",
    )
)

sections.append("### 4.3 Interpretación física\n\n")

sections.append(
    formula_block(
        r"""\[
v(t)=s'(t)
\]""",
        "Velocidad instantánea como derivada de la posición.",
        related=["CIN-004"],
    )
)

sections.append(
    formula_block(
        r"""\[
a(t)=v'(t)=s''(t)
\]""",
        "Aceleración instantánea.",
        related=["CIN-006"],
    )
)

sections.append("### 4.4 Diferenciabilidad\n\n")

sections.append(
    formula_block(
        r"""\[
f\text{ diferenciable en }a \Rightarrow f\text{ continua en }a
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(a)\text{ existe } \Leftrightarrow \lim_{h\to0}\frac{f(a+h)-f(a)}{h}\text{ existe (finito)}
\]""",
    )
)

# Chapter 5 - Rules
sections.append("""---

## 5. Reglas de derivación

### 5.1 Reglas básicas

""")

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[c]=0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[x^n]=nx^{n-1},\qquad n\in\mathbb{R}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[cf(x)]=cf'(x)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[f(x)\pm g(x)]=f'(x)\pm g'(x)
\]""",
    )
)

sections.append("### 5.2 Regla del producto\n\n")

sections.append(
    formula_block(
        r"""\[
(fg)'=f'g+fg'
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[f(x)g(x)h(x)]=f'gh+fg'h+fgh'
\]""",
        "Extensión a tres factores.",
    )
)

sections.append("### 5.3 Regla del cociente\n\n")

sections.append(
    formula_block(
        r"""\[
\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2},\qquad g\neq0
\]""",
    )
)

sections.append("### 5.4 Regla de la cadena\n\n")

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}f(g(x))=f'(g(x))\cdot g'(x)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}
\]""",
        "Notación de Leibniz para composición.",
    )
)

sections.append("### 5.5 Derivadas trigonométricas\n\n")

trig_derivs = [
    (r"\operatorname{sen}x", r"\cos x"),
    (r"\cos x", r"-\operatorname{sen}x"),
    (r"\tan x", r"\sec^2 x"),
    (r"\cot x", r"-\csc^2 x"),
    (r"\sec x", r"\sec x\tan x"),
    (r"\csc x", r"-\csc x\cot x"),
]
for f, d in trig_derivs:
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}({f})={d}
\]""",
        )
    )

sections.append("### 5.6 Exponenciales y logaritmos\n\n")

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[e^x]=e^x
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[a^x]=a^x\ln a,\qquad a>0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[\ln x]=\frac{1}{x},\qquad x>0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[\ln|x|]=\frac{1}{x},\qquad x\neq0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[\log_a x]=\frac{1}{x\ln a},\qquad a>0,\ a\neq1,\ x>0
\]""",
    )
)

sections.append("### 5.7 Derivadas de funciones inversas trigonométricas\n\n")

inv_trig = [
    (r"\operatorname{arcsen}x", r"\frac{1}{\sqrt{1-x^2}}", r"|x|<1"),
    (r"\arccos x", r"-\frac{1}{\sqrt{1-x^2}}", r"|x|<1"),
    (r"\arctan x", r"\frac{1}{1+x^2}", r"x\in\mathbb{R}"),
    (r"\operatorname{arcsec}x", r"\frac{1}{|x|\sqrt{x^2-1}}", r"|x|>1"),
    (r"\operatorname{arccsc}x", r"-\frac{1}{|x|\sqrt{x^2-1}}", r"|x|>1"),
    (r"\operatorname{arccot}x", r"-\frac{1}{1+x^2}", r"x\in\mathbb{R}"),
]
for f, d, cond in inv_trig:
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}({f})={d},\qquad {cond}
\]""",
        )
    )

sections.append("### 5.8 Derivación logarítmica\n\n")

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[\ln|f(x)|]=\frac{f'(x)}{f(x)},\qquad f(x)\neq0
\]""",
        "Útil para potencias variables y productos/cocientes.",
        related=["INT-001"],
    )
)

sections.append(
    formula_block(
        r"""\[
y=f(x)^{g(x)} \Rightarrow \ln y=g(x)\ln f(x)
\]""",
        "Paso inicial para derivar \\(f^g\\) con exponente variable.",
    )
)

# Chapter 6
sections.append("""---

## 6. Derivadas de orden superior

### 6.1 Notación

""")

sections.append(
    formula_block(
        r"""\[
f''(x)=\frac{d^2f}{dx^2},\qquad f^{(n)}(x)=\frac{d^nf}{dx^n}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}\left[\frac{dy}{dx}\right]=\frac{d^2y}{dx^2}
\]""",
    )
)

sections.append("### 6.2 Ejemplos clásicos\n\n")

sections.append(
    formula_block(
        r"""\[
\frac{d^n}{dx^n}[e^{kx}]=k^ne^{kx}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d^n}{dx^n}[\operatorname{sen}(kx)]=k^n\operatorname{sen}\!\left(kx+\frac{n\pi}{2}\right)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d^n}{dx^n}[\cos(kx)]=k^n\cos\!\left(kx+\frac{n\pi}{2}\right)
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{d^n}{dx^n}[x^m]=\begin{cases}
m(m-1)\cdots(m-n+1)\,x^{m-n}, & n\le m\\
0, & n>m,\ m\in\mathbb{N}_0
\end{cases}
\]""",
    )
)

# Chapter 7 TVM
sections.append("""---

## 7. Teorema del Valor Medio

### 7.1 Teorema de Rolle

""")

sections.append(
    formula_block(
        r"""\[
f\text{ continua en }[a,b],\ f\text{ diferenciable en }(a,b),\ f(a)=f(b)
\Rightarrow \exists c\in(a,b): f'(c)=0
\]""",
    )
)

sections.append("### 7.2 Teorema del Valor Medio (TVM)\n\n")

sections.append(
    formula_block(
        r"""\[
f\text{ continua en }[a,b],\ f\text{ diferenciable en }(a,b)
\Rightarrow \exists c\in(a,b): f'(c)=\frac{f(b)-f(a)}{b-a}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f(b)=f(a)+f'(c)(b-a)
\]""",
        "Forma equivalente del TVM.",
    )
)

sections.append("### 7.3 Consecuencias\n\n")

sections.append(
    formula_block(
        r"""\[
f'(x)=0\ \forall x\in I \Rightarrow f\text{ constante en }I
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(x)>0\ \forall x\in I \Rightarrow f\text{ estrictamente creciente en }I
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(x)<0\ \forall x\in I \Rightarrow f\text{ estrictamente decreciente en }I
\]""",
    )
)

# Chapter 8 Analysis
sections.append("""---

## 8. Análisis de funciones

### 8.1 Crecimiento y decrecimiento

""")

sections.append(
    formula_block(
        r"""\[
f'(x)>0\text{ en }(a,b) \Rightarrow f\text{ creciente en }[a,b]
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(x)<0\text{ en }(a,b) \Rightarrow f\text{ decreciente en }[a,b]
\]""",
    )
)

sections.append("### 8.2 Concavidad\n\n")

sections.append(
    formula_block(
        r"""\[
f''(x)>0\text{ en }I \Rightarrow f\text{ cóncava hacia arriba en }I
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f''(x)<0\text{ en }I \Rightarrow f\text{ cóncava hacia abajo en }I
\]""",
    )
)

sections.append("### 8.3 Puntos críticos y extremos\n\n")

sections.append(
    formula_block(
        r"""\[
f'(c)=0\ \text{o}\ f'(c)\text{ no existe} \Rightarrow c\text{ es punto crítico}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(c)=0,\ f''(c)>0 \Rightarrow f\text{ tiene mínimo local en }c
\]""",
        "Criterio de la segunda derivada (mínimo).",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(c)=0,\ f''(c)<0 \Rightarrow f\text{ tiene máximo local en }c
\]""",
        "Criterio de la segunda derivada (máximo).",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(x)\text{ cambia de }+\text{ a }-\text{ en }c \Rightarrow f\text{ máximo local en }c
\]""",
        "Criterio de la primera derivada.",
    )
)

sections.append(
    formula_block(
        r"""\[
f'(x)\text{ cambia de }-\text{ a }+\text{ en }c \Rightarrow f\text{ mínimo local en }c
\]""",
    )
)

sections.append("### 8.4 Puntos de inflexión\n\n")

sections.append(
    formula_block(
        r"""\[
f''(c)=0\text{ o no existe, y }f''\text{ cambia de signo en }c \Rightarrow (c,f(c))\text{ punto de inflexión}
\]""",
    )
)

# Chapter 9 Optimization
sections.append("""---

## 9. Optimización

### 9.1 Procedimiento general

1. Modelar la cantidad a optimizar \\(Q\\) como función de una variable.
2. Determinar el dominio físico o natural.
3. Encontrar puntos críticos interiores: \\(Q'(x)=0\\) o donde \\(Q'\\) no existe.
4. Evaluar \\(Q\\) en críticos y en extremos del dominio.
5. Interpretar la respuesta en unidades del problema.

### 9.2 Criterios en intervalos cerrados\n\n

""")

sections.append(
    formula_block(
        r"""\[
Q_{\max}=\max\{Q(a),Q(b),Q(c_1),\ldots,Q(c_k)\}
\]""",
        "Máximo absoluto en \\([a,b]\\) comparando críticos \\(c_i\\) y extremos.",
    )
)

sections.append(
    formula_block(
        r"""\[
A=xy,\quad x+y=C \Rightarrow A(x)=x(C-x)
\]""",
        "Ejemplo tipo: área máxima con perímetro fijo (rectángulo → cuadrado).",
    )
)

sections.append(
    formula_block(
        r"""\[
V=\pi r^2h,\quad S=2\pi r^2+2\pi rh=C \Rightarrow V(r)=\frac{C}{2}r-\pi r^3
\]""",
        "Ejemplo tipo: cilindro de superficie fija y volumen máximo.",
    )
)

# Chapter 10 Differentials
sections.append("""---

## 10. Aproximaciones lineales y diferenciales

### 10.1 Diferencial

""")

sections.append(
    formula_block(
        r"""\[
dy=f'(x)\,dx
\]""",
        "Diferencial de \\(y=f(x)\\).",
    )
)

sections.append(
    formula_block(
        r"""\[
\Delta y=f(x+\Delta x)-f(x)
\]""",
        "Incremento verdadero de la función.",
    )
)

sections.append("### 10.2 Aproximación lineal\n\n")

sections.append(
    formula_block(
        r"""\[
L(x)=f(a)+f'(a)(x-a)
\]""",
        "Polinomio de Taylor de grado 1 (aproximación lineal en \\(a\\)).",
    )
)

sections.append(
    formula_block(
        r"""\[
f(x)\approx f(a)+f'(a)(x-a)\quad\text{cuando }x\approx a
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
\Delta y\approx f'(a)\,\Delta x
\]""",
        "Aproximación del incremento para \\(\\Delta x\\) pequeño.",
    )
)

sections.append(
    formula_block(
        r"""\[
\sqrt{1+x}\approx 1+\frac{x}{2},\qquad |x|\ll1
\]""",
        "Aproximación lineal clásica.",
    )
)

# Chapter 11 Taylor
sections.append("""---

## 11. Series de Taylor (introducción)

### 11.1 Polinomio de Taylor

""")

sections.append(
    formula_block(
        r"""\[
P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k
\]""",
        "Polinomio de Taylor de orden \\(n\\) centrado en \\(a\\).",
        related=["INT-163"],
    )
)

sections.append(
    formula_block(
        r"""\[
f(x)=P_n(x)+R_n(x)
\]""",
        "Descomposición función = aproximación + resto.",
    )
)

sections.append("### 11.2 Fórmulas de Maclaurin (a=0)\n\n")

maclaurin = [
    (r"e^x", r"1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots"),
    (r"\operatorname{sen}x", r"x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots"),
    (r"\cos x", r"1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots"),
    (r"\ln(1+x)", r"x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots,\qquad |x|<1"),
    (r"(1+x)^\alpha", r"1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+\cdots,\qquad |x|<1"),
]
for f, series in maclaurin:
    sections.append(
        formula_block(
            rf"""\[
{f}={series}
\]""",
        )
    )

sections.append("### 11.3 Resto de Lagrange\n\n")

sections.append(
    formula_block(
        r"""\[
R_n(x)=\frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1},\qquad c\text{ entre }a\text{ y }x
\]""",
    )
)

# Chapter 12 L'Hopital
sections.append("""---

## 12. L'Hôpital y límites indeterminados

### 12.1 Regla de L'Hôpital

""")

sections.append(
    formula_block(
        r"""\[
\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}
\]""",
        "Cuando el límite original es \\(0/0\\) o \\(\\infty/\\infty\\) y se cumplen las hipótesis.",
    )
)

sections.append(
    formula_block(
        r"""\[
\lim_{x\to\infty}\frac{f(x)}{g(x)}=\lim_{x\to\infty}\frac{f'(x)}{g'(x)}
\]""",
    )
)

sections.append("### 12.2 Formas indeterminadas\n\n")

sections.append(
    formula_block(
        r"""\[
0\cdot\infty:\quad f\cdot g=\frac{f}{1/g}\ \text{o}\ \frac{g}{1/f}
\]""",
        "Reescritura para aplicar L'Hôpital.",
    )
)

sections.append(
    formula_block(
        r"""\[
\infty-\infty:\quad \text{combinar algebraicamente o usar conjugados/logaritmos}
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
0^0,\ 1^\infty,\ \infty^0:\quad \text{usar } y=f^g,\ \ln y=g\ln f
\]""",
    )
)

# Chapter 13 Implicit
sections.append("""---

## 13. Funciones implícitas y relacionadas

### 13.1 Derivación implícita

""")

sections.append(
    formula_block(
        r"""\[
\frac{d}{dx}[F(x,y)]=0 \Rightarrow F_x+F_y\frac{dy}{dx}=0
\]""",
        "Fórmula general; \\(F_x=\\partial F/\\partial x\\), \\(F_y=\\partial F/\\partial y\\).",
    )
)

sections.append(
    formula_block(
        r"""\[
\frac{dy}{dx}=-\frac{F_x}{F_y},\qquad F_y\neq0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
x^2+y^2=r^2 \Rightarrow \frac{dy}{dx}=-\frac{x}{y}
\]""",
        "Ejemplo: circunferencia.",
    )
)

sections.append("### 13.2 Derivadas de funciones inversas\n\n")

sections.append(
    formula_block(
        r"""\[
(f^{-1})'(y)=\frac{1}{f'(f^{-1}(y))},\qquad f'(f^{-1}(y))\neq0
\]""",
    )
)

# Chapter 14 Related rates
sections.append("""---

## 14. Tasas relacionadas

### 14.1 Estrategia

1. Identificar variables que dependen del tiempo: \\(x(t),y(t),\ldots\\)
2. Escribir una ecuación que las relaciona.
3. Diferenciar respecto de \\(t\\) (a menudo con la regla de la cadena).
4. Sustituir valores conocidos en el instante considerado.

### 14.2 Ejemplos tipo\n\n

""")

sections.append(
    formula_block(
        r"""\[
x^2+y^2=r^2 \Rightarrow 2x\frac{dx}{dt}+2y\frac{dy}{dt}=0
\]""",
        "Tasa relacionada en circunferencia (radio constante).",
    )
)

sections.append(
    formula_block(
        r"""\[
V=\frac{4}{3}\pi r^3 \Rightarrow \frac{dV}{dt}=4\pi r^2\frac{dr}{dt}
\]""",
        "Esfera inflándose.",
    )
)

sections.append(
    formula_block(
        r"""\[
z^2=x^2+y^2 \Rightarrow 2z\frac{dz}{dt}=2x\frac{dx}{dt}+2y\frac{dy}{dt}
\]""",
        "Distancia en el plano.",
    )
)

# Chapter 15 Asymptotes
sections.append("""---

## 15. Gráficas y comportamiento asintótico

### 15.1 Asíntotas verticales

""")

sections.append(
    formula_block(
        r"""\[
x=a\text{ asíntota vertical de }f \Leftrightarrow \lim_{x\to a^+}f(x)=\pm\infty\ \text{o}\ \lim_{x\to a^-}f(x)=\pm\infty
\]""",
    )
)

sections.append("### 15.2 Asíntotas horizontales\n\n")

sections.append(
    formula_block(
        r"""\[
y=L\text{ asíntota horizontal} \Leftrightarrow \lim_{x\to\pm\infty}f(x)=L
\]""",
    )
)

sections.append("### 15.3 Asíntotas oblicuas\n\n")

sections.append(
    formula_block(
        r"""\[
y=mx+b\text{ asíntota oblicua} \Leftrightarrow \lim_{x\to\pm\infty}[f(x)-(mx+b)]=0
\]""",
    )
)

sections.append(
    formula_block(
        r"""\[
m=\lim_{x\to\pm\infty}\frac{f(x)}{x},\qquad b=\lim_{x\to\pm\infty}[f(x)-mx]
\]""",
        "Cálculo de pendiente e intercepto para asíntotas oblicuas.",
    )
)

sections.append("### 15.4 Guía de graficación\n\n")

sections.append(
    formula_block(
        r"""\[
\text{Dominio} \to \text{intersecciones} \to \text{asíntotas} \to f' \to f'' \to \text{esquema}
\]""",
        "Orden recomendado para esbozar \\(y=f(x)\\).",
    )
)

# Chapter 16 Guide
sections.append("""---

## 16. Guía para derivar y analizar

| Señal en la función | Técnica sugerida |
|---|---|
| Polinomio o potencia \\(x^n\\) | Regla de la potencia |
| Producto de funciones | Regla del producto |
| Cociente | Regla del cociente |
| Composición \\(f(g(x))\\) | Regla de la cadena |
| \\(f^g\\) con exponente variable | Logaritmica |
| Ecuación implícita \\(F(x,y)=0\\) | Derivación implícita |
| Límite \\(0/0\\) o \\(\\infty/\\infty\\) | L'Hôpital o álgebra |
| Optimizar en \\([a,b]\\) | Críticos + extremos del intervalo |
| Aproximar cerca de \\(a\\) | Linealización o Taylor |

### 16.1 Orden para analizar una función

1. Dominio y simetrías.
2. Intersecciones con ejes.
3. Asíntotas verticales, horizontales y oblicuas.
4. \\(f'\\): intervalos de crecimiento/decrecimiento y puntos críticos.
5. \\(f''\\): concavidad y puntos de inflexión.
6. Tabla de signos y esquema final.

---

## Apéndice A: tabla extensa de derivadas

> **Regla de uso:** aplicar solo donde las expresiones estén definidas; denominadores distintos de cero.

### A.1 Potencias y exponenciales

""")

appendix_basic = [
    (r"x^n", r"nx^{n-1}", r"n\in\mathbb{R}"),
    (r"e^x", r"e^x", None),
    (r"a^x", r"a^x\ln a", r"a>0"),
    (r"\ln x", r"\frac{1}{x}", r"x>0"),
    (r"\ln|x|", r"\frac{1}{x}", r"x\neq0"),
    (r"\log_a x", r"\frac{1}{x\ln a}", r"a>0,a\neq1,x>0"),
]
for fn, deriv, cond in appendix_basic:
    tail = f",\\qquad {cond}" if cond else ""
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}[{fn}]={deriv}{tail}
\]""",
        )
    )

sections.append("### A.2 Trigonométricas\n\n")
for f, d in trig_derivs:
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}({f})={d}
\]""",
        )
    )

sections.append("### A.3 Inversas trigonométricas\n\n")
for f, d, cond in inv_trig:
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}({f})={d},\qquad {cond}
\]""",
        )
    )

sections.append("### A.4 Hiperbólicas\n\n")
hyp = [
    (r"\sinh x", r"\cosh x"),
    (r"\cosh x", r"\sinh x"),
    (r"\tanh x", r"\mathrm{sech}^2 x"),
    (r"\coth x", r"-\mathrm{csch}^2 x"),
    (r"\mathrm{sech}\,x", r"-\mathrm{sech}\,x\tanh x"),
    (r"\mathrm{csch}\,x", r"-\mathrm{csch}\,x\coth x"),
]
for f, d in hyp:
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}({f})={d}
\]""",
        )
    )

sections.append("### A.5 Composiciones frecuentes\n\n")
compositions = [
    (r"\operatorname{sen}(g(x))", r"\cos(g(x))\cdot g'(x)"),
    (r"\cos(g(x))", r"-\operatorname{sen}(g(x))\cdot g'(x)"),
    (r"e^{g(x)}", r"e^{g(x)}g'(x)"),
    (r"\ln(g(x))", r"\frac{g'(x)}{g(x)}", r"g(x)>0"),
    (r"(g(x))^n", r"n(g(x))^{n-1}g'(x)"),
    (r"\arctan(g(x))", r"\frac{g'(x)}{1+(g(x))^2}"),
    (r"\operatorname{arcsen}(g(x))", r"\frac{g'(x)}{\sqrt{1-(g(x))^2}}", r"|g(x)|<1"),
]
for item in compositions:
    fn, deriv = item[0], item[1]
    cond = item[2] if len(item) > 2 else None
    tail = f",\\qquad {cond}" if cond else ""
    sections.append(
        formula_block(
            rf"""\[
\frac{{d}}{{dx}}[{fn}]={deriv}{tail}
\]""",
        )
    )

sections.append(
    f"\n---\n\n*Generado con {counter} fórmulas catalogadas (`DIF-001` … `DIF-{counter:03d}`).*\n"
)

OUT.write_text("".join(sections), encoding="utf-8")
print(f"Wrote {OUT} with {counter} formulas")

# Fórmulas de Cálculo Diferencial — formulario universitario

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

- Se usa \(\operatorname{sen} x\) para el seno.
- \(\csc x=1/\operatorname{sen} x\), \(\sec x=1/\cos x\), \(\cot x=\cos x/\operatorname{sen} x\).
- \(\operatorname{arcsen} x\), \(\arccos x\), \(\arctan x\) denotan funciones inversas, no recíprocos.
- \(f'(x)\), \(f''(x)\) y \(f^{(n)}(x)\) denotan derivadas de orden uno, dos y \(n\).
- Toda fórmula se aplica solo donde las expresiones estén definidas y los denominadores sean distintos de cero.

### 1.1 Intervalos y valor absoluto

**ID:** `DIF-001`
**Detalle:** Definición por casos del valor absoluto.

\[
|x|=\begin{cases}
x, & x\ge0\\
-x, & x<0
\end{cases}
\]

---
**ID:** `DIF-002`
**Detalle:** Entorno simétrico de radio \(\delta\) alrededor de \(a\).

\[
|x-a|<\delta \quad\Longleftrightarrow\quad a-\delta<x<a+\delta
\]

---
**ID:** `DIF-003`

\[
\sqrt{x^2}=|x|
\]

---
### 1.2 Dominio, rango e imagen

**ID:** `DIF-004`
**Detalle:** Dominio natural de una función real.

\[
\operatorname{Dom}(f)=\{x\in\mathbb{R}: f(x)\text{ está definido}\}
\]

---
**ID:** `DIF-005`
**Detalle:** Imagen o rango de la función.

\[
\operatorname{Im}(f)=\{f(x): x\in\operatorname{Dom}(f)\}
\]

---
### 1.3 Composición e inversa

**ID:** `DIF-006`
**Detalle:** Composición de funciones; requiere \(x\in\operatorname{Dom}(g)\) y \(g(x)\in\operatorname{Dom}(f)\).

\[
(f\circ g)(x)=f(g(x))
\]

---
**ID:** `DIF-007`
**Detalle:** Identidades de una función biyectiva y su inversa en sus dominios respectivos.

\[
f(f^{-1}(y))=y,\qquad f^{-1}(f(x))=x
\]

---
### 1.4 Funciones elementales

**ID:** `DIF-008`
**Detalle:** Identidad pitagórica fundamental.

\[
(\operatorname{sen}^2 x+\cos^2 x=1)
\]

---
**ID:** `DIF-009`

\[
a^x=e^{x\ln a},\qquad a>0
\]

---
**ID:** `DIF-010`

\[
\log_a x=\frac{\ln x}{\ln a},\qquad a>0,\ a\neq1,\ x>0
\]

---
---

## 2. Límites

### 2.1 Definición informal

**ID:** `DIF-011`
**Detalle:** El valor \(f(x)\) se acerca a \(L\) cuando \(x\) se acerca a \(a\) (sin exigir \(f(a)=L\)).

\[
\lim_{x\to a}f(x)=L
\]

---
### 2.2 Definición ε-δ

**ID:** `DIF-012`
**Detalle:** Definición formal de límite finito.

\[
\lim_{x\to a}f(x)=L
\quad\Longleftrightarrow\quad
\forall\varepsilon>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow|f(x)-L|<\varepsilon
\]

---
### 2.3 Límites laterales

**ID:** `DIF-013`

\[
\lim_{x\to a^-}f(x)=L_L,\qquad \lim_{x\to a^+}f(x)=L_R
\]

---
**ID:** `DIF-014`
**Detalle:** El límite bilateral existe si y solo si coinciden los laterales.

\[
\lim_{x\to a}f(x)=L \quad\Longleftrightarrow\quad L_L=L_R=L
\]

---
### 2.4 Álgebra de límites

**ID:** `DIF-015`
**Detalle:** Válido si los límites de \(f\) y \(g\) existen.

\[
\lim_{x\to a}[f(x)\pm g(x)]=\lim_{x\to a}f(x)\pm\lim_{x\to a}g(x)
\]

---
**ID:** `DIF-016`

\[
\lim_{x\to a}[f(x)g(x)]=\lim_{x\to a}f(x)\cdot\lim_{x\to a}g(x)
\]

---
**ID:** `DIF-017`

\[
\lim_{x\to a}\frac{f(x)}{g(x)}=\frac{\lim_{x\to a}f(x)}{\lim_{x\to a}g(x)},\qquad \lim_{x\to a}g(x)\neq0
\]

---
**ID:** `DIF-018`

\[
\lim_{x\to a}[cf(x)]=c\lim_{x\to a}f(x)
\]

---
**ID:** `DIF-019`

\[
\lim_{x\to a}[f(x)]^n=\left[\lim_{x\to a}f(x)\right]^n,\qquad n\in\mathbb{Z}
\]

---
### 2.5 Límites notables

**ID:** `DIF-020`

\[
\lim_{x\to0}\frac{\operatorname{sen}x}{x}=1
\]

---
**ID:** `DIF-021`

\[
\lim_{x\to0}\frac{1-\cos x}{x}=0
\]

---
**ID:** `DIF-022`

\[
\lim_{x\to0}\frac{e^x-1}{x}=1
\]

---
**ID:** `DIF-023`

\[
\lim_{x\to0}\frac{\ln(1+x)}{x}=1
\]

---
**ID:** `DIF-024`

\[
\lim_{x\to0}(1+x)^{1/x}=e
\]

---
**ID:** `DIF-025`

\[
\lim_{x\to\infty}\left(1+\frac{1}{x}\right)^x=e
\]

---
### 2.6 Límites al infinito

**ID:** `DIF-026`

\[
\lim_{x\to\infty}\frac{1}{x^p}=0,\qquad p>0
\]

---
**ID:** `DIF-027`
**Detalle:** Comportamiento de cocientes de polinomios cuando \(x	o\infty\).

\[
\lim_{x\to\infty}\frac{a_nx^n+\cdots+a_0}{b_mx^m+\cdots+b_0}=
\begin{cases}
0, & n<m\\
\frac{a_n}{b_m}, & n=m\\
\pm\infty, & n>m
\end{cases}
\]

---
### 2.7 Límites infinitos

**ID:** `DIF-028`

\[
\lim_{x\to a}f(x)=+\infty
\quad\Longleftrightarrow\quad
\forall M>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow f(x)>M
\]

---
**ID:** `DIF-029`

\[
\lim_{x\to a}f(x)=-\infty
\quad\Longleftrightarrow\quad
\forall M>0\ \exists\delta>0:\ 0<|x-a|<\delta\Rightarrow f(x)<-M
\]

---
---

## 3. Continuidad

### 3.1 Definición

**ID:** `DIF-030`

\[
f\text{ es continua en }a \quad\Longleftrightarrow\quad \lim_{x\to a}f(x)=f(a)
\]

---
**ID:** `DIF-031`
**Detalle:** Teorema del Valor Intermedio (enunciado cualitativo).

\[
f\text{ es continua en }[a,b] \Rightarrow f\text{ alcanza todo valor entre }f(a)\text{ y }f(b)
\]

---
### 3.2 Tipos de discontinuidad

**ID:** `DIF-032`

\[
\text{Discontinuidad removible en }a:\ \lim_{x\to a}f(x)=L\neq f(a)\ \text{o }f(a)\text{ no definido}
\]

---
**ID:** `DIF-033`

\[
\text{Discontinuidad de salto en }a:\ \lim_{x\to a^-}f(x)\neq\lim_{x\to a^+}f(x)
\]

---
**ID:** `DIF-034`

\[
\text{Discontinuidad infinita en }a:\ \lim_{x\to a}f(x)=\pm\infty
\]

---
### 3.3 Teoremas sobre funciones continuas

**ID:** `DIF-035`

\[
f,g\text{ continuas en }a \Rightarrow f\pm g,\ fg,\ \frac{f}{g}\text{ continuas en }a\ (g(a)\neq0)
\]

---
**ID:** `DIF-036`
**Detalle:** Teorema del Valor Extremo.

\[
f\text{ continua en }[a,b] \Rightarrow f\text{ tiene máximo y mínimo absolutos en }[a,b]
\]

---
**ID:** `DIF-037`
**Detalle:** Para todo \(k\) entre \(f(a)\) y \(f(b)\) (TVI).

\[
f\text{ continua en }[a,b],\ f(a)\neq f(b) \Rightarrow \exists c\in(a,b): f(c)=k
\]

---
---

## 4. Derivada e interpretación geométrica

### 4.1 Definición de derivada

**ID:** `DIF-038`
**Detalle:** Definición de derivada por límite del cociente incremental.

\[
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}
\]

---
**ID:** `DIF-039`

\[
f'(a)=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}
\]

---
### 4.2 Recta tangente y normal

**ID:** `DIF-040`
**Detalle:** Ecuación de la recta tangente a \(y=f(x)\) en \(x=a\).

\[
y-f(a)=f'(a)(x-a)
\]

---
**ID:** `DIF-041`
**Detalle:** Ecuación de la recta normal.

\[
y-f(a)=-\frac{1}{f'(a)}(x-a),\qquad f'(a)\neq0
\]

---
**ID:** `DIF-042`
**Detalle:** Pendiente de la tangente.

\[
m_{\mathrm{tan}}=f'(a)
\]

---
### 4.3 Interpretación física

**ID:** `DIF-043`
**Detalle:** Velocidad instantánea como derivada de la posición.
**Relacionadas:** `CIN-004`

\[
v(t)=s'(t)
\]

---
**ID:** `DIF-044`
**Detalle:** Aceleración instantánea.
**Relacionadas:** `CIN-006`

\[
a(t)=v'(t)=s''(t)
\]

---
### 4.4 Diferenciabilidad

**ID:** `DIF-045`

\[
f\text{ diferenciable en }a \Rightarrow f\text{ continua en }a
\]

---
**ID:** `DIF-046`

\[
f'(a)\text{ existe } \Leftrightarrow \lim_{h\to0}\frac{f(a+h)-f(a)}{h}\text{ existe (finito)}
\]

---
---

## 5. Reglas de derivación

### 5.1 Reglas básicas

**ID:** `DIF-047`

\[
\frac{d}{dx}[c]=0
\]

---
**ID:** `DIF-048`

\[
\frac{d}{dx}[x^n]=nx^{n-1},\qquad n\in\mathbb{R}
\]

---
**ID:** `DIF-049`

\[
\frac{d}{dx}[cf(x)]=cf'(x)
\]

---
**ID:** `DIF-050`

\[
\frac{d}{dx}[f(x)\pm g(x)]=f'(x)\pm g'(x)
\]

---
### 5.2 Regla del producto

**ID:** `DIF-051`

\[
(fg)'=f'g+fg'
\]

---
**ID:** `DIF-052`
**Detalle:** Extensión a tres factores.

\[
\frac{d}{dx}[f(x)g(x)h(x)]=f'gh+fg'h+fgh'
\]

---
### 5.3 Regla del cociente

**ID:** `DIF-053`

\[
\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2},\qquad g\neq0
\]

---
### 5.4 Regla de la cadena

**ID:** `DIF-054`

\[
\frac{d}{dx}f(g(x))=f'(g(x))\cdot g'(x)
\]

---
**ID:** `DIF-055`
**Detalle:** Notación de Leibniz para composición.

\[
\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}
\]

---
### 5.5 Derivadas trigonométricas

**ID:** `DIF-056`

\[
\frac{d}{dx}(\operatorname{sen}x)=\cos x
\]

---
**ID:** `DIF-057`

\[
\frac{d}{dx}(\cos x)=-\operatorname{sen}x
\]

---
**ID:** `DIF-058`

\[
\frac{d}{dx}(\tan x)=\sec^2 x
\]

---
**ID:** `DIF-059`

\[
\frac{d}{dx}(\cot x)=-\csc^2 x
\]

---
**ID:** `DIF-060`

\[
\frac{d}{dx}(\sec x)=\sec x\tan x
\]

---
**ID:** `DIF-061`

\[
\frac{d}{dx}(\csc x)=-\csc x\cot x
\]

---
### 5.6 Exponenciales y logaritmos

**ID:** `DIF-062`

\[
\frac{d}{dx}[e^x]=e^x
\]

---
**ID:** `DIF-063`

\[
\frac{d}{dx}[a^x]=a^x\ln a,\qquad a>0
\]

---
**ID:** `DIF-064`

\[
\frac{d}{dx}[\ln x]=\frac{1}{x},\qquad x>0
\]

---
**ID:** `DIF-065`

\[
\frac{d}{dx}[\ln|x|]=\frac{1}{x},\qquad x\neq0
\]

---
**ID:** `DIF-066`

\[
\frac{d}{dx}[\log_a x]=\frac{1}{x\ln a},\qquad a>0,\ a\neq1,\ x>0
\]

---
### 5.7 Derivadas de funciones inversas trigonométricas

**ID:** `DIF-067`

\[
\frac{d}{dx}(\operatorname{arcsen}x)=\frac{1}{\sqrt{1-x^2}},\qquad |x|<1
\]

---
**ID:** `DIF-068`

\[
\frac{d}{dx}(\arccos x)=-\frac{1}{\sqrt{1-x^2}},\qquad |x|<1
\]

---
**ID:** `DIF-069`

\[
\frac{d}{dx}(\arctan x)=\frac{1}{1+x^2},\qquad x\in\mathbb{R}
\]

---
**ID:** `DIF-070`

\[
\frac{d}{dx}(\operatorname{arcsec}x)=\frac{1}{|x|\sqrt{x^2-1}},\qquad |x|>1
\]

---
**ID:** `DIF-071`

\[
\frac{d}{dx}(\operatorname{arccsc}x)=-\frac{1}{|x|\sqrt{x^2-1}},\qquad |x|>1
\]

---
**ID:** `DIF-072`

\[
\frac{d}{dx}(\operatorname{arccot}x)=-\frac{1}{1+x^2},\qquad x\in\mathbb{R}
\]

---
### 5.8 Derivación logarítmica

**ID:** `DIF-073`
**Detalle:** Útil para potencias variables y productos/cocientes.
**Relacionadas:** `INT-001`

\[
\frac{d}{dx}[\ln|f(x)|]=\frac{f'(x)}{f(x)},\qquad f(x)\neq0
\]

---
**ID:** `DIF-074`
**Detalle:** Paso inicial para derivar \(f^g\) con exponente variable.

\[
y=f(x)^{g(x)} \Rightarrow \ln y=g(x)\ln f(x)
\]

---
---

## 6. Derivadas de orden superior

### 6.1 Notación

**ID:** `DIF-075`

\[
f''(x)=\frac{d^2f}{dx^2},\qquad f^{(n)}(x)=\frac{d^nf}{dx^n}
\]

---
**ID:** `DIF-076`

\[
\frac{d}{dx}\left[\frac{dy}{dx}\right]=\frac{d^2y}{dx^2}
\]

---
### 6.2 Ejemplos clásicos

**ID:** `DIF-077`

\[
\frac{d^n}{dx^n}[e^{kx}]=k^ne^{kx}
\]

---
**ID:** `DIF-078`

\[
\frac{d^n}{dx^n}[\operatorname{sen}(kx)]=k^n\operatorname{sen}\!\left(kx+\frac{n\pi}{2}\right)
\]

---
**ID:** `DIF-079`

\[
\frac{d^n}{dx^n}[\cos(kx)]=k^n\cos\!\left(kx+\frac{n\pi}{2}\right)
\]

---
**ID:** `DIF-080`

\[
\frac{d^n}{dx^n}[x^m]=\begin{cases}
m(m-1)\cdots(m-n+1)\,x^{m-n}, & n\le m\\
0, & n>m,\ m\in\mathbb{N}_0
\end{cases}
\]

---
---

## 7. Teorema del Valor Medio

### 7.1 Teorema de Rolle

**ID:** `DIF-081`

\[
f\text{ continua en }[a,b],\ f\text{ diferenciable en }(a,b),\ f(a)=f(b)
\Rightarrow \exists c\in(a,b): f'(c)=0
\]

---
### 7.2 Teorema del Valor Medio (TVM)

**ID:** `DIF-082`

\[
f\text{ continua en }[a,b],\ f\text{ diferenciable en }(a,b)
\Rightarrow \exists c\in(a,b): f'(c)=\frac{f(b)-f(a)}{b-a}
\]

---
**ID:** `DIF-083`
**Detalle:** Forma equivalente del TVM.

\[
f(b)=f(a)+f'(c)(b-a)
\]

---
### 7.3 Consecuencias

**ID:** `DIF-084`

\[
f'(x)=0\ \forall x\in I \Rightarrow f\text{ constante en }I
\]

---
**ID:** `DIF-085`

\[
f'(x)>0\ \forall x\in I \Rightarrow f\text{ estrictamente creciente en }I
\]

---
**ID:** `DIF-086`

\[
f'(x)<0\ \forall x\in I \Rightarrow f\text{ estrictamente decreciente en }I
\]

---
---

## 8. Análisis de funciones

### 8.1 Crecimiento y decrecimiento

**ID:** `DIF-087`

\[
f'(x)>0\text{ en }(a,b) \Rightarrow f\text{ creciente en }[a,b]
\]

---
**ID:** `DIF-088`

\[
f'(x)<0\text{ en }(a,b) \Rightarrow f\text{ decreciente en }[a,b]
\]

---
### 8.2 Concavidad

**ID:** `DIF-089`

\[
f''(x)>0\text{ en }I \Rightarrow f\text{ cóncava hacia arriba en }I
\]

---
**ID:** `DIF-090`

\[
f''(x)<0\text{ en }I \Rightarrow f\text{ cóncava hacia abajo en }I
\]

---
### 8.3 Puntos críticos y extremos

**ID:** `DIF-091`

\[
f'(c)=0\ \text{o}\ f'(c)\text{ no existe} \Rightarrow c\text{ es punto crítico}
\]

---
**ID:** `DIF-092`
**Detalle:** Criterio de la segunda derivada (mínimo).

\[
f'(c)=0,\ f''(c)>0 \Rightarrow f\text{ tiene mínimo local en }c
\]

---
**ID:** `DIF-093`
**Detalle:** Criterio de la segunda derivada (máximo).

\[
f'(c)=0,\ f''(c)<0 \Rightarrow f\text{ tiene máximo local en }c
\]

---
**ID:** `DIF-094`
**Detalle:** Criterio de la primera derivada.

\[
f'(x)\text{ cambia de }+\text{ a }-\text{ en }c \Rightarrow f\text{ máximo local en }c
\]

---
**ID:** `DIF-095`

\[
f'(x)\text{ cambia de }-\text{ a }+\text{ en }c \Rightarrow f\text{ mínimo local en }c
\]

---
### 8.4 Puntos de inflexión

**ID:** `DIF-096`

\[
f''(c)=0\text{ o no existe, y }f''\text{ cambia de signo en }c \Rightarrow (c,f(c))\text{ punto de inflexión}
\]

---
---

## 9. Optimización

### 9.1 Procedimiento general

1. Modelar la cantidad a optimizar \(Q\) como función de una variable.
2. Determinar el dominio físico o natural.
3. Encontrar puntos críticos interiores: \(Q'(x)=0\) o donde \(Q'\) no existe.
4. Evaluar \(Q\) en críticos y en extremos del dominio.
5. Interpretar la respuesta en unidades del problema.

### 9.2 Criterios en intervalos cerrados



**ID:** `DIF-097`
**Detalle:** Máximo absoluto en \([a,b]\) comparando críticos \(c_i\) y extremos.

\[
Q_{\max}=\max\{Q(a),Q(b),Q(c_1),\ldots,Q(c_k)\}
\]

---
**ID:** `DIF-098`
**Detalle:** Ejemplo tipo: área máxima con perímetro fijo (rectángulo → cuadrado).

\[
A=xy,\quad x+y=C \Rightarrow A(x)=x(C-x)
\]

---
**ID:** `DIF-099`
**Detalle:** Ejemplo tipo: cilindro de superficie fija y volumen máximo.

\[
V=\pi r^2h,\quad S=2\pi r^2+2\pi rh=C \Rightarrow V(r)=\frac{C}{2}r-\pi r^3
\]

---
---

## 10. Aproximaciones lineales y diferenciales

### 10.1 Diferencial

**ID:** `DIF-100`
**Detalle:** Diferencial de \(y=f(x)\).

\[
dy=f'(x)\,dx
\]

---
**ID:** `DIF-101`
**Detalle:** Incremento verdadero de la función.

\[
\Delta y=f(x+\Delta x)-f(x)
\]

---
### 10.2 Aproximación lineal

**ID:** `DIF-102`
**Detalle:** Polinomio de Taylor de grado 1 (aproximación lineal en \(a\)).

\[
L(x)=f(a)+f'(a)(x-a)
\]

---
**ID:** `DIF-103`

\[
f(x)\approx f(a)+f'(a)(x-a)\quad\text{cuando }x\approx a
\]

---
**ID:** `DIF-104`
**Detalle:** Aproximación del incremento para \(\Delta x\) pequeño.

\[
\Delta y\approx f'(a)\,\Delta x
\]

---
**ID:** `DIF-105`
**Detalle:** Aproximación lineal clásica.

\[
\sqrt{1+x}\approx 1+\frac{x}{2},\qquad |x|\ll1
\]

---
---

## 11. Series de Taylor (introducción)

### 11.1 Polinomio de Taylor

**ID:** `DIF-106`
**Detalle:** Polinomio de Taylor de orden \(n\) centrado en \(a\).
**Relacionadas:** `INT-163`

\[
P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(a)}{k!}(x-a)^k
\]

---
**ID:** `DIF-107`
**Detalle:** Descomposición función = aproximación + resto.

\[
f(x)=P_n(x)+R_n(x)
\]

---
### 11.2 Fórmulas de Maclaurin (a=0)

**ID:** `DIF-108`

\[
e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots
\]

---
**ID:** `DIF-109`

\[
\operatorname{sen}x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots
\]

---
**ID:** `DIF-110`

\[
\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots
\]

---
**ID:** `DIF-111`

\[
\ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots,\qquad |x|<1
\]

---
**ID:** `DIF-112`

\[
(1+x)^\alpha=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+\cdots,\qquad |x|<1
\]

---
### 11.3 Resto de Lagrange

**ID:** `DIF-113`

\[
R_n(x)=\frac{f^{(n+1)}(c)}{(n+1)!}(x-a)^{n+1},\qquad c\text{ entre }a\text{ y }x
\]

---
---

## 12. L'Hôpital y límites indeterminados

### 12.1 Regla de L'Hôpital

**ID:** `DIF-114`
**Detalle:** Cuando el límite original es \(0/0\) o \(\infty/\infty\) y se cumplen las hipótesis.

\[
\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}
\]

---
**ID:** `DIF-115`

\[
\lim_{x\to\infty}\frac{f(x)}{g(x)}=\lim_{x\to\infty}\frac{f'(x)}{g'(x)}
\]

---
### 12.2 Formas indeterminadas

**ID:** `DIF-116`
**Detalle:** Reescritura para aplicar L'Hôpital.

\[
0\cdot\infty:\quad f\cdot g=\frac{f}{1/g}\ \text{o}\ \frac{g}{1/f}
\]

---
**ID:** `DIF-117`

\[
\infty-\infty:\quad \text{combinar algebraicamente o usar conjugados/logaritmos}
\]

---
**ID:** `DIF-118`

\[
0^0,\ 1^\infty,\ \infty^0:\quad \text{usar } y=f^g,\ \ln y=g\ln f
\]

---
---

## 13. Funciones implícitas y relacionadas

### 13.1 Derivación implícita

**ID:** `DIF-119`
**Detalle:** Fórmula general; \(F_x=\partial F/\partial x\), \(F_y=\partial F/\partial y\).

\[
\frac{d}{dx}[F(x,y)]=0 \Rightarrow F_x+F_y\frac{dy}{dx}=0
\]

---
**ID:** `DIF-120`

\[
\frac{dy}{dx}=-\frac{F_x}{F_y},\qquad F_y\neq0
\]

---
**ID:** `DIF-121`
**Detalle:** Ejemplo: circunferencia.

\[
x^2+y^2=r^2 \Rightarrow \frac{dy}{dx}=-\frac{x}{y}
\]

---
### 13.2 Derivadas de funciones inversas

**ID:** `DIF-122`

\[
(f^{-1})'(y)=\frac{1}{f'(f^{-1}(y))},\qquad f'(f^{-1}(y))\neq0
\]

---
---

## 14. Tasas relacionadas

### 14.1 Estrategia

1. Identificar variables que dependen del tiempo: \(x(t),y(t),\ldots\)
2. Escribir una ecuación que las relaciona.
3. Diferenciar respecto de \(t\) (a menudo con la regla de la cadena).
4. Sustituir valores conocidos en el instante considerado.

### 14.2 Ejemplos tipo



**ID:** `DIF-123`
**Detalle:** Tasa relacionada en circunferencia (radio constante).

\[
x^2+y^2=r^2 \Rightarrow 2x\frac{dx}{dt}+2y\frac{dy}{dt}=0
\]

---
**ID:** `DIF-124`
**Detalle:** Esfera inflándose.

\[
V=\frac{4}{3}\pi r^3 \Rightarrow \frac{dV}{dt}=4\pi r^2\frac{dr}{dt}
\]

---
**ID:** `DIF-125`
**Detalle:** Distancia en el plano.

\[
z^2=x^2+y^2 \Rightarrow 2z\frac{dz}{dt}=2x\frac{dx}{dt}+2y\frac{dy}{dt}
\]

---
---

## 15. Gráficas y comportamiento asintótico

### 15.1 Asíntotas verticales

**ID:** `DIF-126`

\[
x=a\text{ asíntota vertical de }f \Leftrightarrow \lim_{x\to a^+}f(x)=\pm\infty\ \text{o}\ \lim_{x\to a^-}f(x)=\pm\infty
\]

---
### 15.2 Asíntotas horizontales

**ID:** `DIF-127`

\[
y=L\text{ asíntota horizontal} \Leftrightarrow \lim_{x\to\pm\infty}f(x)=L
\]

---
### 15.3 Asíntotas oblicuas

**ID:** `DIF-128`

\[
y=mx+b\text{ asíntota oblicua} \Leftrightarrow \lim_{x\to\pm\infty}[f(x)-(mx+b)]=0
\]

---
**ID:** `DIF-129`
**Detalle:** Cálculo de pendiente e intercepto para asíntotas oblicuas.

\[
m=\lim_{x\to\pm\infty}\frac{f(x)}{x},\qquad b=\lim_{x\to\pm\infty}[f(x)-mx]
\]

---
### 15.4 Guía de graficación

**ID:** `DIF-130`
**Detalle:** Orden recomendado para esbozar \(y=f(x)\).

\[
\text{Dominio} \to \text{intersecciones} \to \text{asíntotas} \to f' \to f'' \to \text{esquema}
\]

---
---

## 16. Guía para derivar y analizar

| Señal en la función | Técnica sugerida |
|---|---|
| Polinomio o potencia \(x^n\) | Regla de la potencia |
| Producto de funciones | Regla del producto |
| Cociente | Regla del cociente |
| Composición \(f(g(x))\) | Regla de la cadena |
| \(f^g\) con exponente variable | Logaritmica |
| Ecuación implícita \(F(x,y)=0\) | Derivación implícita |
| Límite \(0/0\) o \(\infty/\infty\) | L'Hôpital o álgebra |
| Optimizar en \([a,b]\) | Críticos + extremos del intervalo |
| Aproximar cerca de \(a\) | Linealización o Taylor |

### 16.1 Orden para analizar una función

1. Dominio y simetrías.
2. Intersecciones con ejes.
3. Asíntotas verticales, horizontales y oblicuas.
4. \(f'\): intervalos de crecimiento/decrecimiento y puntos críticos.
5. \(f''\): concavidad y puntos de inflexión.
6. Tabla de signos y esquema final.

---

## Apéndice A: tabla extensa de derivadas

> **Regla de uso:** aplicar solo donde las expresiones estén definidas; denominadores distintos de cero.

### A.1 Potencias y exponenciales

**ID:** `DIF-131`

\[
\frac{d}{dx}(x^n)=nx^{n-1},\qquad n\in\mathbb{R}
\]

---
**ID:** `DIF-132`

\[
\frac{d}{dx}(e^x)=e^x
\]

---
**ID:** `DIF-133`

\[
\frac{d}{dx}(a^x)=a^x\ln a,\qquad a>0
\]

---
**ID:** `DIF-134`

\[
\frac{d}{dx}(\ln x)=\frac{1}{x},\qquad x>0
\]

---
**ID:** `DIF-135`

\[
\frac{d}{dx}(\ln|x|)=\frac{1}{x},\qquad x\neq0
\]

---
**ID:** `DIF-136`

\[
\frac{d}{dx}(\log_a x)=\frac{1}{x\ln a},\qquad a>0,a\neq1,x>0
\]

---
### A.2 Trigonométricas

**ID:** `DIF-137`

\[
\frac{d}{dx}(\operatorname{sen}x)=\cos x
\]

---
**ID:** `DIF-138`

\[
\frac{d}{dx}(\cos x)=-\operatorname{sen}x
\]

---
**ID:** `DIF-139`

\[
\frac{d}{dx}(\tan x)=\sec^2 x
\]

---
**ID:** `DIF-140`

\[
\frac{d}{dx}(\cot x)=-\csc^2 x
\]

---
**ID:** `DIF-141`

\[
\frac{d}{dx}(\sec x)=\sec x\tan x
\]

---
**ID:** `DIF-142`

\[
\frac{d}{dx}(\csc x)=-\csc x\cot x
\]

---
### A.3 Inversas trigonométricas

**ID:** `DIF-143`

\[
\frac{d}{dx}(\operatorname{arcsen}x)=\frac{1}{\sqrt{1-x^2}},\qquad |x|<1
\]

---
**ID:** `DIF-144`

\[
\frac{d}{dx}(\arccos x)=-\frac{1}{\sqrt{1-x^2}},\qquad |x|<1
\]

---
**ID:** `DIF-145`

\[
\frac{d}{dx}(\arctan x)=\frac{1}{1+x^2},\qquad x\in\mathbb{R}
\]

---
**ID:** `DIF-146`

\[
\frac{d}{dx}(\operatorname{arcsec}x)=\frac{1}{|x|\sqrt{x^2-1}},\qquad |x|>1
\]

---
**ID:** `DIF-147`

\[
\frac{d}{dx}(\operatorname{arccsc}x)=-\frac{1}{|x|\sqrt{x^2-1}},\qquad |x|>1
\]

---
**ID:** `DIF-148`

\[
\frac{d}{dx}(\operatorname{arccot}x)=-\frac{1}{1+x^2},\qquad x\in\mathbb{R}
\]

---
### A.4 Hiperbólicas

**ID:** `DIF-149`

\[
\frac{d}{dx}(\sinh x)=\cosh x
\]

---
**ID:** `DIF-150`

\[
\frac{d}{dx}(\cosh x)=\sinh x
\]

---
**ID:** `DIF-151`

\[
\frac{d}{dx}(\tanh x)=\mathrm{sech}^2 x
\]

---
**ID:** `DIF-152`

\[
\frac{d}{dx}(\coth x)=-\mathrm{csch}^2 x
\]

---
**ID:** `DIF-153`

\[
\frac{d}{dx}(\mathrm{sech}\,x)=-\mathrm{sech}\,x\tanh x
\]

---
**ID:** `DIF-154`

\[
\frac{d}{dx}(\mathrm{csch}\,x)=-\mathrm{csch}\,x\coth x
\]

---
### A.5 Composiciones frecuentes

**ID:** `DIF-155`

\[
\frac{d}{dx}(\operatorname{sen}(g(x)))=\cos(g(x))\cdot g'(x)
\]

---
**ID:** `DIF-156`

\[
\frac{d}{dx}(\cos(g(x)))=-\operatorname{sen}(g(x))\cdot g'(x)
\]

---
**ID:** `DIF-157`

\[
\frac{d}{dx}(e^{g(x)})=e^{g(x)}g'(x)
\]

---
**ID:** `DIF-158`

\[
\frac{d}{dx}(\ln(g(x)),\qquad g(x)>0)=\frac{g'(x)}{g(x)}
\]

---
**ID:** `DIF-159`

\[
\frac{d}{dx}((g(x))^n)=n(g(x))^{n-1}g'(x)
\]

---
**ID:** `DIF-160`

\[
\frac{d}{dx}(\arctan(g(x)))=\frac{g'(x)}{1+(g(x))^2}
\]

---
**ID:** `DIF-161`

\[
\frac{d}{dx}(\operatorname{arcsen}(g(x)),\qquad |g(x)|<1)=\frac{g'(x)}{\sqrt{1-(g(x))^2}}
\]

---

---

*Generado con 161 fórmulas catalogadas (`DIF-001` … `DIF-161`).*

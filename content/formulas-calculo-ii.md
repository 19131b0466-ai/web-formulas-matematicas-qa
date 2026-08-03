# Fórmulas de Cálculo II — versión corregida y ampliada

Formulario integral de **Cálculo II / Cálculo Integral**. Esta versión conserva la tabla de antiderivadas del documento original y añade los conceptos, métodos, aplicaciones, restricciones y temas que faltaban.

> **Alcance:** la organización exacta de Cálculo II cambia entre universidades. Las secciones de integrales, técnicas y aplicaciones constituyen el núcleo habitual; sucesiones, series, curvas paramétricas, coordenadas polares y ecuaciones diferenciales se incluyen porque también suelen formar parte del curso.

---

## Índice

1. [Notación, dominios y convenciones](#1-notación-dominios-y-convenciones)
2. [Integral indefinida y propiedades](#2-integral-indefinida-y-propiedades)
3. [Integral definida y Teorema Fundamental del Cálculo](#3-integral-definida-y-teorema-fundamental-del-cálculo)
4. [Método de sustitución](#4-método-de-sustitución)
5. [Integración por partes](#5-integración-por-partes)
6. [Integrales trigonométricas](#6-integrales-trigonométricas)
7. [Sustitución trigonométrica y radicales cuadráticos](#7-sustitución-trigonométrica-y-radicales-cuadráticos)
8. [Funciones racionales y fracciones parciales](#8-funciones-racionales-y-fracciones-parciales)
9. [Integrales impropias](#9-integrales-impropias)
10. [Aplicaciones de la integral](#10-aplicaciones-de-la-integral)
11. [Integración numérica](#11-integración-numérica)
12. [Curvas paramétricas](#12-curvas-paramétricas)
13. [Coordenadas polares](#13-coordenadas-polares)
14. [Sucesiones y series](#14-sucesiones-y-series)
15. [Series de potencias y Taylor](#15-series-de-potencias-y-taylor)
16. [Ecuaciones diferenciales elementales](#16-ecuaciones-diferenciales-elementales)
17. [Guía para elegir un método](#17-guía-para-elegir-un-método)
18. [Apéndice A: tabla extensa de antiderivadas](#apéndice-a-tabla-extensa-de-antiderivadas)

---

## 1. Notación, dominios y convenciones

- \(C\) representa una constante real de integración.
- Se usa \(\operatorname{sen} x\) para el seno.
- \(\operatorname{arcsen} x\), \(\arccos x\), \(\arctan x\) y \(\operatorname{arcsec}x\) representan **funciones inversas**, no recíprocos.
- \(\csc x=1/\operatorname{sen} x\), \(\sec x=1/\cos x\) y \(\cot x=\cos x/\operatorname{sen} x\).
- En una integral indefinida, dos antiderivadas que difieren en una constante representan la misma familia.
- Toda fórmula debe aplicarse únicamente donde el integrando esté definido.
- En expresiones reales:
  - \(\ln x\) requiere \(x>0\), mientras que \(\ln|x|\) permite \(x\neq0\).
  - \(\sqrt{g(x)}\) requiere \(g(x)\ge0\).
  - Si un radical está en el denominador, se requiere \(g(x)>0\).
  - Todo denominador debe ser distinto de cero.
- Para \(a^x\), se asume \(a>0\); si aparece \(1/\ln a\), además \(a\neq1\).
- En las fórmulas con \(\sqrt{a^2\pm x^2}\) se toma normalmente \(a>0\).

### 1.1 Derivadas que conviene reconocer al integrar

\[
\frac{d}{dx}\ln|g(x)|=\frac{g'(x)}{g(x)}
\]

\[
\frac{d}{dx}e^{g(x)}=e^{g(x)}g'(x)
\]

\[
\frac{d}{dx}\operatorname{arcsen}\!\left(\frac{x}{a}\right)
=\frac{1}{\sqrt{a^2-x^2}},\qquad a>0
\]

\[
\frac{d}{dx}\arctan\!\left(\frac{x}{a}\right)
=\frac{a}{a^2+x^2},\qquad a>0
\]

---

## 2. Integral indefinida y propiedades

Una función \(F\) es antiderivada de \(f\) en un intervalo si

\[
F'(x)=f(x).
\]

La integral indefinida representa la familia de antiderivadas:

\[
\int f(x)\,dx=F(x)+C.
\]

### 2.1 Linealidad

Para constantes \(\alpha,\beta\):

\[
\int [\alpha f(x)+\beta g(x)]\,dx
=\alpha\int f(x)\,dx+\beta\int g(x)\,dx.
\]

En particular,

\[
\int kf(x)\,dx=k\int f(x)\,dx.
\]

### 2.2 Reglas elementales

\[
\int x^n\,dx=\frac{x^{n+1}}{n+1}+C,\qquad n\neq-1
\]

\[
\int \frac{dx}{x}=\ln|x|+C
\]

\[
\int e^{kx}\,dx=\frac{e^{kx}}{k}+C,\qquad k\neq0
\]

\[
\int a^{kx}\,dx=\frac{a^{kx}}{k\ln a}+C,
\qquad a>0,\ a\neq1,\ k\neq0
\]

### 2.3 Comprobación de una antiderivada

Para comprobar una respuesta \(F(x)+C\), se deriva \(F(x)\). La respuesta es correcta si

\[
F'(x)=f(x)
\]

en cada intervalo del dominio considerado.

---

## 3. Integral definida y Teorema Fundamental del Cálculo

### 3.1 Sumas de Riemann

Para una partición \(a=x_0<x_1<\cdots<x_n=b\), con \(\Delta x_i=x_i-x_{i-1}\) y puntos de muestra \(x_i^*\),

\[
\int_a^b f(x)\,dx
=\lim_{\|P\|\to0}\sum_{i=1}^{n}f(x_i^*)\Delta x_i,
\]

si el límite existe.

Para una partición uniforme, \(\Delta x=(b-a)/n\):

\[
\int_a^b f(x)\,dx
=\lim_{n\to\infty}\sum_{i=1}^{n}f(x_i^*)\Delta x.
\]

### 3.2 Propiedades

\[
\int_a^a f(x)\,dx=0
\]

\[
\int_a^b f(x)\,dx=-\int_b^a f(x)\,dx
\]

\[
\int_a^b f(x)\,dx+\int_b^c f(x)\,dx=\int_a^c f(x)\,dx
\]

\[
\int_a^b [\alpha f(x)+\beta g(x)]\,dx
=\alpha\int_a^b f(x)\,dx+\beta\int_a^b g(x)\,dx
\]

Si \(f(x)\ge0\) en \([a,b]\), entonces

\[
\int_a^b f(x)\,dx\ge0.
\]

Si \(f(x)\le g(x)\) en \([a,b]\), entonces

\[
\int_a^b f(x)\,dx\le\int_a^b g(x)\,dx.
\]

### 3.3 Teorema Fundamental del Cálculo

**Parte I.** Si \(f\) es continua y

\[
G(x)=\int_a^x f(t)\,dt,
\]

entonces

\[
G'(x)=f(x).
\]

Más generalmente, por la regla de la cadena:

\[
\frac{d}{dx}\int_a^{g(x)}f(t)\,dt=f(g(x))g'(x).
\]

Con ambos límites variables:

\[
\frac{d}{dx}\int_{u(x)}^{v(x)}f(t)\,dt
=f(v(x))v'(x)-f(u(x))u'(x).
\]

**Parte II.** Si \(F'(x)=f(x)\), entonces

\[
\int_a^b f(x)\,dx=F(b)-F(a).
\]

### 3.4 Área con signo y área geométrica

La integral definida calcula área con signo. El área geométrica entre la curva y el eje \(x\) es

\[
A=\int_a^b |f(x)|\,dx.
\]

Si \(f\) cambia de signo, se divide el intervalo en sus ceros.

### 3.5 Valor promedio

\[
f_{\mathrm{prom}}=\frac{1}{b-a}\int_a^b f(x)\,dx.
\]

Si \(f\) es continua, existe \(c\in[a,b]\) tal que

\[
f(c)=f_{\mathrm{prom}}.
\]

---

## 4. Método de sustitución

La sustitución invierte la regla de la cadena.

Si \(u=g(x)\), \(du=g'(x)\,dx\) y \(F'=f\), entonces

\[
\int f(g(x))g'(x)\,dx=F(g(x))+C.
\]

### 4.1 Procedimiento

1. Elegir una expresión interna \(u=g(x)\).
2. Calcular \(du=g'(x)\,dx\).
3. Reescribir **todo** el integrando en términos de \(u\).
4. Integrar respecto de \(u\).
5. Regresar a la variable original en una integral indefinida.

### 4.2 Sustitución en integrales definidas

Puede regresarse a \(x\) antes de evaluar o cambiar directamente los límites:

\[
\int_a^b f(g(x))g'(x)\,dx
=\int_{g(a)}^{g(b)}f(u)\,du.
\]

No deben mezclarse límites en \(x\) con un integrando escrito en \(u\).

### 4.3 Patrones frecuentes

\[
\int \frac{g'(x)}{g(x)}\,dx=\ln|g(x)|+C
\]

\[
\int e^{g(x)}g'(x)\,dx=e^{g(x)}+C
\]

\[
\int [g(x)]^n g'(x)\,dx
=\frac{[g(x)]^{n+1}}{n+1}+C,\qquad n\neq-1
\]

\[
\int \frac{g'(x)}{a^2+[g(x)]^2}\,dx
=\frac{1}{a}\arctan\!\left(\frac{g(x)}{a}\right)+C,
\qquad a>0
\]

\[
\int \frac{g'(x)}{\sqrt{a^2-[g(x)]^2}}\,dx
=\operatorname{arcsen}\!\left(\frac{g(x)}{a}\right)+C,
\qquad a>0
\]

---

## 5. Integración por partes

Proviene de la regla del producto:

\[
\int u\,dv=uv-\int v\,du.
\]

En forma de funciones:

\[
\int f(x)g'(x)\,dx=f(x)g(x)-\int f'(x)g(x)\,dx.
\]

### 5.1 Elección de \(u\)

Una guía común es **LIATE**:

1. Logarítmicas.
2. Inversas trigonométricas.
3. Algebraicas.
4. Trigonométricas.
5. Exponenciales.

La guía no reemplaza el análisis: conviene escoger \(u\) de modo que \(du\) simplifique la integral.

### 5.2 Integrales definidas

\[
\int_a^b u\,dv=[uv]_a^b-\int_a^b v\,du.
\]

### 5.3 Fórmulas de reducción típicas

\[
\int x^n e^{ax}\,dx
=\frac{x^n e^{ax}}{a}-\frac{n}{a}\int x^{n-1}e^{ax}\,dx,
\qquad a\neq0
\]

\[
\int \operatorname{sen}^n x\,dx
=-\frac{\operatorname{sen}^{n-1}x\cos x}{n}
+\frac{n-1}{n}\int\operatorname{sen}^{n-2}x\,dx,
\qquad n\ge2
\]

\[
\int \cos^n x\,dx
=\frac{\cos^{n-1}x\operatorname{sen} x}{n}
+\frac{n-1}{n}\int\cos^{n-2}x\,dx,
\qquad n\ge2
\]

\[
\int \tan^n x\,dx
=\frac{\tan^{n-1}x}{n-1}-\int\tan^{n-2}x\,dx,
\qquad n>1
\]

\[
\int \cot^n x\,dx
=-\frac{\cot^{n-1}x}{n-1}-\int\cot^{n-2}x\,dx,
\qquad n>1
\]

\[
\int \sec^n x\,dx
=\frac{\sec^{n-2}x\tan x}{n-1}
+\frac{n-2}{n-1}\int\sec^{n-2}x\,dx,
\qquad n>1
\]

\[
\int \csc^n x\,dx
=-\frac{\csc^{n-2}x\cot x}{n-1}
+\frac{n-2}{n-1}\int\csc^{n-2}x\,dx,
\qquad n>1
\]

---

## 6. Integrales trigonométricas

### 6.1 Identidades fundamentales

\[
\operatorname{sen}^2x+\cos^2x=1
\]

\[
1+\tan^2x=\sec^2x
\]

\[
1+\cot^2x=\csc^2x
\]

### 6.2 Identidades de ángulo doble y reducción de potencia

\[
\operatorname{sen}(2x)=2\operatorname{sen} x\cos x
\]

\[
\operatorname{sen}^2x=\frac{1-\cos(2x)}{2}
\]

\[
\cos^2x=\frac{1+\cos(2x)}{2}
\]

\[
\operatorname{sen} x\cos x=\frac{1}{2}\operatorname{sen}(2x)
\]

### 6.3 Producto a suma

\[
\operatorname{sen} A\operatorname{sen} B=\frac{1}{2}[\cos(A-B)-\cos(A+B)]
\]

\[
\cos A\cos B=\frac{1}{2}[\cos(A-B)+\cos(A+B)]
\]

\[
\operatorname{sen} A\cos B=\frac{1}{2}[\operatorname{sen}(A+B)+\operatorname{sen}(A-B)]
\]

### 6.4 Estrategia para \(\int\operatorname{sen}^m x\cos^n x\,dx\)

- Si \(m\) es impar, reservar un factor \(\operatorname{sen} x\) y usar \(\operatorname{sen}^2x=1-\cos^2x\); luego \(u=\cos x\).
- Si \(n\) es impar, reservar un factor \(\cos x\) y usar \(\cos^2x=1-\operatorname{sen}^2x\); luego \(u=\operatorname{sen} x\).
- Si ambos son pares, usar identidades de reducción de potencia.

### 6.5 Estrategia para \(\int\tan^m x\sec^n x\,dx\)

- Si \(n\) es par, reservar \(\sec^2x\) y convertir el resto mediante \(\sec^2x=1+\tan^2x\); usar \(u=\tan x\).
- Si \(m\) es impar, reservar \(\sec x\tan x\) y convertir el resto mediante \(\tan^2x=\sec^2x-1\); usar \(u=\sec x\).
- En otros casos puede ser necesario usar identidades, reducción o integración por partes.

### 6.6 Estrategia para \(\int\cot^m x\csc^n x\,dx\)

- Si \(n\) es par, reservar \(\csc^2x\) y usar \(u=\cot x\).
- Si \(m\) es impar, reservar \(\csc x\cot x\) y usar \(u=\csc x\).

### 6.7 Integrales trigonométricas básicas

\[
\int\operatorname{sen} x\,dx=-\cos x+C,
\qquad
\int\cos x\,dx=\operatorname{sen} x+C
\]

\[
\int\sec^2x\,dx=\tan x+C,
\qquad
\int\csc^2x\,dx=-\cot x+C
\]

\[
\int\sec x\tan x\,dx=\sec x+C,
\qquad
\int\csc x\cot x\,dx=-\csc x+C
\]

\[
\int\tan x\,dx=-\ln|\cos x|+C=\ln|\sec x|+C
\]

\[
\int\cot x\,dx=\ln|\operatorname{sen} x|+C
\]

\[
\int\sec x\,dx=\ln|\sec x+\tan x|+C
\]

\[
\int\csc x\,dx=\ln|\csc x-\cot x|+C
\]

### 6.8 Funciones hiperbólicas

\[
\operatorname{senh} x=\frac{e^x-e^{-x}}{2},
\qquad
\cosh x=\frac{e^x+e^{-x}}{2}
\]

\[
\cosh^2x-\operatorname{senh}^2x=1
\]

\[
\frac{d}{dx}\operatorname{senh} x=\cosh x,
\qquad
\frac{d}{dx}\cosh x=\operatorname{senh} x
\]

\[
\frac{d}{dx}\tanh x=\operatorname{sech}^2x,
\qquad
\frac{d}{dx}\coth x=-\operatorname{csch}^2x
\]

\[
\int\tanh x\,dx=\ln(\cosh x)+C,
\qquad
\int\coth x\,dx=\ln|\operatorname{senh} x|+C
\]

---

## 7. Sustitución trigonométrica y radicales cuadráticos

### 7.1 Tabla de sustituciones

| Radical | Sustitución | Identidad resultante |
|---|---|---|
| \(\sqrt{a^2-x^2}\) | \(x=a\operatorname{sen}\theta\) | \(\sqrt{a^2-x^2}=a\cos\theta\) |
| \(\sqrt{a^2+x^2}\) | \(x=a\tan\theta\) | \(\sqrt{a^2+x^2}=a\sec\theta\) |
| \(\sqrt{x^2-a^2}\) | \(x=a\sec\theta\) | \(\sqrt{x^2-a^2}=a\tan\theta\) |

Se asume \(a>0\) y se escoge un intervalo de \(\theta\) compatible con los signos.

### 7.2 Regreso a la variable original

Después de integrar en \(\theta\), puede usarse un triángulo de referencia:

- Si \(x=a\operatorname{sen}\theta\), entonces \(\operatorname{sen}\theta=x/a\).
- Si \(x=a\tan\theta\), entonces \(\tan\theta=x/a\).
- Si \(x=a\sec\theta\), entonces \(\sec\theta=x/a\).

### 7.3 Completar el cuadrado

Antes de usar sustitución trigonométrica, una cuadrática debe escribirse en una forma estándar:

\[
x^2+Bx+C=\left(x+\frac{B}{2}\right)^2+C-\frac{B^2}{4}.
\]

Por ejemplo,

\[
2ax-x^2=a^2-(x-a)^2.
\]

### 7.4 Formas fundamentales

\[
\int\frac{dx}{\sqrt{a^2-x^2}}
=\operatorname{arcsen}\!\left(\frac{x}{a}\right)+C,
\qquad |x|<a
\]

\[
\int\frac{dx}{a^2+x^2}
=\frac{1}{a}\arctan\!\left(\frac{x}{a}\right)+C,
\qquad a>0
\]

\[
\int\frac{dx}{x\sqrt{x^2-a^2}}
=\frac{1}{a}\operatorname{arcsec}\!\left|\frac{x}{a}\right|+C,
\qquad |x|>a>0
\]

\[
\int\frac{dx}{\sqrt{x^2+a^2}}
=\ln\left|x+\sqrt{x^2+a^2}\right|+C
\]

\[
\int\frac{dx}{\sqrt{x^2-a^2}}
=\ln\left|x+\sqrt{x^2-a^2}\right|+C
\]

---

## 8. Funciones racionales y fracciones parciales

Para integrar

\[
\frac{P(x)}{Q(x)},
\]

primero debe cumplirse \(\deg P<\deg Q\). Si no se cumple, se realiza división polinómica.

### 8.1 Factores lineales distintos

Si

\[
Q(x)=(x-r_1)(x-r_2)\cdots(x-r_k),
\]

entonces

\[
\frac{P(x)}{Q(x)}
=\frac{A_1}{x-r_1}+\frac{A_2}{x-r_2}+\cdots+\frac{A_k}{x-r_k}.
\]

### 8.2 Factores lineales repetidos

Para \((x-r)^m\), se incluyen todos los términos:

\[
\frac{A_1}{x-r}+\frac{A_2}{(x-r)^2}+\cdots+\frac{A_m}{(x-r)^m}.
\]

### 8.3 Factores cuadráticos irreducibles

Para \(x^2+px+q\) con discriminante negativo:

\[
\frac{Ax+B}{x^2+px+q}.
\]

### 8.4 Factores cuadráticos irreducibles repetidos

Para \((x^2+px+q)^m\), se usan

\[
\frac{A_1x+B_1}{x^2+px+q}
+\frac{A_2x+B_2}{(x^2+px+q)^2}
+\cdots
+\frac{A_mx+B_m}{(x^2+px+q)^m}.
\]

### 8.5 Procedimiento

1. Dividir si la fracción es impropia.
2. Factorizar completamente \(Q(x)\) sobre los reales.
3. Escribir la descomposición correspondiente.
4. Hallar los coeficientes.
5. Integrar término a término.
6. Completar el cuadrado en los factores cuadráticos cuando sea necesario.

### 8.6 Formas útiles

\[
\int\frac{dx}{x-r}=\ln|x-r|+C
\]

\[
\int\frac{dx}{(x-r)^n}
=-\frac{1}{(n-1)(x-r)^{n-1}}+C,
\qquad n>1
\]

\[
\int\frac{dx}{x^2+a^2}
=\frac{1}{a}\arctan\!\left(\frac{x}{a}\right)+C,
\qquad a>0
\]

---

## 9. Integrales impropias

Una integral impropia se define mediante límites. **No basta sustituir infinito como si fuera un número.**

### 9.1 Intervalos infinitos

\[
\int_a^{\infty}f(x)\,dx
=\lim_{b\to\infty}\int_a^b f(x)\,dx
\]

\[
\int_{-\infty}^{b}f(x)\,dx
=\lim_{a\to-\infty}\int_a^b f(x)\,dx
\]

Para ambos extremos infinitos se elige un punto \(c\):

\[
\int_{-\infty}^{\infty}f(x)\,dx
=\int_{-\infty}^{c}f(x)\,dx+
\int_c^{\infty}f(x)\,dx.
\]

La integral converge solamente si ambas partes convergen.

### 9.2 Discontinuidades infinitas

Si \(f\) tiene una discontinuidad infinita en \(b\):

\[
\int_a^b f(x)\,dx
=\lim_{t\to b^-}\int_a^t f(x)\,dx.
\]

Si la discontinuidad está en un punto interior \(c\), se separa la integral y ambas partes deben converger.

### 9.3 Integrales tipo \(p\)

\[
\int_1^{\infty}\frac{dx}{x^p}
\begin{cases}
\text{converge},&p>1,\\
\text{diverge},&p\le1.
\end{cases}
\]

\[
\int_0^1\frac{dx}{x^p}
\begin{cases}
\text{converge},&p<1,\\
\text{diverge},&p\ge1.
\end{cases}
\]

### 9.4 Comparación

Si \(0\le f(x)\le g(x)\) para \(x\) suficientemente grande:

- Si \(\int g\) converge, entonces \(\int f\) converge.
- Si \(\int f\) diverge, entonces \(\int g\) diverge.

**Comparación por límite:** si

\[
\lim_{x\to\infty}\frac{f(x)}{g(x)}=L,
\qquad 0<L<\infty,
\]

entonces \(\int f\) y \(\int g\) tienen el mismo comportamiento.

---

## 10. Aplicaciones de la integral

### 10.1 Área entre curvas

Con rebanadas verticales:

\[
A=\int_a^b [f(x)-g(x)]\,dx,
\]

si \(f(x)\ge g(x)\). En general,

\[
A=\int_a^b |f(x)-g(x)|\,dx.
\]

Con rebanadas horizontales:

\[
A=\int_c^d [x_{\mathrm{derecha}}(y)-x_{\mathrm{izquierda}}(y)]\,dy.
\]

### 10.2 Volúmenes por secciones transversales

Si el área de la sección perpendicular al eje es \(A(x)\):

\[
V=\int_a^b A(x)\,dx.
\]

### 10.3 Discos y arandelas

\[
V=\pi\int_a^b R(x)^2\,dx
\]

\[
V=\pi\int_a^b [R(x)^2-r(x)^2] \,dx.
\]

Los radios deben medirse como distancias al eje de rotación.

### 10.4 Capas cilíndricas

\[
V=2\pi\int_a^b
(\text{radio})(\text{altura})\,dx.
\]

Para un eje vertical \(x=c\):

\[
V=2\pi\int_a^b |x-c|[f(x)-g(x)]\,dx.
\]

### 10.5 Longitud de arco

Para \(y=f(x)\):

\[
L=\int_a^b\sqrt{1+[f'(x)]^2}\,dx.
\]

Para \(x=g(y)\):

\[
L=\int_c^d\sqrt{1+[g'(y)]^2}\,dy.
\]

### 10.6 Superficie de revolución

Alrededor del eje \(x\), con \(f(x)\ge0\):

\[
S=2\pi\int_a^b f(x)\sqrt{1+[f'(x)]^2}\,dx.
\]

Alrededor del eje \(y\), con \(x\ge0\):

\[
S=2\pi\int_a^b x\sqrt{1+[f'(x)]^2}\,dx.
\]

Para otro eje, el factor radial debe ser la distancia a ese eje.

### 10.7 Trabajo

Para una fuerza variable \(F(x)\):

\[
W=\int_a^b F(x)\,dx.
\]

Ley de Hooke:

\[
F(x)=kx,
\qquad
W=\int_{x_1}^{x_2}kx\,dx.
\]

### 10.8 Fuerza hidrostática

Para una placa vertical:

\[
F=\int \rho g\,d(y)\,w(y)\,dy,
\]

donde \(\rho\) es la densidad de masa, \(g\) la aceleración gravitatoria, \(d(y)\) la profundidad y \(w(y)\) el ancho de la tira.

Si se usa peso específico \(\gamma=\rho g\):

\[
F=\int \gamma\,d(y)\,w(y)\,dy.
\]

### 10.9 Masa, momentos y centroide de una lámina

Para una región entre \(y=f(x)\) y \(y=g(x)\), con densidad superficial constante \(\rho\):

\[
m=\rho\int_a^b[f(x)-g(x)]\,dx
\]

\[
M_y=\rho\int_a^b x[f(x)-g(x)]\,dx
\]

\[
M_x=\frac{\rho}{2}\int_a^b[f(x)^2-g(x)^2] \,dx
\]

\[
\bar{x}=\frac{M_y}{m},
\qquad
\bar{y}=\frac{M_x}{m}.
\]

---

## 11. Integración numérica

Sea \(\Delta x=(b-a)/n\), \(x_i=a+i\Delta x\).

### 11.1 Sumas izquierda, derecha y punto medio

\[
L_n=\Delta x\sum_{i=0}^{n-1}f(x_i)
\]

\[
R_n=\Delta x\sum_{i=1}^{n}f(x_i)
\]

\[
M_n=\Delta x\sum_{i=1}^{n}
 f\!\left(\frac{x_{i-1}+x_i}{2}\right)
\]

### 11.2 Regla del trapecio

\[
T_n=\frac{\Delta x}{2}
\left[f(x_0)+2\sum_{i=1}^{n-1}f(x_i)+f(x_n)\right].
\]

### 11.3 Regla de Simpson

Requiere \(n\) par:

\[
S_n=\frac{\Delta x}{3}
\left[
 f(x_0)
+4\sum_{\substack{i=1\\i\text{ impar}}}^{n-1}f(x_i)
+2\sum_{\substack{i=2\\i\text{ par}}}^{n-2}f(x_i)
+f(x_n)
\right].
\]

### 11.4 Cotas de error

Si \(|f''(x)|\le K_2\) en \([a,b]\):

\[
|E_T|\le\frac{K_2(b-a)^3}{12n^2}
\]

\[
|E_M|\le\frac{K_2(b-a)^3}{24n^2}.
\]

Si \(|f^{(4)}(x)|\le K_4\) y \(n\) es par:

\[
|E_S|\le\frac{K_4(b-a)^5}{180n^4}.
\]

---

## 12. Curvas paramétricas

Para

\[
x=x(t),\qquad y=y(t),
\]

con \(dx/dt\neq0\):

### 12.1 Pendiente

\[
\frac{dy}{dx}=\frac{dy/dt}{dx/dt}.
\]

### 12.2 Segunda derivada

\[
\frac{d^2y}{dx^2}
=\frac{\dfrac{d}{dt}\left(\dfrac{dy}{dx}\right)}{dx/dt}.
\]

### 12.3 Área

\[
A=\int y\,dx=\int_{\alpha}^{\beta}y(t)x'(t)\,dt,
\]

con orientación y signos apropiados.

### 12.4 Longitud de arco

\[
L=\int_{\alpha}^{\beta}
\sqrt{[x'(t)]^2+[y'(t)]^2}\,dt.
\]

### 12.5 Superficie de revolución

Alrededor del eje \(x\):

\[
S=2\pi\int_{\alpha}^{\beta}
|y(t)|\sqrt{[x'(t)]^2+[y'(t)]^2}\,dt.
\]

---

## 13. Coordenadas polares

\[
x=r\cos\theta,
\qquad
y=r\operatorname{sen}\theta.
\]

Además,

\[
r^2=x^2+y^2,
\qquad
\tan\theta=\frac{y}{x}
\]

con la elección correcta del cuadrante.

### 13.1 Pendiente

Si \(r=r(\theta)\):

\[
\frac{dy}{dx}
=\frac{r'(\theta)\operatorname{sen}\theta+r(\theta)\cos\theta}
{r'(\theta)\cos\theta-r(\theta)\operatorname{sen}\theta}.
\]

### 13.2 Área polar

\[
A=\frac12\int_{\alpha}^{\beta}r(\theta)^2\,d\theta.
\]

Entre dos curvas, con \(r_{\mathrm{ext}}\ge r_{\mathrm{int}}\):

\[
A=\frac12\int_{\alpha}^{\beta}
[r_{\mathrm{ext}}(\theta)^2-r_{\mathrm{int}}(\theta)^2]\,d\theta.
\]

### 13.3 Longitud de arco polar

\[
L=\int_{\alpha}^{\beta}
\sqrt{r(\theta)^2+[r'(\theta)]^2}\,d\theta.
\]

---

## 14. Sucesiones y series

### 14.1 Sucesiones

Una sucesión \(\{a_n\}\) converge a \(L\) si

\[
\lim_{n\to\infty}a_n=L.
\]

Si el límite no existe o es infinito, la sucesión diverge.

### 14.2 Series y sumas parciales

\[
\sum_{n=1}^{\infty}a_n
\]

converge si la sucesión de sumas parciales

\[
s_N=\sum_{n=1}^{N}a_n
\]

converge a un número finito.

**Condición necesaria:**

\[
\sum a_n\text{ converge}\quad\Longrightarrow\quad
\lim_{n\to\infty}a_n=0.
\]

El recíproco es falso.

### 14.3 Serie geométrica

\[
\sum_{n=0}^{\infty}ar^n
\]

converge si \(|r|<1\), y

\[
\sum_{n=0}^{\infty}ar^n=\frac{a}{1-r}.
\]

Si \(|r|\ge1\), diverge.

### 14.4 Serie \(p\)

\[
\sum_{n=1}^{\infty}\frac{1}{n^p}
\begin{cases}
\text{converge},&p>1,\\
\text{diverge},&p\le1.
\end{cases}
\]

### 14.5 Series telescópicas

Se escriben las sumas parciales y se cancelan términos. La convergencia se decide calculando

\[
\lim_{N\to\infty}s_N.
\]

### 14.6 Criterio integral

Si \(f\) es positiva, continua y decreciente, y \(a_n=f(n)\), entonces

\[
\sum_{n=N}^{\infty}a_n
\]

y

\[
\int_N^{\infty}f(x)\,dx
\]

tienen el mismo comportamiento.

Cota del residuo:

\[
\int_{N+1}^{\infty}f(x)\,dx
\le R_N
\le\int_N^{\infty}f(x)\,dx.
\]

### 14.7 Comparación directa y por límite

Si \(0\le a_n\le b_n\):

- \(\sum b_n\) convergente implica \(\sum a_n\) convergente.
- \(\sum a_n\) divergente implica \(\sum b_n\) divergente.

Si

\[
\lim_{n\to\infty}\frac{a_n}{b_n}=L,
\qquad0<L<\infty,
\]

entonces ambas series positivas tienen el mismo comportamiento.

### 14.8 Series alternantes

Si \(b_n\ge0\), \(b_{n+1}\le b_n\) desde algún punto y \(b_n\to0\), entonces

\[
\sum_{n=1}^{\infty}(-1)^{n-1}b_n
\]

converge.

Error de truncamiento:

\[
|R_N|\le b_{N+1}.
\]

### 14.9 Convergencia absoluta y condicional

- Si \(\sum|a_n|\) converge, entonces \(\sum a_n\) converge absolutamente.
- Si \(\sum a_n\) converge, pero \(\sum|a_n|\) diverge, la convergencia es condicional.

### 14.10 Criterio del cociente

\[
L=\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|.
\]

- Si \(L<1\), converge absolutamente.
- Si \(L>1\) o \(L=\infty\), diverge.
- Si \(L=1\), el criterio no decide.

### 14.11 Criterio de la raíz

\[
L=\lim_{n\to\infty}\sqrt[n]{|a_n|}.
\]

Se aplican las mismas conclusiones que en el criterio del cociente.

---

## 15. Series de potencias y Taylor

### 15.1 Serie de potencias

\[
\sum_{n=0}^{\infty}c_n(x-a)^n.
\]

Existe un radio \(R\in[0,\infty]\) tal que:

- converge absolutamente si \(|x-a|<R\);
- diverge si \(|x-a|>R\);
- los extremos deben estudiarse por separado.

El intervalo de convergencia incluye únicamente los extremos que pasen su prueba individual.

### 15.2 Derivación e integración término a término

Dentro de \(|x-a|<R\):

\[
\frac{d}{dx}\sum_{n=0}^{\infty}c_n(x-a)^n
=\sum_{n=1}^{\infty}nc_n(x-a)^{n-1}
\]

\[
\int\sum_{n=0}^{\infty}c_n(x-a)^n\,dx
=C+\sum_{n=0}^{\infty}\frac{c_n}{n+1}(x-a)^{n+1}.
\]

El radio de convergencia se conserva, aunque los extremos pueden cambiar.

### 15.3 Serie de Taylor

Si la función admite la expansión:

\[
f(x)=\sum_{n=0}^{\infty}
\frac{f^{(n)}(a)}{n!}(x-a)^n.
\]

El polinomio de Taylor de grado \(N\) es

\[
P_N(x)=\sum_{n=0}^{N}
\frac{f^{(n)}(a)}{n!}(x-a)^n.
\]

### 15.4 Resto de Taylor

Forma de Lagrange:

\[
R_N(x)=\frac{f^{(N+1)}(\xi)}{(N+1)!}(x-a)^{N+1}
\]

para algún \(\xi\) entre \(a\) y \(x\). Si \(|f^{(N+1)}(t)|\le M\), entonces

\[
|R_N(x)|\le\frac{M|x-a|^{N+1}}{(N+1)!}.
\]

### 15.5 Series de Maclaurin fundamentales

\[
e^x=\sum_{n=0}^{\infty}\frac{x^n}{n!}
=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots
\]

\[
\operatorname{sen} x=\sum_{n=0}^{\infty}(-1)^n\frac{x^{2n+1}}{(2n+1)!}
=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots
\]

\[
\cos x=\sum_{n=0}^{\infty}(-1)^n\frac{x^{2n}}{(2n)!}
=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots
\]

\[
\frac{1}{1-x}=\sum_{n=0}^{\infty}x^n,
\qquad |x|<1
\]

\[
\ln(1+x)=\sum_{n=1}^{\infty}(-1)^{n-1}\frac{x^n}{n},
\qquad -1<x\le1
\]

\[
\arctan x=\sum_{n=0}^{\infty}(-1)^n\frac{x^{2n+1}}{2n+1},
\qquad |x|\le1
\]

con convergencia condicional en \(x=\pm1\) según el valor correspondiente.

---

## 16. Ecuaciones diferenciales elementales

### 16.1 Variables separables

Si

\[
\frac{dy}{dx}=g(x)h(y),
\]

entonces, donde la división sea válida,

\[
\frac{dy}{h(y)}=g(x)\,dx
\]

y se integran ambos lados. Deben revisarse por separado las soluciones constantes perdidas al dividir por \(h(y)\).

### 16.2 Crecimiento y decaimiento exponencial

\[
\frac{dy}{dt}=ky
\quad\Longrightarrow\quad
y(t)=y_0e^{kt}.
\]

- \(k>0\): crecimiento.
- \(k<0\): decaimiento.

Vida media para \(k<0\):

\[
t_{1/2}=\frac{\ln2}{|k|}.
\]

### 16.3 Modelo logístico

\[
\frac{dP}{dt}=kP\left(1-\frac{P}{K}\right),
\]

donde \(K\) es la capacidad de carga. Para \(P(0)=P_0>0\):

\[
P(t)=\frac{K}{1+\left(\frac{K-P_0}{P_0}\right)e^{-kt}}.
\]

---

## 17. Guía para elegir un método

| Señal en el integrando | Método que conviene intentar |
|---|---|
| Composición y aparece la derivada interna | Sustitución |
| Producto con logaritmo, inversa trigonométrica o potencia algebraica | Integración por partes |
| Potencias de seno y coseno | Identidades y reglas de paridad |
| Potencias de tangente y secante | Reservar \(\sec^2x\) o \(\sec x\tan x\) |
| Cociente de polinomios | División y fracciones parciales |
| \(\sqrt{a^2-x^2}\), \(\sqrt{a^2+x^2}\), \(\sqrt{x^2-a^2}\) | Sustitución trigonométrica |
| Cuadrática no estándar dentro de un radical o denominador | Completar el cuadrado |
| Límites infinitos o singularidades | Integral impropia mediante límites |
| Antiderivada difícil o datos tabulados | Integración numérica |
| Integrando con un parámetro recurrente | Fórmula de reducción |

### 17.1 Orden práctico de revisión

1. Simplificar algebraicamente.
2. Verificar si existe una sustitución inmediata.
3. Reconocer una fórmula básica.
4. Usar identidades trigonométricas si corresponde.
5. Probar integración por partes.
6. Factorizar y usar fracciones parciales.
7. Completar el cuadrado o aplicar sustitución trigonométrica.
8. Determinar si la integral es impropia.
9. Si no hay forma elemental, considerar aproximación numérica o funciones especiales.

---

## Apéndice A: tabla extensa de antiderivadas

Las siguientes fórmulas proceden del catálogo original, con notación aclarada y restricciones generales añadidas.

> **Regla de uso:** además de las condiciones escritas junto a cada familia, se asume que todos los denominadores son distintos de cero y que las expresiones están dentro del dominio real. Las identidades se aplican por intervalos conexos del dominio.

### A.1. Fórmulas básicas de integración

#### A.1.1 Técnicas fundamentales

| Técnica | Fórmula |
|---------|---------|
| Integración por partes | \(\displaystyle\int u\,dv = uv - \int v\,du\) |

#### A.1.2 Regla de la potencia y funciones elementales

\[
\int u^n\,du = \frac{1}{n+1}\,u^{n+1} + C, \quad n \neq -1
\]

\[
\int \frac{du}{u} = \ln|u| + C
\]

\[
\int e^u\,du = e^u + C
\]

\[
\int a^u\,du = \frac{a^u}{\ln a} + C, \qquad a>0,\ a\neq1
\]

#### A.1.3 Integrales trigonométricas básicas

\[
\int \operatorname{sen}\,u\,du = -\cos u + C
\]

\[
\int \cos u\,du = \operatorname{sen}\,u + C
\]

\[
\int \sec^2 u\,du = \tan u + C
\]

\[
\int \csc^2 u\,du = -\cot u + C
\]

\[
\int \sec u\,\tan u\,du = \sec u + C
\]

\[
\int \csc u\,\cot u\,du = -\csc u + C
\]

#### A.1.4 Integrales trigonométricas (formas logarítmicas)

\[
\int \tan u\,du = -\ln|\cos u| + C
\]

\[
\int \cot u\,du = \ln|\operatorname{sen}\,u| + C
\]

\[
\int \sec u\,du = \ln|\sec u + \tan u| + C
\]

\[
\int \csc u\,du = \ln|\csc u - \cot u| + C
\]

#### A.1.5 Integrales que dan funciones trigonométricas inversas

\[
\int \frac{du}{\sqrt{a^2 - u^2}} = \operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int \frac{du}{a^2 + u^2} = \frac{1}{a}\,\arctan\frac{u}{a} + C
\]

\[
\int \frac{du}{u\sqrt{u^2 - a^2}} = \frac{1}{a}\,\operatorname{arcsec}\left|\frac{u}{a}\right| + C
\]

#### A.1.6 Fracciones parciales (formas logarítmicas)

\[
\int \frac{du}{a^2 - u^2} = \frac{1}{2a}\,\ln\left|\frac{u+a}{u-a}\right| + C
\]

\[
\int \frac{du}{u^2 - a^2} = \frac{1}{2a}\,\ln\left|\frac{u-a}{u+a}\right| + C
\]

---

### A.2. Integrales trigonométricas

#### A.2.1 Potencias pares (\(n = 2\))

\[
\int \operatorname{sen}^2 u\,du = \frac{1}{2}\,u - \frac{1}{4}\,\operatorname{sen} 2u + C
\]

\[
\int \cos^2 u\,du = \frac{1}{2}\,u + \frac{1}{4}\,\operatorname{sen} 2u + C
\]

\[
\int \tan^2 u\,du = \tan u - u + C
\]

\[
\int \cot^2 u\,du = -\cot u - u + C
\]

#### A.2.2 Potencias impares (\(n = 3\))

\[
\int \operatorname{sen}^3 u\,du = -\frac{1}{3}\left(2 + \operatorname{sen}^2 u\right)\cos u + C
\]

\[
\int \cos^3 u\,du = \frac{1}{3}\left(2 + \cos^2 u\right)\operatorname{sen}\,u + C
\]

\[
\int \tan^3 u\,du = \frac{1}{2}\,\tan^2 u + \ln|\cos u| + C
\]

\[
\int \cot^3 u\,du = -\frac{1}{2}\,\cot^2 u - \ln|\operatorname{sen}\,u| + C
\]

\[
\int \sec^3 u\,du = \frac{1}{2}\,\sec u\,\tan u + \frac{1}{2}\,\ln|\sec u + \tan u| + C
\]

\[
\int \csc^3 u\,du = -\frac{1}{2}\,\csc u\,\cot u + \frac{1}{2}\,\ln|\csc u - \cot u| + C
\]

#### A.2.3 Fórmulas de reducción

\[
\int \operatorname{sen}^n u\,du = -\frac{1}{n}\,\operatorname{sen}^{n-1} u\,\cos u + \frac{n-1}{n}\int \operatorname{sen}^{n-2} u\,du
\]

\[
\int \cos^n u\,du = \frac{1}{n}\,\cos^{n-1} u\,\operatorname{sen}\,u + \frac{n-1}{n}\int \cos^{n-2} u\,du
\]

\[
\int \tan^n u\,du = \frac{1}{n-1}\,\tan^{n-1} u - \int \tan^{n-2} u\,du
\]

---

### A.3. Integrales trigonométricas inversas

#### A.3.1 Integrales directas

\[
\int \operatorname{arcsen} u\,du = u\,\operatorname{arcsen} u + \sqrt{1 - u^2} + C
\]

\[
\int \arccos u\,du = u\,\arccos u - \sqrt{1 - u^2} + C
\]

\[
\int \arctan u\,du = u\,\arctan u - \frac{1}{2}\,\ln\left(1 + u^2\right) + C
\]

#### A.3.2 Producto con \(u\)

\[
\int u\,\operatorname{arcsen} u\,du = \frac{2u^2 - 1}{4}\,\operatorname{arcsen} u + \frac{u\sqrt{1 - u^2}}{4} + C
\]

\[
\int u\,\arctan u\,du = \frac{u^2 + 1}{2}\,\arctan u - \frac{u}{2} + C
\]

#### A.3.3 Potencias generales (\(n \neq -1\))

\[
\int u^n\,\operatorname{arcsen} u\,du = \frac{1}{n+1}\left[u^{n+1}\,\operatorname{arcsen} u - \int \frac{u^{n+1}\,du}{\sqrt{1 - u^2}}\right]
\]

\[
\int u^n\,\arccos u\,du = \frac{1}{n+1}\left[u^{n+1}\,\arccos u + \int \frac{u^{n+1}\,du}{\sqrt{1 - u^2}}\right]
\]

\[
\int u^n\,\arctan u\,du = \frac{1}{n+1}\left[u^{n+1}\,\arctan u - \int \frac{u^{n+1}\,du}{1 + u^2}\right]
\]

---

### A.4. Integrales exponenciales y logarítmicas

#### A.4.1 Exponenciales

\[
\int u\,e^{au}\,du = \frac{1}{a^2}(au - 1)\,e^{au} + C
\]

\[
\int u^n e^{au}\,du = \frac{1}{a}\,u^n e^{au} - \frac{n}{a}\int u^{n-1} e^{au}\,du
\]

\[
\int e^{au}\,\operatorname{sen}(bu)\,du = \frac{e^{au}}{a^2 + b^2}\left(a\,\operatorname{sen}(bu) - b\,\cos(bu)\right) + C
\]

\[
\int e^{au}\,\cos(bu)\,du = \frac{e^{au}}{a^2 + b^2}\left(a\,\cos(bu) + b\,\operatorname{sen}(bu)\right) + C
\]

#### A.4.2 Logaritmos

\[
\int \ln u\,du = u\,\ln u - u + C
\]

\[
\int \frac{du}{u\,\ln u} = \ln|\ln u| + C
\]

\[
\int u^n \ln u\,du = \frac{u^{n+1}}{(n+1)^2}\left[(n+1)\ln u - 1\right] + C
\]

\[
\int u^m \ln^n u\,du = \frac{u^{m+1}\ln^n u}{m+1} - \frac{n}{m+1}\int u^m \ln^{n-1} u\,du, \quad m \neq -1
\]

\[
\int \ln\left(u^2 + a^2\right)\,du = u\,\ln\left(u^2 + a^2\right) - 2u + 2a\,\arctan\frac{u}{a} + C
\]

\[
\int \ln\left|u^2 - a^2\right|\,du = u\,\ln\left|u^2 - a^2\right| - 2u + a\,\ln\left|\frac{u+a}{u-a}\right| + C
\]

#### A.4.3 Racionales con exponencial

\[
\int \frac{du}{a + be^u} = \frac{u}{a} - \frac{1}{a}\,\ln\left|a + be^u\right| + C
\]

---

### A.5. Integrales hiperbólicas

#### A.5.1 Funciones hiperbólicas básicas

\[
\int \operatorname{senh}\,u\,du = \cosh u + C
\]

\[
\int \cosh u\,du = \operatorname{senh}\,u + C
\]

\[
\int \tanh u\,du = \ln(\cosh u) + C
\]

\[
\int \coth u\,du = \ln|\operatorname{senh}\,u| + C
\]

\[
\int \operatorname{sech} u\,du = \arctan(\operatorname{senh}\,u) + C
\]

\[
\int \operatorname{csch} u\,du = \ln\left|\tanh\frac{u}{2}\right| + C
\]

#### A.5.2 Derivadas de funciones hiperbólicas (integrales asociadas)

\[
\int \operatorname{sech}^2 u\,du = \tanh u + C
\]

\[
\int \operatorname{csch}^2 u\,du = -\coth u + C
\]

\[
\int \operatorname{sech} u\,\tanh u\,du = -\operatorname{sech} u + C
\]

\[
\int \operatorname{csch} u\,\coth u\,du = -\operatorname{csch} u + C
\]

---

### A.6. Integrales con \(\sqrt{2au - u^2}\)

**Condiciones reales usuales:** \(a>0\), \(0\le u\le 2a\); además, exclúyanse los valores que anulen un denominador.

> Radicales asociados a expresiones cuadráticas completadas (círculo: \((u-a)^2 + a^2 - a^2 = \ldots\)).

\[
\int \sqrt{2au - u^2}\,du = \frac{u-a}{2}\,\sqrt{2au - u^2} + \frac{a^2}{2}\,\arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int u\,\sqrt{2au - u^2}\,du = \frac{2u^2 - au - 3a^2}{6}\,\sqrt{2au - u^2} + \frac{a^3}{2}\,\arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{\sqrt{2au - u^2}}{u}\,du = \sqrt{2au - u^2} + a\,\arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{\sqrt{2au - u^2}}{u^2}\,du = -\frac{2\sqrt{2au - u^2}}{u} - \arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{du}{\sqrt{2au - u^2}} = \arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{u\,du}{\sqrt{2au - u^2}} = -\sqrt{2au - u^2} + a\,\arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{u^2\,du}{\sqrt{2au - u^2}} = -\frac{u+3a}{2}\,\sqrt{2au - u^2} + \frac{3a^2}{2}\,\arccos\left(\frac{a-u}{a}\right) + C
\]

\[
\int \frac{du}{u\,\sqrt{2au - u^2}} = -\frac{\sqrt{2au - u^2}}{au} + C
\]

---

### A.7. Integrales con \(\sqrt{a^2 + u^2}\)

**Condiciones reales usuales:** \(a>0\); cuando aparezca \(u\) en el denominador, \(u\neq0\).

> Radicales de suma de cuadrados (sustitución hiperbólica o trigonométrica: \(u = a\tan\theta\)).

\[
\int \sqrt{a^2 + u^2}\,du = \frac{u}{2}\,\sqrt{a^2 + u^2} + \frac{a^2}{2}\,\ln\left|u + \sqrt{a^2 + u^2}\right| + C
\]

\[
\int u^2\,\sqrt{a^2 + u^2}\,du = \frac{u}{8}\left(a^2 + 2u^2\right)\sqrt{a^2 + u^2} - \frac{a^4}{8}\,\ln\left|u + \sqrt{a^2 + u^2}\right| + C
\]

\[
\int \frac{\sqrt{a^2 + u^2}}{u}\,du = \sqrt{a^2 + u^2} - a\,\ln\left|\frac{a + \sqrt{a^2 + u^2}}{u}\right| + C
\]

\[
\int \frac{\sqrt{a^2 + u^2}}{u^2}\,du = -\frac{\sqrt{a^2 + u^2}}{u} + \ln\left|u + \sqrt{a^2 + u^2}\right| + C
\]

\[
\int \frac{du}{\sqrt{a^2 + u^2}} = \ln\left|u + \sqrt{a^2 + u^2}\right| + C
\]

\[
\int \frac{u^2\,du}{\sqrt{a^2 + u^2}} = \frac{u}{2}\,\sqrt{a^2 + u^2} - \frac{a^2}{2}\,\ln\left|u + \sqrt{a^2 + u^2}\right| + C
\]

\[
\int \frac{du}{u\,\sqrt{a^2 + u^2}} = -\frac{1}{a}\,\ln\left|\frac{\sqrt{a^2 + u^2} + a}{u}\right| + C
\]

\[
\int \frac{du}{u^2\,\sqrt{a^2 + u^2}} = -\frac{\sqrt{a^2 + u^2}}{a^2 u} + C
\]

\[
\int \frac{du}{\left(a^2 + u^2\right)^{3/2}} = \frac{u}{a^2\,\sqrt{a^2 + u^2}} + C
\]

---

### A.8. Integrales con \(\sqrt{a^2 - u^2}\)

**Condiciones reales usuales:** \(a>0\), \(|u|\le a\); si el radical o \(u\) aparece en el denominador, deben excluirse los extremos o \(u=0\), según corresponda.

> Radicales de diferencia de cuadrados con \(a^2 > u^2\) (sustitución: \(u = a\,\operatorname{sen}\theta\)).

\[
\int \sqrt{a^2 - u^2}\,du = \frac{u}{2}\,\sqrt{a^2 - u^2} + \frac{a^2}{2}\,\operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int u^2\,\sqrt{a^2 - u^2}\,du = \frac{u}{8}\left(2u^2 - a^2\right)\sqrt{a^2 - u^2} + \frac{a^4}{8}\,\operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int \frac{\sqrt{a^2 - u^2}}{u}\,du = \sqrt{a^2 - u^2} - a\,\ln\left|\frac{a + \sqrt{a^2 - u^2}}{u}\right| + C
\]

\[
\int \frac{\sqrt{a^2 - u^2}}{u^2}\,du = -\frac{1}{u}\,\sqrt{a^2 - u^2} - \operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int \frac{u^2\,du}{\sqrt{a^2 - u^2}} = -\frac{u}{2}\,\sqrt{a^2 - u^2} + \frac{a^2}{2}\,\operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int \frac{du}{u\,\sqrt{a^2 - u^2}} = -\frac{1}{a}\,\ln\left|\frac{a + \sqrt{a^2 - u^2}}{u}\right| + C
\]

\[
\int \frac{du}{u^2\,\sqrt{a^2 - u^2}} = -\frac{\sqrt{a^2 - u^2}}{a^2 u} + C
\]

\[
\int \left(a^2 - u^2\right)^{3/2}\,du = -\frac{u}{8}\left(2u^2 - 5a^2\right)\sqrt{a^2 - u^2} + \frac{3a^4}{8}\,\operatorname{arcsen}\frac{u}{a} + C
\]

\[
\int \frac{du}{\left(a^2 - u^2\right)^{3/2}} = \frac{u}{a^2\,\sqrt{a^2 - u^2}} + C
\]

> **Nota:** En el código fuente de la app, las dos últimas fórmulas aparecen con \((a^2 + u^2)^{3/2}\) en el LaTeX; aquí se corrige a \((a^2 - u^2)^{3/2}\) para ser consistente con el tema.

---

### A.9. Integrales con \(\sqrt{u^2 - a^2}\)

**Condiciones reales usuales:** \(a>0\), \(|u|\ge a\); si el radical está en el denominador, \(|u|>a\), y si aparece \(u\) abajo, \(u\neq0\).

> Radicales con \(u^2 > a^2\) (sustitución hiperbólica o \(u = a\,\sec\theta\)).

\[
\int \sqrt{u^2 - a^2}\,du = \frac{u}{2}\,\sqrt{u^2 - a^2} - \frac{a^2}{2}\,\ln\left|u + \sqrt{u^2 - a^2}\right| + C
\]

\[
\int u^2\,\sqrt{u^2 - a^2}\,du = \frac{u}{8}\left(2u^2 - a^2\right)\sqrt{u^2 - a^2} - \frac{a^4}{8}\,\ln\left|u + \sqrt{u^2 - a^2}\right| + C
\]

\[
\int \frac{\sqrt{u^2 - a^2}}{u}\,du = \sqrt{u^2 - a^2} - a\,\operatorname{arcsec}\left|\frac{u}{a}\right| + C
\]

\[
\int \frac{\sqrt{u^2 - a^2}}{u^2}\,du = -\frac{\sqrt{u^2 - a^2}}{u} + \ln\left|u + \sqrt{u^2 - a^2}\right| + C
\]

\[
\int \frac{du}{\sqrt{u^2 - a^2}} = \ln\left|u + \sqrt{u^2 - a^2}\right| + C
\]

\[
\int \frac{u^2\,du}{\sqrt{u^2 - a^2}} = \frac{u}{2}\,\sqrt{u^2 - a^2} + \frac{a^2}{2}\,\ln\left|u + \sqrt{u^2 - a^2}\right| + C
\]

\[
\int \frac{du}{u^2\,\sqrt{u^2 - a^2}} = \frac{\sqrt{u^2 - a^2}}{a^2 u} + C
\]

\[
\int \frac{du}{\left(u^2 - a^2\right)^{3/2}} = -\frac{u}{a^2\,\sqrt{u^2 - a^2}} + C
\]

---

### A.10. Integrales con \(a + bu\)

**Condiciones:** \(a\neq0\) o \(b\neq0\) cuando la fórmula correspondiente los divide; además, todo denominador debe ser distinto de cero y todo radical real debe tener radicando no negativo.

> Expresiones racionales y radicales con denominador o radicando lineal.

#### A.10.1 Racionales

\[
\int \frac{u\,du}{a + bu} = \frac{1}{b^2}\left(a + bu - a\,\ln|a + bu|\right) + C
\]

\[
\int \frac{u^2\,du}{a + bu} = \frac{1}{2b^3}\left[(a+bu)^2 - 4a(a+bu) + 2a^2\,\ln|a+bu|\right] + C
\]

\[
\int \frac{du}{u(a + bu)} = \frac{1}{a}\,\ln\left|\frac{u}{a + bu}\right| + C
\]

\[
\int \frac{du}{u^2(a + bu)} = -\frac{1}{au} + \frac{b}{a^2}\,\ln\left|\frac{a + bu}{u}\right| + C
\]

\[
\int \frac{u\,du}{(a + bu)^2} = \frac{a}{b^2(a + bu)} + \frac{1}{b^2}\,\ln|a + bu| + C
\]

\[
\int \frac{du}{u(a + bu)^2} = \frac{1}{a(a + bu)} - \frac{1}{a^2}\,\ln\left|\frac{a + bu}{u}\right| + C
\]

\[
\int \frac{u^2\,du}{(a + bu)^2} = \frac{1}{b^3}\left(a + bu - \frac{a^2}{a + bu} - 2a\,\ln|a + bu|\right) + C
\]

#### A.10.2 Con radicales \(\sqrt{a + bu}\)

\[
\int u\,\sqrt{a + bu}\,du = \frac{2}{15b^2}(3bu - 2a)(a + bu)^{3/2} + C
\]

\[
\int \frac{u\,du}{\sqrt{a + bu}} = \frac{2}{3b^2}(bu - 2a)\,\sqrt{a + bu} + C
\]

\[
\int \frac{u^2\,du}{\sqrt{a + bu}} = \frac{2}{15b^3}\left(8a^2 + 3b^2 u^2 - 4abu\right)\sqrt{a + bu} + C
\]

\[
\int \frac{du}{u\,\sqrt{a + bu}} = \frac{1}{\sqrt{a}}\,\ln\left|\frac{\sqrt{a + bu} - \sqrt{a}}{\sqrt{a + bu} + \sqrt{a}}\right| + C, \quad \text{si } a > 0
\]

---

---

## Apéndice B: equivalencias útiles

Algunas antiderivadas pueden presentarse en formas distintas que difieren únicamente en una constante.

\[
\operatorname{arsenh}\!\left(\frac{x}{a}\right)
=\ln\left|x+\sqrt{x^2+a^2}\right|-\ln a,
\qquad a>0
\]

Por ello,

\[
\int\frac{dx}{\sqrt{x^2+a^2}}
=\operatorname{arsenh}\!\left(\frac{x}{a}\right)+C
\]

es equivalente a la forma logarítmica.

Asimismo,

\[
\int\tan x\,dx
=-\ln|\cos x|+C
=\ln|\sec x|+C.
\]

---

## Lista final de comprobación

Antes de aceptar una solución:

1. Verificar el dominio del integrando.
2. Identificar si la integral es propia o impropia.
3. Mantener consistencia de variable y límites durante una sustitución.
4. Añadir \(C\) únicamente en integrales indefinidas.
5. En áreas y volúmenes, usar distancias y áreas no negativas.
6. En series, comprobar primero que \(a_n\to0\), pero no confundir esta condición necesaria con un criterio suficiente.
7. Derivar la antiderivada obtenida siempre que sea posible.

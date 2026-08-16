---
subject: algebra
title: Fórmulas de Álgebra para Ingeniería y Ciencias de la Computación
version: 3.0
language: es
audience:
  - ingeniería
  - ciencias-de-la-computación
features:
  - catalogo
  - detalle
  - visualizaciones
  - formulas-relacionadas
  - niveles
  - complejidad-computacional
  - aplicaciones-cs
---

# Fórmulas de Álgebra — Ingeniería y Ciencias de la Computación

Catálogo estructurado para una web de fórmulas de **Álgebra**, orientado a ingeniería y ciencias de la computación.

Cada entrada incluye un **ID estable**, nivel, fórmula, descripción, una sugerencia visual cuando aporta valor y referencias a fórmulas relacionadas. La web puede usar estos campos para construir vistas de catálogo, detalle, aprendizaje y navegación entre conceptos.

## Niveles

- `fundamental`: bases algebraicas y primeros cursos.
- `intermedio`: álgebra universitaria y álgebra lineal.
- `avanzado`: herramientas especialmente útiles en ingeniería, IA, ciencia de datos, criptografía y CS.

## Tipos de visualización

`number_line`, `algebra_tiles`, `graph`, `function_transform`, `vector`, `vector_space`, `matrix`, `matrix_transform`, `geometry`, `truth_table`, `logic_gate`, `modular_clock`, `finite_field`, `polynomial_surface`, `error_correction`.

> **Importante:** estos valores son **etiquetas semánticas para el frontend**, no funciones propias de Markdown. La web puede mapear cada tipo a un componente SVG, Canvas, WebGL, una imagen estática o una animación.

Cada bloque `Visualización sugerida` utiliza ahora seis campos:

- **Tipo:** familia del componente visual que puede usar la web.
- **Modo:** lección concreta dentro del componente (p. ej. `commute`, `row_ops`, `moivre_power`).
- **Concepto visual:** fenómeno algebraico concreto que debe representarse.
- **Elementos:** objetos que deben aparecer en pantalla y qué representan.
- **Idea:** instrucción en segunda persona: qué probar y qué observar.
- **Objetivo educativo:** en una frase cercana (tú), qué descubre el usuario.
- **Interactividad sugerida:** controles o animaciones útiles; es una recomendación y puede omitirse en una implementación estática.

## Complejidad computacional

Algunas operaciones incluyen una sección opcional **Complejidad computacional**. Este campo está pensado para el enfoque de Ciencias de la Computación y no debe interpretarse como parte de la identidad algebraica en sí.

Salvo que se indique lo contrario:

- las complejidades se refieren a **algoritmos clásicos**;
- las matrices se consideran **densas**;
- el coste temporal cuenta operaciones aritméticas de forma asintótica;
- el coste espacial adicional no incluye necesariamente el almacenamiento de los datos de entrada ni de la salida;
- implementaciones especializadas, matrices dispersas, paralelismo o algoritmos asintóticamente más rápidos pueden cambiar estos costes.

La web puede ocultar este bloque en `modo_aprendizaje-basico` y mostrarlo en un modo `CS / Ingeniería`.

# Índice

1. [Números y propiedades algebraicas](#1-numeros-y-propiedades-algebraicas)
2. [Potencias, exponentes y radicales](#2-potencias,-exponentes-y-radicales)
3. [Expresiones algebraicas](#3-expresiones-algebraicas)
4. [Productos notables e identidades](#4-productos-notables-e-identidades)
5. [Factorización](#5-factorizacion)
6. [Expresiones racionales y fracciones parciales](#6-expresiones-racionales-y-fracciones-parciales)
7. [Ecuaciones](#7-ecuaciones)
8. [Inecuaciones](#8-inecuaciones)
9. [Sistemas de ecuaciones](#9-sistemas-de-ecuaciones)
10. [Funciones](#10-funciones)
11. [Polinomios](#11-polinomios)
12. [Exponenciales y logaritmos](#12-exponenciales-y-logaritmos)
13. [Números complejos](#13-numeros-complejos)
14. [Sucesiones, series finitas y recurrencias](#14-sucesiones,-series-finitas-y-recurrencias)
15. [Vectores](#15-vectores)
16. [Matrices](#16-matrices)
17. [Determinantes e inversas](#17-determinantes-e-inversas)
18. [Espacios vectoriales](#18-espacios-vectoriales)
19. [Transformaciones lineales](#19-transformaciones-lineales)
20. [Valores propios y diagonalización](#20-valores-propios-y-diagonalizacion)
21. [Ortogonalidad y proyecciones](#21-ortogonalidad-y-proyecciones)
22. [Mínimos cuadrados](#22-minimos-cuadrados)
23. [Descomposiciones de matrices](#23-descomposiciones-de-matrices)
24. [Normas matriciales y condicionamiento](#24-normas-matriciales-y-condicionamiento)
25. [Álgebra booleana](#25-algebra-booleana)
26. [Aritmética modular](#26-aritmetica-modular)
27. [Estructuras algebraicas](#27-estructuras-algebraicas)
28. [Códigos lineales y corrección de errores](#28-codigos-lineales-y-correccion-de-errores)
29. [Mapas de relaciones](#29-mapas-de-relaciones)
30. [Fronteras con otras materias](#30-fronteras-con-otras-materias)

---

# BLOQUE — FUNDAMENTOS ALGEBRAICOS

# 1. Números y propiedades algebraicas

## 1.1 Propiedad conmutativa
**ID:** `ALG-FND-001`  
**Nivel:** `fundamental`

\[
a+b=b+a;\quad ab=ba
\]

**Descripción corta:** El orden no altera la suma ni el producto.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `commute`
- **Concepto visual:** intercambio de sumandos sin cambiar el total.
- **Elementos:** dos bloques de longitudes distintas etiquetados \(a\) y \(b\), una barra de longitud total y la igualdad \(a+b=b+a\).
- **Idea:** Mueve \(a\) y \(b\) y compara las dos filas: arriba \(a+b\), abajo \(b+a\); las barras quedan igual de largas.
- **Objetivo educativo:** Vas a ver que da igual el orden: \(a+b\) y \(b+a\) suman lo mismo.
- **Interactividad sugerida:** solo botón Intercambiar; \(a\) y \(b\) fijos con longitudes distintas para que el reorden sea evidente.

### Fórmulas relacionadas

- `ALG-FND-002`
- `ALG-FND-003`

---

## 1.2 Propiedad asociativa
**ID:** `ALG-FND-002`  
**Nivel:** `fundamental`

\[
(a+b)+c=a+(b+c);\quad (ab)c=a(bc)
\]

**Descripción corta:** La agrupación no altera sumas ni productos.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `associate`
- **Concepto visual:** cambio de agrupación con cálculo en dos pasos: primero la pareja agrupada, luego el total.
- **Elementos:** tres bloques \(a,b,c\); recuadro en la pareja que se suma primero; segunda fila con el parcial fusionado y el sumando que falta; barra de total.
- **Idea:** Mueve \(a\), \(b\) y \(c\) y compara las dos filas: el recuadro agrupa distinto, pero el total es el mismo.
- **Objetivo educativo:** Vas a ver que agrupar distinto no cambia el total: \((a+b)+c\) y \(a+(b+c)\) dan lo mismo.
- **Interactividad sugerida:** solo botón de agrupación; valores fijos; mostrar el paso 1 (parcial) y el paso 2 (total).

### Fórmulas relacionadas

- `ALG-FND-001`
- `ALG-FND-003`

---

## 1.3 Propiedad distributiva
**ID:** `ALG-FND-003`  
**Nivel:** `fundamental`

\[
a(b+c)=ab+ac
\]

**Descripción corta:** Relaciona multiplicación con suma y es base de expansión y factorización.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `distribute`
- **Concepto visual:** comparación lado a lado de \(a(b+c)\) frente a \(ab+ac\).
- **Elementos:** dos paneles: rectángulo único de altura \(a\) y ancho \(b+c\); y dos rectángulos \(ab\) y \(ac\) separados con la misma altura.
- **Idea:** Mueve \(a\), \(b\) y \(c\) y compara los dos cuadros: a la izquierda un solo rectángulo; a la derecha \(ab\) y \(ac\) separados.
- **Objetivo educativo:** Vas a ver que \(a(b+c)\) es la misma área que \(ab+ac\).
- **Interactividad sugerida:** variar \(a,b,c\) y ver que ambas construcciones actualizan el mismo total.

### Fórmulas relacionadas

- `ALG-FAC-001`
- `ALG-IDN-001`

---

## 1.4 Elementos neutros
**ID:** `ALG-FND-004`  
**Nivel:** `fundamental`

\[
a+0=a;\quad a\cdot1=a
\]

**Descripción corta:** Cero es neutro aditivo y uno es neutro multiplicativo.

### Fórmulas relacionadas

- `ALG-FND-005`

---

## 1.5 Inversos aditivo y multiplicativo
**ID:** `ALG-FND-005`  
**Nivel:** `fundamental`

\[
a+(-a)=0;\quad a\cdot\frac1a=1\;(a\ne0)
\]

**Descripción corta:** Cada número tiene inverso aditivo; los no nulos, inverso multiplicativo.

### Fórmulas relacionadas

- `ALG-FND-004`

---

## 1.6 Valor absoluto
**ID:** `ALG-FND-006`  
**Nivel:** `fundamental`

\[
|x|=\begin{cases}x,&x\ge0\\-x,&x<0\end{cases}
\]

**Descripción corta:** Representa la distancia de un número al cero.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** valor absoluto como distancia entre \(x\) y \(0\) en la recta numérica.
- **Elementos:** recta con \(0\) destacado, punto \(x\), segmento solo entre \(x\) y \(0\), regla a trozos activa y resumen \(x\), distancia, \(|x|\).
- **Idea:** Mueve \(x\) a la izquierda o a la derecha y fíjate: la marca solo cuenta cuánto te alejas del origen.
- **Objetivo educativo:** Vas a ver que \(|x|\) es la distancia al cero: nunca baja de cero.
- **Interactividad sugerida:** slider para \(x\in[-5,5]\); opcionalmente un reflejo etiquetado \(-x\), nunca como distancia.

### Fórmulas relacionadas

- `ALG-FND-007`
- `ALG-EQU-008`
- `ALG-INE-004`

---

## 1.7 Distancia en la recta real
**ID:** `ALG-FND-007`  
**Nivel:** `fundamental`

\[
d(a,b)=|a-b|
\]

**Descripción corta:** Mide la distancia entre dos números reales.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** distancia entre \(a\) y \(b\) como longitud del segmento en la recta.
- **Elementos:** puntos \(a\) y \(b\) distinguibles, segmento solo entre ambos, indicador \(d(a,b)\), desarrollo \(|a-b|\) y nota \(d(a,b)=d(b,a)\).
- **Idea:** Mueve \(a\) y \(b\) y mira la longitud entre ambos: esa medida es \(|a-b|\).
- **Objetivo educativo:** Vas a ver que la distancia entre dos puntos es el largo del segmento que los une: \(|a-b|\).
- **Interactividad sugerida:** sliders independientes para \(a\) y \(b\); actualizar segmento, fórmula sustituida y resultado en tiempo real.

### Fórmulas relacionadas

- `ALG-FND-006`
- `ALG-VEC-006`

---

# 2. Potencias, exponentes y radicales

## 2.1 Producto de potencias
**ID:** `ALG-POT-001`  
**Nivel:** `fundamental`

\[
a^ma^n=a^{m+n}
\]

**Descripción corta:** Al multiplicar potencias de igual base se suman exponentes.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `power`
- **Concepto visual:** cada bloque es un factor \(a\); al multiplicar se reúnen \(n+m\) factores de la misma base.
- **Elementos:** dos grupos etiquetados (\(n\) y \(m\) factores) con operador \(\times\), secuencia unida que conserva el origen visual, y resultado \(a^{n+m}\).
- **Idea:** Cambia \(n\) y \(m\) y fíjate cómo los bloques de \(a^n\) y \(a^m\) se juntan en \(a^{n+m}\).
- **Objetivo educativo:** Vas a ver que al multiplicar potencias de la misma base, los exponentes se suman: \(a^n a^m = a^{n+m}\).
- **Interactividad sugerida:** sliders enteros \(n,m\ge 1\); actualizar factores, suma de exponentes y expresión \(a^n\cdot a^m=a^{n+m}\).

### Fórmulas relacionadas

- `ALG-POT-002`
- `ALG-POT-003`

---

## 2.2 Cociente de potencias
**ID:** `ALG-POT-002`  
**Nivel:** `fundamental`

\[
\frac{a^m}{a^n}=a^{m-n}\;(a\ne0)
\]

**Descripción corta:** Al dividir potencias de igual base se restan exponentes.

### Fórmulas relacionadas

- `ALG-POT-001`
- `ALG-POT-005`

---

## 2.3 Potencia de una potencia
**ID:** `ALG-POT-003`  
**Nivel:** `fundamental`

\[
(a^m)^n=a^{mn}
\]

**Descripción corta:** Los exponentes se multiplican.

### Fórmulas relacionadas

- `ALG-POT-001`
- `ALG-POT-004`

---

## 2.4 Potencia de producto y cociente
**ID:** `ALG-POT-004`  
**Nivel:** `fundamental`

\[
(ab)^n=a^nb^n;\quad (a/b)^n=a^n/b^n
\]

**Descripción corta:** La potencia se distribuye sobre productos y cocientes.

### Fórmulas relacionadas

- `ALG-POT-003`

---

## 2.5 Exponente cero y negativo
**ID:** `ALG-POT-005`  
**Nivel:** `fundamental`

\[
a^0=1;\quad a^{-n}=\frac1{a^n}\;(a\ne0)
\]

**Descripción corta:** Extiende las leyes de exponentes a cero y enteros negativos.

### Fórmulas relacionadas

- `ALG-POT-002`
- `ALG-POT-006`

---

## 2.6 Exponente racional
**ID:** `ALG-POT-006`  
**Nivel:** `fundamental`

\[
a^{m/n}=\sqrt[n]{a^m}
\]

**Descripción corta:** Relaciona potencias racionales y radicales.

### Condiciones

En números reales, si el índice de la raíz es par, el radicando debe ser no negativo.

### Fórmulas relacionadas

- `ALG-POT-005`
- `ALG-POT-007`

---

## 2.7 Producto y cociente de radicales
**ID:** `ALG-POT-007`  
**Nivel:** `fundamental`

\[
\sqrt[n]{ab}=\sqrt[n]a\sqrt[n]b;\quad \sqrt[n]{a/b}=\frac{\sqrt[n]a}{\sqrt[n]b}
\]

**Descripción corta:** Permite simplificar productos y cocientes de radicales bajo las condiciones del dominio.

### Fórmulas relacionadas

- `ALG-POT-006`
- `ALG-POT-008`

---

## 2.8 Racionalización por conjugados
**ID:** `ALG-POT-008`  
**Nivel:** `fundamental`

\[
\frac1{a+\sqrt b}=\frac{a-\sqrt b}{a^2-b}
\]

**Descripción corta:** Elimina radicales del denominador usando el conjugado.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `conjugate_rationalize`
- **Concepto visual:** racionalizar \(1/(a+\sqrt{b})\) multiplicando por el conjugado como forma de 1.
- **Elementos:** fracción original, paso \(\cdot(a-\sqrt{b})/(a-\sqrt{b})\), resultado \((a-\sqrt{b})/(a^2-b)\), y panel de por qué \((a+\sqrt{b})(a-\sqrt{b})=a^2-b\).
- **Idea:** Compara \(a+\sqrt{b}\) con \(a-\sqrt{b}\) y mira su producto: el resultado queda sin raíz en el medio.
- **Objetivo educativo:** Vas a ver que el conjugado ayuda a quitar una raíz del denominador.
- **Interactividad sugerida:** sliders \(a\) y \(b\ge 0\); advertir si \(a^2-b=0\); mostrar forma exacta primero y aproximación solo como apoyo.

### Fórmulas relacionadas

- `ALG-IDN-003`

---

# 3. Expresiones algebraicas

## 3.1 Polinomio de grado n
**ID:** `ALG-EXP-001`  
**Nivel:** `fundamental`

\[
P(x)=a_nx^n+a_{n-1}x^{n-1}+\cdots+a_1x+a_0
\]

**Descripción corta:** Forma general de un polinomio.

### Fórmulas relacionadas

- `ALG-POL-001`
- `ALG-POL-003`

---

## 3.2 Suma de polinomios
**ID:** `ALG-EXP-002`  
**Nivel:** `fundamental`

\[
(P+Q)(x)=\sum_k(a_k+b_k)x^k
\]

**Descripción corta:** Se suman coeficientes de términos del mismo grado.

### Fórmulas relacionadas

- `ALG-EXP-001`
- `ALG-EXP-003`

---

## 3.3 Producto de polinomios
**ID:** `ALG-EXP-003`  
**Nivel:** `fundamental`

\[
(\sum_i a_ix^i)(\sum_j b_jx^j)=\sum_k(\sum_{i+j=k}a_ib_j)x^k
\]

**Descripción corta:** Los coeficientes del producto se obtienen por convolución.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `poly_grid`
- **Concepto visual:** producto de lineales \((ax+b)(cx+d)\) con cuadrícula de términos (no áreas geométricas).
- **Elementos:** \(P(x)=ax+b\), \(Q(x)=cx+d\); cuadrícula \(2\times2\) con \(acx^2\), \(bcx\), \(adx\), \(bd\); expansión; agrupación de términos de grado 1; resultado \(acx^2+(ad+bc)x+bd\); panel opcional de convolución \([a,b]*[c,d]\).
- **Idea:** Cada término del primer polinomio se multiplica por cada término del segundo; luego se agrupan las mismas potencias de \(x\).
- **Objetivo educativo:** Vas a ver por qué \((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\) y cómo \(adx\) y \(bcx\) se suman.
- **Interactividad sugerida:** sliders \(a,b,c,d\); actualizar celdas, expansión, agrupación y resultado; sección avanzada de convolución de coeficientes.

### Complejidad computacional

Para polinomios univariables densos de grados \(n\) y \(m\), la multiplicación clásica requiere

\[
O(nm)
\]

multiplicaciones/sumas de coeficientes. Cuando ambos grados son del orden de \(n\), se resume como \(O(n^2)\). Existen algoritmos más rápidos basados en convolución/FFT para grados grandes.

### Fórmulas relacionadas

- `ALG-FND-003`
- `ALG-IDN-001`

---

# 4. Productos notables e identidades

## 4.1 Cuadrado de una suma
**ID:** `ALG-IDN-001`  
**Nivel:** `fundamental`

\[
(a+b)^2=a^2+2ab+b^2
\]

**Descripción corta:** Expansión del cuadrado de un binomio.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `square`
- **Concepto visual:** el mismo cuadrado de lado \(a+b\) medido como \((a+b)^2\) y como \(a^2+ab+ab+b^2\).
- **Elementos:** etiquetas dimensionales \(a\), \(b\) y lado \(a+b\); cuatro regiones proporcionales; agrupación explícita \(ab+ab=2ab\); identidad simbólica separada del ejemplo numérico.
- **Idea:** Un cuadrado de lado \(a+b\) tiene área \((a+b)^2\); al partir cada lado en \(a\) y \(b\) aparecen \(a^2\), dos \(ab\) y \(b^2\).
- **Objetivo educativo:** Vas a ver que el \(2\) de \(2ab\) sale porque hay dos rectángulos distintos de área \(ab\).
- **Interactividad sugerida:** sliders \(a\ge0\), \(b\ge0\); pasos de construcción (cuadrado → divisiones → regiones → agrupar \(2ab\)); proporciones geométricas reales.

### Fórmulas relacionadas

- `ALG-IDN-002`
- `ALG-FAC-003`

---

## 4.2 Cuadrado de una diferencia
**ID:** `ALG-IDN-002`  
**Nivel:** `fundamental`

\[
(a-b)^2=a^2-2ab+b^2
\]

**Descripción corta:** Expansión del cuadrado de una diferencia.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `square_minus`
- **Concepto visual:** partir de \(a^2\), restar dos franjas \(ab\) y corregir la esquina \(+b^2\).
- **Elementos:** cuadrado de lado \(a\); franjas rayadas \(-ab\); anotación de que \(b^2\) se restó dos veces; cuadrado restante \((a-b)^2\); identidad separada del ejemplo numérico.
- **Idea:** Partimos de un cuadrado de área \(a^2\); al quitar dos franjas \(ab\) y corregir \(+b^2\) queda \((a-b)^2\).
- **Objetivo educativo:** Vas a ver por qué aparece \(-2ab\) y por qué hace falta la corrección \(+b^2\).
- **Interactividad sugerida:** sliders con \(a\ge b\ge0\); pasos ( \(a^2\) → franjas → corrección → agrupación \(-2ab\) ).

### Fórmulas relacionadas

- `ALG-IDN-001`
- `ALG-FAC-003`

---

## 4.3 Diferencia de cuadrados
**ID:** `ALG-IDN-003`  
**Nivel:** `fundamental`

\[
a^2-b^2=(a-b)(a+b)
\]

**Descripción corta:** Identidad de expansión y factorización.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `diff_sq`
- **Concepto visual:** retirar \(b^2\) de \(a^2\), partir la L en dos piezas y reordenarlas en un rectángulo \((a-b)\times(a+b)\).
- **Elementos:** cuadrado \(a^2\); región rayada “quitar \(b^2\)”; piezas \(a(a-b)\) y \(b(a-b)\); reordenamiento sin cambiar áreas; dimensiones \(a-b\) y \(a+b\).
- **Idea:** Partimos de un cuadrado de lado \(a\), retiramos uno de lado \(b\) y reordenamos el área restante: queda un rectángulo \((a-b)(a+b)\).
- **Objetivo educativo:** Vas a ver de dónde salen geométricamente \(a-b\) y \(a+b\), no solo que “cambia la figura”.
- **Interactividad sugerida:** sliders \(a\ge b\ge0\); pasos hasta dividir la L; botón “Reordenar / factorizar” que mueve las mismas piezas.

### Fórmulas relacionadas

- `ALG-FAC-002`
- `ALG-POT-008`

---

## 4.4 Cubo de una suma
**ID:** `ALG-IDN-004`  
**Nivel:** `fundamental`

\[
(a+b)^3=a^3+3a^2b+3ab^2+b^3
\]

**Descripción corta:** Expansión del cubo de un binomio.

### Fórmulas relacionadas

- `ALG-IDN-006`
- `ALG-IDN-008`

---

## 4.5 Cubo de una diferencia
**ID:** `ALG-IDN-005`  
**Nivel:** `fundamental`

\[
(a-b)^3=a^3-3a^2b+3ab^2-b^3
\]

**Descripción corta:** Expansión del cubo de una diferencia.

### Fórmulas relacionadas

- `ALG-IDN-007`

---

## 4.6 Suma de cubos
**ID:** `ALG-IDN-006`  
**Nivel:** `fundamental`

\[
a^3+b^3=(a+b)(a^2-ab+b^2)
\]

**Descripción corta:** Factorización de una suma de cubos.

### Fórmulas relacionadas

- `ALG-FAC-004`

---

## 4.7 Diferencia de cubos
**ID:** `ALG-IDN-007`  
**Nivel:** `fundamental`

\[
a^3-b^3=(a-b)(a^2+ab+b^2)
\]

**Descripción corta:** Factorización de una diferencia de cubos.

### Fórmulas relacionadas

- `ALG-FAC-004`

---

## 4.8 Teorema del binomio
**ID:** `ALG-IDN-008`  
**Nivel:** `intermedio`

\[
(a+b)^n=\sum_{k=0}^{n}\binom nk a^{n-k}b^k
\]

**Descripción corta:** Generaliza las potencias de binomios.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `binomial`
- **Concepto visual:** cada término une coeficiente \(C(n,k)\), potencia de \(a\) y potencia de \(b\); la fila \(n\) de Pascal da los coeficientes.
- **Elementos:** fórmula general; triángulo de Pascal con fila \(n\) resaltada; tarjetas \(T_k\); patrón de exponentes; expansión simplificada; ejemplo numérico opcional con \(a,b\).
- **Idea:** Cada término tiene tres partes: un coeficiente binomial, una potencia de \(a\) y una potencia de \(b\); los exponentes siempre suman \(n\).
- **Objetivo educativo:** Vas a ver cómo la fila \(n\) de Pascal y los exponentes \(a^{n-k}b^k\) construyen toda la expansión.
- **Interactividad sugerida:** slider \(n\in\{0,\ldots,6\}\); seleccionar \(k\); toggles de evaluación numérica e interpretación combinatoria.

### Fórmulas relacionadas

- `ALG-SEC-006`

---

# 5. Factorización

## 5.1 Factor común
**ID:** `ALG-FAC-001`  
**Nivel:** `fundamental`

\[
ab+ac=a(b+c)
\]

**Descripción corta:** Uso inverso de la distributiva.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `distribute`
- **Concepto visual:** de \(ab+ac\) a \(a(b+c)\) uniendo dos rectángulos de la misma altura \(a\).
- **Elementos:** rectángulos \(a\times b\) y \(a\times c\); resaltado del factor común \(a\); acción Factorizar / Distribuir; ancho \(b+c\); ejemplo numérico.
- **Idea:** Los términos \(ab\) y \(ac\) comparten el factor \(a\); al unir los rectángulos, los anchos \(b\) y \(c\) se suman.
- **Objetivo educativo:** Vas a ver que factorizar es juntar áreas que comparten un lado, la inversa de distribuir.
- **Interactividad sugerida:** sliders \(a,b,c\ge0\); botones Factorizar y Distribuir conservando las mismas piezas.

### Fórmulas relacionadas

- `ALG-FND-003`

---

## 5.2 Diferencia de cuadrados
**ID:** `ALG-FAC-002`  
**Nivel:** `fundamental`

\[
a^2-b^2=(a-b)(a+b)
\]

**Descripción corta:** Factoriza una diferencia de dos cuadrados perfectos.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `diff_sq`
- **Concepto visual:** factorización de diferencia de cuadrados reordenando las mismas piezas.
- **Elementos:** misma construcción que ALG-IDN-003; énfasis en \(a(a-b)+b(a-b)=(a-b)(a+b)\).
- **Idea:** Alterna entre la L \(a^2-b^2\) y el rectángulo \((a-b)(a+b)\): son las mismas piezas.
- **Objetivo educativo:** Vas a ver que factorizar \(a^2-b^2\) es rearmar el área sobrante como un rectángulo.
- **Interactividad sugerida:** sliders \(a\ge b\ge0\); reordenar/factorizar conservando las dos piezas.

### Fórmulas relacionadas

- `ALG-IDN-003`

---

## 5.3 Trinomio cuadrado perfecto
**ID:** `ALG-FAC-003`  
**Nivel:** `fundamental`

\[
a^2\pm2ab+b^2=(a\pm b)^2
\]

**Descripción corta:** Reconoce el cuadrado de un binomio.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `square`
- **Concepto visual:** las piezas \(a^2\), \(ab\), \(ab\) y \(b^2\) encajan en un cuadrado de lado \(a+b\).
- **Elementos:** cuadrado proporcional con etiquetas; agrupación \(ab+ab=2ab\); lectura \(a^2+2ab+b^2=(a+b)^2\).
- **Idea:** Ajusta \(a\) y \(b\) y mira cómo \(a^2+2ab+b^2\) es exactamente el área del cuadrado \((a+b)^2\).
- **Objetivo educativo:** Vas a ver que un trinomio cuadrado perfecto se arma como un cuadrado completo.
- **Interactividad sugerida:** sliders \(a\ge0\), \(b\ge0\); pasos que revelan las cuatro piezas y el factor \((a+b)^2\).

### Fórmulas relacionadas

- `ALG-IDN-001`
- `ALG-IDN-002`

---

## 5.4 Suma y diferencia de cubos
**ID:** `ALG-FAC-004`  
**Nivel:** `fundamental`

\[
a^3\pm b^3=(a\pm b)(a^2\mp ab+b^2)
\]

**Descripción corta:** Patrones de factorización cúbicos.

### Fórmulas relacionadas

- `ALG-IDN-006`
- `ALG-IDN-007`

---

## 5.5 Cuadrática mediante raíces
**ID:** `ALG-FAC-005`  
**Nivel:** `fundamental`

\[
ax^2+bx+c=a(x-r_1)(x-r_2)
\]

**Descripción corta:** Factoriza una cuadrática a partir de sus raíces.

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-POL-005`

---

# 6. Expresiones racionales y fracciones parciales

## 6.1 Dominio de expresión racional
**ID:** `ALG-RAT-001`  
**Nivel:** `fundamental`

\[
R(x)=\frac{P(x)}{Q(x)},\quad Q(x)\ne0
\]

**Descripción corta:** El denominador no puede anularse.

### Fórmulas relacionadas

- `ALG-EQU-006`
- `ALG-FUN-001`

---

## 6.2 Suma de fracciones algebraicas
**ID:** `ALG-RAT-002`  
**Nivel:** `fundamental`

\[
\frac ab+\frac cd=\frac{ad+bc}{bd}
\]

**Descripción corta:** Suma mediante denominador común.

### Fórmulas relacionadas

- `ALG-RAT-003`

---

## 6.3 Producto y división de fracciones
**ID:** `ALG-RAT-003`  
**Nivel:** `fundamental`

\[
\frac ab\frac cd=\frac{ac}{bd};\quad \frac{a/b}{c/d}=\frac{ad}{bc}
\]

**Descripción corta:** Reglas de producto y cociente de fracciones algebraicas.

### Fórmulas relacionadas

- `ALG-RAT-002`

---

## 6.4 Fracciones parciales: lineales distintos
**ID:** `ALG-RAT-004`  
**Nivel:** `intermedio`

\[
\frac{P(x)}{(x-a)(x-b)}=\frac{A}{x-a}+\frac{B}{x-b}
\]

**Descripción corta:** Descompone una función racional en términos simples.

### Fórmulas relacionadas

- `ALG-RAT-005`
- `ALG-RAT-006`

---

## 6.5 Fracciones parciales: factor repetido
**ID:** `ALG-RAT-005`  
**Nivel:** `intermedio`

\[
\frac{P(x)}{(x-a)^n}=\sum_{k=1}^{n}\frac{A_k}{(x-a)^k}
\]

**Descripción corta:** Descomposición para factores lineales repetidos.

### Fórmulas relacionadas

- `ALG-RAT-004`

---

## 6.6 Fracciones parciales: cuadrático irreducible
**ID:** `ALG-RAT-006`  
**Nivel:** `intermedio`

\[
\frac{Ax+B}{x^2+px+q}
\]

**Descripción corta:** Forma asociada a un factor cuadrático irreducible.

### Fórmulas relacionadas

- `ALG-RAT-004`

---

# BLOQUE — ECUACIONES Y FUNCIONES

# 7. Ecuaciones

## 7.1 Ecuación lineal
**ID:** `ALG-EQU-001`  
**Nivel:** `fundamental`

\[
ax+b=0\Rightarrow x=-\frac ba\;(a\ne0)
\]

**Descripción corta:** Solución de una ecuación de primer grado.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** para visualizar \(ax+b=0\) se dibuja \(y=ax+b\); la solución es donde \(y=0\) (cruce con el eje \(x\)).
- **Elementos:** ecuación vs función asociada; recta \(y=ax+b\); punto solución \((-b/a,0)\); intercepto \((0,b)\); desarrollo algebraico; casos \(a=0\).
- **Idea:** Resolver \(ax+b=0\) es encontrar el \(x\) que anula la expresión; gráficamente, donde \(y=ax+b\) cruza el eje \(x\).
- **Objetivo educativo:** Vas a ver la diferencia entre la ecuación \(ax+b=0\) y la función \(y=ax+b\), y que la solución es la intersección con el eje \(x\).
- **Interactividad sugerida:** sliders \(a\) y \(b\) (incluir \(a=0\)); actualizar raíz, gráfica y pasos algebraicos.

### Fórmulas relacionadas

- `ALG-FUN-005`

---

## 7.2 Despeje de variables
**ID:** `ALG-EQU-002`  
**Nivel:** `fundamental`

\[
A=BC\Rightarrow B=\frac AC,\;C=\frac AB
\]

**Descripción corta:** Aísla una variable aplicando operaciones equivalentes.

### Fórmulas relacionadas

- `ALG-EQU-001`

---

## 7.3 Fórmula cuadrática
**ID:** `ALG-EQU-003`  
**Nivel:** `fundamental`

\[
x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}
\]

**Descripción corta:** Resuelve toda ecuación cuadrática con a distinto de cero.

### Visualización sugerida

- **Tipo:** `graph`
- **Modo:** `quadratic`
- **Concepto visual:** para visualizar \(ax^2+bx+c=0\) se dibuja \(y=ax^2+bx+c\); las raíces reales son donde \(y=0\) (cortes con el eje \(x\)).
- **Elementos:** ecuación vs función asociada; fórmula \(x=(-b\pm\sqrt{b^2-4ac})/(2a)\); discriminante \(\Delta\) con interpretación; parábola; raíces en \((x,0)\); vértice y eje de simetría; desarrollo algebraico; caso \(a=0\).
- **Idea:** Cambia \(a\), \(b\) y \(c\) y relaciona \(\Delta\), la fórmula cuadrática y los cortes de la parábola con el eje \(x\).
- **Objetivo educativo:** Vas a ver que las soluciones reales de \(ax^2+bx+c=0\) son los \(x\) donde \(y=ax^2+bx+c\) vale cero, y que \(\Delta\) determina cuántas hay.
- **Interactividad sugerida:** controles para \(a,b,c\) (\(a\neq0\)); actualizar \(\Delta\), raíces, vértice, gráfica y pasos algebraicos.

### Interpretación

El término bajo la raíz es el discriminante. Su signo determina si las raíces son reales distintas, reales dobles o complejas conjugadas.

### Fórmulas relacionadas

- `ALG-EQU-004`
- `ALG-FAC-005`
- `ALG-POL-005`

---

## 7.4 Discriminante
**ID:** `ALG-EQU-004`  
**Nivel:** `fundamental`

\[
\Delta=b^2-4ac
\]

**Descripción corta:** Determina la naturaleza de las raíces de una cuadrática real.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** \(\Delta=b^2-4ac\) clasifica el número de raíces reales; la parábola \(y=ax^2+bx+c\) solo visualiza esa clasificación (cortes con el eje \(x\)).
- **Elementos:** cálculo dinámico de \(\Delta\); leyenda fija de los tres casos; raíces numéricas; recta numérica de respaldo; gráfica de apoyo con viewport que incluye ambas raíces; presets \(\Delta>0\), \(\Delta=0\), \(\Delta<0\).
- **Idea:** Usa los ejemplos guiados o mueve \(a\), \(b\) y \(c\) y observa cómo el signo de \(\Delta\) fija el caso; la gráfica confirma el número de cortes.
- **Objetivo educativo:** Vas a ver que \(\Delta\) no calcula las raíces por sí solo, sino que determina si hay dos, una (doble) o ninguna raíz real.
- **Interactividad sugerida:** presets de los tres casos; sliders \(a,b,c\) con \(|a|\ge\varepsilon\); actualizar \(\Delta\), interpretación, raíces y gráfica.

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-COM-001`

---

## 7.5 Completar el cuadrado
**ID:** `ALG-EQU-005`  
**Nivel:** `fundamental`

\[
x^2+bx=(x+\frac b2)^2-\frac{b^2}{4}
\]

**Descripción corta:** Reescribe una cuadrática en forma de cuadrado más constante.

### Visualización sugerida

- **Tipo:** `algebra_tiles`
- **Modo:** `complete_square`
- **Concepto visual:** completar el cuadrado como construcción por áreas: partir \(bx\), añadir \((b/2)^2\), formar \((x+b/2)^2\) y restar la misma esquina.
- **Elementos:** cuadrado \(x^2\); dos rectángulos \(x\cdot(b/2)\); esquina \((b/2)^2\); pasos algebraicos; verificación numérica; restricción geométrica \(x>0\), \(b\ge0\).
- **Idea:** Avanza los pasos: dividir \(bx\), añadir \((b/2)^2\), ver el cuadrado de lado \(x+b/2\) y restar la esquina para obtener la identidad.
- **Objetivo educativo:** Vas a ver que completar el cuadrado convierte \(x^2+bx\) en \((x+b/2)^2-(b/2)^2\) añadiendo y compensando la misma área.
- **Interactividad sugerida:** pasos guiados; sliders \(x\) y \(b\ge0\); actualizar áreas y la verificación \(x^2+bx=(x+b/2)^2-(b/2)^2\).

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-IDN-001`

---

## 7.6 Ecuación racional
**ID:** `ALG-EQU-006`  
**Nivel:** `fundamental`

\[
\frac{P(x)}{Q(x)}=\frac{R(x)}{S(x)}\Rightarrow P(x)S(x)=R(x)Q(x)
\]

**Descripción corta:** Elimina denominadores respetando restricciones de dominio.

### Fórmulas relacionadas

- `ALG-RAT-001`

---

## 7.7 Ecuación radical
**ID:** `ALG-EQU-007`  
**Nivel:** `fundamental`

\[
\sqrt{f(x)}=g(x)\Rightarrow f(x)=g(x)^2
\]

**Descripción corta:** Aislar y elevar puede resolver radicales, pero requiere verificar soluciones.

### Fórmulas relacionadas

- `ALG-POT-006`

---

## 7.8 Ecuación con valor absoluto
**ID:** `ALG-EQU-008`  
**Nivel:** `fundamental`

\[
|f(x)|=a\iff f(x)=a\;\text{o}\;f(x)=-a\;(a\ge0)
\]

**Descripción corta:** Convierte una ecuación de valor absoluto en dos casos.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** \(|x|=a\) como puntos a distancia \(a\) del cero; casos \(a>0\), \(a=0\) y \(a<0\).
- **Elementos:** recta con origen; distancias \(d(-a,0)=a\) y \(d(0,a)=a\); soluciones etiquetadas; comprobación \(|\pm a|=a\); caso único en \(0\) y caso sin solución.
- **Idea:** Mueve \(a\) e interpreta \(|x|=a\) como “distancia al cero igual a \(a\)”; observa cuántas soluciones hay según el signo de \(a\).
- **Objetivo educativo:** Vas a ver que \(|x|=a\) busca puntos a distancia \(a\) del cero: dos si \(a>0\), uno si \(a=0\), ninguno si \(a<0\).
- **Interactividad sugerida:** slider \(a\) (incluir negativos); actualizar puntos, distancias, conteo de soluciones y verificación.

### Fórmulas relacionadas

- `ALG-FND-006`
- `ALG-INE-004`

---

# 8. Inecuaciones

## 8.1 Inecuación lineal
**ID:** `ALG-INE-001`  
**Nivel:** `fundamental`

\[
ax+b>0
\]

**Descripción corta:** Se resuelve aislando la variable; al dividir por un número negativo se invierte el signo.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** inecuación lineal simple como semirrecta; casos \(a=0\) dan \(\mathbb{R}\) o \(\emptyset\).
- **Elementos:** inecuación actual; resolución con inversión si \(a<0\); frontera de \(ax+b=0\); círculo abierto/cerrado; sombreado del rayo; intervalo; puntos de prueba.
- **Idea:** Cambia \(a\), \(b\) y el operador: la zona sombreada es la semirrecta solución (o todo \(\mathbb{R}\)/nada si \(a=0\)).
- **Objetivo educativo:** Vas a ver que una inecuación lineal simple representa una semirrecta; en casos especiales, todos los reales o ninguna solución.
- **Interactividad sugerida:** sliders \(a,b\); selector \(<,\le,>,\ge\); actualizar frontera, sentido, sombreado e intervalo.

### Fórmulas relacionadas

- `ALG-EQU-001`
- `ALG-INE-002`

---

## 8.2 Inecuación cuadrática
**ID:** `ALG-INE-002`  
**Nivel:** `fundamental`

\[
ax^2+bx+c>0
\]

**Descripción corta:** Se resuelve mediante raíces y análisis de signos.

### Visualización sugerida

- **Tipo:** `graph`
- **Modo:** `inequality`
- **Concepto visual:** la parábola indica el signo de \(f\); la solución final son intervalos en la recta real.
- **Elementos:** inecuación activa; \(\Delta\); orientación por \(a\); raíces; tabla de signos; gráfica de apoyo; recta numérica con extremos abiertos/cerrados; operadores \(<,\le,>,\ge\).
- **Idea:** Elige la desigualdad y mueve \(a,b,c\): usa la parábola para el signo y lee el conjunto solución en la recta.
- **Objetivo educativo:** Vas a ver que la solución es un conjunto de valores de \(x\) (intervalos), no un “área del plano”.
- **Interactividad sugerida:** selector \(<,\le,>,\ge\); sliders \(a,b,c\); actualizar raíces, signos, gráfica y solución en intervalos.

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-EQU-004`

---

## 8.3 Inecuación racional
**ID:** `ALG-INE-003`  
**Nivel:** `intermedio`

\[
\frac{P(x)}{Q(x)}>0
\]

**Descripción corta:** Se analiza el signo de numerador y denominador por intervalos.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** inecuación racional por ceros de \(P\) y \(Q\), tabla de signos e intervalos solución.
- **Elementos:** expresión concreta \(P/Q\); ceros de \(P\) vs ceros de \(Q\) (siempre excluidos); tabla de signos; recta con extremos abiertos/cerrados; ejemplos guiados.
- **Idea:** Identifica los ceros del numerador y del denominador; estos dividen la recta en intervalos de signo constante.
- **Objetivo educativo:** Vas a ver que los ceros del denominador nunca pertenecen a la solución, y que la respuesta es una unión de intervalos.
- **Interactividad sugerida:** selector \(>, <, \ge, \le\); presets; sliders de ceros; actualizar signos y solución.

### Fórmulas relacionadas

- `ALG-RAT-001`
- `ALG-INE-002`

---

## 8.4 Valor absoluto e intervalos
**ID:** `ALG-INE-004`  
**Nivel:** `fundamental`

\[
|x|<a\iff-a<x<a;\quad |x|>a\iff x<-a\;\text{o}\;x>a
\]

**Descripción corta:** Interpreta inecuaciones de valor absoluto como distancias.

### Visualización sugerida

- **Tipo:** `number_line`
- **Concepto visual:** \(|x|\square a\) como distancia al 0: interior (\(<,\le\)) o exterior (\(>,\ge\)).
- **Elementos:** inecuación y equivalencias; extremos \(\pm a\) abiertos/cerrados; sombreado interior o exterior; caso \(a=0\); nota sobre \(|x-h|\).
- **Idea:** Elige \(|x|<a\), \(\le\), \(>\) o \(\ge\) y mueve \(a\ge0\): la recta muestra la región interior o las dos exteriores.
- **Objetivo educativo:** Vas a ver que \(|x|<a\) y \(\le a\) son soluciones interiores, y que \(|x|>a\) y \(\ge a\) son exteriores simétricas.
- **Interactividad sugerida:** cuatro botones de desigualdad; slider \(a\ge0\); actualizar equivalencias, extremos e intervalos.

### Fórmulas relacionadas

- `ALG-FND-006`
- `ALG-EQU-008`

---

# 9. Sistemas de ecuaciones

## 9.1 Sistema lineal 2×2
**ID:** `ALG-SIS-001`  
**Nivel:** `fundamental`

\[
\begin{cases}a_1x+b_1y=c_1\\a_2x+b_2y=c_2\end{cases}
\]

**Descripción corta:** Dos ecuaciones lineales con dos incógnitas.

### Visualización sugerida

- **Tipo:** `graph`
- **Modo:** `system`
- **Concepto visual:** cada ecuación es una recta; la solución del sistema es el punto común (si existe).
- **Elementos:** dos rectas \(y=m_ix+b_i\) con colores distintos; clasificación secantes/paralelas/coincidentes; punto de intersección; forma general equivalente; presets.
- **Idea:** Mueve \(m_1,b_1,m_2,b_2\) y observa si las rectas se cruzan, son paralelas o coinciden.
- **Objetivo educativo:** Vas a ver que un sistema \(2\times 2\) puede tener una, ninguna o infinitas soluciones según las pendientes e interceptos.
- **Interactividad sugerida:** sliders \(m_1,b_1,m_2,b_2\); presets de los tres casos; actualizar clasificación y coordenadas.

### Fórmulas relacionadas

- `ALG-SIS-002`
- `ALG-DET-006`

---

## 9.2 Forma matricial
**ID:** `ALG-SIS-002`  
**Nivel:** `intermedio`

\[
A\mathbf x=\mathbf b
\]

**Descripción corta:** Representa un sistema lineal en notación matricial.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** traducción de ecuaciones a la forma \(A\mathbf x=\mathbf b\), con expansión de \(A\mathbf x\) y lectura de \(\det(A)\).
- **Elementos:** sistema tradicional; matriz \(A\), vector \(\mathbf x\) y vector \(\mathbf b\) etiquetados por color; expansión de \(A\mathbf x\); \(\det(A)\) e invertibilidad; \(x=A^{-1}b\) si \(\det(A)\neq0\).
- **Idea:** Edita \(A\) y \(b\): compara el sistema tradicional con la forma matricial, la expansión de \(Ax\) y el determinante.
- **Objetivo educativo:** Vas a ver que el sistema lineal se compacta en \(Ax=b\): filas de \(A\) son ecuaciones, columnas son variables; \(\det(A)\neq0\) implica solución única.
- **Interactividad sugerida:** editar celdas de \(A\) y \(b\); actualizar a la vez sistema, \(Ax=b\), expansión y \(\det(A)\).

### Fórmulas relacionadas

- `ALG-MAT-001`
- `ALG-SIS-003`

---

## 9.3 Matriz aumentada
**ID:** `ALG-SIS-003`  
**Nivel:** `intermedio`

\[
[A\mid\mathbf b]
\]

**Descripción corta:** Reúne coeficientes y términos independientes.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `augmented_map`
- **Concepto visual:** separación entre coeficientes y términos independientes en \([A\mid\mathbf b]\); cada fila es una ecuación.
- **Elementos:** construcción \(A,\mathbf b\Rightarrow[A\mid b]\); matriz aumentada con barra vertical etiquetada; selección de fila; sistema completo reconstruido con ecuación activa resaltada; etapa opcional de operaciones de fila.
- **Idea:** Elige \(R_1\) o \(R_2\) y edita \(A\) y \(b\): ves a la vez la matriz, la fila activa y el sistema completo.
- **Objetivo educativo:** Vas a ver que la matriz aumentada \([A\mid b]\) reúne coeficientes y términos independientes: cada fila es una ecuación del sistema.
- **Interactividad sugerida:** editar celdas de \(A\) y \(b\); seleccionar fila; opcionalmente aplicar \(R_i\leftrightarrow R_j\), escalar o sumar filas.

### Fórmulas relacionadas

- `ALG-SIS-004`

---

## 9.4 Operaciones elementales de fila
**ID:** `ALG-SIS-004`  
**Nivel:** `intermedio`

\[
R_i\leftrightarrow R_j;\;R_i\leftarrow cR_i;\;R_i\leftarrow R_i+cR_j
\]

**Descripción corta:** Base de la eliminación de Gauss y Gauss-Jordan.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `row_ops`
- **Concepto visual:** operaciones elementales sobre \([A\mid b]\) que preservan el conjunto solución (base de Gauss / Gauss-Jordan).
- **Elementos:** matriz aumentada editable; sistema original vs transformado; operación simbólica con antes/después; metas guiadas (cero bajo pivote, escalonada, RREF); det y complejidad en bloques secundarios.
- **Idea:** Elige \(R_i\leftrightarrow R_j\), \(cR_i\) o \(R_i+cR_j\) con filas y \(c\); aplica y compara el sistema con el original.
- **Objetivo educativo:** Vas a ver que las operaciones elementales cambian la forma del sistema, pero no su solución: así se construye Gauss y Gauss-Jordan.
- **Interactividad sugerida:** elegir tipo de operación, filas origen/destino y \(c\); resaltar filas; metas guiadas; bloques opcionales de \(\det(A)\) y complejidad.

### Complejidad computacional

Usar operaciones elementales para eliminación de Gauss sobre una matriz densa cuadrada \(n\times n\) requiere, con el algoritmo clásico, \(O(n^3)\) tiempo. El almacenamiento de la matriz es \(O(n^2)\). La sustitución hacia atrás, una vez obtenida la forma triangular, cuesta \(O(n^2)\).

### Fórmulas relacionadas

- `ALG-SIS-005`
- `ALG-DET-005`

---

## 9.5 Criterio de Rouché-Capelli
**ID:** `ALG-SIS-005`  
**Nivel:** `intermedio`

\[
\operatorname{rank}(A)=\operatorname{rank}([A|b])=n
\quad\text{o}\quad
\operatorname{rank}(A)=\operatorname{rank}([A|b])<n
\quad\text{o}\quad
\operatorname{rank}(A)\neq\operatorname{rank}([A|b])
\]

**Descripción corta:** Clasifica sistemas según rangos y número de incógnitas.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `rank_compare`
- **Concepto visual:** dos comparaciones consecutivas — \(\operatorname{rank}(A)\) vs \(\operatorname{rank}([A|b])\), y si coinciden vs \(n\) — para una / infinitas / ninguna solución.
- **Elementos:** \([A\mid b]\) editable; contadores \(\operatorname{rank}(A)\), \(\operatorname{rank}([A|b])\), \(n\); cadena de razonamiento; presets de los tres casos; reducción opcional a escalonada; nota sobre \(\det(A)=0\).
- **Idea:** Carga los tres casos o edita \([A\mid b]\): observa rank(A), rank([A|b]) y \(n\), y sigue las dos comparaciones del criterio.
- **Objetivo educativo:** Vas a ver el criterio completo: rangos distintos ⇒ sin solución; rangos iguales a \(n\) ⇒ una; rangos iguales y menores que \(n\) ⇒ infinitas.
- **Interactividad sugerida:** presets (única / infinitas / incompatible); editar celdas; toggle «cómo se obtiene el rango».

### Fórmulas relacionadas

- `ALG-ESP-005`
- `ALG-ESP-007`

---

# 10. Funciones

## 10.1 Dominio
**ID:** `ALG-FUN-001`  
**Nivel:** `fundamental`

\[
\operatorname{Dom}(f)=\{x:f(x)\text{ está definida}\}
\]

**Descripción corta:** Conjunto de entradas permitidas.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** dominio como conjunto de entradas x permitidas; expresión, gráfica y recta del dominio sincronizadas.
- **Elementos:** selector polinómica / racional / radical / logarítmica; control \(b\); cadena expresión→condición→restricción→Dom(f); gráfica con asíntota vertical; recta real del dominio con círculos abiertos en exclusiones.
- **Idea:** Mueve \(b\) y observa cómo el valor excluido, la asíntota y el dominio se desplazan juntos (en \(f(x)=1/(x-b)\)).
- **Objetivo educativo:** Vas a ver que el dominio es el conjunto de \(x\) para los cuales \(f(x)\) está definida, no solo un «hueco» en la gráfica.
- **Interactividad sugerida:** cambiar tipo de función y \(b\); ver \(\mathbb{R}\setminus\{b\}\) y notación de intervalos en tiempo real.

### Fórmulas relacionadas

- `ALG-RAT-001`
- `ALG-FUN-002`

---

## 10.2 Composición
**ID:** `ALG-FUN-002`  
**Nivel:** `fundamental`

\[
(f\circ g)(x)=f(g(x))
\]

**Descripción corta:** Aplica una función al resultado de otra.

### Visualización sugerida

- **Tipo:** `function_transform`
- **Concepto visual:** composición como cadena \(x_0\to g(x_0)\to f(g(x_0))\) con valores numéricos.
- **Elementos:** flujo superior con bloques; etapas Entrada / Aplicar g / Componer; gráficas de \(g\) y \(f\); selector \(f\circ g\mid g\circ f\); validación de dominio.
- **Idea:** Mueve \(x_0\) y sigue su recorrido: primero entra en \(g\), y el resultado \(g(x_0)\) entra después en \(f\).
- **Objetivo educativo:** Vas a ver que componer funciones significa usar la salida de una función como entrada de otra.
- **Interactividad sugerida:** deslizador \(x_0\); recorrer los tres estados; cambiar el orden de composición.

### Fórmulas relacionadas

- `ALG-FUN-003`
- `ALG-TRA-005`

---

## 10.3 Función inversa
**ID:** `ALG-FUN-003`  
**Nivel:** `fundamental`

\[
f^{-1}(f(x))=x
\]

**Descripción corta:** Deshace la acción de una función invertible.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** inversa como intercambio \((x,y)\leftrightarrow(y,x)\) y reflexión respecto de \(y=x\).
- **Elementos:** gráficas de \(f\), \(y=x\) y el reflejo; puntos \(P\) y \(P'\); prueba de la línea horizontal; botón «Restringir dominio»; caso lineal \(mx+b\).
- **Idea:** Compara la curva y su reflejo; la diagonal punteada es el espejo \(y=x\). Restringe el dominio de \(x^2\) cuando no sea inyectiva.
- **Objetivo educativo:** Vas a ver que una función inversa deshace la original intercambiando entradas y salidas, y que solo existe (como función) cuando \(f\) es inyectiva.
- **Interactividad sugerida:** mover \(x_0\); alternar cuadrática/lineal; restringir dominio \(x\ge 0\).

### Fórmulas relacionadas

- `ALG-FUN-002`
- `ALG-TRA-006`

---

## 10.4 Operaciones con funciones
**ID:** `ALG-FUN-004`  
**Nivel:** `fundamental`

\[
(f+g)(x)=f(x)+g(x);\;(fg)(x)=f(x)g(x)
\]

**Descripción corta:** Define operaciones algebraicas punto a punto.

### Fórmulas relacionadas

- `ALG-FUN-001`

---

## 10.5 Recta
**ID:** `ALG-FUN-005`  
**Nivel:** `fundamental`

\[
y=mx+b;\quad m=\frac{y_2-y_1}{x_2-x_1}
\]

**Descripción corta:** Forma pendiente-intersección y cálculo de pendiente.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** pendiente e intercepto de una recta \(y=mx+b\).
- **Elementos:** ecuación en vivo; punto principal \(P=(0,b)\); triángulo de pendiente con \(\Delta x=1\), \(\Delta y=m\); clasificación creciente/decreciente/horizontal; corte en \(x\) secundario.
- **Idea:** Mueve \(m\) y observa la subida respecto al avance. Mueve \(b\) y observa cómo la recta se desplaza sin cambiar su inclinación.
- **Objetivo educativo:** Vas a ver que en \(y=mx+b\), \(m\) controla la inclinación y \(b\) indica dónde corta al eje \(y\).
- **Interactividad sugerida:** deslizadores para \(m\) y \(b\); mostrar \(\Delta y/\Delta x\) sobre el triángulo anclado en \((0,b)\).

### Fórmulas relacionadas

- `ALG-EQU-001`
- `ALG-FUN-006`

---

## 10.6 Paralelismo y perpendicularidad
**ID:** `ALG-FUN-006`  
**Nivel:** `fundamental`

\[
m_1=m_2;\quad m_1m_2=-1
\]

**Descripción corta:** Criterios de pendiente para rectas no verticales.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** paralelismo (\(m_1=m_2\)) y perpendicularidad (\(m_1m_2=-1\)) mediante pendientes.
- **Elementos:** ecuaciones \(r_1\), \(r_2\); controles \(m_1,b_1,m_2,b_2\); clasificación paralelas/coincidentes/perpendiculares/secantes; punto de intersección \(I\); ángulo \(\theta\); acciones «Hacer paralelas» / «Hacer perpendiculares».
- **Idea:** Mueve \(m_1\) y \(m_2\). Observa cuándo las rectas dejan de cortarse o cuándo forman exactamente \(90^\circ\).
- **Objetivo educativo:** Vas a ver que dos rectas no verticales son paralelas cuando tienen la misma pendiente, y perpendiculares cuando sus pendientes son recíprocas y de signo opuesto.
- **Interactividad sugerida:** modificar las cuatro pendientes/interceptos; comprobar \(m_1m_2\) y \(\theta\) en tiempo real.

### Fórmulas relacionadas

- `ALG-FUN-005`
- `ALG-VEC-005`

---

## 10.7 Traslaciones
**ID:** `ALG-FUN-007`  
**Nivel:** `fundamental`

\[
g(x)=f(x-h)+k
\]

**Descripción corta:** Desplaza la gráfica horizontal y verticalmente.

### Visualización sugerida

- **Tipo:** `function_transform`
- **Concepto visual:** traslación \(g(x)=f(x-h)+k\) que conserva la forma.
- **Elementos:** \(f(x)=x^2\) y \(g\); puntos \(P\) y \(P'\); vector \(\vec t=(h,k)\); solo controles \(h\) y \(k\); descripciones dinámicas de dirección.
- **Idea:** Mueve \(h\) y observa cómo todos los puntos se desplazan. Aunque aparece \(x-h\), un \(h\) positivo mueve hacia la derecha.
- **Objetivo educativo:** Vas a ver que en \(g(x)=f(x-h)+k\), \(h\) desplaza horizontalmente y \(k\) verticalmente; la forma no cambia.
- **Interactividad sugerida:** deslizadores de \(h\) y \(k\) con superposición de original y trasladada.

### Fórmulas relacionadas

- `ALG-FUN-008`

---

## 10.8 Escalamiento y reflexión
**ID:** `ALG-FUN-008`  
**Nivel:** `fundamental`

\[
g(x)=af(bx);\quad -f(x);\quad f(-x)
\]

**Descripción corta:** Escala y refleja gráficas.

### Visualización sugerida

- **Tipo:** `function_transform`
- **Concepto visual:** \(g(x)=af(bx)\): \(a\) controla vertical (escala/reflexión en el eje \(x\)) y \(b\) horizontal (factor \(1/|b|\), reflexión en el eje \(y\)).
- **Elementos:** original y transformada; función base asimétrica por defecto; puntos \(P\) y \(P'\); acciones Restablecer / Reflejar respecto a \(x\) / Reflejar respecto a \(y\).
- **Idea:** Mueve \(a\) y \(b\). Atención: el efecto horizontal es inverso. Si \(|b|=2\), el ancho se reduce a la mitad.
- **Objetivo educativo:** Vas a ver que en \(g(x)=af(bx)\), \(a\) modifica verticalmente y \(b\) horizontalmente; los signos negativos producen reflexiones.
- **Interactividad sugerida:** controles \(a\) y \(b\); selector de función base; resumen dinámico de transformaciones.

### Fórmulas relacionadas

- `ALG-FUN-007`

---

# 11. Polinomios

## 11.1 División euclidiana
**ID:** `ALG-POL-001`  
**Nivel:** `intermedio`

\[
P(x)=D(x)Q(x)+R(x),\quad \deg R<\deg D
\]

**Descripción corta:** Divide polinomios con cociente y residuo.

### Fórmulas relacionadas

- `ALG-POL-002`

---

## 11.2 Teorema del residuo
**ID:** `ALG-POL-002`  
**Nivel:** `intermedio`

\[
P(x)\div(x-a)\Rightarrow R=P(a)
\]

**Descripción corta:** El residuo de dividir por x-a es P(a).

### Fórmulas relacionadas

- `ALG-POL-003`

---

## 11.3 Teorema del factor
**ID:** `ALG-POL-003`  
**Nivel:** `intermedio`

\[
P(a)=0\iff(x-a)\text{ es factor de }P(x)
\]

**Descripción corta:** Relaciona raíces y factores lineales.

### Fórmulas relacionadas

- `ALG-FAC-005`
- `ALG-POL-004`

---

## 11.4 Factorización por raíces
**ID:** `ALG-POL-004`  
**Nivel:** `intermedio`

\[
P(x)=a_n\prod_{k=1}^{n}(x-r_k)
\]

**Descripción corta:** Factorización completa sobre un campo que contenga las raíces.

### Fórmulas relacionadas

- `ALG-POL-003`
- `ALG-COM-007`

---

## 11.5 Relaciones de Viète
**ID:** `ALG-POL-005`  
**Nivel:** `intermedio`

\[
r_1+r_2=-\frac ba;\quad r_1r_2=\frac ca
\]

**Descripción corta:** Relaciona raíces y coeficientes de una cuadrática.

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-FAC-005`

---

## 11.6 Teorema de raíces racionales
**ID:** `ALG-POL-006`  
**Nivel:** `intermedio`

\[
r=p/q\Rightarrow p|a_0,\;q|a_n
\]

**Descripción corta:** Reduce los candidatos racionales a raíces de un polinomio entero.

### Fórmulas relacionadas

- `ALG-POL-003`

---


## 11.7 Polinomio multivariable
**ID:** `ALG-POL-007`  
**Nivel:** `intermedio`

Un polinomio en variables \(x_1,\ldots,x_n\) puede escribirse como

\[
P(x_1,\ldots,x_n)
=
\sum_{\boldsymbol\alpha}c_{\boldsymbol\alpha}
 x_1^{\alpha_1}\cdots x_n^{\alpha_n},
\]

donde \(\boldsymbol\alpha=(\alpha_1,\ldots,\alpha_n)\) es un multiíndice de enteros no negativos.

**Descripción corta:** Generaliza los polinomios de una variable a expresiones con varias variables algebraicas.

### Visualización sugerida
- **Tipo:** `polynomial_surface`
- **Concepto visual:** \(P(x,y)=ax^2+bxy+cy^2\) como mapa \((x,y)\mapsto P(x,y)\) con curvas de nivel y punto interactivo.
- **Elementos:** ecuación viva; ejes \(x,y\); leyenda de color centrada en 0; curvas \(P=k\); punto \((x_0,y_0)\); sustitución y contribuciones de monomios; presets cuenco/silla/\(xy\).
- **Idea:** Mueve el punto sobre el plano para ver cómo cambian \(x\), \(y\) y \(P(x,y)\). Después modifica \(a\), \(b\) y \(c\).
- **Objetivo educativo:** Vas a ver que un polinomio de dos variables recibe un punto \((x,y)\) y le asigna un valor; el color representa \(P(x,y)\).
- **Interactividad sugerida:** punto interactivo; «Mostrar términos»; aislar \(ax^2\), \(bxy\), \(cy^2\); vista 2D/3D y avanzada matricial.

### Fórmulas relacionadas
- `ALG-EXP-001`
- `ALG-POL-008`
- `ALG-POL-009`
- `ALG-POL-010`

---

## 11.8 Multiíndice y grado total
**ID:** `ALG-POL-008`  
**Nivel:** `intermedio`

Para el monomio

\[
x_1^{\alpha_1}\cdots x_n^{\alpha_n},
\]

su grado total es

\[
|\boldsymbol\alpha|
=
\alpha_1+\cdots+\alpha_n.
\]

El grado total de un polinomio no nulo es

\[
\deg P
=
\max_{c_{\boldsymbol\alpha}\neq0}
|\boldsymbol\alpha|.
\]

**Descripción corta:** Mide el grado de términos con varias variables sumando sus exponentes.

### Visualización sugerida
- **Tipo:** `algebra_tiles`
- **Modo:** `degree`
- **Concepto visual:** multiíndice \(\alpha=(\alpha_1,\alpha_2)\) → monomio \(x^{\alpha}\) → grado total \(|\alpha|\).
- **Elementos:** \(\alpha\) visible; flujo \((3,2)\to x^3y^2\to 3+2=5\); bloques por variable; modos 2/3 variables; ejemplo de polinomio con \(\deg P=\max|\alpha|\).
- **Idea:** Cambia los exponentes y observa cómo se actualizan el multiíndice, el monomio y su grado total.
- **Objetivo educativo:** Vas a ver que un multiíndice guarda los exponentes de un monomio y que el grado total se obtiene sumando sus componentes.
- **Interactividad sugerida:** sliders enteros \(\alpha_i\in\mathbb N_0\); coeficiente opcional; sección «Del monomio al polinomio».

### Fórmulas relacionadas
- `ALG-POL-007`
- `ALG-POL-009`

---

## 11.9 Polinomio homogéneo
**ID:** `ALG-POL-009`  
**Nivel:** `intermedio`

Un polinomio es homogéneo de grado \(d\) si todos sus monomios no nulos tienen grado total \(d\).

Ejemplo:

\[
P(x,y)=x^2+3xy+2y^2
\]

es homogéneo de grado \(2\).

Una propiedad característica es

\[
P(tx_1,\ldots,tx_n)=t^dP(x_1,\ldots,x_n).
\]

**Descripción corta:** Todos los términos poseen el mismo grado total.

### Visualización sugerida
- **Tipo:** `polynomial_surface`
- **Concepto visual:** homogeneidad = mismo grado total + identidad \(P(tx,ty)=t^d P(x,y)\).
- **Elementos:** términos con grados 2,2,2; \(d=2\) calculado; punto \((x_0,y_0)\) y escalado \((tx_0,ty_0)\); comprobación \(P(tx,ty)\stackrel{?}{=}t^2P\); contraste con un polinomio no homogéneo.
- **Idea:** Mueve \(t\) y observa qué ocurre al escalar simultáneamente \(x\) e \(y\): el valor se multiplica por \(t^2\).
- **Objetivo educativo:** Vas a ver que un polinomio es homogéneo cuando todos sus términos tienen el mismo grado total, y entonces \(P(tx,ty)=t^d P(x,y)\).
- **Interactividad sugerida:** sliders \(t,a,b,c\); selector homogéneo / no homogéneo; mapa con rayo desde el origen.

### Fórmulas relacionadas
- `ALG-POL-007`
- `ALG-POL-008`

---

## 11.10 Sistema de ecuaciones polinómicas
**ID:** `ALG-POL-010`  
**Nivel:** `avanzado`

Un sistema polinómico tiene la forma

\[
\begin{cases}
P_1(x_1,\ldots,x_n)=0\\
\vdots\\
P_m(x_1,\ldots,x_n)=0.
\end{cases}
\]

**Descripción corta:** Busca puntos que satisfacen simultáneamente varios polinomios.

### Visualización sugerida
- **Tipo:** `graph`
- **Modo:** `poly_system`
- **Concepto visual:** sistema \(y=P(x)\), \(y=Q(x)\); soluciones = intersecciones = raíces de \(P-Q=0\).
- **Elementos:** ecuaciones vivas; curvas etiquetadas; puntos \(S_i=(x_i,y_i)\); reducción \(Ax^2+Bx+C=0\); vistas gráfica / \(P-Q\) / algebraica; casos 0/1/2/infinitas.
- **Idea:** Mueve los coeficientes de \(P\) y \(Q\). Observa cómo las intersecciones aparecen, desaparecen o se desplazan.
- **Objetivo educativo:** Vas a ver que una solución debe satisfacer ambas ecuaciones a la vez: gráficamente donde se cortan las curvas, y algebraicamente donde \(P(x)-Q(x)=0\).
- **Interactividad sugerida:** controles agrupados \(a_1,b_1,c_1\) y \(a_2,b_2,c_2\); seleccionar \(S_1,S_2\); verificar \(P(x_i)=Q(x_i)\).

### Fórmulas relacionadas
- `ALG-SIS-001`
- `ALG-POL-007`
- `ALG-POL-011`

---

## 11.11 Resultante y matriz de Sylvester
**ID:** `ALG-POL-011`  
**Nivel:** `avanzado`

Para dos polinomios univariables \(f(x)\) y \(g(x)\), la resultante puede definirse mediante la matriz de Sylvester:

\[
\operatorname{Res}(f,g)
=
\det S(f,g).
\]

Sobre un cuerpo, y considerando raíces en una clausura algebraica:

\[
\operatorname{Res}(f,g)=0
\iff
f\text{ y }g\text{ tienen una raíz común}.
\]

**Descripción corta:** Detecta algebraicamente si dos polinomios comparten una raíz y sirve como herramienta de eliminación.

### Visualización sugerida
- **Tipo:** `matrix`
- **Concepto visual:** \(S(f,g)\) construida desde coeficientes; \(\operatorname{Res}(f,g)=\det S(f,g)\); cero ⟺ raíz común.
- **Elementos:** \(f,g\) cuadráticos; filas desplazadas; matriz 4×4; \(\operatorname{Res}\); gráficas con raíces en el eje \(x\); presets con/sin raíz común.
- **Idea:** Modifica los coeficientes de \(f\) y \(g\). Observa cómo cambia la matriz y su determinante. Cuando la resultante llega a cero, comparten una raíz.
- **Objetivo educativo:** Vas a ver que la matriz de Sylvester organiza los coeficientes de dos polinomios y que su determinante es la resultante.
- **Interactividad sugerida:** controles de coeficientes (no celdas arbitrarias); construcción paso a paso; distinguir raíz común de una intersección \(f=g\) cualquiera.

### Fórmulas relacionadas
- `ALG-POL-003`
- `ALG-POL-010`
- `ALG-DET-001`
- `ALG-DET-002`

---

# 12. Exponenciales y logaritmos

## 12.1 Función exponencial
**ID:** `ALG-LOG-001`  
**Nivel:** `fundamental`

\[
f(x)=a^x,\quad a>0,\;a\ne1
\]

**Descripción corta:** Modelo básico de crecimiento y decrecimiento exponencial.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** crecimiento o decrecimiento de \(a^x\) según la base; multiplicación por \(a\) en cada unidad de \(x\).
- **Elementos:** gráfica de \(y=a^x\), puntos \((0,1)\), \((1,a)\), \((-1,1/a)\), punto móvil \((x,a^x)\), asíntota \(y=0\), tabla de valores y presets \(a=2,1/2,3,10\).
- **Idea:** Mueve la base \(a\) y el valor \(x\). Observa el punto \((0,1)\), la asíntota \(y=0\) y cómo la curva crece o decrece.
- **Objetivo educativo:** Vas a ver que cada avance de una unidad en \(x\) multiplica el valor por la base \(a\): si \(a>1\) crece y si \(0<a<1\) decrece.
- **Interactividad sugerida:** deslizadores solo para Base \((a)\) y Valor \((x)\); botones de bases típicas; lectura tipo máquina \(x\to a^x\).

### Fórmulas relacionadas

- `ALG-LOG-002`
- `ALG-LOG-007`

---

## 12.2 Definición de logaritmo
**ID:** `ALG-LOG-002`  
**Nivel:** `fundamental`

\[
\log_bx=y\iff b^y=x
\]

**Descripción corta:** El logaritmo es la inversa de la exponenciación.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** equivalencia \(\log_b(x)=y\iff b^y=x\) y reflexión de inversas respecto a \(y=x\).
- **Elementos:** curvas \(y=\log_b x\) y \(y=b^x\), diagonal \(y=x\), puntos \(P=(x,y)\) y \(Q=(y,x)\), asíntota \(x=0\), puntos \((1,0)\) y \((b,1)\), máquina \(x\xrightarrow{\log_b}y\xrightarrow{b^{(\cdot)}}x\).
- **Idea:** Mueve la base y el valor \(x\). Observa que si \(\log_b(x)=y\), entonces \(b^y=x\). Los puntos \((x,y)\) y \((y,x)\) se reflejan respecto a \(y=x\).
- **Objetivo educativo:** Vas a ver que el logaritmo responde: “¿a qué exponente elevo la base para obtener \(x\)?”.
- **Interactividad sugerida:** deslizadores Base \((b)\) y Valor \((x)\); opción «¿Qué exponente?» y valores notables.

### Condiciones

\[
b>0,\quad b\ne1,\quad x>0
\]

### Fórmulas relacionadas

- `ALG-LOG-001`
- `ALG-LOG-003`

---

## 12.3 Logaritmo de producto
**ID:** `ALG-LOG-003`  
**Nivel:** `fundamental`

\[
\log_b(xy)=\log_bx+\log_by
\]

**Descripción corta:** Convierte productos en sumas.

### Fórmulas relacionadas

- `ALG-LOG-004`
- `ALG-LOG-005`

---

## 12.4 Logaritmo de cociente
**ID:** `ALG-LOG-004`  
**Nivel:** `fundamental`

\[
\log_b(x/y)=\log_bx-\log_by
\]

**Descripción corta:** Convierte cocientes en diferencias.

### Fórmulas relacionadas

- `ALG-LOG-003`
- `ALG-LOG-005`

---

## 12.5 Logaritmo de potencia
**ID:** `ALG-LOG-005`  
**Nivel:** `fundamental`

\[
\log_b(x^r)=r\log_bx
\]

**Descripción corta:** Convierte exponentes en factores.

### Fórmulas relacionadas

- `ALG-LOG-003`

---

## 12.6 Cambio de base
**ID:** `ALG-LOG-006`  
**Nivel:** `fundamental`

\[
\log_bx=\frac{\log_ax}{\log_ab}
\]

**Descripción corta:** Expresa un logaritmo en cualquier base válida.

### Fórmulas relacionadas

- `ALG-LOG-002`

---

## 12.7 Crecimiento/decrecimiento exponencial
**ID:** `ALG-LOG-007`  
**Nivel:** `fundamental`

\[
P(t)=P_0e^{kt}
\]

**Descripción corta:** k positivo produce crecimiento; k negativo, decrecimiento.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** el signo de \(k\) determina crecimiento, constancia o decrecimiento en \(P(t)=P_0e^{kt}\).
- **Elementos:** curva \(P(t)\), punto inicial \(P(0)=P_0\), punto móvil \((t,P(t))\), modo comparar \(+k\) y \(-k\), asíntota \(P=0\) en decrecimiento, ejemplos de contexto.
- **Idea:** Mueve \(k\): positivo crece, negativo decrece y \(k=0\) queda constante. Mueve \(t\) y observa \(P(t)=P_0 e^{kt}\).
- **Objetivo educativo:** Vas a ver que el signo de \(k\) decide si la cantidad crece, decrece o permanece constante.
- **Interactividad sugerida:** deslizadores \(P_0\), \(k\) y \(t\); botón Comparar \(+k\) y \(-k\); presets de población, interés y desintegración.

### Fórmulas relacionadas

- `ALG-LOG-001`

---

# 13. Números complejos

## 13.1 Forma rectangular
**ID:** `ALG-COM-001`  
**Nivel:** `fundamental`

\[
i^2=-1;\quad z=a+bi
\]

**Descripción corta:** Representación cartesiana de un número complejo.

### Visualización sugerida

- **Tipo:** `vector`
- **Concepto visual:** descomposición cartesiana \(z=a+bi\leftrightarrow(a,b)\).
- **Elementos:** ejes Re\((z)\)/Im\((z)\), punto \(z\), vector, componentes \(a\) y \(bi\), proyecciones.
- **Idea:** Arrastra el punto o cambia \(a\) y \(b\): observa cómo Re\((z)\) e Im\((z)\) fijan la posición.
- **Objetivo educativo:** Vas a ver que un número complejo \(z=a+bi\) es un punto del plano: \(a\) es horizontal y \(b\) vertical.
- **Interactividad sugerida:** arrastrar \(z\); sliders \(a\), \(b\); mostrar componentes.

### Fórmulas relacionadas

- `ALG-COM-002`
- `ALG-COM-003`

---

## 13.2 Conjugado
**ID:** `ALG-COM-002`  
**Nivel:** `fundamental`

\[
\bar z=a-bi;\quad z\bar z=|z|^2
\]

**Descripción corta:** Refleja un complejo respecto del eje real.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `conjugate`
- **Concepto visual:** conjugación como reflexión \((a,b)	o(a,-b)\) respecto del eje real.
- **Elementos:** vectores \(z\) y \(ar z\), línea de reflexión, módulo opcional, \(zar z=|z|^2\).
- **Idea:** Arrastra \(z\) y observa cómo \(ar z\) se mueve simétricamente al otro lado del eje real.
- **Objetivo educativo:** Vas a ver que el conjugado conserva la parte real y cambia el signo de la imaginaria: reflejo respecto del eje real.
- **Interactividad sugerida:** arrastrar \(z\); Conjugar / Mostrar módulo / Ver propiedad.

### Fórmulas relacionadas

- `ALG-COM-003`

---

## 13.3 Módulo
**ID:** `ALG-COM-003`  
**Nivel:** `fundamental`

\[
|z|=\sqrt{a^2+b^2}
\]

**Descripción corta:** Distancia del complejo al origen.

### Visualización sugerida

- **Tipo:** `vector`
- **Concepto visual:** módulo como distancia al origen \(|z|=\sqrt{a^2+b^2}\).
- **Elementos:** vector \(0	o z\), triángulo de componentes opcional, circunferencia de módulo opcional.
- **Idea:** Arrastra \(z\) y observa la longitud del vector; activa las componentes para ver el triángulo.
- **Objetivo educativo:** Vas a ver que el módulo mide la distancia de \(z\) al origen: \(|z|=\sqrt{a^2+b^2}\).
- **Interactividad sugerida:** arrastrar \(z\); toggles de componentes, circunferencia y argumento.

### Fórmulas relacionadas

- `ALG-COM-004`
- `ALG-VEC-002`

---

## 13.4 Forma polar y exponencial
**ID:** `ALG-COM-004`  
**Nivel:** `intermedio`

\[
z=r(\cos\theta+i\sin\theta)=re^{i\theta}
\]

**Descripción corta:** Representa un complejo por magnitud y ángulo.

### Visualización sugerida

- **Tipo:** `vector`
- **Concepto visual:** equivalencia \(a+bi=r(\cos	heta+i\sin	heta)=re^{i	heta}\).
- **Elementos:** circunferencia de radio \(r\), vector, arco \(	heta\), proyecciones \(r\cos	heta\), \(r\sin	heta\).
- **Idea:** Mueve \(r\) y \(	heta\): al fijar \(r\) y girar \(	heta\), el punto recorre una circunferencia.
- **Objetivo educativo:** Vas a ver que en forma polar \(z\) se describe por distancia \(r\) y ángulo \(	heta\), equivalentes a \(a+bi\) y \(re^{i	heta}\).
- **Interactividad sugerida:** sliders \(r\), \(	heta\); arrastrar \(z\); grados/radianes; animar rotación.

### Fórmulas relacionadas

- `ALG-COM-005`
- `ALG-COM-006`

---

## 13.5 Fórmula de Euler
**ID:** `ALG-COM-005`  
**Nivel:** `intermedio`

\[
e^{i\theta}=\cos\theta+i\sin\theta
\]

**Descripción corta:** Conecta exponenciales complejas con trigonometría.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `euler`
- **Concepto visual:** \(e^{i	heta}=\cos	heta+i\sin	heta\) como punto del círculo unitario.
- **Elementos:** círculo unitario grande, vector, arco \(	heta\), proyecciones \(\cos	heta\) y \(\sin	heta\), identidad de Euler en \(	hetapprox\pi\).
- **Idea:** Mueve \(	heta\) y observa ángulo, coordenadas y el número complejo a la vez.
- **Objetivo educativo:** Vas a ver cómo \(	heta\) determina un punto del círculo unitario mediante \(\cos	heta\) y \(\sin	heta\): ese punto es \(e^{i	heta}\).
- **Interactividad sugerida:** slider \(	heta\); arrastrar en el círculo; ángulos notables; animar.

### Fórmulas relacionadas

- `ALG-COM-004`
- `ALG-COM-006`

---

## 13.6 De Moivre
**ID:** `ALG-COM-006`  
**Nivel:** `intermedio`

\[
(\cos\theta+i\sin\theta)^n=\cos(n\theta)+i\sin(n\theta)
\]

**Descripción corta:** Eleva complejos en forma polar.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `moivre_power`
- **Concepto visual:** De Moivre: \(r	o r^n\) y \(	heta	o n	heta\) al comparar \(z\) con \(z^n\).
- **Elementos:** vectores \(z\) y \(z^n\), arcos \(	heta\) y \(n	heta\), circunferencias de radios \(r\) y \(r^n\), potencias intermedias opcionales.
- **Idea:** Cambia \(r\), \(	heta\) y \(n\): compara \(z\) con \(z^n\) y mira longitud y ángulo.
- **Objetivo educativo:** Vas a ver que elevar un complejo a \(n\) multiplica el ángulo por \(n\) y eleva el módulo a la potencia \(n\).
- **Interactividad sugerida:** modos círculo unitario / módulo libre; potencias intermedias; arrastrar \(z\).

### Fórmulas relacionadas

- `ALG-COM-007`

---

## 13.7 Raíces n-ésimas
**ID:** `ALG-COM-007`  
**Nivel:** `intermedio`

\[
w_k=r^{1/n}e^{i(\theta+2\pi k)/n}
\]

**Descripción corta:** Las raíces se distribuyen uniformemente en una circunferencia.

### Visualización sugerida

- **Tipo:** `geometry`
- **Concepto visual:** raíces \(n\)-ésimas con módulo \(r^{1/n}\) y ángulos \((	heta+2\pi k)/n\).
- **Elementos:** vector \(z\), circunferencias \(r\) y \(r^{1/n}\), raíces \(w_k\), polígono, arcos \(	heta\), \(\phi_k\) y \(2\pi/n\).
- **Idea:** Cambia \(n\), \(r\) y \(	heta\): las raíces forman un polígono regular separado por \(2\pi/n\).
- **Objetivo educativo:** Vas a ver que las \(n\) raíces tienen módulo \(r^{1/n}\) y se distribuyen uniformemente alrededor del origen.
- **Interactividad sugerida:** controles \(n\), \(r\), \(	heta\), \(k\); construir raíces; arrastrar \(z\).

### Fórmulas relacionadas

- `ALG-COM-006`
- `ALG-POL-004`

---

# 14. Sucesiones, series finitas y recurrencias

## 14.1 Sucesión aritmética
**ID:** `ALG-SEC-001`  
**Nivel:** `fundamental`

\[
a_n=a_1+(n-1)d
\]

**Descripción corta:** Cada término difiere del anterior por una constante.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** sucesión discreta con diferencia constante \(d\) entre términos consecutivos.
- **Elementos:** puntos \((n,a_n)\), anotaciones \(+d\), fórmula general y selección de término.
- **Idea:** Cambia \(a_1\), \(d\) y \(N\): observa cómo \(d\) determina el salto constante entre todos los términos.
- **Objetivo educativo:** Vas a ver que en una sucesión aritmética cada término se obtiene sumando siempre la misma cantidad \(d\).
- **Interactividad sugerida:** sliders \(a_1\), \(d\), \(N\); mostrar diferencias y tendencia.

### Fórmulas relacionadas

- `ALG-SEC-002`

---

## 14.2 Suma aritmética
**ID:** `ALG-SEC-002`  
**Nivel:** `fundamental`

\[
S_n=\frac n2(a_1+a_n)
\]

**Descripción corta:** Suma de los primeros n términos de una sucesión aritmética.

### Fórmulas relacionadas

- `ALG-SEC-001`

---

## 14.3 Sucesión geométrica
**ID:** `ALG-SEC-003`  
**Nivel:** `fundamental`

\[
a_n=a_1r^{n-1}
\]

**Descripción corta:** Cada término se obtiene multiplicando por una razón constante.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** sucesión discreta generada por multiplicación por la razón \(r\).
- **Elementos:** puntos \((n,a_n)\), anotaciones \(\times r\), comportamientos según \(r\).
- **Idea:** Cambia \(a_1\), \(r\) y \(N\): observa si los términos crecen, disminuyen, alternan o permanecen constantes.
- **Objetivo educativo:** Vas a ver que cada término de una sucesión geométrica se obtiene multiplicando el anterior por la misma razón \(r\).
- **Interactividad sugerida:** sliders \(a_1\), \(r\), \(N\); mostrar razón; seleccionar término.

### Fórmulas relacionadas

- `ALG-SEC-004`
- `ALG-SEC-005`

---

## 14.4 Suma geométrica finita
**ID:** `ALG-SEC-004`  
**Nivel:** `fundamental`

\[
S_n=a_1\frac{1-r^n}{1-r}\;(r\ne1)
\]

**Descripción corta:** Suma de n términos de una sucesión geométrica.

### Fórmulas relacionadas

- `ALG-SEC-003`
- `ALG-SEC-005`

---

## 14.5 Serie geométrica infinita
**ID:** `ALG-SEC-005`  
**Nivel:** `intermedio`

\[
\sum_{k=0}^{\infty}ar^k=\frac a{1-r},\quad |r|<1
\]

**Descripción corta:** Suma de una serie geométrica convergente.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** contraste entre términos \(a_n=ar^n\) y sumas parciales \(S_n\), con límite \(S_\infty\) si \(|r|<1\).
- **Elementos:** dos paneles (términos y sumas), línea \(S_\infty\), leyenda semántica.
- **Idea:** Cambia \(a\), \(r\) y \(N\): compara cómo los términos se apagan mientras las sumas se estabilizan en \(S_\infty=a/(1-r)\).
- **Objetivo educativo:** Vas a ver que, si \(|r|<1\), los términos \(a_n=ar^n\) se acercan a 0 y las sumas parciales \(S_n\) a un límite.
- **Interactividad sugerida:** sliders \(a\), \(r\), \(N\); ocultar \(S_\infty\) si \(|r|\ge1\).

### Fórmulas relacionadas

- `ALG-SEC-004`

---

## 14.6 Linealidad de sumatorias
**ID:** `ALG-SEC-006`  
**Nivel:** `intermedio`

\[
\sum(a_k+b_k)=\sum a_k+\sum b_k;\quad \sum ca_k=c\sum a_k
\]

**Descripción corta:** Reglas fundamentales de notación sigma.

### Fórmulas relacionadas

- `ALG-IDN-008`

---

## 14.7 Recurrencia lineal de orden 2
**ID:** `ALG-SEC-007`  
**Nivel:** `avanzado`

\[
a_n=c_1a_{n-1}+c_2a_{n-2};\quad r^2-c_1r-c_2=0
\]

**Descripción corta:** Usa una ecuación característica para resolver recurrencias homogéneas.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** construcción término a término \(a_n=ba_{n-1}+ca_{n-2}\) con flechas de dependencia.
- **Elementos:** gráfica discreta, contribución de los dos términos previos, paso a paso, ecuación característica opcional.
- **Idea:** Cambia \(a_0\), \(a_1\), \(b\) y \(c\), y selecciona un término para ver cómo se obtiene de los dos anteriores.
- **Objetivo educativo:** Vas a ver que una recurrencia de orden 2 construye cada término utilizando los dos anteriores.
- **Interactividad sugerida:** sliders \(a_0\), \(a_1\), \(b\), \(c\), \(N\); siguiente término; ecuación característica.

### Fórmulas relacionadas

- `ALG-EQU-003`
- `ALG-EIG-005`

---

# BLOQUE — ÁLGEBRA LINEAL

# 15. Vectores

## 15.1 Vector en R^n
**ID:** `ALG-VEC-001`  
**Nivel:** `intermedio`

\[
\mathbf v=(v_1,\ldots,v_n)^T
\]

**Descripción corta:** Objeto fundamental del álgebra lineal.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `rn`
- **Concepto visual:** vector como lista ordenada de componentes y como flecha desde el origen.
- **Elementos:** notación \(v=(v_1,\ldots,v_n)\in\mathbb{R}^n\); en \(\mathbb{R}^2\) flecha con proyecciones \(v_1,v_2\) y descomposición \(v=v_1e_1+v_2e_2\); selector de dimensión; barras de componentes para \(n>3\).
- **Idea:** Cambia las componentes o arrastra el extremo del vector y observa cómo sus coordenadas determinan completamente la flecha.
- **Objetivo educativo:** Vas a ver que un vector en \(\mathbb{R}^n\) queda determinado por sus \(n\) componentes. Cada componente indica cuánto avanza el vector en una dirección coordenada.
- **Interactividad sugerida:** selector \(\mathbb{R}^2,\mathbb{R}^3,\mathbb{R}^4,\mathbb{R}^n\); sliders de componentes; arrastre del extremo en 2D.

### Fórmulas relacionadas

- `ALG-VEC-002`
- `ALG-VEC-007`

---

## 15.2 Norma euclidiana
**ID:** `ALG-VEC-002`  
**Nivel:** `intermedio`

\[
\|\mathbf v\|_2=\sqrt{\sum_i v_i^2}
\]

**Descripción corta:** Longitud euclidiana de un vector.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `norm`
- **Concepto visual:** norma como longitud del vector y distancia al origen (Pitágoras).
- **Elementos:** un solo vector \(u=(x,y)\), triángulo rectángulo de componentes, etiqueta \(\|u\|\) y círculo opcional de radio \(\|u\|\).
- **Idea:** Arrastra el extremo del vector o cambia \(x\) e \(y\) y observa cómo \(\|u\|\) se obtiene con el teorema de Pitágoras.
- **Objetivo educativo:** Vas a ver que la norma euclidiana mide la longitud del vector, es decir, su distancia al origen.
- **Interactividad sugerida:** arrastrar el extremo; sliders \(x,y\); actualizar fórmula \(\|u\|=\sqrt{x^2+y^2}\) en tiempo real.

### Fórmulas relacionadas

- `ALG-VEC-003`
- `ALG-VEC-006`

---

## 15.3 Vector unitario
**ID:** `ALG-VEC-003`  
**Nivel:** `intermedio`

\[
\hat{\mathbf v}=\frac{\mathbf v}{\|\mathbf v\|}
\]

**Descripción corta:** Normaliza un vector no nulo.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `unit`
- **Concepto visual:** normalización que conserva la dirección y fija la longitud en 1.
- **Elementos:** vector \(u\), vector unitario \(\hat u\) sobre la misma semirrecta, círculo unitario y etiquetas \(\|u\|\), \(\|\hat u\|=1\).
- **Idea:** Arrastra \(u\) y compara su extremo con \(\hat u\): el vector normalizado siempre termina sobre el círculo unitario.
- **Objetivo educativo:** Vas a ver que normalizar un vector conserva su dirección, pero cambia su longitud a 1.
- **Interactividad sugerida:** arrastrar \(u\); sliders de componentes; manejar el caso \(u=0\) (no normalizable).

### Fórmulas relacionadas

- `ALG-VEC-002`

---

## 15.4 Producto punto
**ID:** `ALG-VEC-004`  
**Nivel:** `intermedio`

\[
\mathbf u\cdot\mathbf v=\sum_i u_iv_i=\|u\|\|v\|\cos\theta
\]

**Descripción corta:** Mide alineación y permite definir ángulos y ortogonalidad.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `dot`
- **Concepto visual:** producto punto como proyección y alineación: \(u\cdot v=\|u\|\|v\|\cos\theta\).
- **Elementos:** vectores \(u\) y \(v\), arco \(\theta\), proyección de \(v\) sobre \(u\), valor \(u\cdot v\) y clasificación del signo.
- **Idea:** Arrastra \(u\) y \(v\). Observa cómo cambian el ángulo, la proyección y \(u\cdot v\): positivo si apuntan en direcciones similares, cero si son perpendiculares y negativo si apuntan en sentidos opuestos.
- **Objetivo educativo:** Vas a ver que el producto punto mide cuánto apunta un vector en la dirección del otro.
- **Interactividad sugerida:** arrastre de ambos extremos; presets agudo/90°/obtuso; actualizar proyección y fórmula en tiempo real.

### Fórmulas relacionadas

- `ALG-VEC-005`
- `ALG-ORT-001`
- `ALG-ORT-002`

---

## 15.5 Ángulo entre vectores
**ID:** `ALG-VEC-005`  
**Nivel:** `intermedio`

\[
\cos\theta=\frac{u\cdot v}{\|u\|\|v\|}
\]

**Descripción corta:** Obtiene el ángulo entre dos vectores no nulos.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `angle`
- **Concepto visual:** ángulo menor entre dos vectores, \(\theta\in[0^\circ,180^\circ]\).
- **Elementos:** dos vectores, arco y sector de \(\theta\), clasificación agudo/recto/obtuso, escala \(0^\circ\)–\(180^\circ\) y \(\cos\theta\).
- **Idea:** Arrastra \(u\) y \(v\) y observa el arco \(\theta\). Acércalos, hazlos perpendiculares o colócalos en sentidos opuestos para recorrer ángulos entre \(0^\circ\) y \(180^\circ\).
- **Objetivo educativo:** Vas a ver que el ángulo entre dos vectores depende de sus direcciones, no de sus longitudes.
- **Interactividad sugerida:** arrastre de ambos; presets \(0^\circ,45^\circ,90^\circ,135^\circ,180^\circ\); actualizar \(\theta\) y \(\cos\theta\).

### Fórmulas relacionadas

- `ALG-VEC-004`

---

## 15.6 Distancia euclidiana
**ID:** `ALG-VEC-006`  
**Nivel:** `intermedio`

\[
d(u,v)=\|u-v\|_2
\]

**Descripción corta:** Distancia entre dos puntos/vectores.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `distance`
- **Concepto visual:** distancia como longitud del segmento entre extremos y norma de la diferencia.
- **Elementos:** puntas de \(u\) y \(v\), segmento \(d(u,v)\), catetos \(\Delta x,\Delta y\) y triángulo rectángulo.
- **Idea:** Arrastra \(u\) y \(v\). Observa cómo \(\Delta x\) y \(\Delta y\) forman los catetos de un triángulo rectángulo cuya hipotenusa mide \(\|u-v\|\).
- **Objetivo educativo:** Vas a ver que la distancia entre dos vectores es la longitud del segmento que une sus extremos.
- **Interactividad sugerida:** arrastre de ambos; toggle de componentes; presets horizontal/vertical/diagonal/coincidentes.

### Fórmulas relacionadas

- `ALG-VEC-002`
- `ALG-LSQ-001`

---

## 15.7 Combinación lineal
**ID:** `ALG-VEC-007`  
**Nivel:** `intermedio`

\[
w=c_1v_1+\cdots+c_kv_k
\]

**Descripción corta:** Construye nuevos vectores a partir de un conjunto dado.

### Visualización sugerida

- **Tipo:** `vector`
- **Modo:** `combo`
- **Concepto visual:** combinación lineal como escalar y luego sumar: \(w=\alpha u+\beta v\).
- **Elementos:** \(u,v\), versiones escaladas \(\alpha u,\beta v\), construcción cabeza-cola/paralelogramo y resultante \(w\).
- **Idea:** Mueve \(\alpha\) y \(\beta\). Observa cómo cambian \(\alpha u\) y \(\beta v\) y cómo su suma determina la flecha naranja \(w\).
- **Objetivo educativo:** Vas a ver que una combinación lineal primero escala los vectores y después suma los resultados.
- **Interactividad sugerida:** sliders \(\alpha,\beta\in[-2,2]\); arrastre de \(u,v\); presets \(u+v\), \(u-v\), solo \(u\), solo \(v\), promedio.

### Fórmulas relacionadas

- `ALG-ESP-001`
- `ALG-ESP-002`

---

# 16. Matrices

## 16.1 Matriz m×n
**ID:** `ALG-MAT-001`  
**Nivel:** `intermedio`

\[
A=(a_{ij})_{m\times n}
\]

**Descripción corta:** Arreglo rectangular de escalares.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `size`
- **Concepto visual:** estructura fila-columna y notación \(a_{ij}\) de una matriz \(m\times n\).
- **Elementos:** controles \(m,n\); matriz con índices; selección de \(a_{ij}\) con fila y columna resaltadas; clasificación rectangular/cuadrada/fila/columna.
- **Idea:** Cambia \(m\) y \(n\), y selecciona una entrada \(a_{ij}\) para identificar su fila \(i\) y su columna \(j\).
- **Objetivo educativo:** Vas a ver que una matriz \(m\times n\) organiza valores en \(m\) filas y \(n\) columnas.
- **Interactividad sugerida:** sliders \(m,n\); clic en celdas e índices de fila/columna.

### Fórmulas relacionadas

- `ALG-MAT-002`
- `ALG-SIS-002`

---

## 16.2 Suma de matrices
**ID:** `ALG-MAT-002`  
**Nivel:** `intermedio`

\[
(A+B)_{ij}=a_{ij}+b_{ij}
\]

**Descripción corta:** Suma entrada a entrada para matrices del mismo tamaño.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `sum`
- **Concepto visual:** suma entrada a entrada en la misma posición.
- **Elementos:** \(A+B=A+B\) con selección sincronizada de \((i,j)\) y modo elemento a elemento.
- **Idea:** Cambia una entrada de \(A\) o \(B\), o selecciona una celda para ver cómo se calcula la entrada correspondiente de \(A+B\).
- **Objetivo educativo:** Vas a ver que sumar matrices significa sumar las entradas que ocupan la misma posición.
- **Interactividad sugerida:** selección de posición; toggle “Ver elemento a elemento”.

### Fórmulas relacionadas

- `ALG-MAT-003`

---

## 16.3 Producto por escalar
**ID:** `ALG-MAT-003`  
**Nivel:** `intermedio`

\[
(cA)_{ij}=ca_{ij}
\]

**Descripción corta:** Escala cada entrada de la matriz.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `scale`
- **Concepto visual:** el mismo escalar \(c\) multiplica todas las entradas.
- **Elementos:** operación \(c\times A=cA\); selección de celda; etiqueta del efecto de \(c\); modo elemento a elemento.
- **Idea:** Cambia \(c\) o una entrada de \(A\) y observa cómo cada celda de \(cA\) se actualiza. Selecciona una celda para ver su cálculo.
- **Objetivo educativo:** Vas a ver que un escalar multiplica todas las entradas de una matriz sin cambiar sus dimensiones.
- **Interactividad sugerida:** slider \(c\); selección de celda; toggle elemento a elemento.

### Fórmulas relacionadas

- `ALG-MAT-004`

---

## 16.4 Producto de matrices
**ID:** `ALG-MAT-004`  
**Nivel:** `intermedio`

\[
(AB)_{ij}=\sum_k a_{ik}b_{kj}
\]

**Descripción corta:** Cada entrada surge del producto punto fila-columna.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `product`
- **Concepto visual:** cada entrada de \(AB\) es el producto punto de una fila de \(A\) con una columna de \(B\).
- **Elementos:** \(A\times B=AB\) con dimensiones compatibles; clic en \(c_{ij}\) resalta fila y columna; construcción paso a paso.
- **Idea:** Selecciona una celda de \(AB\) y observa qué fila y columna la construyen. Edita \(A\) o \(B\) y mira cómo cambia el resultado.
- **Objetivo educativo:** Vas a ver que cada entrada de \(AB\) se construye con una fila de \(A\) y una columna de \(B\).
- **Interactividad sugerida:** clic directo en celdas de \(AB\); comparación opcional \(AB/BA\).

### Condiciones

El número de columnas de \(A\) debe coincidir con el número de filas de \(B\). En general, \(AB\ne BA\).

### Complejidad computacional

Para

\[
A\in\mathbb R^{m\times n},\qquad
B\in\mathbb R^{n\times p},
\]

el algoritmo clásico utiliza

\[
O(mnp)
\]

operaciones aritméticas. Para matrices densas cuadradas \(n\times n\), esto se convierte en \(O(n^3)\).

### Fórmulas relacionadas

- `ALG-TRA-002`
- `ALG-DEC-001`

---

## 16.5 Matriz identidad
**ID:** `ALG-MAT-005`  
**Nivel:** `intermedio`

\[
AI=IA=A
\]

**Descripción corta:** Elemento neutro de la multiplicación matricial.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `identity`
- **Concepto visual:** \(I_mA=A\) y \(AI_n=A\); los unos de la diagonal seleccionan y los ceros anulan.
- **Elementos:** modos izquierda/derecha; \(I\) con diagonal destacada; cálculo de una celda del resultado.
- **Idea:** Selecciona una celda del resultado y observa qué fila y columna participan en su cálculo. Cambia entre \(I_mA\) y \(AI_n\).
- **Objetivo educativo:** Vas a ver que la matriz identidad actúa como el número 1: al multiplicar, los unos de la diagonal conservan los valores de \(A\) y los ceros eliminan los demás términos.
- **Interactividad sugerida:** tabs izquierda/derecha; selección de celda del resultado; dimensiones dinámicas.

### Fórmulas relacionadas

- `ALG-DET-005`

---

## 16.6 Transpuesta
**ID:** `ALG-MAT-006`  
**Nivel:** `intermedio`

\[
(A^T)_{ij}=a_{ji};\quad(AB)^T=B^TA^T
\]

**Descripción corta:** Intercambia filas por columnas.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `transpose`
- **Concepto visual:** las filas de \(A\) se convierten en columnas de \(A^T\); \((i,j)\mapsto(j,i)\).
- **Elementos:** matriz rectangular \(m\times n\) y \(A^T\) \(n\times m\); correspondencia de celdas/filas/columnas.
- **Idea:** Selecciona una entrada, una fila o una columna de \(A\) y observa dónde aparece en \(A^T\). Cambia \(m\) y \(n\) y observa que \(m\times n\) se convierte en \(n\times m\).
- **Objetivo educativo:** Vas a ver que transponer una matriz convierte sus filas en columnas: la entrada que estaba en \((i,j)\) aparece en \((j,i)\).
- **Interactividad sugerida:** selección de celda/fila/columna; ejemplo inicial rectangular no simétrico.

### Fórmulas relacionadas

- `ALG-ORT-003`
- `ALG-LSQ-002`

---

## 16.7 Matriz simétrica
**ID:** `ALG-MAT-007`  
**Nivel:** `intermedio`

\[
A^T=A
\]

**Descripción corta:** Matriz cuadrada igual a su transpuesta.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `symmetric`
- **Concepto visual:** simetría respecto de la diagonal: \(a_{ij}=a_{ji}\) y \(A=A^T\).
- **Elementos:** matriz cuadrada; pares reflejados; modos construir/comprobar; \(A^T\) secundaria.
- **Idea:** Selecciona o modifica una entrada fuera de la diagonal y observa su pareja reflejada. En “Construir simétrica”, modificar una entrada actualiza su reflejo. En “Comprobar matriz”, puedes romper la igualdad y detectar dónde deja de ser simétrica.
- **Objetivo educativo:** Vas a ver que una matriz simétrica se refleja respecto de su diagonal principal: cada entrada \(a_{ij}\) coincide con \(a_{ji}\).
- **Interactividad sugerida:** modos construir/comprobar; control \(n\); reparación de simetría.

### Fórmulas relacionadas

- `ALG-EIG-006`
- `ALG-DEC-003`

---

# 17. Determinantes e inversas

## 17.1 Determinante 2×2
**ID:** `ALG-DET-001`  
**Nivel:** `intermedio`

\[
\det\begin{pmatrix}a&b\\c&d\end{pmatrix}=ad-bc
\]

**Descripción corta:** Factor de escala orientado de área en 2D.

### Visualización sugerida

- **Tipo:** `geometry`
- **Concepto visual:** determinante como área orientada/factor de escala en 2D.
- **Elementos:** vectores columna de una matriz 2×2 formando un paralelogramo y valor \(ad-bc\).
- **Idea:** Mueve u y v: observa cómo cambian el área y el signo del determinante. Si los vectores quedan alineados, el determinante se vuelve 0.
- **Objetivo educativo:** Vas a ver que el determinante de una matriz 2×2 mide el área orientada del paralelogramo generado por sus columnas.
- **Interactividad sugerida:** arrastrar los vectores columna; intercambiar u↔v; ver el colapso cuando det=0; actualizar área, signo y valor del determinante.

### Fórmulas relacionadas

- `ALG-DET-004`
- `ALG-ESP-002`

---

## 17.2 Expansión por cofactores
**ID:** `ALG-DET-002`  
**Nivel:** `intermedio`

\[
\det(A)=\sum_j a_{ij}C_{ij}
\]

**Descripción corta:** Expande un determinante por una fila o columna.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** expansión del determinante mediante menores y cofactores.
- **Elementos:** matriz con una fila/columna elegida, celda \(a_{ij}\), submatriz menor correspondiente y signo de cofactor.
- **Idea:** Elige una fila o columna y selecciona una entrada: verás qué fila y columna se eliminan para construir su menor.
- **Objetivo educativo:** Vas a ver que el determinante puede construirse sumando los términos de una fila o columna, cada uno multiplicado por su cofactor.
- **Interactividad sugerida:** matriz 3×3 editable; elegir fila/columna; seleccionar término; ver menor, signo, cofactor y la suma completa.

### Complejidad computacional

La expansión recursiva ingenua por cofactores tiene crecimiento factorial, aproximadamente

\[
O(n!).
\]

Por ello es útil sobre todo como fórmula teórica o para matrices pequeñas. En cómputo numérico, el determinante de una matriz densa se obtiene normalmente mediante factorizaciones como LU en \(O(n^3)\).

### Fórmulas relacionadas

- `ALG-DET-001`
- `ALG-DET-003`

---

## 17.3 Determinante de producto
**ID:** `ALG-DET-003`  
**Nivel:** `intermedio`

\[
\det(AB)=\det(A)\det(B)
\]

**Descripción corta:** El factor de escala total se multiplica bajo composición.

### Visualización sugerida

- **Tipo:** `geometry`
- **Concepto visual:** multiplicación de factores de escala de área/volumen.
- **Elementos:** figura inicial, transformación por \(B\), luego por \(A\), y factores \(\det B\), \(\det A\), \(\det(AB)\).
- **Idea:** Edita A y B y observa cómo el cuadrado unidad pasa primero por B y después por A. Compara el área final con \(\det(A)\det(B)\).
- **Objetivo educativo:** Vas a ver que aplicar B y luego A multiplica sucesivamente el área: el factor total es \(\det(A)\cdot\det(B)\).
- **Interactividad sugerida:** matrices 2×2 editables; etapas S → B(S) → AB(S); comprobar \(\det(AB)=\det(A)\det(B)\).

### Fórmulas relacionadas

- `ALG-MAT-004`
- `ALG-DET-004`

---

## 17.4 Criterio de invertibilidad
**ID:** `ALG-DET-004`  
**Nivel:** `intermedio`

\[
A\text{ invertible}\iff\det(A)\ne0
\]

**Descripción corta:** Caracteriza matrices cuadradas invertibles.

### Visualización sugerida

- **Tipo:** `geometry`
- **Concepto visual:** invertibilidad como preservación de dimensión/área no nula.
- **Elementos:** cuadrícula transformada por una matriz y paralelogramo de columnas; caso \(\det A\neq0\) frente a \(\det A=0\).
- **Idea:** Mueve las columnas hasta hacerlas paralelas y observa cómo \(\det(A)\), el rango y la existencia de \(A^{-1}\) cambian al mismo tiempo.
- **Objetivo educativo:** Vas a ver que una matriz 2×2 es invertible mientras sus columnas generen área. Cuando se alinean, el área cae a cero y la transformación pierde una dimensión.
- **Interactividad sugerida:** sliders/arrastre; presets invertible/casi singular/singular; cadena de equivalencias; rango e invertibilidad.

### Fórmulas relacionadas

- `ALG-DET-005`
- `ALG-ESP-002`

---

## 17.5 Inversa de matriz 2×2
**ID:** `ALG-DET-005`  
**Nivel:** `intermedio`

\[
A^{-1}=\frac1{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}
\]

**Descripción corta:** Invierte una matriz 2×2 no singular.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** inversa como transformación que deshace a \(A\).
- **Elementos:** vector o cuadrícula original, resultado después de \(A\) y recuperación después de \(A^{-1}\).
- **Idea:** Edita A, sigue el intercambio de la diagonal, el cambio de signos y el factor \(1/\det(A)\). Al final comprueba que \(AA^{-1}=I\).
- **Objetivo educativo:** Vas a ver cómo se construye \(A^{-1}\) paso a paso y por qué realmente deshace la acción de A.
- **Interactividad sugerida:** pasos determinante → intercambia → signos → escala; verificar \(AA^{-1}=I\); bloquear el caso singular.

### Fórmulas relacionadas

- `ALG-DET-004`
- `ALG-SIS-002`
- `ALG-TRA-006`

---

## 17.6 Regla de Cramer
**ID:** `ALG-DET-006`  
**Nivel:** `intermedio`

\[
x_i=\frac{\det(A_i)}{\det(A)}
\]

**Descripción corta:** Resuelve sistemas cuadrados no singulares mediante determinantes.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** regla de Cramer como reemplazo de columnas.
- **Elementos:** matriz \(A\), vector \(b\), matrices \(A_i\) con la columna reemplazada y cocientes de determinantes.
- **Idea:** Edita A y b, elige x o y y observa cómo se forma \(A_x\) o \(A_y\). Después compara su determinante con \(\det(A)\).
- **Objetivo educativo:** Vas a ver cómo Cramer obtiene cada incógnita reemplazando su columna por el vector b y comparando determinantes.
- **Interactividad sugerida:** sistema 2×2 editable; resolver x/y/ver todo; fracciones exactas; caso \(\Delta=0\) sin afirmar «sin solución».

### Fórmulas relacionadas

- `ALG-SIS-001`
- `ALG-DET-005`

---

# 18. Espacios vectoriales

## 18.1 Espacio generado
**ID:** `ALG-ESP-001`  
**Nivel:** `intermedio`

\[
\operatorname{span}(v_1,\ldots,v_k)=\{\sum_i c_iv_i\}
\]

**Descripción corta:** Conjunto de todas las combinaciones lineales.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** span como conjunto de todos los puntos alcanzables por combinaciones lineales.
- **Elementos:** uno o dos vectores generadores en 2D/3D y la recta/plano que producen.
- **Idea:** Mueve \(s\) y \(t\) para recorrer el espacio generado. Después arrastra \(u\) o \(v\) y observa cuándo el plano se reduce a una sola recta.
- **Objetivo educativo:** Vas a ver que el espacio generado contiene todas las combinaciones posibles de los vectores.
- **Interactividad sugerida:** modo «una combinación / todas»; retícula o recta según dimensión; presets (un vector, independientes, dependientes, cero).

### Fórmulas relacionadas

- `ALG-VEC-007`
- `ALG-ESP-002`

---

## 18.2 Independencia lineal
**ID:** `ALG-ESP-002`  
**Nivel:** `intermedio`

\[
\sum_i c_iv_i=0\Rightarrow c_1=\cdots=c_k=0
\]

**Descripción corta:** Ningún vector del conjunto es redundante.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** independencia lineal como ausencia de redundancia direccional.
- **Elementos:** dos vectores en 2D y paralelogramo asociado; área \(|\det(u,v)|\) visible.
- **Idea:** Arrastra \(u\) y \(v\). Cuando quedan sobre una misma dirección aparece una combinación no trivial que produce el vector cero.
- **Objetivo educativo:** Vas a ver que dos vectores son independientes cuando ninguno puede reproducirse usando el otro.
- **Interactividad sugerida:** probar \(\alpha u+\beta v\); mostrar relación testigo si son dependientes; preset con tres vectores redundantes.

### Fórmulas relacionadas

- `ALG-ESP-001`
- `ALG-ESP-003`

---

## 18.3 Base y dimensión
**ID:** `ALG-ESP-003`  
**Nivel:** `intermedio`

\[
\dim(V)=\#\{\text{vectores en una base}\}
\]

**Descripción corta:** Una base genera el espacio y es linealmente independiente.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** base como conjunto mínimo de direcciones que genera el espacio.
- **Elementos:** conjunto de vectores candidatos, región generada y contador de dimensión.
- **Idea:** Arrastra \(u\) y \(v\). Si apuntan en direcciones diferentes generan todo \(\mathbb R^2\); si quedan sobre la misma recta, dejan de ser una base de \(\mathbb R^2\).
- **Objetivo educativo:** Vas a ver que una base necesita dos cosas: vectores independientes y suficientes direcciones para generar todo el espacio.
- **Interactividad sugerida:** checklist independencia + generación; presets (base, dependientes, redundante, espacio cero); dimensión del span.

### Fórmulas relacionadas

- `ALG-ESP-001`
- `ALG-ESP-002`
- `ALG-ESP-004`

---

## 18.4 Coordenadas en una base
**ID:** `ALG-ESP-004`  
**Nivel:** `intermedio`

\[
v=\sum_i c_ib_i\Rightarrow[v]_\mathcal B=(c_1,\ldots,c_n)^T
\]

**Descripción corta:** Representa un vector mediante coeficientes de una base.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** coordenadas de un mismo vector en bases diferentes.
- **Elementos:** vector geométrico fijo y dos pares de ejes/base; coeficientes \([v]_\mathcal B\) y \([v]_\mathcal C\).
- **Idea:** Mueve \(x\) o cambia \(s\) y \(t\). Observa cómo \(x\) se construye recorriendo \(s\) veces \(u\) y \(t\) veces \(v\).
- **Objetivo educativo:** Vas a ver que las coordenadas indican cuánto debes avanzar en cada vector de la base para construir \(x\).
- **Interactividad sugerida:** base oblicua; comparar coordenadas estándar con \([x]_{\mathcal B}\); presets canónica/oblicua; bloquear coordenadas si no son base.

### Fórmulas relacionadas

- `ALG-TRA-007`

---

## 18.5 Rango
**ID:** `ALG-ESP-005`  
**Nivel:** `intermedio`

\[
\operatorname{rank}(A)=\dim(\operatorname{Col}(A))
\]

**Descripción corta:** Número de direcciones independientes producidas por A.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** rango como número de direcciones independientes producidas por una matriz.
- **Elementos:** matriz escalonada con pivotes resaltados y, en baja dimensión, espacio columna generado.
- **Idea:** Edita las columnas de \(A\) y observa cuándo generan un punto, una recta o todo el plano. Esa dimensión es el rango.
- **Objetivo educativo:** Vas a ver que el rango mide cuántas direcciones independientes generan las columnas de \(A\).
- **Interactividad sugerida:** matriz \(2\times 3\) editable; columnas en \(\mathbb R^2\); pivotes vía RREF; presets rango 0/1/2.

### Fórmulas relacionadas

- `ALG-SIS-005`
- `ALG-ESP-007`
- `ALG-DEC-004`

---

## 18.6 Nulidad
**ID:** `ALG-ESP-006`  
**Nivel:** `intermedio`

\[
\operatorname{nullity}(A)=\dim(\ker A)
\]

**Descripción corta:** Número de grados de libertad enviados al vector cero.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** nulidad como dimensión del conjunto de soluciones de \(Ax=0\).
- **Elementos:** transformación de vectores con el núcleo resaltado como línea/plano que colapsa al cero.
- **Idea:** Edita \(A\) y observa cómo las variables libres generan el núcleo. Cada variable libre añade una dimensión a \(\ker A\).
- **Objetivo educativo:** Vas a ver que la nulidad mide cuántas direcciones independientes puede tener una solución de \(Ax=0\).
- **Interactividad sugerida:** matriz \(2\times 3\); parametrizar con \(t\) (y \(s\)); verificar \(Av=0\); presets nulidad 0/1/2/cero.

### Fórmulas relacionadas

- `ALG-TRA-003`
- `ALG-ESP-007`

---

## 18.7 Teorema rango-nulidad
**ID:** `ALG-ESP-007`  
**Nivel:** `intermedio`

\[
n=\operatorname{rank}(A)+\operatorname{nullity}(A)
\]

**Descripción corta:** Descompone la dimensión del dominio en información preservada y perdida.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** reparto de dimensiones entre imagen y núcleo.
- **Elementos:** barra de \(n\) dimensiones dividida en segmentos “rango” y “nulidad”, acompañada por una transformación esquemática.
- **Idea:** Edita \(A\) y observa cómo cambian los pivotes y las variables libres. El rango y la nulidad cambian, pero su suma siempre sigue siendo \(n\).
- **Objetivo educativo:** Vas a ver cómo las \(n\) dimensiones del dominio se reparten entre las que sobreviven en la imagen y las que \(A\) envía a cero.
- **Interactividad sugerida:** barra rango/nulidad; matriz \(2\times 3\); presets rango completo / dependencia / cero; verificación \(2+1=3\).

### Fórmulas relacionadas

- `ALG-ESP-005`
- `ALG-ESP-006`

---

# 19. Transformaciones lineales

## 19.1 Linealidad
**ID:** `ALG-TRA-001`  
**Nivel:** `intermedio`

\[
T(au+bv)=aT(u)+bT(v)
\]

**Descripción corta:** Una transformación lineal preserva combinaciones lineales.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** linealidad como preservación de suma y escala.
- **Elementos:** vectores \(u,v\), su suma, sus imágenes \(T(u),T(v)\) y comparación con \(T(u+v)\).
- **Idea:** Vas a comprobar que una transformación lineal puede aplicarse antes o después de sumar y escalar vectores: el resultado es el mismo.
- **Objetivo educativo:** Pruébalo — Mueve \(u\) y \(v\). Compara \(A(u+v)\) con \(Au+Av\); después cambia \(\lambda\) y compara \(A(\lambda u)\) con \(\lambda Au\).
- **Interactividad sugerida:** modos Suma / Escalamiento / General; dos caminos que coinciden; contraejemplo de traslación (no lineal).

### Fórmulas relacionadas

- `ALG-VEC-007`
- `ALG-TRA-002`

---

## 19.2 Transformación matricial
**ID:** `ALG-TRA-002`  
**Nivel:** `intermedio`

\[
T(x)=Ax
\]

**Descripción corta:** Toda matriz define una transformación lineal entre espacios compatibles.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** matriz como transformación geométrica del espacio.
- **Elementos:** cuadrícula, vectores base \(e_1,e_2\), sus imágenes \(Ae_1,Ae_2\) y una figura de prueba.
- **Idea:** Vas a ver que una matriz \(A\) empuja cada punto del plano: \(x\to Ax\). Las columnas de \(A\) son exactamente \(Ae_1\) y \(Ae_2\).
- **Objetivo educativo:** Pruébalo — Compara la cuadrícula original (tenue) con la transformada; arrastra \(x\) y observa \(Ax\).
- **Interactividad sugerida:** presets Identidad/Escala/Rotación/Shear/Reflexión/Proyección; interpolación \(I\to A\); editar columnas arrastrando \(Ae_1,Ae_2\).

### Fórmulas relacionadas

- `ALG-MAT-004`
- `ALG-EIG-001`

---

## 19.3 Núcleo
**ID:** `ALG-TRA-003`  
**Nivel:** `intermedio`

\[
\ker(T)=\{v:T(v)=0\}
\]

**Descripción corta:** Vectores que la transformación colapsa al cero.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** núcleo como conjunto enviado al vector cero.
- **Elementos:** dominio con una línea/plano destacado, flechas de varios puntos hacia el origen del codominio.
- **Idea:** Vas a ver que el núcleo contiene exactamente los vectores que \(A\) transforma en el vector cero.
- **Objetivo educativo:** Pruébalo — Mueve \(x\) por el dominio y observa \(Ax\). Cuando \(Ax\) llega al origen, \(x\) pertenece al núcleo.
- **Interactividad sugerida:** dominio/codominio; presets Invertible/Proyección/Dependiente/Cero; ver núcleo completo \(\{0\}\)/recta/\(\mathbb R^2\).

### Fórmulas relacionadas

- `ALG-ESP-006`
- `ALG-TRA-004`

---

## 19.4 Imagen
**ID:** `ALG-TRA-004`  
**Nivel:** `intermedio`

\[
\operatorname{Im}(T)=\{T(v):v\in V\}
\]

**Descripción corta:** Conjunto de salidas alcanzables.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** imagen como conjunto de salidas alcanzables.
- **Elementos:** dominio, transformación y subespacio resaltado en el codominio formado por las columnas de \(A\).
- **Idea:** Vas a ver que la imagen de \(A\) contiene todas las salidas que la transformación puede producir.
- **Objetivo educativo:** Pruébalo — Mueve un punto en el dominio y observa \(Ax\). Cambia \(A\) y fíjate si las salidas llenan el plano, una recta o solo el origen.
- **Interactividad sugerida:** Un punto / Muchos / Toda la imagen; \(\operatorname{Im}(A)=\operatorname{Col}(A)=\operatorname{span}\{Ae_1,Ae_2\}\); dominio vs codominio.

### Fórmulas relacionadas

- `ALG-ESP-005`
- `ALG-TRA-003`

---

## 19.5 Composición lineal
**ID:** `ALG-TRA-005`  
**Nivel:** `intermedio`

\[
(S\circ T)(x)=BAx
\]

**Descripción corta:** Componer transformaciones corresponde a multiplicar matrices en orden adecuado.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** composición como aplicación sucesiva de dos transformaciones.
- **Elementos:** figura original, estado tras \(A\), estado final tras \(B\), y matriz combinada \(BA\).
- **Idea:** Vas a ver que componer transformaciones significa aplicar una y después la otra. El orden importa: \(B\circ A\) significa \(A\) primero y \(B\) después.
- **Objetivo educativo:** Pruébalo — Aplica primero \(A\) y después \(B\). Compara el resultado con aplicar directamente la matriz \(BA\).
- **Interactividad sugerida:** estados Original \(\to A\to B\circ A\); orden \(A\to B\) / \(B\to A\); demostrar \(BA\neq AB\) en general.

### Fórmulas relacionadas

- `ALG-FUN-002`
- `ALG-MAT-004`

---

## 19.6 Transformación inversa
**ID:** `ALG-TRA-006`  
**Nivel:** `intermedio`

\[
T^{-1}(y)=A^{-1}y
\]

**Descripción corta:** Deshace una transformación matricial invertible.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** transformación inversa como recuperación del estado original.
- **Elementos:** cuadrícula o vector inicial, imagen bajo \(A\) y retorno bajo \(A^{-1}\).
- **Idea:** \(A\) transforma. \(A^{-1}\) deshace. Si \(A\) es singular, se pierde información y no hay inversa.
- **Objetivo educativo:** Pruébalo — Aplica \(A\) y luego deshaz con \(A^{-1}\). Verifica \(A^{-1}(Ax)=x\); prueba también un caso singular.
- **Interactividad sugerida:** estados Original \(\to\) Transformado \(\to\) Recuperado; ida y vuelta; presets Shear/Rotación/Singular.

### Fórmulas relacionadas

- `ALG-FUN-003`
- `ALG-DET-005`

---

## 19.7 Cambio de base
**ID:** `ALG-TRA-007`  
**Nivel:** `avanzado`

\[
[v]_\mathcal C=P_{\mathcal C\leftarrow\mathcal B}[v]_\mathcal B
\]

**Descripción corta:** Convierte coordenadas entre dos bases.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** cambio de base como cambio de coordenadas, no del vector.
- **Elementos:** mismo vector dibujado con dos sistemas de ejes/base y matrices de cambio entre coordenadas.
- **Idea:** Vas a ver que un mismo vector puede tener coordenadas diferentes según la base desde la que lo describas. La geometría no cambia; cambia el sistema de coordenadas.
- **Objetivo educativo:** Pruébalo — Cambia entre las bases \(E\) y \(B\) o mueve sus vectores. El vector \(x\) permanece fijo, pero sus coordenadas cambian.
- **Interactividad sugerida:** retículas \(E\)/\(B\)/Ambas; \([x]_E\) vs \([x]_B\); \(P_{\mathcal C\leftarrow\mathcal B}=C^{-1}B\); presets rotada/oblicua/escalada/inválida.

### Fórmulas relacionadas

- `ALG-ESP-004`
- `ALG-EIG-004`

---

# 20. Valores propios y diagonalización

## 20.1 Ecuación de valor propio
**ID:** `ALG-EIG-001`  
**Nivel:** `intermedio`

\[
Av=\lambda v,\quad v\ne0
\]

**Descripción corta:** Un vector propio mantiene su dirección bajo A.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** direcciones que una matriz conserva.
- **Elementos:** campo de vectores antes/después de una transformación 2D y eigendirecciones resaltadas.
- **Idea:** Vas a comparar un vector cualquiera con un autovector y observar qué ocurre cuando aplicamos \(A\).
- **Objetivo educativo:** Pruébalo — Arrastra \(v\). Si \(Av\) conserva su dirección, encontraste una dirección propia.
- **Interactividad sugerida:** arrastrar \(v\); comparar \(Av\) con \(\lambda v\); mostrar direcciones propias; presets con \(\lambda\) negativo, cero y rotación sin autovectores reales.

### Complejidad computacional

Calcular todos los valores propios de una matriz densa \(n\times n\) con métodos numéricos estándar tiene coste del orden de

\[
O(n^3).
\]

Para matrices grandes y dispersas, cuando solo se requieren unos pocos valores propios, se emplean métodos iterativos con costes muy diferentes.

### Fórmulas relacionadas

- `ALG-EIG-002`
- `ALG-EIG-004`

---

## 20.2 Ecuación característica
**ID:** `ALG-EIG-002`  
**Nivel:** `intermedio`

\[
\det(A-\lambda I)=0
\]

**Descripción corta:** Sus raíces son los valores propios.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** valores propios como ceros del polinomio característico.
- **Elementos:** matriz \(A-\lambda I\), determinante simbólico/polinomio y gráfica del polinomio característico para caso 2×2.
- **Idea:** Vas a construir el polinomio cuyas raíces son los valores propios de \(A\).
- **Objetivo educativo:** Pruébalo — Cambia \(A\) y observa cómo \(A-\lambda I\) produce un polinomio en \(\lambda\). Sus ceros son exactamente los valores propios.
- **Interactividad sugerida:** construir \(A-\lambda I\); graficar \(p_A(\lambda)\); mover \(\lambda\) y ver cuándo \(\det(A-\lambda I)=0\).

### Fórmulas relacionadas

- `ALG-EIG-001`
- `ALG-POL-004`

---

## 20.3 Autoespacio
**ID:** `ALG-EIG-003`  
**Nivel:** `intermedio`

\[
E_\lambda=\ker(A-\lambda I)
\]

**Descripción corta:** Subespacio de vectores propios asociados a lambda junto con el cero.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** autoespacio como núcleo de \(A-\lambda I\).
- **Elementos:** eigendirección o plano resaltado y varios vectores propios para un mismo \(\lambda\).
- **Idea:** Vas a ver que un autoespacio \(E_\lambda=\ker(A-\lambda I)\) es la recta (o el plano) de todos los vectores que \(A\) solo escala por \(\lambda\).
- **Objetivo educativo:** Pruébalo — Elige \(\lambda\) y mueve \(v\) sobre \(E_\lambda\). Comprueba \(Av=\lambda v\).
- **Interactividad sugerida:** selector de \(\lambda\); \(E_\lambda\) como recta/\(\mathbb R^2\)/\{0\}; modo núcleo \(A-\lambda I\); \(\lambda\) negativo y cero.

### Fórmulas relacionadas

- `ALG-EIG-001`
- `ALG-TRA-003`

---

## 20.4 Diagonalización
**ID:** `ALG-EIG-004`  
**Nivel:** `intermedio`

\[
A=PDP^{-1}
\]

**Descripción corta:** Representa A en una base de vectores propios.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** diagonalización como cambio a una base de eigenvectores.
- **Elementos:** tres etapas: cambio de base por \(P^{-1}\), escalamiento independiente por \(D\), regreso por \(P\).
- **Idea:** Vas a ver que diagonalizar consiste en encontrar una base de autovectores en la que \(A\) deja de mezclar coordenadas.
- **Objetivo educativo:** Pruébalo — Cambia \(A\) y observa cómo \(P^{-1}AP\) se convierte en una matriz diagonal \(D\).
- **Interactividad sugerida:** modos Autovectores / Cambio de base / Diagonal; bases oblicuas; estado no diagonalizable; comparar \(Ax\) con \(PDP^{-1}x\).

### Fórmulas relacionadas

- `ALG-EIG-001`
- `ALG-EIG-005`

---

## 20.5 Potencias por diagonalización
**ID:** `ALG-EIG-005`  
**Nivel:** `avanzado`

\[
A^n=PD^nP^{-1}
\]

**Descripción corta:** Simplifica potencias de matrices y recurrencias.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** potencias de una matriz mediante potencias escalares de eigenvalores.
- **Elementos:** pipeline \(A=PDP^{-1}\rightarrow A^n=PD^nP^{-1}\) con diagonal de \(D\) elevada término a término.
- **Idea:** Vas a ver que una matriz diagonalizable se vuelve muy fácil de potenciar en su base de autovectores.
- **Objetivo educativo:** Pruébalo — Cambia \(n\) y observa cómo las componentes sobre \(v_1\) y \(v_2\) se multiplican por \(\lambda_1^n\) y \(\lambda_2^n\).
- **Interactividad sugerida:** pipeline \(P^{-1}\to D^n\to P\); trayectoria \(x,Ax,\ldots,A^n x\); presets crecimiento/decadencia y no ortogonal.

### Fórmulas relacionadas

- `ALG-EIG-004`
- `ALG-SEC-007`

---

## 20.6 Teorema espectral
**ID:** `ALG-EIG-006`  
**Nivel:** `avanzado`

\[
A=A^T\Rightarrow A=Q\Lambda Q^T
\]

**Descripción corta:** Toda matriz simétrica real admite diagonalización ortogonal.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** teorema espectral como ejes ortogonales propios de una matriz simétrica.
- **Elementos:** matriz simétrica, eigenvectores ortonormales como ejes perpendiculares y escalamiento por eigenvalores.
- **Idea:** Vas a ver que una matriz simétrica posee direcciones propias ortogonales y que, usando esas direcciones como base, la transformación se vuelve un simple escalamiento por eje.
- **Objetivo educativo:** Pruébalo — Cambia \(a\), \(b\) y \(d\). Observa cómo \(q_1\) y \(q_2\) siguen siendo perpendiculares mientras \(\lambda_1\) y \(\lambda_2\) controlan el escalamiento.
- **Interactividad sugerida:** círculo \(\to\) elipse; \(A=Q\Lambda Q^T\); modos Autovectores / Diagonalización / Acción sobre \(x\); solo matrices \(A=A^T\).

### Fórmulas relacionadas

- `ALG-MAT-007`
- `ALG-ORT-003`
- `ALG-DEC-003`

---

# 21. Ortogonalidad y proyecciones

## 21.1 Ortogonalidad
**ID:** `ALG-ORT-001`  
**Nivel:** `intermedio`

\[
u\perp v\iff u\cdot v=0
\]

**Descripción corta:** Caracteriza vectores perpendiculares.

### Visualización sugerida

- **Tipo:** `vector`
- **Concepto visual:** ortogonalidad como ángulo recto y producto punto cero.
- **Elementos:** dos vectores con arco de 90° y cálculo de \(u\cdot v\).
- **Idea:** Arrastra \(u\) o \(v\) y observa la equivalencia: \(u\perp v\) exactamente cuando \(u\cdot v=0\) (y \(\theta=90^\circ\) si ambos son no nulos). Distingue agudo, recto y obtuso según el signo del producto punto.
- **Objetivo educativo:** Vas a conectar geometría (ángulo recto) con álgebra (\(u\cdot v=0\)) y a distinguir ortogonal de ortonormal.
- **Interactividad sugerida:** arrastrar vectores; presets agudo/obtuso/ortogonal; construir \(\pm 90^\circ\); normalizar solo como paso opcional.

### Fórmulas relacionadas

- `ALG-VEC-004`
- `ALG-ORT-002`

---

## 21.2 Proyección ortogonal
**ID:** `ALG-ORT-002`  
**Nivel:** `intermedio`

\[
\operatorname{proj}_b(a)=\frac{a\cdot b}{\|b\|^2}b
\]

**Descripción corta:** Proyecta un vector sobre la dirección de otro.

### Visualización sugerida

- **Tipo:** `vector`
- **Concepto visual:** proyección como sombra perpendicular sobre una dirección.
- **Elementos:** vector \(a\), dirección \(b\), proyección sobre \(b\) y residuo perpendicular.
- **Idea:** Arrastra \(u\) o \(v\): el pie de la perpendicular se mueve sobre \(\operatorname{span}(v)\) y ves \(u=\operatorname{proj}_v(u)+r\) con \(r\perp v\). La proyección puede quedar antes del origen o más allá de la punta de \(v\).
- **Objetivo educativo:** Vas a descomponer \(u\) en una parte paralela a \(v\) y otra perpendicular; la sombra es \(\operatorname{proj}_v(u)\).
- **Interactividad sugerida:** arrastrar \(u\) y \(v\); presets positivo/negativo/paralelo/perpendicular; cálculo paso a paso del coeficiente \(c\).

### Fórmulas relacionadas

- `ALG-VEC-004`
- `ALG-LSQ-001`

---

## 21.3 Matriz ortogonal
**ID:** `ALG-ORT-003`  
**Nivel:** `intermedio`

\[
Q^TQ=I\Rightarrow Q^{-1}=Q^T
\]

**Descripción corta:** Preserva longitudes y ángulos.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** matriz ortogonal como transformación que preserva longitudes y ángulos.
- **Elementos:** figura y vectores antes/después de aplicar \(Q\), con longitudes y ángulo medidos en ambos estados.
- **Idea:** Cambia \(\theta\) o activa una reflexión: el círculo sigue siendo círculo, el cuadrado no se deforma y \(Q^TQ=I\). Compara longitudes \(\|Qv\|=\|v\|\) y \(\det(Q)=\pm 1\).
- **Objetivo educativo:** Vas a ver que una matriz ortogonal rota o refleja el plano sin estirarlo; sus columnas son ortonormales y \(Q^{-1}=Q^T\).
- **Interactividad sugerida:** rotación/reflexión; vector arrastrable; verificar \(Q^TQ\); aplicar \(Q\) y deshacer con \(Q^T\).

### Fórmulas relacionadas

- `ALG-MAT-006`
- `ALG-EIG-006`
- `ALG-DEC-002`

---

## 21.4 Gram-Schmidt
**ID:** `ALG-ORT-004`  
**Nivel:** `avanzado`

\[
u_k=v_k-\sum_{j<k}\operatorname{proj}_{u_j}(v_k)
\]

**Descripción corta:** Construye una base ortogonal u ortonormal a partir de vectores independientes.

### Visualización sugerida

- **Tipo:** `vector_space`
- **Concepto visual:** ortogonalización progresiva de un conjunto independiente.
- **Elementos:** vectores originales \(v_1,v_2,\ldots\), proyecciones restadas y vectores ortogonales \(u_i\).
- **Idea:** Sigue los pasos: \(u_1=v_1\), dibuja \(\operatorname{proj}_{u_1}(v_2)\), resta y obtén \(u_2\perp u_1\). El span se conserva; normalizar es opcional y produce una base ortonormal.
- **Objetivo educativo:** Vas a ver que Gram–Schmidt convierte vectores independientes en una base ortogonal del mismo espacio, y que ortogonal no implica unitario.
- **Interactividad sugerida:** stepper Vectores → Proyección → Restar → Ortogonal → Normalizar; presets dependientes/ya ortogonales; arrastrar \(v_1,v_2\).

### Fórmulas relacionadas

- `ALG-ORT-002`
- `ALG-DEC-002`

---

# 22. Mínimos cuadrados

## 22.1 Problema de mínimos cuadrados
**ID:** `ALG-LSQ-001`  
**Nivel:** `avanzado`

\[
\hat x=\arg\min_x\|Ax-b\|_2^2
\]

**Descripción corta:** Busca la mejor aproximación cuando Ax=b no tiene solución exacta.

### Visualización sugerida

- **Tipo:** `geometry`
- **Concepto visual:** mínimos cuadrados como proyección de \(b\) sobre el espacio columna.
- **Elementos:** subespacio \(\operatorname{Col}(A)\), vector \(b\), proyección \(\hat b=A\hat x\) y residuo \(r=b-\hat b\).
- **Idea:** Mueve \(x\) sobre \(\operatorname{Col}(A)\): el error \(\|Ax-b\|\) es mínimo precisamente cuando el residuo es perpendicular al espacio columna.
- **Objetivo educativo:** Vas a ver que mínimos cuadrados elige el punto de \(\operatorname{Col}(A)\) más cercano a \(b\), no un paralelogramo arbitrario.
- **Interactividad sugerida:** controlar \(x\); comparar error actual vs mínimo; curva \(E(x)=\|Ax-b\|^2\); presets exacto/inexacto.

### Fórmulas relacionadas

- `ALG-ORT-002`
- `ALG-LSQ-002`

---

## 22.2 Ecuaciones normales
**ID:** `ALG-LSQ-002`  
**Nivel:** `avanzado`

\[
A^TA\hat x=A^Tb
\]

**Descripción corta:** Caracterizan la proyección de b sobre el espacio columna de A.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** ecuaciones normales como condición de ortogonalidad del residuo.
- **Elementos:** vectores/columnas de \(A\), residuo \(r=b-A\hat x\) y productos punto \(A^Tr\).
- **Idea:** Parte de un \(A\) \(3\times 2\) inconsistente: el residuo óptimo es perpendicular a \(\operatorname{Col}(A)\), y eso se escribe \(A^Tr=0\), de donde sale \(A^TA\hat x=A^Tb\).
- **Objetivo educativo:** Vas a ver que las ecuaciones normales son la forma matricial de “el error es perpendicular a todas las columnas de \(A\)”.
- **Interactividad sugerida:** proyección geométrica; derivación paso a paso; construcción de \(A^TA\) y \(A^Tb\); presets exacto/rango deficiente/regresión.

### Condiciones

La expresión cerrada \((A^TA)^{-1}A^Tb\) requiere que las columnas de \(A\) sean linealmente independientes. Para casos generales se prefiere QR o SVD.

### Complejidad computacional

Para \(A\in\mathbb R^{m\times n}\) con \(m\ge n\), formar \(A^TA\) cuesta aproximadamente

\[
O(mn^2),
\]

y resolver después el sistema denso de tamaño \(n\) añade \(O(n^3)\). Aunque las ecuaciones normales son algebraicamente simples, QR o SVD suelen preferirse cuando la estabilidad numérica es importante.

### Fórmulas relacionadas

- `ALG-LSQ-001`
- `ALG-LSQ-003`

---

## 22.3 Pseudoinversa
**ID:** `ALG-LSQ-003`  
**Nivel:** `avanzado`

\[
\hat x=A^+b;\quad A^+=V\Sigma^+U^T
\]

**Descripción corta:** Produce soluciones de mínimos cuadrados de norma mínima.

### Visualización sugerida

- **Tipo:** `matrix`
- **Concepto visual:** pseudoinversa como inversa generalizada para soluciones de mínimos cuadrados.
- **Elementos:** pipeline SVD \(A=U\Sigma V^T\), inversión solo de valores singulares no nulos y recomposición \(A^+=V\Sigma^+U^T\).
- **Idea:** Empieza con \(A\) rectangular \(3\times 2\): \(A^+b\) proyecta \(b\) sobre \(\operatorname{Col}(A)\). Si hay infinitas soluciones, elige la de menor norma. Construye \(A^+=V\Sigma^+U^T\) sin invertir ceros.
- **Objetivo educativo:** Vas a ver cómo \(A^+\) encuentra la mejor solución cuando \(Ax=b\) no admite una inversa ordinaria.
- **Interactividad sugerida:** presets sobredeterminado/subdeterminado/singular/invertible; modos mínimos cuadrados, norma mínima, SVD y Moore–Penrose.

### Fórmulas relacionadas

- `ALG-DEC-004`

---

# 23. Descomposiciones de matrices

## 23.1 Descomposición LU
**ID:** `ALG-DEC-001`  
**Nivel:** `avanzado`

\[
PA=LU
\]

**Descripción corta:** Factoriza una matriz en factores triangulares, con pivoteo cuando es necesario.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `lu`
- **Concepto visual:** LU como secuencia compacta de eliminación gaussiana.
- **Elementos:** matriz \(A\), factores \(L\) y \(U\), y multiplicadores de eliminación almacenados en \(L\).
- **Idea:** Pulsa **Paso LU** y aplica operaciones de fila: te acercas a la forma de la factorización LU.
- **Objetivo educativo:** Vas a ver que LU parte \(A\) en triangular inferior y superior para resolver sistemas más fácil.
- **Interactividad sugerida:** avance fila por fila y comprobación visual de que \(LU=A\) o \(PA=LU\).

### Complejidad computacional

Para una matriz densa cuadrada \(n\times n\), la factorización LU clásica requiere

\[
O(n^3)
\]

tiempo y \(O(n^2)\) almacenamiento. Una vez factorizada, resolver cada nuevo sistema con sustituciones triangular inferior y superior cuesta \(O(n^2)\).

### Fórmulas relacionadas

- `ALG-SIS-004`

---

## 23.2 Descomposición QR
**ID:** `ALG-DEC-002`  
**Nivel:** `avanzado`

\[
A=QR
\]

**Descripción corta:** Q tiene columnas ortonormales y R es triangular superior.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Modo:** `qr`
- **Concepto visual:** QR como base ortonormal más coordenadas triangulares.
- **Elementos:** columnas de \(A\), proceso que genera columnas ortonormales de \(Q\) y matriz triangular \(R\).
- **Idea:** Observa la malla de \(A\) como composición de una parte ortogonal y otra triangular.
- **Objetivo educativo:** Vas a ver que QR escribe \(A\) como rotación/ortogonal por triangular.
- **Interactividad sugerida:** recorrer columnas una a una mostrando proyecciones, normalización y entradas de \(R\).

### Complejidad computacional

Para una matriz densa \(A\in\mathbb R^{m\times n}\), con \(m\ge n\), una factorización QR estándar tiene coste

\[
O(mn^2).
\]

El coste exacto depende del método utilizado, por ejemplo Householder o Gram-Schmidt.

### Fórmulas relacionadas

- `ALG-ORT-003`
- `ALG-ORT-004`
- `ALG-LSQ-001`

---

## 23.3 Descomposición espectral
**ID:** `ALG-DEC-003`  
**Nivel:** `avanzado`

\[
A=Q\Lambda Q^T
\]

**Descripción corta:** Forma espectral de matrices simétricas reales.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Modo:** `eigen`
- **Concepto visual:** descomposición espectral de una matriz simétrica.
- **Elementos:** ejes propios ortonormales, matriz \(Q\), escalas \(\Lambda\) y una elipse o cuadrícula transformada.
- **Idea:** Activa **Eigenvectores**: son los ejes de esa descomposición.
- **Objetivo educativo:** Vas a ver que la descomposición espectral usa autovalores y autovectores.
- **Interactividad sugerida:** editar una matriz simétrica 2×2 y actualizar la descomposición y figura transformada.

### Fórmulas relacionadas

- `ALG-EIG-006`

---

## 23.4 SVD
**ID:** `ALG-DEC-004`  
**Nivel:** `avanzado`

\[
A=U\Sigma V^T
\]

**Descripción corta:** Descomposición universal en direcciones singulares y escalas.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Modo:** `svd`
- **Concepto visual:** SVD como rotación/reflexión → escalamiento → rotación/reflexión.
- **Elementos:** círculo unitario, estado tras \(V^T\), elipse tras \(\Sigma\) y orientación final tras \(U\).
- **Idea:** Pulsa el **Paso SVD/QR**: 1) orienta, 2) escala con \(\sigma\), 3) recomponer con \(A\).
- **Objetivo educativo:** Vas a ver que SVD descompone \(A\) en rotar → escalar → rotar.
- **Interactividad sugerida:** controles para una matriz 2×2; botones para avanzar por \(V^T\), \(\Sigma\) y \(U\).

### Aplicaciones

- compresión de datos e imágenes;
- reducción dimensional;
- pseudoinversa y mínimos cuadrados;
- sistemas de recomendación;
- análisis de datos y aprendizaje automático.

### Complejidad computacional

Para una matriz densa \(m\times n\), una SVD completa tiene coste típico del orden de

\[
O\!\left(mn\min(m,n)\right).
\]

Para matrices muy grandes se utilizan variantes truncadas o iterativas cuando solo interesan los primeros valores singulares.

### Fórmulas relacionadas

- `ALG-LSQ-003`
- `ALG-DEC-005`
- `ALG-NOR-002`
- `ALG-NOR-005`
- `ALG-NOR-007`

---

## 23.5 Aproximación de bajo rango
**ID:** `ALG-DEC-005`  
**Nivel:** `avanzado`

\[
A_k=\sum_{i=1}^{k}\sigma_i u_i v_i^T
\]

**Descripción corta:** Aproxima una matriz usando sus k valores singulares dominantes.

### Visualización sugerida

- **Tipo:** `matrix_transform`
- **Concepto visual:** aproximación de bajo rango eliminando componentes singulares pequeñas.
- **Elementos:** matriz/imagen original, valores singulares ordenados y reconstrucciones \(A_k\) para varios valores de \(k\).
- **Idea:** Baja \(k\) con **Rango bajo demo**: la malla usa solo el mayor valor singular.
- **Objetivo educativo:** Vas a ver que quedarte con los \(\sigma\) grandes aproxima \(A\) con poco rango.
- **Interactividad sugerida:** deslizador de \(k\); actualizar reconstrucción y porcentaje de energía/frobenius capturada cuando esté disponible.

### Fórmulas relacionadas

- `ALG-DEC-004`
- `ALG-ESP-005`

---


# 24. Normas matriciales y condicionamiento

## 24.1 Norma matricial inducida
**ID:** `ALG-NOR-001`  
**Nivel:** `avanzado`

Dada una norma vectorial \(\|\cdot\|_p\), la norma matricial inducida es

\[
\|A\|_p
=
\max_{\mathbf x\neq\mathbf0}
\frac{\|A\mathbf x\|_p}{\|\mathbf x\|_p}.
\]

Equivalentemente:

\[
\|A\|_p
=
\max_{\|\mathbf x\|_p=1}\|A\mathbf x\|_p.
\]

**Descripción corta:** Mide el máximo factor con el que una matriz puede amplificar vectores según una norma determinada.

### Visualización sugerida
- **Tipo:** `matrix_transform`
- **Concepto visual:** amplificación máxima de vectores por una transformación matricial.
- **Elementos:** círculo o esfera unidad de la norma elegida, varios vectores unitarios, su imagen bajo \(A\) y el vector cuya imagen alcanza la mayor norma.
- **Idea:** Cambia \(A\) y fíjate: \(\sigma\) grandes indican estiramientos fuertes en alguna dirección.
- **Objetivo educativo:** Vas a ver que una norma matricial mide cuánto puede estirar \(A\) a un vector.
- **Interactividad sugerida:** selector de una matriz 2×2 y de norma \(p=1,2,\infty\).

### Fórmulas relacionadas
- `ALG-VEC-002`
- `ALG-NOR-003`
- `ALG-NOR-004`
- `ALG-NOR-005`
- `ALG-NOR-007`

---

## 24.2 Norma de Frobenius
**ID:** `ALG-NOR-002`  
**Nivel:** `intermedio`

Para \(A=(a_{ij})\in\mathbb R^{m\times n}\):

\[
\|A\|_F
=
\sqrt{\sum_{i=1}^{m}\sum_{j=1}^{n}|a_{ij}|^2}.
\]

Mediante los valores singulares:

\[
\|A\|_F
=
\sqrt{\sum_i\sigma_i^2}.
\]

**Descripción corta:** Extiende la norma euclidiana al conjunto de todas las entradas de una matriz.

### Visualización sugerida
- **Tipo:** `matrix`
- **Concepto visual:** la norma de Frobenius como longitud euclidiana del vector formado por todas las entradas.
- **Elementos:** una matriz pequeña, sus entradas elevadas al cuadrado, una suma acumulada y la raíz cuadrada final; en paralelo, sus valores singulares si se activa el modo avanzado.
- **Idea:** Edita \(A\) y relaciona entradas grandes con una norma más grande.
- **Objetivo educativo:** Vas a ver que Frobenius mide el “tamaño” de \(A\) sumando todas las entradas al cuadrado.
- **Interactividad sugerida:** editar entradas de una matriz 2×2 o 3×3 y actualizar automáticamente ambos cálculos.

### Fórmulas relacionadas
- `ALG-VEC-002`
- `ALG-DEC-004`
- `ALG-DEC-005`

---

## 24.3 Norma matricial 1
**ID:** `ALG-NOR-003`  
**Nivel:** `intermedio`

\[
\|A\|_1
=
\max_j\sum_i|a_{ij}|.
\]

**Descripción corta:** Es la máxima suma absoluta de una columna.

### Visualización sugerida
- **Tipo:** `matrix`
- **Concepto visual:** comparar sumas absolutas por columnas.
- **Elementos:** matriz, suma debajo de cada columna y resaltado de la columna con mayor suma.
- **Idea:** Haz una columna mucho mayor y mira: esa norma crece con ella.
- **Objetivo educativo:** Vas a ver que la norma 1 se liga a sumas de columnas.
- **Interactividad sugerida:** permitir editar entradas y observar cuándo cambia la columna dominante.

### Fórmulas relacionadas
- `ALG-NOR-001`
- `ALG-NOR-004`
- `ALG-NOR-006`

---

## 24.4 Norma matricial infinito
**ID:** `ALG-NOR-004`  
**Nivel:** `intermedio`

\[
\|A\|_\infty
=
\max_i\sum_j|a_{ij}|.
\]

**Descripción corta:** Es la máxima suma absoluta de una fila.

### Visualización sugerida
- **Tipo:** `matrix`
- **Concepto visual:** comparar sumas absolutas por filas.
- **Elementos:** matriz, suma al final de cada fila y resaltado de la fila con mayor suma.
- **Idea:** Haz una fila dominante y observa el efecto sobre el tamaño de \(A\).
- **Objetivo educativo:** Vas a ver que la norma infinito se liga a sumas de filas.
- **Interactividad sugerida:** botón para alternar “filas” y “columnas”, mostrando la norma correspondiente.

### Fórmulas relacionadas
- `ALG-NOR-001`
- `ALG-NOR-003`
- `ALG-NOR-006`

---

## 24.5 Norma espectral
**ID:** `ALG-NOR-005`  
**Nivel:** `avanzado`

\[
\|A\|_2
=
\sigma_{\max}(A).
\]

También:

\[
\|A\|_2
=
\sqrt{\lambda_{\max}(A^TA)}
\]

para matrices reales.

**Descripción corta:** Es el mayor factor de estiramiento euclidiano producido por una matriz.

### Visualización sugerida
- **Tipo:** `matrix_transform`
- **Concepto visual:** máxima elongación de la circunferencia unidad.
- **Elementos:** circunferencia unidad, elipse resultante de aplicar \(A\), ejes principales y semieje mayor etiquetado \(\sigma_{\max}\).
- **Idea:** Mira la elipse de valores singulares: el eje largo es ese estiramiento.
- **Objetivo educativo:** Vas a ver que la norma espectral es el mayor estiramiento (\(\sigma_1\)).
- **Interactividad sugerida:** modificar una matriz 2×2 y actualizar elipse, valores singulares y \(\|A\|_2\).

### Fórmulas relacionadas
- `ALG-NOR-001`
- `ALG-DEC-004`
- `ALG-EIG-001`
- `ALG-NOR-007`

---

## 24.6 Submultiplicatividad
**ID:** `ALG-NOR-006`  
**Nivel:** `avanzado`

Para una norma matricial submultiplicativa:

\[
\|AB\|
\le
\|A\|\,\|B\|.
\]

**Descripción corta:** La amplificación de una composición no supera el producto de las amplificaciones máximas de cada transformación.

### Visualización sugerida
- **Tipo:** `matrix_transform`
- **Concepto visual:** acotar una transformación compuesta \(AB\) mediante dos amplificaciones sucesivas.
- **Elementos:** vector inicial, imagen bajo \(B\), imagen posterior bajo \(A\), y barras que comparen \(\|AB\mathbf x\|\), \(\|A\|\|B\|\|\mathbf x\|\).
- **Idea:** Compara visualmente cuánto estira \(A\) frente a transformaciones encadenadas.
- **Objetivo educativo:** Vas a ver que \(\|AB\|\le\|A\|\|B\|\): el tamaño del producto no supera el producto de tamaños.
- **Interactividad sugerida:** matrices 2×2 predefinidas con posibilidad de cambiar el vector de entrada.

### Fórmulas relacionadas
- `ALG-MAT-004`
- `ALG-NOR-001`
- `ALG-NOR-003`
- `ALG-NOR-004`

---

## 24.7 Número de condición
**ID:** `ALG-NOR-007`  
**Nivel:** `avanzado`

Para una matriz invertible y una norma compatible:

\[
\kappa(A)
=
\|A\|\,\|A^{-1}\|.
\]

En norma 2:

\[
\kappa_2(A)
=
\frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}.
\]

**Descripción corta:** Mide la sensibilidad de un problema lineal a pequeñas perturbaciones en los datos.

### Visualización sugerida
- **Tipo:** `matrix_transform`
- **Concepto visual:** comparar transformaciones bien y mal condicionadas.
- **Elementos:** dos matrices 2×2, círculos unidad transformados en elipses, valores \(\sigma_{\max}\), \(\sigma_{\min}\) y \(\kappa_2\).
- **Idea:** Haz \(\sigma_1\gg\sigma_2\) (\(k\) bajo): la malla se aplasta y el problema se vuelve mal condicionado.
- **Objetivo educativo:** Vas a ver que el número de condición dice si un sistema es sensible a errores.
- **Interactividad sugerida:** slider que acerque dos columnas de la matriz a la dependencia lineal y muestre cómo crece \(\kappa_2(A)\).

### Condiciones
- La fórmula \(\|A\|\|A^{-1}\|\) requiere que \(A\) sea invertible.
- Para una matriz singular, el número de condición se considera infinito en este contexto.

### Fórmulas relacionadas
- `ALG-DET-004`
- `ALG-DET-005`
- `ALG-NOR-001`
- `ALG-NOR-005`
- `ALG-DEC-004`

---

# BLOQUE — ÁLGEBRA PARA CS

# 25. Álgebra booleana

## 25.1 Identidades booleanas
**ID:** `ALG-BOO-001`  
**Nivel:** `fundamental`

\[
A+0=A;\;A1=A;\;A+1=1;\;A0=0
\]

**Descripción corta:** Identidades básicas de OR y AND.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Modo:** `verify`
- **Concepto visual:** verificación de identidades mediante todas las entradas booleanas.
- **Elementos:** tabla con columna de entrada \(A\) y columnas para \(A+0\), \(A\cdot1\), \(A+1\), \(A\cdot0\).
- **Idea:** Cambia salidas con el botón: las filas en naranja no coinciden con lo esperado.
- **Objetivo educativo:** Vas a ver que puedes comprobar una identidad lógica fila a fila en la tabla de verdad.
- **Interactividad sugerida:** permitir activar/desactivar una identidad y resaltar las columnas que se comparan.

### Fórmulas relacionadas

- `ALG-BOO-002`
- `ALG-BOO-003`

---

## 25.2 Idempotencia y complemento
**ID:** `ALG-BOO-002`  
**Nivel:** `fundamental`

\[
A+A=A;\;AA=A;\;A+\bar A=1;\;A\bar A=0
\]

**Descripción corta:** Reglas esenciales de simplificación booleana.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** idempotencia y complemento mediante tablas y estados binarios.
- **Elementos:** tabla para \(A\), \(A+A\), \(AA\), \(A+\bar A\), \(A\bar A\).
- **Idea:** Alterna \(A\) y \(B\) y compara la tabla con el resultado en vivo.
- **Objetivo educativo:** Vas a ver que algunas operaciones booleanas se simplifican (idempotencia, complemento).
- **Interactividad sugerida:** interruptor para \(A=0/1\) que actualice todas las expresiones simultáneamente.

### Fórmulas relacionadas

- `ALG-BOO-004`
- `ALG-BOO-006`

---

## 25.3 Distributividad booleana
**ID:** `ALG-BOO-003`  
**Nivel:** `fundamental`

\[
A(B+C)=AB+AC;\quad A+BC=(A+B)(A+C)
\]

**Descripción corta:** Álgebra distributiva para lógica.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** equivalencia de las dos formas distributivas booleanas.
- **Elementos:** tabla de verdad con \(A,B,C\) y pares de columnas \(A(B+C)\) / \(AB+AC\), y \(A+BC\) / \((A+B)(A+C)\).
- **Idea:** Revisa la tabla: AND/OR se reparte como en el área \(a(b+c)\).
- **Objetivo educativo:** Vas a ver que la distributividad también existe en lógica, no solo en álgebra de números.
- **Interactividad sugerida:** seleccionar filas o asignaciones y resaltar los pasos de evaluación de cada lado.

### Fórmulas relacionadas

- `ALG-BOO-004`

---

## 25.4 Leyes de De Morgan
**ID:** `ALG-BOO-004`  
**Nivel:** `fundamental`

\[
\overline{A+B}=\bar A\bar B;\quad \overline{AB}=\bar A+\bar B
\]

**Descripción corta:** Transforma negaciones de OR y AND.

### Visualización sugerida

- **Tipo:** `logic_gate`
- **Concepto visual:** equivalencia de De Morgan mediante puertas lógicas.
- **Elementos:** dos circuitos equivalentes: NOT después de OR frente a AND de entradas negadas, y NOT después de AND frente a OR de entradas negadas.
- **Idea:** Cambia \(A\) y \(B\): las dos expresiones de cada ley siempre dan el mismo resultado.
- **Objetivo educativo:** Vas a ver que De Morgan: negar un AND es como un OR de negaciones (y al revés).
- **Interactividad sugerida:** interruptores para \(A\) y \(B\); animar señales y permitir alternar entre las dos leyes.

### Fórmulas relacionadas

- `ALG-BOO-003`
- `ALG-BOO-005`

---

## 25.5 XOR
**ID:** `ALG-BOO-005`  
**Nivel:** `fundamental`

\[
A\oplus B=\bar AB+A\bar B
\]

**Descripción corta:** Es verdadero cuando exactamente una entrada es verdadera.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** XOR como “exactamente una entrada verdadera”.
- **Elementos:** tabla de verdad de \(A,B,A\oplus B\), expresión \(\bar AB+A\bar B\) y opcionalmente puerta XOR.
- **Idea:** Prueba las cuatro combinaciones: solo 01 y 10 dan 1.
- **Objetivo educativo:** Vas a ver que XOR es verdadero cuando \(A\) y \(B\) son distintos.
- **Interactividad sugerida:** interruptores para las dos entradas y comparación simultánea entre XOR y OR.

### Fórmulas relacionadas

- `ALG-MOD-002`

---

## 25.6 Absorción
**ID:** `ALG-BOO-006`  
**Nivel:** `fundamental`

\[
A+AB=A;\quad A(A+B)=A
\]

**Descripción corta:** Simplifica expresiones redundantes.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** absorción como eliminación de información redundante.
- **Elementos:** tabla con columnas \(A\), \(AB\), \(A+AB\) y, en paralelo, \(A+B\), \(A(A+B)\).
- **Idea:** Compara filas de la tabla para ver qué entradas sobran.
- **Objetivo educativo:** Vas a ver que la absorción elimina términos redundantes en expresiones booleanas.
- **Interactividad sugerida:** seleccionar una fila y mostrar el razonamiento lógico que hace redundante al término absorbido.

### Fórmulas relacionadas

- `ALG-BOO-002`

---

## 25.7 Suma de productos
**ID:** `ALG-BOO-007`  
**Nivel:** `intermedio`

\[
F=\Sigma m(i_1,\ldots,i_k)
\]

**Descripción corta:** Forma canónica como OR de minterms.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** construcción de una función desde sus filas verdaderas.
- **Elementos:** tabla de verdad, filas con salida 1 resaltadas, minterm correspondiente a cada fila y OR final de todos los minterms.
- **Idea:** Marca en la tabla las filas donde la salida es 1: esas son tus productos.
- **Objetivo educativo:** Vas a ver que suma de productos escribe la función como ORs de ANDs.
- **Interactividad sugerida:** permitir editar la columna de salida de una función de 2–3 variables y generar automáticamente los minterms.

### Fórmulas relacionadas

- `ALG-BOO-008`
- `ALG-BOO-009`

---

## 25.8 Producto de sumas
**ID:** `ALG-BOO-008`  
**Nivel:** `intermedio`

\[
F=\Pi M(i_1,\ldots,i_k)
\]

**Descripción corta:** Forma canónica como AND de maxterms.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** construcción de una función desde sus filas falsas.
- **Elementos:** tabla de verdad, filas con salida 0 resaltadas, maxterm de cada fila y AND final de maxterms.
- **Idea:** Usa la tabla para ver qué cláusulas cubren los ceros de la función.
- **Objetivo educativo:** Vas a ver que producto de sumas es la forma dual: ANDs de ORs.
- **Interactividad sugerida:** editar la columna de salida y generar automáticamente los maxterms correspondientes.

### Fórmulas relacionadas

- `ALG-BOO-007`
- `ALG-BOO-009`

---

## 25.9 Equivalencia booleana
**ID:** `ALG-BOO-009`  
**Nivel:** `intermedio`

\[
F\equiv G\iff F\text{ y }G\text{ tienen la misma tabla de verdad}
\]

**Descripción corta:** Criterio para verificar simplificaciones lógicas.

### Visualización sugerida

- **Tipo:** `truth_table`
- **Concepto visual:** equivalencia de expresiones mediante columnas idénticas.
- **Elementos:** dos expresiones booleanas y una tabla de verdad con sus columnas de salida lado a lado.
- **Idea:** Edita salidas: si todo queda en ✓, las tablas coinciden.
- **Objetivo educativo:** Vas a ver que dos expresiones son equivalentes si su tabla de verdad coincide.
- **Interactividad sugerida:** permitir elegir dos expresiones de ejemplos predefinidos y resaltar cualquier fila donde difieran.

### Fórmulas relacionadas

- `ALG-BOO-004`
- `ALG-BOO-007`

---

# 26. Aritmética modular

## 26.1 Congruencia modular
**ID:** `ALG-MOD-001`  
**Nivel:** `intermedio`

\[
a\equiv b\pmod n\iff n\mid(a-b)
\]

**Descripción corta:** Define igualdad de residuos módulo n.

### Visualización sugerida

- **Tipo:** `modular_clock`
- **Modo:** `congruence`
- **Concepto visual:** congruencia como misma posición en un reloj modular.
- **Elementos:** círculo con residuos \(0,1,\ldots,n-1\), números como \(a\) y \(b\) cayendo sobre el mismo residuo.
- **Idea:** Mueve \(a\) y \(b\): el texto dice si \(a\equiv b\pmod{m}\) cuando comparten marca.
- **Objetivo educativo:** Vas a ver que \(a\) y \(b\) son congruentes módulo \(m\) si caen en el mismo “tick” del reloj.
- **Interactividad sugerida:** deslizadores para \(a,b,n\); marcar automáticamente si son congruentes y visualizar sus posiciones.

### Fórmulas relacionadas

- `ALG-MOD-002`
- `ALG-MOD-003`

---

## 26.2 Operaciones modulares
**ID:** `ALG-MOD-002`  
**Nivel:** `intermedio`

\[
a\equiv b,\;c\equiv d\pmod n\Rightarrow a+c\equiv b+d,\;ac\equiv bd\pmod n
\]

**Descripción corta:** Congruencias se preservan bajo suma y producto.

### Visualización sugerida

- **Tipo:** `modular_clock`
- **Concepto visual:** suma y multiplicación como desplazamientos en un reloj modular.
- **Elementos:** reloj módulo \(n\), punto inicial y saltos para sumar o multiplicar residuos.
- **Idea:** Cambia \(a\), \(b\) y \(m\): las marcas muestran \(a+b\) y \(a\cdot b\) en el círculo.
- **Objetivo educativo:** Vas a ver que sumar y multiplicar módulo \(m\) es operar y volver al reloj \(0\ldots m-1\).
- **Interactividad sugerida:** seleccionar operación, operandos y módulo; animar los saltos y mostrar el residuo final.

### Fórmulas relacionadas

- `ALG-MOD-001`
- `ALG-BOO-005`

---

## 26.3 Inverso modular
**ID:** `ALG-MOD-003`  
**Nivel:** `intermedio`

\[
aa^{-1}\equiv1\pmod n\iff\gcd(a,n)=1
\]

**Descripción corta:** El inverso existe exactamente cuando a y n son coprimos.

### Visualización sugerida

- **Tipo:** `modular_clock`
- **Concepto visual:** inverso modular como número que lleva el producto al residuo 1.
- **Elementos:** reloj módulo \(n\) o tabla de multiplicación de residuos; fila de \(a\) resaltada y celda donde aparece 1.
- **Idea:** Prueba varios \(a\): si no hay inverso, el texto lo indica.
- **Objetivo educativo:** Vas a ver que el inverso de \(a\) módulo \(m\) existe solo si \(\gcd(a,m)=1\).
- **Interactividad sugerida:** selector de \(a,n\); resaltar automáticamente el inverso si existe y mostrar el gcd.

### Fórmulas relacionadas

- `ALG-MOD-004`
- `ALG-EST-006`

---

## 26.4 Identidad de Bézout
**ID:** `ALG-MOD-004`  
**Nivel:** `intermedio`

\[
ax+by=\gcd(a,b)
\]

**Descripción corta:** Conecta el máximo común divisor con combinaciones lineales enteras.

### Fórmulas relacionadas

- `ALG-MOD-003`
- `ALG-MOD-005`

---

## 26.5 Teorema chino del resto
**ID:** `ALG-MOD-005`  
**Nivel:** `avanzado`

\[
x\equiv a_i\pmod{n_i};\quad N=\prod_i n_i
\]

**Descripción corta:** Sistemas con módulos coprimos tienen solución única módulo N.

### Visualización sugerida

- **Tipo:** `modular_clock`
- **Concepto visual:** sincronización de varias congruencias en un único ciclo.
- **Elementos:** dos o tres relojes modulares con módulos coprimos y una línea temporal común de enteros.
- **Idea:** Ajusta \(a\), \(b\), \(m\) y \(m_2\): cuando existe, aparece el \(x\) que cumple ambos restos.
- **Objetivo educativo:** Vas a ver que el teorema chino combina dos relojes (\(m\) y \(m_2\)) en una solución \(x\).
- **Interactividad sugerida:** permitir elegir pequeños módulos coprimos y residuos; avanzar por enteros hasta encontrar la coincidencia.

### Fórmulas relacionadas

- `ALG-MOD-001`

---

## 26.6 Pequeño teorema de Fermat
**ID:** `ALG-MOD-006`  
**Nivel:** `avanzado`

\[
a^{p-1}\equiv1\pmod p\quad(p\nmid a)
\]

**Descripción corta:** Resultado central para aritmética modular y criptografía.

### Visualización sugerida

- **Tipo:** `modular_clock`
- **Concepto visual:** ciclo de potencias no nulas módulo un primo.
- **Elementos:** reloj o tabla con residuos de \(a,a^2,\ldots,a^{p-1}\pmod p\).
- **Idea:** Con \(m\) primo, mira \(a^{p-1}\) en el caption; debería ser 1 si \(\gcd(a,p)=1\).
- **Objetivo educativo:** Vas a ver que Fermat: si \(p\) es primo y \(p\) no divide \(a\), entonces \(a^{p-1}\equiv 1\pmod{p}\).
- **Interactividad sugerida:** selector de primo pequeño \(p\) y base \(a\); animar las potencias sucesivas y sus residuos.

### Fórmulas relacionadas

- `ALG-MOD-003`
- `ALG-EST-006`

---

# 27. Estructuras algebraicas

## 27.1 Grupo
**ID:** `ALG-EST-001`  
**Nivel:** `avanzado`

\[
(G,*)\text{ con clausura, asociatividad, identidad e inversos}
\]

**Descripción corta:** Estructura algebraica con una operación invertible en sentido grupal.

### Fórmulas relacionadas

- `ALG-EST-002`
- `ALG-EST-003`

---

## 27.2 Grupo abeliano
**ID:** `ALG-EST-002`  
**Nivel:** `avanzado`

\[
a*b=b*a
\]

**Descripción corta:** Grupo cuya operación además es conmutativa.

### Fórmulas relacionadas

- `ALG-EST-001`
- `ALG-EST-004`

---

## 27.3 Criterio de subgrupo
**ID:** `ALG-EST-003`  
**Nivel:** `avanzado`

\[
a,b\in H\Rightarrow ab^{-1}\in H
\]

**Descripción corta:** Criterio compacto para verificar subgrupos no vacíos.

### Fórmulas relacionadas

- `ALG-EST-001`

---

## 27.4 Anillo
**ID:** `ALG-EST-004`  
**Nivel:** `avanzado`

\[
a(b+c)=ab+ac;\quad(a+b)c=ac+bc
\]

**Descripción corta:** Estructura con suma tipo grupo abeliano y multiplicación distributiva.

### Fórmulas relacionadas

- `ALG-EST-005`

---

## 27.5 Cuerpo
**ID:** `ALG-EST-005`  
**Nivel:** `avanzado`

\[
a\ne0\Rightarrow a^{-1}\text{ existe}
\]

**Descripción corta:** Anillo conmutativo donde todo elemento no nulo es invertible.

### Fórmulas relacionadas

- `ALG-EST-006`
- `ALG-ESP-001`

---

## 27.6 Cuerpo finito primo
**ID:** `ALG-EST-006`  
**Nivel:** `avanzado`

\[
\mathbb F_p=\mathbb Z/p\mathbb Z\quad(p\text{ primo})
\]

**Descripción corta:** Campo finito fundamental en criptografía y teoría de códigos.

### Visualización sugerida

- **Tipo:** `finite_field`
- **Concepto visual:** tablas de operación de un cuerpo finito primo.
- **Elementos:** tablas de suma y multiplicación de \(\mathbb F_p\), con filas/columnas de residuos y elementos identidad resaltados.
- **Idea:** Elige \(p\) y abre **Tabla +** / **Tabla ·**; pulsa una celda para ver el resultado e inverso.
- **Objetivo educativo:** Vas a ver que en un cuerpo finito, suma y producto se envuelven módulo \(p\).
- **Interactividad sugerida:** selector de \(p=2,3,5,7\); hacer clic en un elemento para resaltar su inverso aditivo y multiplicativo.

### Fórmulas relacionadas

- `ALG-MOD-003`
- `ALG-MOD-006`

---

## 27.7 Homomorfismo
**ID:** `ALG-EST-007`  
**Nivel:** `avanzado`

\[
\varphi(ab)=\varphi(a)\varphi(b)
\]

**Descripción corta:** Aplicación que preserva la operación algebraica.

### Fórmulas relacionadas

- `ALG-EST-008`
- `ALG-TRA-001`

---

## 27.8 Isomorfismo
**ID:** `ALG-EST-008`  
**Nivel:** `avanzado`

\[
A\cong B
\]

**Descripción corta:** Homomorfismo biyectivo; indica equivalencia estructural.

### Fórmulas relacionadas

- `ALG-EST-007`
- `ALG-FUN-003`

---


# 28. Códigos lineales y corrección de errores

> Aplicación algebraica de espacios vectoriales y cuerpos finitos. Esta sección introduce el núcleo matemático de los códigos lineales sin convertir el curso en una materia completa de Teoría de Códigos.

## 28.1 Código lineal sobre un cuerpo finito
**ID:** `ALG-COD-001`  
**Nivel:** `avanzado`

Un código lineal \(C\) de longitud \(n\) sobre \(\mathbb F_q\) es un subespacio vectorial:

\[
C\le \mathbb F_q^n.
\]

Si

\[
\dim(C)=k,
\]

se denomina código lineal \([n,k]_q\).

**Descripción corta:** Un conjunto de palabras código cerrado bajo suma y multiplicación por escalares del cuerpo finito.

### Visualización sugerida
- **Tipo:** `finite_field`
- **Concepto visual:** un código lineal como subespacio dentro de \(\mathbb F_q^n\).
- **Elementos:** para un ejemplo pequeño sobre \(\mathbb F_2\), mostrar todas las palabras de \(\mathbb F_2^3\) y resaltar únicamente las que pertenecen al código.
- **Idea:** Lee la lista de codewords: su suma permanece dentro del conjunto.
- **Objetivo educativo:** Vas a ver que un código lineal es un subespacio: sumar palabras de código da otra palabra de código.
- **Interactividad sugerida:** seleccionar dos palabras código y mostrar su suma módulo 2.

### Fórmulas relacionadas
- `ALG-EST-006`
- `ALG-ESP-001`
- `ALG-COD-002`
- `ALG-COD-003`

---

## 28.2 Matriz generadora
**ID:** `ALG-COD-002`  
**Nivel:** `avanzado`

Para un código lineal \([n,k]_q\), una matriz generadora puede escribirse como

\[
G\in\mathbb F_q^{k\times n}.
\]

Un mensaje \(\mathbf m\in\mathbb F_q^k\) se codifica mediante

\[
\mathbf c=\mathbf mG.
\]

**Descripción corta:** Convierte un mensaje de \(k\) símbolos en una palabra código de \(n\) símbolos.

### Visualización sugerida
- **Tipo:** `matrix`
- **Modo:** `code`
- **Concepto visual:** codificación como producto vector-matriz en un cuerpo finito.
- **Elementos:** vector mensaje \(\mathbf m\), matriz \(G\), operaciones módulo \(2\) y palabra resultante \(\mathbf c=\mathbf mG\).
- **Idea:** Edita bits/entradas y piensa cada fila de \(G\) como un patrón base del código.
- **Objetivo educativo:** Vas a ver que la matriz generadora \(G\) fabrica palabras de código a partir de mensajes.
- **Interactividad sugerida:** editar un mensaje binario corto y recalcular la palabra código paso a paso.

### Complejidad computacional

Con una matriz generadora densa \(k\times n\), una codificación directa requiere

\[
O(kn)
\]

operaciones en \(\mathbb F_q\).

### Fórmulas relacionadas
- `ALG-MAT-004`
- `ALG-EST-006`
- `ALG-COD-001`
- `ALG-COD-003`

---

## 28.3 Matriz de comprobación de paridad
**ID:** `ALG-COD-003`  
**Nivel:** `avanzado`

Una matriz de comprobación \(H\) satisface, para toda palabra código \(\mathbf c\):

\[
H\mathbf c^T=\mathbf0.
\]

En un código \([n,k]_q\), típicamente

\[
H\in\mathbb F_q^{(n-k)\times n}.
\]

Además, con convenciones compatibles para \(G\) y \(H\):

\[
GH^T=0.
\]

**Descripción corta:** Define restricciones lineales que toda palabra código válida debe satisfacer.

### Visualización sugerida
- **Tipo:** `matrix`
- **Modo:** `code`
- **Concepto visual:** una palabra válida produce un vector de comprobación nulo.
- **Elementos:** palabra recibida \(\mathbf r\), matriz \(H\), síndrome \(\mathbf s=H\mathbf r^T\) en \(\mathbb F_2\).
- **Idea:** Invierte un bit y relaciona el fallo con un síndrome no nulo (en COD-004).
- **Objetivo educativo:** Vas a ver que \(H\) comprueba paridad: las palabras válidas cumplen \(Hc=0\).
- **Interactividad sugerida:** permitir activar/desactivar un error en una posición y observar el producto \(H\mathbf r^T\).

### Fórmulas relacionadas
- `ALG-COD-001`
- `ALG-COD-002`
- `ALG-COD-004`
- `ALG-ORT-001`

---

## 28.4 Síndrome
**ID:** `ALG-COD-004`  
**Nivel:** `avanzado`

Si se recibe una palabra \(\mathbf r\), su síndrome es

\[
\mathbf s=H\mathbf r^T.
\]

Si \(\mathbf r\) es una palabra código válida:

\[
\mathbf s=\mathbf0.
\]

Si \(\mathbf r=\mathbf c+\mathbf e\), entonces

\[
\mathbf s=H\mathbf e^T.
\]

**Descripción corta:** Resume qué restricciones de paridad incumple una palabra recibida.

### Visualización sugerida
- **Tipo:** `error_correction`
- **Concepto visual:** un error cambia el síndrome sin necesidad de comparar con el mensaje original.
- **Elementos:** palabra transmitida, canal con un error marcado, palabra recibida, matriz \(H\) y síndrome resultante.
- **Idea:** Elige la posición del error: el síndrome \(s\) cambia al instante.
- **Objetivo educativo:** Vas a ver que el síndrome señala (en códigos simples) dónde está el bit erróneo.
- **Interactividad sugerida:** hacer clic en una posición para introducir un error binario y recalcular \(\mathbf s\).

### Complejidad computacional

Para una matriz de comprobación densa \((n-k)\times n\), calcular un síndrome directamente cuesta

\[
O(n(n-k))
\]

operaciones en el cuerpo finito.

### Fórmulas relacionadas
- `ALG-COD-003`
- `ALG-COD-005`
- `ALG-COD-006`

---

## 28.5 Distancia y peso de Hamming
**ID:** `ALG-COD-005`  
**Nivel:** `avanzado`

La distancia de Hamming entre dos palabras es

\[
d_H(\mathbf x,\mathbf y)
=
|\{i:x_i\neq y_i\}|.
\]

El peso de Hamming es

\[
w_H(\mathbf x)
=
d_H(\mathbf x,\mathbf0).
\]

**Descripción corta:** Cuenta cuántas posiciones difieren entre dos palabras.

### Visualización sugerida
- **Tipo:** `error_correction`
- **Concepto visual:** distancia como número de símbolos distintos.
- **Elementos:** dos cadenas alineadas, posiciones iguales atenuadas, posiciones diferentes resaltadas y contador de diferencias.
- **Idea:** Edita las dos cadenas: los bits distintos se resaltan y \(d_H\) se actualiza.
- **Objetivo educativo:** Vas a ver que la distancia de Hamming cuenta en cuántas posiciones difieren dos palabras.
- **Interactividad sugerida:** cadenas binarias editables de igual longitud.

### Fórmulas relacionadas
- `ALG-VEC-006`
- `ALG-COD-004`
- `ALG-COD-006`

---

## 28.6 Distancia mínima, detección y corrección
**ID:** `ALG-COD-006`  
**Nivel:** `avanzado`

La distancia mínima de un código es

\[
d_{\min}
=
\min_{\mathbf c_1\neq\mathbf c_2}
d_H(\mathbf c_1,\mathbf c_2).
\]

Un código con distancia mínima \(d_{\min}\) puede detectar hasta

\[
d_{\min}-1
\]

errores y corregir hasta

\[
t
=
\left\lfloor
\frac{d_{\min}-1}{2}
\right\rfloor
\]

errores en el modelo clásico de errores de símbolos.

Para un código lineal:

\[
d_{\min}
=
\min_{\mathbf c\neq\mathbf0}w_H(\mathbf c).
\]

**Descripción corta:** La separación entre palabras código determina la capacidad teórica de detección y corrección.

### Visualización sugerida
- **Tipo:** `error_correction`
- **Concepto visual:** bolas de Hamming alrededor de palabras código.
- **Elementos:** varias palabras código como centros, vecindarios de radio \(t\), una palabra recibida y distancias a los centros.
- **Idea:** Mueve \(d_{\min}\): el radio de corrección \(t=\lfloor(d-1)/2\rfloor\) cambia con él.
- **Objetivo educativo:** Vas a ver que con distancia mínima \(d\) puedes detectar/corregir una cantidad limitada de errores.
- **Interactividad sugerida:** slider para \(d_{\min}\) en ejemplos pequeños y visualización del número de errores detectables/corregibles.

### Fórmulas relacionadas
- `ALG-COD-001`
- `ALG-COD-005`
- `ALG-COD-007`

---

## 28.7 Tasa de un código lineal
**ID:** `ALG-COD-007`  
**Nivel:** `avanzado`

Para un código lineal \([n,k]_q\), la tasa es

\[
R=\frac{k}{n}.
\]

**Descripción corta:** Fracción de símbolos de la palabra codificada que representan información independiente.

### Visualización sugerida
- **Tipo:** `error_correction`
- **Concepto visual:** relación entre información y redundancia.
- **Elementos:** una palabra de longitud \(n\) dividida visualmente en \(k\) grados de libertad informativos y \(n-k\) símbolos de redundancia, sin asumir necesariamente una forma sistemática concreta del código.
- **Idea:** Ajusta \(n\) y \(k\): la barra muestra la parte de mensaje frente a la de redundancia.
- **Objetivo educativo:** Vas a ver que la tasa \(k/n\) mide cuánta información útil llevas frente a la longitud total.
- **Interactividad sugerida:** controles enteros para \(n\) y \(k\) con \(0<k\le n\).

### Fórmulas relacionadas
- `ALG-COD-001`
- `ALG-COD-006`

---

# 29. Mapas de relaciones

Estos mapas pueden alimentar una sección **Relacionadas** o un grafo interactivo en la web.

## Fundamentos

```text
Distributiva → Productos notables → Factorización
Potencias → Radicales → Racionalización
Cuadrática → Discriminante → Raíces → Factorización → Viète
Polinomios univariables → Polinomios multivariables → Sistemas polinómicos → Resultantes
```

## Funciones

```text
Dominio → Operaciones → Composición → Inversa
Exponencial ↔ Logaritmo → Propiedades logarítmicas
```

## Álgebra lineal

```text
Vectores → Combinación lineal → Span → Independencia → Base → Dimensión
Matrices → Sistemas → Gauss → Rango/Nulidad
Transformaciones → Núcleo/Imagen → Valores propios → Diagonalización
Producto punto → Ortogonalidad → Proyección → Mínimos cuadrados → QR/SVD
Matrices → Normas matriciales → SVD → Norma espectral → Número de condición
```

## Ciencias de la computación

```text
Álgebra booleana → De Morgan → XOR → Simplificación lógica
Congruencias → Inversos modulares → CRT/Fermat → Cuerpos finitos
Cuerpos finitos → Códigos lineales → G/H → Síndrome → Distancia de Hamming → Corrección
```

# 30. Fronteras con otras materias

Para evitar duplicación en la web, estos temas conviene enlazarlos pero ubicarlos principalmente en otras materias:

- **Precálculo / Trigonometría:** identidades trigonométricas, ecuaciones trigonométricas, coordenadas polares y cónicas extensas.
- **Cálculo:** límites, derivadas, integrales, series generales y ecuaciones diferenciales.
- **Matemática discreta:** combinatoria, grafos, relaciones, lógica formal extensa y teoría de números completa.
- **Teoría de códigos / Teoría de la información:** Reed-Solomon, BCH, códigos convolucionales, LDPC, códigos turbo, capacidad de canal y tratamiento completo de decodificación.
- **Probabilidad y estadística:** variables aleatorias, distribuciones, inferencia y estimación.
- **Métodos numéricos:** análisis detallado de error, estabilidad algorítmica, matrices dispersas, métodos iterativos y variantes numéricas especializadas. En este catálogo se conserva el número de condición por su vínculo algebraico directo con normas e inversas.

# Plantilla para nuevas fórmulas

```markdown
## Nombre
**ID:** `ALG-XXX-000`  
**Nivel:** `fundamental | intermedio | avanzado`

\[
formula
\]

**Descripción corta:** ...

### Visualización sugerida
- **Tipo:** `graph | vector | matrix | ...`
- **Concepto visual:** indicar el fenómeno algebraico concreto que debe representar la visualización.
- **Elementos:** enumerar objetos visibles, etiquetas, ejes, regiones, vectores, matrices o estados necesarios.
- **Idea:** describir exactamente qué debe ocurrir o compararse en la representación.
- **Objetivo educativo:** explicar qué relación debe comprender el estudiante después de verla.
- **Interactividad sugerida:** indicar controles, arrastre, pasos, animaciones o estados que aporten valor; usar `ninguna` si una imagen estática es suficiente.

### Condiciones
- ...

### Complejidad computacional (opcional)
- **Supuestos:** ...
- **Tiempo:** `O(...)`
- **Espacio adicional:** `O(...)`
- **Notas:** indicar si existen algoritmos más rápidos o si el coste depende de estructura dispersa/especial.

### Fórmulas relacionadas
- `ALG-XXX-001`
```

# Modelo de datos sugerido para el parser web

```text
id
subject
block
category
name
level
formula_latex
short_description
visual.type
visual.concept
visual.elements
visual.idea
visual.learning_objective
visual.interaction
conditions[]
computational_cost.applicable
computational_cost.assumptions
computational_cost.time
computational_cost.space
computational_cost.notes
related_formula_ids[]
```

## Campos opcionales por orientación CS

Las entradas con coste algorítmico pueden incluir `computational_cost`. Las aplicaciones de cuerpos finitos pueden incluir además etiquetas como `application: coding-theory` sin modificar la fórmula principal.

La interfaz puede ofrecer dos modos: **modo consulta** (nombre + fórmula + relacionadas) y **modo aprendizaje** (fórmula + explicación + visualización + condiciones + relacionadas).
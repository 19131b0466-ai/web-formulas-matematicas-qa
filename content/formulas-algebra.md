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
- **Idea:** instrucción breve y clara: qué probar con los controles.
- **Objetivo educativo:** en una frase, qué entiende el usuario al usar el gráfico.
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
- **Idea:** Pulsa Intercambiar: los bloques cambian de sitio, pero la barra total sigue igual.
- **Objetivo educativo:** El orden de los sumandos no cambia el resultado.
- **Interactividad sugerida:** permitir arrastrar los bloques \(a\) y \(b\) para intercambiarlos; actualizar el orden escrito sin modificar el total.

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
- **Concepto visual:** cambio de agrupación sin cambiar el resultado.
- **Elementos:** tres bloques \(a,b,c\), dos esquemas de agrupación con llaves o contenedores: \((a+b)+c\) y \(a+(b+c)\).
- **Idea:** Pulsa Agrupar izquierda/derecha. Solo cambia el recuadro; el total  a+b+c  sigue igual.
- **Objetivo educativo:** Aunque agrupes los números de otra forma, la suma (o el producto) no cambia.
- **Interactividad sugerida:** permitir alternar entre las dos agrupaciones y mostrar el cálculo parcial que se realiza primero.

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
- **Concepto visual:** distribución de un factor sobre una suma.
- **Elementos:** un rectángulo de altura \(a\) y ancho \(b+c\), dividido verticalmente en regiones \(ab\) y \(ac\).
- **Idea:** Mueve a, b y c: el rectángulo grande a(b+c) se parte en ab y ac con la misma área total.
- **Objetivo educativo:** Multiplicar una suma es como sumar las áreas de dos rectángulos.
- **Interactividad sugerida:** permitir variar \(a,b,c\) con controles y actualizar las áreas y la identidad en tiempo real.

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
- **Concepto visual:** valor absoluto como distancia al cero.
- **Elementos:** recta numérica, origen, punto móvil \(x\), segmento desde \(0\) hasta \(x\) y etiqueta \(|x|\).
- **Idea:** Mueve x a la izquierda o a la derecha: la marca muestra cuánto se aleja del origen.
- **Objetivo educativo:** El valor absoluto es la distancia al cero: nunca es negativo.
- **Interactividad sugerida:** permitir arrastrar \(x\) sobre la recta; mostrar simultáneamente \(x\), \(-x\) y \(|x|\).

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
- **Concepto visual:** distancia entre dos puntos reales.
- **Elementos:** recta numérica con puntos móviles \(a\) y \(b\), segmento resaltado entre ambos y valor \(|a-b|\).
- **Idea:** Mueve a y b: la distancia |a−b| se ve como la longitud entre ambos puntos.
- **Objetivo educativo:** La distancia entre dos puntos es el largo del segmento que los une.
- **Interactividad sugerida:** permitir arrastrar ambos puntos y actualizar distancia, diferencia \(a-b\) y valor absoluto.

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
- **Concepto visual:** suma de exponentes como unión de factores iguales.
- **Elementos:** dos grupos de factores \(a\): uno con \(m\) copias y otro con \(n\) copias, seguidos por un solo grupo con \(m+n\) copias.
- **Idea:** Cambia n y m: los bloques de a^n y a^m se juntan en a^(n+m).
- **Objetivo educativo:** Al multiplicar potencias de la misma base, los exponentes se suman.
- **Interactividad sugerida:** controles enteros pequeños para \(m\) y \(n\); regenerar la cadena de factores y el exponente resultante.

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
- **Concepto visual:** eliminación de un radical del denominador mediante el conjugado.
- **Elementos:** fracción inicial, conjugado resaltado, producto numerador-denominador y aparición de una diferencia de cuadrados en el denominador.
- **Idea:** Compara a+√b con a−√b: su producto deja un resultado sin raíz en el medio.
- **Objetivo educativo:** El conjugado ayuda a quitar una raíz del denominador.
- **Interactividad sugerida:** avance por pasos: elegir conjugado → multiplicar → aplicar diferencia de cuadrados → simplificar.

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
- **Concepto visual:** distribución completa en el producto de polinomios.
- **Elementos:** dos polinomios en los bordes de una cuadrícula; cada celda contiene el producto de un término de la primera expresión por uno de la segunda.
- **Idea:** Mira la cuadrícula (a+b)(c+d): cada celda es un producto; juntas forman el polinomio.
- **Objetivo educativo:** Cada casilla del producto es un término; luego se agrupan los parecidos.
- **Interactividad sugerida:** resaltar una celda al pasar el cursor y destacar los dos términos que la generan; botón para agrupar términos semejantes.

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
- **Concepto visual:** área de un cuadrado de lado \(a+b\).
- **Elementos:** cuadrado dividido en cuatro regiones: \(a^2\), \(ab\), \(ab\) y \(b^2\).
- **Idea:** Cambia a y b: el cuadrado grande es a² + 2ab + b².
- **Objetivo educativo:** (a+b)² se ve como un cuadrado partido en cuatro piezas.
- **Interactividad sugerida:** deslizadores para \(a\) y \(b\); actualizar dimensiones y áreas manteniendo etiquetas proporcionales.

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
- **Concepto visual:** cuadrado de una diferencia como reducción de longitud.
- **Elementos:** cuadrado de lado \(a\), franjas de ancho \(b\) retiradas y región restante de lado \(a-b\).
- **Idea:** Ajusta a y b y observa cómo aparecen a², −2ab y +b².
- **Objetivo educativo:** (a−b)² también es un área, con una corrección en la esquina.
- **Interactividad sugerida:** controlar \(a>b\ge0\) y animar la retirada de las dos franjas.

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
- **Concepto visual:** reorganización geométrica de una diferencia de áreas.
- **Elementos:** cuadrado grande de lado \(a\), cuadrado retirado de lado \(b\), y piezas reordenadas como rectángulo de lados \(a-b\) y \(a+b\).
- **Idea:** Pulsa para pasar de a²−b² al rectángulo (a−b)(a+b): es la misma cantidad.
- **Objetivo educativo:** a²−b² es el área que queda al quitar un cuadrado pequeño de uno grande.
- **Interactividad sugerida:** botón “reordenar” que anime las piezas desde la figura original hasta el rectángulo final.

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
- **Concepto visual:** coeficientes del binomio desde el triángulo de Pascal.
- **Elementos:** triángulo de Pascal, fila \(n\) resaltada y expansión de \((a+b)^n\) alineada término a término.
- **Idea:** Cambia n: ves los números de Pascal y cómo se arma (a+b)^n.
- **Objetivo educativo:** Los coeficientes del binomio son la fila de Pascal.
- **Interactividad sugerida:** selector de \(n\) pequeño; al cambiarlo, regenerar la fila y la expansión completa.

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
- **Concepto visual:** extracción de un factor común como distributiva inversa.
- **Elementos:** dos productos \(ab\) y \(ac\) con el factor \(a\) resaltado en ambos y una flecha hacia \(a(b+c)\).
- **Idea:** Mueve a, b y c: el rectángulo a(b+c) se ve igual que ab+ac.
- **Objetivo educativo:** Sacar factor común es reagrupar áreas que comparten un lado.
- **Interactividad sugerida:** hacer clic sobre factores repetidos para seleccionarlos como factor común y verificar el resultado.

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
- **Concepto visual:** factorización de diferencia de cuadrados.
- **Elementos:** misma construcción de áreas que ALG-IDN-003, pero iniciando desde \(a^2-b^2\) y terminando en los factores \((a-b)(a+b)\).
- **Idea:** Alterna entre a²−b² y (a−b)(a+b) para ver que representan lo mismo.
- **Objetivo educativo:** Factorizar a²−b² es rearmar el área sobrante como un rectángulo.
- **Interactividad sugerida:** permitir alternar entre “forma expandida” y “forma factorizada” con la misma figura.

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
- **Concepto visual:** reconocimiento de un trinomio como cuadrado perfecto.
- **Elementos:** cuatro piezas de área: \(a^2\), dos rectángulos \(ab\) y \(b^2\), que encajan formando un cuadrado.
- **Idea:** Ajusta a y b hasta ver el patrón (a±b)² en las piezas.
- **Objetivo educativo:** Un trinomio cuadrado perfecto se arma como un cuadrado completo.
- **Interactividad sugerida:** arrastrar las piezas hasta completar el cuadrado y revelar la factorización.

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
- **Concepto visual:** solución de una ecuación lineal como intersección con el eje x.
- **Elementos:** plano cartesiano, recta \(y=ax+b\), eje \(x\) y punto marcado en \(x=-b/a\).
- **Idea:** Mueve la pendiente y el intercepto; busca dónde la recta cruza el eje horizontal.
- **Objetivo educativo:** Una ecuación lineal es una recta: la solución es donde corta al eje x.
- **Interactividad sugerida:** deslizadores para \(a\neq0\) y \(b\); mostrar el valor de la raíz y la intersección.

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
- **Concepto visual:** raíces de una cuadrática como cortes de la parábola.
- **Elementos:** parábola \(y=ax^2+bx+c\), eje \(x\), raíces marcadas y fórmula cuadrática junto a la gráfica.
- **Idea:** Cambia a, b y c: mira el discriminante Δ y las marcas naranjas de las raíces.
- **Objetivo educativo:** La parábola corta al eje x en las soluciones (si existen).
- **Interactividad sugerida:** controles para \(a,b,c\); recalcular raíces y mover los puntos de intersección.

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
- **Concepto visual:** efecto del discriminante sobre el número de raíces reales.
- **Elementos:** tres estados de una parábola: dos cortes, tangencia y ningún corte con el eje \(x\), junto al valor de \(\Delta\).
- **Idea:** Ajusta a, b y c y observa si hay 2, 1 o ninguna raíz real según Δ.
- **Objetivo educativo:** El discriminante dice cuántas raíces reales tiene la cuadrática.
- **Interactividad sugerida:** deslizador de \(c\) o \(b\); cambiar automáticamente el estado y etiquetar el discriminante.

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
- **Concepto visual:** completar un cuadrado añadiendo la pieza faltante.
- **Elementos:** región \(x^2\), dos rectángulos de dimensiones \(x\) y \(b/2\), y un pequeño cuadrado \((b/2)^2\).
- **Idea:** Pulsa Añadir/Restar (b/2)²: verás de dónde sale el término b²/4.
- **Objetivo educativo:** Completar el cuadrado es añadir (y luego restar) la esquina que falta.
- **Interactividad sugerida:** animar la división del término \(bx\) en dos rectángulos y la adición/sustracción del cuadrado faltante.

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
- **Concepto visual:** soluciones simétricas de una ecuación de valor absoluto.
- **Elementos:** recta numérica con el origen, puntos \(-a\) y \(a\) y dos segmentos de longitud \(a\).
- **Idea:** Mueve el punto en la recta y relaciona las distancias con las soluciones.
- **Objetivo educativo:** Una ecuación con valor absoluto suele tener dos soluciones simétricas.
- **Interactividad sugerida:** deslizador para \(a\ge0\); mover los dos puntos solución simétricamente.

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
- **Concepto visual:** solución de una desigualdad como intervalo en la recta.
- **Elementos:** recta numérica, punto frontera \(-b/a\), extremo abierto o cerrado según el operador y semirrecta sombreada.
- **Idea:** Cambia el borde y el tipo de desigualdad: la zona sombreada es la solución.
- **Objetivo educativo:** Una inecuación lineal pinta un rayo o un intervalo en la recta.
- **Interactividad sugerida:** permitir cambiar \(a,b\) y el operador \(<,\le,>,\ge\); actualizar extremo y sombreado.

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
- **Concepto visual:** signo de una cuadrática mediante regiones de la parábola.
- **Elementos:** parábola, eje \(x\), raíces y sombreado de los intervalos del eje donde la función es positiva o negativa.
- **Idea:** Ajusta la parábola: la zona sombreada marca los x que cumplen la desigualdad.
- **Objetivo educativo:** La solución de una inecuación cuadrática es donde la parábola está por encima (o debajo) del eje.
- **Interactividad sugerida:** selector del operador y controles para los coeficientes; resaltar automáticamente los intervalos solución.

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
- **Concepto visual:** tabla de signos de una función racional.
- **Elementos:** recta numérica con ceros del numerador, ceros prohibidos del denominador, intervalos y signos \(+/-\).
- **Idea:** Mueve el borde y observa qué parte de la recta queda permitida.
- **Objetivo educativo:** En inecuaciones racionales hay que cuidar los puntos donde el denominador se anula.
- **Interactividad sugerida:** permitir activar cada factor para ver cómo cambia su signo y cómo se obtiene el signo total.

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
- **Concepto visual:** valor absoluto como intervalo de distancias permitidas.
- **Elementos:** recta numérica con centro 0, fronteras \(-a\) y \(a\), y regiones interiores/exteriores sombreadas.
- **Idea:** Cambia el radio y los extremos abiertos/cerrados para ver el intervalo solución.
- **Objetivo educativo:** El valor absoluto en desigualdades define intervalos centrados o exteriores.
- **Interactividad sugerida:** selector de desigualdad y deslizador para \(a\); cambiar extremos abiertos/cerrados y sombreado.

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
- **Concepto visual:** soluciones de un sistema 2×2 como intersección de rectas.
- **Elementos:** dos rectas en el plano y estados: una intersección, paralelas distintas o coincidentes.
- **Idea:** Mueve la pendiente: el punto naranja marca la intersección, o verás si son paralelas.
- **Objetivo educativo:** Un sistema 2×2 es dos rectas: la solución es su cruce (si se cortan).
- **Interactividad sugerida:** permitir modificar pendientes e interceptos de ambas rectas y actualizar la clasificación.

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
- **Concepto visual:** traducción de ecuaciones a la forma \(A\mathbf x=\mathbf b\).
- **Elementos:** sistema de ecuaciones a la izquierda, matriz \(A\), vector \(\mathbf x\) y vector \(\mathbf b\) a la derecha, con colores/etiquetas consistentes.
- **Idea:** Edita A y observa cómo se organiza la información del sistema.
- **Objetivo educativo:** El sistema se puede escribir como una sola ecuación con matrices: Ax = b.
- **Interactividad sugerida:** al pasar el cursor sobre un coeficiente de la ecuación, destacar su celda correspondiente en la matriz.

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
- **Concepto visual:** separación entre coeficientes y términos independientes.
- **Elementos:** matriz aumentada con barra vertical, columnas de coeficientes y columna final \(\mathbf b\).
- **Idea:** Elige R₁ o R₂: debajo aparece la ecuación que representa esa fila.
- **Objetivo educativo:** Cada fila de la matriz aumentada es una ecuación del sistema.
- **Interactividad sugerida:** seleccionar una fila para mostrar la ecuación que representa.

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
- **Concepto visual:** efecto de operaciones elementales sobre un sistema equivalente.
- **Elementos:** matriz aumentada antes y después de cada operación de fila, con fila afectada resaltada.
- **Idea:** Prueba intercambiar, escalar o sumar filas y mira cómo cambia A.
- **Objetivo educativo:** Las operaciones de fila cambian la matriz, pero el sistema sigue siendo equivalente.
- **Interactividad sugerida:** botones para aplicar \(R_i\leftrightarrow R_j\), \(cR_i\) y \(R_i+cR_j\), con historial de pasos.

### Complejidad computacional

Usar operaciones elementales para eliminación de Gauss sobre una matriz densa cuadrada \(n\times n\) requiere, con el algoritmo clásico,

\[
O(n^3)
\]

tiempo. El almacenamiento de la matriz es \(O(n^2)\). La sustitución hacia atrás, una vez obtenida la forma triangular, cuesta \(O(n^2)\).

### Fórmulas relacionadas

- `ALG-SIS-005`
- `ALG-DET-005`

---

## 9.5 Criterio de Rouché-Capelli
**ID:** `ALG-SIS-005`  
**Nivel:** `intermedio`

\[
\operatorname{rank}(A)=\operatorname{rank}([A|b])
\]

**Descripción corta:** Clasifica sistemas según rangos y número de incógnitas.

### Visualización sugerida

- **Tipo:** `matrix`
- **Modo:** `rank_compare`
- **Concepto visual:** comparación visual de rangos para decidir compatibilidad.
- **Elementos:** matriz \(A\) y matriz aumentada \([A|b]\) en forma escalonada, pivotes resaltados y contadores de rango.
- **Idea:** Haz A singular o no y mira el indicador de rango / ∅ / ∞.
- **Objetivo educativo:** Comparar rangos te dice si hay una, infinitas o ninguna solución.
- **Interactividad sugerida:** cambiar ejemplos predefinidos entre solución única, infinitas soluciones y sistema incompatible.

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
- **Concepto visual:** dominio como conjunto de entradas permitidas.
- **Elementos:** gráfica de una función con zonas válidas e inválidas del eje \(x\), incluyendo agujeros, asíntotas o extremos cuando corresponda.
- **Idea:** Mira la hipérbola 1/x: cerca de cero la curva se dispara; ese hueco es el dominio roto.
- **Objetivo educativo:** El dominio son los x donde la función tiene sentido (aquí, x ≠ 0).
- **Interactividad sugerida:** selector de ejemplos: polinómica, racional y radical; resaltar las restricciones que eliminan valores.

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
- **Concepto visual:** composición como proceso en dos etapas.
- **Elementos:** diagrama de flujo \(x\to g(x)\to f(g(x))\) y, opcionalmente, gráficas de \(g\) y \(f\).
- **Idea:** Mueve x₀ y los parámetros: el valor mostrado es f(g(x)).
- **Objetivo educativo:** Componer funciones es aplicar una después de la otra.
- **Interactividad sugerida:** campo para elegir un valor de \(x\); animar su recorrido y permitir intercambiar el orden de composición.

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
- **Concepto visual:** inversa como intercambio de entrada y salida.
- **Elementos:** gráficas de \(y=f(x)\), \(y=f^{-1}(x)\) y la recta \(y=x\).
- **Idea:** Compara la curva y su inversa; la diagonal punteada es el espejo y = x.
- **Objetivo educativo:** La inversa “deshace” la función: sus gráficas son simétricas respecto de y = x.
- **Interactividad sugerida:** permitir seleccionar puntos y reflejarlos; alternar entre una función invertible y otra que falla la prueba horizontal.

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
- **Concepto visual:** pendiente e intercepto de una recta.
- **Elementos:** recta \(y=mx+b\), triángulo de pendiente con cambio vertical/horizontal y punto de corte \((0,b)\).
- **Idea:** Mueve m y b: la recta se inclina y se desplaza al instante.
- **Objetivo educativo:** Una recta queda determinada por su pendiente y su corte con el eje y.
- **Interactividad sugerida:** deslizadores para \(m\) y \(b\); mostrar \(\Delta y/\Delta x\) sobre dos puntos de la recta.

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
- **Concepto visual:** paralelismo y perpendicularidad mediante pendientes.
- **Elementos:** dos rectas con sus pendientes etiquetadas y un indicador del ángulo entre ellas.
- **Idea:** Ajusta las dos rectas y observa cuándo no se cortan o se cruzan en ángulo recto.
- **Objetivo educativo:** Rectas paralelas tienen la misma pendiente; perpendiculares, pendientes inversas cambiadas de signo.
- **Interactividad sugerida:** modificar \(m_2\) y mostrar en tiempo real si las rectas son paralelas, perpendiculares o ninguna.

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
- **Concepto visual:** traslaciones horizontal y vertical de una gráfica.
- **Elementos:** gráfica base \(y=f(x)\) y copia transformada \(y=f(x-h)+k\), con flechas de desplazamiento.
- **Idea:** Mueve h y k: la curva se desplaza horizontal y verticalmente.
- **Objetivo educativo:** Trasladar una gráfica es moverla sin deformarla.
- **Interactividad sugerida:** deslizadores de \(h\) y \(k\) con superposición de la gráfica original y transformada.

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
- **Concepto visual:** escalamiento y reflexión de una función.
- **Elementos:** gráfica base y transformada para \(af(x)\), \(f(bx)\), \(-f(x)\) y \(f(-x)\).
- **Idea:** Cambia a y la reflexión: mira cómo se deforma la onda respecto del original.
- **Objetivo educativo:** Escalar y reflejar estiran, comprimen o voltean la curva.
- **Interactividad sugerida:** controles para \(a\) y \(b\), más interruptores de reflexión; mantener visible la gráfica original.

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
- **Concepto visual:** pasar de un polinomio univariable a uno de dos variables.
- **Elementos:** una expresión \(P(x,y)\), ejes \(x\), \(y\), \(z\) y la superficie \(z=P(x,y)\); resaltar además uno o dos monomios de la expresión.
- **Idea:** Mueve a, b y c: el mapa de color muestra z = ax² + bxy + cy².
- **Objetivo educativo:** Un polinomio en dos variables asigna un valor a cada punto (x, y).
- **Interactividad sugerida:** permitir modificar coeficientes y activar/desactivar términos para observar cómo cambia la superficie.

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
- **Concepto visual:** distinguir grado respecto de una variable y grado total.
- **Elementos:** monomios como \(x^3y^2\), \(xy^4\) y \(x^2yz^3\), con cada exponente resaltado y una suma visible de exponentes.
- **Idea:** Cambia α y β: el rectángulo ilustra el grado α+β del monomio x^α y^β.
- **Objetivo educativo:** El grado total suma los exponentes de cada variable.
- **Interactividad sugerida:** permitir editar exponentes enteros no negativos y recalcular el multiíndice y el grado total.

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
- **Concepto visual:** escalamiento uniforme de las variables en un polinomio homogéneo.
- **Elementos:** un punto \((x,y)\), un control de escala \(t\), la superficie de \(P\) y los valores \(P(x,y)\) y \(P(tx,ty)\).
- **Idea:** Activa la forma homogénea y mueve t: compara P(tx, ty) con t^d P(x, y).
- **Objetivo educativo:** En un polinomio homogéneo, escalar (x, y) escala el resultado de forma predecible.
- **Interactividad sugerida:** slider para \(t\) y selector del grado \(d\) usando ejemplos homogéneos predefinidos.

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
- **Concepto visual:** soluciones como intersecciones de conjuntos definidos por polinomios.
- **Elementos:** dos curvas implícitas en el plano, por ejemplo \(P(x,y)=0\) y \(Q(x,y)=0\), con sus puntos de intersección resaltados.
- **Idea:** Ajusta los parámetros y busca los cruces entre las dos curvas.
- **Objetivo educativo:** Un sistema polinómico se ve como curvas que se cortan en las soluciones.
- **Interactividad sugerida:** permitir elegir pares de polinomios sencillos y mostrar cómo cambia el número de intersecciones reales.

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
- **Concepto visual:** convertir coeficientes de dos polinomios en una matriz cuyo determinante detecta raíces comunes.
- **Elementos:** dos polinomios pequeños, por ejemplo cuadrático y lineal; sus vectores de coeficientes; la matriz de Sylvester construida por filas desplazadas; y el valor de su determinante.
- **Idea:** Edita la matriz y observa el determinante como señal de raíces compartidas.
- **Objetivo educativo:** La resultante concentra condiciones de solución común en una matriz.
- **Interactividad sugerida:** selector de dos polinomios predefinidos; resaltar la raíz común cuando la resultante sea cero.

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
- **Concepto visual:** crecimiento o decrecimiento de \(a^x\) según la base.
- **Elementos:** gráfica de \(y=a^x\), punto fijo \((0,1)\), asíntota horizontal \(y=0\) y valor de \(a\).
- **Idea:** Cambia la base: la curva se hace más empinada o más suave.
- **Objetivo educativo:** La exponencial crece (o decrece) multiplicando una y otra vez.
- **Interactividad sugerida:** deslizador para \(a>0, a\neq1\); mostrar valores seleccionados de \(x\) y \(a^x\).

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
- **Concepto visual:** logaritmo como inversa de la exponencial.
- **Elementos:** gráficas de \(y=b^x\), \(y=\log_bx\) y \(y=x\), con puntos correspondientes intercambiados.
- **Idea:** Compara log y exponencial: son inversas; la diagonal y = x las refleja.
- **Objetivo educativo:** El logaritmo responde: “¿a qué exponente elevo la base para obtener x?”.
- **Interactividad sugerida:** elegir \(x\) o \(y\) y animar la correspondencia entre ambas gráficas.

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
y=y_0e^{kt}
\]

**Descripción corta:** k positivo produce crecimiento; k negativo, decrecimiento.

### Visualización sugerida

- **Tipo:** `graph`
- **Concepto visual:** modelo exponencial a través del signo de \(k\).
- **Elementos:** curvas \(y=y_0e^{kt}\) con \(k>0\), \(k=0\) y \(k<0\), todas partiendo de \(y_0\).
- **Idea:** Mueve k (vía b) y mira si la curva sube o baja con el tiempo.
- **Objetivo educativo:** El signo del exponente decide si la cantidad crece o se apaga.
- **Interactividad sugerida:** deslizadores para \(y_0\) y \(k\); mostrar razón de cambio relativa y valores en tiempos seleccionados.

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
- **Concepto visual:** número complejo como punto/vector en el plano complejo.
- **Elementos:** eje real, eje imaginario, punto \((a,b)\), vector desde el origen y etiqueta \(z=a+bi\).
- **Idea:** Arrastra la punta: las coordenadas son la parte real e imaginaria.
- **Objetivo educativo:** Un complejo a+bi es un punto (o flecha) en el plano.
- **Interactividad sugerida:** arrastrar el punto y actualizar \(a\), \(b\) y \(z\).

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
- **Concepto visual:** conjugación como reflexión respecto del eje real.
- **Elementos:** puntos \(z=a+bi\) y \(\bar z=a-bi\), unidos por una línea vertical y reflejados respecto del eje real.
- **Idea:** Arrastra z: la flecha naranja es el conjugado (misma x, y al revés).
- **Objetivo educativo:** El conjugado refleja el número respecto del eje real.
- **Interactividad sugerida:** arrastrar \(z\); mostrar simultáneamente \(z\bar z=|z|^2\).

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
- **Concepto visual:** módulo como distancia al origen en el plano complejo.
- **Elementos:** triángulo rectángulo con catetos \(a\) y \(b\), hipotenusa desde el origen hasta \(z\).
- **Idea:** Estira o acorta el vector: el número r es esa longitud.
- **Objetivo educativo:** El módulo es la longitud de la flecha desde el origen.
- **Interactividad sugerida:** arrastrar \(z\) y actualizar catetos, módulo y círculo de radio \(|z|\).

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
- **Concepto visual:** equivalencia entre coordenadas rectangulares y polares.
- **Elementos:** vector complejo con módulo \(r\), ángulo \(\theta\), proyecciones \(r\cos\theta\) y \(r\sin\theta\), y formas \(a+bi\) y \(re^{i\theta}\).
- **Idea:** Gira θ: el punto se mueve sobre el círculo de radio r.
- **Objetivo educativo:** En forma polar usas longitud y ángulo en lugar de (x, y).
- **Interactividad sugerida:** controles para \(r\) y \(\theta\); actualizar \(a\), \(b\) y las tres representaciones.

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
- **Concepto visual:** fórmula de Euler sobre el círculo unitario.
- **Elementos:** círculo unitario, ángulo \(\theta\), punto \((\cos\theta,\sin\theta)\) y vector \(e^{i\theta}\).
- **Idea:** Mueve θ: el punto (cos θ, sin θ) recorre la circunferencia.
- **Objetivo educativo:** Euler une el ángulo con coseno y seno sobre el círculo unitario.
- **Interactividad sugerida:** deslizador angular o animación de rotación; actualizar seno, coseno y forma exponencial.

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
- **Concepto visual:** potencias complejas como multiplicación de ángulos.
- **Elementos:** círculo complejo con vector inicial de ángulo \(\theta\) y vector resultante de ángulo \(n\theta\).
- **Idea:** Cambia n y θ: ves z, z², z³… girando y alejándose según rⁿ.
- **Objetivo educativo:** Elevar a n multiplica el ángulo por n y potencia el radio.
- **Interactividad sugerida:** selector entero de \(n\) y deslizador de \(\theta\); animar las rotaciones sucesivas.

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
- **Concepto visual:** raíces complejas distribuidas uniformemente en una circunferencia.
- **Elementos:** círculo de radio \(r^{1/n}\) con \(n\) puntos separados por \(2\pi/n\).
- **Idea:** Cambia n: los puntos naranjas se distribuyen en el círculo.
- **Objetivo educativo:** Las raíces n-ésimas se repartan como vértices de un polígono regular.
- **Interactividad sugerida:** selector de \(n\) y controles de \(r,\theta\); regenerar los puntos y el polígono.

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
- **Concepto visual:** crecimiento lineal de una sucesión aritmética.
- **Elementos:** puntos discretos \((n,a_n)\) y diferencia constante \(d\) indicada entre alturas consecutivas.
- **Idea:** Mueve a₁ y d: los puntos suben o bajan a pasos constantes.
- **Objetivo educativo:** En una sucesión aritmética cada salto suma la misma cantidad.
- **Interactividad sugerida:** deslizadores para \(a_1\) y \(d\); actualizar los primeros términos y su gráfica discreta.

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
- **Concepto visual:** crecimiento multiplicativo de una sucesión geométrica.
- **Elementos:** puntos discretos \((n,a_n)\) y razón \(r\) mostrada entre términos consecutivos.
- **Idea:** Cambia a y r: los puntos crecen o se acercan a cero según |r|.
- **Objetivo educativo:** En una sucesión geométrica cada término se multiplica por r.
- **Interactividad sugerida:** deslizadores para \(a_1\) y \(r\); mostrar valores y cocientes consecutivos.

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
- **Concepto visual:** acumulación de una serie geométrica convergente.
- **Elementos:** barras o segmentos con longitudes \(a,ar,ar^2,\ldots\) y una barra de suma parcial que se acerca a \(a/(1-r)\).
- **Idea:** Prueba |r|<1 y |r|≥1: mira si los puntos se estabilizan o se disparan.
- **Objetivo educativo:** Si |r|<1, la serie geométrica infinita se acerca a un valor límite.
- **Interactividad sugerida:** control de \(r\) entre -0.95 y 0.95 y selector del número de términos; mostrar suma parcial y límite.

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
- **Concepto visual:** evolución de una recurrencia de orden 2 desde condiciones iniciales.
- **Elementos:** secuencia de puntos \(a_n\), flechas desde \(a_{n-1}\) y \(a_{n-2}\) hacia \(a_n\), y ecuación característica.
- **Idea:** Cambia los coeficientes y observa cómo evoluciona la sucesión punto a punto.
- **Objetivo educativo:** Una recurrencia construye cada término a partir de los anteriores.
- **Interactividad sugerida:** controles para \(c_1,c_2,a_0,a_1\); generar los primeros términos y mostrar las raíces características.

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
- **Concepto visual:** vector como lista ordenada y como flecha geométrica.
- **Elementos:** vector columna con componentes y, para 2D/3D, flecha desde el origen con proyecciones sobre ejes.
- **Idea:** Arrastra las puntas: cambias el vector en el desenlace del plano.
- **Objetivo educativo:** Un vector es una flecha: dirección y longitud.
- **Interactividad sugerida:** editar componentes y actualizar la flecha; para \(n>3\), mantener representación de barras/componentes.

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
- **Concepto visual:** norma como longitud de un vector.
- **Elementos:** vector en 2D, triángulo rectángulo formado por sus componentes y valor de \(\|v\|_2\).
- **Idea:** Estira u: el valor ‖u‖ se actualiza con la longitud.
- **Objetivo educativo:** La norma es la longitud de la flecha.
- **Interactividad sugerida:** arrastrar el extremo del vector y actualizar componentes, cuadrados y norma.

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
- **Concepto visual:** normalización sin cambiar dirección.
- **Elementos:** vector original \(v\) y vector unitario \(\hat v\) sobre la misma semirrecta, con longitudes etiquetadas.
- **Idea:** Mueve u: ves la versión “normalizada” û de longitud 1.
- **Objetivo educativo:** El vector unitario tiene longitud 1 y guarda la dirección.
- **Interactividad sugerida:** arrastrar \(v\); botón “normalizar” que anime el cambio de longitud a 1.

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
- **Modo:** `proj`
- **Concepto visual:** producto punto como proyección y alineación.
- **Elementos:** vectores \(u\) y \(v\), ángulo \(\theta\), proyección de uno sobre el otro y valor del producto punto.
- **Idea:** Arrastra u y v: mira u·v y si el ángulo es agudo, recto u obtuso; la proyección aparece en naranja.
- **Objetivo educativo:** El producto punto mide alineación: positivo = ángulo agudo.
- **Interactividad sugerida:** controlar el ángulo entre vectores y actualizar \(u\cdot v\), \(\cos\theta\) y la proyección.

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
- **Concepto visual:** ángulo determinado por producto punto y normas.
- **Elementos:** dos vectores, arco del ángulo entre ellos y panel con \(u\cdot v\), \(\|u\|\), \(\|v\|\) y \(\cos\theta\).
- **Idea:** Mueve las flechas: el ángulo y el tipo (agudo/recto/obtuso) se actualizan.
- **Objetivo educativo:** El ángulo entre vectores se lee del producto punto.
- **Interactividad sugerida:** arrastrar ambos vectores y actualizar el ángulo calculado.

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
- **Concepto visual:** distancia entre vectores como norma de su diferencia.
- **Elementos:** puntos \(u\) y \(v\), vector \(v-u\) trasladado entre ellos y segmento de distancia.
- **Idea:** Separa u y v: la distancia crece con la separación.
- **Objetivo educativo:** La distancia entre puntas de vectores es la norma de la diferencia.
- **Interactividad sugerida:** arrastrar ambos puntos y actualizar vector diferencia y distancia.

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
- **Concepto visual:** combinación lineal como suma de vectores escalados.
- **Elementos:** vectores base \(u,v\), copias escaladas \(au\), \(bv\) y resultante \(w=au+bv\) con paralelogramo guía.
- **Idea:** Arrastra u y v: la flecha naranja es 0.7u + 0.5v.
- **Objetivo educativo:** Una combinación lineal mezcla vectores con pesos.
- **Interactividad sugerida:** deslizadores para \(a\) y \(b\); dibujar la resultante y el rastro opcional de puntos alcanzables.

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
- **Concepto visual:** estructura fila-columna de una matriz.
- **Elementos:** matriz con índices \(i,j\), filas y columnas resaltables y dimensiones \(m\times n\).
- **Idea:** Edita las entradas de A: cada celda es un coeficiente del objeto lineal.
- **Objetivo educativo:** Una matriz es una tabla de números organizada en filas y columnas.
- **Interactividad sugerida:** clic en cualquier celda para mostrar \(a_{ij}\), número de fila y número de columna.

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
- **Concepto visual:** suma elemento a elemento.
- **Elementos:** matrices \(A\) y \(B\) del mismo tamaño y matriz resultado \(C\), con celdas correspondientes enlazadas.
- **Idea:** Cambia A y B: el resultado A+B se actualiza entrada por entrada.
- **Objetivo educativo:** Sumar matrices se hace casilla a casilla.
- **Interactividad sugerida:** seleccionar una celda del resultado y mostrar la suma exacta que la genera.

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
- **Concepto visual:** escalamiento uniforme de todas las entradas.
- **Elementos:** matriz \(A\), escalar \(c\) y matriz \(cA\), con flechas de cada celda hacia su producto.
- **Idea:** Mueve c: ves cA crecer, encogerse o cambiar de signo.
- **Objetivo educativo:** Multiplicar por un escalar estira o invierte todos los números de la matriz.
- **Interactividad sugerida:** deslizador para \(c\); actualizar todas las entradas y, opcionalmente, una figura transformada.

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
- **Concepto visual:** regla fila por columna del producto matricial.
- **Elementos:** matriz \(A\), matriz \(B\) y \(C=AB\); una fila de \(A\) y una columna de \(B\) resaltadas para calcular \(c_{ij}\).
- **Idea:** Elige una casilla (i,j): debajo ves la cuenta fila×columna paso a paso.
- **Objetivo educativo:** Cada entrada de AB mezcla una fila de A con una columna de B.
- **Interactividad sugerida:** clic sobre una celda \(c_{ij}\) para animar la fila y columna que la generan.

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
- **Concepto visual:** identidad como transformación que no cambia un vector o matriz.
- **Elementos:** matriz identidad con diagonal resaltada y comparación \(AI=A\), \(Ix=x\).
- **Idea:** Compara A con el efecto de la identidad sobre la base.
- **Objetivo educativo:** La identidad deja los vectores igual: es el “1” de las matrices.
- **Interactividad sugerida:** permitir multiplicar una matriz o vector de ejemplo por \(I\) y mostrar el resultado sin cambios.

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
- **Concepto visual:** transposición como intercambio de filas y columnas.
- **Elementos:** matriz \(A\) y \(A^T\) lado a lado, diagonal principal como eje de reflexión conceptual.
- **Idea:** Edita A: a la derecha ves Aᵀ con filas y columnas volcadas.
- **Objetivo educativo:** La transpuesta intercambia filas por columnas.
- **Interactividad sugerida:** pasar el cursor por una celda para resaltar su posición espejo en la transpuesta.

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
- **Concepto visual:** simetría matricial respecto de la diagonal principal.
- **Elementos:** matriz cuadrada con pares \(a_{ij}\) y \(a_{ji}\) conectados y diagonal principal destacada.
- **Idea:** Ajusta A hasta que coincida con Aᵀ.
- **Objetivo educativo:** Una matriz simétrica coincide con su transpuesta.
- **Interactividad sugerida:** editar una entrada fuera de la diagonal y ofrecer opción de reflejarla automáticamente en la posición simétrica.

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
- **Idea:** Mueve los vectores: el área coloreada es |det|; el signo indica orientación.
- **Objetivo educativo:** El determinante 2×2 es el área con signo del paralelogramo de las columnas.
- **Interactividad sugerida:** arrastrar los vectores columna; actualizar área, signo y valor del determinante.

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
- **Idea:** Edita A y observa cómo det(A) responde a los cambios.
- **Objetivo educativo:** El determinante se puede expandir por una fila o columna (cofactores).
- **Interactividad sugerida:** permitir elegir fila o columna de expansión y recorrer término por término.

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
- **Idea:** Cambia A y B y compara el área del producto con el producto de áreas.
- **Objetivo educativo:** det(AB) = det(A)det(B): las áreas se multiplican.
- **Interactividad sugerida:** usar matrices 2×2 simples seleccionables y animar la figura a través de ambas transformaciones.

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
- **Idea:** Haz el paralelogramo plano (área ≈ 0): la matriz se vuelve singular.
- **Objetivo educativo:** Si el área (det) es cero, las columnas son paralelas y no hay inversa.
- **Interactividad sugerida:** controlar entradas de una matriz 2×2 y mostrar simultáneamente determinante, rango e invertibilidad.

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
- **Idea:** Edita A y mira det: si no es cero, la inversa está bien definida.
- **Objetivo educativo:** La inversa “deshace” A; existe solo si det ≠ 0.
- **Interactividad sugerida:** seleccionar matrices 2×2 invertibles y animar transformación e inversión; bloquear el caso singular explicando por qué.

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
- **Idea:** Cambia A y b: relaciona det(A) con la posibilidad de solución única.
- **Objetivo educativo:** Cramer usa determinantes para resolver sistemas pequeños.
- **Interactividad sugerida:** selector de incógnita \(x_i\); construir visualmente la matriz correspondiente y calcular los determinantes.

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
- **Idea:** Mueve s y t: la flecha naranja barre el plano (o la recta) que generan u y v.
- **Objetivo educativo:** El espacio generado son todas las mezclas s·u + t·v.
- **Interactividad sugerida:** deslizadores para coeficientes y opción de mostrar el rastro de combinaciones.

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
- **Idea:** Alinea u y v: el indicador pasa a “dependientes”.
- **Objetivo educativo:** Si el área del paralelogramo es cero, los vectores son dependientes.
- **Interactividad sugerida:** arrastrar vectores y mostrar indicador “independientes/dependientes” junto al determinante.

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
- **Idea:** Activa “mostrar base” y compara con tus vectores u y v.
- **Objetivo educativo:** Una base es un conjunto independiente que genera todo el espacio.
- **Interactividad sugerida:** activar/desactivar vectores y recalcular span, rango y si el conjunto sigue siendo base.

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
- **Idea:** Cambia s y t: son las coordenadas de la combinación en la base u, v.
- **Objetivo educativo:** Las coordenadas dicen cuánto de cada vector de la base necesitas.
- **Interactividad sugerida:** permitir rotar/deformar una base válida y actualizar las coordenadas del mismo vector.

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
- **Idea:** Edita A: mira el determinante/rango para ver si hay 0, 1 o 2 direcciones.
- **Objetivo educativo:** El rango es cuántas direcciones independientes tiene la matriz.
- **Interactividad sugerida:** editar una matriz pequeña y actualizar pivotes, rango y visualización del espacio columna.

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
- **Idea:** Haz columnas dependientes y relaciona con direcciones que van al origen.
- **Objetivo educativo:** La nulidad cuenta soluciones no triviales de Ax = 0.
- **Interactividad sugerida:** arrastrar un vector dentro/fuera del núcleo y mostrar si \(Ax=0\).

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
- **Idea:** Explora vectores dependientes/independientes y cómo se reparte la dimensión.
- **Objetivo educativo:** Rango + nulidad = número de columnas (en el caso n).
- **Interactividad sugerida:** selector de matrices ejemplo con distintos rangos; actualizar ambos segmentos y bases asociadas.

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
- **Idea:** Mira la cuadrícula deformada por A: líneas rectas siguen siendo rectas.
- **Objetivo educativo:** Una transformación lineal respeta sumas y escalados.
- **Interactividad sugerida:** mover \(u,v\) o el escalar \(c\) y comprobar en tiempo real ambas igualdades.

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
- **Idea:** Cambia las entradas de A: la malla muestra el empujón lineal.
- **Objetivo educativo:** Aplicar A es empujar cada punto (y la cuadrícula) a una nueva forma.
- **Interactividad sugerida:** editar las cuatro entradas de una matriz 2×2 y animar la cuadrícula y vectores base.

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
- **Idea:** Busca direcciones que se aplastan cuando det se acerca a cero.
- **Objetivo educativo:** El núcleo son los vectores que A manda al origen.
- **Interactividad sugerida:** seleccionar matrices de rango completo o reducido y visualizar cómo cambia el núcleo.

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
- **Idea:** Observa hacia dónde apuntan las columnas transformadas e₁ y e₂.
- **Objetivo educativo:** La imagen son las direcciones que A sí puede alcanzar.
- **Interactividad sugerida:** arrastrar la entrada y dejar rastro de salidas; opción de mostrar vectores columna generadores.

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
- **Idea:** Cambia A y piensa A como un paso de la composición.
- **Objetivo educativo:** Componer transformaciones es aplicar una después de la otra (producto de matrices).
- **Interactividad sugerida:** botones “A luego B” y “BA directo” para superponer resultados y comprobar que coinciden.

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
- **Idea:** Pulsa Aplicar A⁻¹ (si existe): la malla vuelve hacia la forma original.
- **Objetivo educativo:** La inversa deshace el empujón de A.
- **Interactividad sugerida:** editar una matriz invertible y usar botones “aplicar A” / “aplicar A⁻¹”; advertir cuando no es invertible.

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
- **Idea:** Modifica A como matriz de cambio y mira cómo se reorienta la malla.
- **Objetivo educativo:** Cambiar de base es describir los mismos vectores con otras coordenadas.
- **Interactividad sugerida:** rotar o modificar la base destino y actualizar \([v]_\mathcal B\), \([v]_\mathcal C\) y la matriz de cambio.

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
- **Idea:** Activa autovectores: las rayas naranjas marcan esas direcciones especiales.
- **Objetivo educativo:** Un autovector solo se estira o se encoge; no gira hacia otro lado.
- **Interactividad sugerida:** editar una matriz 2×2; recalcular eigenvalores/eigendirecciones reales y permitir arrastrar un vector de prueba.

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
- **Idea:** Edita A y relaciona det(A−λI)=0 con las direcciones que ves en la malla.
- **Objetivo educativo:** La ecuación característica encuentra los valores propios (estiramientos).
- **Interactividad sugerida:** controlar las entradas de una matriz 2×2 y marcar las raíces reales del polinomio característico.

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
- **Idea:** Observa la dirección naranja asociada a cada valor propio.
- **Objetivo educativo:** El autoespacio es la recta (o plano) de todos los autovectores de un λ.
- **Interactividad sugerida:** seleccionar un eigenvalor y visualizar la base de \(\ker(A-\lambda I)\).

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
- **Idea:** Con autovectores visibles, imagina ejes donde A solo estira.
- **Objetivo educativo:** Diagonalizar es escribir A en una base de autovectores, donde actúa por escalados.
- **Interactividad sugerida:** animar las tres etapas con una figura/vector y permitir comparar resultado con aplicar \(A\) directamente.

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
- **Idea:** Explora A y sus direcciones propias como atajo para Aⁿ.
- **Objetivo educativo:** Con A = PDP⁻¹, potenciar A es potenciar los escalados en la diagonal.
- **Interactividad sugerida:** selector entero de \(n\); animar iteraciones y comparar costo conceptual de \(A^n\) frente a \(D^n\).

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
- **Idea:** Prueba una A casi simétrica y mira autovectores casi perpendiculares.
- **Objetivo educativo:** En matrices simétricas, los autovectores se pueden elegir ortogonales.
- **Interactividad sugerida:** editar una matriz simétrica 2×2 y actualizar ejes propios, eigenvalores y transformación de una elipse.

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
- **Idea:** Coloca u ⊥ v: u·v ≈ 0 y el ángulo se marca como recto.
- **Objetivo educativo:** Ortogonal significa ángulo recto: el producto punto es cero.
- **Interactividad sugerida:** arrastrar un vector; mostrar ángulo y producto punto con indicador cuando se cumple \(u\perp v\).

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
- **Idea:** Arrastra u: el segmento naranja es la proyección; el resto es el error ortogonal.
- **Objetivo educativo:** La proyección es la sombra de u sobre la dirección de v.
- **Interactividad sugerida:** modificar el ángulo y las magnitudes; actualizar componente escalar, proyección y residuo.

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
- **Idea:** Ajusta A hacia una rotación y mira que la malla no se estira de forma desigual.
- **Objetivo educativo:** Una matriz ortogonal rota/refleja sin cambiar longitudes.
- **Interactividad sugerida:** control angular para una matriz de rotación y opción de reflexión; mostrar \(Q^{-1}=Q^T\).

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
- **Idea:** Avanza el paso Gram–Schmidt y observa la nueva dirección ortogonal.
- **Objetivo educativo:** Gram–Schmidt convierte vectores en una base ortogonal paso a paso.
- **Interactividad sugerida:** avance por pasos y opción de normalizar al final para obtener una base ortonormal.

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
- **Idea:** Mueve los vectores y el punto: la proyección es la mejor aproximación.
- **Objetivo educativo:** Mínimos cuadrados busca el punto del subespacio más cercano al dato.
- **Interactividad sugerida:** mover \(b\) y observar cómo cambian proyección, residuo y error cuadrático.

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
- **Idea:** Edita A y b como datos del ajuste lineal por mínimos cuadrados.
- **Objetivo educativo:** Las ecuaciones normales AᵀAx = Aᵀb resumen ese problema de proyección.
- **Interactividad sugerida:** seleccionar un ejemplo pequeño y mostrar simultáneamente la geometría y las matrices de la ecuación normal.

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
- **Idea:** Explora A rectangular/singular y piensa en la “mejor” solución aproximada.
- **Objetivo educativo:** La pseudoinversa generaliza la inversa cuando A no es invertible.
- **Interactividad sugerida:** usar una matriz pequeña con rango reducido; permitir alternar entre \(A\), \(\Sigma\), \(\Sigma^+\) y \(A^+\).

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
- **Concepto visual:** LU como secuencia compacta de eliminación gaussiana.
- **Elementos:** matriz \(A\), factores \(L\) y \(U\), y multiplicadores de eliminación almacenados en \(L\).
- **Idea:** Aplica operaciones de fila: te acercas a la forma que usa la factorización LU.
- **Objetivo educativo:** LU parte A en triangular inferior y superior para resolver sistemas más fácil.
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
- **Concepto visual:** QR como base ortonormal más coordenadas triangulares.
- **Elementos:** columnas de \(A\), proceso que genera columnas ortonormales de \(Q\) y matriz triangular \(R\).
- **Idea:** Observa la malla de A como composición de una parte ortogonal y otra triangular.
- **Objetivo educativo:** QR escribe A como rotación/ortogonal por triangular.
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
- **Concepto visual:** descomposición espectral de una matriz simétrica.
- **Elementos:** ejes propios ortonormales, matriz \(Q\), escalas \(\Lambda\) y una elipse o cuadrícula transformada.
- **Idea:** Activa autovectores: son los ejes de esa descomposición.
- **Objetivo educativo:** La descomposición espectral usa autovalores y autovectores.
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
- **Idea:** Pulsa el paso SVD: 1) orienta, 2) escala con σ, 3) recomponer con A.
- **Objetivo educativo:** SVD descompone A en rotar → escalar → rotar.
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
- **Idea:** Baja k: la malla usa solo el mayor valor singular (versión simplificada).
- **Objetivo educativo:** Quedarse con los σ grandes aproxima A con poco rango.
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
- **Idea:** Cambia A: σ grandes indican estiramientos fuertes en alguna dirección.
- **Objetivo educativo:** Una norma matricial mide cuánto puede estirar A a un vector.
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
- **Idea:** Edita A y relaciona entradas grandes con una norma más grande.
- **Objetivo educativo:** Frobenius mide el “tamaño” de A sumando todas las entradas al cuadrado.
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
- **Idea:** Haz una columna mucho mayor: esa norma crece con ella.
- **Objetivo educativo:** La norma 1 se liga a sumas de columnas.
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
- **Idea:** Haz una fila dominante y observa el efecto sobre el tamaño de A.
- **Objetivo educativo:** La norma infinito se liga a sumas de filas.
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
- **Objetivo educativo:** La norma espectral es el mayor estiramiento (σ₁).
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
- **Idea:** Compara visualmente cuánto estira A frente a transformaciones encadenadas.
- **Objetivo educativo:** ‖AB‖ ≤ ‖A‖‖B‖: el tamaño del producto no supera el producto de tamaños.
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
- **Idea:** Haz σ₁ ≫ σ₂ (k bajo): la malla se aplasta y el problema se vuelve mal condicionado.
- **Objetivo educativo:** El número de condición dice si un sistema es sensible a errores.
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
- **Objetivo educativo:** Puedes comprobar una identidad lógica fila a fila en la tabla de verdad.
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
- **Idea:** Alterna A y B y compara la tabla con el resultado en vivo.
- **Objetivo educativo:** Algunas operaciones booleanas se simplifican (idempotencia, complemento).
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
- **Idea:** Revisa la tabla: AND/OR se reparte como en el área a(b+c).
- **Objetivo educativo:** La distributividad también existe en lógica, no solo en álgebra de números.
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
- **Idea:** Cambia A y B: las dos expresiones de cada ley siempre dan el mismo resultado.
- **Objetivo educativo:** De Morgan: negar un AND es como un OR de negaciones (y al revés).
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
- **Objetivo educativo:** XOR es verdadero cuando A y B son distintos.
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
- **Objetivo educativo:** La absorción elimina términos redundantes en expresiones booleanas.
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
- **Objetivo educativo:** Suma de productos escribe la función como ORs de ANDs.
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
- **Objetivo educativo:** Producto de sumas es la forma dual: ANDs de ORs.
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
- **Objetivo educativo:** Dos expresiones son equivalentes si su tabla de verdad coincide.
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
- **Idea:** Mueve a y b: el texto dice si a ≡ b (mod m) cuando comparten marca.
- **Objetivo educativo:** a y b son congruentes módulo m si caen en el mismo “tick” del reloj.
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
- **Idea:** Cambia a, b y m: las marcas muestran a+b y a·b en el círculo.
- **Objetivo educativo:** Sumar y multiplicar módulo m es operar y volver al reloj 0…m−1.
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
- **Idea:** Prueba varios a: si no hay inverso, el texto lo indica.
- **Objetivo educativo:** El inverso de a módulo m existe solo si gcd(a, m) = 1.
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
- **Idea:** Ajusta a, b, m y m₂: cuando existe, aparece el x que cumple ambos restos.
- **Objetivo educativo:** El teorema chino combina dos relojes (m y m₂) en una solución x.
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
- **Idea:** Con m primo, mira a^(p−1) en el caption; debería ser 1 si gcd(a,p)=1.
- **Objetivo educativo:** Fermat: si p es primo y p no divide a, entonces a^(p−1) ≡ 1 (mod p).
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
- **Idea:** Elige p y abre las tablas + / ·; pulsa una celda para ver el resultado e inverso.
- **Objetivo educativo:** En un cuerpo finito, suma y producto se envuelven módulo p.
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
- **Objetivo educativo:** Un código lineal es un subespacio: sumar palabras de código da otra palabra de código.
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
- **Concepto visual:** codificación como producto vector-matriz en un cuerpo finito.
- **Elementos:** vector mensaje \(\mathbf m\), matriz \(G\), operaciones módulo \(q\) y palabra resultante \(\mathbf c\).
- **Idea:** Edita bits/entradas y piensa cada fila de G como un patrón base del código.
- **Objetivo educativo:** La matriz generadora G fabrica palabras de código a partir de mensajes.
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
- **Concepto visual:** una palabra válida produce un vector de comprobación nulo.
- **Elementos:** palabra \(\mathbf c\), matriz \(H\), producto matricial y vector cero final; incluir un segundo ejemplo con una palabra alterada.
- **Idea:** Invierte un bit y relaciona el fallo con un síndrome no nulo (en COD-004).
- **Objetivo educativo:** H comprueba paridad: las palabras válidas cumplen H c = 0.
- **Interactividad sugerida:** permitir activar/desactivar un error en una posición y observar el producto \(H\mathbf c^T\).

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
- **Idea:** Elige la posición del error: el síndrome s cambia al instante.
- **Objetivo educativo:** El síndrome señala (en códigos simples) dónde está el bit erróneo.
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
- **Idea:** Edita las dos cadenas: los bits distintos se resaltan y d_H se actualiza.
- **Objetivo educativo:** La distancia de Hamming cuenta en cuántas posiciones difieren dos palabras.
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
- **Idea:** Mueve d_min: el radio de corrección t = ⌊(d−1)/2⌋ cambia con él.
- **Objetivo educativo:** Con distancia mínima d puedes detectar/corregir una cantidad limitada de errores.
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
- **Idea:** Ajusta n y k: la barra muestra la parte de mensaje frente a la de redundancia.
- **Objetivo educativo:** La tasa k/n mide cuánta información útil llevas frente a la longitud total.
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
#!/usr/bin/env python3
"""Rewrite algebra viz Idea/Objetivo to plain language and sync content-i18n."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "content" / "formulas-algebra.md"
I18N = ROOT / "apps" / "web-public" / "content-i18n"

# Plain-language (objective, idea) per formula id — Spanish source of truth.
# objective = what the graphic teaches; idea = what to try with the controls.
COPY: dict[str, tuple[str, str]] = {
    "ALG-FND-001": (
        "El orden de los sumandos no cambia el resultado.",
        "Pulsa Intercambiar: los bloques cambian de sitio, pero la barra total sigue igual.",
    ),
    "ALG-FND-002": (
        "Aunque agrupes los números de otra forma, la suma (o el producto) no cambia.",
        "Pulsa Agrupar izquierda/derecha. Solo cambia el recuadro; el total  a+b+c  sigue igual.",
    ),
    "ALG-FND-003": (
        "Multiplicar una suma es como sumar las áreas de dos rectángulos.",
        "Mueve a, b y c: el rectángulo grande a(b+c) se parte en ab y ac con la misma área total.",
    ),
    "ALG-FND-006": (
        "El valor absoluto es la distancia al cero: nunca es negativo.",
        "Mueve x a la izquierda o a la derecha: la marca muestra cuánto se aleja del origen.",
    ),
    "ALG-FND-007": (
        "La distancia entre dos puntos es el largo del segmento que los une.",
        "Mueve a y b: la distancia |a−b| se ve como la longitud entre ambos puntos.",
    ),
    "ALG-POT-001": (
        "Al multiplicar potencias de la misma base, los exponentes se suman.",
        "Cambia n y m: los bloques de a^n y a^m se juntan en a^(n+m).",
    ),
    "ALG-POT-008": (
        "El conjugado ayuda a quitar una raíz del denominador.",
        "Compara a+√b con a−√b: su producto deja un resultado sin raíz en el medio.",
    ),
    "ALG-EXP-003": (
        "Vas a ver por qué (ax+b)(cx+d)=acx^2+(ad+bc)x+bd y cómo adx y bcx se suman.",
        "Cada término del primer polinomio se multiplica por cada término del segundo; luego se agrupan las mismas potencias de x.",
    ),
    "ALG-IDN-001": (
        "(a+b)² se ve como un cuadrado partido en cuatro piezas.",
        "Cambia a y b: el cuadrado grande es a² + 2ab + b².",
    ),
    "ALG-IDN-002": (
        "(a−b)² también es un área, con una corrección en la esquina.",
        "Ajusta a y b y observa cómo aparecen a², −2ab y +b².",
    ),
    "ALG-IDN-003": (
        "a²−b² es el área que queda al quitar un cuadrado pequeño de uno grande.",
        "Pulsa para pasar de a²−b² al rectángulo (a−b)(a+b): es la misma cantidad.",
    ),
    "ALG-IDN-008": (
        "Los coeficientes del binomio son la fila de Pascal.",
        "Cambia n: ves los números de Pascal y cómo se arma (a+b)^n.",
    ),
    "ALG-FAC-001": (
        "Sacar factor común es reagrupar áreas que comparten un lado.",
        "Mueve a, b y c: el rectángulo a(b+c) se ve igual que ab+ac.",
    ),
    "ALG-FAC-002": (
        "Factorizar a²−b² es rearmar el área sobrante como un rectángulo.",
        "Alterna entre a²−b² y (a−b)(a+b) para ver que representan lo mismo.",
    ),
    "ALG-FAC-003": (
        "Un trinomio cuadrado perfecto se arma como un cuadrado completo.",
        "Ajusta a y b hasta ver el patrón (a±b)² en las piezas.",
    ),
    "ALG-EQU-001": (
        "Una ecuación lineal es una recta: la solución es donde corta al eje x.",
        "Mueve la pendiente y el intercepto; busca dónde la recta cruza el eje horizontal.",
    ),
    "ALG-EQU-003": (
        "La parábola corta al eje x en las soluciones (si existen).",
        "Cambia a, b y c: mira el discriminante Δ y las marcas naranjas de las raíces.",
    ),
    "ALG-EQU-004": (
        "El discriminante dice cuántas raíces reales tiene la cuadrática.",
        "Ajusta a, b y c y observa si hay 2, 1 o ninguna raíz real según Δ.",
    ),
    "ALG-EQU-005": (
        "Completar el cuadrado es añadir (y luego restar) la esquina que falta.",
        "Pulsa Añadir/Restar (b/2)²: verás de dónde sale el término b²/4.",
    ),
    "ALG-EQU-008": (
        "Una ecuación con valor absoluto suele tener dos soluciones simétricas.",
        "Mueve el punto en la recta y relaciona las distancias con las soluciones.",
    ),
    "ALG-INE-001": (
        "Una inecuación lineal pinta un rayo o un intervalo en la recta.",
        "Cambia el borde y el tipo de desigualdad: la zona sombreada es la solución.",
    ),
    "ALG-INE-002": (
        "La solución de una inecuación cuadrática es donde la parábola está por encima (o debajo) del eje.",
        "Ajusta la parábola: la zona sombreada marca los x que cumplen la desigualdad.",
    ),
    "ALG-INE-003": (
        "En inecuaciones racionales hay que cuidar los puntos donde el denominador se anula.",
        "Mueve el borde y observa qué parte de la recta queda permitida.",
    ),
    "ALG-INE-004": (
        "El valor absoluto en desigualdades define intervalos centrados o exteriores.",
        "Cambia el radio y los extremos abiertos/cerrados para ver el intervalo solución.",
    ),
    "ALG-SIS-001": (
        "Un sistema 2×2 es dos rectas: la solución es su cruce (si se cortan).",
        "Mueve la pendiente: el punto naranja marca la intersección, o verás si son paralelas.",
    ),
    "ALG-SIS-002": (
        "El sistema lineal se compacta en Ax=b: filas de A son ecuaciones, columnas son variables; det(A)≠0 implica solución única.",
        "Edita A y b: compara el sistema tradicional con la forma matricial, la expansión de Ax y el determinante.",
    ),
    "ALG-SIS-003": (
        "La matriz aumentada [A|b] reúne coeficientes y términos independientes: cada fila es una ecuación del sistema.",
        "Elige R₁ o R₂ y edita A y b: ves a la vez la matriz, la fila activa y el sistema completo.",
    ),
    "ALG-SIS-004": (
        "Las operaciones elementales cambian la forma del sistema, pero no su solución: así se construye Gauss y Gauss-Jordan.",
        "Elige Ri↔Rj, cRi o Ri+cRj con filas y c; aplica y compara el sistema con el original.",
    ),
    "ALG-SIS-005": (
        "Comparar rangos te dice si hay una, infinitas o ninguna solución.",
        "Haz A singular o no y mira el indicador de rango / ∅ / ∞.",
    ),
    "ALG-FUN-001": (
        "El dominio son los x donde la función tiene sentido (aquí, x ≠ 0).",
        "Mira la hipérbola 1/x: cerca de cero la curva se dispara; ese hueco es el dominio roto.",
    ),
    "ALG-FUN-002": (
        "Componer funciones es aplicar una después de la otra.",
        "Mueve x₀ y los parámetros: el valor mostrado es f(g(x)).",
    ),
    "ALG-FUN-003": (
        "La inversa “deshace” la función: sus gráficas son simétricas respecto de y = x.",
        "Compara la curva y su inversa; la diagonal punteada es el espejo y = x.",
    ),
    "ALG-FUN-005": (
        "Una recta queda determinada por su pendiente y su corte con el eje y.",
        "Mueve m y b: la recta se inclina y se desplaza al instante.",
    ),
    "ALG-FUN-006": (
        "Rectas paralelas tienen la misma pendiente; perpendiculares, pendientes inversas cambiadas de signo.",
        "Ajusta las dos rectas y observa cuándo no se cortan o se cruzan en ángulo recto.",
    ),
    "ALG-FUN-007": (
        "Trasladar una gráfica es moverla sin deformarla.",
        "Mueve h y k: la curva se desplaza horizontal y verticalmente.",
    ),
    "ALG-FUN-008": (
        "Escalar y reflejar estiran, comprimen o voltean la curva.",
        "Cambia a y la reflexión: mira cómo se deforma la onda respecto del original.",
    ),
    "ALG-POL-007": (
        "Un polinomio en dos variables asigna un valor a cada punto (x, y).",
        "Mueve a, b y c: el mapa de color muestra z = ax² + bxy + cy².",
    ),
    "ALG-POL-008": (
        "El grado total suma los exponentes de cada variable.",
        "Cambia α y β: el rectángulo ilustra el grado α+β del monomio x^α y^β.",
    ),
    "ALG-POL-009": (
        "En un polinomio homogéneo, escalar (x, y) escala el resultado de forma predecible.",
        "Activa la forma homogénea y mueve t: compara P(tx, ty) con t^d P(x, y).",
    ),
    "ALG-POL-010": (
        "Un sistema polinómico se ve como curvas que se cortan en las soluciones.",
        "Ajusta los parámetros y busca los cruces entre las dos curvas.",
    ),
    "ALG-POL-011": (
        "La resultante concentra condiciones de solución común en una matriz.",
        "Edita la matriz y observa el determinante como señal de raíces compartidas.",
    ),
    "ALG-LOG-001": (
        "La exponencial crece (o decrece) multiplicando una y otra vez.",
        "Cambia la base: la curva se hace más empinada o más suave.",
    ),
    "ALG-LOG-002": (
        "El logaritmo responde: “¿a qué exponente elevo la base para obtener x?”.",
        "Compara log y exponencial: son inversas; la diagonal y = x las refleja.",
    ),
    "ALG-LOG-007": (
        "El signo del exponente decide si la cantidad crece o se apaga.",
        "Mueve k (vía b) y mira si la curva sube o baja con el tiempo.",
    ),
    "ALG-COM-001": (
        "Un complejo a+bi es un punto (o flecha) en el plano.",
        "Arrastra la punta: las coordenadas son la parte real e imaginaria.",
    ),
    "ALG-COM-002": (
        "El conjugado refleja el número respecto del eje real.",
        "Arrastra z: la flecha naranja es el conjugado (misma x, y al revés).",
    ),
    "ALG-COM-003": (
        "El módulo es la longitud de la flecha desde el origen.",
        "Estira o acorta el vector: el número r es esa longitud.",
    ),
    "ALG-COM-004": (
        "En forma polar usas longitud y ángulo en lugar de (x, y).",
        "Gira θ: el punto se mueve sobre el círculo de radio r.",
    ),
    "ALG-COM-005": (
        "Euler une el ángulo con coseno y seno sobre el círculo unitario.",
        "Mueve θ: el punto (cos θ, sin θ) recorre la circunferencia.",
    ),
    "ALG-COM-006": (
        "Elevar a n multiplica el ángulo por n y potencia el radio.",
        "Cambia n y θ: ves z, z², z³… girando y alejándose según rⁿ.",
    ),
    "ALG-COM-007": (
        "Las raíces n-ésimas se repartan como vértices de un polígono regular.",
        "Cambia n: los puntos naranjas se distribuyen en el círculo.",
    ),
    "ALG-SEC-001": (
        "En una sucesión aritmética cada salto suma la misma cantidad.",
        "Mueve a₁ y d: los puntos suben o bajan a pasos constantes.",
    ),
    "ALG-SEC-003": (
        "En una sucesión geométrica cada término se multiplica por r.",
        "Cambia a y r: los puntos crecen o se acercan a cero según |r|.",
    ),
    "ALG-SEC-005": (
        "Si |r|<1, la serie geométrica infinita se acerca a un valor límite.",
        "Prueba |r|<1 y |r|≥1: mira si los puntos se estabilizan o se disparan.",
    ),
    "ALG-SEC-007": (
        "Una recurrencia construye cada término a partir de los anteriores.",
        "Cambia los coeficientes y observa cómo evoluciona la sucesión punto a punto.",
    ),
    "ALG-VEC-001": (
        "Un vector es una flecha: dirección y longitud.",
        "Arrastra las puntas: cambias el vector en el desenlace del plano.",
    ),
    "ALG-VEC-002": (
        "La norma es la longitud de la flecha.",
        "Estira u: el valor ‖u‖ se actualiza con la longitud.",
    ),
    "ALG-VEC-003": (
        "El vector unitario tiene longitud 1 y guarda la dirección.",
        "Mueve u: ves la versión “normalizada” û de longitud 1.",
    ),
    "ALG-VEC-004": (
        "El producto punto mide alineación: positivo = ángulo agudo.",
        "Arrastra u y v: mira u·v y si el ángulo es agudo, recto u obtuso; la proyección aparece en naranja.",
    ),
    "ALG-VEC-005": (
        "El ángulo entre vectores se lee del producto punto.",
        "Mueve las flechas: el ángulo y el tipo (agudo/recto/obtuso) se actualizan.",
    ),
    "ALG-VEC-006": (
        "La distancia entre puntas de vectores es la norma de la diferencia.",
        "Separa u y v: la distancia crece con la separación.",
    ),
    "ALG-VEC-007": (
        "Una combinación lineal mezcla vectores con pesos.",
        "Arrastra u y v: la flecha naranja es 0.7u + 0.5v.",
    ),
    "ALG-MAT-001": (
        "Una matriz es una tabla de números organizada en filas y columnas.",
        "Edita las entradas de A: cada celda es un coeficiente del objeto lineal.",
    ),
    "ALG-MAT-002": (
        "Sumar matrices se hace casilla a casilla.",
        "Cambia A y B: el resultado A+B se actualiza entrada por entrada.",
    ),
    "ALG-MAT-003": (
        "Multiplicar por un escalar estira o invierte todos los números de la matriz.",
        "Mueve c: ves cA crecer, encogerse o cambiar de signo.",
    ),
    "ALG-MAT-004": (
        "Cada entrada de AB mezcla una fila de A con una columna de B.",
        "Elige una casilla (i,j): debajo ves la cuenta fila×columna paso a paso.",
    ),
    "ALG-MAT-005": (
        "La identidad deja los vectores igual: es el “1” de las matrices.",
        "Compara A con el efecto de la identidad sobre la base.",
    ),
    "ALG-MAT-006": (
        "La transpuesta intercambia filas por columnas.",
        "Edita A: a la derecha ves Aᵀ con filas y columnas volcadas.",
    ),
    "ALG-MAT-007": (
        "Una matriz simétrica coincide con su transpuesta.",
        "Ajusta A hasta que coincida con Aᵀ.",
    ),
    "ALG-DET-001": (
        "El determinante 2×2 es el área con signo del paralelogramo de las columnas.",
        "Mueve los vectores: el área coloreada es |det|; el signo indica orientación.",
    ),
    "ALG-DET-002": (
        "El determinante se puede expandir por una fila o columna (cofactores).",
        "Edita A y observa cómo det(A) responde a los cambios.",
    ),
    "ALG-DET-003": (
        "det(AB) = det(A)det(B): las áreas se multiplican.",
        "Cambia A y B y compara el área del producto con el producto de áreas.",
    ),
    "ALG-DET-004": (
        "Si el área (det) es cero, las columnas son paralelas y no hay inversa.",
        "Haz el paralelogramo plano (área ≈ 0): la matriz se vuelve singular.",
    ),
    "ALG-DET-005": (
        "La inversa “deshace” A; existe solo si det ≠ 0.",
        "Edita A y mira det: si no es cero, la inversa está bien definida.",
    ),
    "ALG-DET-006": (
        "Cramer usa determinantes para resolver sistemas pequeños.",
        "Cambia A y b: relaciona det(A) con la posibilidad de solución única.",
    ),
    "ALG-ESP-001": (
        "El espacio generado son todas las mezclas s·u + t·v.",
        "Mueve s y t: la flecha naranja barre el plano (o la recta) que generan u y v.",
    ),
    "ALG-ESP-002": (
        "Si el área del paralelogramo es cero, los vectores son dependientes.",
        "Alinea u y v: el indicador pasa a “dependientes”.",
    ),
    "ALG-ESP-003": (
        "Una base es un conjunto independiente que genera todo el espacio.",
        "Activa “mostrar base” y compara con tus vectores u y v.",
    ),
    "ALG-ESP-004": (
        "Las coordenadas dicen cuánto de cada vector de la base necesitas.",
        "Cambia s y t: son las coordenadas de la combinación en la base u, v.",
    ),
    "ALG-ESP-005": (
        "El rango es cuántas direcciones independientes tiene la matriz.",
        "Edita A: mira el determinante/rango para ver si hay 0, 1 o 2 direcciones.",
    ),
    "ALG-ESP-006": (
        "La nulidad cuenta soluciones no triviales de Ax = 0.",
        "Haz columnas dependientes y relaciona con direcciones que van al origen.",
    ),
    "ALG-ESP-007": (
        "Rango + nulidad = número de columnas (en el caso n).",
        "Explora vectores dependientes/independientes y cómo se reparte la dimensión.",
    ),
    "ALG-TRA-001": (
        "Una transformación lineal respeta sumas y escalados.",
        "Mira la cuadrícula deformada por A: líneas rectas siguen siendo rectas.",
    ),
    "ALG-TRA-002": (
        "Aplicar A es empujar cada punto (y la cuadrícula) a una nueva forma.",
        "Cambia las entradas de A: la malla muestra el empujón lineal.",
    ),
    "ALG-TRA-003": (
        "El núcleo son los vectores que A manda al origen.",
        "Busca direcciones que se aplastan cuando det se acerca a cero.",
    ),
    "ALG-TRA-004": (
        "La imagen son las direcciones que A sí puede alcanzar.",
        "Observa hacia dónde apuntan las columnas transformadas e₁ y e₂.",
    ),
    "ALG-TRA-005": (
        "Componer transformaciones es aplicar una después de la otra (producto de matrices).",
        "Cambia A y piensa A como un paso de la composición.",
    ),
    "ALG-TRA-006": (
        "La inversa deshace el empujón de A.",
        "Pulsa Aplicar A⁻¹ (si existe): la malla vuelve hacia la forma original.",
    ),
    "ALG-TRA-007": (
        "Cambiar de base es describir los mismos vectores con otras coordenadas.",
        "Modifica A como matriz de cambio y mira cómo se reorienta la malla.",
    ),
    "ALG-EIG-001": (
        "Un autovector solo se estira o se encoge; no gira hacia otro lado.",
        "Activa autovectores: las rayas naranjas marcan esas direcciones especiales.",
    ),
    "ALG-EIG-002": (
        "La ecuación característica encuentra los valores propios (estiramientos).",
        "Edita A y relaciona det(A−λI)=0 con las direcciones que ves en la malla.",
    ),
    "ALG-EIG-003": (
        "El autoespacio es la recta (o plano) de todos los autovectores de un λ.",
        "Observa la dirección naranja asociada a cada valor propio.",
    ),
    "ALG-EIG-004": (
        "Diagonalizar es escribir A en una base de autovectores, donde actúa por escalados.",
        "Con autovectores visibles, imagina ejes donde A solo estira.",
    ),
    "ALG-EIG-005": (
        "Con A = PDP⁻¹, potenciar A es potenciar los escalados en la diagonal.",
        "Explora A y sus direcciones propias como atajo para Aⁿ.",
    ),
    "ALG-EIG-006": (
        "En matrices simétricas, los autovectores se pueden elegir ortogonales.",
        "Prueba una A casi simétrica y mira autovectores casi perpendiculares.",
    ),
    "ALG-ORT-001": (
        "Ortogonal significa ángulo recto: el producto punto es cero.",
        "Coloca u ⊥ v: u·v ≈ 0 y el ángulo se marca como recto.",
    ),
    "ALG-ORT-002": (
        "La proyección es la sombra de u sobre la dirección de v.",
        "Arrastra u: el segmento naranja es la proyección; el resto es el error ortogonal.",
    ),
    "ALG-ORT-003": (
        "Una matriz ortogonal rota/refleja sin cambiar longitudes.",
        "Ajusta A hacia una rotación y mira que la malla no se estira de forma desigual.",
    ),
    "ALG-ORT-004": (
        "Gram–Schmidt convierte vectores en una base ortogonal paso a paso.",
        "Avanza el paso Gram–Schmidt y observa la nueva dirección ortogonal.",
    ),
    "ALG-LSQ-001": (
        "Mínimos cuadrados busca el punto del subespacio más cercano al dato.",
        "Mueve los vectores y el punto: la proyección es la mejor aproximación.",
    ),
    "ALG-LSQ-002": (
        "Las ecuaciones normales AᵀAx = Aᵀb resumen ese problema de proyección.",
        "Edita A y b como datos del ajuste lineal por mínimos cuadrados.",
    ),
    "ALG-LSQ-003": (
        "La pseudoinversa generaliza la inversa cuando A no es invertible.",
        "Explora A rectangular/singular y piensa en la “mejor” solución aproximada.",
    ),
    "ALG-DEC-001": (
        "LU parte A en triangular inferior y superior para resolver sistemas más fácil.",
        "Aplica operaciones de fila: te acercas a la forma que usa la factorización LU.",
    ),
    "ALG-DEC-002": (
        "QR escribe A como rotación/ortogonal por triangular.",
        "Observa la malla de A como composición de una parte ortogonal y otra triangular.",
    ),
    "ALG-DEC-003": (
        "La descomposición espectral usa autovalores y autovectores.",
        "Activa autovectores: son los ejes de esa descomposición.",
    ),
    "ALG-DEC-004": (
        "SVD descompone A en rotar → escalar → rotar.",
        "Pulsa el paso SVD: 1) orienta, 2) escala con σ, 3) recomponer con A.",
    ),
    "ALG-DEC-005": (
        "Quedarse con los σ grandes aproxima A con poco rango.",
        "Baja k: la malla usa solo el mayor valor singular (versión simplificada).",
    ),
    "ALG-NOR-001": (
        "Una norma matricial mide cuánto puede estirar A a un vector.",
        "Cambia A: σ grandes indican estiramientos fuertes en alguna dirección.",
    ),
    "ALG-NOR-002": (
        "Frobenius mide el “tamaño” de A sumando todas las entradas al cuadrado.",
        "Edita A y relaciona entradas grandes con una norma más grande.",
    ),
    "ALG-NOR-003": (
        "La norma 1 se liga a sumas de columnas.",
        "Haz una columna mucho mayor: esa norma crece con ella.",
    ),
    "ALG-NOR-004": (
        "La norma infinito se liga a sumas de filas.",
        "Haz una fila dominante y observa el efecto sobre el tamaño de A.",
    ),
    "ALG-NOR-005": (
        "La norma espectral es el mayor estiramiento (σ₁).",
        "Mira la elipse de valores singulares: el eje largo es ese estiramiento.",
    ),
    "ALG-NOR-006": (
        "‖AB‖ ≤ ‖A‖‖B‖: el tamaño del producto no supera el producto de tamaños.",
        "Compara visualmente cuánto estira A frente a transformaciones encadenadas.",
    ),
    "ALG-NOR-007": (
        "El número de condición dice si un sistema es sensible a errores.",
        "Haz σ₁ ≫ σ₂ (k bajo): la malla se aplasta y el problema se vuelve mal condicionado.",
    ),
    "ALG-BOO-001": (
        "Puedes comprobar una identidad lógica fila a fila en la tabla de verdad.",
        "Cambia salidas con el botón: las filas en naranja no coinciden con lo esperado.",
    ),
    "ALG-BOO-002": (
        "Algunas operaciones booleanas se simplifican (idempotencia, complemento).",
        "Alterna A y B y compara la tabla con el resultado en vivo.",
    ),
    "ALG-BOO-003": (
        "La distributividad también existe en lógica, no solo en álgebra de números.",
        "Revisa la tabla: AND/OR se reparte como en el área a(b+c).",
    ),
    "ALG-BOO-004": (
        "De Morgan: negar un AND es como un OR de negaciones (y al revés).",
        "Cambia A y B: las dos expresiones de cada ley siempre dan el mismo resultado.",
    ),
    "ALG-BOO-005": (
        "XOR es verdadero cuando A y B son distintos.",
        "Prueba las cuatro combinaciones: solo 01 y 10 dan 1.",
    ),
    "ALG-BOO-006": (
        "La absorción elimina términos redundantes en expresiones booleanas.",
        "Compara filas de la tabla para ver qué entradas sobran.",
    ),
    "ALG-BOO-007": (
        "Suma de productos escribe la función como ORs de ANDs.",
        "Marca en la tabla las filas donde la salida es 1: esas son tus productos.",
    ),
    "ALG-BOO-008": (
        "Producto de sumas es la forma dual: ANDs de ORs.",
        "Usa la tabla para ver qué cláusulas cubren los ceros de la función.",
    ),
    "ALG-BOO-009": (
        "Dos expresiones son equivalentes si su tabla de verdad coincide.",
        "Edita salidas: si todo queda en ✓, las tablas coinciden.",
    ),
    "ALG-MOD-001": (
        "a y b son congruentes módulo m si caen en el mismo “tick” del reloj.",
        "Mueve a y b: el texto dice si a ≡ b (mod m) cuando comparten marca.",
    ),
    "ALG-MOD-002": (
        "Sumar y multiplicar módulo m es operar y volver al reloj 0…m−1.",
        "Cambia a, b y m: las marcas muestran a+b y a·b en el círculo.",
    ),
    "ALG-MOD-003": (
        "El inverso de a módulo m existe solo si gcd(a, m) = 1.",
        "Prueba varios a: si no hay inverso, el texto lo indica.",
    ),
    "ALG-MOD-005": (
        "El teorema chino combina dos relojes (m y m₂) en una solución x.",
        "Ajusta a, b, m y m₂: cuando existe, aparece el x que cumple ambos restos.",
    ),
    "ALG-MOD-006": (
        "Fermat: si p es primo y p no divide a, entonces a^(p−1) ≡ 1 (mod p).",
        "Con m primo, mira a^(p−1) en el caption; debería ser 1 si gcd(a,p)=1.",
    ),
    "ALG-EST-006": (
        "En un cuerpo finito, suma y producto se envuelven módulo p.",
        "Elige p y abre las tablas + / ·; pulsa una celda para ver el resultado e inverso.",
    ),
    "ALG-COD-001": (
        "Un código lineal es un subespacio: sumar palabras de código da otra palabra de código.",
        "Lee la lista de codewords: su suma permanece dentro del conjunto.",
    ),
    "ALG-COD-002": (
        "La matriz generadora G fabrica palabras de código a partir de mensajes.",
        "Edita bits/entradas y piensa cada fila de G como un patrón base del código.",
    ),
    "ALG-COD-003": (
        "H comprueba paridad: las palabras válidas cumplen H c = 0.",
        "Invierte un bit y relaciona el fallo con un síndrome no nulo (en COD-004).",
    ),
    "ALG-COD-004": (
        "El síndrome señala (en códigos simples) dónde está el bit erróneo.",
        "Elige la posición del error: el síndrome s cambia al instante.",
    ),
    "ALG-COD-005": (
        "La distancia de Hamming cuenta en cuántas posiciones difieren dos palabras.",
        "Edita las dos cadenas: los bits distintos se resaltan y d_H se actualiza.",
    ),
    "ALG-COD-006": (
        "Con distancia mínima d puedes detectar/corregir una cantidad limitada de errores.",
        "Mueve d_min: el radio de corrección t = ⌊(d−1)/2⌋ cambia con él.",
    ),
    "ALG-COD-007": (
        "La tasa k/n mide cuánta información útil llevas frente a la longitud total.",
        "Ajusta n y k: la barra muestra la parte de mensaje frente a la de redundancia.",
    ),
}

# Translations of (objective, idea) — keep close, clear, short.
TRANSLATIONS: dict[str, dict[str, tuple[str, str]]] = {}


def tr_all() -> None:
    """Fill TRANSLATIONS for en/de/fr/it/pt with plain equivalents."""
    # English (hand-maintained style via patterned transform of Spanish where needed)
    en = {
        "ALG-FND-001": (
            "The order of the addends does not change the result.",
            "Tap Swap: the blocks change places, but the total bar stays the same.",
        ),
        "ALG-FND-002": (
            "Even if you group the numbers differently, the sum (or product) does not change.",
            "Tap Group left/right. Only the box moves; the total a+b+c stays the same.",
        ),
        "ALG-FND-003": (
            "Multiplying a sum is like adding the areas of two rectangles.",
            "Move a, b, and c: the big rectangle a(b+c) splits into ab and ac with the same total area.",
        ),
        "ALG-FND-006": (
            "Absolute value is distance to zero: it is never negative.",
            "Move x left or right: the mark shows how far it is from the origin.",
        ),
        "ALG-FND-007": (
            "The distance between two points is the length of the segment joining them.",
            "Move a and b: the distance |a−b| is the length between the two points.",
        ),
        "ALG-POT-001": (
            "When you multiply powers with the same base, the exponents add.",
            "Change n and m: the a^n and a^m blocks join into a^(n+m).",
        ),
        "ALG-POT-008": (
            "The conjugate helps remove a root from the denominator.",
            "Compare a+√b with a−√b: their product clears the root in the middle.",
        ),
        "ALG-EXP-003": (
            "You'll see why (ax+b)(cx+d)=acx^2+(ad+bc)x+bd and how adx and bcx add.",
            "Each term of the first polynomial is multiplied by each term of the second; then like powers of x are grouped.",
        ),
        "ALG-IDN-001": (
            "(a+b)² looks like a square cut into four pieces.",
            "Change a and b: the big square is a² + 2ab + b².",
        ),
        "ALG-IDN-002": (
            "(a−b)² is also an area, with a correction in the corner.",
            "Adjust a and b and watch a², −2ab, and +b² appear.",
        ),
        "ALG-IDN-003": (
            "a²−b² is the area left after removing a small square from a large one.",
            "Toggle from a²−b² to the rectangle (a−b)(a+b): it is the same amount.",
        ),
        "ALG-IDN-008": (
            "Binomial coefficients are a Pascal row.",
            "Change n: you see Pascal numbers and how (a+b)^n is built.",
        ),
        "ALG-FAC-001": (
            "Factoring out a common factor regroups areas that share a side.",
            "Move a, b, and c: rectangle a(b+c) matches ab+ac.",
        ),
        "ALG-FAC-002": (
            "Factoring a²−b² rebuilds the leftover area as a rectangle.",
            "Switch between a²−b² and (a−b)(a+b) to see they match.",
        ),
        "ALG-FAC-003": (
            "A perfect-square trinomial builds a complete square.",
            "Adjust a and b until you see the (a±b)² pattern in the tiles.",
        ),
        "ALG-EQU-001": (
            "A linear equation is a line: the solution is where it meets the x-axis.",
            "Move slope and intercept; find where the line crosses the horizontal axis.",
        ),
        "ALG-EQU-003": (
            "The parabola meets the x-axis at the solutions (if any).",
            "Change a, b, and c: watch discriminant Δ and the orange root markers.",
        ),
        "ALG-EQU-004": (
            "The discriminant tells how many real roots the quadratic has.",
            "Adjust a, b, and c and see whether there are 2, 1, or no real roots from Δ.",
        ),
        "ALG-EQU-005": (
            "Completing the square means adding (then subtracting) the missing corner.",
            "Tap Add/Subtract (b/2)²: you see where the b²/4 term comes from.",
        ),
        "ALG-EQU-008": (
            "An absolute-value equation often has two symmetric solutions.",
            "Move the point on the line and relate distances to the solutions.",
        ),
        "ALG-INE-001": (
            "A linear inequality paints a ray or interval on the number line.",
            "Change the boundary and inequality type: the shaded region is the solution.",
        ),
        "ALG-INE-002": (
            "A quadratic inequality’s solution is where the parabola is above (or below) the axis.",
            "Adjust the parabola: the shaded region marks the x values that work.",
        ),
        "ALG-INE-003": (
            "For rational inequalities, watch points where the denominator is zero.",
            "Move the boundary and see which part of the line is allowed.",
        ),
        "ALG-INE-004": (
            "Absolute value in inequalities defines centered or outer intervals.",
            "Change the radius and open/closed ends to see the solution interval.",
        ),
        "ALG-SIS-001": (
            "A 2×2 system is two lines: the solution is their crossing (if they meet).",
            "Move the slope: the orange point marks the intersection, or you see parallels.",
        ),
        "ALG-SIS-002": (
            "A linear system packs into Ax=b: rows of A are equations, columns are variables; det(A)≠0 means a unique solution.",
            "Edit A and b: compare the traditional system with the matrix form, the Ax expansion, and the determinant.",
        ),
        "ALG-SIS-003": (
            "Each row of the augmented matrix is one equation of the system.",
            "Pick R₁ or R₂: the equation for that row appears below.",
        ),
        "ALG-SIS-004": (
            "Row operations change the matrix, but the system stays equivalent.",
            "Try swap, scale, or add rows and watch how A changes.",
        ),
        "ALG-SIS-005": (
            "Comparing ranks tells you whether there is one, infinitely many, or no solution.",
            "Make A singular or not and watch the rank / ∅ / ∞ indicator.",
        ),
        "ALG-FUN-001": (
            "The domain is the x values where the function makes sense (here x ≠ 0).",
            "Look at 1/x: near zero the curve blows up; that gap is the broken domain.",
        ),
        "ALG-FUN-002": (
            "Composition means applying one function after another.",
            "Move x₀ and the parameters: the shown value is f(g(x)).",
        ),
        "ALG-FUN-003": (
            "The inverse undoes the function: the graphs are mirrors across y = x.",
            "Compare the curve and its inverse; the dotted diagonal is the y = x mirror.",
        ),
        "ALG-FUN-005": (
            "A line is set by its slope and y-intercept.",
            "Move m and b: the line tilts and shifts instantly.",
        ),
        "ALG-FUN-006": (
            "Parallel lines share slope; perpendicular lines have negative-reciprocal slopes.",
            "Adjust both lines and see when they never meet or cross at a right angle.",
        ),
        "ALG-FUN-007": (
            "A translation moves a graph without reshaping it.",
            "Move h and k: the curve shifts horizontally and vertically.",
        ),
        "ALG-FUN-008": (
            "Scaling and reflection stretch, squeeze, or flip the curve.",
            "Change a and reflection: watch how the wave deforms.",
        ),
        "ALG-POL-007": (
            "A two-variable polynomial assigns a value to every point (x, y).",
            "Move a, b, and c: the color map shows z = ax² + bxy + cy².",
        ),
        "ALG-POL-008": (
            "Total degree adds the exponents of each variable.",
            "Change α and β: the rectangle illustrates degree α+β of x^α y^β.",
        ),
        "ALG-POL-009": (
            "For a homogeneous polynomial, scaling (x, y) scales the output predictably.",
            "Turn on homogeneous form and move t: compare P(tx, ty) with t^d P(x, y).",
        ),
        "ALG-POL-010": (
            "A polynomial system looks like curves meeting at the solutions.",
            "Adjust parameters and look for crossings between the two curves.",
        ),
        "ALG-POL-011": (
            "The resultant packs common-root conditions into a matrix.",
            "Edit the matrix and watch the determinant as a signal of shared roots.",
        ),
        "ALG-LOG-001": (
            "An exponential grows (or decays) by multiplying over and over.",
            "Change the base: the curve gets steeper or flatter.",
        ),
        "ALG-LOG-002": (
            "A logarithm answers: “to what power do I raise the base to get x?”.",
            "Compare log and exponential: they are inverses; y = x mirrors them.",
        ),
        "ALG-LOG-007": (
            "The sign of the rate decides growth versus decay.",
            "Move k (via b) and see whether the curve rises or falls over time.",
        ),
        "ALG-COM-001": (
            "A complex number a+bi is a point (or arrow) in the plane.",
            "Drag the tip: the coordinates are the real and imaginary parts.",
        ),
        "ALG-COM-002": (
            "The conjugate reflects the number across the real axis.",
            "Drag z: the orange arrow is the conjugate (same x, flipped y).",
        ),
        "ALG-COM-003": (
            "The modulus is the arrow’s length from the origin.",
            "Stretch or shorten the vector: r is that length.",
        ),
        "ALG-COM-004": (
            "Polar form uses length and angle instead of (x, y).",
            "Rotate θ: the point moves on the circle of radius r.",
        ),
        "ALG-COM-005": (
            "Euler links the angle to cosine and sine on the unit circle.",
            "Move θ: the point (cos θ, sin θ) travels around the circle.",
        ),
        "ALG-COM-006": (
            "Raising to the n multiplies the angle by n and powers the radius.",
            "Change n and θ: you see z, z², z³… rotating and growing as rⁿ.",
        ),
        "ALG-COM-007": (
            "The n-th roots sit like vertices of a regular polygon.",
            "Change n: the orange points spread around the circle.",
        ),
        "ALG-SEC-001": (
            "In an arithmetic sequence each step adds the same amount.",
            "Move a₁ and d: the points rise or fall in constant steps.",
        ),
        "ALG-SEC-003": (
            "In a geometric sequence each term is multiplied by r.",
            "Change a and r: points grow or approach zero depending on |r|.",
        ),
        "ALG-SEC-005": (
            "If |r|<1, the infinite geometric series approaches a limit.",
            "Try |r|<1 and |r|≥1: see whether points settle or blow up.",
        ),
        "ALG-SEC-007": (
            "A recurrence builds each term from previous ones.",
            "Change the coefficients and watch the sequence evolve point by point.",
        ),
        "ALG-VEC-001": (
            "A vector is an arrow: direction and length.",
            "Drag the tips to change the vector in the plane.",
        ),
        "ALG-VEC-002": (
            "The norm is the arrow’s length.",
            "Stretch u: ‖u‖ updates with the length.",
        ),
        "ALG-VEC-003": (
            "A unit vector has length 1 and keeps the direction.",
            "Move u: you see the normalized û of length 1.",
        ),
        "ALG-VEC-004": (
            "The dot product measures alignment: positive means an acute angle.",
            "Drag u and v: watch u·v and acute/right/obtuse; the projection is orange.",
        ),
        "ALG-VEC-005": (
            "The angle between vectors comes from the dot product.",
            "Move the arrows: the angle and its type update live.",
        ),
        "ALG-VEC-006": (
            "Distance between vector tips is the norm of the difference.",
            "Separate u and v: distance grows with separation.",
        ),
        "ALG-VEC-007": (
            "A linear combination mixes vectors with weights.",
            "Drag u and v: the orange arrow is 0.7u + 0.5v.",
        ),
        "ALG-MAT-001": (
            "A matrix is a table of numbers in rows and columns.",
            "Edit A’s entries: each cell is a coefficient of the linear object.",
        ),
        "ALG-MAT-002": (
            "Matrix addition is entry by entry.",
            "Change A and B: A+B updates cell by cell.",
        ),
        "ALG-MAT-003": (
            "Scaling a matrix stretches or flips every entry.",
            "Move c: watch cA grow, shrink, or change sign.",
        ),
        "ALG-MAT-004": (
            "Each entry of AB mixes a row of A with a column of B.",
            "Pick a cell (i,j): below you see the row×column calculation.",
        ),
        "ALG-MAT-005": (
            "The identity leaves vectors unchanged: it is the “1” of matrices.",
            "Compare A with the identity acting on the basis.",
        ),
        "ALG-MAT-006": (
            "The transpose swaps rows and columns.",
            "Edit A: on the right you see Aᵀ with rows and columns flipped.",
        ),
        "ALG-MAT-007": (
            "A symmetric matrix equals its transpose.",
            "Adjust A until it matches Aᵀ.",
        ),
        "ALG-DET-001": (
            "The 2×2 determinant is the signed area of the column parallelogram.",
            "Move the vectors: the colored area is |det|; the sign is orientation.",
        ),
        "ALG-DET-002": (
            "A determinant can be expanded along a row or column (cofactors).",
            "Edit A and watch how det(A) responds.",
        ),
        "ALG-DET-003": (
            "det(AB) = det(A)det(B): areas multiply.",
            "Change A and B and compare the product’s area with the product of areas.",
        ),
        "ALG-DET-004": (
            "If the area (det) is zero, columns are parallel and there is no inverse.",
            "Flatten the parallelogram (area ≈ 0): the matrix becomes singular.",
        ),
        "ALG-DET-005": (
            "The inverse undoes A; it exists only if det ≠ 0.",
            "Edit A and watch det: if nonzero, the inverse is defined.",
        ),
        "ALG-DET-006": (
            "Cramer’s rule uses determinants to solve small systems.",
            "Change A and b: relate det(A) to having a unique solution.",
        ),
        "ALG-ESP-001": (
            "The span is every mix s·u + t·v.",
            "Move s and t: the orange arrow sweeps the plane (or line) spanned by u and v.",
        ),
        "ALG-ESP-002": (
            "If the parallelogram area is zero, the vectors are dependent.",
            "Align u and v: the label switches to “dependent”.",
        ),
        "ALG-ESP-003": (
            "A basis is an independent set that spans the whole space.",
            "Turn on “show basis” and compare with your vectors u and v.",
        ),
        "ALG-ESP-004": (
            "Coordinates say how much of each basis vector you need.",
            "Change s and t: they are coordinates of the combination in basis u, v.",
        ),
        "ALG-ESP-005": (
            "Rank is how many independent directions the matrix has.",
            "Edit A: use det/rank to see whether there are 0, 1, or 2 directions.",
        ),
        "ALG-ESP-006": (
            "Nullity counts nontrivial solutions of Ax = 0.",
            "Make columns dependent and relate that to directions sent to the origin.",
        ),
        "ALG-ESP-007": (
            "Rank + nullity = number of columns (in the n case).",
            "Explore dependent/independent vectors and how dimension splits.",
        ),
        "ALG-TRA-001": (
            "A linear map respects sums and scalings.",
            "Watch the grid warped by A: straight lines stay straight.",
        ),
        "ALG-TRA-002": (
            "Applying A pushes every point (and the grid) into a new shape.",
            "Change A’s entries: the mesh shows the linear push.",
        ),
        "ALG-TRA-003": (
            "The kernel is the vectors that A sends to the origin.",
            "Look for directions that collapse as det approaches zero.",
        ),
        "ALG-TRA-004": (
            "The image is the directions A can reach.",
            "Watch where the transformed basis arrows e₁ and e₂ point.",
        ),
        "ALG-TRA-005": (
            "Composing maps means applying one after the other (matrix product).",
            "Change A and think of it as one step of a composition.",
        ),
        "ALG-TRA-006": (
            "The inverse undoes A’s push.",
            "Tap Apply A⁻¹ (if it exists): the mesh moves back toward the original.",
        ),
        "ALG-TRA-007": (
            "A change of basis describes the same vectors with other coordinates.",
            "Edit A as a change-of-basis matrix and watch the mesh reorient.",
        ),
        "ALG-EIG-001": (
            "An eigenvector only stretches or shrinks; it does not turn aside.",
            "Enable eigenvectors: orange dashes mark those special directions.",
        ),
        "ALG-EIG-002": (
            "The characteristic equation finds the eigenvalues (stretch factors).",
            "Edit A and relate det(A−λI)=0 to the directions you see on the grid.",
        ),
        "ALG-EIG-003": (
            "An eigenspace is the line (or plane) of all eigenvectors for a λ.",
            "Watch the orange direction tied to each eigenvalue.",
        ),
        "ALG-EIG-004": (
            "Diagonalizing writes A in an eigenbasis where it only scales.",
            "With eigenvectors on, imagine axes where A only stretches.",
        ),
        "ALG-EIG-005": (
            "With A = PDP⁻¹, powering A means powering the diagonal scales.",
            "Explore A and its eigen-directions as a shortcut for Aⁿ.",
        ),
        "ALG-EIG-006": (
            "For symmetric matrices, eigenvectors can be chosen orthogonal.",
            "Try a nearly symmetric A and watch nearly perpendicular eigenvectors.",
        ),
        "ALG-ORT-001": (
            "Orthogonal means a right angle: the dot product is zero.",
            "Place u ⊥ v: u·v ≈ 0 and the angle reads as right.",
        ),
        "ALG-ORT-002": (
            "Projection is the shadow of u onto v’s direction.",
            "Drag u: the orange segment is the projection; the rest is orthogonal error.",
        ),
        "ALG-ORT-003": (
            "An orthogonal matrix rotates/reflects without changing lengths.",
            "Nudge A toward a rotation and see the mesh keep even lengths.",
        ),
        "ALG-ORT-004": (
            "Gram–Schmidt turns vectors into an orthogonal basis step by step.",
            "Advance the Gram–Schmidt step and watch the new orthogonal direction.",
        ),
        "ALG-LSQ-001": (
            "Least squares finds the closest point in the subspace to the data.",
            "Move the vectors and the point: the projection is the best approximation.",
        ),
        "ALG-LSQ-002": (
            "Normal equations AᵀAx = Aᵀb summarize that projection problem.",
            "Edit A and b as data for a linear least-squares fit.",
        ),
        "ALG-LSQ-003": (
            "The pseudoinverse generalizes the inverse when A is not invertible.",
            "Explore a rectangular/singular A and think of the “best” approximate solution.",
        ),
        "ALG-DEC-001": (
            "LU splits A into lower and upper triangular factors to solve systems easier.",
            "Apply row ops: you move toward the shape LU uses.",
        ),
        "ALG-DEC-002": (
            "QR writes A as an orthogonal/rotational part times a triangular part.",
            "View A’s mesh as that orthogonal-then-triangular composition.",
        ),
        "ALG-DEC-003": (
            "Spectral decomposition uses eigenvalues and eigenvectors.",
            "Enable eigenvectors: they are the axes of that decomposition.",
        ),
        "ALG-DEC-004": (
            "SVD splits A into rotate → scale → rotate.",
            "Tap the SVD step: 1) orient, 2) scale with σ, 3) rebuild with A.",
        ),
        "ALG-DEC-005": (
            "Keeping large σ values approximates A with low rank.",
            "Lower k: the mesh uses only the largest singular value (simplified).",
        ),
        "ALG-NOR-001": (
            "A matrix norm measures how much A can stretch a vector.",
            "Change A: large σ means strong stretch in some direction.",
        ),
        "ALG-NOR-002": (
            "Frobenius measures A’s size by summing squares of all entries.",
            "Edit A and relate large entries to a larger norm.",
        ),
        "ALG-NOR-003": (
            "The 1-norm ties to column sums.",
            "Make one column much larger: that norm grows with it.",
        ),
        "ALG-NOR-004": (
            "The infinity norm ties to row sums.",
            "Make one row dominant and watch A’s size react.",
        ),
        "ALG-NOR-005": (
            "The spectral norm is the largest stretch (σ₁).",
            "Look at the singular-value ellipse: the long axis is that stretch.",
        ),
        "ALG-NOR-006": (
            "‖AB‖ ≤ ‖A‖‖B‖: the product’s size is at most the product of sizes.",
            "Visually compare how much A stretches versus chained maps.",
        ),
        "ALG-NOR-007": (
            "The condition number says how sensitive a system is to error.",
            "Make σ₁ ≫ σ₂ (low k): the mesh flattens and the problem is ill-conditioned.",
        ),
        "ALG-BOO-001": (
            "You can check a logical identity row by row in the truth table.",
            "Toggle outputs: orange rows do not match what is expected.",
        ),
        "ALG-BOO-002": (
            "Some Boolean operations simplify (idempotent, complement).",
            "Toggle A and B and compare the table with the live result.",
        ),
        "ALG-BOO-003": (
            "Distributivity exists in logic too, not only for numbers.",
            "Check the table: AND/OR spreads like the area a(b+c).",
        ),
        "ALG-BOO-004": (
            "De Morgan: negating an AND is an OR of negations (and vice versa).",
            "Change A and B: both sides of each law always match.",
        ),
        "ALG-BOO-005": (
            "XOR is true when A and B differ.",
            "Try all four pairs: only 01 and 10 give 1.",
        ),
        "ALG-BOO-006": (
            "Absorption removes redundant terms in Boolean expressions.",
            "Compare table rows to see which entries are unnecessary.",
        ),
        "ALG-BOO-007": (
            "Sum of products writes the function as ORs of ANDs.",
            "Mark rows where the output is 1: those are your products.",
        ),
        "ALG-BOO-008": (
            "Product of sums is the dual form: ANDs of ORs.",
            "Use the table to see which clauses cover the function’s zeros.",
        ),
        "ALG-BOO-009": (
            "Two expressions are equivalent if their truth tables match.",
            "Edit outputs: if everything shows ✓, the tables agree.",
        ),
        "ALG-MOD-001": (
            "a and b are congruent mod m if they land on the same clock tick.",
            "Move a and b: the text says whether a ≡ b (mod m) when they share a mark.",
        ),
        "ALG-MOD-002": (
            "Adding and multiplying mod m means operate, then wrap back to 0…m−1.",
            "Change a, b, and m: marks show a+b and a·b on the circle.",
        ),
        "ALG-MOD-003": (
            "The inverse of a mod m exists only if gcd(a, m) = 1.",
            "Try several a: if there is no inverse, the text says so.",
        ),
        "ALG-MOD-005": (
            "The Chinese remainder theorem merges two clocks (m and m₂) into one x.",
            "Adjust a, b, m, m₂: when it exists, you get the x that fits both remainders.",
        ),
        "ALG-MOD-006": (
            "Fermat: if p is prime and p does not divide a, then a^(p−1) ≡ 1 (mod p).",
            "With prime m, check a^(p−1) in the caption; it should be 1 if gcd(a,p)=1.",
        ),
        "ALG-EST-006": (
            "In a prime field, addition and multiplication wrap mod p.",
            "Pick p and open + / · tables; tap a cell for the result and inverse.",
        ),
        "ALG-COD-001": (
            "A linear code is a subspace: summing codewords yields another codeword.",
            "Read the codeword list: their sum stays inside the set.",
        ),
        "ALG-COD-002": (
            "Generator matrix G builds codewords from messages.",
            "Edit bits/entries and think of each G row as a base pattern of the code.",
        ),
        "ALG-COD-003": (
            "H checks parity: valid words satisfy H c = 0.",
            "Flip a bit and relate the failure to a nonzero syndrome (see COD-004).",
        ),
        "ALG-COD-004": (
            "The syndrome points (in simple codes) to the erroneous bit.",
            "Pick the error position: syndrome s updates immediately.",
        ),
        "ALG-COD-005": (
            "Hamming distance counts positions where two words differ.",
            "Edit the two strings: differing bits highlight and d_H updates.",
        ),
        "ALG-COD-006": (
            "With minimum distance d you can detect/correct a limited number of errors.",
            "Move d_min: the correction radius t = ⌊(d−1)/2⌋ changes with it.",
        ),
        "ALG-COD-007": (
            "Rate k/n measures useful information versus total length.",
            "Adjust n and k: the bar shows message share versus redundancy.",
        ),
    }
    TRANSLATIONS["en"] = en

    # For de/fr/it/pt use English as bridge with locale-specific rewrites for high-traffic
    # plus a lightweight lexical pass for the rest (still readable). Full human quality
    # for every string would be huge; we provide real translations for all via mapping.
    # We'll load from a generated companion built below in this same run.


def apply_md(copy: dict[str, tuple[str, str]]) -> tuple[dict[str, str], dict[str, str]]:
    text = MD.read_text()
    old_to_new_obj: dict[str, str] = {}
    old_to_new_idea: dict[str, str] = {}

    for fid, (obj, idea) in copy.items():
        pat = re.compile(
            rf"(\*\*ID:\*\* `{re.escape(fid)}`[\s\S]*?- \*\*Idea:\*\*\s*)(.+)(\n- \*\*Objetivo educativo:\*\*\s*)(.+)",
            re.M,
        )

        def repl(m: re.Match[str], _obj=obj, _idea=idea) -> str:
            old_idea = m.group(2).strip()
            old_obj = m.group(4).strip()
            old_to_new_idea[old_idea] = _idea
            old_to_new_obj[old_obj] = _obj
            return f"{m.group(1)}{_idea}{m.group(3)}{_obj}"

        text2, n = pat.subn(repl, text, count=1)
        if n != 1:
            print("WARN missing", fid)
        text = text2

    # Update field docs
    text = text.replace(
        "- **Idea:** comportamiento o comparación que la representación debe mostrar.\n"
        "- **Objetivo educativo:** relación que el estudiante debería comprender al verla.\n",
        "- **Idea:** instrucción breve en lenguaje claro: qué probar con los controles.\n"
        "- **Objetivo educativo:** en una frase, qué entiende el usuario al usar el gráfico.\n",
    )
    MD.write_text(text)
    return old_to_new_obj, old_to_new_idea


def sync_i18n(
    old_to_new_obj: dict[str, str],
    old_to_new_idea: dict[str, str],
    translations: dict[str, dict[str, tuple[str, str]]],
) -> None:
    # Build spanish -> (obj_en, idea_en) via fid
    es_obj_to_fid = {COPY[fid][0]: fid for fid in COPY}
    es_idea_to_fid = {COPY[fid][1]: fid for fid in COPY}

    for loc, pairs in translations.items():
        path = I18N / f"{loc}.json"
        data = json.loads(path.read_text())
        # Remove obsolete keys that we replaced (optional cleanup of exact old strings)
        for old in list(old_to_new_obj) + list(old_to_new_idea):
            data.pop(old, None)
        for fid, (obj_es, idea_es) in COPY.items():
            if fid not in pairs:
                continue
            obj_tr, idea_tr = pairs[fid]
            data[obj_es] = obj_tr
            data[idea_es] = idea_tr
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print(loc, "keys", len(data))


# Additional locale packs (de/fr/it/pt) — concise plain language
def build_romance_germanic() -> None:
    # Start from English and apply phrasebook substitutions + manual overrides for foundations
    phrase = {
        "de": [
            ("Tap ", "Tippe auf "),
            ("Move ", "Bewege "),
            ("Change ", "Ändere "),
            ("Drag ", "Ziehe "),
            ("Edit ", "Bearbeite "),
            ("Look at ", "Sieh dir "),
            ("Watch ", "Beobachte "),
            ("Try ", "Probiere "),
            ("Pick ", "Wähle "),
            ("Adjust ", "Passe "),
            ("Turn on ", "Aktiviere "),
            ("Enable ", "Aktiviere "),
            ("Compare ", "Vergleiche "),
            ("does not change", "ändert sich nicht"),
            ("the same", "gleich"),
        ],
    }
    # Provide full DE/FR/IT/PT by translating from EN with a dedicated dict for all IDs.
    # To keep the file maintainable, we store them as transforms of EN using a simple glossary
    # plus handwritten overrides for the FND/EQU/SIS showcase set.
    pass


if __name__ == "__main__":
    tr_all()
    # Build de/fr/it/pt from English with a translation table file embedded:
    from rewrite_viz_copy_locales import LOCALES  # type: ignore

    TRANSLATIONS.update(LOCALES)
    old_obj, old_idea = apply_md(COPY)
    sync_i18n(old_obj, old_idea, TRANSLATIONS)
    print("rewrote", len(COPY), "formulas")

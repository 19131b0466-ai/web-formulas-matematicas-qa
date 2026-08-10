"""Plain-language viz copy: Spanish source + i18n (en/de/fr/it/pt).

Importable as:
    from plain_viz_copy_data import COPY_ES, COPY_I18N
"""

from __future__ import annotations

COPY_ES: dict[str, tuple[str, str]] = {
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
        "Vas a ver que el 2 de 2ab sale porque hay dos rectángulos distintos de área ab.",
        "Un cuadrado de lado a+b tiene área (a+b)²; al partir cada lado en a y b aparecen a², dos ab y b².",
    ),
    "ALG-IDN-002": (
        "Vas a ver por qué aparece −2ab y por qué hace falta la corrección +b².",
        "Partimos de un cuadrado de área a²; al quitar dos franjas ab y corregir +b² queda (a−b)².",
    ),
    "ALG-IDN-003": (
        "Vas a ver de dónde salen geométricamente a−b y a+b, no solo que “cambia la figura”.",
        "Partimos de un cuadrado de lado a, retiramos uno de lado b y reordenamos el área restante: queda un rectángulo (a−b)(a+b).",
    ),
    "ALG-IDN-008": (
        "Vas a ver cómo la fila n de Pascal y los exponentes a^{n-k}b^k construyen toda la expansión.",
        "Cada término tiene tres partes: un coeficiente binomial, una potencia de a y una potencia de b; los exponentes siempre suman n.",
    ),
    "ALG-FAC-001": (
        "Vas a ver que factorizar es juntar áreas que comparten un lado, la inversa de distribuir.",
        "Los términos ab y ac comparten el factor a; al unir los rectángulos, los anchos b y c se suman.",
    ),
    "ALG-FAC-002": (
        "Factorizar a²−b² es rearmar el área sobrante como un rectángulo.",
        "Alterna entre la L a²−b² y el rectángulo (a−b)(a+b): son las mismas piezas.",
    ),
    "ALG-FAC-003": (
        "Un trinomio cuadrado perfecto se arma como un cuadrado completo.",
        "Ajusta a y b y mira cómo a²+2ab+b² es exactamente el área del cuadrado (a+b)².",
    ),
    "ALG-EQU-001": (
        "Vas a ver la diferencia entre la ecuación ax+b=0 y la función y=ax+b, y que la solución es la intersección con el eje x.",
        "Resolver ax+b=0 es encontrar el x que anula la expresión; gráficamente, donde y=ax+b cruza el eje x.",
    ),
    "ALG-EQU-003": (
        "Las soluciones reales de ax²+bx+c=0 son los x donde y=ax²+bx+c vale cero; Δ dice cuántas hay.",
        "Cambia a, b y c y relaciona Δ, la fórmula cuadrática y los cortes de la parábola con el eje x.",
    ),
    "ALG-EQU-004": (
        "Δ no calcula las raíces por sí solo: determina si hay dos, una (doble) o ninguna raíz real.",
        "Usa los ejemplos guiados o mueve a, b y c: el signo de Δ fija el caso; la gráfica confirma los cortes.",
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
        "El sistema se puede escribir como una sola ecuación con matrices: Ax = b.",
        "Edita A y observa cómo se organiza la información del sistema.",
    ),
    "ALG-SIS-003": (
        "Cada fila de la matriz aumentada es una ecuación del sistema.",
        "Elige R₁ o R₂: debajo aparece la ecuación que representa esa fila.",
    ),
    "ALG-SIS-004": (
        "Las operaciones de fila cambian la matriz, pero el sistema sigue siendo equivalente.",
        "Prueba intercambiar, escalar o sumar filas y mira cómo cambia A.",
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

COPY_I18N: dict[str, dict[str, tuple[str, str]]] = {
    "en": {
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
            "You'll see that the 2 in 2ab comes from two distinct rectangles of area ab.",
            "A square of side a+b has area (a+b)²; splitting each side into a and b yields a², two ab and b².",
        ),
        "ALG-IDN-002": (
            "You'll see why −2ab appears and why the +b² correction is needed.",
            "We start from a square of area a²; removing two strips ab and correcting with +b² leaves (a−b)².",
        ),
        "ALG-IDN-003": (
            "You'll see where a−b and a+b come from geometrically, not just that “the figure changes”.",
            "We start from a square of side a, remove one of side b, and rearrange the remaining area into a rectangle (a−b)(a+b).",
        ),
        "ALG-IDN-008": (
            "You'll see how Pascal row n and the exponents a^{n-k}b^k build the full expansion.",
            "Each term has three parts: a binomial coefficient, a power of a and a power of b; the exponents always add to n.",
        ),
        "ALG-FAC-001": (
            "You'll see that factoring is joining areas that share a side — the inverse of distributing.",
            "The terms ab and ac share the factor a; when the rectangles join, widths b and c add.",
        ),
        "ALG-FAC-002": (
            "Factoring a²−b² rebuilds the leftover area as a rectangle.",
            "Switch between the L a²−b² and the rectangle (a−b)(a+b): they are the same pieces.",
        ),
        "ALG-FAC-003": (
            "A perfect-square trinomial builds a complete square.",
            "Adjust a and b and see how a²+2ab+b² is exactly the area of the square (a+b)².",
        ),
        "ALG-EQU-001": (
            "You'll see the difference between the equation ax+b=0 and the function y=ax+b, and that the solution is the intersection with the x-axis.",
            "Solving ax+b=0 means finding the x that makes the expression zero; graphically, where y=ax+b crosses the x-axis.",
        ),
        "ALG-EQU-003": (
            "The real solutions of ax²+bx+c=0 are the x where y=ax²+bx+c is zero; Δ tells how many there are.",
            "Change a, b, and c and relate Δ, the quadratic formula, and where the parabola meets the x-axis.",
        ),
        "ALG-EQU-004": (
            "Δ does not compute the roots by itself: it tells whether there are two, one (double), or no real roots.",
            "Use the guided examples or move a, b, and c: the sign of Δ fixes the case; the graph confirms the cuts.",
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
            "The system can be written as one matrix equation Ax = b.",
            "Edit A and see how the system’s information is arranged.",
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
    },
    "de": {
        "ALG-FND-001": (
            "Die Reihenfolge der Summanden ändert das Ergebnis nicht.",
            "Tippe auf Vertauschen: Die Blöcke tauschen den Platz, die Gesamtleiste bleibt gleich.",
        ),
        "ALG-FND-002": (
            "Auch wenn du die Zahlen anders gruppierst, bleibt die Summe (oder das Produkt) gleich.",
            "Tippe Gruppieren links/rechts. Nur der Rahmen bewegt sich; die Summe a+b+c bleibt gleich.",
        ),
        "ALG-FND-003": (
            "Eine Summe zu multiplizieren ist wie die Flächen zweier Rechtecke zu addieren.",
            "Bewege a, b und c: Das große Rechteck a(b+c) teilt sich in ab und ac mit derselben Gesamtfläche.",
        ),
        "ALG-FND-006": (
            "Der Absolutbetrag ist der Abstand zur Null: er ist nie negativ.",
            "Bewege x nach links oder rechts: Die Markierung zeigt, wie weit er vom Ursprung ist.",
        ),
        "ALG-FND-007": (
            "Der Abstand zweier Punkte ist die Länge der Strecke zwischen ihnen.",
            "Bewege a und b: Der Abstand |a−b| ist die Länge zwischen den beiden Punkten.",
        ),
        "ALG-POT-001": (
            "Multiplizierst du Potenzen mit gleicher Basis, addieren sich die Exponenten.",
            "Ändere n und m: Die Blöcke a^n und a^m fügen sich zu a^(n+m) zusammen.",
        ),
        "ALG-POT-008": (
            "Das Konjugierte hilft, eine Wurzel aus dem Nenner zu entfernen.",
            "Vergleiche a+√b mit a−√b: Ihr Produkt beseitigt die Wurzel in der Mitte.",
        ),
        "ALG-EXP-003": (
            "Du siehst, warum (ax+b)(cx+d)=acx^2+(ad+bc)x+bd gilt und wie adx und bcx sich addieren.",
            "Jeder Term des ersten Polynoms wird mit jedem Term des zweiten multipliziert; danach werden gleiche Potenzen von x zusammengefasst.",
        ),
        "ALG-IDN-001": (
            "(a+b)² sieht aus wie ein Quadrat, das in vier Teile geschnitten ist.",
            "Ändere a und b: Das große Quadrat ist a² + 2ab + b².",
        ),
        "ALG-IDN-002": (
            "(a−b)² ist ebenfalls eine Fläche, mit einer Korrektur in der Ecke.",
            "Stelle a und b ein und beobachte, wie a², −2ab und +b² erscheinen.",
        ),
        "ALG-IDN-003": (
            "a²−b² ist die Fläche, die bleibt, wenn man ein kleines Quadrat aus einem großen entfernt.",
            "Wechsle von a²−b² zum Rechteck (a−b)(a+b): Es ist dieselbe Menge.",
        ),
        "ALG-IDN-008": (
            "Die Binomialkoeffizienten sind eine Pascal-Zeile.",
            "Ändere n: Du siehst die Pascal-Zahlen und wie (a+b)^n aufgebaut wird.",
        ),
        "ALG-FAC-001": (
            "Einen gemeinsamen Faktor auszuklammern fasst Flächen mit gemeinsamer Seite neu zusammen.",
            "Bewege a, b und c: Das Rechteck a(b+c) entspricht ab+ac.",
        ),
        "ALG-FAC-002": (
            "a²−b² zu faktorisieren baut die Restfläche als Rechteck neu auf.",
            "Wechsle zwischen a²−b² und (a−b)(a+b), um zu sehen, dass sie übereinstimmen.",
        ),
        "ALG-FAC-003": (
            "Ein vollständiges-Quadrat-Trinom baut ein komplettes Quadrat.",
            "Stelle a und b ein, bis du das Muster (a±b)² in den Teilen siehst.",
        ),
        "ALG-EQU-001": (
            "Eine lineare Gleichung ist eine Gerade: Die Lösung ist dort, wo sie die x-Achse trifft.",
            "Bewege Steigung und Achsenabschnitt; finde, wo die Gerade die horizontale Achse kreuzt.",
        ),
        "ALG-EQU-003": (
            "Die Parabel trifft die x-Achse an den Lösungen (falls vorhanden).",
            "Ändere a, b und c: Beobachte die Diskriminante Δ und die orangenen Wurzelmarkierungen.",
        ),
        "ALG-EQU-004": (
            "Die Diskriminante sagt, wie viele reelle Wurzeln die Quadratische hat.",
            "Stelle a, b und c ein und sieh, ob es laut Δ 2, 1 oder keine reellen Wurzeln gibt.",
        ),
        "ALG-EQU-005": (
            "Quadratische Ergänzung bedeutet, die fehlende Ecke hinzuzufügen (und wieder abzuziehen).",
            "Tippe Hinzufügen/Abziehen (b/2)²: Du siehst, wo der Term b²/4 herkommt.",
        ),
        "ALG-EQU-008": (
            "Eine Betragsgleichung hat oft zwei symmetrische Lösungen.",
            "Bewege den Punkt auf der Geraden und verknüpfe Abstände mit den Lösungen.",
        ),
        "ALG-INE-001": (
            "Eine lineare Ungleichung malt einen Strahl oder ein Intervall auf der Zahlengeraden.",
            "Ändere Grenze und Ungleichungstyp: Der schattierte Bereich ist die Lösung.",
        ),
        "ALG-INE-002": (
            "Die Lösung einer quadratischen Ungleichung ist dort, wo die Parabel über (oder unter) der Achse liegt.",
            "Stelle die Parabel ein: Der schattierte Bereich markiert die passenden x-Werte.",
        ),
        "ALG-INE-003": (
            "Bei rationalen Ungleichungen achte auf Punkte, an denen der Nenner null ist.",
            "Bewege die Grenze und sieh, welcher Teil der Geraden erlaubt ist.",
        ),
        "ALG-INE-004": (
            "Betrag in Ungleichungen definiert zentrierte oder äußere Intervalle.",
            "Ändere Radius und offene/geschlossene Enden, um das Lösungsintervall zu sehen.",
        ),
        "ALG-SIS-001": (
            "Ein 2×2-System sind zwei Geraden: Die Lösung ist ihr Schnittpunkt (falls sie sich treffen).",
            "Bewege die Steigung: Der orangene Punkt markiert den Schnitt, oder du siehst Parallelen.",
        ),
        "ALG-SIS-002": (
            "Das System lässt sich als eine Matrixgleichung Ax = b schreiben.",
            "Bearbeite A und sieh, wie die Information des Systems angeordnet ist.",
        ),
        "ALG-SIS-003": (
            "Jede Zeile der erweiterten Matrix ist eine Gleichung des Systems.",
            "Wähle R₁ oder R₂: Darunter erscheint die Gleichung dieser Zeile.",
        ),
        "ALG-SIS-004": (
            "Zeilenoperationen ändern die Matrix, aber das System bleibt äquivalent.",
            "Probiere Vertauschen, Skalieren oder Addieren von Zeilen und sieh, wie A sich ändert.",
        ),
        "ALG-SIS-005": (
            "Rangvergleiche sagen dir, ob es eine, unendlich viele oder keine Lösung gibt.",
            "Mache A singulär oder nicht und beobachte den Rang- / ∅- / ∞-Indikator.",
        ),
        "ALG-FUN-001": (
            "Der Definitionsbereich sind die x, für die die Funktion Sinn hat (hier x ≠ 0).",
            "Sieh dir 1/x an: Nahe null schießt die Kurve hoch; diese Lücke ist der gebrochene Definitionsbereich.",
        ),
        "ALG-FUN-002": (
            "Zusammensetzen heißt, eine Funktion nach der anderen anzuwenden.",
            "Bewege x₀ und die Parameter: Der angezeigte Wert ist f(g(x)).",
        ),
        "ALG-FUN-003": (
            "Die Umkehrfunktion macht die Funktion rückgängig: Die Graphen sind Spiegelbilder an y = x.",
            "Vergleiche die Kurve und ihre Umkehrfunktion; die gestrichelte Diagonale ist der Spiegel y = x.",
        ),
        "ALG-FUN-005": (
            "Eine Gerade ist durch Steigung und y-Achsenabschnitt festgelegt.",
            "Bewege m und b: Die Gerade neigt und verschiebt sich sofort.",
        ),
        "ALG-FUN-006": (
            "Parallele Geraden haben gleiche Steigung; senkrechte haben negativ-reziproke Steigungen.",
            "Stelle beide Geraden ein und sieh, wann sie sich nie treffen oder im rechten Winkel kreuzen.",
        ),
        "ALG-FUN-007": (
            "Eine Verschiebung bewegt einen Graphen, ohne ihn zu verformen.",
            "Bewege h und k: Die Kurve verschiebt sich horizontal und vertikal.",
        ),
        "ALG-FUN-008": (
            "Skalieren und Spiegeln strecken, stauchen oder klappen die Kurve.",
            "Ändere a und die Spiegelung: Beobachte, wie sich die Welle verformt.",
        ),
        "ALG-POL-007": (
            "Ein Polynom in zwei Variablen ordnet jedem Punkt (x, y) einen Wert zu.",
            "Bewege a, b und c: Die Farbkarte zeigt z = ax² + bxy + cy².",
        ),
        "ALG-POL-008": (
            "Der Gesamtgrad addiert die Exponenten jeder Variablen.",
            "Ändere α und β: Das Rechteck veranschaulicht den Grad α+β von x^α y^β.",
        ),
        "ALG-POL-009": (
            "Bei einem homogenen Polynom skaliert das Skalieren von (x, y) das Ergebnis vorhersehbar.",
            "Aktiviere die homogene Form und bewege t: Vergleiche P(tx, ty) mit t^d P(x, y).",
        ),
        "ALG-POL-010": (
            "Ein Polynomsystem sieht aus wie Kurven, die sich in den Lösungen treffen.",
            "Stelle die Parameter ein und suche die Kreuzungen der beiden Kurven.",
        ),
        "ALG-POL-011": (
            "Die Resultante packt Bedingungen für gemeinsame Wurzeln in eine Matrix.",
            "Bearbeite die Matrix und beobachte die Determinante als Signal gemeinsamer Wurzeln.",
        ),
        "ALG-LOG-001": (
            "Eine Exponentialfunktion wächst (oder fällt) durch wiederholtes Multiplizieren.",
            "Ändere die Basis: Die Kurve wird steiler oder flacher.",
        ),
        "ALG-LOG-002": (
            "Der Logarithmus antwortet: „Mit welchem Exponenten erhalte ich x?“.",
            "Vergleiche Log und Exponential: Sie sind Umkehrungen; y = x spiegelt sie.",
        ),
        "ALG-LOG-007": (
            "Das Vorzeichen der Rate entscheidet über Wachstum oder Zerfall.",
            "Bewege k (über b) und sieh, ob die Kurve mit der Zeit steigt oder fällt.",
        ),
        "ALG-COM-001": (
            "Eine komplexe Zahl a+bi ist ein Punkt (oder Pfeil) in der Ebene.",
            "Ziehe die Spitze: Die Koordinaten sind Real- und Imaginärteil.",
        ),
        "ALG-COM-002": (
            "Das Konjugierte spiegelt die Zahl an der reellen Achse.",
            "Ziehe z: Der orangene Pfeil ist das Konjugierte (gleiche x, y umgekehrt).",
        ),
        "ALG-COM-003": (
            "Der Betrag ist die Länge des Pfeils vom Ursprung.",
            "Strecke oder verkürze den Vektor: r ist diese Länge.",
        ),
        "ALG-COM-004": (
            "In Polarform nutzt du Länge und Winkel statt (x, y).",
            "Drehe θ: Der Punkt bewegt sich auf dem Kreis mit Radius r.",
        ),
        "ALG-COM-005": (
            "Euler verbindet den Winkel mit Kosinus und Sinus auf dem Einheitskreis.",
            "Bewege θ: Der Punkt (cos θ, sin θ) wandert um den Kreis.",
        ),
        "ALG-COM-006": (
            "Hoch n multipliziert den Winkel mit n und potenziert den Radius.",
            "Ändere n und θ: Du siehst z, z², z³… drehen und wachsen wie rⁿ.",
        ),
        "ALG-COM-007": (
            "Die n-ten Wurzeln sitzen wie Eckpunkte eines regelmäßigen Vielecks.",
            "Ändere n: Die orangenen Punkte verteilen sich auf dem Kreis.",
        ),
        "ALG-SEC-001": (
            "In einer arithmetischen Folge addiert jeder Schritt denselben Betrag.",
            "Bewege a₁ und d: Die Punkte steigen oder fallen in konstanten Schritten.",
        ),
        "ALG-SEC-003": (
            "In einer geometrischen Folge wird jeder Term mit r multipliziert.",
            "Ändere a und r: Punkte wachsen oder nähern sich null, je nach |r|.",
        ),
        "ALG-SEC-005": (
            "Wenn |r|<1, nähert sich die unendliche geometrische Reihe einem Grenzwert.",
            "Probiere |r|<1 und |r|≥1: Sieh, ob Punkte sich stabilisieren oder explodieren.",
        ),
        "ALG-SEC-007": (
            "Eine Rekursion baut jeden Term aus den vorherigen.",
            "Ändere die Koeffizienten und beobachte, wie die Folge Punkt für Punkt verläuft.",
        ),
        "ALG-VEC-001": (
            "Ein Vektor ist ein Pfeil: Richtung und Länge.",
            "Ziehe die Spitzen, um den Vektor in der Ebene zu ändern.",
        ),
        "ALG-VEC-002": (
            "Die Norm ist die Länge des Pfeils.",
            "Strecke u: ‖u‖ aktualisiert sich mit der Länge.",
        ),
        "ALG-VEC-003": (
            "Ein Einheitsvektor hat Länge 1 und behält die Richtung.",
            "Bewege u: Du siehst die normalisierte û mit Länge 1.",
        ),
        "ALG-VEC-004": (
            "Das Skalarprodukt misst Ausrichtung: positiv bedeutet spitzer Winkel.",
            "Ziehe u und v: Beobachte u·v und spitz/recht/stumpf; die Projektion ist orange.",
        ),
        "ALG-VEC-005": (
            "Der Winkel zwischen Vektoren kommt aus dem Skalarprodukt.",
            "Bewege die Pfeile: Winkel und Typ aktualisieren sich live.",
        ),
        "ALG-VEC-006": (
            "Der Abstand zwischen Vektorspitzen ist die Norm der Differenz.",
            "Trenne u und v: Der Abstand wächst mit der Trennung.",
        ),
        "ALG-VEC-007": (
            "Eine Linearkombination mischt Vektoren mit Gewichten.",
            "Ziehe u und v: Der orangene Pfeil ist 0.7u + 0.5v.",
        ),
        "ALG-MAT-001": (
            "Eine Matrix ist eine Zahlentabelle in Zeilen und Spalten.",
            "Bearbeite die Einträge von A: Jede Zelle ist ein Koeffizient des linearen Objekts.",
        ),
        "ALG-MAT-002": (
            "Matrixaddition erfolgt Eintrag für Eintrag.",
            "Ändere A und B: A+B aktualisiert sich Zelle für Zelle.",
        ),
        "ALG-MAT-003": (
            "Skalieren einer Matrix streckt oder kehrt jeden Eintrag um.",
            "Bewege c: Sieh, wie cA wächst, schrumpft oder das Vorzeichen wechselt.",
        ),
        "ALG-MAT-004": (
            "Jeder Eintrag von AB mischt eine Zeile von A mit einer Spalte von B.",
            "Wähle eine Zelle (i,j): Darunter siehst du die Zeile×Spalte-Rechnung.",
        ),
        "ALG-MAT-005": (
            "Die Einheitsmatrix lässt Vektoren unverändert: Sie ist die „1“ der Matrizen.",
            "Vergleiche A mit der Wirkung der Einheitsmatrix auf die Basis.",
        ),
        "ALG-MAT-006": (
            "Die Transponierte tauscht Zeilen und Spalten.",
            "Bearbeite A: Rechts siehst du Aᵀ mit vertauschten Zeilen und Spalten.",
        ),
        "ALG-MAT-007": (
            "Eine symmetrische Matrix ist gleich ihrer Transponierten.",
            "Stelle A ein, bis sie mit Aᵀ übereinstimmt.",
        ),
        "ALG-DET-001": (
            "Die 2×2-Determinante ist die signierte Fläche des Spaltenparallelogramms.",
            "Bewege die Vektoren: Die farbige Fläche ist |det|; das Vorzeichen ist die Orientierung.",
        ),
        "ALG-DET-002": (
            "Eine Determinante lässt sich nach einer Zeile oder Spalte entwickeln (Kofaktoren).",
            "Bearbeite A und beobachte, wie det(A) reagiert.",
        ),
        "ALG-DET-003": (
            "det(AB) = det(A)det(B): Flächen multiplizieren sich.",
            "Ändere A und B und vergleiche die Fläche des Produkts mit dem Produkt der Flächen.",
        ),
        "ALG-DET-004": (
            "Ist die Fläche (det) null, sind die Spalten parallel und es gibt keine Inverse.",
            "Mache das Parallelogramm flach (Fläche ≈ 0): Die Matrix wird singulär.",
        ),
        "ALG-DET-005": (
            "Die Inverse macht A rückgängig; sie existiert nur, wenn det ≠ 0.",
            "Bearbeite A und beobachte det: Ist sie ungleich null, ist die Inverse definiert.",
        ),
        "ALG-DET-006": (
            "Cramer nutzt Determinanten, um kleine Systeme zu lösen.",
            "Ändere A und b: Verknüpfe det(A) mit einer eindeutigen Lösung.",
        ),
        "ALG-ESP-001": (
            "Der Spannraum sind alle Mischungen s·u + t·v.",
            "Bewege s und t: Der orangene Pfeil überstreicht die Ebene (oder Gerade), die u und v aufspannen.",
        ),
        "ALG-ESP-002": (
            "Ist die Parallelogrammfläche null, sind die Vektoren abhängig.",
            "Richte u und v aus: Die Anzeige wechselt zu „abhängig“.",
        ),
        "ALG-ESP-003": (
            "Eine Basis ist eine unabhängige Menge, die den ganzen Raum aufspannt.",
            "Aktiviere „Basis zeigen“ und vergleiche mit deinen Vektoren u und v.",
        ),
        "ALG-ESP-004": (
            "Koordinaten sagen, wie viel von jedem Basisvektor du brauchst.",
            "Ändere s und t: Sie sind die Koordinaten der Kombination in der Basis u, v.",
        ),
        "ALG-ESP-005": (
            "Der Rang ist, wie viele unabhängige Richtungen die Matrix hat.",
            "Bearbeite A: Nutze det/Rang, um zu sehen, ob es 0, 1 oder 2 Richtungen gibt.",
        ),
        "ALG-ESP-006": (
            "Die Nullität zählt nichttriviale Lösungen von Ax = 0.",
            "Mache Spalten abhängig und verknüpfe das mit Richtungen zum Ursprung.",
        ),
        "ALG-ESP-007": (
            "Rang + Nullität = Anzahl der Spalten (im Fall n).",
            "Erkunde abhängige/unabhängige Vektoren und wie sich die Dimension teilt.",
        ),
        "ALG-TRA-001": (
            "Eine lineare Abbildung respektiert Summen und Skalierungen.",
            "Sieh das durch A verzerrte Gitter: Gerade Linien bleiben gerade.",
        ),
        "ALG-TRA-002": (
            "A anzuwenden schiebt jeden Punkt (und das Gitter) in eine neue Form.",
            "Ändere die Einträge von A: Das Netz zeigt den linearen Schub.",
        ),
        "ALG-TRA-003": (
            "Der Kern sind die Vektoren, die A zum Ursprung schickt.",
            "Suche Richtungen, die kollabieren, wenn det gegen null geht.",
        ),
        "ALG-TRA-004": (
            "Das Bild sind die Richtungen, die A erreichen kann.",
            "Beobachte, wohin die transformierten Basispfeile e₁ und e₂ zeigen.",
        ),
        "ALG-TRA-005": (
            "Abbildungen zusammensetzen heißt, eine nach der anderen anzuwenden (Matrixprodukt).",
            "Ändere A und denke daran als einen Schritt einer Zusammensetzung.",
        ),
        "ALG-TRA-006": (
            "Die Inverse macht den Schub von A rückgängig.",
            "Tippe A⁻¹ anwenden (falls vorhanden): Das Netz geht zur Originalform zurück.",
        ),
        "ALG-TRA-007": (
            "Basiswechsel beschreibt dieselben Vektoren mit anderen Koordinaten.",
            "Bearbeite A als Wechselmatrix und sieh, wie sich das Netz neu ausrichtet.",
        ),
        "ALG-EIG-001": (
            "Ein Eigenvektor streckt oder staucht sich nur; er dreht sich nicht zur Seite.",
            "Aktiviere Eigenvektoren: Orange Striche markieren diese besonderen Richtungen.",
        ),
        "ALG-EIG-002": (
            "Die charakteristische Gleichung findet die Eigenwerte (Streckfaktoren).",
            "Bearbeite A und verknüpfe det(A−λI)=0 mit den Richtungen auf dem Gitter.",
        ),
        "ALG-EIG-003": (
            "Der Eigenraum ist die Gerade (oder Ebene) aller Eigenvektoren zu einem λ.",
            "Beobachte die orangene Richtung zu jedem Eigenwert.",
        ),
        "ALG-EIG-004": (
            "Diagonalisieren schreibt A in einer Eigenbasis, wo sie nur skaliert.",
            "Mit sichtbaren Eigenvektoren stelle dir Achsen vor, auf denen A nur streckt.",
        ),
        "ALG-EIG-005": (
            "Mit A = PDP⁻¹ bedeutet Potenzieren von A, die Skalen auf der Diagonalen zu potenzieren.",
            "Erkunde A und seine Eigenrichtungen als Abkürzung für Aⁿ.",
        ),
        "ALG-EIG-006": (
            "Bei symmetrischen Matrizen können Eigenvektoren orthogonal gewählt werden.",
            "Probiere eine fast symmetrische A und sieh fast senkrechte Eigenvektoren.",
        ),
        "ALG-ORT-001": (
            "Orthogonal bedeutet rechter Winkel: Das Skalarprodukt ist null.",
            "Stelle u ⊥ v: u·v ≈ 0 und der Winkel wird als recht angezeigt.",
        ),
        "ALG-ORT-002": (
            "Projektion ist der Schatten von u auf die Richtung von v.",
            "Ziehe u: Das orangene Segment ist die Projektion; der Rest ist der orthogonale Fehler.",
        ),
        "ALG-ORT-003": (
            "Eine orthogonale Matrix rotiert/spiegelt, ohne Längen zu ändern.",
            "Schiebe A zu einer Rotation und sieh, dass das Netz Längen gleichmäßig hält.",
        ),
        "ALG-ORT-004": (
            "Gram–Schmidt macht aus Vektoren schrittweise eine orthogonale Basis.",
            "Gehe den Gram–Schmidt-Schritt weiter und beobachte die neue orthogonale Richtung.",
        ),
        "ALG-LSQ-001": (
            "Kleinste Quadrate finden den zum Datum nächsten Punkt im Unterraum.",
            "Bewege die Vektoren und den Punkt: Die Projektion ist die beste Näherung.",
        ),
        "ALG-LSQ-002": (
            "Die Normalgleichungen AᵀAx = Aᵀb fassen dieses Projektionsproblem zusammen.",
            "Bearbeite A und b als Daten einer linearen Ausgleichsrechnung.",
        ),
        "ALG-LSQ-003": (
            "Die Pseudoinverse verallgemeinert die Inverse, wenn A nicht invertierbar ist.",
            "Erkunde eine rechteckige/singuläre A und denke an die „beste“ Näherungslösung.",
        ),
        "ALG-DEC-001": (
            "LU zerlegt A in untere und obere Dreiecksmatrix, um Systeme leichter zu lösen.",
            "Wende Zeilenoperationen an: Du näherst dich der Form, die LU nutzt.",
        ),
        "ALG-DEC-002": (
            "QR schreibt A als orthogonalen/rotierenden Teil mal einen Dreiecksteil.",
            "Sieh das Netz von A als diese orthogonal-dann-dreieckige Zusammensetzung.",
        ),
        "ALG-DEC-003": (
            "Die Spektralzerlegung nutzt Eigenwerte und Eigenvektoren.",
            "Aktiviere Eigenvektoren: Sie sind die Achsen dieser Zerlegung.",
        ),
        "ALG-DEC-004": (
            "SVD zerlegt A in rotieren → skalieren → rotieren.",
            "Tippe den SVD-Schritt: 1) ausrichten, 2) mit σ skalieren, 3) mit A neu zusammensetzen.",
        ),
        "ALG-DEC-005": (
            "Große σ behalten heißt A mit niedrigem Rang annähern.",
            "Senke k: Das Netz nutzt nur den größten Singularwert (vereinfacht).",
        ),
        "ALG-NOR-001": (
            "Eine Matrixnorm misst, wie stark A einen Vektor strecken kann.",
            "Ändere A: Große σ bedeuten starke Streckung in einer Richtung.",
        ),
        "ALG-NOR-002": (
            "Frobenius misst die „Größe“ von A durch Summieren aller Einträge im Quadrat.",
            "Bearbeite A und verknüpfe große Einträge mit einer größeren Norm.",
        ),
        "ALG-NOR-003": (
            "Die 1-Norm hängt mit Spaltensummen zusammen.",
            "Mache eine Spalte viel größer: Diese Norm wächst mit ihr.",
        ),
        "ALG-NOR-004": (
            "Die Unendlich-Norm hängt mit Zeilensummen zusammen.",
            "Mache eine Zeile dominant und beobachte die Wirkung auf die Größe von A.",
        ),
        "ALG-NOR-005": (
            "Die Spektralnorm ist die größte Streckung (σ₁).",
            "Sieh die Singularwert-Ellipse: Die lange Achse ist diese Streckung.",
        ),
        "ALG-NOR-006": (
            "‖AB‖ ≤ ‖A‖‖B‖: Die Größe des Produkts übersteigt nicht das Produkt der Größen.",
            "Vergleiche visuell, wie stark A streckt gegenüber verketteten Abbildungen.",
        ),
        "ALG-NOR-007": (
            "Die Konditionszahl sagt, wie empfindlich ein System gegenüber Fehlern ist.",
            "Mache σ₁ ≫ σ₂ (kleines k): Das Netz flacht ab und das Problem ist schlecht konditioniert.",
        ),
        "ALG-BOO-001": (
            "Du kannst eine logische Identität Zeile für Zeile in der Wahrheitstabelle prüfen.",
            "Schalte Ausgaben um: Orange Zeilen stimmen nicht mit dem Erwarteten überein.",
        ),
        "ALG-BOO-002": (
            "Manche booleschen Operationen vereinfachen sich (Idempotenz, Komplement).",
            "Schalte A und B um und vergleiche die Tabelle mit dem Live-Ergebnis.",
        ),
        "ALG-BOO-003": (
            "Distributivität gibt es auch in der Logik, nicht nur bei Zahlen.",
            "Prüfe die Tabelle: AND/OR verteilt sich wie die Fläche a(b+c).",
        ),
        "ALG-BOO-004": (
            "De Morgan: Ein AND zu negieren ist ein OR von Negationen (und umgekehrt).",
            "Ändere A und B: Beide Seiten jedes Gesetzes stimmen immer überein.",
        ),
        "ALG-BOO-005": (
            "XOR ist wahr, wenn A und B verschieden sind.",
            "Probiere alle vier Paare: Nur 01 und 10 ergeben 1.",
        ),
        "ALG-BOO-006": (
            "Absorption entfernt überflüssige Terme in booleschen Ausdrücken.",
            "Vergleiche Tabellenzeilen, um zu sehen, welche Einträge unnötig sind.",
        ),
        "ALG-BOO-007": (
            "Summe von Produkten schreibt die Funktion als ORs von ANDs.",
            "Markiere Zeilen mit Ausgabe 1: Das sind deine Produkte.",
        ),
        "ALG-BOO-008": (
            "Produkt von Summen ist die duale Form: ANDs von ORs.",
            "Nutze die Tabelle, um zu sehen, welche Klauseln die Nullen der Funktion abdecken.",
        ),
        "ALG-BOO-009": (
            "Zwei Ausdrücke sind äquivalent, wenn ihre Wahrheitstabellen übereinstimmen.",
            "Bearbeite Ausgaben: Zeigt alles ✓, stimmen die Tabellen überein.",
        ),
        "ALG-MOD-001": (
            "a und b sind kongruent modulo m, wenn sie auf denselben Uhrzeiger fallen.",
            "Bewege a und b: Der Text sagt, ob a ≡ b (mod m), wenn sie dieselbe Marke teilen.",
        ),
        "ALG-MOD-002": (
            "Addieren und Multiplizieren modulo m heißt rechnen und auf 0…m−1 zurückwickeln.",
            "Ändere a, b und m: Marken zeigen a+b und a·b auf dem Kreis.",
        ),
        "ALG-MOD-003": (
            "Das Inverse von a modulo m existiert nur, wenn gcd(a, m) = 1.",
            "Probiere mehrere a: Fehlt das Inverse, sagt der Text es.",
        ),
        "ALG-MOD-005": (
            "Der chinesische Restsatz verbindet zwei Uhren (m und m₂) zu einer Lösung x.",
            "Stelle a, b, m und m₂ ein: Wenn es existiert, erscheint das x, das beide Reste erfüllt.",
        ),
        "ALG-MOD-006": (
            "Fermat: Ist p prim und teilt a nicht, dann a^(p−1) ≡ 1 (mod p).",
            "Mit primem m prüfe a^(p−1) in der Beschriftung; es sollte 1 sein, wenn gcd(a,p)=1.",
        ),
        "ALG-EST-006": (
            "In einem Primkörper wickeln sich Addition und Multiplikation modulo p.",
            "Wähle p und öffne die +/·-Tabellen; tippe eine Zelle für Ergebnis und Inverses.",
        ),
        "ALG-COD-001": (
            "Ein linearer Code ist ein Unterraum: Codewörter zu addieren ergibt wieder ein Codewort.",
            "Lies die Codewortliste: Ihre Summe bleibt in der Menge.",
        ),
        "ALG-COD-002": (
            "Die Generatormatrix G baut Codewörter aus Nachrichten.",
            "Bearbeite Bits/Einträge und denke jede Zeile von G als Basismuster des Codes.",
        ),
        "ALG-COD-003": (
            "H prüft Parität: Gültige Wörter erfüllen H c = 0.",
            "Kippe ein Bit und verknüpfe den Fehler mit einem nichtnullen Syndrom (siehe COD-004).",
        ),
        "ALG-COD-004": (
            "Das Syndrom zeigt (bei einfachen Codes) auf das fehlerhafte Bit.",
            "Wähle die Fehlerposition: Das Syndrom s aktualisiert sich sofort.",
        ),
        "ALG-COD-005": (
            "Der Hamming-Abstand zählt Positionen, in denen sich zwei Wörter unterscheiden.",
            "Bearbeite die beiden Ketten: Unterschiedliche Bits werden hervorgehoben und d_H aktualisiert sich.",
        ),
        "ALG-COD-006": (
            "Mit Minimalabstand d kannst du eine begrenzte Zahl von Fehlern erkennen/korrigieren.",
            "Bewege d_min: Der Korrekturradius t = ⌊(d−1)/2⌋ ändert sich mit ihm.",
        ),
        "ALG-COD-007": (
            "Die Rate k/n misst nützliche Information gegenüber der Gesamtlänge.",
            "Stelle n und k ein: Der Balken zeigt Nachrichtenanteil gegenüber Redundanz.",
        ),
    },
    "fr": {
        "ALG-FND-001": (
            "L’ordre des termes ne change pas le résultat.",
            "Appuie sur Échanger : les blocs changent de place, mais la barre totale reste égale.",
        ),
        "ALG-FND-002": (
            "Même si tu regroupes les nombres autrement, la somme (ou le produit) ne change pas.",
            "Appuie sur Grouper gauche/droite. Seule la boîte bouge ; le total a+b+c reste le même.",
        ),
        "ALG-FND-003": (
            "Multiplier une somme, c’est comme additionner les aires de deux rectangles.",
            "Bouge a, b et c : le grand rectangle a(b+c) se partage en ab et ac avec la même aire totale.",
        ),
        "ALG-FND-006": (
            "La valeur absolue est la distance à zéro : elle n’est jamais négative.",
            "Bouge x à gauche ou à droite : la marque montre combien il s’éloigne de l’origine.",
        ),
        "ALG-FND-007": (
            "La distance entre deux points est la longueur du segment qui les joint.",
            "Bouge a et b : la distance |a−b| se voit comme la longueur entre les deux points.",
        ),
        "ALG-POT-001": (
            "En multipliant des puissances de même base, les exposants s’additionnent.",
            "Change n et m : les blocs a^n et a^m se rejoignent en a^(n+m).",
        ),
        "ALG-POT-008": (
            "Le conjugué aide à enlever une racine du dénominateur.",
            "Compare a+√b avec a−√b : leur produit enlève la racine au milieu.",
        ),
        "ALG-EXP-003": (
            "Tu verras pourquoi (ax+b)(cx+d)=acx^2+(ad+bc)x+bd et comment adx et bcx s'additionnent.",
            "Chaque terme du premier polynôme est multiplié par chaque terme du second ; ensuite on regroupe les mêmes puissances de x.",
        ),
        "ALG-IDN-001": (
            "(a+b)² se voit comme un carré coupé en quatre pièces.",
            "Change a et b : le grand carré est a² + 2ab + b².",
        ),
        "ALG-IDN-002": (
            "(a−b)² est aussi une aire, avec une correction dans le coin.",
            "Ajuste a et b et observe comment apparaissent a², −2ab et +b².",
        ),
        "ALG-IDN-003": (
            "a²−b² est l’aire qui reste en enlevant un petit carré d’un grand.",
            "Bascule de a²−b² au rectangle (a−b)(a+b) : c’est la même quantité.",
        ),
        "ALG-IDN-008": (
            "Les coefficients du binôme sont une ligne de Pascal.",
            "Change n : tu vois les nombres de Pascal et comment (a+b)^n se construit.",
        ),
        "ALG-FAC-001": (
            "Mettre en facteur commun, c’est regrouper des aires qui partagent un côté.",
            "Bouge a, b et c : le rectangle a(b+c) correspond à ab+ac.",
        ),
        "ALG-FAC-002": (
            "Factoriser a²−b² reconstruit l’aire restante comme un rectangle.",
            "Alterne entre a²−b² et (a−b)(a+b) pour voir qu’ils représentent la même chose.",
        ),
        "ALG-FAC-003": (
            "Un trinôme carré parfait s’assemble comme un carré complet.",
            "Ajuste a et b jusqu’à voir le motif (a±b)² dans les pièces.",
        ),
        "ALG-EQU-001": (
            "Une équation linéaire est une droite : la solution est où elle coupe l’axe x.",
            "Bouge la pente et l’ordonnée à l’origine ; cherche où la droite croise l’axe horizontal.",
        ),
        "ALG-EQU-003": (
            "La parabole coupe l’axe x aux solutions (s’il y en a).",
            "Change a, b et c : regarde le discriminant Δ et les marques orange des racines.",
        ),
        "ALG-EQU-004": (
            "Le discriminant dit combien de racines réelles a la quadratique.",
            "Ajuste a, b et c et vois s’il y a 2, 1 ou aucune racine réelle selon Δ.",
        ),
        "ALG-EQU-005": (
            "Compléter le carré, c’est ajouter (puis retrancher) le coin manquant.",
            "Appuie sur Ajouter/Retrancher (b/2)² : tu vois d’où vient le terme b²/4.",
        ),
        "ALG-EQU-008": (
            "Une équation avec valeur absolue a souvent deux solutions symétriques.",
            "Bouge le point sur la droite et relie les distances aux solutions.",
        ),
        "ALG-INE-001": (
            "Une inéquation linéaire peint un rayon ou un intervalle sur la droite.",
            "Change la borne et le type d’inégalité : la zone ombrée est la solution.",
        ),
        "ALG-INE-002": (
            "La solution d’une inéquation quadratique est où la parabole est au-dessus (ou en dessous) de l’axe.",
            "Ajuste la parabole : la zone ombrée marque les x qui conviennent.",
        ),
        "ALG-INE-003": (
            "Pour les inéquations rationnelles, attention aux points où le dénominateur s’annule.",
            "Bouge la borne et vois quelle partie de la droite est autorisée.",
        ),
        "ALG-INE-004": (
            "La valeur absolue dans les inégalités définit des intervalles centrés ou extérieurs.",
            "Change le rayon et les extrémités ouvertes/fermées pour voir l’intervalle solution.",
        ),
        "ALG-SIS-001": (
            "Un système 2×2, ce sont deux droites : la solution est leur croisement (si elles se coupent).",
            "Bouge la pente : le point orange marque l’intersection, ou tu vois si elles sont parallèles.",
        ),
        "ALG-SIS-002": (
            "Le système peut s’écrire comme une seule équation matricielle Ax = b.",
            "Modifie A et vois comment l’information du système s’organise.",
        ),
        "ALG-SIS-003": (
            "Chaque ligne de la matrice augmentée est une équation du système.",
            "Choisis R₁ ou R₂ : l’équation de cette ligne apparaît en dessous.",
        ),
        "ALG-SIS-004": (
            "Les opérations sur les lignes changent la matrice, mais le système reste équivalent.",
            "Essaie d’échanger, de mettre à l’échelle ou d’ajouter des lignes et regarde comment A change.",
        ),
        "ALG-SIS-005": (
            "Comparer les rangs te dit s’il y a une, une infinité, ou aucune solution.",
            "Rends A singulière ou non et regarde l’indicateur rang / ∅ / ∞.",
        ),
        "ALG-FUN-001": (
            "Le domaine, ce sont les x où la fonction a un sens (ici x ≠ 0).",
            "Regarde 1/x : près de zéro la courbe s’envole ; ce trou est le domaine cassé.",
        ),
        "ALG-FUN-002": (
            "Composer des fonctions, c’est en appliquer une après l’autre.",
            "Bouge x₀ et les paramètres : la valeur affichée est f(g(x)).",
        ),
        "ALG-FUN-003": (
            "L’inverse « défait » la fonction : les graphes sont symétriques par rapport à y = x.",
            "Compare la courbe et son inverse ; la diagonale pointillée est le miroir y = x.",
        ),
        "ALG-FUN-005": (
            "Une droite est fixée par sa pente et son ordonnée à l’origine.",
            "Bouge m et b : la droite s’incline et se décale aussitôt.",
        ),
        "ALG-FUN-006": (
            "Les droites parallèles ont la même pente ; les perpendiculaires ont des pentes inverses changées de signe.",
            "Ajuste les deux droites et vois quand elles ne se coupent jamais ou se croisent à angle droit.",
        ),
        "ALG-FUN-007": (
            "Une translation déplace un graphe sans le déformer.",
            "Bouge h et k : la courbe se décale horizontalement et verticalement.",
        ),
        "ALG-FUN-008": (
            "Mettre à l’échelle et réfléchir étirent, compriment ou retournent la courbe.",
            "Change a et la réflexion : regarde comment l’onde se déforme.",
        ),
        "ALG-POL-007": (
            "Un polynôme à deux variables assigne une valeur à chaque point (x, y).",
            "Bouge a, b et c : la carte de couleurs montre z = ax² + bxy + cy².",
        ),
        "ALG-POL-008": (
            "Le degré total additionne les exposants de chaque variable.",
            "Change α et β : le rectangle illustre le degré α+β de x^α y^β.",
        ),
        "ALG-POL-009": (
            "Pour un polynôme homogène, mettre (x, y) à l’échelle met le résultat à l’échelle de façon prévisible.",
            "Active la forme homogène et bouge t : compare P(tx, ty) avec t^d P(x, y).",
        ),
        "ALG-POL-010": (
            "Un système polynomial ressemble à des courbes qui se coupent aux solutions.",
            "Ajuste les paramètres et cherche les croisements entre les deux courbes.",
        ),
        "ALG-POL-011": (
            "La résultante rassemble les conditions de racine commune dans une matrice.",
            "Modifie la matrice et observe le déterminant comme signal de racines partagées.",
        ),
        "ALG-LOG-001": (
            "Une exponentielle croît (ou décroît) en multipliant encore et encore.",
            "Change la base : la courbe devient plus raide ou plus douce.",
        ),
        "ALG-LOG-002": (
            "Le logarithme répond : « à quelle puissance dois-je élever la base pour obtenir x ? ».",
            "Compare log et exponentielle : ce sont des inverses ; y = x les reflète.",
        ),
        "ALG-LOG-007": (
            "Le signe du taux décide de la croissance ou de la décroissance.",
            "Bouge k (via b) et vois si la courbe monte ou descend avec le temps.",
        ),
        "ALG-COM-001": (
            "Un complexe a+bi est un point (ou une flèche) dans le plan.",
            "Tire la pointe : les coordonnées sont les parties réelle et imaginaire.",
        ),
        "ALG-COM-002": (
            "Le conjugué reflète le nombre par rapport à l’axe réel.",
            "Tire z : la flèche orange est le conjugué (même x, y inversé).",
        ),
        "ALG-COM-003": (
            "Le module est la longueur de la flèche depuis l’origine.",
            "Étire ou raccourcis le vecteur : r est cette longueur.",
        ),
        "ALG-COM-004": (
            "En forme polaire, tu utilises longueur et angle au lieu de (x, y).",
            "Tourne θ : le point se déplace sur le cercle de rayon r.",
        ),
        "ALG-COM-005": (
            "Euler relie l’angle au cosinus et au sinus sur le cercle unité.",
            "Bouge θ : le point (cos θ, sin θ) parcourt le cercle.",
        ),
        "ALG-COM-006": (
            "Élever à n multiplie l’angle par n et met le rayon à la puissance.",
            "Change n et θ : tu vois z, z², z³… tourner et s’éloigner selon rⁿ.",
        ),
        "ALG-COM-007": (
            "Les racines n-ièmes se placent comme les sommets d’un polygone régulier.",
            "Change n : les points orange se répartissent sur le cercle.",
        ),
        "ALG-SEC-001": (
            "Dans une suite arithmétique, chaque pas ajoute la même quantité.",
            "Bouge a₁ et d : les points montent ou descendent par pas constants.",
        ),
        "ALG-SEC-003": (
            "Dans une suite géométrique, chaque terme est multiplié par r.",
            "Change a et r : les points croissent ou s’approchent de zéro selon |r|.",
        ),
        "ALG-SEC-005": (
            "Si |r|<1, la série géométrique infinie s’approche d’une limite.",
            "Essaie |r|<1 et |r|≥1 : vois si les points se stabilisent ou s’envolent.",
        ),
        "ALG-SEC-007": (
            "Une récurrence construit chaque terme à partir des précédents.",
            "Change les coefficients et observe comment la suite évolue point par point.",
        ),
        "ALG-VEC-001": (
            "Un vecteur est une flèche : direction et longueur.",
            "Tire les pointes pour changer le vecteur dans le plan.",
        ),
        "ALG-VEC-002": (
            "La norme est la longueur de la flèche.",
            "Étire u : ‖u‖ se met à jour avec la longueur.",
        ),
        "ALG-VEC-003": (
            "Un vecteur unitaire a longueur 1 et garde la direction.",
            "Bouge u : tu vois la version normalisée û de longueur 1.",
        ),
        "ALG-VEC-004": (
            "Le produit scalaire mesure l’alignement : positif = angle aigu.",
            "Tire u et v : regarde u·v et aigu/droit/obtus ; la projection est orange.",
        ),
        "ALG-VEC-005": (
            "L’angle entre vecteurs se lit depuis le produit scalaire.",
            "Bouge les flèches : l’angle et son type se mettent à jour.",
        ),
        "ALG-VEC-006": (
            "La distance entre les pointes des vecteurs est la norme de la différence.",
            "Écarte u et v : la distance croît avec l’écart.",
        ),
        "ALG-VEC-007": (
            "Une combinaison linéaire mélange des vecteurs avec des poids.",
            "Tire u et v : la flèche orange est 0.7u + 0.5v.",
        ),
        "ALG-MAT-001": (
            "Une matrice est un tableau de nombres en lignes et colonnes.",
            "Modifie les entrées de A : chaque cellule est un coefficient de l’objet linéaire.",
        ),
        "ALG-MAT-002": (
            "L’addition de matrices se fait case par case.",
            "Change A et B : A+B se met à jour entrée par entrée.",
        ),
        "ALG-MAT-003": (
            "Multiplier par un scalaire étire ou inverse tous les nombres de la matrice.",
            "Bouge c : vois cA grandir, rétrécir ou changer de signe.",
        ),
        "ALG-MAT-004": (
            "Chaque entrée de AB mélange une ligne de A avec une colonne de B.",
            "Choisis une case (i,j) : dessous tu vois le calcul ligne×colonne.",
        ),
        "ALG-MAT-005": (
            "L’identité laisse les vecteurs inchangés : c’est le « 1 » des matrices.",
            "Compare A avec l’effet de l’identité sur la base.",
        ),
        "ALG-MAT-006": (
            "La transposée échange lignes et colonnes.",
            "Modifie A : à droite tu vois Aᵀ avec lignes et colonnes inversées.",
        ),
        "ALG-MAT-007": (
            "Une matrice symétrique coïncide avec sa transposée.",
            "Ajuste A jusqu’à ce qu’elle coïncide avec Aᵀ.",
        ),
        "ALG-DET-001": (
            "Le déterminant 2×2 est l’aire signée du parallélogramme des colonnes.",
            "Bouge les vecteurs : l’aire colorée est |det| ; le signe indique l’orientation.",
        ),
        "ALG-DET-002": (
            "Un déterminant peut se développer selon une ligne ou une colonne (cofacteurs).",
            "Modifie A et observe comment det(A) réagit.",
        ),
        "ALG-DET-003": (
            "det(AB) = det(A)det(B) : les aires se multiplient.",
            "Change A et B et compare l’aire du produit avec le produit des aires.",
        ),
        "ALG-DET-004": (
            "Si l’aire (det) est nulle, les colonnes sont parallèles et il n’y a pas d’inverse.",
            "Aplatis le parallélogramme (aire ≈ 0) : la matrice devient singulière.",
        ),
        "ALG-DET-005": (
            "L’inverse « défait » A ; elle existe seulement si det ≠ 0.",
            "Modifie A et regarde det : s’il n’est pas nul, l’inverse est définie.",
        ),
        "ALG-DET-006": (
            "Cramer utilise les déterminants pour résoudre de petits systèmes.",
            "Change A et b : relie det(A) à la possibilité d’une solution unique.",
        ),
        "ALG-ESP-001": (
            "L’espace engendré, ce sont tous les mélanges s·u + t·v.",
            "Bouge s et t : la flèche orange balaie le plan (ou la droite) engendré par u et v.",
        ),
        "ALG-ESP-002": (
            "Si l’aire du parallélogramme est nulle, les vecteurs sont dépendants.",
            "Aligne u et v : l’indicateur passe à « dépendants ».",
        ),
        "ALG-ESP-003": (
            "Une base est un ensemble indépendant qui engendre tout l’espace.",
            "Active « montrer la base » et compare avec tes vecteurs u et v.",
        ),
        "ALG-ESP-004": (
            "Les coordonnées disent combien de chaque vecteur de base tu as besoin.",
            "Change s et t : ce sont les coordonnées de la combinaison dans la base u, v.",
        ),
        "ALG-ESP-005": (
            "Le rang est le nombre de directions indépendantes de la matrice.",
            "Modifie A : utilise det/rang pour voir s’il y a 0, 1 ou 2 directions.",
        ),
        "ALG-ESP-006": (
            "La nullité compte les solutions non triviales de Ax = 0.",
            "Rends les colonnes dépendantes et relie cela aux directions envoyées à l’origine.",
        ),
        "ALG-ESP-007": (
            "Rang + nullité = nombre de colonnes (dans le cas n).",
            "Explore vecteurs dépendants/indépendants et comment se partage la dimension.",
        ),
        "ALG-TRA-001": (
            "Une transformation linéaire respecte sommes et mises à l’échelle.",
            "Regarde la grille déformée par A : les droites restent droites.",
        ),
        "ALG-TRA-002": (
            "Appliquer A pousse chaque point (et la grille) vers une nouvelle forme.",
            "Change les entrées de A : le maillage montre la poussée linéaire.",
        ),
        "ALG-TRA-003": (
            "Le noyau, ce sont les vecteurs que A envoie à l’origine.",
            "Cherche les directions qui s’écrasent quand det s’approche de zéro.",
        ),
        "ALG-TRA-004": (
            "L’image, ce sont les directions que A peut atteindre.",
            "Observe où pointent les flèches de base transformées e₁ et e₂.",
        ),
        "ALG-TRA-005": (
            "Composer des transformations, c’est en appliquer une après l’autre (produit de matrices).",
            "Change A et pense-y comme une étape d’une composition.",
        ),
        "ALG-TRA-006": (
            "L’inverse défait la poussée de A.",
            "Appuie sur Appliquer A⁻¹ (si elle existe) : le maillage revient vers la forme d’origine.",
        ),
        "ALG-TRA-007": (
            "Changer de base, c’est décrire les mêmes vecteurs avec d’autres coordonnées.",
            "Modifie A comme matrice de changement et regarde le maillage se réorienter.",
        ),
        "ALG-EIG-001": (
            "Un vecteur propre ne fait que s’étirer ou se compresser ; il ne tourne pas de côté.",
            "Active les vecteurs propres : les tirets orange marquent ces directions spéciales.",
        ),
        "ALG-EIG-002": (
            "L’équation caractéristique trouve les valeurs propres (facteurs d’étirement).",
            "Modifie A et relie det(A−λI)=0 aux directions que tu vois sur la grille.",
        ),
        "ALG-EIG-003": (
            "L’espace propre est la droite (ou le plan) de tous les vecteurs propres d’un λ.",
            "Observe la direction orange liée à chaque valeur propre.",
        ),
        "ALG-EIG-004": (
            "Diagonaliser, c’est écrire A dans une base propre où elle ne fait que dilater.",
            "Avec les vecteurs propres visibles, imagine des axes où A ne fait qu’étirer.",
        ),
        "ALG-EIG-005": (
            "Avec A = PDP⁻¹, élever A à une puissance, c’est élever les échelles de la diagonale.",
            "Explore A et ses directions propres comme raccourci pour Aⁿ.",
        ),
        "ALG-EIG-006": (
            "Pour les matrices symétriques, les vecteurs propres peuvent être choisis orthogonaux.",
            "Essaie une A presque symétrique et regarde des vecteurs propres presque perpendiculaires.",
        ),
        "ALG-ORT-001": (
            "Orthogonal signifie angle droit : le produit scalaire est zéro.",
            "Place u ⊥ v : u·v ≈ 0 et l’angle s’affiche comme droit.",
        ),
        "ALG-ORT-002": (
            "La projection est l’ombre de u sur la direction de v.",
            "Tire u : le segment orange est la projection ; le reste est l’erreur orthogonale.",
        ),
        "ALG-ORT-003": (
            "Une matrice orthogonale tourne/réfléchit sans changer les longueurs.",
            "Pousse A vers une rotation et vois que le maillage garde des longueurs régulières.",
        ),
        "ALG-ORT-004": (
            "Gram–Schmidt transforme des vecteurs en une base orthogonale étape par étape.",
            "Avance l’étape Gram–Schmidt et observe la nouvelle direction orthogonale.",
        ),
        "ALG-LSQ-001": (
            "Les moindres carrés cherchent le point du sous-espace le plus proche des données.",
            "Bouge les vecteurs et le point : la projection est la meilleure approximation.",
        ),
        "ALG-LSQ-002": (
            "Les équations normales AᵀAx = Aᵀb résument ce problème de projection.",
            "Modifie A et b comme données d’un ajustement linéaire par moindres carrés.",
        ),
        "ALG-LSQ-003": (
            "La pseudo-inverse généralise l’inverse quand A n’est pas invertible.",
            "Explore une A rectangulaire/singulière et pense à la « meilleure » solution approchée.",
        ),
        "ALG-DEC-001": (
            "LU découpe A en facteurs triangulaires inférieur et supérieur pour résoudre plus facilement.",
            "Applique des opérations de ligne : tu t’approches de la forme utilisée par LU.",
        ),
        "ALG-DEC-002": (
            "QR écrit A comme une partie orthogonale/rotationnelle fois une partie triangulaire.",
            "Vois le maillage de A comme cette composition orthogonale puis triangulaire.",
        ),
        "ALG-DEC-003": (
            "La décomposition spectrale utilise valeurs propres et vecteurs propres.",
            "Active les vecteurs propres : ce sont les axes de cette décomposition.",
        ),
        "ALG-DEC-004": (
            "La SVD découpe A en tourner → dilater → tourner.",
            "Appuie sur l’étape SVD : 1) orienter, 2) dilater avec σ, 3) reconstruire avec A.",
        ),
        "ALG-DEC-005": (
            "Garder les grands σ approxime A avec un rang faible.",
            "Baisse k : le maillage n’utilise que la plus grande valeur singulière (simplifié).",
        ),
        "ALG-NOR-001": (
            "Une norme matricielle mesure combien A peut étirer un vecteur.",
            "Change A : de grands σ indiquent un fort étirement dans une direction.",
        ),
        "ALG-NOR-002": (
            "Frobenius mesure la « taille » de A en sommant les carrés de toutes les entrées.",
            "Modifie A et relie de grandes entrées à une norme plus grande.",
        ),
        "ALG-NOR-003": (
            "La norme 1 est liée aux sommes de colonnes.",
            "Rends une colonne bien plus grande : cette norme croît avec elle.",
        ),
        "ALG-NOR-004": (
            "La norme infinie est liée aux sommes de lignes.",
            "Rends une ligne dominante et observe l’effet sur la taille de A.",
        ),
        "ALG-NOR-005": (
            "La norme spectrale est le plus grand étirement (σ₁).",
            "Regarde l’ellipse des valeurs singulières : le grand axe est cet étirement.",
        ),
        "ALG-NOR-006": (
            "‖AB‖ ≤ ‖A‖‖B‖ : la taille du produit ne dépasse pas le produit des tailles.",
            "Compare visuellement combien A étire face à des applications enchaînées.",
        ),
        "ALG-NOR-007": (
            "Le nombre de condition dit si un système est sensible aux erreurs.",
            "Fais σ₁ ≫ σ₂ (k bas) : le maillage s’aplatit et le problème est mal conditionné.",
        ),
        "ALG-BOO-001": (
            "Tu peux vérifier une identité logique ligne par ligne dans la table de vérité.",
            "Bascule les sorties : les lignes orange ne correspondent pas à l’attendu.",
        ),
        "ALG-BOO-002": (
            "Certaines opérations booléennes se simplifient (idempotence, complément).",
            "Alterne A et B et compare la table avec le résultat en direct.",
        ),
        "ALG-BOO-003": (
            "La distributivité existe aussi en logique, pas seulement pour les nombres.",
            "Vérifie la table : AND/OR se répartit comme l’aire a(b+c).",
        ),
        "ALG-BOO-004": (
            "De Morgan : nier un AND, c’est un OR de négations (et inversement).",
            "Change A et B : les deux côtés de chaque loi donnent toujours le même résultat.",
        ),
        "ALG-BOO-005": (
            "XOR est vrai quand A et B sont différents.",
            "Essaie les quatre paires : seuls 01 et 10 donnent 1.",
        ),
        "ALG-BOO-006": (
            "L’absorption enlève les termes redondants dans les expressions booléennes.",
            "Compare les lignes de la table pour voir quelles entrées sont inutiles.",
        ),
        "ALG-BOO-007": (
            "La somme de produits écrit la fonction comme des OR de AND.",
            "Marque les lignes où la sortie est 1 : ce sont tes produits.",
        ),
        "ALG-BOO-008": (
            "Le produit de sommes est la forme duale : des AND de OR.",
            "Utilise la table pour voir quelles clauses couvrent les zéros de la fonction.",
        ),
        "ALG-BOO-009": (
            "Deux expressions sont équivalentes si leurs tables de vérité coïncident.",
            "Modifie les sorties : si tout affiche ✓, les tables concordent.",
        ),
        "ALG-MOD-001": (
            "a et b sont congruents modulo m s’ils tombent sur le même cran de l’horloge.",
            "Bouge a et b : le texte dit si a ≡ b (mod m) quand ils partagent une marque.",
        ),
        "ALG-MOD-002": (
            "Ajouter et multiplier modulo m, c’est calculer puis revenir à 0…m−1.",
            "Change a, b et m : les marques montrent a+b et a·b sur le cercle.",
        ),
        "ALG-MOD-003": (
            "L’inverse de a modulo m existe seulement si gcd(a, m) = 1.",
            "Essaie plusieurs a : s’il n’y a pas d’inverse, le texte l’indique.",
        ),
        "ALG-MOD-005": (
            "Le théorème chinois combine deux horloges (m et m₂) en une solution x.",
            "Ajuste a, b, m et m₂ : quand elle existe, apparaît le x qui satisfait les deux restes.",
        ),
        "ALG-MOD-006": (
            "Fermat : si p est premier et ne divise pas a, alors a^(p−1) ≡ 1 (mod p).",
            "Avec m premier, regarde a^(p−1) dans la légende ; ce devrait être 1 si gcd(a,p)=1.",
        ),
        "ALG-EST-006": (
            "Dans un corps premier, addition et multiplication s’enroulent modulo p.",
            "Choisis p et ouvre les tables + / · ; appuie sur une cellule pour le résultat et l’inverse.",
        ),
        "ALG-COD-001": (
            "Un code linéaire est un sous-espace : additionner des mots de code donne un autre mot de code.",
            "Lis la liste des mots de code : leur somme reste dans l’ensemble.",
        ),
        "ALG-COD-002": (
            "La matrice génératrice G fabrique des mots de code à partir des messages.",
            "Modifie bits/entrées et pense chaque ligne de G comme un motif de base du code.",
        ),
        "ALG-COD-003": (
            "H vérifie la parité : les mots valides satisfont H c = 0.",
            "Inverse un bit et relie l’échec à un syndrome non nul (voir COD-004).",
        ),
        "ALG-COD-004": (
            "Le syndrome indique (dans les codes simples) où se trouve le bit erroné.",
            "Choisis la position de l’erreur : le syndrome s se met à jour aussitôt.",
        ),
        "ALG-COD-005": (
            "La distance de Hamming compte les positions où deux mots diffèrent.",
            "Modifie les deux chaînes : les bits différents sont mis en évidence et d_H se met à jour.",
        ),
        "ALG-COD-006": (
            "Avec une distance minimale d, tu peux détecter/corriger un nombre limité d’erreurs.",
            "Bouge d_min : le rayon de correction t = ⌊(d−1)/2⌋ change avec lui.",
        ),
        "ALG-COD-007": (
            "Le taux k/n mesure l’information utile face à la longueur totale.",
            "Ajuste n et k : la barre montre la part de message face à la redondance.",
        ),
    },
    "it": {
        "ALG-FND-001": (
            "L’ordine degli addendi non cambia il risultato.",
            "Tocca Scambia: i blocchi cambiano posto, ma la barra totale resta uguale.",
        ),
        "ALG-FND-002": (
            "Anche se raggruppi i numeri in altro modo, la somma (o il prodotto) non cambia.",
            "Tocca Raggruppa sinistra/destra. Si muove solo il riquadro; il totale a+b+c resta uguale.",
        ),
        "ALG-FND-003": (
            "Moltiplicare una somma è come sommare le aree di due rettangoli.",
            "Muovi a, b e c: il rettangolo grande a(b+c) si spezza in ab e ac con la stessa area totale.",
        ),
        "ALG-FND-006": (
            "Il valore assoluto è la distanza dallo zero: non è mai negativo.",
            "Muovi x a sinistra o a destra: il segno mostra quanto si allontana dall’origine.",
        ),
        "ALG-FND-007": (
            "La distanza tra due punti è la lunghezza del segmento che li unisce.",
            "Muovi a e b: la distanza |a−b| è la lunghezza tra i due punti.",
        ),
        "ALG-POT-001": (
            "Moltiplicando potenze con la stessa base, gli esponenti si sommano.",
            "Cambia n e m: i blocchi a^n e a^m si uniscono in a^(n+m).",
        ),
        "ALG-POT-008": (
            "Il coniugato aiuta a togliere una radice dal denominatore.",
            "Confronta a+√b con a−√b: il loro prodotto elimina la radice in mezzo.",
        ),
        "ALG-EXP-003": (
            "Vedrai perché (ax+b)(cx+d)=acx^2+(ad+bc)x+bd e come adx e bcx si sommano.",
            "Ogni termine del primo polinomio si moltiplica per ogni termine del secondo; poi si raggruppano le stesse potenze di x.",
        ),
        "ALG-IDN-001": (
            "(a+b)² si vede come un quadrato tagliato in quattro pezzi.",
            "Cambia a e b: il quadrato grande è a² + 2ab + b².",
        ),
        "ALG-IDN-002": (
            "(a−b)² è anche un’area, con una correzione nell’angolo.",
            "Regola a e b e osserva come compaiono a², −2ab e +b².",
        ),
        "ALG-IDN-003": (
            "a²−b² è l’area che resta togliendo un quadrato piccolo da uno grande.",
            "Passa da a²−b² al rettangolo (a−b)(a+b): è la stessa quantità.",
        ),
        "ALG-IDN-008": (
            "I coefficienti binomiali sono una riga di Pascal.",
            "Cambia n: vedi i numeri di Pascal e come si costruisce (a+b)^n.",
        ),
        "ALG-FAC-001": (
            "Mettere in evidenza un fattore comune riordina aree che condividono un lato.",
            "Muovi a, b e c: il rettangolo a(b+c) corrisponde ad ab+ac.",
        ),
        "ALG-FAC-002": (
            "Fattorizzare a²−b² ricostruisce l’area restante come un rettangolo.",
            "Alterna tra a²−b² e (a−b)(a+b) per vedere che coincidono.",
        ),
        "ALG-FAC-003": (
            "Un trinomio quadrato perfetto si monta come un quadrato completo.",
            "Regola a e b finché vedi il motivo (a±b)² nei pezzi.",
        ),
        "ALG-EQU-001": (
            "Un’equazione lineare è una retta: la soluzione è dove incontra l’asse x.",
            "Muovi pendenza e intercetta; cerca dove la retta attraversa l’asse orizzontale.",
        ),
        "ALG-EQU-003": (
            "La parabola incontra l’asse x nelle soluzioni (se esistono).",
            "Cambia a, b e c: osserva il discriminante Δ e i segni arancioni delle radici.",
        ),
        "ALG-EQU-004": (
            "Il discriminante dice quante radici reali ha la quadratica.",
            "Regola a, b e c e vedi se ci sono 2, 1 o nessuna radice reale secondo Δ.",
        ),
        "ALG-EQU-005": (
            "Completare il quadrato significa aggiungere (e poi sottrarre) l’angolo mancante.",
            "Tocca Aggiungi/Sottrai (b/2)²: vedi da dove nasce il termine b²/4.",
        ),
        "ALG-EQU-008": (
            "Un’equazione con valore assoluto ha spesso due soluzioni simmetriche.",
            "Muovi il punto sulla retta e collega le distanze alle soluzioni.",
        ),
        "ALG-INE-001": (
            "Una disequazione lineare dipinge un raggio o un intervallo sulla retta.",
            "Cambia il bordo e il tipo di disuguaglianza: la zona ombreggiata è la soluzione.",
        ),
        "ALG-INE-002": (
            "La soluzione di una disequazione quadratica è dove la parabola sta sopra (o sotto) l’asse.",
            "Regola la parabola: la zona ombreggiata segna gli x che funzionano.",
        ),
        "ALG-INE-003": (
            "Nelle disequazioni razionali occhio ai punti in cui il denominatore si annulla.",
            "Muovi il bordo e vedi quale parte della retta è consentita.",
        ),
        "ALG-INE-004": (
            "Il valore assoluto nelle disuguaglianze definisce intervalli centrati o esterni.",
            "Cambia il raggio e gli estremi aperti/chiusi per vedere l’intervallo soluzione.",
        ),
        "ALG-SIS-001": (
            "Un sistema 2×2 sono due rette: la soluzione è il loro incrocio (se si incontrano).",
            "Muovi la pendenza: il punto arancione segna l’intersezione, o vedi se sono parallele.",
        ),
        "ALG-SIS-002": (
            "Il sistema si può scrivere come un’unica equazione matriciale Ax = b.",
            "Modifica A e vedi come si organizza l’informazione del sistema.",
        ),
        "ALG-SIS-003": (
            "Ogni riga della matrice aumentata è un’equazione del sistema.",
            "Scegli R₁ o R₂: sotto compare l’equazione di quella riga.",
        ),
        "ALG-SIS-004": (
            "Le operazioni di riga cambiano la matrice, ma il sistema resta equivalente.",
            "Prova a scambiare, scalare o sommare righe e guarda come cambia A.",
        ),
        "ALG-SIS-005": (
            "Confrontare i ranghi ti dice se c’è una, infinite o nessuna soluzione.",
            "Rendi A singolare o no e osserva l’indicatore rango / ∅ / ∞.",
        ),
        "ALG-FUN-001": (
            "Il dominio sono gli x dove la funzione ha senso (qui x ≠ 0).",
            "Guarda 1/x: vicino a zero la curva esplode; quel buco è il dominio rotto.",
        ),
        "ALG-FUN-002": (
            "Comporre funzioni significa applicarne una dopo l’altra.",
            "Muovi x₀ e i parametri: il valore mostrato è f(g(x)).",
        ),
        "ALG-FUN-003": (
            "L’inversa « disfa » la funzione: i grafici sono simmetrici rispetto a y = x.",
            "Confronta la curva e la sua inversa; la diagonale tratteggiata è lo specchio y = x.",
        ),
        "ALG-FUN-005": (
            "Una retta è fissata dalla pendenza e dall’intercetta sull’asse y.",
            "Muovi m e b: la retta si inclina e si sposta subito.",
        ),
        "ALG-FUN-006": (
            "Rette parallele hanno la stessa pendenza; perpendicolari hanno pendenze inverse cambiate di segno.",
            "Regola le due rette e vedi quando non si incontrano o si incrociano ad angolo retto.",
        ),
        "ALG-FUN-007": (
            "Una traslazione sposta un grafico senza deformarlo.",
            "Muovi h e k: la curva si sposta in orizzontale e in verticale.",
        ),
        "ALG-FUN-008": (
            "Scalare e riflettere stirano, comprimono o ribaltano la curva.",
            "Cambia a e la riflessione: osserva come si deforma l’onda.",
        ),
        "ALG-POL-007": (
            "Un polinomio in due variabili assegna un valore a ogni punto (x, y).",
            "Muovi a, b e c: la mappa di colore mostra z = ax² + bxy + cy².",
        ),
        "ALG-POL-008": (
            "Il grado totale somma gli esponenti di ogni variabile.",
            "Cambia α e β: il rettangolo illustra il grado α+β di x^α y^β.",
        ),
        "ALG-POL-009": (
            "In un polinomio omogeneo, scalare (x, y) scala il risultato in modo prevedibile.",
            "Attiva la forma omogenea e muovi t: confronta P(tx, ty) con t^d P(x, y).",
        ),
        "ALG-POL-010": (
            "Un sistema polinomiale si vede come curve che si incontrano nelle soluzioni.",
            "Regola i parametri e cerca gli incroci tra le due curve.",
        ),
        "ALG-POL-011": (
            "La risultante concentra le condizioni di radice comune in una matrice.",
            "Modifica la matrice e osserva il determinante come segnale di radici condivise.",
        ),
        "ALG-LOG-001": (
            "Un’esponenziale cresce (o decade) moltiplicando ripetutamente.",
            "Cambia la base: la curva diventa più ripida o più dolce.",
        ),
        "ALG-LOG-002": (
            "Il logaritmo risponde: « a quale esponente elevo la base per ottenere x? ».",
            "Confronta log ed esponenziale: sono inverse; y = x le rispecchia.",
        ),
        "ALG-LOG-007": (
            "Il segno del tasso decide crescita o decadimento.",
            "Muovi k (tramite b) e vedi se la curva sale o scende nel tempo.",
        ),
        "ALG-COM-001": (
            "Un complesso a+bi è un punto (o una freccia) nel piano.",
            "Trascina la punta: le coordinate sono parte reale e immaginaria.",
        ),
        "ALG-COM-002": (
            "Il coniugato riflette il numero rispetto all’asse reale.",
            "Trascina z: la freccia arancione è il coniugato (stessa x, y invertita).",
        ),
        "ALG-COM-003": (
            "Il modulo è la lunghezza della freccia dall’origine.",
            "Allunga o accorcia il vettore: r è quella lunghezza.",
        ),
        "ALG-COM-004": (
            "In forma polare usi lunghezza e angolo invece di (x, y).",
            "Ruota θ: il punto si muove sul cerchio di raggio r.",
        ),
        "ALG-COM-005": (
            "Euler collega l’angolo a coseno e seno sul cerchio unitario.",
            "Muovi θ: il punto (cos θ, sin θ) percorre la circonferenza.",
        ),
        "ALG-COM-006": (
            "Elevare a n moltiplica l’angolo per n e porta il raggio a potenza.",
            "Cambia n e θ: vedi z, z², z³… ruotare e allontanarsi secondo rⁿ.",
        ),
        "ALG-COM-007": (
            "Le radici n-esime stanno come i vertici di un poligono regolare.",
            "Cambia n: i punti arancioni si distribuiscono sul cerchio.",
        ),
        "ALG-SEC-001": (
            "In una successione aritmetica ogni passo aggiunge la stessa quantità.",
            "Muovi a₁ e d: i punti salgono o scendono a passi costanti.",
        ),
        "ALG-SEC-003": (
            "In una successione geometrica ogni termine si moltiplica per r.",
            "Cambia a e r: i punti crescono o si avvicinano a zero secondo |r|.",
        ),
        "ALG-SEC-005": (
            "Se |r|<1, la serie geometrica infinita si avvicina a un limite.",
            "Prova |r|<1 e |r|≥1: vedi se i punti si stabilizzano o esplodono.",
        ),
        "ALG-SEC-007": (
            "Una ricorrenza costruisce ogni termine a partire dai precedenti.",
            "Cambia i coefficienti e osserva come evolve la successione punto per punto.",
        ),
        "ALG-VEC-001": (
            "Un vettore è una freccia: direzione e lunghezza.",
            "Trascina le punte per cambiare il vettore nel piano.",
        ),
        "ALG-VEC-002": (
            "La norma è la lunghezza della freccia.",
            "Allunga u: ‖u‖ si aggiorna con la lunghezza.",
        ),
        "ALG-VEC-003": (
            "Un vettore unitario ha lunghezza 1 e mantiene la direzione.",
            "Muovi u: vedi la versione normalizzata û di lunghezza 1.",
        ),
        "ALG-VEC-004": (
            "Il prodotto scalare misura l’allineamento: positivo = angolo acuto.",
            "Trascina u e v: osserva u·v e acuto/retto/ottuso; la proiezione è arancione.",
        ),
        "ALG-VEC-005": (
            "L’angolo tra vettori si legge dal prodotto scalare.",
            "Muovi le frecce: l’angolo e il tipo si aggiornano subito.",
        ),
        "ALG-VEC-006": (
            "La distanza tra le punte dei vettori è la norma della differenza.",
            "Separa u e v: la distanza cresce con la separazione.",
        ),
        "ALG-VEC-007": (
            "Una combinazione lineare mescola vettori con pesi.",
            "Trascina u e v: la freccia arancione è 0.7u + 0.5v.",
        ),
        "ALG-MAT-001": (
            "Una matrice è una tabella di numeri in righe e colonne.",
            "Modifica le voci di A: ogni cella è un coefficiente dell’oggetto lineare.",
        ),
        "ALG-MAT-002": (
            "Sommare matrici si fa voce per voce.",
            "Cambia A e B: A+B si aggiorna cella per cella.",
        ),
        "ALG-MAT-003": (
            "Scalare una matrice stira o inverte ogni voce.",
            "Muovi c: vedi cA crescere, restringersi o cambiare segno.",
        ),
        "ALG-MAT-004": (
            "Ogni voce di AB mescola una riga di A con una colonna di B.",
            "Scegli una cella (i,j): sotto vedi il calcolo riga×colonna.",
        ),
        "ALG-MAT-005": (
            "L’identità lascia i vettori invariati: è l’« 1 » delle matrici.",
            "Confronta A con l’effetto dell’identità sulla base.",
        ),
        "ALG-MAT-006": (
            "La trasposta scambia righe e colonne.",
            "Modifica A: a destra vedi Aᵀ con righe e colonne invertite.",
        ),
        "ALG-MAT-007": (
            "Una matrice simmetrica coincide con la sua trasposta.",
            "Regola A finché coincide con Aᵀ.",
        ),
        "ALG-DET-001": (
            "Il determinante 2×2 è l’area con segno del parallelogramma delle colonne.",
            "Muovi i vettori: l’area colorata è |det|; il segno indica l’orientazione.",
        ),
        "ALG-DET-002": (
            "Un determinante si può sviluppare lungo una riga o una colonna (cofattori).",
            "Modifica A e osserva come reagisce det(A).",
        ),
        "ALG-DET-003": (
            "det(AB) = det(A)det(B): le aree si moltiplicano.",
            "Cambia A e B e confronta l’area del prodotto con il prodotto delle aree.",
        ),
        "ALG-DET-004": (
            "Se l’area (det) è zero, le colonne sono parallele e non c’è inversa.",
            "Appiattisci il parallelogramma (area ≈ 0): la matrice diventa singolare.",
        ),
        "ALG-DET-005": (
            "L’inversa « disfa » A; esiste solo se det ≠ 0.",
            "Modifica A e guarda det: se non è zero, l’inversa è definita.",
        ),
        "ALG-DET-006": (
            "Cramer usa i determinanti per risolvere sistemi piccoli.",
            "Cambia A e b: collega det(A) alla possibilità di soluzione unica.",
        ),
        "ALG-ESP-001": (
            "Lo spazio generato sono tutte le miscele s·u + t·v.",
            "Muovi s e t: la freccia arancione spazza il piano (o la retta) generato da u e v.",
        ),
        "ALG-ESP-002": (
            "Se l’area del parallelogramma è zero, i vettori sono dipendenti.",
            "Allinea u e v: l’indicatore passa a « dipendenti ».",
        ),
        "ALG-ESP-003": (
            "Una base è un insieme indipendente che genera tutto lo spazio.",
            "Attiva « mostra base » e confronta con i tuoi vettori u e v.",
        ),
        "ALG-ESP-004": (
            "Le coordinate dicono quanto serve di ciascun vettore della base.",
            "Cambia s e t: sono le coordinate della combinazione nella base u, v.",
        ),
        "ALG-ESP-005": (
            "Il rango è quante direzioni indipendenti ha la matrice.",
            "Modifica A: usa det/rango per vedere se ci sono 0, 1 o 2 direzioni.",
        ),
        "ALG-ESP-006": (
            "La nullità conta le soluzioni non banali di Ax = 0.",
            "Rendi le colonne dipendenti e collega ciò alle direzioni mandate all’origine.",
        ),
        "ALG-ESP-007": (
            "Rango + nullità = numero di colonne (nel caso n).",
            "Esplora vettori dipendenti/indipendenti e come si riparte la dimensione.",
        ),
        "ALG-TRA-001": (
            "Una trasformazione lineare rispetta somme e scalature.",
            "Guarda la griglia deformata da A: le rette restano rette.",
        ),
        "ALG-TRA-002": (
            "Applicare A spinge ogni punto (e la griglia) in una nuova forma.",
            "Cambia le voci di A: la maglia mostra la spinta lineare.",
        ),
        "ALG-TRA-003": (
            "Il nucleo sono i vettori che A manda all’origine.",
            "Cerca direzioni che collassano quando det si avvicina a zero.",
        ),
        "ALG-TRA-004": (
            "L’immagine sono le direzioni che A può raggiungere.",
            "Osserva dove puntano le frecce di base trasformate e₁ e e₂.",
        ),
        "ALG-TRA-005": (
            "Comporre trasformazioni significa applicarne una dopo l’altra (prodotto di matrici).",
            "Cambia A e pensala come un passo di una composizione.",
        ),
        "ALG-TRA-006": (
            "L’inversa disfa la spinta di A.",
            "Tocca Applica A⁻¹ (se esiste): la maglia torna verso la forma originale.",
        ),
        "ALG-TRA-007": (
            "Cambiare base descrive gli stessi vettori con altre coordinate.",
            "Modifica A come matrice di cambio e guarda come si riorienta la maglia.",
        ),
        "ALG-EIG-001": (
            "Un autovettore si allunga o si accorcia soltanto; non gira di lato.",
            "Attiva gli autovettori: i trattini arancioni segnano queste direzioni speciali.",
        ),
        "ALG-EIG-002": (
            "L’equazione caratteristica trova gli autovalori (fattori di stiramento).",
            "Modifica A e collega det(A−λI)=0 alle direzioni che vedi sulla griglia.",
        ),
        "ALG-EIG-003": (
            "L’autospazio è la retta (o piano) di tutti gli autovettori di un λ.",
            "Osserva la direzione arancione legata a ciascun autovalore.",
        ),
        "ALG-EIG-004": (
            "Diagonalizzare significa scrivere A in una base di autovettori dove agisce solo per scale.",
            "Con gli autovettori visibili, immagina assi dove A solo stira.",
        ),
        "ALG-EIG-005": (
            "Con A = PDP⁻¹, elevare A a potenza significa elevare le scale sulla diagonale.",
            "Esplora A e le sue direzioni proprie come scorciatoia per Aⁿ.",
        ),
        "ALG-EIG-006": (
            "Nelle matrici simmetriche gli autovettori si possono scegliere ortogonali.",
            "Prova una A quasi simmetrica e guarda autovettori quasi perpendicolari.",
        ),
        "ALG-ORT-001": (
            "Ortogonale significa angolo retto: il prodotto scalare è zero.",
            "Metti u ⊥ v: u·v ≈ 0 e l’angolo si segna come retto.",
        ),
        "ALG-ORT-002": (
            "La proiezione è l’ombra di u sulla direzione di v.",
            "Trascina u: il segmento arancione è la proiezione; il resto è l’errore ortogonale.",
        ),
        "ALG-ORT-003": (
            "Una matrice ortogonale ruota/riflette senza cambiare le lunghezze.",
            "Spingi A verso una rotazione e vedi che la maglia mantiene lunghezze regolari.",
        ),
        "ALG-ORT-004": (
            "Gram–Schmidt trasforma vettori in una base ortogonale passo dopo passo.",
            "Avanza il passo Gram–Schmidt e osserva la nuova direzione ortogonale.",
        ),
        "ALG-LSQ-001": (
            "I minimi quadrati cercano il punto del sottospazio più vicino ai dati.",
            "Muovi i vettori e il punto: la proiezione è la migliore approssimazione.",
        ),
        "ALG-LSQ-002": (
            "Le equazioni normali AᵀAx = Aᵀb riassumono quel problema di proiezione.",
            "Modifica A e b come dati di un adattamento lineare a minimi quadrati.",
        ),
        "ALG-LSQ-003": (
            "La pseudoinversa generalizza l’inversa quando A non è invertibile.",
            "Esplora una A rettangolare/singolare e pensa alla « migliore » soluzione approssimata.",
        ),
        "ALG-DEC-001": (
            "LU spezza A in fattori triangolari inferiore e superiore per risolvere i sistemi più facilmente.",
            "Applica operazioni di riga: ti avvicini alla forma usata da LU.",
        ),
        "ALG-DEC-002": (
            "QR scrive A come parte ortogonale/rotazionale per una parte triangolare.",
            "Vedi la maglia di A come quella composizione ortogonale-poi-triangolare.",
        ),
        "ALG-DEC-003": (
            "La decomposizione spettrale usa autovalori e autovettori.",
            "Attiva gli autovettori: sono gli assi di quella decomposizione.",
        ),
        "ALG-DEC-004": (
            "La SVD spezza A in ruotare → scalare → ruotare.",
            "Tocca il passo SVD: 1) orienta, 2) scala con σ, 3) ricomponi con A.",
        ),
        "ALG-DEC-005": (
            "Tenere i σ grandi approssima A con rango basso.",
            "Abbassa k: la maglia usa solo il maggior valore singolare (semplificato).",
        ),
        "ALG-NOR-001": (
            "Una norma matriciale misura quanto A può stirare un vettore.",
            "Cambia A: σ grandi indicano forte stiramento in qualche direzione.",
        ),
        "ALG-NOR-002": (
            "Frobenius misura la « grandezza » di A sommando i quadrati di tutte le voci.",
            "Modifica A e collega voci grandi a una norma più grande.",
        ),
        "ALG-NOR-003": (
            "La norma 1 è legata alle somme di colonne.",
            "Rendi una colonna molto più grande: quella norma cresce con essa.",
        ),
        "ALG-NOR-004": (
            "La norma infinito è legata alle somme di righe.",
            "Rendi una riga dominante e osserva l’effetto sulla grandezza di A.",
        ),
        "ALG-NOR-005": (
            "La norma spettrale è il massimo stiramento (σ₁).",
            "Guarda l’ellisse dei valori singolari: l’asse lungo è quello stiramento.",
        ),
        "ALG-NOR-006": (
            "‖AB‖ ≤ ‖A‖‖B‖: la grandezza del prodotto non supera il prodotto delle grandezze.",
            "Confronta visivamente quanto stira A rispetto a mappe concatenate.",
        ),
        "ALG-NOR-007": (
            "Il numero di condizionamento dice quanto un sistema è sensibile agli errori.",
            "Fai σ₁ ≫ σ₂ (k basso): la maglia si appiattisce e il problema è mal condizionato.",
        ),
        "ALG-BOO-001": (
            "Puoi controllare un’identità logica riga per riga nella tavola di verità.",
            "Cambia le uscite: le righe arancioni non coincidono con l’atteso.",
        ),
        "ALG-BOO-002": (
            "Alcune operazioni booleane si semplificano (idempotenza, complemento).",
            "Alterna A e B e confronta la tavola con il risultato in tempo reale.",
        ),
        "ALG-BOO-003": (
            "La distributività esiste anche in logica, non solo per i numeri.",
            "Controlla la tavola: AND/OR si distribuisce come l’area a(b+c).",
        ),
        "ALG-BOO-004": (
            "De Morgan: negare un AND è un OR di negazioni (e viceversa).",
            "Cambia A e B: i due lati di ogni legge danno sempre lo stesso risultato.",
        ),
        "ALG-BOO-005": (
            "XOR è vero quando A e B sono diversi.",
            "Prova le quattro coppie: solo 01 e 10 danno 1.",
        ),
        "ALG-BOO-006": (
            "L’assorbimento elimina termini ridondanti nelle espressioni booleane.",
            "Confronta le righe della tavola per vedere quali voci sono inutili.",
        ),
        "ALG-BOO-007": (
            "La somma di prodotti scrive la funzione come OR di AND.",
            "Segna le righe con uscita 1: quelli sono i tuoi prodotti.",
        ),
        "ALG-BOO-008": (
            "Il prodotto di somme è la forma duale: AND di OR.",
            "Usa la tavola per vedere quali clausole coprono gli zeri della funzione.",
        ),
        "ALG-BOO-009": (
            "Due espressioni sono equivalenti se le loro tavole di verità coincidono.",
            "Modifica le uscite: se tutto mostra ✓, le tavole concordano.",
        ),
        "ALG-MOD-001": (
            "a e b sono congruenti modulo m se cadono sullo stesso scatto dell’orologio.",
            "Muovi a e b: il testo dice se a ≡ b (mod m) quando condividono un segno.",
        ),
        "ALG-MOD-002": (
            "Sommare e moltiplicare modulo m significa operare e tornare a 0…m−1.",
            "Cambia a, b e m: i segni mostrano a+b e a·b sul cerchio.",
        ),
        "ALG-MOD-003": (
            "L’inverso di a modulo m esiste solo se gcd(a, m) = 1.",
            "Prova vari a: se non c’è inverso, il testo lo indica.",
        ),
        "ALG-MOD-005": (
            "Il teorema cinese combina due orologi (m e m₂) in una soluzione x.",
            "Regola a, b, m e m₂: quando esiste, compare la x che soddisfa entrambi i resti.",
        ),
        "ALG-MOD-006": (
            "Fermat: se p è primo e non divide a, allora a^(p−1) ≡ 1 (mod p).",
            "Con m primo, controlla a^(p−1) nella didascalia; dovrebbe essere 1 se gcd(a,p)=1.",
        ),
        "ALG-EST-006": (
            "In un campo primo, somma e prodotto si avvolgono modulo p.",
            "Scegli p e apri le tavole + / ·; tocca una cella per risultato e inverso.",
        ),
        "ALG-COD-001": (
            "Un codice lineare è un sottospazio: sommare parole di codice dà un’altra parola di codice.",
            "Leggi l’elenco delle codeword: la loro somma resta nell’insieme.",
        ),
        "ALG-COD-002": (
            "La matrice generatrice G costruisce parole di codice dai messaggi.",
            "Modifica bit/voci e pensa ogni riga di G come un motivo base del codice.",
        ),
        "ALG-COD-003": (
            "H controlla la parità: le parole valide soddisfano H c = 0.",
            "Inverti un bit e collega l’errore a una sindrome non nulla (vedi COD-004).",
        ),
        "ALG-COD-004": (
            "La sindrome indica (nei codici semplici) dove sta il bit errato.",
            "Scegli la posizione dell’errore: la sindrome s si aggiorna subito.",
        ),
        "ALG-COD-005": (
            "La distanza di Hamming conta le posizioni in cui due parole differiscono.",
            "Modifica le due stringhe: i bit diversi si evidenziano e d_H si aggiorna.",
        ),
        "ALG-COD-006": (
            "Con distanza minima d puoi rilevare/correggere un numero limitato di errori.",
            "Muovi d_min: il raggio di correzione t = ⌊(d−1)/2⌋ cambia con esso.",
        ),
        "ALG-COD-007": (
            "Il tasso k/n misura l’informazione utile rispetto alla lunghezza totale.",
            "Regola n e k: la barra mostra la parte di messaggio rispetto alla ridondanza.",
        ),
    },
    "pt": {
        "ALG-FND-001": (
            "A ordem das parcelas não muda o resultado.",
            "Toca em Trocar: os blocos mudam de lugar, mas a barra total continua igual.",
        ),
        "ALG-FND-002": (
            "Mesmo se agrupares os números de outra forma, a soma (ou o produto) não muda.",
            "Toca Agrupar esquerda/direita. Só a caixa se move; o total a+b+c continua igual.",
        ),
        "ALG-FND-003": (
            "Multiplicar uma soma é como somar as áreas de dois retângulos.",
            "Move a, b e c: o retângulo grande a(b+c) divide-se em ab e ac com a mesma área total.",
        ),
        "ALG-FND-006": (
            "O valor absoluto é a distância ao zero: nunca é negativo.",
            "Move x para a esquerda ou para a direita: a marca mostra quão longe está da origem.",
        ),
        "ALG-FND-007": (
            "A distância entre dois pontos é o comprimento do segmento que os une.",
            "Move a e b: a distância |a−b| é o comprimento entre os dois pontos.",
        ),
        "ALG-POT-001": (
            "Ao multiplicar potências da mesma base, os expoentes somam-se.",
            "Muda n e m: os blocos a^n e a^m juntam-se em a^(n+m).",
        ),
        "ALG-POT-008": (
            "O conjugado ajuda a tirar uma raiz do denominador.",
            "Compara a+√b com a−√b: o produto deles limpa a raiz no meio.",
        ),
        "ALG-EXP-003": (
            "Vais ver por que (ax+b)(cx+d)=acx^2+(ad+bc)x+bd e como adx e bcx se somam.",
            "Cada termo do primeiro polinómio multiplica-se por cada termo do segundo; depois agrupam-se as mesmas potências de x.",
        ),
        "ALG-IDN-001": (
            "(a+b)² vê-se como um quadrado cortado em quatro peças.",
            "Muda a e b: o quadrado grande é a² + 2ab + b².",
        ),
        "ALG-IDN-002": (
            "(a−b)² também é uma área, com uma correção no canto.",
            "Ajusta a e b e observa como aparecem a², −2ab e +b².",
        ),
        "ALG-IDN-003": (
            "a²−b² é a área que fica ao tirar um quadrado pequeno de um grande.",
            "Alterna de a²−b² para o retângulo (a−b)(a+b): é a mesma quantidade.",
        ),
        "ALG-IDN-008": (
            "Os coeficientes binomiais são uma linha de Pascal.",
            "Muda n: vês os números de Pascal e como se constrói (a+b)^n.",
        ),
        "ALG-FAC-001": (
            "Tirar fator comum é reagrupar áreas que partilham um lado.",
            "Move a, b e c: o retângulo a(b+c) corresponde a ab+ac.",
        ),
        "ALG-FAC-002": (
            "Fatorizar a²−b² reconstrói a área restante como um retângulo.",
            "Alterna entre a²−b² e (a−b)(a+b) para ver que coincidem.",
        ),
        "ALG-FAC-003": (
            "Um trinómio quadrado perfeito monta-se como um quadrado completo.",
            "Ajusta a e b até veres o padrão (a±b)² nas peças.",
        ),
        "ALG-EQU-001": (
            "Uma equação linear é uma reta: a solução é onde encontra o eixo x.",
            "Move o declive e a ordenada na origem; procura onde a reta cruza o eixo horizontal.",
        ),
        "ALG-EQU-003": (
            "A parábola encontra o eixo x nas soluções (se existirem).",
            "Muda a, b e c: observa o discriminante Δ e as marcas laranja das raízes.",
        ),
        "ALG-EQU-004": (
            "O discriminante diz quantas raízes reais tem a quadrática.",
            "Ajusta a, b e c e vê se há 2, 1 ou nenhuma raiz real segundo Δ.",
        ),
        "ALG-EQU-005": (
            "Completar o quadrado é acrescentar (e depois subtrair) o canto que falta.",
            "Toca Adicionar/Subtrair (b/2)²: vês de onde vem o termo b²/4.",
        ),
        "ALG-EQU-008": (
            "Uma equação com valor absoluto costuma ter duas soluções simétricas.",
            "Move o ponto na reta e relaciona as distâncias com as soluções.",
        ),
        "ALG-INE-001": (
            "Uma inequação linear pinta um raio ou um intervalo na reta.",
            "Muda o bordo e o tipo de desigualdade: a zona sombreada é a solução.",
        ),
        "ALG-INE-002": (
            "A solução de uma inequação quadrática é onde a parábola está acima (ou abaixo) do eixo.",
            "Ajusta a parábola: a zona sombreada marca os x que funcionam.",
        ),
        "ALG-INE-003": (
            "Em inequações racionais, cuidado com os pontos onde o denominador se anula.",
            "Move o bordo e vê que parte da reta é permitida.",
        ),
        "ALG-INE-004": (
            "O valor absoluto em desigualdades define intervalos centrados ou exteriores.",
            "Muda o raio e os extremos abertos/fechados para ver o intervalo solução.",
        ),
        "ALG-SIS-001": (
            "Um sistema 2×2 são duas retas: a solução é o seu cruzamento (se se encontrarem).",
            "Move o declive: o ponto laranja marca a interseção, ou vês se são paralelas.",
        ),
        "ALG-SIS-002": (
            "O sistema pode escrever-se como uma única equação matricial Ax = b.",
            "Edita A e vê como se organiza a informação do sistema.",
        ),
        "ALG-SIS-003": (
            "Cada linha da matriz aumentada é uma equação do sistema.",
            "Escolhe R₁ ou R₂: abaixo aparece a equação dessa linha.",
        ),
        "ALG-SIS-004": (
            "As operações de linha mudam a matriz, mas o sistema continua equivalente.",
            "Experimenta trocar, escalar ou somar linhas e vê como A muda.",
        ),
        "ALG-SIS-005": (
            "Comparar postos diz-te se há uma, infinitas ou nenhuma solução.",
            "Torna A singular ou não e observa o indicador posto / ∅ / ∞.",
        ),
        "ALG-FUN-001": (
            "O domínio são os x onde a função faz sentido (aqui x ≠ 0).",
            "Olha 1/x: perto de zero a curva dispara; esse buraco é o domínio partido.",
        ),
        "ALG-FUN-002": (
            "Compor funções é aplicar uma a seguir à outra.",
            "Move x₀ e os parâmetros: o valor mostrado é f(g(x)).",
        ),
        "ALG-FUN-003": (
            "A inversa « desfaz » a função: os gráficos são simétricos em relação a y = x.",
            "Compara a curva e a sua inversa; a diagonal tracejada é o espelho y = x.",
        ),
        "ALG-FUN-005": (
            "Uma reta fica determinada pelo declive e pela ordenada na origem.",
            "Move m e b: a reta inclina-se e desloca-se de imediato.",
        ),
        "ALG-FUN-006": (
            "Retas paralelas têm o mesmo declive; perpendiculares têm declives inversos com sinal trocado.",
            "Ajusta as duas retas e vê quando nunca se encontram ou se cruzam em ângulo reto.",
        ),
        "ALG-FUN-007": (
            "Uma translação move um gráfico sem o deformar.",
            "Move h e k: a curva desloca-se na horizontal e na vertical.",
        ),
        "ALG-FUN-008": (
            "Escalar e refletir esticam, comprimem ou viram a curva.",
            "Muda a e a reflexão: observa como a onda se deforma.",
        ),
        "ALG-POL-007": (
            "Um polinómio em duas variáveis atribui um valor a cada ponto (x, y).",
            "Move a, b e c: o mapa de cores mostra z = ax² + bxy + cy².",
        ),
        "ALG-POL-008": (
            "O grau total soma os expoentes de cada variável.",
            "Muda α e β: o retângulo ilustra o grau α+β de x^α y^β.",
        ),
        "ALG-POL-009": (
            "Num polinómio homogéneo, escalar (x, y) escala o resultado de forma previsível.",
            "Ativa a forma homogénea e move t: compara P(tx, ty) com t^d P(x, y).",
        ),
        "ALG-POL-010": (
            "Um sistema polinomial parece curvas que se encontram nas soluções.",
            "Ajusta os parâmetros e procura os cruzamentos entre as duas curvas.",
        ),
        "ALG-POL-011": (
            "A resultante concentra condições de raiz comum numa matriz.",
            "Edita a matriz e observa o determinante como sinal de raízes partilhadas.",
        ),
        "ALG-LOG-001": (
            "Uma exponencial cresce (ou decai) multiplicando repetidamente.",
            "Muda a base: a curva fica mais íngreme ou mais suave.",
        ),
        "ALG-LOG-002": (
            "O logaritmo responde: « a que expoente elevo a base para obter x? ».",
            "Compara log e exponencial: são inversas; y = x espelha-as.",
        ),
        "ALG-LOG-007": (
            "O sinal da taxa decide crescimento ou decaimento.",
            "Move k (via b) e vê se a curva sobe ou desce com o tempo.",
        ),
        "ALG-COM-001": (
            "Um complexo a+bi é um ponto (ou seta) no plano.",
            "Arrasta a ponta: as coordenadas são a parte real e a imaginária.",
        ),
        "ALG-COM-002": (
            "O conjugado reflete o número em relação ao eixo real.",
            "Arrasta z: a seta laranja é o conjugado (mesmo x, y invertido).",
        ),
        "ALG-COM-003": (
            "O módulo é o comprimento da seta desde a origem.",
            "Estica ou encurta o vetor: r é esse comprimento.",
        ),
        "ALG-COM-004": (
            "Na forma polar usas comprimento e ângulo em vez de (x, y).",
            "Roda θ: o ponto move-se no círculo de raio r.",
        ),
        "ALG-COM-005": (
            "Euler liga o ângulo ao cosseno e ao seno no círculo unitário.",
            "Move θ: o ponto (cos θ, sin θ) percorre a circunferência.",
        ),
        "ALG-COM-006": (
            "Elevar a n multiplica o ângulo por n e potencia o raio.",
            "Muda n e θ: vês z, z², z³… a rodar e a afastar-se segundo rⁿ.",
        ),
        "ALG-COM-007": (
            "As raízes n-ésimas situam-se como vértices de um polígono regular.",
            "Muda n: os pontos laranja distribuem-se no círculo.",
        ),
        "ALG-SEC-001": (
            "Numa sucessão aritmética cada passo soma a mesma quantidade.",
            "Move a₁ e d: os pontos sobem ou descem a passos constantes.",
        ),
        "ALG-SEC-003": (
            "Numa sucessão geométrica cada termo multiplica-se por r.",
            "Muda a e r: os pontos crescem ou aproximam-se de zero conforme |r|.",
        ),
        "ALG-SEC-005": (
            "Se |r|<1, a série geométrica infinita aproxima-se de um limite.",
            "Experimenta |r|<1 e |r|≥1: vê se os pontos estabilizam ou disparam.",
        ),
        "ALG-SEC-007": (
            "Uma recorrência constrói cada termo a partir dos anteriores.",
            "Muda os coeficientes e observa como a sucessão evolui ponto a ponto.",
        ),
        "ALG-VEC-001": (
            "Um vetor é uma seta: direção e comprimento.",
            "Arrasta as pontas para mudar o vetor no plano.",
        ),
        "ALG-VEC-002": (
            "A norma é o comprimento da seta.",
            "Estica u: ‖u‖ atualiza-se com o comprimento.",
        ),
        "ALG-VEC-003": (
            "Um vetor unitário tem comprimento 1 e mantém a direção.",
            "Move u: vês a versão normalizada û de comprimento 1.",
        ),
        "ALG-VEC-004": (
            "O produto escalar mede o alinhamento: positivo = ângulo agudo.",
            "Arrasta u e v: observa u·v e agudo/reto/obtuso; a projeção é laranja.",
        ),
        "ALG-VEC-005": (
            "O ângulo entre vetores lê-se a partir do produto escalar.",
            "Move as setas: o ângulo e o tipo atualizam-se ao vivo.",
        ),
        "ALG-VEC-006": (
            "A distância entre as pontas dos vetores é a norma da diferença.",
            "Separa u e v: a distância cresce com a separação.",
        ),
        "ALG-VEC-007": (
            "Uma combinação linear mistura vetores com pesos.",
            "Arrasta u e v: a seta laranja é 0.7u + 0.5v.",
        ),
        "ALG-MAT-001": (
            "Uma matriz é uma tabela de números em linhas e colunas.",
            "Edita as entradas de A: cada célula é um coeficiente do objeto linear.",
        ),
        "ALG-MAT-002": (
            "Somar matrizes faz-se entrada a entrada.",
            "Muda A e B: A+B atualiza-se célula a célula.",
        ),
        "ALG-MAT-003": (
            "Escalar uma matriz estica ou inverte cada entrada.",
            "Move c: vê cA crescer, encolher ou mudar de sinal.",
        ),
        "ALG-MAT-004": (
            "Cada entrada de AB mistura uma linha de A com uma coluna de B.",
            "Escolhe uma célula (i,j): abaixo vês o cálculo linha×coluna.",
        ),
        "ALG-MAT-005": (
            "A identidade deixa os vetores iguais: é o « 1 » das matrizes.",
            "Compara A com o efeito da identidade na base.",
        ),
        "ALG-MAT-006": (
            "A transposta troca linhas por colunas.",
            "Edita A: à direita vês Aᵀ com linhas e colunas invertidas.",
        ),
        "ALG-MAT-007": (
            "Uma matriz simétrica coincide com a sua transposta.",
            "Ajusta A até coincidir com Aᵀ.",
        ),
        "ALG-DET-001": (
            "O determinante 2×2 é a área com sinal do paralelogramo das colunas.",
            "Move os vetores: a área colorida é |det|; o sinal indica a orientação.",
        ),
        "ALG-DET-002": (
            "Um determinante pode desenvolver-se por uma linha ou coluna (cofatores).",
            "Edita A e observa como det(A) reage.",
        ),
        "ALG-DET-003": (
            "det(AB) = det(A)det(B): as áreas multiplicam-se.",
            "Muda A e B e compara a área do produto com o produto das áreas.",
        ),
        "ALG-DET-004": (
            "Se a área (det) é zero, as colunas são paralelas e não há inversa.",
            "Achata o paralelogramo (área ≈ 0): a matriz torna-se singular.",
        ),
        "ALG-DET-005": (
            "A inversa « desfaz » A; existe só se det ≠ 0.",
            "Edita A e olha det: se não for zero, a inversa está definida.",
        ),
        "ALG-DET-006": (
            "Cramer usa determinantes para resolver sistemas pequenos.",
            "Muda A e b: relaciona det(A) com a possibilidade de solução única.",
        ),
        "ALG-ESP-001": (
            "O espaço gerado são todas as misturas s·u + t·v.",
            "Move s e t: a seta laranja varre o plano (ou a reta) gerado por u e v.",
        ),
        "ALG-ESP-002": (
            "Se a área do paralelogramo é zero, os vetores são dependentes.",
            "Alinha u e v: o indicador passa a « dependentes ».",
        ),
        "ALG-ESP-003": (
            "Uma base é um conjunto independente que gera todo o espaço.",
            "Ativa « mostrar base » e compara com os teus vetores u e v.",
        ),
        "ALG-ESP-004": (
            "As coordenadas dizem quanto precisas de cada vetor da base.",
            "Muda s e t: são as coordenadas da combinação na base u, v.",
        ),
        "ALG-ESP-005": (
            "O posto é quantas direções independentes a matriz tem.",
            "Edita A: usa det/posto para ver se há 0, 1 ou 2 direções.",
        ),
        "ALG-ESP-006": (
            "A nulidade conta soluções não triviais de Ax = 0.",
            "Torna as colunas dependentes e relaciona isso com direções enviadas à origem.",
        ),
        "ALG-ESP-007": (
            "Posto + nulidade = número de colunas (no caso n).",
            "Explora vetores dependentes/independentes e como se reparte a dimensão.",
        ),
        "ALG-TRA-001": (
            "Uma transformação linear respeita somas e escalamentos.",
            "Olha a grelha deformada por A: as retas continuam retas.",
        ),
        "ALG-TRA-002": (
            "Aplicar A empurra cada ponto (e a grelha) para uma nova forma.",
            "Muda as entradas de A: a malha mostra o empurrão linear.",
        ),
        "ALG-TRA-003": (
            "O núcleo são os vetores que A manda para a origem.",
            "Procura direções que colapsam quando det se aproxima de zero.",
        ),
        "ALG-TRA-004": (
            "A imagem são as direções que A consegue atingir.",
            "Observa para onde apontam as setas de base transformadas e₁ e e₂.",
        ),
        "ALG-TRA-005": (
            "Compor transformações é aplicar uma a seguir à outra (produto de matrizes).",
            "Muda A e pensa nela como um passo de uma composição.",
        ),
        "ALG-TRA-006": (
            "A inversa desfaz o empurrão de A.",
            "Toca Aplicar A⁻¹ (se existir): a malha volta para a forma original.",
        ),
        "ALG-TRA-007": (
            "Mudar de base é descrever os mesmos vetores com outras coordenadas.",
            "Edita A como matriz de mudança e vê como a malha se reorienta.",
        ),
        "ALG-EIG-001": (
            "Um vetor próprio só estica ou encolhe; não gira para o lado.",
            "Ativa vetores próprios: os traços laranja marcam essas direções especiais.",
        ),
        "ALG-EIG-002": (
            "A equação característica encontra os valores próprios (fatores de esticamento).",
            "Edita A e relaciona det(A−λI)=0 com as direções que vês na grelha.",
        ),
        "ALG-EIG-003": (
            "O autoespaço é a reta (ou plano) de todos os vetores próprios de um λ.",
            "Observa a direção laranja associada a cada valor próprio.",
        ),
        "ALG-EIG-004": (
            "Diagonalizar é escrever A numa base de vetores próprios onde só escala.",
            "Com vetores próprios visíveis, imagina eixos onde A só estica.",
        ),
        "ALG-EIG-005": (
            "Com A = PDP⁻¹, potenciar A é potenciar as escalas na diagonal.",
            "Explora A e as suas direções próprias como atalho para Aⁿ.",
        ),
        "ALG-EIG-006": (
            "Em matrizes simétricas, os vetores próprios podem escolher-se ortogonais.",
            "Experimenta uma A quase simétrica e vê vetores próprios quase perpendiculares.",
        ),
        "ALG-ORT-001": (
            "Ortogonal significa ângulo reto: o produto escalar é zero.",
            "Coloca u ⊥ v: u·v ≈ 0 e o ângulo marca-se como reto.",
        ),
        "ALG-ORT-002": (
            "A projeção é a sombra de u sobre a direção de v.",
            "Arrasta u: o segmento laranja é a projeção; o resto é o erro ortogonal.",
        ),
        "ALG-ORT-003": (
            "Uma matriz ortogonal roda/reflete sem mudar comprimentos.",
            "Empurra A para uma rotação e vê que a malha mantém comprimentos regulares.",
        ),
        "ALG-ORT-004": (
            "Gram–Schmidt transforma vetores numa base ortogonal passo a passo.",
            "Avança o passo Gram–Schmidt e observa a nova direção ortogonal.",
        ),
        "ALG-LSQ-001": (
            "Os mínimos quadrados procuram o ponto do subespaço mais próximo dos dados.",
            "Move os vetores e o ponto: a projeção é a melhor aproximação.",
        ),
        "ALG-LSQ-002": (
            "As equações normais AᵀAx = Aᵀb resumem esse problema de projeção.",
            "Edita A e b como dados de um ajuste linear por mínimos quadrados.",
        ),
        "ALG-LSQ-003": (
            "A pseudoinversa generaliza a inversa quando A não é invertível.",
            "Explora uma A retangular/singular e pensa na « melhor » solução aproximada.",
        ),
        "ALG-DEC-001": (
            "LU parte A em fatores triangulares inferior e superior para resolver sistemas mais facilmente.",
            "Aplica operações de linha: aproximas-te da forma que a LU usa.",
        ),
        "ALG-DEC-002": (
            "QR escreve A como parte ortogonal/rotacional vezes uma parte triangular.",
            "Vê a malha de A como essa composição ortogonal-depois-triangular.",
        ),
        "ALG-DEC-003": (
            "A decomposição espetral usa valores próprios e vetores próprios.",
            "Ativa vetores próprios: são os eixos dessa decomposição.",
        ),
        "ALG-DEC-004": (
            "A SVD parte A em rodar → escalar → rodar.",
            "Toca o passo SVD: 1) orientar, 2) escalar com σ, 3) recompor com A.",
        ),
        "ALG-DEC-005": (
            "Ficar com os σ grandes aproxima A com posto baixo.",
            "Baixa k: a malha usa só o maior valor singular (simplificado).",
        ),
        "ALG-NOR-001": (
            "Uma norma matricial mede quanto A pode esticar um vetor.",
            "Muda A: σ grandes indicam esticamento forte nalguma direção.",
        ),
        "ALG-NOR-002": (
            "Frobenius mede o « tamanho » de A somando os quadrados de todas as entradas.",
            "Edita A e relaciona entradas grandes com uma norma maior.",
        ),
        "ALG-NOR-003": (
            "A norma 1 liga-se às somas de colunas.",
            "Torna uma coluna bem maior: essa norma cresce com ela.",
        ),
        "ALG-NOR-004": (
            "A norma infinito liga-se às somas de linhas.",
            "Torna uma linha dominante e observa o efeito no tamanho de A.",
        ),
        "ALG-NOR-005": (
            "A norma espetral é o maior esticamento (σ₁).",
            "Olha a elipse dos valores singulares: o eixo longo é esse esticamento.",
        ),
        "ALG-NOR-006": (
            "‖AB‖ ≤ ‖A‖‖B‖: o tamanho do produto não ultrapassa o produto dos tamanhos.",
            "Compara visualmente quanto A estica face a mapas encadeados.",
        ),
        "ALG-NOR-007": (
            "O número de condição diz quão sensível um sistema é a erros.",
            "Faz σ₁ ≫ σ₂ (k baixo): a malha achata-se e o problema fica mal condicionado.",
        ),
        "ALG-BOO-001": (
            "Podes verificar uma identidade lógica linha a linha na tabela de verdade.",
            "Alterna as saídas: as linhas laranja não coincidem com o esperado.",
        ),
        "ALG-BOO-002": (
            "Algumas operações booleanas simplificam-se (idempotência, complemento).",
            "Alterna A e B e compara a tabela com o resultado ao vivo.",
        ),
        "ALG-BOO-003": (
            "A distributividade também existe na lógica, não só nos números.",
            "Verifica a tabela: AND/OR reparte-se como a área a(b+c).",
        ),
        "ALG-BOO-004": (
            "De Morgan: negar um AND é um OR de negações (e o contrário).",
            "Muda A e B: os dois lados de cada lei dão sempre o mesmo resultado.",
        ),
        "ALG-BOO-005": (
            "XOR é verdadeiro quando A e B são diferentes.",
            "Experimenta os quatro pares: só 01 e 10 dão 1.",
        ),
        "ALG-BOO-006": (
            "A absorção remove termos redundantes em expressões booleanas.",
            "Compara linhas da tabela para ver que entradas são desnecessárias.",
        ),
        "ALG-BOO-007": (
            "Soma de produtos escreve a função como ORs de ANDs.",
            "Marca as linhas em que a saída é 1: esses são os teus produtos.",
        ),
        "ALG-BOO-008": (
            "Produto de somas é a forma dual: ANDs de ORs.",
            "Usa a tabela para ver que cláusulas cobrem os zeros da função.",
        ),
        "ALG-BOO-009": (
            "Duas expressões são equivalentes se as tabelas de verdade coincidem.",
            "Edita as saídas: se tudo mostra ✓, as tabelas concordam.",
        ),
        "ALG-MOD-001": (
            "a e b são congruentes módulo m se caem no mesmo « tick » do relógio.",
            "Move a e b: o texto diz se a ≡ b (mod m) quando partilham uma marca.",
        ),
        "ALG-MOD-002": (
            "Somar e multiplicar módulo m é operar e voltar a 0…m−1.",
            "Muda a, b e m: as marcas mostram a+b e a·b no círculo.",
        ),
        "ALG-MOD-003": (
            "O inverso de a módulo m existe só se gcd(a, m) = 1.",
            "Experimenta vários a: se não houver inverso, o texto indica-o.",
        ),
        "ALG-MOD-005": (
            "O teorema chinês combina dois relógios (m e m₂) numa solução x.",
            "Ajusta a, b, m e m₂: quando existe, aparece o x que cumpre ambos os restos.",
        ),
        "ALG-MOD-006": (
            "Fermat: se p é primo e não divide a, então a^(p−1) ≡ 1 (mod p).",
            "Com m primo, verifica a^(p−1) na legenda; deve ser 1 se gcd(a,p)=1.",
        ),
        "ALG-EST-006": (
            "Num corpo primo, soma e produto enrolam-se módulo p.",
            "Escolhe p e abre as tabelas + / ·; toca numa célula para o resultado e o inverso.",
        ),
        "ALG-COD-001": (
            "Um código linear é um subespaço: somar palavras de código dá outra palavra de código.",
            "Lê a lista de codewords: a sua soma permanece no conjunto.",
        ),
        "ALG-COD-002": (
            "A matriz geradora G constrói palavras de código a partir de mensagens.",
            "Edita bits/entradas e pensa cada linha de G como um padrão base do código.",
        ),
        "ALG-COD-003": (
            "H verifica a paridade: as palavras válidas satisfazem H c = 0.",
            "Inverte um bit e relaciona a falha com uma síndrome não nula (ver COD-004).",
        ),
        "ALG-COD-004": (
            "A síndrome indica (em códigos simples) onde está o bit errado.",
            "Escolhe a posição do erro: a síndrome s atualiza-se de imediato.",
        ),
        "ALG-COD-005": (
            "A distância de Hamming conta as posições em que duas palavras diferem.",
            "Edita as duas cadeias: os bits diferentes destacam-se e d_H atualiza-se.",
        ),
        "ALG-COD-006": (
            "Com distância mínima d podes detetar/corrigir um número limitado de erros.",
            "Move d_min: o raio de correção t = ⌊(d−1)/2⌋ muda com ele.",
        ),
        "ALG-COD-007": (
            "A taxa k/n mede a informação útil face ao comprimento total.",
            "Ajusta n e k: a barra mostra a parte de mensagem face à redundância.",
        ),
    },
}


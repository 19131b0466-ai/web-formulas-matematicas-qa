"""Personal (tú) viz copy with LaTeX delimiters."""

from __future__ import annotations

COPY_ES: dict[str, tuple[str, str]] = {
    'ALG-FND-001': (
        'Vas a ver que da igual el orden: \\(a+b\\) y \\(b+a\\) suman lo mismo.',
        'Mueve \\(a\\) y \\(b\\) y compara las dos filas: arriba \\(a+b\\), abajo \\(b+a\\); las barras quedan igual de largas.',
    ),
    'ALG-FND-002': (
        'Vas a ver que agrupar distinto no cambia el total: \\((a+b)+c\\) y \\(a+(b+c)\\) dan lo mismo.',
        'Mueve \\(a\\), \\(b\\) y \\(c\\) y compara las dos filas: el recuadro agrupa distinto, pero el total es el mismo.',
    ),
    'ALG-FND-003': (
        'Vas a ver que \\(a(b+c)\\) es la misma área que \\(ab+ac\\).',
        'Mueve \\(a\\), \\(b\\) y \\(c\\) y compara los dos cuadros: a la izquierda un solo rectángulo; a la derecha \\(ab\\) y \\(ac\\) separados.',
    ),
    'ALG-FND-006': (
        'Vas a ver que \\(|x|\\) es la distancia al cero: nunca baja de cero.',
        'Mueve \\(x\\) a la izquierda o a la derecha y fíjate: la marca solo cuenta cuánto te alejas del origen.',
    ),
    'ALG-FND-007': (
        'Vas a ver que la distancia entre dos puntos es el largo del segmento que los une: \\(|a-b|\\).',
        'Mueve \\(a\\) y \\(b\\) y mira la longitud entre ambos: esa medida es \\(|a-b|\\).',
    ),
    'ALG-POT-001': (
        'Vas a ver que al multiplicar potencias de la misma base, los exponentes se suman: \\(a^n a^m = a^{n+m}\\).',
        'Cambia \\(n\\) y \\(m\\) y fíjate cómo los bloques de \\(a^n\\) y \\(a^m\\) se juntan en \\(a^{n+m}\\).',
    ),
    'ALG-POT-008': (
        'Vas a ver que el conjugado ayuda a quitar una raíz del denominador.',
        'Compara \\(a+\\sqrt{b}\\) con \\(a-\\sqrt{b}\\) y mira su producto: el resultado queda sin raíz en el medio.',
    ),
    'ALG-EXP-003': (
        'Vas a ver por qué \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) y cómo \\(adx\\) y \\(bcx\\) se suman.',
        'Cada término del primer polinomio se multiplica por cada término del segundo; luego se agrupan las mismas potencias de \\(x\\).',
    ),
    'ALG-IDN-001': (
        'Vas a ver que el \\(2\\) de \\(2ab\\) sale porque hay dos rectángulos distintos de área \\(ab\\).',
        'Un cuadrado de lado \\(a+b\\) tiene área \\((a+b)^2\\); al partir cada lado en \\(a\\) y \\(b\\) aparecen \\(a^2\\), dos \\(ab\\) y \\(b^2\\).',
    ),
    'ALG-IDN-002': (
        'Vas a ver por qué aparece \\(-2ab\\) y por qué hace falta la corrección \\(+b^2\\).',
        'Partimos de un cuadrado de área \\(a^2\\); al quitar dos franjas \\(ab\\) y corregir \\(+b^2\\) queda \\((a-b)^2\\).',
    ),
    'ALG-IDN-003': (
        'Vas a ver de dónde salen geométricamente \\(a-b\\) y \\(a+b\\), no solo que “cambia la figura”.',
        'Partimos de un cuadrado de lado \\(a\\), retiramos uno de lado \\(b\\) y reordenamos el área restante: queda un rectángulo \\((a-b)(a+b)\\).',
    ),
    'ALG-IDN-008': (
        'Vas a ver cómo la fila \\(n\\) de Pascal y los exponentes \\(a^{n-k}b^k\\) construyen toda la expansión.',
        'Cada término tiene tres partes: un coeficiente binomial, una potencia de \\(a\\) y una potencia de \\(b\\); los exponentes siempre suman \\(n\\).',
    ),
    'ALG-FAC-001': (
        'Vas a ver que factorizar es juntar áreas que comparten un lado, la inversa de distribuir.',
        'Los términos \\(ab\\) y \\(ac\\) comparten el factor \\(a\\); al unir los rectángulos, los anchos \\(b\\) y \\(c\\) se suman.',
    ),
    'ALG-FAC-002': (
        'Vas a ver que factorizar \\(a^2-b^2\\) es rearmar el área sobrante como un rectángulo.',
        'Alterna entre la L \\(a^2-b^2\\) y el rectángulo \\((a-b)(a+b)\\): son las mismas piezas.',
    ),
    'ALG-FAC-003': (
        'Vas a ver que un trinomio cuadrado perfecto se arma como un cuadrado completo.',
        'Ajusta \\(a\\) y \\(b\\) y mira cómo \\(a^2+2ab+b^2\\) es exactamente el área del cuadrado \\((a+b)^2\\).',
    ),
    'ALG-EQU-001': (
        'Vas a ver la diferencia entre la ecuación \\(ax+b=0\\) y la función \\(y=ax+b\\), y que la solución es la intersección con el eje \\(x\\).',
        'Resolver \\(ax+b=0\\) es encontrar el \\(x\\) que anula la expresión; gráficamente, donde \\(y=ax+b\\) cruza el eje \\(x\\).',
    ),
    'ALG-EQU-003': (
        'Vas a ver que las soluciones reales de \\(ax^2+bx+c=0\\) son los \\(x\\) donde \\(y=ax^2+bx+c\\) vale cero, y que \\(\\Delta\\) determina cuántas hay.',
        'Cambia \\(a\\), \\(b\\) y \\(c\\) y relaciona \\(\\Delta\\), la fórmula cuadrática y los cortes de la parábola con el eje \\(x\\).',
    ),
    'ALG-EQU-004': (
        'Vas a ver que \\(\\Delta\\) no calcula las raíces por sí solo, sino que determina si hay dos, una (doble) o ninguna raíz real.',
        'Usa los ejemplos guiados o mueve \\(a\\), \\(b\\) y \\(c\\) y observa cómo el signo de \\(\\Delta\\) fija el caso; la gráfica confirma el número de cortes.',
    ),
    'ALG-EQU-005': (
        'Vas a ver que completar el cuadrado convierte \\(x^2+bx\\) en \\((x+b/2)^2-(b/2)^2\\) añadiendo y compensando la misma área.',
        'Avanza los pasos: dividir \\(bx\\), añadir \\((b/2)^2\\), ver el cuadrado de lado \\(x+b/2\\) y restar la esquina para obtener la identidad.',
    ),
    'ALG-EQU-008': (
        'Vas a ver que \\(|x|=a\\) busca puntos a distancia \\(a\\) del cero: dos si \\(a>0\\), uno si \\(a=0\\), ninguno si \\(a<0\\).',
        'Mueve \\(a\\) e interpreta \\(|x|=a\\) como “distancia al cero igual a \\(a\\)”; observa cuántas soluciones hay según el signo de \\(a\\).',
    ),
    'ALG-INE-001': (
        'Vas a ver que una inecuación lineal simple representa una semirrecta; en casos especiales, todos los reales o ninguna solución.',
        'Cambia \\(a\\), \\(b\\) y el operador: la zona sombreada es la semirrecta solución (o todo \\(\\mathbb{R}\\)/nada si \\(a=0\\)).',
    ),
    'ALG-INE-002': (
        'Vas a ver que la solución es un conjunto de valores de \\(x\\) (intervalos), no un “área del plano”.',
        'Elige la desigualdad y mueve \\(a,b,c\\): usa la parábola para el signo y lee el conjunto solución en la recta.',
    ),
    'ALG-INE-003': (
        'Vas a ver que los ceros del denominador nunca pertenecen a la solución, y que la respuesta es una unión de intervalos.',
        'Identifica los ceros del numerador y del denominador; estos dividen la recta en intervalos de signo constante.',
    ),
    'ALG-INE-004': (
        'Vas a ver que \\(|x|<a\\) y \\(\\le a\\) son soluciones interiores, y que \\(|x|>a\\) y \\(\\ge a\\) son exteriores simétricas.',
        'Elige \\(|x|<a\\), \\(\\le\\), \\(>\\) o \\(\\ge\\) y mueve \\(a\\ge0\\): la recta muestra la región interior o las dos exteriores.',
    ),
    'ALG-SIS-001': (
        'Vas a ver que un sistema \\(2\\times 2\\) puede tener una, ninguna o infinitas soluciones según las pendientes e interceptos.',
        'Mueve \\(m_1,b_1,m_2,b_2\\) y observa si las rectas se cruzan, son paralelas o coinciden.',
    ),
    'ALG-SIS-002': (
        'Vas a ver que el sistema lineal se compacta en \\(Ax=b\\): filas de \\(A\\) son ecuaciones, columnas son variables; \\(\\det(A)\\neq0\\) implica solución única.',
        'Edita \\(A\\) y \\(b\\): compara el sistema tradicional con la forma matricial, la expansión de \\(Ax\\) y el determinante.',
    ),
    'ALG-SIS-003': (
        'Vas a ver que la matriz aumentada \\([A\\mid b]\\) reúne coeficientes y términos independientes: cada fila es una ecuación del sistema.',
        'Elige \\(R_1\\) o \\(R_2\\) y edita \\(A\\) y \\(b\\): ves a la vez la matriz, la fila activa y el sistema completo.',
    ),
    'ALG-SIS-004': (
        'Vas a ver que las operaciones elementales cambian la forma del sistema, pero no su solución: así se construye Gauss y Gauss-Jordan.',
        'Elige \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\) o \\(R_i+cR_j\\) con filas y \\(c\\); aplica y compara el sistema con el original.',
    ),
    'ALG-SIS-005': (
        'Vas a ver el criterio completo: rangos distintos ⇒ sin solución; rangos iguales a \\(n\\) ⇒ una; rangos iguales y menores que \\(n\\) ⇒ infinitas.',
        'Carga los tres casos o edita \\([A\\mid b]\\): observa rank(A), rank([A|b]) y \\(n\\), y sigue las dos comparaciones del criterio.',
    ),
    'ALG-FUN-001': (
        'Vas a ver que el dominio es el conjunto de \\(x\\) para los cuales \\(f(x)\\) está definida, no solo un «hueco» en la gráfica.',
        'Mueve \\(b\\) y observa cómo el valor excluido, la asíntota y el dominio se desplazan juntos (en \\(f(x)=1/(x-b)\\)).',
    ),
    'ALG-FUN-002': (
        'Vas a ver que componer funciones significa usar la salida de una función como entrada de otra.',
        'Mueve \\(x_0\\) y sigue su recorrido: primero entra en \\(g\\), y el resultado \\(g(x_0)\\) entra después en \\(f\\).',
    ),
    'ALG-FUN-003': (
        'Vas a ver que una función inversa deshace la original intercambiando entradas y salidas, y que solo existe (como función) cuando \\(f\\) es inyectiva.',
        'Compara la curva y su reflejo; la diagonal punteada es el espejo \\(y=x\\). Restringe el dominio de \\(x^2\\) cuando no sea inyectiva.',
    ),
    'ALG-FUN-005': (
        'Vas a ver que en \\(y=mx+b\\), \\(m\\) controla la inclinación y \\(b\\) indica dónde corta al eje \\(y\\).',
        'Mueve \\(m\\) y observa la subida respecto al avance. Mueve \\(b\\) y observa cómo la recta se desplaza sin cambiar su inclinación.',
    ),
    'ALG-FUN-006': (
        'Vas a ver que dos rectas no verticales son paralelas cuando tienen la misma pendiente, y perpendiculares cuando sus pendientes son recíprocas y de signo opuesto.',
        'Mueve \\(m_1\\) y \\(m_2\\). Observa cuándo las rectas dejan de cortarse o cuándo forman exactamente \\(90^\\circ\\).',
    ),
    'ALG-FUN-007': (
        'Vas a ver que en \\(g(x)=f(x-h)+k\\), \\(h\\) desplaza horizontalmente y \\(k\\) verticalmente; la forma no cambia.',
        'Mueve \\(h\\) y observa cómo todos los puntos se desplazan. Aunque aparece \\(x-h\\), un \\(h\\) positivo mueve hacia la derecha.',
    ),
    'ALG-FUN-008': (
        'Vas a ver que en \\(g(x)=af(bx)\\), \\(a\\) modifica verticalmente y \\(b\\) horizontalmente; los signos negativos producen reflexiones.',
        'Mueve \\(a\\) y \\(b\\). Atención: el efecto horizontal es inverso. Si \\(|b|=2\\), el ancho se reduce a la mitad.',
    ),
    'ALG-POL-007': (
        'Vas a ver que un polinomio de dos variables recibe un punto \((x,y)\) y le asigna un valor; el color representa \(P(x,y)\).',
        'Mueve el punto sobre el plano para ver cómo cambian \(x\), \(y\) y \(P(x,y)\). Después modifica \(a\), \(b\) y \(c\).',
    ),
    'ALG-POL-008': (
        'Vas a ver que un multiíndice guarda los exponentes de un monomio y que el grado total se obtiene sumando sus componentes.',
        'Cambia los exponentes y observa cómo se actualizan el multiíndice, el monomio y su grado total.',
    ),
    'ALG-POL-009': (
        'Vas a ver que un polinomio es homogéneo cuando todos sus términos tienen el mismo grado total, y entonces \(P(tx,ty)=t^d P(x,y)\).',
        'Mueve \(t\) y observa qué ocurre al escalar simultáneamente \(x\) e \(y\): el valor se multiplica por \(t^2\).',
    ),
    'ALG-POL-010': (
        'Vas a ver que una solución debe satisfacer ambas ecuaciones a la vez: gráficamente donde se cortan las curvas, y algebraicamente donde \(P(x)-Q(x)=0\).',
        'Mueve los coeficientes de \(P\) y \(Q\). Observa cómo las intersecciones aparecen, desaparecen o se desplazan.',
    ),
    'ALG-POL-011': (
        'Vas a ver que la matriz de Sylvester organiza los coeficientes de dos polinomios y que su determinante es la resultante.',
        'Modifica los coeficientes de \(f\) y \(g\). Observa cómo cambia la matriz y su determinante. Cuando la resultante llega a cero, comparten una raíz.',
    ),
    'ALG-LOG-001': (
        'Vas a ver que la exponencial crece (o decrece) multiplicando una y otra vez.',
        'Cambia la base y fíjate: la curva se hace más empinada o más suave.',
    ),
    'ALG-LOG-002': (
        'Vas a ver que el logaritmo responde: “¿a qué exponente elevo la base para obtener \\(x\\)?”.',
        'Compara log y exponencial: son inversas; la diagonal \\(y=x\\) las refleja.',
    ),
    'ALG-LOG-007': (
        'Vas a ver que el signo del exponente decide si la cantidad crece o se apaga.',
        'Mueve \\(k\\) (vía \\(b\\)) y mira si la curva sube o baja con el tiempo.',
    ),
    'ALG-COM-001': (
        'Vas a ver que un complejo \\(a+bi\\) es un punto (o flecha) en el plano.',
        'Arrastra la punta y fíjate: las coordenadas son la parte real e imaginaria.',
    ),
    'ALG-COM-002': (
        'Vas a ver que el conjugado refleja el número respecto del eje real.',
        'Arrastra \\(z\\) y mira la flecha naranja: es el conjugado (misma \\(x\\), \\(y\\) al revés).',
    ),
    'ALG-COM-003': (
        'Vas a ver que el módulo es la longitud de la flecha desde el origen.',
        'Estira o acorta el vector y fíjate: el número \\(r\\) es esa longitud.',
    ),
    'ALG-COM-004': (
        'Vas a ver que en forma polar usas longitud y ángulo en lugar de \\((x,y)\\).',
        'Gira \\(\\theta\\) y mira: el punto se mueve sobre el círculo de radio \\(r\\).',
    ),
    'ALG-COM-005': (
        'Vas a ver que Euler une el ángulo con coseno y seno sobre el círculo unitario.',
        'Mueve \\(\\theta\\) y fíjate: el punto \\((\\cos\\theta,\\sin\\theta)\\) recorre la circunferencia.',
    ),
    'ALG-COM-006': (
        'Vas a ver que elevar a \\(n\\) multiplica el ángulo por \\(n\\) y potencia el radio.',
        'Cambia \\(n\\) y \\(\\theta\\) y mira \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) girando y alejándose según \\(r^n\\).',
    ),
    'ALG-COM-007': (
        'Vas a ver que las raíces \\(n\\)-ésimas se reparte como vértices de un polígono regular.',
        'Cambia \\(n\\) y fíjate: los puntos naranjas se distribuyen en el círculo.',
    ),
    'ALG-SEC-001': (
        'Vas a ver que en una sucesión aritmética cada salto suma la misma cantidad.',
        'Mueve \\(a_1\\) y \\(d\\) y mira: los puntos suben o bajan a pasos constantes.',
    ),
    'ALG-SEC-003': (
        'Vas a ver que en una sucesión geométrica cada término se multiplica por \\(r\\).',
        'Cambia \\(a\\) y \\(r\\) y fíjate: los puntos crecen o se acercan a cero según \\(|r|\\).',
    ),
    'ALG-SEC-005': (
        'Vas a ver que si \\(|r|<1\\), la serie geométrica infinita se acerca a un valor límite.',
        'Prueba \\(|r|<1\\) y \\(|r|\\ge 1\\) y mira si los puntos se estabilizan o se disparan.',
    ),
    'ALG-SEC-007': (
        'Vas a ver que una recurrencia construye cada término a partir de los anteriores.',
        'Cambia los coeficientes y fíjate cómo evoluciona la sucesión punto a punto.',
    ),
    'ALG-VEC-001': (
        'Vas a ver que un vector es una flecha: dirección y longitud.',
        'Arrastra las puntas y mira cómo cambia el vector en el plano.',
    ),
    'ALG-VEC-002': (
        'Vas a ver que la norma es la longitud de la flecha.',
        'Estira \\(u\\) y fíjate: el valor \\(\\|u\\|\\) se actualiza con la longitud.',
    ),
    'ALG-VEC-003': (
        'Vas a ver que el vector unitario tiene longitud 1 y guarda la dirección.',
        'Mueve \\(u\\) y mira la versión normalizada \\(\\hat{u}\\) de longitud 1.',
    ),
    'ALG-VEC-004': (
        'Vas a ver que el producto punto mide alineación: positivo significa ángulo agudo.',
        'Arrastra \\(u\\) y \\(v\\) y mira \\(u\\cdot v\\): si el ángulo es agudo, recto u obtuso; la proyección aparece en naranja.',
    ),
    'ALG-VEC-005': (
        'Vas a ver que el ángulo entre vectores se lee del producto punto.',
        'Mueve las flechas y fíjate: el ángulo y el tipo (agudo/recto/obtuso) se actualizan.',
    ),
    'ALG-VEC-006': (
        'Vas a ver que la distancia entre puntas de vectores es la norma de la diferencia.',
        'Separa \\(u\\) y \\(v\\) y mira: la distancia crece con la separación.',
    ),
    'ALG-VEC-007': (
        'Vas a ver que una combinación lineal mezcla vectores con pesos.',
        'Arrastra \\(u\\) y \\(v\\) y fíjate: la flecha naranja es \\(0.7u+0.5v\\).',
    ),
    'ALG-MAT-001': (
        'Vas a ver que una matriz es una tabla de números organizada en filas y columnas.',
        'Edita las entradas de \\(A\\) y mira: cada celda es un coeficiente del objeto lineal.',
    ),
    'ALG-MAT-002': (
        'Vas a ver que sumar matrices se hace casilla a casilla.',
        'Cambia \\(A\\) y \\(B\\) y fíjate: el resultado \\(A+B\\) se actualiza entrada por entrada.',
    ),
    'ALG-MAT-003': (
        'Vas a ver que multiplicar por un escalar estira o invierte todos los números de la matriz.',
        'Mueve \\(c\\) y mira \\(cA\\): crece, se encoge o cambia de signo.',
    ),
    'ALG-MAT-004': (
        'Vas a ver que cada entrada de \\(AB\\) mezcla una fila de \\(A\\) con una columna de \\(B\\).',
        'Elige una casilla \\((i,j)\\) y mira debajo: ves la cuenta fila×columna paso a paso.',
    ),
    'ALG-MAT-005': (
        'Vas a ver que la identidad deja los vectores igual: es el “1” de las matrices.',
        'Compara \\(A\\) con el efecto de la identidad sobre la base.',
    ),
    'ALG-MAT-006': (
        'Vas a ver que la transpuesta intercambia filas por columnas.',
        'Edita \\(A\\) y mira a la derecha \\(A^T\\): filas y columnas volcadas.',
    ),
    'ALG-MAT-007': (
        'Vas a ver que una matriz simétrica coincide con su transpuesta.',
        'Ajusta \\(A\\) hasta que coincida con \\(A^T\\).',
    ),
    'ALG-DET-001': (
        'Vas a ver que el determinante \\(2\\times 2\\) es el área con signo del paralelogramo de las columnas.',
        'Mueve los vectores y fíjate: el área coloreada es \\(|\\det|\\); el signo indica orientación.',
    ),
    'ALG-DET-002': (
        'Vas a ver que el determinante se puede expandir por una fila o columna (cofactores).',
        'Edita \\(A\\) y mira cómo \\(\\det(A)\\) responde a los cambios.',
    ),
    'ALG-DET-003': (
        'Vas a ver que \\(\\det(AB)=\\det(A)\\det(B)\\): las áreas se multiplican.',
        'Cambia \\(A\\) y \\(B\\) y compara el área del producto con el producto de áreas.',
    ),
    'ALG-DET-004': (
        'Vas a ver que si el área (\\(\\det\\)) es cero, las columnas son paralelas y no hay inversa.',
        'Haz el paralelogramo plano (área \\(\\approx 0\\)) y fíjate: la matriz se vuelve singular.',
    ),
    'ALG-DET-005': (
        'Vas a ver que la inversa “deshace” \\(A\\); existe solo si \\(\\det\\neq 0\\).',
        'Edita \\(A\\) y mira \\(\\det\\): si no es cero, la inversa está bien definida.',
    ),
    'ALG-DET-006': (
        'Vas a ver que Cramer usa determinantes para resolver sistemas pequeños.',
        'Cambia \\(A\\) y \\(b\\) y relaciona \\(\\det(A)\\) con la posibilidad de solución única.',
    ),
    'ALG-ESP-001': (
        'Vas a ver que el espacio generado son todas las mezclas \\(s\\cdot u+t\\cdot v\\).',
        'Mueve \\(s\\) y \\(t\\) y mira la flecha naranja: barre el plano (o la recta) que generan \\(u\\) y \\(v\\).',
    ),
    'ALG-ESP-002': (
        'Vas a ver que si el área del paralelogramo es cero, los vectores son dependientes.',
        'Alinea \\(u\\) y \\(v\\) y fíjate: el indicador pasa a “dependientes”.',
    ),
    'ALG-ESP-003': (
        'Vas a ver que una base es un conjunto independiente que genera todo el espacio.',
        'Activa **Mostrar base** y compara con tus vectores \\(u\\) y \\(v\\).',
    ),
    'ALG-ESP-004': (
        'Vas a ver que las coordenadas dicen cuánto de cada vector de la base necesitas.',
        'Cambia \\(s\\) y \\(t\\): son las coordenadas de la combinación en la base \\(u\\), \\(v\\).',
    ),
    'ALG-ESP-005': (
        'Vas a ver que el rango es cuántas direcciones independientes tiene la matriz.',
        'Edita \\(A\\) y mira el determinante/rango: verás si hay 0, 1 o 2 direcciones.',
    ),
    'ALG-ESP-006': (
        'Vas a ver que la nulidad cuenta soluciones no triviales de \\(Ax=0\\).',
        'Haz columnas dependientes y relaciona con direcciones que van al origen.',
    ),
    'ALG-ESP-007': (
        'Vas a ver que rango + nulidad = número de columnas (en el caso \\(n\\)).',
        'Explora vectores dependientes/independientes y fíjate cómo se reparte la dimensión.',
    ),
    'ALG-TRA-001': (
        'Vas a ver que una transformación lineal respeta sumas y escalados.',
        'Mira la cuadrícula deformada por \\(A\\): las líneas rectas siguen siendo rectas.',
    ),
    'ALG-TRA-002': (
        'Vas a ver que aplicar \\(A\\) es empujar cada punto (y la cuadrícula) a una nueva forma.',
        'Cambia las entradas de \\(A\\) y fíjate: la malla muestra el empujón lineal.',
    ),
    'ALG-TRA-003': (
        'Vas a ver que el núcleo son los vectores que \\(A\\) manda al origen.',
        'Busca direcciones que se aplastan cuando \\(\\det\\) se acerca a cero.',
    ),
    'ALG-TRA-004': (
        'Vas a ver que la imagen son las direcciones que \\(A\\) sí puede alcanzar.',
        'Observa hacia dónde apuntan las columnas transformadas \\(e_1\\) y \\(e_2\\).',
    ),
    'ALG-TRA-005': (
        'Vas a ver que componer transformaciones es aplicar una después de la otra (producto de matrices).',
        'Cambia \\(A\\) y piensa \\(A\\) como un paso de la composición.',
    ),
    'ALG-TRA-006': (
        'Vas a ver que la inversa deshace el empujón de \\(A\\).',
        'Pulsa **Aplicar A⁻¹** (si existe) y mira: la malla vuelve hacia la forma original.',
    ),
    'ALG-TRA-007': (
        'Vas a ver que cambiar de base es describir los mismos vectores con otras coordenadas.',
        'Modifica \\(A\\) como matriz de cambio y fíjate cómo se reorienta la malla.',
    ),
    'ALG-EIG-001': (
        'Vas a ver que un autovector solo se estira o se encoge; no gira hacia otro lado.',
        'Activa **Eigenvectores** y mira las rayas naranjas: marcan esas direcciones especiales.',
    ),
    'ALG-EIG-002': (
        'Vas a ver que la ecuación característica encuentra los valores propios (estiramientos).',
        'Edita \\(A\\) y relaciona \\(\\det(A-\\lambda I)=0\\) con las direcciones que ves en la malla.',
    ),
    'ALG-EIG-003': (
        'Vas a ver que el autoespacio es la recta (o plano) de todos los autovectores de un \\(\\lambda\\).',
        'Observa la dirección naranja asociada a cada valor propio.',
    ),
    'ALG-EIG-004': (
        'Vas a ver que diagonalizar es escribir \\(A\\) en una base de autovectores, donde actúa por escalados.',
        'Con autovectores visibles, imagina ejes donde \\(A\\) solo estira.',
    ),
    'ALG-EIG-005': (
        'Vas a ver que con \\(A=PDP^{-1}\\), potenciar \\(A\\) es potenciar los escalados en la diagonal.',
        'Explora \\(A\\) y sus direcciones propias como atajo para \\(A^n\\).',
    ),
    'ALG-EIG-006': (
        'Vas a ver que en matrices simétricas, los autovectores se pueden elegir ortogonales.',
        'Prueba una \\(A\\) casi simétrica y mira autovectores casi perpendiculares.',
    ),
    'ALG-ORT-001': (
        'Vas a ver que ortogonal significa ángulo recto: el producto punto es cero.',
        'Coloca \\(u\\perp v\\) y fíjate: \\(u\\cdot v\\approx 0\\) y el ángulo se marca como recto.',
    ),
    'ALG-ORT-002': (
        'Vas a ver que la proyección es la sombra de \\(u\\) sobre la dirección de \\(v\\).',
        'Arrastra \\(u\\): el segmento naranja es la proyección; el resto es el error ortogonal.',
    ),
    'ALG-ORT-003': (
        'Vas a ver que una matriz ortogonal rota/refleja sin cambiar longitudes.',
        'Ajusta \\(A\\) hacia una rotación y mira que la malla no se estira de forma desigual.',
    ),
    'ALG-ORT-004': (
        'Vas a ver que Gram–Schmidt convierte vectores en una base ortogonal paso a paso.',
        'Avanza el **Gram-Schmidt paso** y observa la nueva dirección ortogonal.',
    ),
    'ALG-LSQ-001': (
        'Vas a ver que mínimos cuadrados busca el punto del subespacio más cercano al dato.',
        'Mueve los vectores y el punto: la proyección es la mejor aproximación.',
    ),
    'ALG-LSQ-002': (
        'Vas a ver que las ecuaciones normales \\(A^T Ax=A^T b\\) resumen ese problema de proyección.',
        'Edita \\(A\\) y \\(b\\) como datos del ajuste lineal por mínimos cuadrados.',
    ),
    'ALG-LSQ-003': (
        'Vas a ver que la pseudoinversa generaliza la inversa cuando \\(A\\) no es invertible.',
        'Explora \\(A\\) rectangular/singular y piensa en la “mejor” solución aproximada.',
    ),
    'ALG-DEC-001': (
        'Vas a ver que LU parte \\(A\\) en triangular inferior y superior para resolver sistemas más fácil.',
        'Pulsa **Paso LU** y aplica operaciones de fila: te acercas a la forma de la factorización LU.',
    ),
    'ALG-DEC-002': (
        'Vas a ver que QR escribe \\(A\\) como rotación/ortogonal por triangular.',
        'Observa la malla de \\(A\\) como composición de una parte ortogonal y otra triangular.',
    ),
    'ALG-DEC-003': (
        'Vas a ver que la descomposición espectral usa autovalores y autovectores.',
        'Activa **Eigenvectores**: son los ejes de esa descomposición.',
    ),
    'ALG-DEC-004': (
        'Vas a ver que SVD descompone \\(A\\) en rotar → escalar → rotar.',
        'Pulsa el **Paso SVD/QR**: 1) orienta, 2) escala con \\(\\sigma\\), 3) recomponer con \\(A\\).',
    ),
    'ALG-DEC-005': (
        'Vas a ver que quedarte con los \\(\\sigma\\) grandes aproxima \\(A\\) con poco rango.',
        'Baja \\(k\\) con **Rango bajo demo**: la malla usa solo el mayor valor singular.',
    ),
    'ALG-NOR-001': (
        'Vas a ver que una norma matricial mide cuánto puede estirar \\(A\\) a un vector.',
        'Cambia \\(A\\) y fíjate: \\(\\sigma\\) grandes indican estiramientos fuertes en alguna dirección.',
    ),
    'ALG-NOR-002': (
        'Vas a ver que Frobenius mide el “tamaño” de \\(A\\) sumando todas las entradas al cuadrado.',
        'Edita \\(A\\) y relaciona entradas grandes con una norma más grande.',
    ),
    'ALG-NOR-003': (
        'Vas a ver que la norma 1 se liga a sumas de columnas.',
        'Haz una columna mucho mayor y mira: esa norma crece con ella.',
    ),
    'ALG-NOR-004': (
        'Vas a ver que la norma infinito se liga a sumas de filas.',
        'Haz una fila dominante y observa el efecto sobre el tamaño de \\(A\\).',
    ),
    'ALG-NOR-005': (
        'Vas a ver que la norma espectral es el mayor estiramiento (\\(\\sigma_1\\)).',
        'Mira la elipse de valores singulares: el eje largo es ese estiramiento.',
    ),
    'ALG-NOR-006': (
        'Vas a ver que \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\): el tamaño del producto no supera el producto de tamaños.',
        'Compara visualmente cuánto estira \\(A\\) frente a transformaciones encadenadas.',
    ),
    'ALG-NOR-007': (
        'Vas a ver que el número de condición dice si un sistema es sensible a errores.',
        'Haz \\(\\sigma_1\\gg\\sigma_2\\) (\\(k\\) bajo): la malla se aplasta y el problema se vuelve mal condicionado.',
    ),
    'ALG-BOO-001': (
        'Vas a ver que puedes comprobar una identidad lógica fila a fila en la tabla de verdad.',
        'Cambia salidas con el botón: las filas en naranja no coinciden con lo esperado.',
    ),
    'ALG-BOO-002': (
        'Vas a ver que algunas operaciones booleanas se simplifican (idempotencia, complemento).',
        'Alterna \\(A\\) y \\(B\\) y compara la tabla con el resultado en vivo.',
    ),
    'ALG-BOO-003': (
        'Vas a ver que la distributividad también existe en lógica, no solo en álgebra de números.',
        'Revisa la tabla: AND/OR se reparte como en el área \\(a(b+c)\\).',
    ),
    'ALG-BOO-004': (
        'Vas a ver que De Morgan: negar un AND es como un OR de negaciones (y al revés).',
        'Cambia \\(A\\) y \\(B\\): las dos expresiones de cada ley siempre dan el mismo resultado.',
    ),
    'ALG-BOO-005': (
        'Vas a ver que XOR es verdadero cuando \\(A\\) y \\(B\\) son distintos.',
        'Prueba las cuatro combinaciones: solo 01 y 10 dan 1.',
    ),
    'ALG-BOO-006': (
        'Vas a ver que la absorción elimina términos redundantes en expresiones booleanas.',
        'Compara filas de la tabla para ver qué entradas sobran.',
    ),
    'ALG-BOO-007': (
        'Vas a ver que suma de productos escribe la función como ORs de ANDs.',
        'Marca en la tabla las filas donde la salida es 1: esas son tus productos.',
    ),
    'ALG-BOO-008': (
        'Vas a ver que producto de sumas es la forma dual: ANDs de ORs.',
        'Usa la tabla para ver qué cláusulas cubren los ceros de la función.',
    ),
    'ALG-BOO-009': (
        'Vas a ver que dos expresiones son equivalentes si su tabla de verdad coincide.',
        'Edita salidas: si todo queda en ✓, las tablas coinciden.',
    ),
    'ALG-MOD-001': (
        'Vas a ver que \\(a\\) y \\(b\\) son congruentes módulo \\(m\\) si caen en el mismo “tick” del reloj.',
        'Mueve \\(a\\) y \\(b\\): el texto dice si \\(a\\equiv b\\pmod{m}\\) cuando comparten marca.',
    ),
    'ALG-MOD-002': (
        'Vas a ver que sumar y multiplicar módulo \\(m\\) es operar y volver al reloj \\(0\\ldots m-1\\).',
        'Cambia \\(a\\), \\(b\\) y \\(m\\): las marcas muestran \\(a+b\\) y \\(a\\cdot b\\) en el círculo.',
    ),
    'ALG-MOD-003': (
        'Vas a ver que el inverso de \\(a\\) módulo \\(m\\) existe solo si \\(\\gcd(a,m)=1\\).',
        'Prueba varios \\(a\\): si no hay inverso, el texto lo indica.',
    ),
    'ALG-MOD-005': (
        'Vas a ver que el teorema chino combina dos relojes (\\(m\\) y \\(m_2\\)) en una solución \\(x\\).',
        'Ajusta \\(a\\), \\(b\\), \\(m\\) y \\(m_2\\): cuando existe, aparece el \\(x\\) que cumple ambos restos.',
    ),
    'ALG-MOD-006': (
        'Vas a ver que Fermat: si \\(p\\) es primo y \\(p\\) no divide \\(a\\), entonces \\(a^{p-1}\\equiv 1\\pmod{p}\\).',
        'Con \\(m\\) primo, mira \\(a^{p-1}\\) en el caption; debería ser 1 si \\(\\gcd(a,p)=1\\).',
    ),
    'ALG-EST-006': (
        'Vas a ver que en un cuerpo finito, suma y producto se envuelven módulo \\(p\\).',
        'Elige \\(p\\) y abre **Tabla +** / **Tabla ·**; pulsa una celda para ver el resultado e inverso.',
    ),
    'ALG-COD-001': (
        'Vas a ver que un código lineal es un subespacio: sumar palabras de código da otra palabra de código.',
        'Lee la lista de codewords: su suma permanece dentro del conjunto.',
    ),
    'ALG-COD-002': (
        'Vas a ver que la matriz generadora \\(G\\) fabrica palabras de código a partir de mensajes.',
        'Edita bits/entradas y piensa cada fila de \\(G\\) como un patrón base del código.',
    ),
    'ALG-COD-003': (
        'Vas a ver que \\(H\\) comprueba paridad: las palabras válidas cumplen \\(Hc=0\\).',
        'Invierte un bit y relaciona el fallo con un síndrome no nulo (en COD-004).',
    ),
    'ALG-COD-004': (
        'Vas a ver que el síndrome señala (en códigos simples) dónde está el bit erróneo.',
        'Elige la posición del error: el síndrome \\(s\\) cambia al instante.',
    ),
    'ALG-COD-005': (
        'Vas a ver que la distancia de Hamming cuenta en cuántas posiciones difieren dos palabras.',
        'Edita las dos cadenas: los bits distintos se resaltan y \\(d_H\\) se actualiza.',
    ),
    'ALG-COD-006': (
        'Vas a ver que con distancia mínima \\(d\\) puedes detectar/corregir una cantidad limitada de errores.',
        'Mueve \\(d_{\\min}\\): el radio de corrección \\(t=\\lfloor(d-1)/2\\rfloor\\) cambia con él.',
    ),
    'ALG-COD-007': (
        'Vas a ver que la tasa \\(k/n\\) mide cuánta información útil llevas frente a la longitud total.',
        'Ajusta \\(n\\) y \\(k\\): la barra muestra la parte de mensaje frente a la de redundancia.',
    ),
}

COPY_I18N: dict[str, dict[str, tuple[str, str]]] = {
    'en': {
        'ALG-FND-001': (
        "You'll see that order doesn't matter: \\(a+b\\) and \\(b+a\\) add up to the same thing.",
        'Move \\(a\\) and \\(b\\) and compare the two rows: \\(a+b\\) on top, \\(b+a\\) below; both bars stay the same length.',
    ),
        'ALG-FND-002': (
        "You'll see that grouping differently doesn't change the total: \\((a+b)+c\\) and \\(a+(b+c)\\) give the same result.",
        'Move \\(a\\), \\(b\\), and \\(c\\) and compare both rows: the box groups differently, but the total matches.',
    ),
        'ALG-FND-003': (
        "You'll see that \\(a(b+c)\\) is the same area as \\(ab+ac\\).",
        'Move \\(a\\), \\(b\\), and \\(c\\) and compare both panels: one whole rectangle on the left; \\(ab\\) and \\(ac\\) side by side on the right.',
    ),
        'ALG-FND-006': (
        "You'll see that \\(|x|\\) is the distance to zero: it never goes below zero.",
        'Move \\(x\\) left or right and notice: the mark only counts how far you are from the origin.',
    ),
        'ALG-FND-007': (
        "You'll see that the distance between two points is the length of the segment joining them: \\(|a-b|\\).",
        'Move \\(a\\) and \\(b\\) and watch the length between them: that measure is \\(|a-b|\\).',
    ),
        'ALG-POT-001': (
        "You'll see that when you multiply powers with the same base, the exponents add: \\(a^n a^m = a^{n+m}\\).",
        'Change \\(n\\) and \\(m\\) and notice how the blocks of \\(a^n\\) and \\(a^m\\) join into \\(a^{n+m}\\).',
    ),
        'ALG-POT-008': (
        "You'll see that the conjugate helps clear a root from the denominator.",
        'Compare \\(a+\\sqrt{b}\\) with \\(a-\\sqrt{b}\\) and watch their product: the result has no root in the middle.',
    ),
        'ALG-EXP-003': (
        "You'll see why \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) and how \\(adx\\) and \\(bcx\\) add.",
        'Each term of the first polynomial is multiplied by each term of the second; then like powers of \\(x\\) are grouped.',
    ),
        'ALG-IDN-001': (
        "You'll see that the \\(2\\) in \\(2ab\\) comes from two distinct rectangles of area \\(ab\\).",
        'A square of side \\(a+b\\) has area \\((a+b)^2\\); splitting each side into \\(a\\) and \\(b\\) yields \\(a^2\\), two \\(ab\\) and \\(b^2\\).',
    ),
        'ALG-IDN-002': (
        "You'll see why \\(-2ab\\) appears and why the \\(+b^2\\) correction is needed.",
        'We start from a square of area \\(a^2\\); removing two strips \\(ab\\) and correcting with \\(+b^2\\) leaves \\((a-b)^2\\).',
    ),
        'ALG-IDN-003': (
        "You'll see where \\(a-b\\) and \\(a+b\\) come from geometrically, not just that “the figure changes”.",
        'We start from a square of side \\(a\\), remove one of side \\(b\\), and rearrange the remaining area into a rectangle \\((a-b)(a+b)\\).',
    ),
        'ALG-IDN-008': (
        "You'll see how Pascal row \\(n\\) and the exponents \\(a^{n-k}b^k\\) build the full expansion.",
        'Each term has three parts: a binomial coefficient, a power of \\(a\\) and a power of \\(b\\); the exponents always add to \\(n\\).',
    ),
        'ALG-FAC-001': (
        "You'll see that factoring is joining areas that share a side — the inverse of distributing.",
        'The terms \\(ab\\) and \\(ac\\) share the factor \\(a\\); when the rectangles join, widths \\(b\\) and \\(c\\) add.',
    ),
        'ALG-FAC-002': (
        "You'll see that factoring \\(a^2-b^2\\) is rearranging the leftover area into a rectangle.",
        'Switch between the L \\(a^2-b^2\\) and the rectangle \\((a-b)(a+b)\\): they are the same pieces.',
    ),
        'ALG-FAC-003': (
        "You'll see that a perfect-square trinomial builds into a complete square.",
        'Adjust \\(a\\) and \\(b\\) and see how \\(a^2+2ab+b^2\\) is exactly the area of the square \\((a+b)^2\\).',
    ),
        'ALG-EQU-001': (
        "You'll see the difference between the equation \\(ax+b=0\\) and the function \\(y=ax+b\\), and that the solution is the intersection with the \\(x\\)-axis.",
        'Solving \\(ax+b=0\\) means finding the \\(x\\) that makes the expression zero; graphically, where \\(y=ax+b\\) crosses the \\(x\\)-axis.',
    ),
        'ALG-EQU-003': (
        "You'll see that the real solutions of \\(ax^2+bx+c=0\\) are the \\(x\\) where \\(y=ax^2+bx+c\\) is zero, and that \\(\\Delta\\) tells how many there are.",
        'Change \\(a\\), \\(b\\), and \\(c\\) and relate \\(\\Delta\\), the quadratic formula, and where the parabola meets the \\(x\\)-axis.',
    ),
        'ALG-EQU-004': (
        "You'll see that \\(\\Delta\\) does not compute the roots by itself; it tells whether there are two, one (double), or no real roots.",
        'Use the guided examples or move \\(a\\), \\(b\\), and \\(c\\) and watch how the sign of \\(\\Delta\\) fixes the case; the graph confirms the number of cuts.',
    ),
        'ALG-EQU-005': (
        "You'll see that completing the square turns \\(x^2+bx\\) into \\((x+b/2)^2-(b/2)^2\\) by adding and then compensating the same area.",
        'Step through: split \\(bx\\), add \\((b/2)^2\\), see the square of side \\(x+b/2\\), then subtract the corner to get the identity.',
    ),
        'ALG-EQU-008': (
        "You'll see that \\(|x|=a\\) looks for points at distance \\(a\\) from zero: two if \\(a>0\\), one if \\(a=0\\), none if \\(a<0\\).",
        'Move \\(a\\) and read \\(|x|=a\\) as “distance to zero equals \\(a\\)”; watch how many solutions appear by the sign of \\(a\\).',
    ),
        'ALG-INE-001': (
        "You'll see that a simple linear inequality is a ray on the number line; in special cases, all reals or no solution.",
        'Change \\(a\\), \\(b\\), and the operator: the shaded region is the solution ray (or all \\(\\mathbb{R}\\)/empty if \\(a=0\\)).',
    ),
        'ALG-INE-002': (
        "You'll see that the solution is a set of \\(x\\) values (intervals), not a “region of the plane”.",
        'Pick the inequality and move \\(a,b,c\\): use the parabola for the sign and read the solution set on the number line.',
    ),
        'ALG-INE-003': (
        "You'll see that denominator zeros never belong to the solution, and the answer is a union of intervals.",
        'Identify the zeros of the numerator and denominator; they split the line into constant-sign intervals.',
    ),
        'ALG-INE-004': (
        "You'll see that \\(|x|<a\\) and \\(\\le a\\) are interior solutions, and \\(|x|>a\\) and \\(\\ge a\\) are symmetric exterior ones.",
        'Choose \\(|x|<a\\), \\(\\le\\), \\(>\\), or \\(\\ge\\) and move \\(a\\ge0\\): the line shows the interior region or the two exteriors.',
    ),
        'ALG-SIS-001': (
        "You'll see that a \\(2\\times 2\\) system can have one, none, or infinitely many solutions depending on slopes and intercepts.",
        'Move \\(m_1,b_1,m_2,b_2\\) and watch whether the lines cross, are parallel, or coincide.',
    ),
        'ALG-SIS-002': (
        "You'll see that a linear system packs into \\(Ax=b\\): rows of \\(A\\) are equations, columns are variables; \\(\\det(A)\\neq0\\) means a unique solution.",
        'Edit \\(A\\) and \\(b\\): compare the traditional system with the matrix form, the \\(Ax\\) expansion, and the determinant.',
    ),
        'ALG-SIS-003': (
        "You'll see that the augmented matrix \\([A\\mid b]\\) gathers coefficients and right-hand sides: each row is one equation of the system.",
        'Pick \\(R_1\\) or \\(R_2\\) and edit \\(A\\) and \\(b\\): you see the matrix, the active row, and the full system together.',
    ),
        'ALG-SIS-004': (
        "You'll see that elementary row operations change the system's form, not its solution: that's how Gauss and Gauss–Jordan work.",
        "Pick \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\), or \\(R_i+cR_j\\) with rows and \\(c\\); apply and compare with the original system.",
    ),
        'ALG-SIS-005': (
        "You'll see the full criterion: different ranks ⇒ no solution; ranks equal to \\(n\\) ⇒ one; equal ranks less than \\(n\\) ⇒ infinitely many.",
        "Load the three cases or edit \\([A\\mid b]\\): watch rank(A), rank([A|b]) and \\(n\\), and follow the two comparisons.",
    ),
        'ALG-FUN-001': (
        "You'll see that the domain is the set of \\(x\\) for which \\(f(x)\\) is defined—not just a gap in the graph.",
        "Move \\(b\\) and watch the excluded value, asymptote, and domain shift together (for \\(f(x)=1/(x-b)\\)).",
    ),
        'ALG-FUN-002': (
        "You'll see that composing functions means using the output of one function as the input of another.",
        'Move \\(x_0\\) and follow its path: it first enters \\(g\\), then \\(g(x_0)\\) enters \\(f\\).',
    ),
        'ALG-FUN-003': (
        "You'll see that an inverse undoes the original by swapping inputs and outputs, and exists as a function only when \\(f\\) is injective.",
        'Compare the curve and its reflection; the dashed diagonal is the mirror \\(y=x\\). Restrict the domain of \\(x^2\\) when it is not injective.',
    ),
        'ALG-FUN-005': (
        "You'll see that in \\(y=mx+b\\), \\(m\\) controls the slope and \\(b\\) is where the line meets the \\(y\\)-axis.",
        'Move \\(m\\) and watch rise over run. Move \\(b\\) and watch the line shift without changing its slope.',
    ),
        'ALG-FUN-006': (
        "You'll see that two non-vertical lines are parallel when they share the same slope, and perpendicular when their slopes are opposite reciprocals.",
        'Move \\(m_1\\) and \\(m_2\\). Watch when the lines stop intersecting or form exactly \\(90^\\circ\\).',
    ),
        'ALG-FUN-007': (
        "You'll see that in \\(g(x)=f(x-h)+k\\), \\(h\\) shifts horizontally and \\(k\\) vertically; the shape does not change.",
        'Move \\(h\\) and watch every point shift. Even though \\(x-h\\) appears, positive \\(h\\) moves the graph to the right.',
    ),
        'ALG-FUN-008': (
        "You'll see that in \\(g(x)=af(bx)\\), \\(a\\) acts vertically and \\(b\\) horizontally; negative signs produce reflections.",
        'Move \\(a\\) and \\(b\\). Note: the horizontal effect is inverse. If \\(|b|=2\\), the width halves.',
    ),
        'ALG-POL-007': (
        "You'll see that a two-variable polynomial takes a point \((x,y)\) and assigns a value; color represents \(P(x,y)\).",
        "Move the point on the plane to watch \(x\), \(y\), and \(P(x,y)\) change. Then adjust \(a\), \(b\), and \(c\).",
    ),
        'ALG-POL-008': (
        "You'll see that a multi-index stores a monomial's exponents and that total degree is the sum of its components.",
        "Change the exponents and watch the multi-index, monomial, and total degree update together.",
    ),
        'ALG-POL-009': (
        "You'll see that a polynomial is homogeneous when every term has the same total degree, and then \(P(tx,ty)=t^d P(x,y)\).",
        "Move \(t\) and watch simultaneous scaling of \(x\) and \(y\): the value is multiplied by \(t^2\).",
    ),
        'ALG-POL-010': (
        "You'll see that a solution must satisfy both equations at once: graphically at curve intersections, algebraically where \(P(x)-Q(x)=0\).",
        "Move the coefficients of \(P\) and \(Q\). Watch intersections appear, vanish, or shift.",
    ),
        'ALG-POL-011': (
        "You'll see that the Sylvester matrix organizes the coefficients of two polynomials and that its determinant is the resultant.",
        "Change the coefficients of \(f\) and \(g\). Watch the matrix and determinant; when the resultant hits zero, they share a root.",
    ),
        'ALG-LOG-001': (
        "You'll see that the exponential grows (or shrinks) by multiplying again and again.",
        'Change the base and notice: the curve gets steeper or gentler.',
    ),
        'ALG-LOG-002': (
        "You'll see that the logarithm answers: “to what power do I raise the base to get \\(x\\)?”.",
        "Compare log and exponential: they're inverses; the diagonal \\(y=x\\) mirrors them.",
    ),
        'ALG-LOG-007': (
        "You'll see that the sign of the exponent decides whether the quantity grows or fades.",
        'Move \\(k\\) (via \\(b\\)) and watch whether the curve rises or falls over time.',
    ),
        'ALG-COM-001': (
        "You'll see that a complex number \\(a+bi\\) is a point (or arrow) in the plane.",
        'Drag the tip and notice: the coordinates are the real and imaginary parts.',
    ),
        'ALG-COM-002': (
        "You'll see that the conjugate reflects the number across the real axis.",
        "Drag \\(z\\) and watch the orange arrow: that's the conjugate (same \\(x\\), flipped \\(y\\)).",
    ),
        'ALG-COM-003': (
        "You'll see that the modulus is the arrow's length from the origin.",
        'Stretch or shorten the vector and notice: the number \\(r\\) is that length.',
    ),
        'ALG-COM-004': (
        "You'll see that in polar form you use length and angle instead of \\((x,y)\\).",
        'Rotate \\(\\theta\\) and watch: the point moves on the circle of radius \\(r\\).',
    ),
        'ALG-COM-005': (
        "You'll see that Euler links the angle to cosine and sine on the unit circle.",
        'Move \\(\\theta\\) and notice: the point \\((\\cos\\theta,\\sin\\theta)\\) travels the circumference.',
    ),
        'ALG-COM-006': (
        "You'll see that raising to \\(n\\) multiplies the angle by \\(n\\) and powers the radius.",
        'Change \\(n\\) and \\(\\theta\\) and watch \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) spinning and moving out by \\(r^n\\).',
    ),
        'ALG-COM-007': (
        "You'll see that the \\(n\\)th roots sit like vertices of a regular polygon.",
        'Change \\(n\\) and notice: the orange points spread around the circle.',
    ),
        'ALG-SEC-001': (
        "You'll see that in an arithmetic sequence each jump adds the same amount.",
        'Move \\(a_1\\) and \\(d\\) and watch: the points rise or fall in constant steps.',
    ),
        'ALG-SEC-003': (
        "You'll see that in a geometric sequence each term is multiplied by \\(r\\).",
        'Change \\(a\\) and \\(r\\) and notice: the points grow or approach zero depending on \\(|r|\\).',
    ),
        'ALG-SEC-005': (
        "You'll see that if \\(|r|<1\\), the infinite geometric series approaches a limit value.",
        'Try \\(|r|<1\\) and \\(|r|\\ge 1\\) and watch whether the points settle or shoot off.',
    ),
        'ALG-SEC-007': (
        "You'll see that a recurrence builds each term from the previous ones.",
        'Change the coefficients and notice how the sequence evolves point by point.',
    ),
        'ALG-VEC-001': (
        "You'll see that a vector is an arrow: direction and length.",
        'Drag the tips and watch how the vector changes in the plane.',
    ),
        'ALG-VEC-002': (
        "You'll see that the norm is the arrow's length.",
        'Stretch \\(u\\) and notice: the value \\(\\|u\\|\\) updates with the length.',
    ),
        'ALG-VEC-003': (
        "You'll see that the unit vector has length 1 and keeps the direction.",
        'Move \\(u\\) and watch the normalized version \\(\\hat{u}\\) of length 1.',
    ),
        'ALG-VEC-004': (
        "You'll see that the dot product measures alignment: positive means an acute angle.",
        'Drag \\(u\\) and \\(v\\) and watch \\(u\\cdot v\\): whether the angle is acute, right, or obtuse; the projection shows in orange.',
    ),
        'ALG-VEC-005': (
        "You'll see that the angle between vectors is read from the dot product.",
        'Move the arrows and notice: the angle and its type (acute/right/obtuse) update.',
    ),
        'ALG-VEC-006': (
        "You'll see that the distance between vector tips is the norm of the difference.",
        'Separate \\(u\\) and \\(v\\) and watch: the distance grows with the separation.',
    ),
        'ALG-VEC-007': (
        "You'll see that a linear combination mixes vectors with weights.",
        'Drag \\(u\\) and \\(v\\) and notice: the orange arrow is \\(0.7u+0.5v\\).',
    ),
        'ALG-MAT-001': (
        "You'll see that a matrix is a table of numbers arranged in rows and columns.",
        'Edit the entries of \\(A\\) and watch: each cell is a coefficient of the linear object.',
    ),
        'ALG-MAT-002': (
        "You'll see that adding matrices is done cell by cell.",
        'Change \\(A\\) and \\(B\\) and notice: the result \\(A+B\\) updates entry by entry.',
    ),
        'ALG-MAT-003': (
        "You'll see that multiplying by a scalar stretches or flips every number in the matrix.",
        'Move \\(c\\) and watch \\(cA\\): it grows, shrinks, or changes sign.',
    ),
        'ALG-MAT-004': (
        "You'll see that each entry of \\(AB\\) mixes a row of \\(A\\) with a column of \\(B\\).",
        'Pick a cell \\((i,j)\\) and look below: you see the row×column calculation step by step.',
    ),
        'ALG-MAT-005': (
        "You'll see that the identity leaves vectors unchanged: it's the “1” of matrices.",
        "Compare \\(A\\) with the identity's effect on the basis.",
    ),
        'ALG-MAT-006': (
        "You'll see that the transpose swaps rows and columns.",
        'Edit \\(A\\) and look right at \\(A^T\\): rows and columns flipped.',
    ),
        'ALG-MAT-007': (
        "You'll see that a symmetric matrix matches its transpose.",
        'Adjust \\(A\\) until it matches \\(A^T\\).',
    ),
        'ALG-DET-001': (
        "You'll see that the \\(2\\times 2\\) determinant is the signed area of the columns' parallelogram.",
        'Move the vectors and notice: the colored area is \\(|\\det|\\); the sign shows orientation.',
    ),
        'ALG-DET-002': (
        "You'll see that the determinant can be expanded along a row or column (cofactors).",
        'Edit \\(A\\) and watch how \\(\\det(A)\\) responds to the changes.',
    ),
        'ALG-DET-003': (
        "You'll see that \\(\\det(AB)=\\det(A)\\det(B)\\): the areas multiply.",
        "Change \\(A\\) and \\(B\\) and compare the product's area with the product of areas.",
    ),
        'ALG-DET-004': (
        "You'll see that if the area (\\(\\det\\)) is zero, the columns are parallel and there's no inverse.",
        'Flatten the parallelogram (area \\(\\approx 0\\)) and notice: the matrix becomes singular.',
    ),
        'ALG-DET-005': (
        "You'll see that the inverse “undoes” \\(A\\); it exists only if \\(\\det\\neq 0\\).",
        "Edit \\(A\\) and watch \\(\\det\\): if it isn't zero, the inverse is well defined.",
    ),
        'ALG-DET-006': (
        "You'll see that Cramer's rule uses determinants to solve small systems.",
        'Change \\(A\\) and \\(b\\) and relate \\(\\det(A)\\) to whether a unique solution is possible.',
    ),
        'ALG-ESP-001': (
        "You'll see that the span is all mixtures \\(s\\cdot u+t\\cdot v\\).",
        'Move \\(s\\) and \\(t\\) and watch the orange arrow: it sweeps the plane (or line) that \\(u\\) and \\(v\\) generate.',
    ),
        'ALG-ESP-002': (
        "You'll see that if the parallelogram's area is zero, the vectors are dependent.",
        'Align \\(u\\) and \\(v\\) and notice: the indicator switches to “dependent”.',
    ),
        'ALG-ESP-003': (
        "You'll see that a basis is an independent set that spans the whole space.",
        'Turn on **Show basis** and compare with your vectors \\(u\\) and \\(v\\).',
    ),
        'ALG-ESP-004': (
        "You'll see that coordinates tell you how much of each basis vector you need.",
        "Change \\(s\\) and \\(t\\): they're the coordinates of the combination in the basis \\(u\\), \\(v\\).",
    ),
        'ALG-ESP-005': (
        "You'll see that rank is how many independent directions the matrix has.",
        "Edit \\(A\\) and watch the determinant/rank: you'll see whether there are 0, 1, or 2 directions.",
    ),
        'ALG-ESP-006': (
        "You'll see that nullity counts nontrivial solutions of \\(Ax=0\\).",
        'Make columns dependent and relate that to directions that map to the origin.',
    ),
        'ALG-ESP-007': (
        "You'll see that rank + nullity = number of columns (in the \\(n\\) case).",
        'Explore dependent/independent vectors and notice how the dimension splits.',
    ),
        'ALG-TRA-001': (
        "You'll see that a linear transformation respects sums and scalings.",
        'Look at the grid warped by \\(A\\): straight lines stay straight.',
    ),
        'ALG-TRA-002': (
        "You'll see that applying \\(A\\) pushes every point (and the grid) into a new shape.",
        'Change the entries of \\(A\\) and notice: the mesh shows the linear push.',
    ),
        'ALG-TRA-003': (
        "You'll see that the kernel is the vectors that \\(A\\) sends to the origin.",
        'Look for directions that flatten when \\(\\det\\) approaches zero.',
    ),
        'ALG-TRA-004': (
        "You'll see that the image is the directions \\(A\\) can actually reach.",
        'Watch where the transformed columns \\(e_1\\) and \\(e_2\\) point.',
    ),
        'ALG-TRA-005': (
        "You'll see that composing transformations means applying one after the other (matrix product).",
        'Change \\(A\\) and think of \\(A\\) as one step of the composition.',
    ),
        'ALG-TRA-006': (
        "You'll see that the inverse undoes \\(A\\)'s push.",
        'Tap **Apply A⁻¹** (if it exists) and watch: the mesh moves back toward the original shape.',
    ),
        'ALG-TRA-007': (
        "You'll see that a change of basis describes the same vectors with other coordinates.",
        'Edit \\(A\\) as a change-of-basis matrix and notice how the mesh reorients.',
    ),
        'ALG-EIG-001': (
        "You'll see that an eigenvector only stretches or shrinks; it doesn't turn aside.",
        'Turn on **Eigenvectors** and watch the orange rays: they mark those special directions.',
    ),
        'ALG-EIG-002': (
        "You'll see that the characteristic equation finds the eigenvalues (stretch factors).",
        'Edit \\(A\\) and relate \\(\\det(A-\\lambda I)=0\\) to the directions you see in the mesh.',
    ),
        'ALG-EIG-003': (
        "You'll see that the eigenspace is the line (or plane) of all eigenvectors for a \\(\\lambda\\).",
        'Watch the orange direction linked to each eigenvalue.',
    ),
        'ALG-EIG-004': (
        "You'll see that diagonalizing means writing \\(A\\) in an eigenvector basis, where it acts by scaling.",
        'With eigenvectors visible, picture axes where \\(A\\) only stretches.',
    ),
        'ALG-EIG-005': (
        "You'll see that with \\(A=PDP^{-1}\\), powering \\(A\\) means powering the diagonal scalings.",
        'Explore \\(A\\) and its eigen-directions as a shortcut for \\(A^n\\).',
    ),
        'ALG-EIG-006': (
        "You'll see that for symmetric matrices, eigenvectors can be chosen orthogonal.",
        'Try a nearly symmetric \\(A\\) and watch nearly perpendicular eigenvectors.',
    ),
        'ALG-ORT-001': (
        "You'll see that orthogonal means a right angle: the dot product is zero.",
        'Place \\(u\\perp v\\) and notice: \\(u\\cdot v\\approx 0\\) and the angle is marked right.',
    ),
        'ALG-ORT-002': (
        "You'll see that projection is the shadow of \\(u\\) along \\(v\\)'s direction.",
        'Drag \\(u\\): the orange segment is the projection; the rest is the orthogonal error.',
    ),
        'ALG-ORT-003': (
        "You'll see that an orthogonal matrix rotates/reflects without changing lengths.",
        "Tune \\(A\\) toward a rotation and watch that the mesh doesn't stretch unevenly.",
    ),
        'ALG-ORT-004': (
        "You'll see that Gram–Schmidt turns vectors into an orthogonal basis step by step.",
        'Advance the **Gram-Schmidt step** and watch the new orthogonal direction.',
    ),
        'ALG-LSQ-001': (
        "You'll see that least squares looks for the subspace point closest to the data.",
        'Move the vectors and the point: the projection is the best approximation.',
    ),
        'ALG-LSQ-002': (
        "You'll see that the normal equations \\(A^T Ax=A^T b\\) summarize that projection problem.",
        'Edit \\(A\\) and \\(b\\) as data for a linear least-squares fit.',
    ),
        'ALG-LSQ-003': (
        "You'll see that the pseudoinverse generalizes the inverse when \\(A\\) isn't invertible.",
        'Explore a rectangular/singular \\(A\\) and think about the “best” approximate solution.',
    ),
        'ALG-DEC-001': (
        "You'll see that LU splits \\(A\\) into lower and upper triangular to solve systems more easily.",
        'Tap **LU step** and apply row operations: you approach the form LU factorization uses.',
    ),
        'ALG-DEC-002': (
        "You'll see that QR writes \\(A\\) as orthogonal/rotation times triangular.",
        "Watch \\(A\\)'s mesh as a composition of an orthogonal part and a triangular part.",
    ),
        'ALG-DEC-003': (
        "You'll see that spectral decomposition uses eigenvalues and eigenvectors.",
        'Turn on **Eigenvectors**: they are the axes of that decomposition.',
    ),
        'ALG-DEC-004': (
        "You'll see that SVD decomposes \\(A\\) into rotate → scale → rotate.",
        'Tap the **SVD/QR step**: 1) orient, 2) scale with \\(\\sigma\\), 3) reassemble with \\(A\\).',
    ),
        'ALG-DEC-005': (
        "You'll see that keeping the large \\(\\sigma\\) approximates \\(A\\) with low rank.",
        'Lower \\(k\\) with **Low-rank demo**: the mesh uses only the largest singular value.',
    ),
        'ALG-NOR-001': (
        "You'll see that a matrix norm measures how much \\(A\\) can stretch a vector.",
        'Change \\(A\\) and notice: large \\(\\sigma\\) mean strong stretches in some direction.',
    ),
        'ALG-NOR-002': (
        "You'll see that Frobenius measures \\(A\\)'s “size” by summing all squared entries.",
        'Edit \\(A\\) and relate large entries to a larger norm.',
    ),
        'ALG-NOR-003': (
        "You'll see that the 1-norm is tied to column sums.",
        'Make one column much larger and watch: that norm grows with it.',
    ),
        'ALG-NOR-004': (
        "You'll see that the infinity norm is tied to row sums.",
        "Make one row dominant and observe the effect on \\(A\\)'s size.",
    ),
        'ALG-NOR-005': (
        "You'll see that the spectral norm is the largest stretch (\\(\\sigma_1\\)).",
        'Look at the singular-value ellipse: the long axis is that stretch.',
    ),
        'ALG-NOR-006': (
        "You'll see that \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\): the product's size doesn't exceed the product of sizes.",
        'Visually compare how much \\(A\\) stretches versus chained transforms.',
    ),
        'ALG-NOR-007': (
        "You'll see that the condition number tells you if a system is sensitive to errors.",
        'Make \\(\\sigma_1\\gg\\sigma_2\\) (low \\(k\\)): the mesh flattens and the problem becomes ill-conditioned.',
    ),
        'ALG-BOO-001': (
        "You'll see that you can check a logical identity row by row in the truth table.",
        "Change outputs with the button: orange rows don't match what's expected.",
    ),
        'ALG-BOO-002': (
        "You'll see that some Boolean operations simplify (idempotence, complement).",
        'Toggle \\(A\\) and \\(B\\) and compare the table with the live result.',
    ),
        'ALG-BOO-003': (
        "You'll see that distributivity also exists in logic, not only in number algebra.",
        'Check the table: AND/OR spreads like the area \\(a(b+c)\\).',
    ),
        'ALG-BOO-004': (
        "You'll see De Morgan: negating an AND is like an OR of negations (and vice versa).",
        'Change \\(A\\) and \\(B\\): both expressions of each law always give the same result.',
    ),
        'ALG-BOO-005': (
        "You'll see that XOR is true when \\(A\\) and \\(B\\) differ.",
        'Try all four combinations: only 01 and 10 give 1.',
    ),
        'ALG-BOO-006': (
        "You'll see that absorption removes redundant terms in Boolean expressions.",
        'Compare table rows to see which entries are leftover.',
    ),
        'ALG-BOO-007': (
        "You'll see that sum-of-products writes the function as ORs of ANDs.",
        'Mark the table rows where the output is 1: those are your products.',
    ),
        'ALG-BOO-008': (
        "You'll see that product-of-sums is the dual form: ANDs of ORs.",
        "Use the table to see which clauses cover the function's zeros.",
    ),
        'ALG-BOO-009': (
        "You'll see that two expressions are equivalent if their truth tables match.",
        'Edit outputs: if everything stays ✓, the tables match.',
    ),
        'ALG-MOD-001': (
        "You'll see that \\(a\\) and \\(b\\) are congruent mod \\(m\\) if they land on the same clock tick.",
        'Move \\(a\\) and \\(b\\): the text says whether \\(a\\equiv b\\pmod{m}\\) when they share a mark.',
    ),
        'ALG-MOD-002': (
        "You'll see that adding and multiplying mod \\(m\\) means operate, then wrap back to the clock \\(0\\ldots m-1\\).",
        'Change \\(a\\), \\(b\\), and \\(m\\): the marks show \\(a+b\\) and \\(a\\cdot b\\) on the circle.',
    ),
        'ALG-MOD-003': (
        "You'll see that the inverse of \\(a\\) mod \\(m\\) exists only if \\(\\gcd(a,m)=1\\).",
        "Try several \\(a\\): if there's no inverse, the text says so.",
    ),
        'ALG-MOD-005': (
        "You'll see that the Chinese remainder theorem combines two clocks (\\(m\\) and \\(m_2\\)) into one solution \\(x\\).",
        'Adjust \\(a\\), \\(b\\), \\(m\\), and \\(m_2\\): when it exists, you get the \\(x\\) that satisfies both remainders.',
    ),
        'ALG-MOD-006': (
        "You'll see Fermat: if \\(p\\) is prime and \\(p\\) doesn't divide \\(a\\), then \\(a^{p-1}\\equiv 1\\pmod{p}\\).",
        'With prime \\(m\\), look at \\(a^{p-1}\\) in the caption; it should be 1 if \\(\\gcd(a,p)=1\\).',
    ),
        'ALG-EST-006': (
        "You'll see that in a finite field, sum and product wrap around mod \\(p\\).",
        'Pick \\(p\\) and open **Table +** / **Table ·**; tap a cell to see the result and inverse.',
    ),
        'ALG-COD-001': (
        "You'll see that a linear code is a subspace: adding codewords gives another codeword.",
        'Read the codeword list: their sum stays inside the set.',
    ),
        'ALG-COD-002': (
        "You'll see that the generator matrix \\(G\\) builds codewords from messages.",
        'Edit bits/entries and think of each row of \\(G\\) as a base pattern of the code.',
    ),
        'ALG-COD-003': (
        "You'll see that \\(H\\) checks parity: valid words satisfy \\(Hc=0\\).",
        'Flip a bit and relate the failure to a nonzero syndrome (in COD-004).',
    ),
        'ALG-COD-004': (
        "You'll see that the syndrome points (in simple codes) to where the bad bit is.",
        'Pick the error position: the syndrome \\(s\\) changes instantly.',
    ),
        'ALG-COD-005': (
        "You'll see that Hamming distance counts how many positions two words differ in.",
        'Edit the two strings: differing bits highlight and \\(d_H\\) updates.',
    ),
        'ALG-COD-006': (
        "You'll see that with minimum distance \\(d\\) you can detect/correct a limited number of errors.",
        'Move \\(d_{\\min}\\): the correction radius \\(t=\\lfloor(d-1)/2\\rfloor\\) changes with it.',
    ),
        'ALG-COD-007': (
        "You'll see that the rate \\(k/n\\) measures how much useful info you carry versus total length.",
        'Adjust \\(n\\) and \\(k\\): the bar shows message part versus redundancy.',
    ),
    },
    'de': {
        'ALG-FND-001': (
        'Du siehst: Die Reihenfolge spielt keine Rolle — \\(a+b\\) und \\(b+a\\) ergeben dieselbe Summe.',
        'Bewege \(a\) und \(b\) und vergleiche die beiden Zeilen: oben \(a+b\), unten \(b+a\); beide Leisten bleiben gleich lang.',
    ),
        'ALG-FND-002': (
        'Du siehst: Anders gruppieren ändert die Summe nicht — \\((a+b)+c\\) und \\(a+(b+c)\\) sind gleich.',
        'Bewege \(a\), \(b\) und \(c\) und vergleiche beide Zeilen: der Rahmen gruppiert anders, aber die Summe ist gleich.',
    ),
        'ALG-FND-003': (
        'Du siehst: \\(a(b+c)\\) ist dieselbe Fläche wie \\(ab+ac\\).',
        'Bewege \\(a\\), \\(b\\) und \\(c\\) und vergleiche beide Felder: links ein Rechteck, rechts \\(ab\\) und \\(ac\\) getrennt.',
    ),
        'ALG-FND-006': (
        'Du siehst: \\(|x|\\) ist der Abstand zur Null — nie negativ.',
        'Bewege \\(x\\) nach links oder rechts und schau: Die Marke zählt nur, wie weit du vom Ursprung bist.',
    ),
        'ALG-FND-007': (
        'Du siehst: Der Abstand zweier Punkte ist die Länge der Strecke dazwischen: \\(|a-b|\\).',
        'Bewege \\(a\\) und \\(b\\) und schau auf die Länge dazwischen: Das ist \\(|a-b|\\).',
    ),
        'ALG-POT-001': (
        'Du siehst: Beim Multiplizieren von Potenzen gleicher Basis addieren sich die Exponenten: \\(a^n a^m = a^{n+m}\\).',
        'Ändere \\(n\\) und \\(m\\) und schau, wie die Blöcke von \\(a^n\\) und \\(a^m\\) zu \\(a^{n+m}\\) werden.',
    ),
        'ALG-POT-008': (
        'Du siehst: Das Konjugierte hilft, eine Wurzel aus dem Nenner zu entfernen.',
        'Vergleiche \\(a+\\sqrt{b}\\) mit \\(a-\\sqrt{b}\\) und schau ihr Produkt: Das Ergebnis hat keine Wurzel in der Mitte.',
    ),
        'ALG-EXP-003': (
        'Du siehst, warum \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) gilt und wie \\(adx\\) und \\(bcx\\) sich addieren.',
        'Jeder Term des ersten Polynoms wird mit jedem Term des zweiten multipliziert; danach werden gleiche Potenzen von \\(x\\) zusammengefasst.',
    ),
        'ALG-IDN-001': (
        'Du siehst, dass die \\(2\\) in \\(2ab\\) von zwei verschiedenen Rechtecken der Fläche \\(ab\\) kommt.',
        'Ein Quadrat der Seite \\(a+b\\) hat Fläche \\((a+b)^2\\); teilt man jede Seite in \\(a\\) und \\(b\\), entstehen \\(a^2\\), zwei \\(ab\\) und \\(b^2\\).',
    ),
        'ALG-IDN-002': (
        'Du siehst, warum \\(-2ab\\) erscheint und warum die Korrektur \\(+b^2\\) nötig ist.',
        'Wir starten mit einem Quadrat der Fläche \\(a^2\\); nach Entfernen zweier Streifen \\(ab\\) und Korrektur \\(+b^2\\) bleibt \\((a-b)^2\\).',
    ),
        'ALG-IDN-003': (
        'Du siehst: \\(a^2-b^2\\) ist die Fläche, die bleibt, wenn du ein kleines Quadrat aus einem großen nimmst.',
        'Tippe, um von \\(a^2-b^2\\) zum Rechteck \\((a-b)(a+b)\\) zu gehen, und schau: Es ist dieselbe Menge.',
    ),
        'ALG-IDN-008': (
        'Du siehst: Die Binomialkoeffizienten sind die Pascal-Zeile.',
        'Ändere \\(n\\) und schau die Pascal-Zahlen: So entsteht \\((a+b)^n\\).',
    ),
        'ALG-FAC-001': (
        'Du siehst: Gemeinsamen Faktor ausklammern heißt Flächen mit gemeinsamer Seite neu zu ordnen.',
        'Bewege \\(a\\), \\(b\\) und \\(c\\) und vergleiche beide Felder: \\(a\\) ausklammern heißt \\(ab\\) und \\(ac\\) zu einem Rechteck zu fügen.',
    ),
        'ALG-FAC-002': (
        'Du siehst: \\(a^2-b^2\\) zu faktorisieren heißt die Restfläche zum Rechteck umzubauen.',
        'Wechsle zwischen \\(a^2-b^2\\) und \\((a-b)(a+b)\\) und schau: Es ist dasselbe.',
    ),
        'ALG-FAC-003': (
        'Du siehst: Ein vollständiges Quadrat-Trinom baut sich zu einem ganzen Quadrat.',
        'Stelle \\(a\\) und \\(b\\) so ein, bis du das Muster \\((a\\pm b)^2\\) in den Teilen siehst.',
    ),
        'ALG-EQU-001': (
        'Du siehst: Eine lineare Gleichung ist eine Gerade — die Lösung ist der Schnitt mit der \\(x\\)-Achse.',
        'Bewege Steigung und Achsenabschnitt und suche, wo die Gerade die horizontale Achse kreuzt.',
    ),
        'ALG-EQU-003': (
        'Du siehst: Die Parabel trifft die \\(x\\)-Achse an den Lösungen (falls es welche gibt).',
        'Ändere \\(a\\), \\(b\\) und \\(c\\) und schau auf die Diskriminante \\(\\Delta\\) und die orangenen Wurzelmarken.',
    ),
        'ALG-EQU-004': (
        'Du siehst: Die Diskriminante \\(\\Delta\\) sagt dir, wie viele reelle Wurzeln die Quadratische hat.',
        'Stelle \\(a\\), \\(b\\) und \\(c\\) ein und schau, ob es laut \\(\\Delta\\) 2, 1 oder keine reelle Wurzel gibt.',
    ),
        'ALG-EQU-005': (
        'Du siehst: Quadratisch ergänzen heißt die fehlende Ecke hinzuzufügen (und wieder abzuziehen).',
        'Tippe auf **(b/2)² hinzufügen** oder **(b/2)² abziehen** und schau, woher \\(\\left(b/2\\right)^2\\) kommt.',
    ),
        'ALG-EQU-008': (
        'Du siehst: Eine Betragsgleichung hat oft zwei symmetrische Lösungen.',
        'Bewege den Punkt auf der Geraden und verknüpfe die Abstände mit den Lösungen.',
    ),
        'ALG-INE-001': (
        'Du siehst: Eine lineare Ungleichung malt einen Strahl oder ein Intervall auf der Zahlengeraden.',
        'Ändere Grenze und Ungleichungstyp: Der schattierte Bereich ist deine Lösung.',
    ),
        'ALG-INE-002': (
        'Du siehst: Die Lösung einer quadratischen Ungleichung liegt dort, wo die Parabel über (oder unter) der Achse ist.',
        'Stelle die Parabel ein und schau auf den schattierten Bereich: Er markiert die \\(x\\), die die Ungleichung erfüllen.',
    ),
        'ALG-INE-003': (
        'Du siehst: Bei rationalen Ungleichungen musst du Punkte beachten, wo der Nenner null ist.',
        'Bewege die Grenze und schau, welcher Teil der Geraden erlaubt bleibt.',
    ),
        'ALG-INE-004': (
        'Du siehst: Betrag in Ungleichungen definiert zentrierte oder äußere Intervalle.',
        'Ändere den Radius und tippe auf **Geschlossene Enden**, um zu sehen, wie sich das Lösungsintervall öffnet oder schließt.',
    ),
        'ALG-SIS-001': (
        'Du siehst: Ein \\(2\\times 2\\)-System sind zwei Geraden — die Lösung ist ihr Schnitt (falls sie sich treffen).',
        'Bewege die Steigung und schau auf den orangenen Punkt: Er markiert den Schnitt, oder du siehst, dass sie parallel sind.',
    ),
        'ALG-SIS-002': (
        'Du siehst: Ein lineares System verdichtet sich zu \\(Ax=b\\): Zeilen von \\(A\\) sind Gleichungen, Spalten sind Variablen; \\(\\det(A)\\neq0\\) heißt eindeutige Lösung.',
        'Editiere \\(A\\) und \\(b\\): vergleiche das klassische System mit der Matrixform, der \\(Ax\\)-Entwicklung und der Determinante.',
    ),
        'ALG-SIS-003': (
        'Du siehst: Die erweiterte Matrix \\([A\\mid b]\\) sammelt Koeffizienten und rechte Seiten: jede Zeile ist eine Gleichung des Systems.',
        'Wähle \\(R_1\\) oder \\(R_2\\) und editiere \\(A\\) und \\(b\\): du siehst Matrix, aktive Zeile und das ganze System zusammen.',
    ),
        'ALG-SIS-004': (
        'Du siehst: Elementare Zeilenoperationen ändern die Form des Systems, nicht die Lösung — so entstehen Gauß und Gauß–Jordan.',
        'Wähle \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\) oder \\(R_i+cR_j\\) mit Zeilen und \\(c\\); wende an und vergleiche mit dem Originalsystem.',
    ),
        'ALG-SIS-005': (
        'Du siehst das volle Kriterium: verschiedene Ränge ⇒ keine Lösung; Ränge gleich \\(n\\) ⇒ eine; gleiche Ränge kleiner als \\(n\\) ⇒ unendlich viele.',
        'Lade die drei Fälle oder editiere \\([A\\mid b]\\): schau rank(A), rank([A|b]) und \\(n\\), und folge den zwei Vergleichen.',
    ),
        'ALG-FUN-001': (
        'Du siehst: Der Definitionsbereich ist die Menge der \\(x\\), für die \\(f(x)\\) definiert ist—not nur ein Loch im Graphen.',
        'Bewege \\(b\\) und beobachte, wie ausgeschlossener Wert, Asymptote und Definitionsbereich sich gemeinsam verschieben.',
    ),
        'ALG-FUN-002': (
        'Du siehst: Funktionen zu verknüpfen heißt eine nach der anderen anzuwenden.',
        'Bewege \\(x_0\\) und die Parameter und schau: Der angezeigte Wert ist \\(f(g(x))\\).',
    ),
        'ALG-FUN-003': (
        'Du siehst: Die Umkehrfunktion „macht die Funktion rückgängig“ — ihre Graphen sind symmetrisch zu \\(y=x\\).',
        'Vergleiche Kurve und Umkehrfunktion; die gestrichelte Diagonale ist der Spiegel \\(y=x\\).',
    ),
        'ALG-FUN-005': (
        'Du siehst: Eine Gerade ist durch Steigung und \\(y\\)-Achsenabschnitt bestimmt.',
        'Bewege \\(m\\) und \\(b\\) und schau: Die Gerade kippt und verschiebt sich sofort.',
    ),
        'ALG-FUN-006': (
        'Du siehst: Parallele Geraden haben dieselbe Steigung; senkrechte haben negative reziproke Steigungen.',
        'Stelle beide Geraden ein und schau, wann sie sich nicht treffen oder rechtwinklig kreuzen.',
    ),
        'ALG-FUN-007': (
        'Du siehst: Verschieben eines Graphen heißt ihn zu bewegen, ohne ihn zu verformen.',
        'Bewege \\(h\\) und \\(k\\) und schau, wie die Kurve horizontal und vertikal wandert.',
    ),
        'ALG-FUN-008': (
        'Du siehst: Skalieren und Spiegeln strecken, stauchen oder klappen die Kurve um.',
        'Ändere \\(a\\) und tippe auf **Horizontale Spiegelung**: Schau, wie sich die Welle gegenüber dem Original verformt.',
    ),
        'ALG-POL-007': (
        'Du siehst: Ein Polynom in zwei Variablen weist jedem Punkt \\((x,y)\\) einen Wert zu.',
        'Bewege \\(a\\), \\(b\\) und \\(c\\) und schau: Die Farbkarte zeigt \\(z=ax^2+bxy+cy^2\\).',
    ),
        'ALG-POL-008': (
        'Du siehst: Der Gesamtgrad addiert die Exponenten jeder Variablen.',
        'Ändere \\(\\alpha\\) und \\(\\beta\\) und schau auf das Rechteck: Es zeigt den Grad \\(\\alpha+\\beta\\) von \\(x^{\\alpha}y^{\\beta}\\).',
    ),
        'ALG-POL-009': (
        'Du siehst: Bei einem homogenen Polynom skaliert das Skalieren von \\((x,y)\\) das Ergebnis vorhersehbar.',
        'Aktiviere die **homogene Form** und bewege \\(t\\): Vergleiche \\(P(tx,ty)\\) mit \\(t^d P(x,y)\\).',
    ),
        'ALG-POL-010': (
        'Du siehst: Ein Polynomsystem sieht aus wie Kurven, die sich in den Lösungen schneiden.',
        'Stelle die Parameter ein und suche die Kreuzungen der beiden Kurven.',
    ),
        'ALG-POL-011': (
        'Du siehst: Die Resultante bündelt Bedingungen für gemeinsame Wurzeln in einer Matrix.',
        'Editiere die Matrix und schau auf die Determinante: Sie signalisiert gemeinsame Wurzeln.',
    ),
        'ALG-LOG-001': (
        'Du siehst: Die Exponentialfunktion wächst (oder schrumpft), indem sie immer wieder multipliziert.',
        'Ändere die Basis und schau: Die Kurve wird steiler oder flacher.',
    ),
        'ALG-LOG-002': (
        'Du siehst: Der Logarithmus antwortet: „Mit welchem Exponenten erhebe ich die Basis, um \\(x\\) zu bekommen?“.',
        'Vergleiche Log und Exponential: Sie sind Umkehrungen; die Diagonale \\(y=x\\) spiegelt sie.',
    ),
        'ALG-LOG-007': (
        'Du siehst: Das Vorzeichen des Exponenten entscheidet, ob die Größe wächst oder abklingt.',
        'Bewege \\(k\\) (über \\(b\\)) und schau, ob die Kurve mit der Zeit steigt oder fällt.',
    ),
        'ALG-COM-001': (
        'Du siehst: Eine komplexe Zahl \\(a+bi\\) ist ein Punkt (oder Pfeil) in der Ebene.',
        'Ziehe die Spitze und schau: Die Koordinaten sind Real- und Imaginärteil.',
    ),
        'ALG-COM-002': (
        'Du siehst: Das Konjugierte spiegelt die Zahl an der reellen Achse.',
        'Ziehe \\(z\\) und schau auf den orangenen Pfeil: Das ist das Konjugierte (gleiche \\(x\\), umgedrehte \\(y\\)).',
    ),
        'ALG-COM-003': (
        'Du siehst: Der Betrag ist die Länge des Pfeils vom Ursprung.',
        'Dehne oder verkürze den Vektor und schau: Die Zahl \\(r\\) ist diese Länge.',
    ),
        'ALG-COM-004': (
        'Du siehst: In Polarform nutzt du Länge und Winkel statt \\((x,y)\\).',
        'Drehe \\(\\theta\\) und schau: Der Punkt wandert auf dem Kreis mit Radius \\(r\\).',
    ),
        'ALG-COM-005': (
        'Du siehst: Euler verbindet den Winkel mit Kosinus und Sinus auf dem Einheitskreis.',
        'Bewege \\(\\theta\\) und schau: Der Punkt \\((\\cos\\theta,\\sin\\theta)\\) läuft auf dem Kreis.',
    ),
        'ALG-COM-006': (
        'Du siehst: Hoch \\(n\\) multipliziert den Winkel mit \\(n\\) und potenziert den Radius.',
        'Ändere \\(n\\) und \\(\\theta\\) und schau \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) drehen und nach \\(r^n\\) nach außen wandern.',
    ),
        'ALG-COM-007': (
        'Du siehst: Die \\(n\\)-ten Wurzeln sitzen wie Ecken eines regelmäßigen Vielecks.',
        'Ändere \\(n\\) und schau: Die orangenen Punkte verteilen sich auf dem Kreis.',
    ),
        'ALG-SEC-001': (
        'Du siehst: In einer arithmetischen Folge addiert jeder Sprung denselben Betrag.',
        'Bewege \\(a_1\\) und \\(d\\) und schau: Die Punkte steigen oder fallen in konstanten Schritten.',
    ),
        'ALG-SEC-003': (
        'Du siehst: In einer geometrischen Folge wird jeder Term mit \\(r\\) multipliziert.',
        'Ändere \\(a\\) und \\(r\\) und schau: Die Punkte wachsen oder nähern sich null je nach \\(|r|\\).',
    ),
        'ALG-SEC-005': (
        'Du siehst: Wenn \\(|r|<1\\), nähert sich die unendliche geometrische Reihe einem Grenzwert.',
        'Probiere \\(|r|<1\\) und \\(|r|\\ge 1\\) und schau, ob die Punkte sich stabilisieren oder davonfliegen.',
    ),
        'ALG-SEC-007': (
        'Du siehst: Eine Rekursion baut jeden Term aus den vorherigen.',
        'Ändere die Koeffizienten und schau, wie die Folge Punkt für Punkt läuft.',
    ),
        'ALG-VEC-001': (
        'Du siehst: Ein Vektor ist ein Pfeil — Richtung und Länge.',
        'Ziehe die Spitzen und schau, wie sich der Vektor in der Ebene ändert.',
    ),
        'ALG-VEC-002': (
        'Du siehst: Die Norm ist die Länge des Pfeils.',
        'Dehne \\(u\\) und schau: Der Wert \\(\\|u\\|\\) aktualisiert sich mit der Länge.',
    ),
        'ALG-VEC-003': (
        'Du siehst: Der Einheitsvektor hat Länge 1 und behält die Richtung.',
        'Bewege \\(u\\) und schau die normalisierte Version \\(\\hat{u}\\) der Länge 1.',
    ),
        'ALG-VEC-004': (
        'Du siehst: Das Skalarprodukt misst Ausrichtung — positiv heißt spitzer Winkel.',
        'Ziehe \\(u\\) und \\(v\\) und schau \\(u\\cdot v\\): ob der Winkel spitz, recht oder stumpf ist; die Projektion erscheint orange.',
    ),
        'ALG-VEC-005': (
        'Du siehst: Den Winkel zwischen Vektoren liest du aus dem Skalarprodukt.',
        'Bewege die Pfeile und schau: Winkel und Typ (spitz/recht/stumpf) aktualisieren sich.',
    ),
        'ALG-VEC-006': (
        'Du siehst: Der Abstand zwischen Vektorspitzen ist die Norm der Differenz.',
        'Trenne \\(u\\) und \\(v\\) und schau: Der Abstand wächst mit dem Abstand.',
    ),
        'ALG-VEC-007': (
        'Du siehst: Eine Linearkombination mischt Vektoren mit Gewichten.',
        'Ziehe \\(u\\) und \\(v\\) und schau: Der orangene Pfeil ist \\(0.7u+0.5v\\).',
    ),
        'ALG-MAT-001': (
        'Du siehst: Eine Matrix ist eine Zahlentabelle in Zeilen und Spalten.',
        'Editiere die Einträge von \\(A\\) und schau: Jede Zelle ist ein Koeffizient des linearen Objekts.',
    ),
        'ALG-MAT-002': (
        'Du siehst: Matrizen addiert man Zelle für Zelle.',
        'Ändere \\(A\\) und \\(B\\) und schau: Das Ergebnis \\(A+B\\) aktualisiert sich Eintrag für Eintrag.',
    ),
        'ALG-MAT-003': (
        'Du siehst: Multiplikation mit einem Skalar streckt oder dreht alle Zahlen der Matrix um.',
        'Bewege \\(c\\) und schau \\(cA\\): Es wächst, schrumpft oder wechselt das Vorzeichen.',
    ),
        'ALG-MAT-004': (
        'Du siehst: Jeder Eintrag von \\(AB\\) mischt eine Zeile von \\(A\\) mit einer Spalte von \\(B\\).',
        'Wähle eine Zelle \\((i,j)\\) und schau darunter: Du siehst die Zeile×Spalte-Rechnung Schritt für Schritt.',
    ),
        'ALG-MAT-005': (
        'Du siehst: Die Einheitsmatrix lässt Vektoren gleich — sie ist die „1“ der Matrizen.',
        'Vergleiche \\(A\\) mit der Wirkung der Einheitsmatrix auf die Basis.',
    ),
        'ALG-MAT-006': (
        'Du siehst: Die Transponierte tauscht Zeilen und Spalten.',
        'Editiere \\(A\\) und schau rechts \\(A^T\\): Zeilen und Spalten umgedreht.',
    ),
        'ALG-MAT-007': (
        'Du siehst: Eine symmetrische Matrix stimmt mit ihrer Transponierten überein.',
        'Stelle \\(A\\) so ein, dass sie mit \\(A^T\\) übereinstimmt.',
    ),
        'ALG-DET-001': (
        'Du siehst: Die \\(2\\times 2\\)-Determinante ist die orientierte Fläche des Spalten-Parallelogramms.',
        'Bewege die Vektoren und schau: Die gefärbte Fläche ist \\(|\\det|\\); das Vorzeichen zeigt die Orientierung.',
    ),
        'ALG-DET-002': (
        'Du siehst: Die Determinante lässt sich nach einer Zeile oder Spalte entwickeln (Kofaktoren).',
        'Editiere \\(A\\) und schau, wie \\(\\det(A)\\) auf die Änderungen reagiert.',
    ),
        'ALG-DET-003': (
        'Du siehst: \\(\\det(AB)=\\det(A)\\det(B)\\) — die Flächen multiplizieren sich.',
        'Ändere \\(A\\) und \\(B\\) und vergleiche die Fläche des Produkts mit dem Produkt der Flächen.',
    ),
        'ALG-DET-004': (
        'Du siehst: Ist die Fläche (\\(\\det\\)) null, sind die Spalten parallel und es gibt keine Inverse.',
        'Mache das Parallelogramm flach (Fläche \\(\\approx 0\\)) und schau: Die Matrix wird singulär.',
    ),
        'ALG-DET-005': (
        'Du siehst: Die Inverse „macht \\(A\\) rückgängig“; sie existiert nur, wenn \\(\\det\\neq 0\\).',
        'Editiere \\(A\\) und schau auf \\(\\det\\): Ist sie nicht null, ist die Inverse wohldefiniert.',
    ),
        'ALG-DET-006': (
        'Du siehst: Cramer nutzt Determinanten, um kleine Systeme zu lösen.',
        'Ändere \\(A\\) und \\(b\\) und verknüpfe \\(\\det(A)\\) mit der Möglichkeit einer eindeutigen Lösung.',
    ),
        'ALG-ESP-001': (
        'Du siehst: Der Spannraum sind alle Mischungen \\(s\\cdot u+t\\cdot v\\).',
        'Bewege \\(s\\) und \\(t\\) und schau auf den orangenen Pfeil: Er überstreicht die Ebene (oder Gerade), die \\(u\\) und \\(v\\) erzeugen.',
    ),
        'ALG-ESP-002': (
        'Du siehst: Ist die Fläche des Parallelogramms null, sind die Vektoren abhängig.',
        'Richte \\(u\\) und \\(v\\) aus und schau: Der Indikator wechselt zu „abhängig“.',
    ),
        'ALG-ESP-003': (
        'Du siehst: Eine Basis ist eine unabhängige Menge, die den ganzen Raum aufspannt.',
        'Aktiviere **Basis anzeigen** und vergleiche mit deinen Vektoren \\(u\\) und \\(v\\).',
    ),
        'ALG-ESP-004': (
        'Du siehst: Koordinaten sagen, wie viel von jedem Basisvektor du brauchst.',
        'Ändere \\(s\\) und \\(t\\): Das sind die Koordinaten der Kombination in der Basis \\(u\\), \\(v\\).',
    ),
        'ALG-ESP-005': (
        'Du siehst: Der Rang ist, wie viele unabhängige Richtungen die Matrix hat.',
        'Editiere \\(A\\) und schau auf Determinante/Rang: Du siehst, ob es 0, 1 oder 2 Richtungen gibt.',
    ),
        'ALG-ESP-006': (
        'Du siehst: Die Nullität zählt nichttriviale Lösungen von \\(Ax=0\\).',
        'Mache Spalten abhängig und verknüpfe das mit Richtungen, die in den Ursprung gehen.',
    ),
        'ALG-ESP-007': (
        'Du siehst: Rang + Nullität = Anzahl der Spalten (im Fall \\(n\\)).',
        'Erkunde abhängige/unabhängige Vektoren und schau, wie sich die Dimension aufteilt.',
    ),
        'ALG-TRA-001': (
        'Du siehst: Eine lineare Abbildung respektiert Summen und Skalierungen.',
        'Schau auf das von \\(A\\) verzerrte Gitter: Gerade Linien bleiben gerade.',
    ),
        'ALG-TRA-002': (
        'Du siehst: \\(A\\) anzuwenden heißt, jeden Punkt (und das Gitter) in eine neue Form zu schieben.',
        'Ändere die Einträge von \\(A\\) und schau: Das Netz zeigt den linearen Schub.',
    ),
        'ALG-TRA-003': (
        'Du siehst: Der Kern sind die Vektoren, die \\(A\\) in den Ursprung schickt.',
        'Suche Richtungen, die sich abflachen, wenn \\(\\det\\) gegen null geht.',
    ),
        'ALG-TRA-004': (
        'Du siehst: Das Bild sind die Richtungen, die \\(A\\) wirklich erreichen kann.',
        'Schau, wohin die transformierten Spalten \\(e_1\\) und \\(e_2\\) zeigen.',
    ),
        'ALG-TRA-005': (
        'Du siehst: Abbildungen zu verknüpfen heißt eine nach der anderen anzuwenden (Matrixprodukt).',
        'Ändere \\(A\\) und denke \\(A\\) als einen Schritt der Verknüpfung.',
    ),
        'ALG-TRA-006': (
        'Du siehst: Die Inverse macht den Schub von \\(A\\) rückgängig.',
        'Tippe auf **A⁻¹ anwenden** (falls vorhanden) und schau: Das Netz kehrt zur ursprünglichen Form zurück.',
    ),
        'ALG-TRA-007': (
        'Du siehst: Basiswechsel heißt dieselben Vektoren mit anderen Koordinaten zu beschreiben.',
        'Ändere \\(A\\) als Wechselmatrix und schau, wie sich das Netz neu ausrichtet.',
    ),
        'ALG-EIG-001': (
        'Du siehst: Ein Eigenvektor wird nur gestreckt oder gestaucht — er dreht nicht seitwärts.',
        'Aktiviere **Eigenvektoren** und schau auf die orangenen Strahlen: Sie markieren diese besonderen Richtungen.',
    ),
        'ALG-EIG-002': (
        'Du siehst: Die charakteristische Gleichung findet die Eigenwerte (Streckfaktoren).',
        'Editiere \\(A\\) und verknüpfe \\(\\det(A-\\lambda I)=0\\) mit den Richtungen im Netz.',
    ),
        'ALG-EIG-003': (
        'Du siehst: Der Eigenraum ist die Gerade (oder Ebene) aller Eigenvektoren zu einem \\(\\lambda\\).',
        'Schau auf die orangene Richtung zu jedem Eigenwert.',
    ),
        'ALG-EIG-004': (
        'Du siehst: Diagonalisieren heißt \\(A\\) in einer Eigenvektorbasis zu schreiben, wo sie nur skaliert.',
        'Mit sichtbaren Eigenvektoren stell dir Achsen vor, auf denen \\(A\\) nur streckt.',
    ),
        'ALG-EIG-005': (
        'Du siehst: Mit \\(A=PDP^{-1}\\) heißt \\(A\\) potenzieren, die Skalierungen auf der Diagonalen zu potenzieren.',
        'Erkunde \\(A\\) und seine Eigenrichtungen als Abkürzung für \\(A^n\\).',
    ),
        'ALG-EIG-006': (
        'Du siehst: Bei symmetrischen Matrizen kannst du Eigenvektoren orthogonal wählen.',
        'Probiere eine fast symmetrische \\(A\\) und schau auf fast senkrechte Eigenvektoren.',
    ),
        'ALG-ORT-001': (
        'Du siehst: Orthogonal heißt rechter Winkel — das Skalarprodukt ist null.',
        'Stelle \\(u\\perp v\\) und schau: \\(u\\cdot v\\approx 0\\) und der Winkel ist als recht markiert.',
    ),
        'ALG-ORT-002': (
        'Du siehst: Die Projektion ist der Schatten von \\(u\\) in Richtung von \\(v\\).',
        'Ziehe \\(u\\): Das orangene Segment ist die Projektion; der Rest ist der orthogonale Fehler.',
    ),
        'ALG-ORT-003': (
        'Du siehst: Eine orthogonale Matrix dreht/spiegelt, ohne Längen zu ändern.',
        'Stelle \\(A\\) Richtung Rotation ein und schau, dass das Netz nicht ungleichmäßig streckt.',
    ),
        'ALG-ORT-004': (
        'Du siehst: Gram–Schmidt macht aus Vektoren Schritt für Schritt eine orthogonale Basis.',
        'Gehe den **Gram-Schmidt Schritt** weiter und schau die neue orthogonale Richtung.',
    ),
        'ALG-LSQ-001': (
        'Du siehst: Kleinste Quadrate suchen den Punkt im Unterraum, der den Daten am nächsten ist.',
        'Bewege die Vektoren und den Punkt: Die Projektion ist die beste Näherung.',
    ),
        'ALG-LSQ-002': (
        'Du siehst: Die Normalgleichungen \\(A^T Ax=A^T b\\) fassen dieses Projektionsproblem zusammen.',
        'Editiere \\(A\\) und \\(b\\) als Daten für die lineare Ausgleichsrechnung.',
    ),
        'ALG-LSQ-003': (
        'Du siehst: Die Pseudoinverse verallgemeinert die Inverse, wenn \\(A\\) nicht invertierbar ist.',
        'Erkunde eine rechteckige/singuläre \\(A\\) und denke an die „beste“ Näherungslösung.',
    ),
        'ALG-DEC-001': (
        'Du siehst: LU zerlegt \\(A\\) in untere und obere Dreiecksmatrix, um Systeme leichter zu lösen.',
        'Tippe auf **LU Schritt** und wende Zeilenoperationen an: Du näherst dich der LU-Form.',
    ),
        'ALG-DEC-002': (
        'Du siehst: QR schreibt \\(A\\) als orthogonal/Rotation mal Dreieck.',
        'Schau auf das Netz von \\(A\\) als Zusammensetzung aus orthogonalem und dreieckigem Teil.',
    ),
        'ALG-DEC-003': (
        'Du siehst: Die Spektralzerlegung nutzt Eigenwerte und Eigenvektoren.',
        'Aktiviere **Eigenvektoren**: Sie sind die Achsen dieser Zerlegung.',
    ),
        'ALG-DEC-004': (
        'Du siehst: SVD zerlegt \\(A\\) in drehen → skalieren → drehen.',
        'Tippe auf den **SVD/QR Schritt**: 1) ausrichten, 2) mit \\(\\sigma\\) skalieren, 3) mit \\(A\\) zusammensetzen.',
    ),
        'ALG-DEC-005': (
        'Du siehst: Die großen \\(\\sigma\\) zu behalten approximiert \\(A\\) mit niedrigem Rang.',
        'Senke \\(k\\) mit **Niedrigrang-Demo**: Das Netz nutzt nur den größten Singularwert.',
    ),
        'ALG-NOR-001': (
        'Du siehst: Eine Matrixnorm misst, wie stark \\(A\\) einen Vektor strecken kann.',
        'Ändere \\(A\\) und schau: Große \\(\\sigma\\) bedeuten starke Streckungen in einer Richtung.',
    ),
        'ALG-NOR-002': (
        'Du siehst: Frobenius misst die „Größe“ von \\(A\\), indem alle Einträge quadriert summiert werden.',
        'Editiere \\(A\\) und verknüpfe große Einträge mit einer größeren Norm.',
    ),
        'ALG-NOR-003': (
        'Du siehst: Die 1-Norm hängt mit Spaltensummen zusammen.',
        'Mache eine Spalte viel größer und schau: Diese Norm wächst mit ihr.',
    ),
        'ALG-NOR-004': (
        'Du siehst: Die Unendlich-Norm hängt mit Zeilensummen zusammen.',
        'Mache eine Zeile dominant und beobachte die Wirkung auf die Größe von \\(A\\).',
    ),
        'ALG-NOR-005': (
        'Du siehst: Die Spektralnorm ist die größte Streckung (\\(\\sigma_1\\)).',
        'Schau auf die Singularwert-Ellipse: Die lange Achse ist diese Streckung.',
    ),
        'ALG-NOR-006': (
        'Du siehst: \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\) — die Größe des Produkts übersteigt nicht das Produkt der Größen.',
        'Vergleiche visuell, wie stark \\(A\\) streckt gegenüber verketteten Abbildungen.',
    ),
        'ALG-NOR-007': (
        'Du siehst: Die Konditionszahl sagt, ob ein System fehlerempfindlich ist.',
        'Mache \\(\\sigma_1\\gg\\sigma_2\\) (kleines \\(k\\)): Das Netz flacht ab und das Problem wird schlecht konditioniert.',
    ),
        'ALG-BOO-001': (
        'Du siehst: Du kannst eine logische Identität Zeile für Zeile in der Wahrheitstabelle prüfen.',
        'Ändere Ausgaben mit dem Knopf: Orangenen Zeilen stimmen nicht mit dem Erwarteten überein.',
    ),
        'ALG-BOO-002': (
        'Du siehst: Manche booleschen Operationen vereinfachen sich (Idempotenz, Komplement).',
        'Schalte \\(A\\) und \\(B\\) um und vergleiche die Tabelle mit dem Live-Ergebnis.',
    ),
        'ALG-BOO-003': (
        'Du siehst: Distributivität gibt es auch in der Logik, nicht nur in der Zahlenalgebra.',
        'Prüfe die Tabelle: AND/OR verteilt sich wie die Fläche \\(a(b+c)\\).',
    ),
        'ALG-BOO-004': (
        'Du siehst De Morgan: Ein AND zu negieren ist wie ein OR von Negationen (und umgekehrt).',
        'Ändere \\(A\\) und \\(B\\): Beide Ausdrücke jedes Gesetzes liefern immer dasselbe Ergebnis.',
    ),
        'ALG-BOO-005': (
        'Du siehst: XOR ist wahr, wenn \\(A\\) und \\(B\\) verschieden sind.',
        'Probiere alle vier Kombinationen: Nur 01 und 10 ergeben 1.',
    ),
        'ALG-BOO-006': (
        'Du siehst: Absorption entfernt überflüssige Terme in booleschen Ausdrücken.',
        'Vergleiche Tabellenzeilen, um zu sehen, welche Einträge übrig bleiben.',
    ),
        'ALG-BOO-007': (
        'Du siehst: Disjunktive Normalform schreibt die Funktion als ORs von ANDs.',
        'Markiere in der Tabelle die Zeilen mit Ausgabe 1: Das sind deine Produkte.',
    ),
        'ALG-BOO-008': (
        'Du siehst: Konjunktive Normalform ist die duale Form: ANDs von ORs.',
        'Nutze die Tabelle, um zu sehen, welche Klauseln die Nullen der Funktion abdecken.',
    ),
        'ALG-BOO-009': (
        'Du siehst: Zwei Ausdrücke sind äquivalent, wenn ihre Wahrheitstabellen übereinstimmen.',
        'Editiere Ausgaben: Bleibt alles ✓, stimmen die Tabellen überein.',
    ),
        'ALG-MOD-001': (
        'Du siehst: \\(a\\) und \\(b\\) sind kongruent modulo \\(m\\), wenn sie auf denselben Uhrzeiger fallen.',
        'Bewege \\(a\\) und \\(b\\): Der Text sagt, ob \\(a\\equiv b\\pmod{m}\\), wenn sie dieselbe Marke teilen.',
    ),
        'ALG-MOD-002': (
        'Du siehst: Addieren und Multiplizieren modulo \\(m\\) heißt rechnen und auf die Uhr \\(0\\ldots m-1\\) zurückwickeln.',
        'Ändere \\(a\\), \\(b\\) und \\(m\\): Die Marken zeigen \\(a+b\\) und \\(a\\cdot b\\) auf dem Kreis.',
    ),
        'ALG-MOD-003': (
        'Du siehst: Das Inverse von \\(a\\) modulo \\(m\\) existiert nur, wenn \\(\\gcd(a,m)=1\\).',
        'Probiere mehrere \\(a\\): Gibt es kein Inverses, sagt der Text es.',
    ),
        'ALG-MOD-005': (
        'Du siehst: Der Chinesische Restsatz kombiniert zwei Uhren (\\(m\\) und \\(m_2\\)) zu einer Lösung \\(x\\).',
        'Stelle \\(a\\), \\(b\\), \\(m\\) und \\(m_2\\) ein: Wenn es existiert, erscheint das \\(x\\), das beide Reste erfüllt.',
    ),
        'ALG-MOD-006': (
        'Du siehst Fermat: Ist \\(p\\) prim und teilt \\(p\\) nicht \\(a\\), dann \\(a^{p-1}\\equiv 1\\pmod{p}\\).',
        'Bei primem \\(m\\) schau auf \\(a^{p-1}\\) in der Beschriftung; es sollte 1 sein, wenn \\(\\gcd(a,p)=1\\).',
    ),
        'ALG-EST-006': (
        'Du siehst: In einem endlichen Körper wickeln Summe und Produkt modulo \\(p\\) um.',
        'Wähle \\(p\\) und öffne **Tabelle +** / **Tabelle ·**; tippe eine Zelle für Ergebnis und Inverses.',
    ),
        'ALG-COD-001': (
        'Du siehst: Ein linearer Code ist ein Unterraum — Codewort plus Codewort ergibt wieder ein Codewort.',
        'Lies die Codewortliste: Ihre Summe bleibt in der Menge.',
    ),
        'ALG-COD-002': (
        'Du siehst: Die Generatormatrix \\(G\\) baut Codewörter aus Nachrichten.',
        'Editiere Bits/Einträge und denke jede Zeile von \\(G\\) als Basismuster des Codes.',
    ),
        'ALG-COD-003': (
        'Du siehst: \\(H\\) prüft Parität — gültige Wörter erfüllen \\(Hc=0\\).',
        'Kippe ein Bit und verknüpfe den Fehler mit einem nichtnullen Syndrom (in COD-004).',
    ),
        'ALG-COD-004': (
        'Du siehst: Das Syndrom zeigt (in einfachen Codes), wo das fehlerhafte Bit liegt.',
        'Wähle die Fehlerposition: Das Syndrom \\(s\\) ändert sich sofort.',
    ),
        'ALG-COD-005': (
        'Du siehst: Der Hamming-Abstand zählt, in wie vielen Positionen zwei Wörter differieren.',
        'Editiere die beiden Ketten: Unterschiedliche Bits heben sich hervor und \\(d_H\\) aktualisiert sich.',
    ),
        'ALG-COD-006': (
        'Du siehst: Mit Minimalabstand \\(d\\) kannst du eine begrenzte Zahl Fehler erkennen/korrigieren.',
        'Bewege \\(d_{\\min}\\): Der Korrekturradius \\(t=\\lfloor(d-1)/2\\rfloor\\) ändert sich mit.',
    ),
        'ALG-COD-007': (
        'Du siehst: Die Rate \\(k/n\\) misst, wie viel nützliche Info du gegenüber der Gesamtlänge trägst.',
        'Stelle \\(n\\) und \\(k\\) ein: Der Balken zeigt Nachrichtenanteil gegenüber Redundanz.',
    ),
    },
    'fr': {
        'ALG-FND-001': (
        'Tu vas voir que l’ordre ne change rien : \\(a+b\\) et \\(b+a\\) donnent la même somme.',
        'Bouge \(a\) et \(b\) et compare les deux lignes : \(a+b\) en haut, \(b+a\) en bas ; les barres restent aussi longues.',
    ),
        'ALG-FND-002': (
        'Tu vas voir que regrouper autrement ne change pas le total : \\((a+b)+c\\) et \\(a+(b+c)\\) donnent la même chose.',
        'Bouge \(a\), \(b\) et \(c\) et compare les deux lignes : le cadre regroupe autrement, mais le total est le même.',
    ),
        'ALG-FND-003': (
        'Tu vas voir que \\(a(b+c)\\) est la même aire que \\(ab+ac\\).',
        'Bouge \\(a\\), \\(b\\) et \\(c\\) et compare les deux cadres : à gauche un seul rectangle ; à droite \\(ab\\) et \\(ac\\) séparés.',
    ),
        'ALG-FND-006': (
        'Tu vas voir que \\(|x|\\) est la distance à zéro : elle ne descend jamais sous zéro.',
        'Bouge \\(x\\) à gauche ou à droite et regarde : la marque ne compte que ton éloignement de l’origine.',
    ),
        'ALG-FND-007': (
        'Tu vas voir que la distance entre deux points est la longueur du segment qui les joint : \\(|a-b|\\).',
        'Bouge \\(a\\) et \\(b\\) et regarde la longueur entre eux : cette mesure est \\(|a-b|\\).',
    ),
        'ALG-POT-001': (
        'Tu vas voir qu’en multipliant des puissances de même base, les exposants s’ajoutent : \\(a^n a^m = a^{n+m}\\).',
        'Change \\(n\\) et \\(m\\) et regarde comment les blocs de \\(a^n\\) et \\(a^m\\) se réunissent en \\(a^{n+m}\\).',
    ),
        'ALG-POT-008': (
        'Tu vas voir que le conjugué aide à enlever une racine du dénominateur.',
        'Compare \\(a+\\sqrt{b}\\) avec \\(a-\\sqrt{b}\\) et regarde leur produit : le résultat n’a plus de racine au milieu.',
    ),
        'ALG-EXP-003': (
        'Tu verras pourquoi \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) et comment \\(adx\\) et \\(bcx\\) s\'additionnent.',
        'Chaque terme du premier polynôme est multiplié par chaque terme du second ; ensuite on regroupe les mêmes puissances de \\(x\\).',
    ),
        'ALG-IDN-001': (
        'Tu verras que le \\(2\\) de \\(2ab\\) vient de deux rectangles distincts d\'aire \\(ab\\).',
        'Un carré de côté \\(a+b\\) a pour aire \\((a+b)^2\\) ; en partageant chaque côté en \\(a\\) et \\(b\\), apparaissent \\(a^2\\), deux \\(ab\\) et \\(b^2\\).',
    ),
        'ALG-IDN-002': (
        'Tu verras pourquoi apparaît \\(-2ab\\) et pourquoi la correction \\(+b^2\\) est nécessaire.',
        'On part d\'un carré d\'aire \\(a^2\\) ; en enlevant deux bandes \\(ab\\) et en corrigeant par \\(+b^2\\), il reste \\((a-b)^2\\).',
    ),
        'ALG-IDN-003': (
        'Tu vas voir que \\(a^2-b^2\\) est l’aire qui reste après avoir enlevé un petit carré d’un grand.',
        'Appuie pour passer de \\(a^2-b^2\\) au rectangle \\((a-b)(a+b)\\) et regarde : c’est la même quantité.',
    ),
        'ALG-IDN-008': (
        'Tu vas voir que les coefficients du binôme sont la ligne de Pascal.',
        'Change \\(n\\) et regarde les nombres de Pascal : ainsi se construit \\((a+b)^n\\).',
    ),
        'ALG-FAC-001': (
        'Tu vas voir que mettre en facteur commun, c’est regrouper des aires qui partagent un côté.',
        'Bouge \\(a\\), \\(b\\) et \\(c\\) et compare les deux cadres : mettre \\(a\\) en facteur, c’est rejoindre \\(ab\\) et \\(ac\\) en un seul rectangle.',
    ),
        'ALG-FAC-002': (
        'Tu vas voir que factoriser \\(a^2-b^2\\), c’est réassembler l’aire restante en rectangle.',
        'Alternez entre \\(a^2-b^2\\) et \\((a-b)(a+b)\\) et regarde : c’est la même chose.',
    ),
        'ALG-FAC-003': (
        'Tu vas voir qu’un trinôme carré parfait se construit comme un carré complet.',
        'Ajuste \\(a\\) et \\(b\\) jusqu’à voir le motif \\((a\\pm b)^2\\) dans les pièces.',
    ),
        'ALG-EQU-001': (
        'Tu vas voir qu’une équation linéaire est une droite : la solution est où elle coupe l’axe \\(x\\).',
        'Bouge la pente et l’ordonnée à l’origine et cherche où la droite croise l’axe horizontal.',
    ),
        'ALG-EQU-003': (
        'Tu vas voir que la parabole coupe l’axe \\(x\\) aux solutions (si elles existent).',
        'Change \\(a\\), \\(b\\) et \\(c\\) et regarde le discriminant \\(\\Delta\\) et les marques orange des racines.',
    ),
        'ALG-EQU-004': (
        'Tu vas voir que le discriminant \\(\\Delta\\) te dit combien de racines réelles a la quadratique.',
        'Ajuste \\(a\\), \\(b\\) et \\(c\\) et regarde s’il y a 2, 1 ou aucune racine réelle selon \\(\\Delta\\).',
    ),
        'ALG-EQU-005': (
        'Tu vas voir que compléter le carré, c’est ajouter (puis retrancher) le coin qui manque.',
        'Appuie sur **Ajouter (b/2)²** ou **Soustraire (b/2)²** et regarde d’où vient \\(\\left(b/2\\right)^2\\).',
    ),
        'ALG-EQU-008': (
        'Tu vas voir qu’une équation avec valeur absolue a souvent deux solutions symétriques.',
        'Bouge le point sur la droite et relie les distances aux solutions.',
    ),
        'ALG-INE-001': (
        'Tu vas voir qu’une inéquation linéaire peint un rayon ou un intervalle sur la droite.',
        'Change la borne et le type d’inégalité : la zone ombrée est ta solution.',
    ),
        'ALG-INE-002': (
        'Tu vas voir que la solution d’une inéquation quadratique est où la parabole est au-dessus (ou en dessous) de l’axe.',
        'Ajuste la parabole et regarde la zone ombrée : elle marque les \\(x\\) qui satisfont l’inégalité.',
    ),
        'ALG-INE-003': (
        'Tu vas voir qu’avec les inéquations rationnelles il faut surveiller les points où le dénominateur s’annule.',
        'Bouge la borne et regarde quelle partie de la droite reste autorisée.',
    ),
        'ALG-INE-004': (
        'Tu vas voir que la valeur absolue dans les inégalités définit des intervalles centrés ou extérieurs.',
        'Change le rayon et appuie sur **Extrémités fermées** pour voir comment l’intervalle solution s’ouvre ou se ferme.',
    ),
        'ALG-SIS-001': (
        'Tu vas voir qu’un système \\(2\\times 2\\) ce sont deux droites : la solution est leur croisement (si elles se coupent).',
        'Bouge la pente et regarde le point orange : il marque l’intersection, ou tu verras qu’elles sont parallèles.',
    ),
        'ALG-SIS-002': (
        'Tu vas voir qu’un système linéaire se compacte en \\(Ax=b\\) : les lignes de \\(A\\) sont des équations, les colonnes des variables ; \\(\\det(A)\\neq0\\) implique une solution unique.',
        'Édite \\(A\\) et \\(b\\) : compare le système classique avec la forme matricielle, le développement de \\(Ax\\) et le déterminant.',
    ),
        'ALG-SIS-003': (
        'Tu vas voir que la matrice augmentée \\([A\\mid b]\\) rassemble coefficients et seconds membres : chaque ligne est une équation du système.',
        'Choisis \\(R_1\\) ou \\(R_2\\) et édite \\(A\\) et \\(b\\) : tu vois la matrice, la ligne active et le système complet ensemble.',
    ),
        'ALG-SIS-004': (
        'Tu vas voir que les opérations élémentaires changent la forme du système, pas sa solution : c’est la base de Gauss et Gauss–Jordan.',
        'Choisis \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\) ou \\(R_i+cR_j\\) avec lignes et \\(c\\) ; applique et compare au système original.',
    ),
        'ALG-SIS-005': (
        'Tu vas voir le critère complet : rangs différents ⇒ aucune solution ; rangs égaux à \\(n\\) ⇒ une ; rangs égaux et < \\(n\\) ⇒ une infinité.',
        'Charge les trois cas ou édite \\([A\\mid b]\\) : regarde rank(A), rank([A|b]) et \\(n\\), et suis les deux comparaisons.',
    ),
        'ALG-FUN-001': (
        'Tu vas voir que le domaine est l’ensemble des \\(x\\) pour lesquels \\(f(x)\\) est définie, pas seulement un trou dans le graphe.',
        'Bouge \\(b\\) et observe comment la valeur exclue, l’asymptote et le domaine se déplacent ensemble.',
    ),
        'ALG-FUN-002': (
        'Tu vas voir que composer des fonctions, c’est en appliquer une après l’autre.',
        'Bouge \\(x_0\\) et les paramètres et regarde : la valeur affichée est \\(f(g(x))\\).',
    ),
        'ALG-FUN-003': (
        'Tu vas voir que l’inverse « défait » la fonction : leurs graphes sont symétriques par rapport à \\(y=x\\).',
        'Compare la courbe et son inverse ; la diagonale en pointillés est le miroir \\(y=x\\).',
    ),
        'ALG-FUN-005': (
        'Tu vas voir qu’une droite est déterminée par sa pente et son ordonnée à l’origine.',
        'Bouge \\(m\\) et \\(b\\) et regarde : la droite s’incline et se décale aussitôt.',
    ),
        'ALG-FUN-006': (
        'Tu vas voir que des droites parallèles ont la même pente ; des perpendiculaires, des pentes opposées réciproques.',
        'Ajuste les deux droites et regarde quand elles ne se coupent pas ou se croisent à angle droit.',
    ),
        'ALG-FUN-007': (
        'Tu vas voir que translater un graphe, c’est le déplacer sans le déformer.',
        'Bouge \\(h\\) et \\(k\\) et regarde comment la courbe se décale horizontalement et verticalement.',
    ),
        'ALG-FUN-008': (
        'Tu vas voir que scaler et réfléchir étirent, compriment ou retournent la courbe.',
        'Change \\(a\\) et appuie sur **Réflexion horizontale** : regarde comment l’onde se déforme par rapport à l’original.',
    ),
        'ALG-POL-007': (
        'Tu vas voir qu’un polynôme à deux variables donne une valeur à chaque point \\((x,y)\\).',
        'Bouge \\(a\\), \\(b\\) et \\(c\\) et regarde : la carte de couleurs montre \\(z=ax^2+bxy+cy^2\\).',
    ),
        'ALG-POL-008': (
        'Tu vas voir que le degré total additionne les exposants de chaque variable.',
        'Change \\(\\alpha\\) et \\(\\beta\\) et regarde le rectangle : il illustre le degré \\(\\alpha+\\beta\\) de \\(x^{\\alpha}y^{\\beta}\\).',
    ),
        'ALG-POL-009': (
        'Tu vas voir que pour un polynôme homogène, scaler \\((x,y)\\) scale le résultat de façon prévisible.',
        'Active la **forme homogène** et bouge \\(t\\) : compare \\(P(tx,ty)\\) avec \\(t^d P(x,y)\\).',
    ),
        'ALG-POL-010': (
        'Tu vas voir qu’un système polynomial se voit comme des courbes qui se coupent aux solutions.',
        'Ajuste les paramètres et cherche les croisements entre les deux courbes.',
    ),
        'ALG-POL-011': (
        'Tu vas voir que la résultante rassemble les conditions de racines communes dans une matrice.',
        'Édite la matrice et regarde le déterminant : c’est un signal de racines partagées.',
    ),
        'ALG-LOG-001': (
        'Tu vas voir que l’exponentielle croît (ou décroît) en multipliant encore et encore.',
        'Change la base et regarde : la courbe devient plus raide ou plus douce.',
    ),
        'ALG-LOG-002': (
        'Tu vas voir que le logarithme répond : « à quel exposant j’élève la base pour obtenir \\(x\\) ? ».',
        'Compare log et exponentielle : ce sont des inverses ; la diagonale \\(y=x\\) les reflète.',
    ),
        'ALG-LOG-007': (
        'Tu vas voir que le signe de l’exposant décide si la quantité croît ou s’éteint.',
        'Bouge \\(k\\) (via \\(b\\)) et regarde si la courbe monte ou descend avec le temps.',
    ),
        'ALG-COM-001': (
        'Tu vas voir qu’un complexe \\(a+bi\\) est un point (ou une flèche) dans le plan.',
        'Traîne la pointe et regarde : les coordonnées sont les parties réelle et imaginaire.',
    ),
        'ALG-COM-002': (
        'Tu vas voir que le conjugué reflète le nombre par rapport à l’axe réel.',
        'Traîne \\(z\\) et regarde la flèche orange : c’est le conjugué (même \\(x\\), \\(y\\) inversé).',
    ),
        'ALG-COM-003': (
        'Tu vas voir que le module est la longueur de la flèche depuis l’origine.',
        'Étire ou raccourcis le vecteur et regarde : le nombre \\(r\\) est cette longueur.',
    ),
        'ALG-COM-004': (
        'Tu vas voir qu’en forme polaire tu utilises longueur et angle au lieu de \\((x,y)\\).',
        'Tourne \\(\\theta\\) et regarde : le point se déplace sur le cercle de rayon \\(r\\).',
    ),
        'ALG-COM-005': (
        'Tu vas voir qu’Euler relie l’angle au cosinus et au sinus sur le cercle unité.',
        'Bouge \\(\\theta\\) et regarde : le point \\((\\cos\\theta,\\sin\\theta)\\) parcourt la circonférence.',
    ),
        'ALG-COM-006': (
        'Tu vas voir qu’élever à \\(n\\) multiplie l’angle par \\(n\\) et élève le rayon à la puissance.',
        'Change \\(n\\) et \\(\\theta\\) et regarde \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) tourner et s’éloigner selon \\(r^n\\).',
    ),
        'ALG-COM-007': (
        'Tu vas voir que les racines \\(n\\)-ièmes se placent comme les sommets d’un polygone régulier.',
        'Change \\(n\\) et regarde : les points orange se répartissent sur le cercle.',
    ),
        'ALG-SEC-001': (
        'Tu vas voir que dans une suite arithmétique chaque saut ajoute la même quantité.',
        'Bouge \\(a_1\\) et \\(d\\) et regarde : les points montent ou descendent à pas constants.',
    ),
        'ALG-SEC-003': (
        'Tu vas voir que dans une suite géométrique chaque terme est multiplié par \\(r\\).',
        'Change \\(a\\) et \\(r\\) et regarde : les points croissent ou s’approchent de zéro selon \\(|r|\\).',
    ),
        'ALG-SEC-005': (
        'Tu vas voir que si \\(|r|<1\\), la série géométrique infinie s’approche d’une limite.',
        'Essaie \\(|r|<1\\) et \\(|r|\\ge 1\\) et regarde si les points se stabilisent ou s’envolent.',
    ),
        'ALG-SEC-007': (
        'Tu vas voir qu’une récurrence construit chaque terme à partir des précédents.',
        'Change les coefficients et regarde comment la suite évolue point par point.',
    ),
        'ALG-VEC-001': (
        'Tu vas voir qu’un vecteur est une flèche : direction et longueur.',
        'Traîne les pointes et regarde comment le vecteur change dans le plan.',
    ),
        'ALG-VEC-002': (
        'Tu vas voir que la norme est la longueur de la flèche.',
        'Étire \\(u\\) et regarde : la valeur \\(\\|u\\|\\) se met à jour avec la longueur.',
    ),
        'ALG-VEC-003': (
        'Tu vas voir que le vecteur unitaire a longueur 1 et garde la direction.',
        'Bouge \\(u\\) et regarde la version normalisée \\(\\hat{u}\\) de longueur 1.',
    ),
        'ALG-VEC-004': (
        'Tu vas voir que le produit scalaire mesure l’alignement : positif signifie angle aigu.',
        'Traîne \\(u\\) et \\(v\\) et regarde \\(u\\cdot v\\) : si l’angle est aigu, droit ou obtus ; la projection apparaît en orange.',
    ),
        'ALG-VEC-005': (
        'Tu vas voir que l’angle entre vecteurs se lit sur le produit scalaire.',
        'Bouge les flèches et regarde : l’angle et son type (aigu/droit/obtus) se mettent à jour.',
    ),
        'ALG-VEC-006': (
        'Tu vas voir que la distance entre les pointes des vecteurs est la norme de la différence.',
        'Écarte \\(u\\) et \\(v\\) et regarde : la distance croît avec la séparation.',
    ),
        'ALG-VEC-007': (
        'Tu vas voir qu’une combinaison linéaire mélange des vecteurs avec des poids.',
        'Traîne \\(u\\) et \\(v\\) et regarde : la flèche orange est \\(0.7u+0.5v\\).',
    ),
        'ALG-MAT-001': (
        'Tu vas voir qu’une matrice est un tableau de nombres en lignes et colonnes.',
        'Édite les entrées de \\(A\\) et regarde : chaque cellule est un coefficient de l’objet linéaire.',
    ),
        'ALG-MAT-002': (
        'Tu vas voir qu’additionner des matrices se fait case par case.',
        'Change \\(A\\) et \\(B\\) et regarde : le résultat \\(A+B\\) se met à jour entrée par entrée.',
    ),
        'ALG-MAT-003': (
        'Tu vas voir que multiplier par un scalaire étire ou inverse tous les nombres de la matrice.',
        'Bouge \\(c\\) et regarde \\(cA\\) : ça grandit, rétrécit ou change de signe.',
    ),
        'ALG-MAT-004': (
        'Tu vas voir que chaque entrée de \\(AB\\) mélange une ligne de \\(A\\) avec une colonne de \\(B\\).',
        'Choisis une case \\((i,j)\\) et regarde en dessous : tu vois le calcul ligne×colonne pas à pas.',
    ),
        'ALG-MAT-005': (
        'Tu vas voir que l’identité laisse les vecteurs inchangés : c’est le « 1 » des matrices.',
        'Compare \\(A\\) avec l’effet de l’identité sur la base.',
    ),
        'ALG-MAT-006': (
        'Tu vas voir que la transposée échange lignes et colonnes.',
        'Édite \\(A\\) et regarde à droite \\(A^T\\) : lignes et colonnes renversées.',
    ),
        'ALG-MAT-007': (
        'Tu vas voir qu’une matrice symétrique coïncide avec sa transposée.',
        'Ajuste \\(A\\) jusqu’à ce qu’elle coïncide avec \\(A^T\\).',
    ),
        'ALG-DET-001': (
        'Tu vas voir que le déterminant \\(2\\times 2\\) est l’aire signée du parallélogramme des colonnes.',
        'Bouge les vecteurs et regarde : l’aire colorée est \\(|\\det|\\) ; le signe indique l’orientation.',
    ),
        'ALG-DET-002': (
        'Tu vas voir que le déterminant peut se développer selon une ligne ou une colonne (cofacteurs).',
        'Édite \\(A\\) et regarde comment \\(\\det(A)\\) réagit aux changements.',
    ),
        'ALG-DET-003': (
        'Tu vas voir que \\(\\det(AB)=\\det(A)\\det(B)\\) : les aires se multiplient.',
        'Change \\(A\\) et \\(B\\) et compare l’aire du produit avec le produit des aires.',
    ),
        'ALG-DET-004': (
        'Tu vas voir que si l’aire (\\(\\det\\)) est nulle, les colonnes sont parallèles et il n’y a pas d’inverse.',
        'Aplatis le parallélogramme (aire \\(\\approx 0\\)) et regarde : la matrice devient singulière.',
    ),
        'ALG-DET-005': (
        'Tu vas voir que l’inverse « défait » \\(A\\) ; elle existe seulement si \\(\\det\\neq 0\\).',
        'Édite \\(A\\) et regarde \\(\\det\\) : s’il n’est pas nul, l’inverse est bien définie.',
    ),
        'ALG-DET-006': (
        'Tu vas voir que Cramer utilise les déterminants pour résoudre de petits systèmes.',
        'Change \\(A\\) et \\(b\\) et relie \\(\\det(A)\\) à la possibilité d’une solution unique.',
    ),
        'ALG-ESP-001': (
        'Tu vas voir que l’espace engendré ce sont tous les mélanges \\(s\\cdot u+t\\cdot v\\).',
        'Bouge \\(s\\) et \\(t\\) et regarde la flèche orange : elle balaye le plan (ou la droite) engendré par \\(u\\) et \\(v\\).',
    ),
        'ALG-ESP-002': (
        'Tu vas voir que si l’aire du parallélogramme est nulle, les vecteurs sont dépendants.',
        'Aligne \\(u\\) et \\(v\\) et regarde : l’indicateur passe à « dépendants ».',
    ),
        'ALG-ESP-003': (
        'Tu vas voir qu’une base est un ensemble indépendant qui engendre tout l’espace.',
        'Active **Afficher la base** et compare avec tes vecteurs \\(u\\) et \\(v\\).',
    ),
        'ALG-ESP-004': (
        'Tu vas voir que les coordonnées disent combien de chaque vecteur de base tu as besoin.',
        'Change \\(s\\) et \\(t\\) : ce sont les coordonnées de la combinaison dans la base \\(u\\), \\(v\\).',
    ),
        'ALG-ESP-005': (
        'Tu vas voir que le rang c’est combien de directions indépendantes a la matrice.',
        'Édite \\(A\\) et regarde le déterminant/rang : tu verras s’il y a 0, 1 ou 2 directions.',
    ),
        'ALG-ESP-006': (
        'Tu vas voir que la nullité compte les solutions non triviales de \\(Ax=0\\).',
        'Rends des colonnes dépendantes et relie ça aux directions qui vont à l’origine.',
    ),
        'ALG-ESP-007': (
        'Tu vas voir que rang + nullité = nombre de colonnes (dans le cas \\(n\\)).',
        'Explore des vecteurs dépendants/indépendants et regarde comment se partage la dimension.',
    ),
        'ALG-TRA-001': (
        'Tu vas voir qu’une transformation linéaire respecte sommes et scalaires.',
        'Regarde la grille déformée par \\(A\\) : les droites restent des droites.',
    ),
        'ALG-TRA-002': (
        'Tu vas voir qu’appliquer \\(A\\), c’est pousser chaque point (et la grille) vers une nouvelle forme.',
        'Change les entrées de \\(A\\) et regarde : le maillage montre la poussée linéaire.',
    ),
        'ALG-TRA-003': (
        'Tu vas voir que le noyau ce sont les vecteurs que \\(A\\) envoie à l’origine.',
        'Cherche les directions qui s’aplatissent quand \\(\\det\\) approche zéro.',
    ),
        'ALG-TRA-004': (
        'Tu vas voir que l’image ce sont les directions que \\(A\\) peut vraiment atteindre.',
        'Observe où pointent les colonnes transformées \\(e_1\\) et \\(e_2\\).',
    ),
        'ALG-TRA-005': (
        'Tu vas voir que composer des transformations, c’est en appliquer une après l’autre (produit de matrices).',
        'Change \\(A\\) et pense \\(A\\) comme une étape de la composition.',
    ),
        'ALG-TRA-006': (
        'Tu vas voir que l’inverse défait la poussée de \\(A\\).',
        'Appuie sur **Appliquer A⁻¹** (si elle existe) et regarde : le maillage revient vers la forme d’origine.',
    ),
        'ALG-TRA-007': (
        'Tu vas voir que changer de base, c’est décrire les mêmes vecteurs avec d’autres coordonnées.',
        'Modifie \\(A\\) comme matrice de changement et regarde comment le maillage se réoriente.',
    ),
        'ALG-EIG-001': (
        'Tu vas voir qu’un vecteur propre ne fait que s’étirer ou se contracter ; il ne tourne pas de côté.',
        'Active **Vecteurs propres** et regarde les rayons orange : ils marquent ces directions spéciales.',
    ),
        'ALG-EIG-002': (
        'Tu vas voir que l’équation caractéristique trouve les valeurs propres (facteurs d’étirement).',
        'Édite \\(A\\) et relie \\(\\det(A-\\lambda I)=0\\) aux directions que tu vois dans le maillage.',
    ),
        'ALG-EIG-003': (
        'Tu vas voir que l’espace propre est la droite (ou le plan) de tous les vecteurs propres d’un \\(\\lambda\\).',
        'Observe la direction orange associée à chaque valeur propre.',
    ),
        'ALG-EIG-004': (
        'Tu vas voir que diagonaliser, c’est écrire \\(A\\) dans une base de vecteurs propres, où elle agit par scalaires.',
        'Avec les vecteurs propres visibles, imagine des axes où \\(A\\) ne fait qu’étirer.',
    ),
        'ALG-EIG-005': (
        'Tu vas voir qu’avec \\(A=PDP^{-1}\\), élever \\(A\\) à une puissance, c’est élever les scalaires de la diagonale.',
        'Explore \\(A\\) et ses directions propres comme raccourci pour \\(A^n\\).',
    ),
        'ALG-EIG-006': (
        'Tu vas voir que pour les matrices symétriques, on peut choisir des vecteurs propres orthogonaux.',
        'Essaie une \\(A\\) presque symétrique et regarde des vecteurs propres presque perpendiculaires.',
    ),
        'ALG-ORT-001': (
        'Tu vas voir qu’orthogonal signifie angle droit : le produit scalaire est zéro.',
        'Place \\(u\\perp v\\) et regarde : \\(u\\cdot v\\approx 0\\) et l’angle est marqué droit.',
    ),
        'ALG-ORT-002': (
        'Tu vas voir que la projection est l’ombre de \\(u\\) sur la direction de \\(v\\).',
        'Traîne \\(u\\) : le segment orange est la projection ; le reste est l’erreur orthogonale.',
    ),
        'ALG-ORT-003': (
        'Tu vas voir qu’une matrice orthogonale tourne/réfléchit sans changer les longueurs.',
        'Ajuste \\(A\\) vers une rotation et regarde que le maillage ne s’étire pas de façon inégale.',
    ),
        'ALG-ORT-004': (
        'Tu vas voir que Gram–Schmidt transforme des vecteurs en base orthogonale étape par étape.',
        'Avance l’**Étape Gram-Schmidt** et observe la nouvelle direction orthogonale.',
    ),
        'ALG-LSQ-001': (
        'Tu vas voir que les moindres carrés cherchent le point du sous-espace le plus proche des données.',
        'Bouge les vecteurs et le point : la projection est la meilleure approximation.',
    ),
        'ALG-LSQ-002': (
        'Tu vas voir que les équations normales \\(A^T Ax=A^T b\\) résument ce problème de projection.',
        'Édite \\(A\\) et \\(b\\) comme données de l’ajustement linéaire par moindres carrés.',
    ),
        'ALG-LSQ-003': (
        'Tu vas voir que la pseudo-inverse généralise l’inverse quand \\(A\\) n’est pas invertible.',
        'Explore une \\(A\\) rectangulaire/singulière et pense à la « meilleure » solution approchée.',
    ),
        'ALG-DEC-001': (
        'Tu vas voir que LU découpe \\(A\\) en triangulaire inférieure et supérieure pour résoudre plus facilement.',
        'Appuie sur **Étape LU** et applique des opérations de ligne : tu t’approches de la forme LU.',
    ),
        'ALG-DEC-002': (
        'Tu vas voir que QR écrit \\(A\\) comme orthogonal/rotation fois triangulaire.',
        'Observe le maillage de \\(A\\) comme composition d’une partie orthogonale et d’une triangulaire.',
    ),
        'ALG-DEC-003': (
        'Tu vas voir que la décomposition spectrale utilise valeurs et vecteurs propres.',
        'Active **Vecteurs propres** : ce sont les axes de cette décomposition.',
    ),
        'ALG-DEC-004': (
        'Tu vas voir que SVD décompose \\(A\\) en tourner → scaler → tourner.',
        'Appuie sur l’**Étape SVD/QR** : 1) oriente, 2) scale avec \\(\\sigma\\), 3) recompose avec \\(A\\).',
    ),
        'ALG-DEC-005': (
        'Tu vas voir que garder les grands \\(\\sigma\\) approxime \\(A\\) avec un rang faible.',
        'Baisse \\(k\\) avec **Démo rang faible** : le maillage n’utilise que la plus grande valeur singulière.',
    ),
        'ALG-NOR-001': (
        'Tu vas voir qu’une norme matricielle mesure combien \\(A\\) peut étirer un vecteur.',
        'Change \\(A\\) et regarde : de grands \\(\\sigma\\) indiquent de forts étirements dans une direction.',
    ),
        'ALG-NOR-002': (
        'Tu vas voir que Frobenius mesure la « taille » de \\(A\\) en sommant tous les carrés des entrées.',
        'Édite \\(A\\) et relie de grandes entrées à une norme plus grande.',
    ),
        'ALG-NOR-003': (
        'Tu vas voir que la norme 1 est liée aux sommes de colonnes.',
        'Rends une colonne beaucoup plus grande et regarde : cette norme croît avec elle.',
    ),
        'ALG-NOR-004': (
        'Tu vas voir que la norme infinie est liée aux sommes de lignes.',
        'Rends une ligne dominante et observe l’effet sur la taille de \\(A\\).',
    ),
        'ALG-NOR-005': (
        'Tu vas voir que la norme spectrale est le plus grand étirement (\\(\\sigma_1\\)).',
        'Regarde l’ellipse des valeurs singulières : le grand axe est cet étirement.',
    ),
        'ALG-NOR-006': (
        'Tu vas voir que \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\) : la taille du produit ne dépasse pas le produit des tailles.',
        'Compare visuellement combien \\(A\\) étire face à des transformations enchaînées.',
    ),
        'ALG-NOR-007': (
        'Tu vas voir que le nombre de condition dit si un système est sensible aux erreurs.',
        'Fais \\(\\sigma_1\\gg\\sigma_2\\) (\\(k\\) bas) : le maillage s’aplatit et le problème devient mal conditionné.',
    ),
        'ALG-BOO-001': (
        'Tu vas voir que tu peux vérifier une identité logique ligne par ligne dans la table de vérité.',
        'Change les sorties avec le bouton : les lignes orange ne correspondent pas à l’attendu.',
    ),
        'ALG-BOO-002': (
        'Tu vas voir que certaines opérations booléennes se simplifient (idempotence, complément).',
        'Alternez \\(A\\) et \\(B\\) et compare la table au résultat en direct.',
    ),
        'ALG-BOO-003': (
        'Tu vas voir que la distributivité existe aussi en logique, pas seulement en algèbre des nombres.',
        'Regarde la table : AND/OR se répartit comme l’aire \\(a(b+c)\\).',
    ),
        'ALG-BOO-004': (
        'Tu vas voir De Morgan : nier un AND, c’est comme un OR de négations (et inversement).',
        'Change \\(A\\) et \\(B\\) : les deux expressions de chaque loi donnent toujours le même résultat.',
    ),
        'ALG-BOO-005': (
        'Tu vas voir que XOR est vrai quand \\(A\\) et \\(B\\) sont distincts.',
        'Essaie les quatre combinaisons : seuls 01 et 10 donnent 1.',
    ),
        'ALG-BOO-006': (
        'Tu vas voir que l’absorption élimine les termes redondants dans les expressions booléennes.',
        'Compare les lignes de la table pour voir quelles entrées restent en trop.',
    ),
        'ALG-BOO-007': (
        'Tu vas voir que la somme de produits écrit la fonction comme des OR de AND.',
        'Marque dans la table les lignes où la sortie est 1 : ce sont tes produits.',
    ),
        'ALG-BOO-008': (
        'Tu vas voir que le produit de sommes est la forme duale : des AND de OR.',
        'Utilise la table pour voir quelles clauses couvrent les zéros de la fonction.',
    ),
        'ALG-BOO-009': (
        'Tu vas voir que deux expressions sont équivalentes si leur table de vérité coïncide.',
        'Édite les sorties : si tout reste ✓, les tables coïncident.',
    ),
        'ALG-MOD-001': (
        'Tu vas voir que \\(a\\) et \\(b\\) sont congruents modulo \\(m\\) s’ils tombent sur le même « tick » de l’horloge.',
        'Bouge \\(a\\) et \\(b\\) : le texte dit si \\(a\\equiv b\\pmod{m}\\) quand ils partagent une marque.',
    ),
        'ALG-MOD-002': (
        'Tu vas voir qu’additionner et multiplier modulo \\(m\\), c’est calculer puis revenir à l’horloge \\(0\\ldots m-1\\).',
        'Change \\(a\\), \\(b\\) et \\(m\\) : les marques montrent \\(a+b\\) et \\(a\\cdot b\\) sur le cercle.',
    ),
        'ALG-MOD-003': (
        'Tu vas voir que l’inverse de \\(a\\) modulo \\(m\\) existe seulement si \\(\\gcd(a,m)=1\\).',
        'Essaie plusieurs \\(a\\) : s’il n’y a pas d’inverse, le texte l’indique.',
    ),
        'ALG-MOD-005': (
        'Tu vas voir que le théorème chinois combine deux horloges (\\(m\\) et \\(m_2\\)) en une solution \\(x\\).',
        'Ajuste \\(a\\), \\(b\\), \\(m\\) et \\(m_2\\) : quand ça existe, apparaît le \\(x\\) qui satisfait les deux restes.',
    ),
        'ALG-MOD-006': (
        'Tu vas voir Fermat : si \\(p\\) est premier et \\(p\\) ne divise pas \\(a\\), alors \\(a^{p-1}\\equiv 1\\pmod{p}\\).',
        'Avec \\(m\\) premier, regarde \\(a^{p-1}\\) dans la légende ; ce devrait être 1 si \\(\\gcd(a,p)=1\\).',
    ),
        'ALG-EST-006': (
        'Tu vas voir que dans un corps fini, somme et produit s’enroulent modulo \\(p\\).',
        'Choisis \\(p\\) et ouvre **Table +** / **Table ·** ; appuie sur une cellule pour voir le résultat et l’inverse.',
    ),
        'ALG-COD-001': (
        'Tu vas voir qu’un code linéaire est un sous-espace : additionner des mots de code donne un autre mot de code.',
        'Lis la liste des codewords : leur somme reste dans l’ensemble.',
    ),
        'ALG-COD-002': (
        'Tu vas voir que la matrice génératrice \\(G\\) fabrique des mots de code à partir des messages.',
        'Édite bits/entrées et pense chaque ligne de \\(G\\) comme un motif de base du code.',
    ),
        'ALG-COD-003': (
        'Tu vas voir que \\(H\\) vérifie la parité : les mots valides satisfont \\(Hc=0\\).',
        'Inverse un bit et relie l’échec à un syndrome non nul (dans COD-004).',
    ),
        'ALG-COD-004': (
        'Tu vas voir que le syndrome indique (dans les codes simples) où est le bit erroné.',
        'Choisis la position de l’erreur : le syndrome \\(s\\) change aussitôt.',
    ),
        'ALG-COD-005': (
        'Tu vas voir que la distance de Hamming compte en combien de positions deux mots diffèrent.',
        'Édite les deux chaînes : les bits distincts se mettent en évidence et \\(d_H\\) se met à jour.',
    ),
        'ALG-COD-006': (
        'Tu vas voir qu’avec une distance minimale \\(d\\) tu peux détecter/corriger un nombre limité d’erreurs.',
        'Bouge \\(d_{\\min}\\) : le rayon de correction \\(t=\\lfloor(d-1)/2\\rfloor\\) change avec.',
    ),
        'ALG-COD-007': (
        'Tu vas voir que le taux \\(k/n\\) mesure combien d’info utile tu portes face à la longueur totale.',
        'Ajuste \\(n\\) et \\(k\\) : la barre montre la part message face à la redondance.',
    ),
    },
    'it': {
        'ALG-FND-001': (
        "Vedrai che l'ordine non conta: \\(a+b\\) e \\(b+a\\) danno la stessa somma.",
        'Muovi \(a\) e \(b\) e confronta le due righe: sopra \(a+b\), sotto \(b+a\); le barre restano lunghe uguali.',
    ),
        'ALG-FND-002': (
        'Vedrai che raggruppare diversamente non cambia il totale: \\((a+b)+c\\) e \\(a+(b+c)\\) danno lo stesso.',
        'Muovi \(a\), \(b\) e \(c\) e confronta le due righe: il riquadro raggruppa in modo diverso, ma il totale è lo stesso.',
    ),
        'ALG-FND-003': (
        'Vedrai che \\(a(b+c)\\) è la stessa area di \\(ab+ac\\).',
        'Muovi \\(a\\), \\(b\\) e \\(c\\) e confronta i due riquadri: a sinistra un rettangolo intero; a destra \\(ab\\) e \\(ac\\) separati.',
    ),
        'ALG-FND-006': (
        'Vedrai che \\(|x|\\) è la distanza dallo zero: non scende mai sotto zero.',
        "Muovi \\(x\\) a sinistra o a destra e nota: il segno conta solo quanto ti allontani dall'origine.",
    ),
        'ALG-FND-007': (
        'Vedrai che la distanza tra due punti è la lunghezza del segmento che li unisce: \\(|a-b|\\).',
        'Muovi \\(a\\) e \\(b\\) e guarda la lunghezza tra loro: quella misura è \\(|a-b|\\).',
    ),
        'ALG-POT-001': (
        'Vedrai che moltiplicando potenze con la stessa base, gli esponenti si sommano: \\(a^n a^m = a^{n+m}\\).',
        'Cambia \\(n\\) e \\(m\\) e nota come i blocchi di \\(a^n\\) e \\(a^m\\) si uniscono in \\(a^{n+m}\\).',
    ),
        'ALG-POT-008': (
        'Vedrai che il coniugato aiuta a togliere una radice dal denominatore.',
        'Confronta \\(a+\\sqrt{b}\\) con \\(a-\\sqrt{b}\\) e guarda il prodotto: il risultato non ha radice in mezzo.',
    ),
        'ALG-EXP-003': (
        'Vedrai perché \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) e come \\(adx\\) e \\(bcx\\) si sommano.',
        'Ogni termine del primo polinomio si moltiplica per ogni termine del secondo; poi si raggruppano le stesse potenze di \\(x\\).',
    ),
        'ALG-IDN-001': (
        'Vedrai che il \\(2\\) di \\(2ab\\) nasce perché ci sono due rettangoli distinti di area \\(ab\\).',
        'Un quadrato di lato \\(a+b\\) ha area \\((a+b)^2\\); dividendo ogni lato in \\(a\\) e \\(b\\) compaiono \\(a^2\\), due \\(ab\\) e \\(b^2\\).',
    ),
        'ALG-IDN-002': (
        'Vedrai perché compare \\(-2ab\\) e perché serve la correzione \\(+b^2\\).',
        'Partiamo da un quadrato di area \\(a^2\\); togliendo due fasce \\(ab\\) e correggendo con \\(+b^2\\) resta \\((a-b)^2\\).',
    ),
        'ALG-IDN-003': (
        "Vedrai che \\(a^2-b^2\\) è l'area che resta togliendo un quadrato piccolo da uno grande.",
        'Tocca per passare da \\(a^2-b^2\\) al rettangolo \\((a-b)(a+b)\\) e nota: è la stessa quantità.',
    ),
        'ALG-IDN-008': (
        'Vedrai che i coefficienti del binomio sono la riga di Pascal.',
        'Cambia \\(n\\) e guarda i numeri di Pascal: così si costruisce \\((a+b)^n\\).',
    ),
        'ALG-FAC-001': (
        'Vedrai che mettere in evidenza un fattore comune è riordinare aree che condividono un lato.',
        'Muovi \\(a\\), \\(b\\) e \\(c\\) e confronta i due riquadri: mettere in evidenza \\(a\\) unisce \\(ab\\) e \\(ac\\) in un solo rettangolo.',
    ),
        'ALG-FAC-002': (
        "Vedrai che fattorizzare \\(a^2-b^2\\) è rimontare l'area restante come un rettangolo.",
        'Alterna tra \\(a^2-b^2\\) e \\((a-b)(a+b)\\) e guarda: rappresentano la stessa cosa.',
    ),
        'ALG-FAC-003': (
        'Vedrai che un trinomio quadrato perfetto si costruisce come un quadrato completo.',
        'Regola \\(a\\) e \\(b\\) finché vedi il motivo \\((a\\pm b)^2\\) nei pezzi.',
    ),
        'ALG-EQU-001': (
        "Vedrai che un'equazione lineare è una retta: la soluzione è dove taglia l'asse \\(x\\).",
        "Muovi pendenza e intercetta e cerca dove la retta incrocia l'asse orizzontale.",
    ),
        'ALG-EQU-003': (
        "Vedrai che la parabola taglia l'asse \\(x\\) nelle soluzioni (se esistono).",
        'Cambia \\(a\\), \\(b\\) e \\(c\\) e guarda il discriminante \\(\\Delta\\) e i segni arancioni delle radici.',
    ),
        'ALG-EQU-004': (
        'Vedrai che il discriminante \\(\\Delta\\) ti dice quante radici reali ha la quadratica.',
        'Regola \\(a\\), \\(b\\) e \\(c\\) e nota se ci sono 2, 1 o nessuna radice reale secondo \\(\\Delta\\).',
    ),
        'ALG-EQU-005': (
        "Vedrai che completare il quadrato significa aggiungere (e poi sottrarre) l'angolo che manca.",
        'Tocca **Aggiungi (b/2)²** o **Sottrai (b/2)²** e guarda da dove nasce \\(\\left(b/2\\right)^2\\).',
    ),
        'ALG-EQU-008': (
        "Vedrai che un'equazione con valore assoluto ha spesso due soluzioni simmetriche.",
        'Muovi il punto sulla retta e collega le distanze alle soluzioni.',
    ),
        'ALG-INE-001': (
        'Vedrai che una disequazione lineare dipinge un raggio o un intervallo sulla retta.',
        'Cambia il bordo e il tipo di disuguaglianza: la zona ombreggiata è la tua soluzione.',
    ),
        'ALG-INE-002': (
        "Vedrai che la soluzione di una disequazione quadratica è dove la parabola sta sopra (o sotto) l'asse.",
        'Regola la parabola e guarda la zona ombreggiata: segna le \\(x\\) che soddisfano la disuguaglianza.',
    ),
        'ALG-INE-003': (
        'Vedrai che nelle disequazioni razionali devi badare ai punti dove il denominatore si annulla.',
        'Muovi il bordo e nota quale parte della retta resta permessa.',
    ),
        'ALG-INE-004': (
        'Vedrai che il valore assoluto nelle disuguaglianze definisce intervalli centrati o esterni.',
        "Cambia il raggio e tocca **Estremi chiusi** per vedere come si apre o chiude l'intervallo soluzione.",
    ),
        'ALG-SIS-001': (
        'Vedrai che un sistema \\(2\\times 2\\) sono due rette: la soluzione è il loro incrocio (se si tagliano).',
        "Muovi la pendenza e guarda il punto arancione: segna l'intersezione, o vedrai se sono parallele.",
    ),
        'ALG-SIS-002': (
        'Vedrai che un sistema lineare si compatta in \\(Ax=b\\): le righe di \\(A\\) sono equazioni, le colonne variabili; \\(\\det(A)\\neq0\\) implica soluzione unica.',
        'Modifica \\(A\\) e \\(b\\): confronta il sistema tradizionale con la forma matriciale, lo sviluppo di \\(Ax\\) e il determinante.',
    ),
        'ALG-SIS-003': (
        "Vedrai che la matrice aumentata \\([A\\mid b]\\) riunisce coefficienti e termini noti: ogni riga è un'equazione del sistema.",
        'Scegli \\(R_1\\) o \\(R_2\\) e modifica \\(A\\) e \\(b\\): vedi insieme la matrice, la riga attiva e il sistema completo.',
    ),
        'ALG-SIS-004': (
        'Vedrai che le operazioni elementari cambiano la forma del sistema, non la soluzione: così nascono Gauss e Gauss–Jordan.',
        'Scegli \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\) o \\(R_i+cR_j\\) con righe e \\(c\\); applica e confronta con il sistema originale.',
    ),
        'ALG-SIS-005': (
        "Vedrai il criterio completo: ranghi diversi ⇒ nessuna soluzione; ranghi uguali a \\(n\\) ⇒ una; ranghi uguali e < \\(n\\) ⇒ infinite.",
        "Carica i tre casi o modifica \\([A\\mid b]\\): guarda rank(A), rank([A|b]) e \\(n\\), e segui i due confronti.",
    ),
        'ALG-FUN-001': (
        'Vedrai che il dominio è l’insieme degli \\(x\\) per cui \\(f(x)\\) è definita, non solo un buco nel grafico.',
        'Muovi \\(b\\) e osserva come valore escluso, asintota e dominio si spostano insieme.',
    ),
        'ALG-FUN-002': (
        "Vedrai che comporre funzioni significa applicarne una dopo l'altra.",
        'Muovi \\(x_0\\) e i parametri e nota: il valore mostrato è \\(f(g(x))\\).',
    ),
        'ALG-FUN-003': (
        "Vedrai che l'inversa «disfa» la funzione: i loro grafici sono simmetrici rispetto a \\(y=x\\).",
        'Confronta la curva e la sua inversa; la diagonale tratteggiata è lo specchio \\(y=x\\).',
    ),
        'ALG-FUN-005': (
        "Vedrai che una retta è determinata dalla pendenza e dall'intercetta sull'asse \\(y\\).",
        'Muovi \\(m\\) e \\(b\\) e guarda: la retta si inclina e si sposta subito.',
    ),
        'ALG-FUN-006': (
        'Vedrai che rette parallele hanno la stessa pendenza; perpendicolari, pendenze opposte reciproche.',
        'Regola le due rette e nota quando non si incontrano o si incrociano ad angolo retto.',
    ),
        'ALG-FUN-007': (
        'Vedrai che traslare un grafico significa spostarlo senza deformarlo.',
        'Muovi \\(h\\) e \\(k\\) e guarda come la curva si sposta in orizzontale e in verticale.',
    ),
        'ALG-FUN-008': (
        'Vedrai che scalare e riflettere stirano, comprimono o capovolgono la curva.',
        "Cambia \\(a\\) e tocca **Riflessione orizzontale**: guarda come l'onda si deforma rispetto all'originale.",
    ),
        'ALG-POL-007': (
        'Vedrai che un polinomio in due variabili assegna un valore a ogni punto \\((x,y)\\).',
        'Muovi \\(a\\), \\(b\\) e \\(c\\) e nota: la mappa di colore mostra \\(z=ax^2+bxy+cy^2\\).',
    ),
        'ALG-POL-008': (
        'Vedrai che il grado totale somma gli esponenti di ogni variabile.',
        'Cambia \\(\\alpha\\) e \\(\\beta\\) e guarda il rettangolo: illustra il grado \\(\\alpha+\\beta\\) di \\(x^{\\alpha}y^{\\beta}\\).',
    ),
        'ALG-POL-009': (
        'Vedrai che in un polinomio omogeneo, scalare \\((x,y)\\) scala il risultato in modo prevedibile.',
        'Attiva la **forma omogenea** e muovi \\(t\\): confronta \\(P(tx,ty)\\) con \\(t^d P(x,y)\\).',
    ),
        'ALG-POL-010': (
        'Vedrai che un sistema polinomiale si vede come curve che si tagliano nelle soluzioni.',
        'Regola i parametri e cerca gli incroci tra le due curve.',
    ),
        'ALG-POL-011': (
        'Vedrai che la risultante concentra condizioni di radice comune in una matrice.',
        'Modifica la matrice e guarda il determinante: è un segnale di radici condivise.',
    ),
        'ALG-LOG-001': (
        "Vedrai che l'esponenziale cresce (o decresce) moltiplicando ancora e ancora.",
        'Cambia la base e nota: la curva diventa più ripida o più dolce.',
    ),
        'ALG-LOG-002': (
        'Vedrai che il logaritmo risponde: «a quale esponente elevo la base per ottenere \\(x\\)?».',
        'Confronta log ed esponenziale: sono inverse; la diagonale \\(y=x\\) le riflette.',
    ),
        'ALG-LOG-007': (
        "Vedrai che il segno dell'esponente decide se la quantità cresce o si spegne.",
        'Muovi \\(k\\) (via \\(b\\)) e guarda se la curva sale o scende nel tempo.',
    ),
        'ALG-COM-001': (
        'Vedrai che un complesso \\(a+bi\\) è un punto (o freccia) nel piano.',
        'Trascina la punta e nota: le coordinate sono la parte reale e immaginaria.',
    ),
        'ALG-COM-002': (
        "Vedrai che il coniugato riflette il numero rispetto all'asse reale.",
        'Trascina \\(z\\) e guarda la freccia arancione: è il coniugato (stessa \\(x\\), \\(y\\) capovolta).',
    ),
        'ALG-COM-003': (
        "Vedrai che il modulo è la lunghezza della freccia dall'origine.",
        'Allunga o accorcia il vettore e nota: il numero \\(r\\) è quella lunghezza.',
    ),
        'ALG-COM-004': (
        'Vedrai che in forma polare usi lunghezza e angolo al posto di \\((x,y)\\).',
        'Ruota \\(\\theta\\) e guarda: il punto si muove sul cerchio di raggio \\(r\\).',
    ),
        'ALG-COM-005': (
        "Vedrai che Euler collega l'angolo a coseno e seno sul cerchio unitario.",
        'Muovi \\(\\theta\\) e nota: il punto \\((\\cos\\theta,\\sin\\theta)\\) percorre la circonferenza.',
    ),
        'ALG-COM-006': (
        "Vedrai che elevare a \\(n\\) moltiplica l'angolo per \\(n\\) e potenzia il raggio.",
        'Cambia \\(n\\) e \\(\\theta\\) e guarda \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) che girano e si allontanano secondo \\(r^n\\).',
    ),
        'ALG-COM-007': (
        'Vedrai che le radici \\(n\\)-esime si dispongono come vertici di un poligono regolare.',
        'Cambia \\(n\\) e nota: i punti arancioni si distribuiscono sul cerchio.',
    ),
        'ALG-SEC-001': (
        'Vedrai che in una successione aritmetica ogni salto somma la stessa quantità.',
        'Muovi \\(a_1\\) e \\(d\\) e guarda: i punti salgono o scendono a passi costanti.',
    ),
        'ALG-SEC-003': (
        'Vedrai che in una successione geometrica ogni termine si moltiplica per \\(r\\).',
        'Cambia \\(a\\) e \\(r\\) e nota: i punti crescono o si avvicinano a zero secondo \\(|r|\\).',
    ),
        'ALG-SEC-005': (
        'Vedrai che se \\(|r|<1\\), la serie geometrica infinita si avvicina a un valore limite.',
        'Prova \\(|r|<1\\) e \\(|r|\\ge 1\\) e guarda se i punti si stabilizzano o sparano via.',
    ),
        'ALG-SEC-007': (
        'Vedrai che una ricorrenza costruisce ogni termine a partire dai precedenti.',
        'Cambia i coefficienti e nota come evolve la successione punto per punto.',
    ),
        'ALG-VEC-001': (
        'Vedrai che un vettore è una freccia: direzione e lunghezza.',
        'Trascina le punte e guarda come cambia il vettore nel piano.',
    ),
        'ALG-VEC-002': (
        'Vedrai che la norma è la lunghezza della freccia.',
        'Allunga \\(u\\) e nota: il valore \\(\\|u\\|\\) si aggiorna con la lunghezza.',
    ),
        'ALG-VEC-003': (
        'Vedrai che il vettore unitario ha lunghezza 1 e conserva la direzione.',
        'Muovi \\(u\\) e guarda la versione normalizzata \\(\\hat{u}\\) di lunghezza 1.',
    ),
        'ALG-VEC-004': (
        "Vedrai che il prodotto scalare misura l'allineamento: positivo significa angolo acuto.",
        "Trascina \\(u\\) e \\(v\\) e guarda \\(u\\cdot v\\): se l'angolo è acuto, retto o ottuso; la proiezione appare in arancione.",
    ),
        'ALG-VEC-005': (
        "Vedrai che l'angolo tra vettori si legge dal prodotto scalare.",
        "Muovi le frecce e nota: l'angolo e il tipo (acuto/retto/ottuso) si aggiornano.",
    ),
        'ALG-VEC-006': (
        'Vedrai che la distanza tra le punte dei vettori è la norma della differenza.',
        'Separa \\(u\\) e \\(v\\) e guarda: la distanza cresce con la separazione.',
    ),
        'ALG-VEC-007': (
        'Vedrai che una combinazione lineare mescola vettori con pesi.',
        'Trascina \\(u\\) e \\(v\\) e nota: la freccia arancione è \\(0.7u+0.5v\\).',
    ),
        'ALG-MAT-001': (
        'Vedrai che una matrice è una tabella di numeri in righe e colonne.',
        "Modifica le voci di \\(A\\) e guarda: ogni cella è un coefficiente dell'oggetto lineare.",
    ),
        'ALG-MAT-002': (
        'Vedrai che sommare matrici si fa casella per casella.',
        'Cambia \\(A\\) e \\(B\\) e nota: il risultato \\(A+B\\) si aggiorna voce per voce.',
    ),
        'ALG-MAT-003': (
        'Vedrai che moltiplicare per uno scalare stira o inverte tutti i numeri della matrice.',
        'Muovi \\(c\\) e guarda \\(cA\\): cresce, si restringe o cambia segno.',
    ),
        'ALG-MAT-004': (
        'Vedrai che ogni voce di \\(AB\\) mescola una riga di \\(A\\) con una colonna di \\(B\\).',
        'Scegli una casella \\((i,j)\\) e guarda sotto: vedi il conto riga×colonna passo a passo.',
    ),
        'ALG-MAT-005': (
        "Vedrai che l'identità lascia i vettori uguali: è l'«1» delle matrici.",
        "Confronta \\(A\\) con l'effetto dell'identità sulla base.",
    ),
        'ALG-MAT-006': (
        'Vedrai che la trasposta scambia righe e colonne.',
        'Modifica \\(A\\) e guarda a destra \\(A^T\\): righe e colonne ribaltate.',
    ),
        'ALG-MAT-007': (
        'Vedrai che una matrice simmetrica coincide con la sua trasposta.',
        'Regola \\(A\\) finché coincide con \\(A^T\\).',
    ),
        'ALG-DET-001': (
        "Vedrai che il determinante \\(2\\times 2\\) è l'area con segno del parallelogramma delle colonne.",
        "Muovi i vettori e nota: l'area colorata è \\(|\\det|\\); il segno indica l'orientazione.",
    ),
        'ALG-DET-002': (
        'Vedrai che il determinante si può espandere lungo una riga o colonna (cofattori).',
        'Modifica \\(A\\) e guarda come \\(\\det(A)\\) risponde ai cambiamenti.',
    ),
        'ALG-DET-003': (
        'Vedrai che \\(\\det(AB)=\\det(A)\\det(B)\\): le aree si moltiplicano.',
        "Cambia \\(A\\) e \\(B\\) e confronta l'area del prodotto con il prodotto delle aree.",
    ),
        'ALG-DET-004': (
        "Vedrai che se l'area (\\(\\det\\)) è zero, le colonne sono parallele e non c'è inversa.",
        'Appiattisci il parallelogramma (area \\(\\approx 0\\)) e nota: la matrice diventa singolare.',
    ),
        'ALG-DET-005': (
        "Vedrai che l'inversa «disfa» \\(A\\); esiste solo se \\(\\det\\neq 0\\).",
        "Modifica \\(A\\) e guarda \\(\\det\\): se non è zero, l'inversa è ben definita.",
    ),
        'ALG-DET-006': (
        'Vedrai che Cramer usa i determinanti per risolvere sistemi piccoli.',
        'Cambia \\(A\\) e \\(b\\) e collega \\(\\det(A)\\) alla possibilità di soluzione unica.',
    ),
        'ALG-ESP-001': (
        'Vedrai che lo spazio generato sono tutte le misture \\(s\\cdot u+t\\cdot v\\).',
        'Muovi \\(s\\) e \\(t\\) e guarda la freccia arancione: spazza il piano (o la retta) generato da \\(u\\) e \\(v\\).',
    ),
        'ALG-ESP-002': (
        "Vedrai che se l'area del parallelogramma è zero, i vettori sono dipendenti.",
        "Allinea \\(u\\) e \\(v\\) e nota: l'indicatore passa a «dipendenti».",
    ),
        'ALG-ESP-003': (
        'Vedrai che una base è un insieme indipendente che genera tutto lo spazio.',
        'Attiva **Mostra base** e confronta con i tuoi vettori \\(u\\) e \\(v\\).',
    ),
        'ALG-ESP-004': (
        'Vedrai che le coordinate dicono quanto di ciascun vettore della base ti serve.',
        'Cambia \\(s\\) e \\(t\\): sono le coordinate della combinazione nella base \\(u\\), \\(v\\).',
    ),
        'ALG-ESP-005': (
        'Vedrai che il rango è quante direzioni indipendenti ha la matrice.',
        'Modifica \\(A\\) e guarda determinante/rango: vedrai se ci sono 0, 1 o 2 direzioni.',
    ),
        'ALG-ESP-006': (
        'Vedrai che la nullità conta le soluzioni non banali di \\(Ax=0\\).',
        "Rendi colonne dipendenti e collega alle direzioni che vanno all'origine.",
    ),
        'ALG-ESP-007': (
        'Vedrai che rango + nullità = numero di colonne (nel caso \\(n\\)).',
        'Esplora vettori dipendenti/indipendenti e nota come si riparte la dimensione.',
    ),
        'ALG-TRA-001': (
        'Vedrai che una trasformazione lineare rispetta somme e scalature.',
        'Guarda la griglia deformata da \\(A\\): le rette restano rette.',
    ),
        'ALG-TRA-002': (
        'Vedrai che applicare \\(A\\) spinge ogni punto (e la griglia) in una nuova forma.',
        'Cambia le voci di \\(A\\) e nota: la maglia mostra la spinta lineare.',
    ),
        'ALG-TRA-003': (
        "Vedrai che il nucleo sono i vettori che \\(A\\) manda all'origine.",
        'Cerca direzioni che si appiattiscono quando \\(\\det\\) si avvicina a zero.',
    ),
        'ALG-TRA-004': (
        "Vedrai che l'immagine sono le direzioni che \\(A\\) può davvero raggiungere.",
        'Osserva dove puntano le colonne trasformate \\(e_1\\) e \\(e_2\\).',
    ),
        'ALG-TRA-005': (
        "Vedrai che comporre trasformazioni significa applicarne una dopo l'altra (prodotto di matrici).",
        'Cambia \\(A\\) e pensa \\(A\\) come un passo della composizione.',
    ),
        'ALG-TRA-006': (
        "Vedrai che l'inversa disfa la spinta di \\(A\\).",
        'Tocca **Applica A⁻¹** (se esiste) e guarda: la maglia torna verso la forma originale.',
    ),
        'ALG-TRA-007': (
        'Vedrai che cambiare base significa descrivere gli stessi vettori con altre coordinate.',
        'Modifica \\(A\\) come matrice di cambio e nota come si riorienta la maglia.',
    ),
        'ALG-EIG-001': (
        'Vedrai che un autovettore solo si allunga o si accorcia; non gira di lato.',
        'Attiva **Autovettori** e guarda i raggi arancioni: segnano quelle direzioni speciali.',
    ),
        'ALG-EIG-002': (
        "Vedrai che l'equazione caratteristica trova gli autovalori (fattori di stiramento).",
        'Modifica \\(A\\) e collega \\(\\det(A-\\lambda I)=0\\) alle direzioni che vedi nella maglia.',
    ),
        'ALG-EIG-003': (
        "Vedrai che l'autospazio è la retta (o piano) di tutti gli autovettori di un \\(\\lambda\\).",
        'Osserva la direzione arancione legata a ciascun autovalore.',
    ),
        'ALG-EIG-004': (
        'Vedrai che diagonalizzare significa scrivere \\(A\\) in una base di autovettori, dove agisce per scalature.',
        'Con gli autovettori visibili, immagina assi dove \\(A\\) solo stira.',
    ),
        'ALG-EIG-005': (
        'Vedrai che con \\(A=PDP^{-1}\\), elevare \\(A\\) a potenza significa elevare le scalature sulla diagonale.',
        'Esplora \\(A\\) e le sue direzioni proprie come scorciatoia per \\(A^n\\).',
    ),
        'ALG-EIG-006': (
        'Vedrai che nelle matrici simmetriche gli autovettori si possono scegliere ortogonali.',
        'Prova una \\(A\\) quasi simmetrica e guarda autovettori quasi perpendicolari.',
    ),
        'ALG-ORT-001': (
        'Vedrai che ortogonale significa angolo retto: il prodotto scalare è zero.',
        "Metti \\(u\\perp v\\) e nota: \\(u\\cdot v\\approx 0\\) e l'angolo è segnato come retto.",
    ),
        'ALG-ORT-002': (
        "Vedrai che la proiezione è l'ombra di \\(u\\) sulla direzione di \\(v\\).",
        "Trascina \\(u\\): il segmento arancione è la proiezione; il resto è l'errore ortogonale.",
    ),
        'ALG-ORT-003': (
        'Vedrai che una matrice ortogonale ruota/riflette senza cambiare lunghezze.',
        'Regola \\(A\\) verso una rotazione e guarda che la maglia non si stira in modo diseguale.',
    ),
        'ALG-ORT-004': (
        'Vedrai che Gram–Schmidt trasforma vettori in una base ortogonale passo dopo passo.',
        'Avanza il **Passo Gram-Schmidt** e osserva la nuova direzione ortogonale.',
    ),
        'ALG-LSQ-001': (
        'Vedrai che i minimi quadrati cercano il punto del sottospazio più vicino al dato.',
        'Muovi i vettori e il punto: la proiezione è la migliore approssimazione.',
    ),
        'ALG-LSQ-002': (
        'Vedrai che le equazioni normali \\(A^T Ax=A^T b\\) riassumono quel problema di proiezione.',
        "Modifica \\(A\\) e \\(b\\) come dati dell'adattamento lineare ai minimi quadrati.",
    ),
        'ALG-LSQ-003': (
        "Vedrai che la pseudoinversa generalizza l'inversa quando \\(A\\) non è invertibile.",
        'Esplora una \\(A\\) rettangolare/singolare e pensa alla «migliore» soluzione approssimata.',
    ),
        'ALG-DEC-001': (
        'Vedrai che LU spezza \\(A\\) in triangolare inferiore e superiore per risolvere i sistemi più facilmente.',
        'Tocca **Passo LU** e applica operazioni di riga: ti avvicini alla forma della fattorizzazione LU.',
    ),
        'ALG-DEC-002': (
        'Vedrai che QR scrive \\(A\\) come ortogonale/rotazione per triangolare.',
        'Osserva la maglia di \\(A\\) come composizione di una parte ortogonale e una triangolare.',
    ),
        'ALG-DEC-003': (
        'Vedrai che la decomposizione spettrale usa autovalori e autovettori.',
        'Attiva **Autovettori**: sono gli assi di quella decomposizione.',
    ),
        'ALG-DEC-004': (
        'Vedrai che SVD decompone \\(A\\) in ruotare → scalare → ruotare.',
        'Tocca il **Passo SVD/QR**: 1) orienta, 2) scala con \\(\\sigma\\), 3) ricomponi con \\(A\\).',
    ),
        'ALG-DEC-005': (
        'Vedrai che tenerti i \\(\\sigma\\) grandi approssima \\(A\\) con basso rango.',
        'Abbassa \\(k\\) con **Demo basso rango**: la maglia usa solo il maggiore valore singolare.',
    ),
        'ALG-NOR-001': (
        'Vedrai che una norma matriciale misura quanto \\(A\\) può stirare un vettore.',
        'Cambia \\(A\\) e nota: \\(\\sigma\\) grandi indicano stiramenti forti in qualche direzione.',
    ),
        'ALG-NOR-002': (
        'Vedrai che Frobenius misura la «dimensione» di \\(A\\) sommando tutti i quadrati delle voci.',
        'Modifica \\(A\\) e collega voci grandi a una norma più grande.',
    ),
        'ALG-NOR-003': (
        'Vedrai che la norma 1 è legata alle somme di colonne.',
        'Rendi una colonna molto più grande e guarda: quella norma cresce con essa.',
    ),
        'ALG-NOR-004': (
        'Vedrai che la norma infinito è legata alle somme di righe.',
        "Rendi una riga dominante e osserva l'effetto sulla dimensione di \\(A\\).",
    ),
        'ALG-NOR-005': (
        'Vedrai che la norma spettrale è il massimo stiramento (\\(\\sigma_1\\)).',
        "Guarda l'ellisse dei valori singolari: l'asse lungo è quello stiramento.",
    ),
        'ALG-NOR-006': (
        'Vedrai che \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\): la dimensione del prodotto non supera il prodotto delle dimensioni.',
        'Confronta visivamente quanto stira \\(A\\) rispetto a trasformazioni concatenate.',
    ),
        'ALG-NOR-007': (
        'Vedrai che il numero di condizionamento dice se un sistema è sensibile agli errori.',
        'Fai \\(\\sigma_1\\gg\\sigma_2\\) (\\(k\\) basso): la maglia si appiattisce e il problema diventa mal condizionato.',
    ),
        'ALG-BOO-001': (
        "Vedrai che puoi controllare un'identità logica riga per riga nella tavola di verità.",
        "Cambia le uscite con il pulsante: le righe arancioni non coincidono con l'atteso.",
    ),
        'ALG-BOO-002': (
        'Vedrai che alcune operazioni booleane si semplificano (idempotenza, complemento).',
        'Alterna \\(A\\) e \\(B\\) e confronta la tavola con il risultato in diretta.',
    ),
        'ALG-BOO-003': (
        "Vedrai che la distributività esiste anche in logica, non solo nell'algebra dei numeri.",
        "Controlla la tavola: AND/OR si ripartisce come nell'area \\(a(b+c)\\).",
    ),
        'ALG-BOO-004': (
        'Vedrai De Morgan: negare un AND è come un OR di negazioni (e viceversa).',
        'Cambia \\(A\\) e \\(B\\): le due espressioni di ciascuna legge danno sempre lo stesso risultato.',
    ),
        'ALG-BOO-005': (
        'Vedrai che XOR è vero quando \\(A\\) e \\(B\\) sono distinti.',
        'Prova le quattro combinazioni: solo 01 e 10 danno 1.',
    ),
        'ALG-BOO-006': (
        "Vedrai che l'assorbimento elimina termini ridondanti nelle espressioni booleane.",
        'Confronta le righe della tavola per vedere quali voci avanzano.',
    ),
        'ALG-BOO-007': (
        'Vedrai che la somma di prodotti scrive la funzione come OR di AND.',
        "Segna nella tavola le righe dove l'uscita è 1: quelli sono i tuoi prodotti.",
    ),
        'ALG-BOO-008': (
        'Vedrai che il prodotto di somme è la forma duale: AND di OR.',
        'Usa la tavola per vedere quali clausole coprono gli zeri della funzione.',
    ),
        'ALG-BOO-009': (
        'Vedrai che due espressioni sono equivalenti se la loro tavola di verità coincide.',
        'Modifica le uscite: se tutto resta ✓, le tavole coincidono.',
    ),
        'ALG-MOD-001': (
        "Vedrai che \\(a\\) e \\(b\\) sono congruenti modulo \\(m\\) se cadono sullo stesso «tick» dell'orologio.",
        'Muovi \\(a\\) e \\(b\\): il testo dice se \\(a\\equiv b\\pmod{m}\\) quando condividono il segno.',
    ),
        'ALG-MOD-002': (
        "Vedrai che sommare e moltiplicare modulo \\(m\\) significa operare e tornare all'orologio \\(0\\ldots m-1\\).",
        'Cambia \\(a\\), \\(b\\) e \\(m\\): i segni mostrano \\(a+b\\) e \\(a\\cdot b\\) sul cerchio.',
    ),
        'ALG-MOD-003': (
        "Vedrai che l'inverso di \\(a\\) modulo \\(m\\) esiste solo se \\(\\gcd(a,m)=1\\).",
        "Prova vari \\(a\\): se non c'è inverso, il testo lo indica.",
    ),
        'ALG-MOD-005': (
        'Vedrai che il teorema cinese combina due orologi (\\(m\\) e \\(m_2\\)) in una soluzione \\(x\\).',
        'Regola \\(a\\), \\(b\\), \\(m\\) e \\(m_2\\): quando esiste, compare la \\(x\\) che soddisfa entrambi i resti.',
    ),
        'ALG-MOD-006': (
        'Vedrai Fermat: se \\(p\\) è primo e \\(p\\) non divide \\(a\\), allora \\(a^{p-1}\\equiv 1\\pmod{p}\\).',
        'Con \\(m\\) primo, guarda \\(a^{p-1}\\) nella didascalia; dovrebbe essere 1 se \\(\\gcd(a,p)=1\\).',
    ),
        'ALG-EST-006': (
        'Vedrai che in un campo finito, somma e prodotto si avvolgono modulo \\(p\\).',
        'Scegli \\(p\\) e apri **Tabella +** / **Tabella ·**; tocca una cella per vedere risultato e inverso.',
    ),
        'ALG-COD-001': (
        "Vedrai che un codice lineare è un sottospazio: sommare parole di codice dà un'altra parola di codice.",
        "Leggi l'elenco dei codeword: la loro somma resta nell'insieme.",
    ),
        'ALG-COD-002': (
        'Vedrai che la matrice generatrice \\(G\\) fabbrica parole di codice a partire dai messaggi.',
        'Modifica bit/voci e pensa ogni riga di \\(G\\) come un motivo base del codice.',
    ),
        'ALG-COD-003': (
        'Vedrai che \\(H\\) controlla la parità: le parole valide soddisfano \\(Hc=0\\).',
        'Inverti un bit e collega il fallimento a una sindrome non nulla (in COD-004).',
    ),
        'ALG-COD-004': (
        'Vedrai che la sindrome indica (nei codici semplici) dove sta il bit errato.',
        "Scegli la posizione dell'errore: la sindrome \\(s\\) cambia all'istante.",
    ),
        'ALG-COD-005': (
        'Vedrai che la distanza di Hamming conta in quante posizioni differiscono due parole.',
        'Modifica le due stringhe: i bit diversi si evidenziano e \\(d_H\\) si aggiorna.',
    ),
        'ALG-COD-006': (
        'Vedrai che con distanza minima \\(d\\) puoi rilevare/correggere un numero limitato di errori.',
        'Muovi \\(d_{\\min}\\): il raggio di correzione \\(t=\\lfloor(d-1)/2\\rfloor\\) cambia con esso.',
    ),
        'ALG-COD-007': (
        'Vedrai che il tasso \\(k/n\\) misura quanta informazione utile porti rispetto alla lunghezza totale.',
        'Regola \\(n\\) e \\(k\\): la barra mostra la parte messaggio rispetto alla ridondanza.',
    ),
    },
    'pt': {
        'ALG-FND-001': (
        'Vais ver que a ordem não importa: \\(a+b\\) e \\(b+a\\) somam o mesmo.',
        'Move \(a\) e \(b\) e compara as duas filas: em cima \(a+b\), em baixo \(b+a\); as barras ficam do mesmo comprimento.',
    ),
        'ALG-FND-002': (
        'Vais ver que agrupar de outra forma não muda o total: \\((a+b)+c\\) e \\(a+(b+c)\\) dão o mesmo.',
        'Move \(a\), \(b\) e \(c\) e compara as duas filas: a caixa agrupa de outra forma, mas o total é o mesmo.',
    ),
        'ALG-FND-003': (
        'Vais ver que \\(a(b+c)\\) é a mesma área que \\(ab+ac\\).',
        'Move \\(a\\), \\(b\\) e \\(c\\) e compara os dois painéis: à esquerda um retângulo só; à direita \\(ab\\) e \\(ac\\) separados.',
    ),
        'ALG-FND-006': (
        'Vais ver que \\(|x|\\) é a distância ao zero: nunca desce abaixo de zero.',
        'Move \\(x\\) para a esquerda ou para a direita e repara: a marca só conta quanto te afastas da origem.',
    ),
        'ALG-FND-007': (
        'Vais ver que a distância entre dois pontos é o comprimento do segmento que os une: \\(|a-b|\\).',
        'Move \\(a\\) e \\(b\\) e olha o comprimento entre eles: essa medida é \\(|a-b|\\).',
    ),
        'ALG-POT-001': (
        'Vais ver que ao multiplicar potências da mesma base, os expoentes somam-se: \\(a^n a^m = a^{n+m}\\).',
        'Muda \\(n\\) e \\(m\\) e repara como os blocos de \\(a^n\\) e \\(a^m\\) se juntam em \\(a^{n+m}\\).',
    ),
        'ALG-POT-008': (
        'Vais ver que o conjugado ajuda a tirar uma raiz do denominador.',
        'Compara \\(a+\\sqrt{b}\\) com \\(a-\\sqrt{b}\\) e olha o produto: o resultado fica sem raiz no meio.',
    ),
        'ALG-EXP-003': (
        'Vais ver por que \\((ax+b)(cx+d)=acx^2+(ad+bc)x+bd\\) e como \\(adx\\) e \\(bcx\\) se somam.',
        'Cada termo do primeiro polinómio multiplica-se por cada termo do segundo; depois agrupam-se as mesmas potências de \\(x\\).',
    ),
        'ALG-IDN-001': (
        'Vais ver que o \\(2\\) de \\(2ab\\) aparece porque há dois retângulos distintos de área \\(ab\\).',
        'Um quadrado de lado \\(a+b\\) tem área \\((a+b)^2\\); ao partir cada lado em \\(a\\) e \\(b\\) aparecem \\(a^2\\), dois \\(ab\\) e \\(b^2\\).',
    ),
        'ALG-IDN-002': (
        'Vais ver por que aparece \\(-2ab\\) e por que é precisa a correção \\(+b^2\\).',
        'Partimos de um quadrado de área \\(a^2\\); ao tirar duas faixas \\(ab\\) e corrigir com \\(+b^2\\) fica \\((a-b)^2\\).',
    ),
        'ALG-IDN-003': (
        'Vais ver que \\(a^2-b^2\\) é a área que fica ao tirar um quadrado pequeno de um grande.',
        'Toca para passar de \\(a^2-b^2\\) ao retângulo \\((a-b)(a+b)\\) e repara: é a mesma quantidade.',
    ),
        'ALG-IDN-008': (
        'Vais ver que os coeficientes do binómio são a linha de Pascal.',
        'Muda \\(n\\) e olha os números de Pascal: assim se monta \\((a+b)^n\\).',
    ),
        'ALG-FAC-001': (
        'Vais ver que pôr em evidência um fator comum é reagrupar áreas que partilham um lado.',
        'Move \\(a\\), \\(b\\) e \\(c\\) e compara os dois painéis: pôr \\(a\\) em evidência junta \\(ab\\) e \\(ac\\) num só retângulo.',
    ),
        'ALG-FAC-002': (
        'Vais ver que fatorar \\(a^2-b^2\\) é remontar a área restante como um retângulo.',
        'Alterna entre \\(a^2-b^2\\) e \\((a-b)(a+b)\\) e olha: representam o mesmo.',
    ),
        'ALG-FAC-003': (
        'Vais ver que um trinómio quadrado perfeito se monta como um quadrado completo.',
        'Ajusta \\(a\\) e \\(b\\) até veres o padrão \\((a\\pm b)^2\\) nas peças.',
    ),
        'ALG-EQU-001': (
        'Vais ver que uma equação linear é uma reta: a solução é onde corta o eixo \\(x\\).',
        'Move o declive e a ordenada na origem e procura onde a reta cruza o eixo horizontal.',
    ),
        'ALG-EQU-003': (
        'Vais ver que a parábola corta o eixo \\(x\\) nas soluções (se existirem).',
        'Muda \\(a\\), \\(b\\) e \\(c\\) e olha o discriminante \\(\\Delta\\) e as marcas laranja das raízes.',
    ),
        'ALG-EQU-004': (
        'Vais ver que o discriminante \\(\\Delta\\) te diz quantas raízes reais tem a quadrática.',
        'Ajusta \\(a\\), \\(b\\) e \\(c\\) e repara se há 2, 1 ou nenhuma raiz real segundo \\(\\Delta\\).',
    ),
        'ALG-EQU-005': (
        'Vais ver que completar o quadrado é adicionar (e depois subtrair) o canto que falta.',
        'Toca em **Adicionar (b/2)²** ou **Subtrair (b/2)²** e olha de onde vem \\(\\left(b/2\\right)^2\\).',
    ),
        'ALG-EQU-008': (
        'Vais ver que uma equação com valor absoluto costuma ter duas soluções simétricas.',
        'Move o ponto na reta e relaciona as distâncias com as soluções.',
    ),
        'ALG-INE-001': (
        'Vais ver que uma inequação linear pinta um raio ou um intervalo na reta.',
        'Muda o bordo e o tipo de desigualdade: a zona sombreada é a tua solução.',
    ),
        'ALG-INE-002': (
        'Vais ver que a solução de uma inequação quadrática é onde a parábola está acima (ou abaixo) do eixo.',
        'Ajusta a parábola e olha a zona sombreada: marca os \\(x\\) que cumprem a desigualdade.',
    ),
        'ALG-INE-003': (
        'Vais ver que em inequações racionais tens de cuidar dos pontos onde o denominador se anula.',
        'Move o bordo e repara que parte da reta fica permitida.',
    ),
        'ALG-INE-004': (
        'Vais ver que o valor absoluto em desigualdades define intervalos centrados ou exteriores.',
        'Muda o raio e toca em **Extremos fechados** para ver como o intervalo solução abre ou fecha.',
    ),
        'ALG-SIS-001': (
        'Vais ver que um sistema \\(2\\times 2\\) são duas retas: a solução é o seu cruzamento (se se cortarem).',
        'Move o declive e olha o ponto laranja: marca a interseção, ou verás se são paralelas.',
    ),
        'ALG-SIS-002': (
        'Vais ver que um sistema linear se compacta em \\(Ax=b\\): as linhas de \\(A\\) são equações, as colunas são variáveis; \\(\\det(A)\\neq0\\) implica solução única.',
        'Edita \\(A\\) e \\(b\\): compara o sistema tradicional com a forma matricial, a expansão de \\(Ax\\) e o determinante.',
    ),
        'ALG-SIS-003': (
        'Vais ver que a matriz aumentada \\([A\\mid b]\\) reúne coeficientes e termos independentes: cada linha é uma equação do sistema.',
        'Escolhe \\(R_1\\) ou \\(R_2\\) e edita \\(A\\) e \\(b\\): vês a matriz, a linha ativa e o sistema completo ao mesmo tempo.',
    ),
        'ALG-SIS-004': (
        'Vais ver que as operações elementares mudam a forma do sistema, não a solução: assim se constroem Gauss e Gauss–Jordan.',
        'Escolhe \\(R_i\\leftrightarrow R_j\\), \\(cR_i\\) ou \\(R_i+cR_j\\) com linhas e \\(c\\); aplica e compara com o sistema original.',
    ),
        'ALG-SIS-005': (
        'Vais ver o critério completo: postos distintos ⇒ sem solução; postos iguais a \\(n\\) ⇒ uma; postos iguais e < \\(n\\) ⇒ infinitas.',
        'Carrega os três casos ou edita \\([A\\mid b]\\): olha rank(A), rank([A|b]) e \\(n\\), e segue as duas comparações.',
    ),
        'ALG-FUN-001': (
        'Vais ver que o domínio é o conjunto dos \\(x\\) para os quais \\(f(x)\\) está definida, não só um buraco no gráfico.',
        'Move \\(b\\) e observa como o valor excluído, a assíntota e o domínio se deslocam juntos.',
    ),
        'ALG-FUN-002': (
        'Vais ver que compor funções é aplicar uma depois da outra.',
        'Move \\(x_0\\) e os parâmetros e repara: o valor mostrado é \\(f(g(x))\\).',
    ),
        'ALG-FUN-003': (
        'Vais ver que a inversa «desfaz» a função: os seus gráficos são simétricos em relação a \\(y=x\\).',
        'Compara a curva e a sua inversa; a diagonal tracejada é o espelho \\(y=x\\).',
    ),
        'ALG-FUN-005': (
        'Vais ver que uma reta fica determinada pelo declive e pelo corte com o eixo \\(y\\).',
        'Move \\(m\\) e \\(b\\) e olha: a reta inclina-se e desloca-se de imediato.',
    ),
        'ALG-FUN-006': (
        'Vais ver que retas paralelas têm o mesmo declive; perpendiculares, declives inversos com sinal trocado.',
        'Ajusta as duas retas e repara quando não se cortam ou se cruzam em ângulo reto.',
    ),
        'ALG-FUN-007': (
        'Vais ver que transladar um gráfico é movê-lo sem o deformar.',
        'Move \\(h\\) e \\(k\\) e olha como a curva se desloca na horizontal e na vertical.',
    ),
        'ALG-FUN-008': (
        'Vais ver que escalar e refletir esticam, comprimem ou viram a curva.',
        'Muda \\(a\\) e toca em **Reflexão horizontal**: olha como a onda se deforma face ao original.',
    ),
        'ALG-POL-007': (
        'Vais ver que um polinómio em duas variáveis atribui um valor a cada ponto \\((x,y)\\).',
        'Move \\(a\\), \\(b\\) e \\(c\\) e repara: o mapa de cor mostra \\(z=ax^2+bxy+cy^2\\).',
    ),
        'ALG-POL-008': (
        'Vais ver que o grau total soma os expoentes de cada variável.',
        'Muda \\(\\alpha\\) e \\(\\beta\\) e olha o retângulo: ilustra o grau \\(\\alpha+\\beta\\) do monómio \\(x^{\\alpha}y^{\\beta}\\).',
    ),
        'ALG-POL-009': (
        'Vais ver que num polinómio homogéneo, escalar \\((x,y)\\) escala o resultado de forma previsível.',
        'Ativa a **forma homogênea** e move \\(t\\): compara \\(P(tx,ty)\\) com \\(t^d P(x,y)\\).',
    ),
        'ALG-POL-010': (
        'Vais ver que um sistema polinomial se vê como curvas que se cortam nas soluções.',
        'Ajusta os parâmetros e procura os cruzamentos entre as duas curvas.',
    ),
        'ALG-POL-011': (
        'Vais ver que a resultante concentra condições de solução comum numa matriz.',
        'Edita a matriz e olha o determinante: é um sinal de raízes partilhadas.',
    ),
        'ALG-LOG-001': (
        'Vais ver que a exponencial cresce (ou decresce) multiplicando uma e outra vez.',
        'Muda a base e repara: a curva fica mais íngreme ou mais suave.',
    ),
        'ALG-LOG-002': (
        'Vais ver que o logaritmo responde: «a que expoente elevo a base para obter \\(x\\)?».',
        'Compara log e exponencial: são inversas; a diagonal \\(y=x\\) reflete-as.',
    ),
        'ALG-LOG-007': (
        'Vais ver que o sinal do expoente decide se a quantidade cresce ou se apaga.',
        'Move \\(k\\) (via \\(b\\)) e olha se a curva sobe ou desce com o tempo.',
    ),
        'ALG-COM-001': (
        'Vais ver que um complexo \\(a+bi\\) é um ponto (ou seta) no plano.',
        'Arrasta a ponta e repara: as coordenadas são a parte real e imaginária.',
    ),
        'ALG-COM-002': (
        'Vais ver que o conjugado reflete o número em relação ao eixo real.',
        'Arrasta \\(z\\) e olha a seta laranja: é o conjugado (mesma \\(x\\), \\(y\\) ao contrário).',
    ),
        'ALG-COM-003': (
        'Vais ver que o módulo é o comprimento da seta desde a origem.',
        'Estica ou encurta o vetor e repara: o número \\(r\\) é esse comprimento.',
    ),
        'ALG-COM-004': (
        'Vais ver que na forma polar usas comprimento e ângulo em vez de \\((x,y)\\).',
        'Roda \\(\\theta\\) e olha: o ponto move-se no círculo de raio \\(r\\).',
    ),
        'ALG-COM-005': (
        'Vais ver que Euler liga o ângulo ao cosseno e ao seno no círculo unitário.',
        'Move \\(\\theta\\) e repara: o ponto \\((\\cos\\theta,\\sin\\theta)\\) percorre a circunferência.',
    ),
        'ALG-COM-006': (
        'Vais ver que elevar a \\(n\\) multiplica o ângulo por \\(n\\) e potencia o raio.',
        'Muda \\(n\\) e \\(\\theta\\) e olha \\(z\\), \\(z^2\\), \\(z^3\\ldots\\) a girar e a afastar-se segundo \\(r^n\\).',
    ),
        'ALG-COM-007': (
        'Vais ver que as raízes \\(n\\)-ésimas se distribuem como vértices de um polígono regular.',
        'Muda \\(n\\) e repara: os pontos laranja distribuem-se no círculo.',
    ),
        'ALG-SEC-001': (
        'Vais ver que numa sucessão aritmética cada salto soma a mesma quantidade.',
        'Move \\(a_1\\) e \\(d\\) e olha: os pontos sobem ou descem a passos constantes.',
    ),
        'ALG-SEC-003': (
        'Vais ver que numa sucessão geométrica cada termo se multiplica por \\(r\\).',
        'Muda \\(a\\) e \\(r\\) e repara: os pontos crescem ou aproximam-se de zero segundo \\(|r|\\).',
    ),
        'ALG-SEC-005': (
        'Vais ver que se \\(|r|<1\\), a série geométrica infinita aproxima-se de um valor limite.',
        'Experimenta \\(|r|<1\\) e \\(|r|\\ge 1\\) e olha se os pontos estabilizam ou disparam.',
    ),
        'ALG-SEC-007': (
        'Vais ver que uma recorrência constrói cada termo a partir dos anteriores.',
        'Muda os coeficientes e repara como evolui a sucessão ponto a ponto.',
    ),
        'ALG-VEC-001': (
        'Vais ver que um vetor é uma seta: direção e comprimento.',
        'Arrasta as pontas e olha como o vetor muda no plano.',
    ),
        'ALG-VEC-002': (
        'Vais ver que a norma é o comprimento da seta.',
        'Estica \\(u\\) e repara: o valor \\(\\|u\\|\\) atualiza-se com o comprimento.',
    ),
        'ALG-VEC-003': (
        'Vais ver que o vetor unitário tem comprimento 1 e guarda a direção.',
        'Move \\(u\\) e olha a versão normalizada \\(\\hat{u}\\) de comprimento 1.',
    ),
        'ALG-VEC-004': (
        'Vais ver que o produto escalar mede o alinhamento: positivo significa ângulo agudo.',
        'Arrasta \\(u\\) e \\(v\\) e olha \\(u\\cdot v\\): se o ângulo é agudo, reto ou obtuso; a projeção aparece a laranja.',
    ),
        'ALG-VEC-005': (
        'Vais ver que o ângulo entre vetores lê-se no produto escalar.',
        'Move as setas e repara: o ângulo e o tipo (agudo/reto/obtuso) atualizam-se.',
    ),
        'ALG-VEC-006': (
        'Vais ver que a distância entre as pontas dos vetores é a norma da diferença.',
        'Separa \\(u\\) e \\(v\\) e olha: a distância cresce com a separação.',
    ),
        'ALG-VEC-007': (
        'Vais ver que uma combinação linear mistura vetores com pesos.',
        'Arrasta \\(u\\) e \\(v\\) e repara: a seta laranja é \\(0.7u+0.5v\\).',
    ),
        'ALG-MAT-001': (
        'Vais ver que uma matriz é uma tabela de números em linhas e colunas.',
        'Edita as entradas de \\(A\\) e olha: cada célula é um coeficiente do objeto linear.',
    ),
        'ALG-MAT-002': (
        'Vais ver que somar matrizes faz-se casa a casa.',
        'Muda \\(A\\) e \\(B\\) e repara: o resultado \\(A+B\\) atualiza-se entrada a entrada.',
    ),
        'ALG-MAT-003': (
        'Vais ver que multiplicar por um escalar estica ou inverte todos os números da matriz.',
        'Move \\(c\\) e olha \\(cA\\): cresce, encolhe ou muda de sinal.',
    ),
        'ALG-MAT-004': (
        'Vais ver que cada entrada de \\(AB\\) mistura uma linha de \\(A\\) com uma coluna de \\(B\\).',
        'Escolhe uma casa \\((i,j)\\) e olha abaixo: vês a conta linha×coluna passo a passo.',
    ),
        'ALG-MAT-005': (
        'Vais ver que a identidade deixa os vetores iguais: é o «1» das matrizes.',
        'Compara \\(A\\) com o efeito da identidade sobre a base.',
    ),
        'ALG-MAT-006': (
        'Vais ver que a transposta troca linhas por colunas.',
        'Edita \\(A\\) e olha à direita \\(A^T\\): linhas e colunas viradas.',
    ),
        'ALG-MAT-007': (
        'Vais ver que uma matriz simétrica coincide com a sua transposta.',
        'Ajusta \\(A\\) até coincidir com \\(A^T\\).',
    ),
        'ALG-DET-001': (
        'Vais ver que o determinante \\(2\\times 2\\) é a área com sinal do paralelogramo das colunas.',
        'Move os vetores e repara: a área colorida é \\(|\\det|\\); o sinal indica a orientação.',
    ),
        'ALG-DET-002': (
        'Vais ver que o determinante se pode expandir por uma linha ou coluna (cofatores).',
        'Edita \\(A\\) e olha como \\(\\det(A)\\) responde às mudanças.',
    ),
        'ALG-DET-003': (
        'Vais ver que \\(\\det(AB)=\\det(A)\\det(B)\\): as áreas multiplicam-se.',
        'Muda \\(A\\) e \\(B\\) e compara a área do produto com o produto das áreas.',
    ),
        'ALG-DET-004': (
        'Vais ver que se a área (\\(\\det\\)) for zero, as colunas são paralelas e não há inversa.',
        'Achata o paralelogramo (área \\(\\approx 0\\)) e repara: a matriz torna-se singular.',
    ),
        'ALG-DET-005': (
        'Vais ver que a inversa «desfaz» \\(A\\); existe só se \\(\\det\\neq 0\\).',
        'Edita \\(A\\) e olha \\(\\det\\): se não for zero, a inversa está bem definida.',
    ),
        'ALG-DET-006': (
        'Vais ver que Cramer usa determinantes para resolver sistemas pequenos.',
        'Muda \\(A\\) e \\(b\\) e relaciona \\(\\det(A)\\) com a possibilidade de solução única.',
    ),
        'ALG-ESP-001': (
        'Vais ver que o espaço gerado são todas as misturas \\(s\\cdot u+t\\cdot v\\).',
        'Move \\(s\\) e \\(t\\) e olha a seta laranja: varre o plano (ou a reta) que \\(u\\) e \\(v\\) geram.',
    ),
        'ALG-ESP-002': (
        'Vais ver que se a área do paralelogramo for zero, os vetores são dependentes.',
        'Alinha \\(u\\) e \\(v\\) e repara: o indicador passa a «dependentes».',
    ),
        'ALG-ESP-003': (
        'Vais ver que uma base é um conjunto independente que gera todo o espaço.',
        'Ativa **Mostrar base** e compara com os teus vetores \\(u\\) e \\(v\\).',
    ),
        'ALG-ESP-004': (
        'Vais ver que as coordenadas dizem quanto de cada vetor da base precisas.',
        'Muda \\(s\\) e \\(t\\): são as coordenadas da combinação na base \\(u\\), \\(v\\).',
    ),
        'ALG-ESP-005': (
        'Vais ver que o posto é quantas direções independentes tem a matriz.',
        'Edita \\(A\\) e olha o determinante/posto: verás se há 0, 1 ou 2 direções.',
    ),
        'ALG-ESP-006': (
        'Vais ver que a nulidade conta soluções não triviais de \\(Ax=0\\).',
        'Torna colunas dependentes e relaciona com direções que vão à origem.',
    ),
        'ALG-ESP-007': (
        'Vais ver que posto + nulidade = número de colunas (no caso \\(n\\)).',
        'Explora vetores dependentes/independentes e repara como se reparte a dimensão.',
    ),
        'ALG-TRA-001': (
        'Vais ver que uma transformação linear respeita somas e escalamentos.',
        'Olha a grelha deformada por \\(A\\): as retas continuam retas.',
    ),
        'ALG-TRA-002': (
        'Vais ver que aplicar \\(A\\) é empurrar cada ponto (e a grelha) para uma nova forma.',
        'Muda as entradas de \\(A\\) e repara: a malha mostra o empurrão linear.',
    ),
        'ALG-TRA-003': (
        'Vais ver que o núcleo são os vetores que \\(A\\) manda para a origem.',
        'Procura direções que se achatam quando \\(\\det\\) se aproxima de zero.',
    ),
        'ALG-TRA-004': (
        'Vais ver que a imagem são as direções que \\(A\\) consegue atingir.',
        'Observa para onde apontam as colunas transformadas \\(e_1\\) e \\(e_2\\).',
    ),
        'ALG-TRA-005': (
        'Vais ver que compor transformações é aplicar uma depois da outra (produto de matrizes).',
        'Muda \\(A\\) e pensa \\(A\\) como um passo da composição.',
    ),
        'ALG-TRA-006': (
        'Vais ver que a inversa desfaz o empurrão de \\(A\\).',
        'Toca em **Aplicar A⁻¹** (se existir) e olha: a malha volta à forma original.',
    ),
        'ALG-TRA-007': (
        'Vais ver que mudar de base é descrever os mesmos vetores com outras coordenadas.',
        'Modifica \\(A\\) como matriz de mudança e repara como a malha se reorienta.',
    ),
        'ALG-EIG-001': (
        'Vais ver que um autovetor só se estica ou encolhe; não gira para o lado.',
        'Ativa **Autovetores** e olha os raios laranja: marcam essas direções especiais.',
    ),
        'ALG-EIG-002': (
        'Vais ver que a equação característica encontra os valores próprios (fatores de esticamento).',
        'Edita \\(A\\) e relaciona \\(\\det(A-\\lambda I)=0\\) com as direções que vês na malha.',
    ),
        'ALG-EIG-003': (
        'Vais ver que o autoespaço é a reta (ou plano) de todos os autovetores de um \\(\\lambda\\).',
        'Observa a direção laranja associada a cada valor próprio.',
    ),
        'ALG-EIG-004': (
        'Vais ver que diagonalizar é escrever \\(A\\) numa base de autovetores, onde age por escalamentos.',
        'Com autovetores visíveis, imagina eixos onde \\(A\\) só estica.',
    ),
        'ALG-EIG-005': (
        'Vais ver que com \\(A=PDP^{-1}\\), potenciar \\(A\\) é potenciar os escalamentos na diagonal.',
        'Explora \\(A\\) e as suas direções próprias como atalho para \\(A^n\\).',
    ),
        'ALG-EIG-006': (
        'Vais ver que em matrizes simétricas, os autovetores podem escolher-se ortogonais.',
        'Experimenta uma \\(A\\) quase simétrica e olha autovetores quase perpendiculares.',
    ),
        'ALG-ORT-001': (
        'Vais ver que ortogonal significa ângulo reto: o produto escalar é zero.',
        'Coloca \\(u\\perp v\\) e repara: \\(u\\cdot v\\approx 0\\) e o ângulo marca-se como reto.',
    ),
        'ALG-ORT-002': (
        'Vais ver que a projeção é a sombra de \\(u\\) sobre a direção de \\(v\\).',
        'Arrasta \\(u\\): o segmento laranja é a projeção; o resto é o erro ortogonal.',
    ),
        'ALG-ORT-003': (
        'Vais ver que uma matriz ortogonal roda/reflete sem mudar comprimentos.',
        'Ajusta \\(A\\) para uma rotação e olha que a malha não se estica de forma desigual.',
    ),
        'ALG-ORT-004': (
        'Vais ver que Gram–Schmidt transforma vetores numa base ortogonal passo a passo.',
        'Avança o **Passo Gram-Schmidt** e observa a nova direção ortogonal.',
    ),
        'ALG-LSQ-001': (
        'Vais ver que mínimos quadrados procura o ponto do subespaço mais próximo do dado.',
        'Move os vetores e o ponto: a projeção é a melhor aproximação.',
    ),
        'ALG-LSQ-002': (
        'Vais ver que as equações normais \\(A^T Ax=A^T b\\) resumem esse problema de projeção.',
        'Edita \\(A\\) e \\(b\\) como dados do ajuste linear por mínimos quadrados.',
    ),
        'ALG-LSQ-003': (
        'Vais ver que a pseudoinversa generaliza a inversa quando \\(A\\) não é invertível.',
        'Explora uma \\(A\\) retangular/singular e pensa na «melhor» solução aproximada.',
    ),
        'ALG-DEC-001': (
        'Vais ver que LU parte \\(A\\) em triangular inferior e superior para resolver sistemas mais fácil.',
        'Toca em **Passo LU** e aplica operações de linha: aproximas-te da forma da fatoração LU.',
    ),
        'ALG-DEC-002': (
        'Vais ver que QR escreve \\(A\\) como ortogonal/rotação por triangular.',
        'Observa a malha de \\(A\\) como composição de uma parte ortogonal e outra triangular.',
    ),
        'ALG-DEC-003': (
        'Vais ver que a decomposição espetral usa valores e vetores próprios.',
        'Ativa **Autovetores**: são os eixos dessa decomposição.',
    ),
        'ALG-DEC-004': (
        'Vais ver que SVD decompõe \\(A\\) em rodar → escalar → rodar.',
        'Toca no **Passo SVD/QR**: 1) orienta, 2) escala com \\(\\sigma\\), 3) recompor com \\(A\\).',
    ),
        'ALG-DEC-005': (
        'Vais ver que ficares com os \\(\\sigma\\) grandes aproxima \\(A\\) com posto baixo.',
        'Baixa \\(k\\) com **Demo baixo posto**: a malha usa só o maior valor singular.',
    ),
        'ALG-NOR-001': (
        'Vais ver que uma norma matricial mede quanto \\(A\\) pode esticar um vetor.',
        'Muda \\(A\\) e repara: \\(\\sigma\\) grandes indicam esticamentos fortes nalguma direção.',
    ),
        'ALG-NOR-002': (
        'Vais ver que Frobenius mede o «tamanho» de \\(A\\) somando todas as entradas ao quadrado.',
        'Edita \\(A\\) e relaciona entradas grandes com uma norma maior.',
    ),
        'ALG-NOR-003': (
        'Vais ver que a norma 1 liga-se a somas de colunas.',
        'Torna uma coluna muito maior e olha: essa norma cresce com ela.',
    ),
        'ALG-NOR-004': (
        'Vais ver que a norma infinito liga-se a somas de linhas.',
        'Torna uma linha dominante e observa o efeito no tamanho de \\(A\\).',
    ),
        'ALG-NOR-005': (
        'Vais ver que a norma espetral é o maior esticamento (\\(\\sigma_1\\)).',
        'Olha a elipse dos valores singulares: o eixo longo é esse esticamento.',
    ),
        'ALG-NOR-006': (
        'Vais ver que \\(\\|AB\\|\\le\\|A\\|\\|B\\|\\): o tamanho do produto não ultrapassa o produto dos tamanhos.',
        'Compara visualmente quanto estica \\(A\\) face a transformações encadeadas.',
    ),
        'ALG-NOR-007': (
        'Vais ver que o número de condição diz se um sistema é sensível a erros.',
        'Faz \\(\\sigma_1\\gg\\sigma_2\\) (\\(k\\) baixo): a malha achata-se e o problema fica mal condicionado.',
    ),
        'ALG-BOO-001': (
        'Vais ver que podes verificar uma identidade lógica linha a linha na tabela de verdade.',
        'Muda as saídas com o botão: as linhas a laranja não coincidem com o esperado.',
    ),
        'ALG-BOO-002': (
        'Vais ver que algumas operações booleanas se simplificam (idempotência, complemento).',
        'Alterna \\(A\\) e \\(B\\) e compara a tabela com o resultado em direto.',
    ),
        'ALG-BOO-003': (
        'Vais ver que a distributividade também existe em lógica, não só na álgebra dos números.',
        'Revisa a tabela: AND/OR reparte-se como na área \\(a(b+c)\\).',
    ),
        'ALG-BOO-004': (
        'Vais ver De Morgan: negar um AND é como um OR de negações (e o contrário).',
        'Muda \\(A\\) e \\(B\\): as duas expressões de cada lei dão sempre o mesmo resultado.',
    ),
        'ALG-BOO-005': (
        'Vais ver que XOR é verdadeiro quando \\(A\\) e \\(B\\) são distintos.',
        'Experimenta as quatro combinações: só 01 e 10 dão 1.',
    ),
        'ALG-BOO-006': (
        'Vais ver que a absorção elimina termos redundantes em expressões booleanas.',
        'Compara linhas da tabela para ver que entradas sobram.',
    ),
        'ALG-BOO-007': (
        'Vais ver que soma de produtos escreve a função como ORs de ANDs.',
        'Marca na tabela as linhas onde a saída é 1: esses são os teus produtos.',
    ),
        'ALG-BOO-008': (
        'Vais ver que produto de somas é a forma dual: ANDs de ORs.',
        'Usa a tabela para ver que cláusulas cobrem os zeros da função.',
    ),
        'ALG-BOO-009': (
        'Vais ver que duas expressões são equivalentes se a tabela de verdade coincidir.',
        'Edita saídas: se tudo ficar em ✓, as tabelas coincidem.',
    ),
        'ALG-MOD-001': (
        'Vais ver que \\(a\\) e \\(b\\) são congruentes módulo \\(m\\) se caírem no mesmo «tick» do relógio.',
        'Move \\(a\\) e \\(b\\): o texto diz se \\(a\\equiv b\\pmod{m}\\) quando partilham marca.',
    ),
        'ALG-MOD-002': (
        'Vais ver que somar e multiplicar módulo \\(m\\) é operar e voltar ao relógio \\(0\\ldots m-1\\).',
        'Muda \\(a\\), \\(b\\) e \\(m\\): as marcas mostram \\(a+b\\) e \\(a\\cdot b\\) no círculo.',
    ),
        'ALG-MOD-003': (
        'Vais ver que o inverso de \\(a\\) módulo \\(m\\) existe só se \\(\\gcd(a,m)=1\\).',
        'Experimenta vários \\(a\\): se não houver inverso, o texto indica-o.',
    ),
        'ALG-MOD-005': (
        'Vais ver que o teorema chinês combina dois relógios (\\(m\\) e \\(m_2\\)) numa solução \\(x\\).',
        'Ajusta \\(a\\), \\(b\\), \\(m\\) e \\(m_2\\): quando existe, aparece o \\(x\\) que cumpre ambos os restos.',
    ),
        'ALG-MOD-006': (
        'Vais ver Fermat: se \\(p\\) é primo e \\(p\\) não divide \\(a\\), então \\(a^{p-1}\\equiv 1\\pmod{p}\\).',
        'Com \\(m\\) primo, olha \\(a^{p-1}\\) na legenda; deve ser 1 se \\(\\gcd(a,p)=1\\).',
    ),
        'ALG-EST-006': (
        'Vais ver que num corpo finito, soma e produto envolvem-se módulo \\(p\\).',
        'Escolhe \\(p\\) e abre **Tabela +** / **Tabela ·**; toca numa célula para ver o resultado e o inverso.',
    ),
        'ALG-COD-001': (
        'Vais ver que um código linear é um subespaço: somar palavras de código dá outra palavra de código.',
        'Lê a lista de codewords: a sua soma permanece dentro do conjunto.',
    ),
        'ALG-COD-002': (
        'Vais ver que a matriz geradora \\(G\\) fabrica palavras de código a partir de mensagens.',
        'Edita bits/entradas e pensa cada linha de \\(G\\) como um padrão base do código.',
    ),
        'ALG-COD-003': (
        'Vais ver que \\(H\\) verifica paridade: as palavras válidas cumprem \\(Hc=0\\).',
        'Inverte um bit e relaciona a falha com um síndrome não nulo (em COD-004).',
    ),
        'ALG-COD-004': (
        'Vais ver que o síndrome aponta (em códigos simples) onde está o bit errado.',
        'Escolhe a posição do erro: o síndrome \\(s\\) muda de imediato.',
    ),
        'ALG-COD-005': (
        'Vais ver que a distância de Hamming conta em quantas posições diferem duas palavras.',
        'Edita as duas cadeias: os bits distintos destacam-se e \\(d_H\\) atualiza-se.',
    ),
        'ALG-COD-006': (
        'Vais ver que com distância mínima \\(d\\) podes detetar/corrigir uma quantidade limitada de erros.',
        'Move \\(d_{\\min}\\): o raio de correção \\(t=\\lfloor(d-1)/2\\rfloor\\) muda com ele.',
    ),
        'ALG-COD-007': (
        'Vais ver que a taxa \\(k/n\\) mede quanta informação útil levas face ao comprimento total.',
        'Ajusta \\(n\\) e \\(k\\): a barra mostra a parte de mensagem face à de redundância.',
    ),
    },
}

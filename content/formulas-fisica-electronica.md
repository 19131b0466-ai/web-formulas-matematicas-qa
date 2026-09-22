# Fórmulas de Física Electrónica

Catálogo canónico en español para el curso **Física Electrónica**. Reúne modelos de circuitos, dispositivos y hardware digital con convenciones SI.

# Índice

1. Mapa del curso y prerrequisitos
2. Redes resistivas
3. Capacitores e inductores en circuitos
4. Transitorios de primer orden
5. Circuitos RLC de segundo orden
6. Corriente alterna y fasores
7. Potencia en CA y resonancia
8. Filtros y respuesta en frecuencia
9. Transformadores
10. Semiconductores y diodos
11. Transistores BJT
12. Transistores FET
13. Amplificadores y operacional
14. Familias lógicas y puertas
15. Lógica combinacional
16. Lógica secuencial
17. Conversión A/D–D/A y muestreo
18. Guía para enfocar un circuito

# Notación general

Se usa el SI. Las letras minúsculas representan valores instantáneos y las mayúsculas, valores constantes o RMS según el contexto. Los fasores llevan subrayado y son RMS. \(j=\sqrt{-1}\), \(\omega=2\pi f\), tierra es la referencia de potencial y el sentido pasivo fija potencia absorbida positiva.

# 1. Mapa del curso y prerrequisitos

El recorrido recomendado avanza de DC resistiva a transitorios, luego AC y fasores, dispositivos analógicos y hardware digital:

1. Repasar tensión, corriente, potencia y ley de Ohm (`ELE-008`, `ELE-009`).
2. Aplicar Kirchhoff y asociaciones resistivas (`ELE-014`, `ELE-015`, `ELE-016`, `ELE-017`).
3. Incorporar almacenamiento en capacitores e inductores (`ELE-018`, `ELE-019`, `ELE-020`).
4. Estudiar conmutación RC/RL y luego dinámica RLC.
5. Pasar al régimen sinusoidal, potencia, resonancia y filtros.
6. Modelar transformadores, diodos, transistores y operacionales.
7. Cerrar con interfaces eléctricas, lógica combinacional, secuencial y conversión de datos.

Los contenidos `ELE-008` a `ELE-020` son prerrequisitos: aquí no se recatalogan, sino que se usan para analizar circuitos completos.

# 2. Redes resistivas

## 2.1 Divisor de tensión
**ID:** `DIV-001`

\[
V_o=V_i\frac{R_2}{R_1+R_2}
\]

**Detalle:** Muestra Vo vs R2 en el divisor de tensión descargado: Vo es la fracción R2/(R1+R2) de Vi.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-014`, `DIV-002`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Divisor de tensión»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Con \(V_i=12\,\mathrm V\), \(R_1=2\,\mathrm{k\Omega}\) y \(R_2=1\,\mathrm{k\Omega}\), \(V_o=12(1/3)=4\,\mathrm V\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de divisor de tensión?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.2 Divisor de corriente
**ID:** `DIV-002`

\[
I_1=I_T\frac{R_2}{R_1+R_2}
\]

**Detalle:** Reparte la corriente total entre ramas: por R1 circula IT R2/(R1+R2).

**Variables:** \(I_T,I_1,I_2\): corrientes (A); \(R_1,R_2\): resistencias (Ω).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-001`, `DIV-003`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Divisor de corriente»: la rama de menor resistencia lleva más corriente; I1=IT R2/(R1+R2).
**Ejemplo resuelto:** Con \(I_T=6\,\mathrm{mA}\), \(R_1=2\,\mathrm{k\Omega}\) y \(R_2=1\,\mathrm{k\Omega}\), por \(R_1\) circulan \(6(1/3)=2\,\mathrm{mA}\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de divisor de corriente?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.3 Divisor de tensión con carga
**ID:** `DIV-003`

\[
V_o=V_i\frac{R_2\parallel R_L}{R_1+(R_2\parallel R_L)}
\]

**Detalle:** La carga RL en paralelo con R2 baja Vo respecto del divisor descargado.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-002`, `DIV-004`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Divisor de tensión con carga»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Con \(V_i=12\,\mathrm V\), \(R_1=1\,\mathrm{k\Omega}\), \(R_2=2\,\mathrm{k\Omega}\) y \(R_L=2\,\mathrm{k\Omega}\), \(R_2\parallel R_L=1\,\mathrm{k\Omega}\) y \(V_o=6\,\mathrm V\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de divisor de tensión con carga?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.4 Puente de Wheatstone
**ID:** `DIV-004`

\[
V_o=V_s\left(\frac{R_2}{R_1+R_2}-\frac{R_4}{R_3+R_4}\right)
\]

**Detalle:** Calcula puente de Wheatstone a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-003`, `DIV-005`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---

## 2.5 Equilibrio del puente de Wheatstone
**ID:** `DIV-005`

\[
\frac{R_1}{R_2}=\frac{R_3}{R_4}
\]

**Detalle:** Calcula equilibrio del puente de Wheatstone a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-004`, `DIV-006`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---

## 2.6 Tensión de Thévenin
**ID:** `DIV-006`

\[
V_{\mathrm{Th}}=V_{\mathrm{oc}}
\]

**Detalle:** VTh es la tensión en vacío del equivalente Thévenin que sustituye a la red.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-005`, `DIV-007`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Tensión de Thévenin»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Si una red entrega \(8\,\mathrm V\) con la salida abierta, \(V_{\mathrm{Th}}=V_{\mathrm{oc}}=8\,\mathrm V\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de tensión de Thévenin?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.7 Resistencia de Thévenin
**ID:** `DIV-007`

\[
R_{\mathrm{Th}}=\frac{V_{\mathrm{prueba}}}{I_{\mathrm{prueba}}}
\]

**Detalle:** RTh es la resistencia vista desde los bornes con fuentes independientes anuladas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-006`, `DIV-008`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Resistencia de Thévenin»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Si una fuente de prueba de \(1\,\mathrm V\) produce \(0.5\,\mathrm{mA}\), \(R_{\mathrm{Th}}=1/0.0005=2\,\mathrm{k\Omega}\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de resistencia de Thévenin?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.8 Corriente de Norton
**ID:** `DIV-008`

\[
I_N=I_{\mathrm{sc}}
\]

**Detalle:** IN es la corriente de cortocircuito del equivalente Norton.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-007`, `DIV-009`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Corriente de Norton»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Si el cortocircuito de salida conduce \(4\,\mathrm{mA}\), \(I_N=I_{\mathrm{sc}}=4\,\mathrm{mA}\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de corriente de Norton?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.9 Resistencia de Norton
**ID:** `DIV-009`

\[
R_N=R_{\mathrm{Th}}
\]

**Detalle:** RN coincide con RTh: misma resistencia en el equivalente Norton.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-008`, `DIV-010`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Resistencia de Norton»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Para el equivalente anterior, si \(R_{\mathrm{Th}}=2\,\mathrm{k\Omega}\), entonces \(R_N=2\,\mathrm{k\Omega}\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de resistencia de Norton?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.10 Equivalencia Thévenin–Norton
**ID:** `DIV-010`

\[
V_{\mathrm{Th}}=I_NR_N
\]

**Detalle:** Los equivalentes cumplen VTh = IN RN y se intercambian sin cambiar Vo sobre RL.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-009`, `DIV-011`, `ELE-009`, `ELE-014`.

**Explicación intuitiva:** Para «Equivalencia Thévenin–Norton»: el divisor y Thévenin/Norton reducen la red a un puerto; una carga en paralelo con R2 baja Vo.
**Ejemplo resuelto:** Con \(I_N=4\,\mathrm{mA}\) y \(R_N=2\,\mathrm{k\Omega}\), \(V_{\mathrm{Th}}=(4\,\mathrm{mA})(2\,\mathrm{k\Omega})=8\,\mathrm V\).
**Errores comunes:** olvidar que RL queda en paralelo con R2; usar el divisor descargado con carga presente; mezclar kΩ con Ω
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de equivalencia Thévenin–Norton?
**Respuesta:** Comprobar red resistiva en DC, referencias de signo y si hay carga en el divisor.
**Alias de búsqueda:** divisor de tensión, divisor de corriente, Thévenin, Norton, voltage divider

**Última revisión:** 2026-09-19

---

## 2.11 Máxima transferencia de potencia
**ID:** `DIV-011`

\[
R_L=R_{\mathrm{Th}},\qquad P_{\max}=\frac{V_{\mathrm{Th}}^2}{4R_{\mathrm{Th}}}
\]

**Detalle:** Calcula máxima transferencia de potencia a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-010`, `DIV-012`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---

## 2.12 Principio de superposición
**ID:** `DIV-012`

\[
x=\sum_k x_k
\]

**Detalle:** Calcula principio de superposición a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-011`, `DIV-013`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---

## 2.13 Análisis nodal por KCL
**ID:** `DIV-013`

\[
\sum_k\frac{V_n-V_k}{R_{nk}}=I_n
\]

**Detalle:** Calcula análisis nodal por KCL a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-012`, `DIV-014`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---

## 2.14 Análisis de mallas por KVL
**ID:** `DIV-014`

\[
\mathbf{R}\mathbf{I}=\mathbf{V}
\]

**Detalle:** Calcula análisis de mallas por KVL a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_i,V_o\): tensiones (V); \(R_1,R_2,R_L,R_{\mathrm{Th}}\): resistencias (Ω); \(I_T,I_N\): corrientes (A).

**Condición(es):** Red lineal resistiva en DC; divisor descargado salvo que se indique RL.

**Unidad:** V, A u Ω según el lado izquierdo

**Relacionadas:** `DIV-013`, `DIV-001`, `ELE-009`, `ELE-014`.

**Última revisión:** 2026-09-19

---


# 3. Capacitores e inductores en circuitos

## 3.1 Capacitores en serie
**ID:** `REA-001`

\[
\frac{1}{C_{\mathrm{eq}}}=\sum_i\frac{1}{C_i}
\]

**Detalle:** Calcula capacitores en serie a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-012`, `REA-002`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.2 Capacitores en paralelo
**ID:** `REA-002`

\[
C_{\mathrm{eq}}=\sum_i C_i
\]

**Detalle:** Calcula capacitores en paralelo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-001`, `REA-003`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.3 Inductores en serie
**ID:** `REA-003`

\[
L_{\mathrm{eq}}=\sum_i L_i
\]

**Detalle:** Calcula inductores en serie a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Inductores lineales ideales sin acoplamiento magnético (M=0); polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-002`, `REA-004`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.4 Inductores en paralelo
**ID:** `REA-004`

\[
\frac{1}{L_{\mathrm{eq}}}=\sum_i\frac{1}{L_i}
\]

**Detalle:** Calcula inductores en paralelo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Inductores lineales ideales sin acoplamiento magnético (M=0); polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-003`, `REA-005`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.5 Energía almacenada en un capacitor
**ID:** `REA-005`

\[
w_C=\frac{1}{2}Cv^2
\]

**Detalle:** Calcula energía almacenada en un capacitor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-004`, `REA-006`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.6 Energía almacenada en un inductor
**ID:** `REA-006`

\[
w_L=\frac{1}{2}Li^2
\]

**Detalle:** Calcula energía almacenada en un inductor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-005`, `REA-007`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.7 Constante de tiempo RC
**ID:** `REA-007`

\[
\tau=RC
\]

**Detalle:** Calcula constante de tiempo RC a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-006`, `REA-008`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.8 Constante de tiempo RL
**ID:** `REA-008`

\[
\tau=\frac{L}{R}
\]

**Detalle:** Calcula constante de tiempo RL a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-007`, `REA-009`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.9 Inductancia mutua
**ID:** `REA-009`

\[
M=k\sqrt{L_1L_2}
\]

**Detalle:** Calcula inductancia mutua a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-008`, `REA-010`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.10 Coeficiente de acoplamiento
**ID:** `REA-010`

\[
k=\frac{M}{\sqrt{L_1L_2}},\qquad 0\le k\le1
\]

**Detalle:** Calcula coeficiente de acoplamiento a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-009`, `REA-011`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.11 Continuidad de la tensión del capacitor
**ID:** `REA-011`

\[
v_C(0^+)=v_C(0^-)
\]

**Detalle:** Calcula continuidad de la tensión del capacitor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-010`, `REA-012`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---

## 3.12 Continuidad de la corriente del inductor
**ID:** `REA-012`

\[
i_L(0^+)=i_L(0^-)
\]

**Detalle:** Calcula continuidad de la corriente del inductor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(C,C_{\mathrm{eq}}\): capacitancias (F); \(L,M\): inductancias (H); \(v,i\): tensión (V) y corriente (A); \(\tau\): constante de tiempo (s); \(k\): acoplamiento (adimensional).

**Condición(es):** Elementos lineales ideales; polaridad pasiva.

**Unidad:** F, H, J o s según el lado izquierdo

**Relacionadas:** `REA-011`, `REA-001`, `ELE-008`, `ELE-018`.

**Última revisión:** 2026-09-19

---


# 4. Transitorios de primer orden

## 4.1 Respuesta completa de primer orden
**ID:** `TRN-001`

\[
x(t)=x(\infty)+[x(0^+)-x(\infty)]e^{-t/\tau}
\]

**Detalle:** La respuesta completa es una exponencial que interpola v0 y v∞ con constante τ.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-012`, `TRN-002`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Respuesta completa de primer orden»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Con \(x(0^+)=0\), \(x(\infty)=10\,\mathrm V\) y \(\tau=1\,\mathrm{ms}\), \(x(\tau)=10(1-e^{-1})=6.32\,\mathrm V\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de respuesta completa de primer orden?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.2 Carga de un capacitor
**ID:** `TRN-002`

\[
v_C(t)=V\left(1-e^{-t/(RC)}\right)
\]

**Detalle:** Carga del capacitor: v(t)=V(1−e^{−t/τ}) sube desde 0 hacia V en una exponencial.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-001`, `TRN-003`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Carga de un capacitor»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Con \(V=5\,\mathrm V\), \(R=10\,\mathrm{k\Omega}\), \(C=100\,\mathrm{nF}\), \(\tau=1\,\mathrm{ms}\) y \(v_C(\tau)=3.16\,\mathrm V\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de carga de un capacitor?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.3 Descarga de un capacitor
**ID:** `TRN-003`

\[
v_C(t)=V_0e^{-t/(RC)}
\]

**Detalle:** Descarga del capacitor: v(t)=V e^{−t/τ} cae exponencialmente hacia 0.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-002`, `TRN-004`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Descarga de un capacitor»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Un capacitor inicialmente a \(8\,\mathrm V\), con \(RC=2\,\mathrm{ms}\), cae a \(8e^{-1}=2.94\,\mathrm V\) en \(2\,\mathrm{ms}\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de descarga de un capacitor?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.4 Corriente del capacitor
**ID:** `TRN-004`

\[
i_C=C\frac{dv_C}{dt}
\]

**Detalle:** Calcula corriente del capacitor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-003`, `TRN-005`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---

## 4.5 Respuesta general de corriente RL
**ID:** `TRN-005`

\[
i_L(t)=i_L(\infty)+[i_L(0^+)-i_L(\infty)]e^{-t/\tau}
\]

**Detalle:** La corriente RL interpola i0 e i∞ con τ=L/R.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-004`, `TRN-006`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Respuesta general de corriente RL»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Con \(i_L(0^+)=1\,\mathrm A\), \(i_L(\infty)=5\,\mathrm A\) y \(\tau=2\,\mathrm{ms}\), \(i_L(\tau)=3.53\,\mathrm A\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de respuesta general de corriente RL?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.6 Establecimiento de corriente en un inductor
**ID:** `TRN-006`

\[
i_L(t)=I\left(1-e^{-tR/L}\right)
\]

**Detalle:** Establecimiento de iL: la corriente del inductor crece como 1−e^{−t/τ}.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-005`, `TRN-007`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Establecimiento de corriente en un inductor»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Con \(I=2\,\mathrm A\) y \(L/R=1\,\mathrm{ms}\), \(i_L(1\,\mathrm{ms})=2(1-e^{-1})=1.264\,\mathrm A\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de establecimiento de corriente en un inductor?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.7 Descarga de corriente en un inductor
**ID:** `TRN-007`

\[
i_L(t)=I_0e^{-tR/L}
\]

**Detalle:** Descarga de iL: la corriente del inductor cae como e^{−t/τ}.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-006`, `TRN-008`, `REA-007`, `REA-008`.

**Explicación intuitiva:** Para «Descarga de corriente en un inductor»: la exponencial interpola el valor inicial (continuo) y el asentamiento con constante τ.
**Ejemplo resuelto:** Con \(I_0=3\,\mathrm A\) y \(L/R=2\,\mathrm{ms}\), \(i_L(2\,\mathrm{ms})=3e^{-1}=1.104\,\mathrm A\).
**Errores comunes:** confundir 0⁺ con 0⁻; usar τ=L/R en un RC o τ=RC en un RL; olvidar el valor de asentamiento
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de descarga de corriente en un inductor?
**Respuesta:** Fijar 0⁺, asentamiento y τ del circuito equivalente visto por C o L.
**Alias de búsqueda:** transitorio RC, transitorio RL, carga del capacitor, descarga exponencial

**Última revisión:** 2026-09-19

---

## 4.8 Tensión del inductor
**ID:** `TRN-008`

\[
v_L=L\frac{di_L}{dt}
\]

**Detalle:** Calcula tensión del inductor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-007`, `TRN-009`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---

## 4.9 Valor a una constante de tiempo
**ID:** `TRN-009`

\[
x_{\mathrm{subida}}(\tau)=0.632x_\infty,\qquad x_{\mathrm{caída}}(\tau)=0.368x_0
\]

**Detalle:** Calcula valor a una constante de tiempo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-008`, `TRN-010`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---

## 4.10 Tiempo práctico de asentamiento
**ID:** `TRN-010`

\[
t_s\approx5\tau
\]

**Detalle:** Calcula tiempo práctico de asentamiento a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-009`, `TRN-011`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---

## 4.11 Condición inicial del capacitor
**ID:** `TRN-011`

\[
v_C(0^+)=v_C(0^-)
\]

**Detalle:** Calcula condición inicial del capacitor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-010`, `TRN-012`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---

## 4.12 Condición inicial del inductor
**ID:** `TRN-012`

\[
i_L(0^+)=i_L(0^-)
\]

**Detalle:** Calcula condición inicial del inductor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v(t),v_0,v_\infty\): tensiones (V); \(i(t),i_0,i_\infty\): corrientes (A); \(\tau\): constante de tiempo (s); \(t\): tiempo (s); \(R,C,L\): Ω, F, H.

**Condición(es):** Circuito de primer orden lineal a trozos constantes; τ>0.

**Unidad:** V, A o s según el lado izquierdo

**Relacionadas:** `TRN-011`, `TRN-001`, `REA-007`, `REA-008`.

**Última revisión:** 2026-09-19

---


# 5. Circuitos RLC de segundo orden

## 5.1 Frecuencia natural no amortiguada
**ID:** `RLC-001`

\[
\omega_0=\frac{1}{\sqrt{LC}}
\]

**Detalle:** Calcula frecuencia natural no amortiguada a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-010`, `RLC-002`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.2 Factor de amortiguamiento serie
**ID:** `RLC-002`

\[
\alpha=\frac{R}{2L}
\]

**Detalle:** Calcula factor de amortiguamiento serie a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-001`, `RLC-003`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.3 Razón de amortiguamiento
**ID:** `RLC-003`

\[
\zeta=\frac{\alpha}{\omega_0}
\]

**Detalle:** Calcula razón de amortiguamiento a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-002`, `RLC-004`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.4 Respuesta sobreamortiguada
**ID:** `RLC-004`

\[
\zeta>1
\]

**Detalle:** Sobreamortiguado (ζ>1): suma de dos exponenciales sin oscilar.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-003`, `RLC-005`, `REA-005`, `REA-006`.

**Explicación intuitiva:** Para «Respuesta sobreamortiguada»: ζ compara α con ω0 y decide si hay dos exponenciales, frontera o oscilación amortiguada.
**Ejemplo resuelto:** Con \(\omega_0=1000\,\mathrm{rad/s}\): \(\zeta=2\) no oscila, \(\zeta=1\) es crítica y \(\zeta=0.5\) oscila a \(866\,\mathrm{rad/s}\).
**Errores comunes:** confundir α con ω0; clasificar ζ con R, L, C inconsistentes; olvidar el 2 en α=R/(2L)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de respuesta sobreamortiguada?
**Respuesta:** Calcular α y ω0 con los mismos R, L, C y clasificar ζ antes de escribir v(t).
**Alias de búsqueda:** amortiguamiento, zeta, frecuencia natural, oscilación subamortiguada

**Última revisión:** 2026-09-19

---

## 5.5 Respuesta críticamente amortiguada
**ID:** `RLC-005`

\[
\zeta=1
\]

**Detalle:** Críticamente amortiguado (ζ=1): frontera más rápida sin cruzar el eje oscilando.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-004`, `RLC-006`, `REA-005`, `REA-006`.

**Explicación intuitiva:** Para «Respuesta críticamente amortiguada»: ζ compara α con ω0 y decide si hay dos exponenciales, frontera o oscilación amortiguada.
**Ejemplo resuelto:** Con \(\omega_0=1000\,\mathrm{rad/s}\): \(\zeta=2\) no oscila, \(\zeta=1\) es crítica y \(\zeta=0.5\) oscila a \(866\,\mathrm{rad/s}\).
**Errores comunes:** confundir α con ω0; clasificar ζ con R, L, C inconsistentes; olvidar el 2 en α=R/(2L)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de respuesta críticamente amortiguada?
**Respuesta:** Calcular α y ω0 con los mismos R, L, C y clasificar ζ antes de escribir v(t).
**Alias de búsqueda:** amortiguamiento, zeta, frecuencia natural, oscilación subamortiguada

**Última revisión:** 2026-09-19

---

## 5.6 Respuesta subamortiguada
**ID:** `RLC-006`

\[
\zeta<1
\]

**Detalle:** Subamortiguado (ζ<1): oscilación que decae a frecuencia ωd.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-005`, `RLC-007`, `REA-005`, `REA-006`.

**Explicación intuitiva:** Para «Respuesta subamortiguada»: ζ compara α con ω0 y decide si hay dos exponenciales, frontera o oscilación amortiguada.
**Ejemplo resuelto:** Con \(\omega_0=1000\,\mathrm{rad/s}\): \(\zeta=2\) no oscila, \(\zeta=1\) es crítica y \(\zeta=0.5\) oscila a \(866\,\mathrm{rad/s}\).
**Errores comunes:** confundir α con ω0; clasificar ζ con R, L, C inconsistentes; olvidar el 2 en α=R/(2L)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de respuesta subamortiguada?
**Respuesta:** Calcular α y ω0 con los mismos R, L, C y clasificar ζ antes de escribir v(t).
**Alias de búsqueda:** amortiguamiento, zeta, frecuencia natural, oscilación subamortiguada

**Última revisión:** 2026-09-19

---

## 5.7 Frecuencia natural amortiguada
**ID:** `RLC-007`

\[
\omega_d=\omega_0\sqrt{1-\zeta^2}
\]

**Detalle:** Calcula frecuencia natural amortiguada a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-006`, `RLC-008`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.8 Factor de calidad
**ID:** `RLC-008`

\[
Q=\frac{\omega_0}{\Delta\omega}
\]

**Detalle:** Calcula factor de calidad a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-007`, `RLC-009`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.9 Frecuencia natural RLC paralelo
**ID:** `RLC-009`

\[
\omega_0=\frac{1}{\sqrt{LC}}
\]

**Detalle:** Calcula frecuencia natural RLC paralelo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-008`, `RLC-010`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---

## 5.10 Ancho de banda resonante
**ID:** `RLC-010`

\[
\mathrm{BW}=\frac{\omega_0}{Q}
\]

**Detalle:** Calcula ancho de banda resonante a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(\omega_0,\omega_d\): frecuencias (rad/s); \(\alpha\): amortiguamiento (s^{-1}); \(\zeta,Q\): adimensionales; \(R,L,C\): Ω, H, F.

**Condición(es):** RLC lineal; valores positivos de R, L y C.

**Unidad:** rad/s o adimensional según el lado izquierdo

**Relacionadas:** `RLC-009`, `RLC-001`, `REA-005`, `REA-006`.

**Última revisión:** 2026-09-19

---


# 6. Corriente alterna y fasores

## 6.1 Señal sinusoidal
**ID:** `FAS-001`

\[
v(t)=V_p\cos(\omega t+\phi)
\]

**Detalle:** La sinusoide v(t)=Vp cos(ωt+φ) es la proyección del fasor giratorio.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-014`, `FAS-002`, `ELE-009`, `REA-001`.

**Explicación intuitiva:** Para «Señal sinusoidal»: el fasor RMS gira a ω; su proyección es la sinusoide y Z = R + jX resume el elemento.
**Ejemplo resuelto:** Para \(v=10\cos(100t+30^\circ)\,\mathrm V\), \(V_p=10\,\mathrm V\), \(\omega=100\,\mathrm{rad/s}\) y \(\phi=30^\circ\).
**Errores comunes:** mezclar pico con RMS; usar jωL con f en hertz sin 2π; olvidar el signo de −j/(ωC)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de señal sinusoidal?
**Respuesta:** Trabajar en RMS, convertir f a ω=2πf y respetar el signo de las reactancias.
**Alias de búsqueda:** fasor RMS, impedancia, reactancia, admitancia, sinusoidal steady state

**Última revisión:** 2026-09-19

---

## 6.2 Frecuencia angular
**ID:** `FAS-002`

\[
\omega=2\pi f
\]

**Detalle:** Calcula frecuencia angular a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-001`, `FAS-003`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.3 Valor eficaz de una sinusoide
**ID:** `FAS-003`

\[
V_{\mathrm{rms}}=\frac{V_p}{\sqrt{2}}
\]

**Detalle:** El valor RMS Vp/√2 es la longitud del fasor eficaz.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-002`, `FAS-004`, `ELE-009`, `REA-001`.

**Explicación intuitiva:** Para «Valor eficaz de una sinusoide»: el fasor RMS gira a ω; su proyección es la sinusoide y Z = R + jX resume el elemento.
**Ejemplo resuelto:** Para una sinusoide de pico \(170\,\mathrm V\), \(V_{\mathrm{rms}}=170/\sqrt2=120.2\,\mathrm V\).
**Errores comunes:** mezclar pico con RMS; usar jωL con f en hertz sin 2π; olvidar el signo de −j/(ωC)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de valor eficaz de una sinusoide?
**Respuesta:** Trabajar en RMS, convertir f a ω=2πf y respetar el signo de las reactancias.
**Alias de búsqueda:** fasor RMS, impedancia, reactancia, admitancia, sinusoidal steady state

**Última revisión:** 2026-09-19

---

## 6.4 Valor medio de seno rectificado
**ID:** `FAS-004`

\[
V_{\mathrm{med}}=\frac{2V_p}{\pi}
\]

**Detalle:** Calcula valor medio de seno rectificado a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-003`, `FAS-005`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.5 Fasor RMS
**ID:** `FAS-005`

\[
\underline V=V_{\mathrm{rms}}\angle\phi
\]

**Detalle:** Calcula fasor RMS a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-004`, `FAS-006`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.6 Derivación en fasores
**ID:** `FAS-006`

\[
\frac{d}{dt}\longleftrightarrow j\omega
\]

**Detalle:** Calcula derivación en fasores a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-005`, `FAS-007`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.7 Integración en fasores
**ID:** `FAS-007`

\[
\int dt\longleftrightarrow\frac{1}{j\omega}
\]

**Detalle:** Calcula integración en fasores a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-006`, `FAS-008`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.8 Impedancia
**ID:** `FAS-008`

\[
Z=R+jX
\]

**Detalle:** Z=R+jX es el cateto R y el cateto X del triángulo de impedancia.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-007`, `FAS-009`, `ELE-009`, `REA-001`.

**Explicación intuitiva:** Para «Impedancia»: el fasor RMS gira a ω; su proyección es la sinusoide y Z = R + jX resume el elemento.
**Ejemplo resuelto:** Para \(R=3\,\Omega\) y \(X=4\,\Omega\), \(Z=3+j4=5\angle53.1^\circ\,\Omega\).
**Errores comunes:** mezclar pico con RMS; usar jωL con f en hertz sin 2π; olvidar el signo de −j/(ωC)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de impedancia?
**Respuesta:** Trabajar en RMS, convertir f a ω=2πf y respetar el signo de las reactancias.
**Alias de búsqueda:** fasor RMS, impedancia, reactancia, admitancia, sinusoidal steady state

**Última revisión:** 2026-09-19

---

## 6.9 Admitancia
**ID:** `FAS-009`

\[
Y=\frac{1}{Z}
\]

**Detalle:** La admitancia Y=1/Z invierte el módulo y cambia de signo el ángulo.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-008`, `FAS-010`, `ELE-009`, `REA-001`.

**Explicación intuitiva:** Para «Admitancia»: el fasor RMS gira a ω; su proyección es la sinusoide y Z = R + jX resume el elemento.
**Ejemplo resuelto:** Si \(Z=4+j3\,\Omega\), \(Y=1/Z=(4-j3)/25=0.16-j0.12\,\mathrm S\).
**Errores comunes:** mezclar pico con RMS; usar jωL con f en hertz sin 2π; olvidar el signo de −j/(ωC)
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de admitancia?
**Respuesta:** Trabajar en RMS, convertir f a ω=2πf y respetar el signo de las reactancias.
**Alias de búsqueda:** fasor RMS, impedancia, reactancia, admitancia, sinusoidal steady state

**Última revisión:** 2026-09-19

---

## 6.10 Ley de Ohm fasorial
**ID:** `FAS-010`

\[
\underline V=Z\underline I
\]

**Detalle:** Calcula ley de Ohm fasorial a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-009`, `FAS-011`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.11 Magnitud de la reactancia capacitiva
**ID:** `FAS-011`

\[
|X_C|=\frac{1}{\omega C},\qquad X_C=-\frac{1}{\omega C},\qquad Z_C=-\frac{j}{\omega C}
\]

**Detalle:** Con Z=R+jX la reactancia capacitiva es negativa: X_C=-1/(ωC). La magnitud es |X_C|=1/(ωC) y Z_C=-j/(ωC).

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-010`, `FAS-012`, `ELE-009`, `REA-001`.

**Explicación intuitiva:** Para «Magnitud de la reactancia capacitiva»: |X_C|=1/(ωC) es la magnitud; con Z=R+jX, X_C=-1/(ωC) y Z_C=-j/(ωC).

**Última revisión:** 2026-09-19

---

## 6.12 Reactancia inductiva
**ID:** `FAS-012`

\[
X_L=\omega L
\]

**Detalle:** Calcula reactancia inductiva a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-011`, `FAS-013`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.13 Ángulo de impedancia
**ID:** `FAS-013`

\[
\phi_Z=\arg(Z)
\]

**Detalle:** Calcula ángulo de impedancia a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-012`, `FAS-014`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---

## 6.14 Suma fasorial
**ID:** `FAS-014`

\[
\underline V_T=\sum_k\underline V_k
\]

**Detalle:** Calcula suma fasorial a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_p\): pico (V); \(V_{\mathrm{rms}}\): eficaz (V); \(\omega\): rad/s; \(f\): Hz; \(\phi\): rad; \(Z,X\): Ω; \(Y\): S.

**Condición(es):** Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.

**Unidad:** V, rad/s, Ω o S según el lado izquierdo

**Relacionadas:** `FAS-013`, `FAS-001`, `ELE-009`, `REA-001`.

**Última revisión:** 2026-09-19

---


# 7. Potencia en CA y resonancia

## 7.1 Potencia instantánea
**ID:** `PAC-001`

\[
p(t)=v(t)i(t)
\]

**Detalle:** Calcula potencia instantánea a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-010`, `PAC-002`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.2 Potencia activa
**ID:** `PAC-002`

\[
P=VI\cos\theta
\]

**Detalle:** Calcula potencia activa a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-001`, `PAC-003`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.3 Potencia reactiva
**ID:** `PAC-003`

\[
Q=VI\operatorname{sen}\theta
\]

**Detalle:** Calcula potencia reactiva a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-002`, `PAC-004`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.4 Potencia aparente
**ID:** `PAC-004`

\[
S=VI
\]

**Detalle:** Calcula potencia aparente a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-003`, `PAC-005`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.5 Triángulo de potencias
**ID:** `PAC-005`

\[
S=\sqrt{P^2+Q^2}
\]

**Detalle:** El triángulo de potencias relaciona P, Q y S=√(P²+Q²).

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-004`, `PAC-006`, `FAS-003`, `FAS-010`.

**Explicación intuitiva:** Para «Triángulo de potencias»: P, Q y S forman el triángulo de potencia; en resonancia la reactancia neta se anula.
**Ejemplo resuelto:** Con \(P=300\,\mathrm W\) y \(Q=400\,\mathrm{var}\), \(S=\sqrt{300^2+400^2}=500\,\mathrm{VA}\).
**Errores comunes:** tomar |S| como P; olvidar el factor cos θ; aplicar resonancia serie a un paralelo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de triángulo de potencias?
**Respuesta:** Usar RMS de la misma frecuencia y distinguir P, Q y |S|.
**Alias de búsqueda:** potencia activa, potencia reactiva, factor de potencia, resonancia serie

**Última revisión:** 2026-09-19

---

## 7.6 Factor de potencia
**ID:** `PAC-006`

\[
\mathrm{FP}=\cos\theta=\frac{P}{S}
\]

**Detalle:** Calcula factor de potencia a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-005`, `PAC-007`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.7 Corrección del factor de potencia
**ID:** `PAC-007`

\[
Q_c=P\left(\tan\theta_1-\tan\theta_2\right)
\]

**Detalle:** Calcula corrección del factor de potencia a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-006`, `PAC-008`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 7.8 Resonancia serie
**ID:** `PAC-008`

\[
X_L=X_C,\qquad\omega_0=\frac{1}{\sqrt{LC}}
\]

**Detalle:** En resonancia serie XL=XC y |Z| es mínimo en ω0.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-007`, `PAC-009`, `FAS-003`, `FAS-010`.

**Explicación intuitiva:** Para «Resonancia serie»: P, Q y S forman el triángulo de potencia; en resonancia la reactancia neta se anula.
**Ejemplo resuelto:** Con \(L=10\,\mathrm{mH}\) y \(C=10\,\mathrm{\mu F}\), \(\omega_0=3162\,\mathrm{rad/s}\) y \(f_0\approx503\,\mathrm{Hz}\).
**Errores comunes:** tomar |S| como P; olvidar el factor cos θ; aplicar resonancia serie a un paralelo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de resonancia serie?
**Respuesta:** Usar RMS de la misma frecuencia y distinguir P, Q y |S|.
**Alias de búsqueda:** potencia activa, potencia reactiva, factor de potencia, resonancia serie

**Última revisión:** 2026-09-19

---

## 7.9 Resonancia paralelo
**ID:** `PAC-009`

\[
B_L+B_C=0
\]

**Detalle:** En resonancia paralelo |Z| es máximo en ω0.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-008`, `PAC-010`, `FAS-003`, `FAS-010`.

**Explicación intuitiva:** Para «Resonancia paralelo»: P, Q y S forman el triángulo de potencia; en resonancia la reactancia neta se anula.
**Ejemplo resuelto:** Si a \(1\,\mathrm{kHz}\), \(B_C=2\,\mathrm{mS}\) y \(B_L=-2\,\mathrm{mS}\), la susceptancia total es cero y hay resonancia paralela.
**Errores comunes:** tomar |S| como P; olvidar el factor cos θ; aplicar resonancia serie a un paralelo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de resonancia paralelo?
**Respuesta:** Usar RMS de la misma frecuencia y distinguir P, Q y |S|.
**Alias de búsqueda:** potencia activa, potencia reactiva, factor de potencia, resonancia serie

**Última revisión:** 2026-09-19

---

## 7.10 Factor de calidad RLC serie
**ID:** `PAC-010`

\[
Q=\frac{\omega_0L}{R}
\]

**Detalle:** Calcula factor de calidad RLC serie a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(P\): W; \(Q\): var; \(S\): VA; \(V,I\): RMS (V, A); \(\theta\): rad; \(\omega_0\): rad/s; \(R,L,C\): Ω, H, F.

**Condición(es):** Sinusoides RMS de la misma frecuencia; convención pasiva.

**Unidad:** W, var, VA o adimensional

**Relacionadas:** `PAC-009`, `PAC-001`, `FAS-003`, `FAS-010`.

**Última revisión:** 2026-09-19

---


# 8. Filtros y respuesta en frecuencia

## 8.1 Filtro RC pasa-bajos
**ID:** `FIL-001`

\[
H(j\omega)=\frac{1}{1+j\omega RC}
\]

**Detalle:** El pasa-bajos RC |H|=1/√(1+(ωRC)²) cae tras el corte en el Bode.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-010`, `FIL-002`, `FAS-008`, `FAS-009`.

**Explicación intuitiva:** Para «Filtro RC pasa-bajos»: |H(jω)| muestra la banda que pasa y fc marca el punto −3 dB del Bode.
**Ejemplo resuelto:** Con \(R=1\,\mathrm{k\Omega}\), \(C=159\,\mathrm{nF}\) y \(f=1\,\mathrm{kHz}\), \(\omega RC\approx1\) y \(|H|\approx0.707\).
**Errores comunes:** usar ωc en lugar de fc o al revés; olvidar la carga que desplaza el corte; mezclar dB con ganancia lineal
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de filtro RC pasa-bajos?
**Respuesta:** Identificar el tipo de filtro, fc y el efecto de la carga sobre H(jω).
**Alias de búsqueda:** filtro pasa-bajos, frecuencia de corte, diagrama de Bode, −3 dB

**Última revisión:** 2026-09-19

---

## 8.2 Frecuencia de corte RC
**ID:** `FIL-002`

\[
f_c=\frac{1}{2\pi RC}
\]

**Detalle:** fc=1/(2π RC) es el corte donde |H| vale 1/√2 (−3 dB) en el Bode.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-001`, `FIL-003`, `FAS-008`, `FAS-009`.

**Explicación intuitiva:** Para «Frecuencia de corte RC»: |H(jω)| muestra la banda que pasa y fc marca el punto −3 dB del Bode.
**Ejemplo resuelto:** Con \(R=1\,\mathrm{k\Omega}\) y \(C=159\,\mathrm{nF}\), \(f_c=1/(2\pi RC)\approx1.00\,\mathrm{kHz}\).
**Errores comunes:** usar ωc en lugar de fc o al revés; olvidar la carga que desplaza el corte; mezclar dB con ganancia lineal
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de frecuencia de corte RC?
**Respuesta:** Identificar el tipo de filtro, fc y el efecto de la carga sobre H(jω).
**Alias de búsqueda:** filtro pasa-bajos, frecuencia de corte, diagrama de Bode, −3 dB

**Última revisión:** 2026-09-19

---

## 8.3 Filtro RC pasa-altos
**ID:** `FIL-003`

\[
H(j\omega)=\frac{j\omega RC}{1+j\omega RC}
\]

**Detalle:** El pasa-altos RC sube +20 dB/dec por debajo de fc y se aproxima a 0 dB por encima del corte.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-002`, `FIL-004`, `FAS-008`, `FAS-009`.

**Explicación intuitiva:** Para «Filtro RC pasa-altos»: |H(jω)| muestra la banda que pasa y fc marca el punto −3 dB del Bode.
**Ejemplo resuelto:** Con \(\omega RC=1\), el pasa-altos tiene \(|H|=1/\sqrt2=0.707\) y fase \(+45^\circ\).
**Errores comunes:** usar ωc en lugar de fc o al revés; olvidar la carga que desplaza el corte; mezclar dB con ganancia lineal
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de filtro RC pasa-altos?
**Respuesta:** Identificar el tipo de filtro, fc y el efecto de la carga sobre H(jω).
**Alias de búsqueda:** filtro pasa-altos, frecuencia de corte, diagrama de Bode, −3 dB

**Última revisión:** 2026-09-19

---

## 8.4 Filtro RL pasa-bajos
**ID:** `FIL-004`

\[
H(j\omega)=\frac{R}{R+j\omega L}
\]

**Detalle:** El pasa-bajos RL tiene el mismo Bode de primer orden que el RC pasa-bajos.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-003`, `FIL-005`, `FAS-008`, `FAS-009`.

**Explicación intuitiva:** Para «Filtro RL pasa-bajos»: |H(jω)| muestra la banda que pasa y fc marca el punto −3 dB del Bode.
**Ejemplo resuelto:** Con \(R=100\,\Omega\), \(L=15.9\,\mathrm{mH}\) y \(f=1\,\mathrm{kHz}\), \(\omega L\approx100\,\Omega\) y \(|H|\approx0.707\).
**Errores comunes:** usar ωc en lugar de fc o al revés; olvidar la carga que desplaza el corte; mezclar dB con ganancia lineal
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de filtro RL pasa-bajos?
**Respuesta:** Identificar el tipo de filtro, fc y el efecto de la carga sobre H(jω).
**Alias de búsqueda:** filtro pasa-bajos, frecuencia de corte, diagrama de Bode, −3 dB

**Última revisión:** 2026-09-19

---

## 8.5 Ganancia en decibelios
**ID:** `FIL-005`

\[
G_{\mathrm{dB}}=20\log_{10}|H|
\]

**Detalle:** Calcula ganancia en decibelios a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-004`, `FIL-006`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---

## 8.6 Pendiente de primer orden
**ID:** `FIL-006`

\[
m=-20\ \mathrm{dB/dec}
\]

**Detalle:** La pendiente −20 dB/dec vale en la banda de caída de un pasa-bajos de primer orden; un pasa-altos sube +20 dB/dec por debajo de fc.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Pendiente −20 dB/dec en la banda de caída de un pasa-bajos de primer orden; un pasa-altos sube +20 dB/dec por debajo de fc.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-005`, `FIL-007`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---

## 8.7 Magnitud pasa-banda RLC
**ID:** `FIL-007`

\[
 |H(j\omega)|=\frac{R}{\sqrt{R^2+\left(\omega L-\frac{1}{\omega C}\right)^2}}
\]

**Detalle:** Calcula magnitud pasa-banda RLC a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-006`, `FIL-008`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---

## 8.8 Ancho de banda de filtro
**ID:** `FIL-008`

\[
\mathrm{BW}=\frac{f_0}{Q}
\]

**Detalle:** Calcula ancho de banda de filtro a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-007`, `FIL-009`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---

## 8.9 Factor de calidad del filtro
**ID:** `FIL-009`

\[
Q=\frac{f_0}{\mathrm{BW}}
\]

**Detalle:** Calcula factor de calidad del filtro a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-008`, `FIL-010`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---

## 8.10 Frecuencia central RLC
**ID:** `FIL-010`

\[
f_0=\frac{1}{2\pi\sqrt{LC}}
\]

**Detalle:** Calcula frecuencia central RLC a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(H(j\omega)\): adimensional; \(\omega\): rad/s; \(f_c,f_0\): Hz; \(R,C,L\): Ω, F, H; \(Q\): adimensional.

**Condición(es):** Filtro lineal invariante; carga alta salvo indicación.

**Unidad:** adimensional, Hz o dB

**Relacionadas:** `FIL-009`, `FIL-001`, `FAS-008`, `FAS-009`.

**Última revisión:** 2026-09-19

---


# 9. Transformadores

## 9.1 Relación de tensiones
**ID:** `XFR-001`

\[
\frac{V_1}{V_2}=\frac{N_1}{N_2}
\]

**Detalle:** Calcula relación de tensiones a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-008`, `XFR-002`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.2 Relación de corrientes
**ID:** `XFR-002`

\[
\frac{I_1}{I_2}=\frac{N_2}{N_1}
\]

**Detalle:** Calcula relación de corrientes a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-001`, `XFR-003`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.3 Impedancia reflejada
**ID:** `XFR-003`

\[
Z_{\mathrm{in}}=n^2Z_L
\]

**Detalle:** Calcula impedancia reflejada a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-002`, `XFR-004`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.4 Conservación de potencia ideal
**ID:** `XFR-004`

\[
P_1=P_2
\]

**Detalle:** Calcula conservación de potencia ideal a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-003`, `XFR-005`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.5 Relación de transformación
**ID:** `XFR-005`

\[
n=\frac{N_1}{N_2}
\]

**Detalle:** Calcula relación de transformación a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-004`, `XFR-006`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.6 Relación del autotransformador
**ID:** `XFR-006`

\[
\frac{V_1}{V_2}=\frac{N_1}{N_2}
\]

**Detalle:** Calcula relación del autotransformador a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-005`, `XFR-007`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.7 Eficiencia del transformador
**ID:** `XFR-007`

\[
\eta=\frac{P_{\mathrm{sal}}}{P_{\mathrm{ent}}}
\]

**Detalle:** Calcula eficiencia del transformador a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-006`, `XFR-008`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---

## 9.8 Ley de Faraday en el devanado
**ID:** `XFR-008`

\[
v=N\frac{d\Phi}{dt}
\]

**Detalle:** Calcula ley de Faraday en el devanado a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_1,V_2\): V; \(I_1,I_2\): A; \(N_1,N_2,n\): espiras o relación; \(Z_L,Z_{\mathrm{in}}\): Ω; \(\eta\): adimensional.

**Condición(es):** Transformador ideal salvo que se cite rendimiento o Faraday.

**Unidad:** V, A, Ω o adimensional

**Relacionadas:** `XFR-007`, `XFR-001`, `REA-009`, `FAS-010`.

**Última revisión:** 2026-09-19

---


# 10. Semiconductores y diodos

## 10.1 Energía de banda prohibida
**ID:** `DIO-001`

\[
E_g=E_c-E_v
\]

**Detalle:** Calcula energía de banda prohibida a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-014`, `DIO-002`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.2 Tensión de polarización del diodo
**ID:** `DIO-002`

\[
V_D=V_A-V_K
\]

**Detalle:** Calcula tensión de polarización del diodo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-001`, `DIO-003`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.3 Ecuación de Shockley
**ID:** `DIO-003`

\[
I_D=I_S\left(e^{v_D/(nV_T)}-1\right)
\]

**Detalle:** La curva de Shockley I=Is(e^{v/(n VT)}−1) crece fuerte en directa.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-002`, `DIO-004`, `FAS-004`, `PAC-001`.

**Explicación intuitiva:** Para «Ecuación de Shockley»: el diodo conduce fuerte tras el umbral; el rectificador recorta o pliega la sinusoide.
**Ejemplo resuelto:** Con \(I_S=1\,\mathrm{nA}\), \(n=2\), \(V_T=25.9\,\mathrm{mV}\) y \(v_D=0.60\,\mathrm V\), \(I_D\approx108\,\mathrm{\mu A}\).
**Errores comunes:** usar 0.7 V en inversa; olvidar el rizado del capacitor; mezclar media onda con onda completa en Vavg
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de ecuación de Shockley?
**Respuesta:** Elegir el modelo (umbral, Shockley o Zener) y el intervalo de conducción.
**Alias de búsqueda:** diodo Shockley, umbral 0.7 V, rectificador, rizado, Zener

**Última revisión:** 2026-09-19

---

## 10.4 Tensión térmica
**ID:** `DIO-004`

\[
V_T=\frac{kT}{q}
\]

**Detalle:** Calcula tensión térmica a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-003`, `DIO-005`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.5 Modelo de umbral del diodo de silicio
**ID:** `DIO-005`

\[
V_D\approx0.7\ \mathrm{V}
\]

**Detalle:** El umbral ~0.7 V del silicio aproxima la rodilla de la curva IV.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-004`, `DIO-006`, `FAS-004`, `PAC-001`.

**Explicación intuitiva:** Para «Modelo de umbral del diodo de silicio»: el diodo conduce fuerte tras el umbral; el rectificador recorta o pliega la sinusoide.
**Ejemplo resuelto:** En el modelo de umbral, \(v_D=0.80\,\mathrm V\) enciende un diodo de Si porque supera \(0.7\,\mathrm V\); \(0.50\,\mathrm V\) no.
**Errores comunes:** usar 0.7 V en inversa; olvidar el rizado del capacitor; mezclar media onda con onda completa en Vavg
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de modelo de umbral del diodo de silicio?
**Respuesta:** Elegir el modelo (umbral, Shockley o Zener) y el intervalo de conducción.
**Alias de búsqueda:** diodo Shockley, umbral 0.7 V, rectificador, rizado, Zener

**Última revisión:** 2026-09-19

---

## 10.6 Rectificador de media onda
**ID:** `DIO-006`

\[
V_{\mathrm{med}}=\frac{V_p}{\pi}
\]

**Detalle:** El rectificador de media onda deja pasar solo las alternancias positivas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-005`, `DIO-007`, `FAS-004`, `PAC-001`.

**Explicación intuitiva:** Para «Rectificador de media onda»: el diodo conduce fuerte tras el umbral; el rectificador recorta o pliega la sinusoide.
**Ejemplo resuelto:** Con \(V_p=12\,\mathrm V\), el rectificador ideal de media onda entrega \(V_{\mathrm{med}}=12/\pi=3.82\,\mathrm V\).
**Errores comunes:** usar 0.7 V en inversa; olvidar el rizado del capacitor; mezclar media onda con onda completa en Vavg
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de rectificador de media onda?
**Respuesta:** Elegir el modelo (umbral, Shockley o Zener) y el intervalo de conducción.
**Alias de búsqueda:** diodo Shockley, umbral 0.7 V, rectificador, rizado, Zener

**Última revisión:** 2026-09-19

---

## 10.7 Rectificador de onda completa
**ID:** `DIO-007`

\[
V_{\mathrm{med}}=\frac{2V_p}{\pi}
\]

**Detalle:** El rectificador de onda completa pliega ambas alternancias hacia positivo.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-006`, `DIO-008`, `FAS-004`, `PAC-001`.

**Explicación intuitiva:** Para «Rectificador de onda completa»: el diodo conduce fuerte tras el umbral; el rectificador recorta o pliega la sinusoide.
**Ejemplo resuelto:** Con \(V_p=12\,\mathrm V\), el rectificador ideal de onda completa entrega \(V_{\mathrm{med}}=24/\pi=7.64\,\mathrm V\).
**Errores comunes:** usar 0.7 V en inversa; olvidar el rizado del capacitor; mezclar media onda con onda completa en Vavg
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de rectificador de onda completa?
**Respuesta:** Elegir el modelo (umbral, Shockley o Zener) y el intervalo de conducción.
**Alias de búsqueda:** diodo Shockley, umbral 0.7 V, rectificador, rizado, Zener

**Última revisión:** 2026-09-19

---

## 10.8 Rizado con filtro capacitivo
**ID:** `DIO-008`

\[
\Delta V\approx\frac{I_L}{f_rC}
\]

**Detalle:** Calcula rizado con filtro capacitivo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-007`, `DIO-009`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.9 Tensión Zener
**ID:** `DIO-009`

\[
V_D\approx-V_Z
\]

**Detalle:** Calcula tensión Zener a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-008`, `DIO-010`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.10 Regulación Zener
**ID:** `DIO-010`

\[
I_Z=\frac{V_S-V_Z}{R_S}-I_L
\]

**Detalle:** Calcula regulación Zener a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-009`, `DIO-011`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.11 Caída directa de LED
**ID:** `DIO-011`

\[
V_F=V_{\mathrm{LED}}
\]

**Detalle:** Calcula caída directa de LED a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-010`, `DIO-012`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.12 Modelo lineal por tramos
**ID:** `DIO-012`

\[
v_D=V_F+i_DR_f
\]

**Detalle:** Calcula modelo lineal por tramos a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-011`, `DIO-013`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.13 Recortador con diodo
**ID:** `DIO-013`

\[
v_o=\operatorname{clip}(v_i,V_{\min},V_{\max})
\]

**Detalle:** Calcula recortador con diodo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-012`, `DIO-014`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 10.14 Puente de Graetz
**ID:** `DIO-014`

\[
V_{o,p}\approx V_p-2V_F
\]

**Detalle:** Calcula puente de Graetz a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v,V_F,V_Z,V_T\): V; \(I,I_s\): A; \(n\): factor de idealidad; \(E_g\): eV; \(f,R,C\): Hz, Ω, F.

**Condición(es):** Modelo indicado (Shockley, umbral o Zener); temperatura implícita en VT.

**Unidad:** V, A o eV

**Relacionadas:** `DIO-013`, `DIO-001`, `FAS-004`, `PAC-001`.

**Última revisión:** 2026-09-19

---


# 11. Transistores BJT

## 11.1 Corrientes del BJT
**ID:** `BJT-001`

\[
I_E=I_B+I_C
\]

**Detalle:** Calcula corrientes del BJT a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-012`, `BJT-002`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.2 Ganancia de corriente alfa
**ID:** `BJT-002`

\[
\alpha=\frac{I_C}{I_E}
\]

**Detalle:** Calcula ganancia de corriente alfa a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-001`, `BJT-003`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.3 Ganancia de corriente beta
**ID:** `BJT-003`

\[
\beta=\frac{I_C}{I_B}
\]

**Detalle:** Calcula ganancia de corriente beta a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-002`, `BJT-004`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.4 Relación entre beta y alfa
**ID:** `BJT-004`

\[
\beta=\frac{\alpha}{1-\alpha}
\]

**Detalle:** Calcula relación entre beta y alfa a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-003`, `BJT-005`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.5 Región activa del BJT
**ID:** `BJT-005`

\[
I_C\approx\beta I_B
\]

**Detalle:** En la región activa de la recta de carga IC=β IB con VCE por encima de saturación.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-004`, `BJT-006`, `DIO-003`, `DIO-005`.

**Explicación intuitiva:** Para «Región activa del BJT»: IB controla IC = β IB en activa; la recta de carga recorre corte, activa y saturación.
**Ejemplo resuelto:** Con \(\beta=100\) e \(I_B=20\,\mathrm{\mu A}\), en activa \(I_C\approx2.0\,\mathrm{mA}\), si la red permite ese punto.
**Errores comunes:** usar IC=β IB en saturación; olvidar VCE(sat); invertir emisor y colector en el DCL
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de región activa del BJT?
**Respuesta:** Identificar la región (corte, activa, saturación) antes de usar β o VCE(sat).
**Alias de búsqueda:** beta, recta de carga, región activa, saturación, punto Q

**Última revisión:** 2026-09-19

---

## 11.6 Región de corte del BJT
**ID:** `BJT-006`

\[
I_B\approx0,\qquad I_C\approx0
\]

**Detalle:** En corte IB≈0 e IC≈0: el punto Q está en el extremo de VCE=VCC.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-005`, `BJT-007`, `DIO-003`, `DIO-005`.

**Explicación intuitiva:** Para «Región de corte del BJT»: IB controla IC = β IB en activa; la recta de carga recorre corte, activa y saturación.
**Ejemplo resuelto:** Si \(I_B\approx0\), el modelo de corte da \(I_C\approx0\); con \(V_{CC}=5\,\mathrm V\), \(V_{CE}\approx5\,\mathrm V\).
**Errores comunes:** usar IC=β IB en saturación; olvidar VCE(sat); invertir emisor y colector en el DCL
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de región de corte del BJT?
**Respuesta:** Identificar la región (corte, activa, saturación) antes de usar β o VCE(sat).
**Alias de búsqueda:** beta, recta de carga, región activa, saturación, punto Q

**Última revisión:** 2026-09-19

---

## 11.7 Región de saturación del BJT
**ID:** `BJT-007`

\[
V_{CE}\approx V_{CE(\mathrm{sat})}
\]

**Detalle:** En saturación VCE sat es pequeño e IC ya no sigue β IB.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-006`, `BJT-008`, `DIO-003`, `DIO-005`.

**Explicación intuitiva:** Para «Región de saturación del BJT»: IB controla IC = β IB en activa; la recta de carga recorre corte, activa y saturación.
**Ejemplo resuelto:** Con \(V_{CE(\mathrm{sat})}=0.2\,\mathrm V\), \(V_{CC}=5\,\mathrm V\) y \(R_C=1\,\mathrm{k\Omega}\), \(I_C\approx4.8\,\mathrm{mA}\).
**Errores comunes:** usar IC=β IB en saturación; olvidar VCE(sat); invertir emisor y colector en el DCL
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de región de saturación del BJT?
**Respuesta:** Identificar la región (corte, activa, saturación) antes de usar β o VCE(sat).
**Alias de búsqueda:** beta, recta de carga, región activa, saturación, punto Q

**Última revisión:** 2026-09-19

---

## 11.8 Recta de carga del BJT
**ID:** `BJT-008`

\[
V_{CE}=V_{CC}-I_CR_C
\]

**Detalle:** La recta de carga une (VCC,0) con (0,VCC/RC); el punto Q recorre corte, activa y saturación.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-007`, `BJT-009`, `DIO-003`, `DIO-005`.

**Explicación intuitiva:** Para «Recta de carga del BJT»: IB controla IC = β IB en activa; la recta de carga recorre corte, activa y saturación.
**Ejemplo resuelto:** Con \(V_{CC}=10\,\mathrm V\) y \(R_C=1\,\mathrm{k\Omega}\), la recta une \((I_C=0,V_{CE}=10\,\mathrm V)\) y \((I_C=10\,\mathrm{mA},V_{CE}=0)\).
**Errores comunes:** usar IC=β IB en saturación; olvidar VCE(sat); invertir emisor y colector en el DCL
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de recta de carga del BJT?
**Respuesta:** Identificar la región (corte, activa, saturación) antes de usar β o VCE(sat).
**Alias de búsqueda:** beta, recta de carga, región activa, saturación, punto Q

**Última revisión:** 2026-09-19

---

## 11.9 Polarización por divisor del BJT
**ID:** `BJT-009`

\[
V_B\approx V_{CC}\frac{R_2}{R_1+R_2}
\]

**Detalle:** Calcula polarización por divisor del BJT a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-008`, `BJT-010`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.10 Transconductancia del BJT
**ID:** `BJT-010`

\[
g_m=\frac{I_C}{V_T}
\]

**Detalle:** Calcula transconductancia del BJT a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-009`, `BJT-011`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.11 Resistencia de entrada de pequeña señal
**ID:** `BJT-011`

\[
r_\pi=\frac{\beta}{g_m}
\]

**Detalle:** Calcula resistencia de entrada de pequeña señal a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-010`, `BJT-012`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---

## 11.12 BJT como interruptor
**ID:** `BJT-012`

\[
\mathrm{estado}=\begin{cases}\mathrm{corte}&I_B=0\\\mathrm{saturación}&I_B\ge I_C/\beta_f\end{cases}
\]

**Detalle:** Calcula BJT como interruptor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_C,I_B,I_E\): A; \(\alpha,\beta\): adimensionales; \(V_{CE},V_{BE}\): V; \(g_m\): S; \(r_\pi\): Ω.

**Condición(es):** NPN de señal salvo indicación; respetar la región (activa, corte, saturación).

**Unidad:** A, V, S u Ω

**Relacionadas:** `BJT-011`, `BJT-001`, `DIO-003`, `DIO-005`.

**Última revisión:** 2026-09-19

---


# 12. Transistores FET

## 12.1 Corriente MOSFET en saturación
**ID:** `FET-001`

\[
I_D=\frac{1}{2}k_n(V_{GS}-V_{\mathrm{th}})^2
\]

**Detalle:** Calcula corriente MOSFET en saturación a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-010`, `FET-002`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.2 Tensión de sobreexcitación MOSFET
**ID:** `FET-002`

\[
V_{\mathrm{ov}}=V_{GS}-V_{\mathrm{th}}
\]

**Detalle:** La sobreexcitación Vov=VGS−Vth mide cuánto supera VGS al umbral Vth, no es la tensión umbral.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-001`, `FET-003`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.3 Corriente MOSFET en región triodo
**ID:** `FET-003`

\[
I_D=k_n\left[(V_{GS}-V_{\mathrm{th}})V_{DS}-\frac{V_{DS}^2}{2}\right]
\]

**Detalle:** Calcula corriente MOSFET en región triodo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-002`, `FET-004`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.4 Condición de saturación MOSFET
**ID:** `FET-004`

\[
V_{DS}\ge V_{GS}-V_{\mathrm{th}}
\]

**Detalle:** Calcula condición de saturación MOSFET a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-003`, `FET-005`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.5 Condición de corte MOSFET
**ID:** `FET-005`

\[
V_{GS}<V_{\mathrm{th}}
\]

**Detalle:** Calcula condición de corte MOSFET a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-004`, `FET-006`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.6 Resistencia de encendido
**ID:** `FET-006`

\[
R_{\mathrm{DS(on)}}=\frac{V_{DS}}{I_D}
\]

**Detalle:** Calcula resistencia de encendido a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-005`, `FET-007`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.7 MOSFET como interruptor
**ID:** `FET-007`

\[
P_{\mathrm{cond}}=I_D^2R_{\mathrm{DS(on)}}
\]

**Detalle:** Calcula MOSFET como interruptor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-006`, `FET-008`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.8 Transconductancia MOSFET
**ID:** `FET-008`

\[
g_m=k_n(V_{GS}-V_{\mathrm{th}})
\]

**Detalle:** Calcula transconductancia MOSFET a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-007`, `FET-009`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.9 Corriente de saturación JFET
**ID:** `FET-009`

\[
I_D=I_{\mathrm{DSS}}\left(1-\frac{V_{GS}}{V_P}\right)^2
\]

**Detalle:** Calcula corriente de saturación JFET a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-008`, `FET-010`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---

## 12.10 Polarización MOSFET
**ID:** `FET-010`

\[
V_{GS}=V_G-I_DR_S
\]

**Detalle:** Calcula polarización MOSFET a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(I_D,I_{DSS}\): A; \(V_{GS},V_{th},V_{DS}\): V; \(k_n\): A/V²; \(R_{DS(\mathrm{on})}\): Ω; \(g_m\): S.

**Condición(es):** NMOS de enriquecimiento salvo JFET; polarización en la región citada.

**Unidad:** A, V, S u Ω

**Relacionadas:** `FET-009`, `FET-001`, `DIO-003`, `DIV-006`.

**Última revisión:** 2026-09-19

---


# 13. Amplificadores y operacional

## 13.1 Ecuación en lazo abierto
**ID:** `OPA-001`

\[
v_o=A(v_+-v_-)
\]

**Detalle:** Calcula ecuación en lazo abierto a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-014`, `OPA-002`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.2 Ganancia infinita ideal
**ID:** `OPA-002`

\[
A\to\infty
\]

**Detalle:** Calcula ganancia infinita ideal a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-001`, `OPA-003`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.3 Cortocircuito virtual
**ID:** `OPA-003`

\[
v_+\approx v_-
\]

**Detalle:** Calcula cortocircuito virtual a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-002`, `OPA-004`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.4 Amplificador inversor
**ID:** `OPA-004`

\[
v_o=-\frac{R_f}{R_{\mathrm{in}}}v_{\mathrm{in}}
\]

**Detalle:** El inversor usa el nudo virtual: Vo=−(Rf/Rin) Vin con v+≈v− a tierra.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-003`, `OPA-005`, `DIV-001`, `DIV-012`.

**Explicación intuitiva:** Para «Amplificador inversor»: con realimentación negativa v+ ≈ v− (nudo virtual) y la red de resistencias fija la ganancia.
**Ejemplo resuelto:** Con \(R_{\mathrm{in}}=10\,\mathrm{k\Omega}\), \(R_f=100\,\mathrm{k\Omega}\) y \(v_i=0.2\,\mathrm V\), \(v_o=-2.0\,\mathrm V\).
**Errores comunes:** olvidar el nudo virtual; usar la ganancia inversora en un no inversor; ignorar |Vo| < Vsat
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de amplificador inversor?
**Respuesta:** Confirmar realimentación negativa, nudo virtual y que Vo no satura.
**Alias de búsqueda:** amplificador inversor, no inversor, nudo virtual, CMRR, comparador

**Última revisión:** 2026-09-19

---

## 13.5 Amplificador no inversor
**ID:** `OPA-005`

\[
v_o=\left(1+\frac{R_f}{R_g}\right)v_{\mathrm{in}}
\]

**Detalle:** El no inversor da ganancia 1+Rf/Rg con entrada en v+ y nudo virtual.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-004`, `OPA-006`, `DIV-001`, `DIV-012`.

**Explicación intuitiva:** Para «Amplificador no inversor»: con realimentación negativa v+ ≈ v− (nudo virtual) y la red de resistencias fija la ganancia.
**Ejemplo resuelto:** Con \(R_g=10\,\mathrm{k\Omega}\), \(R_f=90\,\mathrm{k\Omega}\) y \(v_i=0.2\,\mathrm V\), \(v_o=(1+9)0.2=2.0\,\mathrm V\).
**Errores comunes:** olvidar el nudo virtual; usar la ganancia inversora en un no inversor; ignorar |Vo| < Vsat
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de amplificador no inversor?
**Respuesta:** Confirmar realimentación negativa, nudo virtual y que Vo no satura.
**Alias de búsqueda:** amplificador inversor, no inversor, nudo virtual, CMRR, comparador

**Última revisión:** 2026-09-19

---

## 13.6 Seguidor de tensión
**ID:** `OPA-006`

\[
v_o=v_{\mathrm{in}}
\]

**Detalle:** El seguidor es un no inversor con ganancia 1: Vo=Vin.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-005`, `OPA-007`, `DIV-001`, `DIV-012`.

**Explicación intuitiva:** Para «Seguidor de tensión»: con realimentación negativa v+ ≈ v− (nudo virtual) y la red de resistencias fija la ganancia.
**Ejemplo resuelto:** Con \(v_{\mathrm{in}}=1.5\,\mathrm V\) y alimentación suficiente, el seguidor entrega \(v_o=1.5\,\mathrm V\).
**Errores comunes:** olvidar el nudo virtual; usar la ganancia inversora en un no inversor; ignorar |Vo| < Vsat
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de seguidor de tensión?
**Respuesta:** Confirmar realimentación negativa, nudo virtual y que Vo no satura.
**Alias de búsqueda:** amplificador inversor, no inversor, nudo virtual, CMRR, comparador

**Última revisión:** 2026-09-19

---

## 13.7 Sumador inversor
**ID:** `OPA-007`

\[
v_o=-R_f\sum_k\frac{v_k}{R_k}
\]

**Detalle:** Calcula sumador inversor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-006`, `OPA-008`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.8 Amplificador diferencial
**ID:** `OPA-008`

\[
v_o=\frac{R_2}{R_1}(v_2-v_1)
\]

**Detalle:** Calcula amplificador diferencial a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-007`, `OPA-009`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.9 Integrador inversor
**ID:** `OPA-009`

\[
v_o(t)=-\frac{1}{RC}\int v_{\mathrm{in}}(t)\,dt
\]

**Detalle:** El integrador produce una rampa Vo=−(1/RC)∫Vin dt en lazo negativo.

**Variables:** \(v_{\mathrm{in}},v_o\): V; \(R,C\): Ω, F; \(\tau=RC\): s.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-008`, `OPA-010`, `DIV-001`, `DIV-012`.

**Explicación intuitiva:** Para «Integrador inversor»: C en la realimentación integra Vin; Vo es la rampa −(1/RC)∫Vin dt.
**Ejemplo resuelto:** Con \(R=100\,\mathrm{k\Omega}\), \(C=1\,\mathrm{\mu F}\) y entrada constante de \(1\,\mathrm V\), la salida cambia a \(-10\,\mathrm{V/s}\).
**Errores comunes:** olvidar el nudo virtual; usar la ganancia inversora en un no inversor; ignorar |Vo| < Vsat
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de integrador inversor?
**Respuesta:** Confirmar realimentación negativa, nudo virtual y que Vo no satura.
**Alias de búsqueda:** amplificador inversor, no inversor, nudo virtual, CMRR, comparador

**Última revisión:** 2026-09-19

---

## 13.10 Derivador inversor
**ID:** `OPA-010`

\[
v_o(t)=-RC\frac{dv_{\mathrm{in}}}{dt}
\]

**Detalle:** Calcula derivador inversor a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-009`, `OPA-011`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.11 Comparador en lazo abierto
**ID:** `OPA-011`

\[
v_o=\begin{cases}+V_{\mathrm{sat}}&v_+>v_-\\-V_{\mathrm{sat}}&v_+<v_-\end{cases}
\]

**Detalle:** Calcula comparador en lazo abierto a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-010`, `OPA-012`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.12 Saturación del operacional
**ID:** `OPA-012`

\[
|v_o|\le V_{\mathrm{sat}}
\]

**Detalle:** Calcula saturación del operacional a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-011`, `OPA-013`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.13 Rechazo de modo común
**ID:** `OPA-013`

\[
\mathrm{CMRR}=20\log_{10}\left|\frac{A_d}{A_c}\right|
\]

**Detalle:** Calcula rechazo de modo común a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-012`, `OPA-014`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---

## 13.14 Impedancia de entrada ideal
**ID:** `OPA-014`

\[
R_{\mathrm{in}}\to\infty
\]

**Detalle:** Calcula impedancia de entrada ideal a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(v_+,v_-,v_o,v_{\mathrm{in}}\): V; \(A\): ganancia (adimensional); \(R_f,R_{\mathrm{in}},R_g\): Ω; \(\mathrm{CMRR}\): adimensional.

**Condición(es):** Op-amp ideal en lazo negativo salvo comparador; |Vo| < Vsat.

**Unidad:** V o adimensional

**Relacionadas:** `OPA-013`, `OPA-001`, `DIV-001`, `DIV-012`.

**Última revisión:** 2026-09-19

---


# 14. Familias lógicas y puertas

## 14.1 Niveles eléctricos lógicos
**ID:** `LGC-001`

\[
V_{OL}<V_{IL}<V_{IH}<V_{OH}
\]

**Detalle:** Los niveles VOH VOL VIH VIL delimitan alto y bajo válidos en la VTC.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-012`, `LGC-002`, `ELE-009`, `PAC-001`.

**Explicación intuitiva:** Para «Niveles eléctricos lógicos»: VOH, VOL, VIH y VIL definen márgenes de ruido y la VTC CMOS invierte entre rieles.
**Ejemplo resuelto:** Si \(V_{OL}=0.2\,\mathrm V\), \(V_{IL}=0.8\,\mathrm V\), \(V_{IH}=2.0\,\mathrm V\) y \(V_{OH}=4.5\,\mathrm V\), se conserva el orden requerido.
**Errores comunes:** confundir VIH con VOH; olvidar el margen de ruido; calcular fan-out sin corriente de entrada
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de niveles eléctricos lógicos?
**Respuesta:** Usar los niveles de la familia y medir márgenes en estático.
**Alias de búsqueda:** VOH VOL, margen de ruido, VTC CMOS, fan-out, tiempo de propagación

**Última revisión:** 2026-09-19

---

## 14.2 Margen de ruido alto
**ID:** `LGC-002`

\[
\mathrm{NMH}=V_{OH(\min)}-V_{IH(\min)}
\]

**Detalle:** NMH=VOH−VIH es el margen de ruido alto entre salida alta y umbral de entrada alta.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-001`, `LGC-003`, `ELE-009`, `PAC-001`.

**Explicación intuitiva:** Para «Margen de ruido alto»: VOH, VOL, VIH y VIL definen márgenes de ruido y la VTC CMOS invierte entre rieles.
**Ejemplo resuelto:** Si \(V_{OH(\min)}=4.4\,\mathrm V\) y \(V_{IH(\min)}=3.5\,\mathrm V\), \(\mathrm{NMH}=0.9\,\mathrm V\).
**Errores comunes:** confundir VIH con VOH; olvidar el margen de ruido; calcular fan-out sin corriente de entrada
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de margen de ruido alto?
**Respuesta:** Usar los niveles de la familia y medir márgenes en estático.
**Alias de búsqueda:** VOH VOL, margen de ruido, VTC CMOS, fan-out, tiempo de propagación

**Última revisión:** 2026-09-19

---

## 14.3 Margen de ruido bajo
**ID:** `LGC-003`

\[
\mathrm{NML}=V_{IL(\max)}-V_{OL(\max)}
\]

**Detalle:** Calcula margen de ruido bajo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-002`, `LGC-004`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.4 Retardo de propagación alto a bajo
**ID:** `LGC-004`

\[
t_{pHL}=t(V_o:1\to0)-t(V_i:0\to1)
\]

**Detalle:** Calcula retardo de propagación alto a bajo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-003`, `LGC-005`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.5 Retardo medio de propagación
**ID:** `LGC-005`

\[
t_p=\frac{t_{pHL}+t_{pLH}}{2}
\]

**Detalle:** Calcula retardo medio de propagación a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-004`, `LGC-006`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.6 Fan-out
**ID:** `LGC-006`

\[
\mathrm{FO}=\min\left(\frac{I_{OH}}{I_{IH}},\frac{I_{OL}}{I_{IL}}\right)
\]

**Detalle:** Calcula fan-out a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-005`, `LGC-007`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.7 Característica de transferencia CMOS
**ID:** `LGC-007`

\[
V_o=f(V_i)
\]

**Detalle:** La VTC CMOS invierte: Vin bajo da VOH y Vin alto da VOL, con umbral cerca de VDD/2.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-006`, `LGC-008`, `ELE-009`, `PAC-001`.

**Explicación intuitiva:** Para «Característica de transferencia CMOS»: VOH, VOL, VIH y VIL definen márgenes de ruido y la VTC CMOS invierte entre rieles.
**Ejemplo resuelto:** En una VTC CMOS de \(5\,\mathrm V\), una transición centrada cerca de \(2.5\,\mathrm V\) lleva la salida de casi 5 V a casi 0 V.
**Errores comunes:** confundir VIH con VOH; olvidar el margen de ruido; calcular fan-out sin corriente de entrada
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de característica de transferencia CMOS?
**Respuesta:** Usar los niveles de la familia y medir márgenes en estático.
**Alias de búsqueda:** VOH VOL, margen de ruido, VTC CMOS, fan-out, tiempo de propagación

**Última revisión:** 2026-09-19

---

## 14.8 Umbral de conmutación
**ID:** `LGC-008`

\[
V_M:\ V_o=V_i
\]

**Detalle:** Calcula umbral de conmutación a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-007`, `LGC-009`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.9 Resistencia de pull-up
**ID:** `LGC-009`

\[
R_P\le\frac{V_{CC}-V_{IH}}{I_{\mathrm{carga}}}
\]

**Detalle:** Calcula resistencia de pull-up a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-008`, `LGC-010`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.10 Niveles CMOS frente a TTL
**ID:** `LGC-010`

\[
V_{IH,\mathrm{CMOS}}\ne V_{IH,\mathrm{TTL}}
\]

**Detalle:** Calcula niveles CMOS frente a TTL a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-009`, `LGC-011`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.11 Producto potencia-retardo
**ID:** `LGC-011`

\[
\mathrm{PDP}=P_{\mathrm{med}}t_p
\]

**Detalle:** Calcula producto potencia-retardo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-010`, `LGC-012`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---

## 14.12 Fan-in
**ID:** `LGC-012`

\[
\mathrm{FI}=N_{\mathrm{entradas}}
\]

**Detalle:** Calcula fan-in a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(V_{OH},V_{OL},V_{IH},V_{IL},V_M\): V; \(t_{pHL},t_p\): s; \(R_{\mathrm{pu}}\): Ω; fan-out y fan-in: adimensionales.

**Condición(es):** Familia lógica con alimentación fija; niveles medidos en estático.

**Unidad:** V, s o adimensional

**Relacionadas:** `LGC-011`, `LGC-001`, `ELE-009`, `PAC-001`.

**Última revisión:** 2026-09-19

---


# 15. Lógica combinacional

## 15.1 Multiplexor de dos entradas
**ID:** `CMB-001`

\[
Y=\overline SA+SB
\]

**Detalle:** Calcula multiplexor de dos entradas a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-012`, `CMB-002`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.2 Demultiplexor uno a dos
**ID:** `CMB-002`

\[
Y_0=\overline SD,\qquad Y_1=SD
\]

**Detalle:** Calcula demultiplexor uno a dos a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-001`, `CMB-003`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.3 Decodificador de dos a cuatro
**ID:** `CMB-003`

\[
Y_k=1\Longleftrightarrow k=(A_1A_0)_2
\]

**Detalle:** Calcula decodificador de dos a cuatro a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-002`, `CMB-004`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.4 Codificador binario
**ID:** `CMB-004`

\[
(A_{n-1}\ldots A_0)_2=\operatorname{índice}(D_i=1)
\]

**Detalle:** Calcula codificador binario a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-003`, `CMB-005`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.5 Sumador completo
**ID:** `CMB-005`

\[
S=A\oplus B\oplus C_{\mathrm{in}}
\]

**Detalle:** Calcula sumador completo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-004`, `CMB-006`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.6 Acarreo de salida
**ID:** `CMB-006`

\[
C_{\mathrm{out}}=AB+C_{\mathrm{in}}(A\oplus B)
\]

**Detalle:** Calcula acarreo de salida a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-005`, `CMB-007`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.7 Comparador de magnitud
**ID:** `CMB-007`

\[
G=(A>B),\qquad E=(A=B),\qquad L=(A<B)
\]

**Detalle:** Calcula comparador de magnitud a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-006`, `CMB-008`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.8 Peligro estático
**ID:** `CMB-008`

\[
\Delta t_{\mathrm{hazard}}\approx|t_{p1}-t_{p2}|
\]

**Detalle:** Calcula peligro estático a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-007`, `CMB-009`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.9 Método de Karnaugh
**ID:** `CMB-009`

\[
F_{\min}=\sum\text{grupos de }2^m\text{ celdas}
\]

**Detalle:** Calcula método de Karnaugh a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-008`, `CMB-010`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.10 Salida tri-state
**ID:** `CMB-010`

\[
Y=\begin{cases}D&\mathrm{EN}=1\\Z&\mathrm{EN}=0\end{cases}
\]

**Detalle:** Calcula salida tri-state a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-009`, `CMB-011`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.11 Codificador de prioridad
**ID:** `CMB-011`

\[
Y=\operatorname{índice}\!\left(\max\{i:D_i=1\}\right)
\]

**Detalle:** Calcula codificador de prioridad a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-010`, `CMB-012`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---

## 15.12 Puerta XOR en hardware
**ID:** `CMB-012`

\[
Y=A\oplus B=\overline AB+A\overline B
\]

**Detalle:** Calcula puerta XOR en hardware a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** Entradas y salidas lógicas \(A,B,S,Y,C_{\mathrm{out}}\): \{0,1\}. El mapa de Karnaugh minimiza, no redefine identidades (`ALG-BOO-*`).

**Condición(es):** Lógica combinacional sin memoria; hazards dependen del retardo de puertas.

**Unidad:** adimensional (lógica)

**Relacionadas:** `CMB-011`, `CMB-001`, `ALG-BOO-001`, `ALG-BOO-007`.

**Última revisión:** 2026-09-19

---


# 16. Lógica secuencial

## 16.1 Latch SR
**ID:** `SEQ-001`

\[
Q^+=S+\overline RQ
\]

**Detalle:** Calcula latch SR a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(S,R,Q,Q^+\): bits; Enable: nivel de habilitación (no flanco).

**Condición(es):** Latch SR sensible al nivel de Enable, no al flanco; la combinación S=R=1 está prohibida.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-014`, `SEQ-002`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.2 Latch D
**ID:** `SEQ-002`

\[
Q^+=D
\]

**Detalle:** Calcula latch D a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Latch D transparente mientras Enable está activo (nivel); no usa flanco de reloj.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-001`, `SEQ-003`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.3 Flip-flop D
**ID:** `SEQ-003`

\[
Q(t_{\mathrm{clk}}^+)=D(t_{\mathrm{clk}}^-)
\]

**Detalle:** El flip-flop D muestrea D en el flanco de reloj y retiene Q hasta el siguiente.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-002`, `SEQ-004`, `CMB-005`, `LGC-005`.

**Explicación intuitiva:** Para «Flip-flop D»: el flanco muestrea D; tsu y th marcan la ventana donde un cambio provoca metastabilidad.
**Ejemplo resuelto:** Si \(D=1\) justo antes del flanco y se cumplen setup y hold, después del flanco \(Q=1\).
**Errores comunes:** ignorar tsu o th; tratar un latch transparente como flip-flop; olvidar el flanco activo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de flip-flop D?
**Respuesta:** Respetar el flanco activo y las ventanas tsu y th.
**Alias de búsqueda:** flip-flop D, tiempo de setup, hold, contador, máquina de Moore

**Última revisión:** 2026-09-19

---

## 16.4 Flip-flop JK
**ID:** `SEQ-004`

\[
Q^+=J\overline Q+\overline KQ
\]

**Detalle:** Calcula flip-flop JK a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-003`, `SEQ-005`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.5 Flip-flop T
**ID:** `SEQ-005`

\[
Q^+=T\oplus Q
\]

**Detalle:** Calcula flip-flop T a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-004`, `SEQ-006`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.6 Tiempo de setup
**ID:** `SEQ-006`

\[
t_{\mathrm{setup}}=t_{\mathrm{clk}}-t_{D,\mathrm{estable}}
\]

**Detalle:** El tiempo de setup tsu es la ventana en que D debe ser estable antes del flanco.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-005`, `SEQ-007`, `CMB-005`, `LGC-005`.

**Explicación intuitiva:** Para «Tiempo de setup»: el flanco muestrea D; tsu y th marcan la ventana donde un cambio provoca metastabilidad.
**Ejemplo resuelto:** Si el reloj llega a \(100\,\mathrm{ns}\) y D quedó estable a \(95\,\mathrm{ns}\), el setup disponible es \(5\,\mathrm{ns}\).
**Errores comunes:** ignorar tsu o th; tratar un latch transparente como flip-flop; olvidar el flanco activo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de tiempo de setup?
**Respuesta:** Respetar el flanco activo y las ventanas tsu y th.
**Alias de búsqueda:** flip-flop D, tiempo de setup, hold, contador, máquina de Moore

**Última revisión:** 2026-09-19

---

## 16.7 Tiempo de hold
**ID:** `SEQ-007`

\[
t_{\mathrm{hold}}=t_{D,\mathrm{estable}}-t_{\mathrm{clk}}
\]

**Detalle:** El hold th es la ventana en que D debe permanecer estable después del flanco.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-006`, `SEQ-008`, `CMB-005`, `LGC-005`.

**Explicación intuitiva:** Para «Tiempo de hold»: el flanco muestrea D; tsu y th marcan la ventana donde un cambio provoca metastabilidad.
**Ejemplo resuelto:** Si el reloj llega a \(100\,\mathrm{ns}\) y D permanece estable hasta \(103\,\mathrm{ns}\), el hold disponible es \(3\,\mathrm{ns}\).
**Errores comunes:** ignorar tsu o th; tratar un latch transparente como flip-flop; olvidar el flanco activo
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de tiempo de hold?
**Respuesta:** Respetar el flanco activo y las ventanas tsu y th.
**Alias de búsqueda:** flip-flop D, tiempo de setup, hold, contador, máquina de Moore

**Última revisión:** 2026-09-19

---

## 16.8 Registro de n bits
**ID:** `SEQ-008`

\[
\mathbf Q^+=\mathbf D
\]

**Detalle:** Calcula registro de n bits a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-007`, `SEQ-009`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.9 Contador binario
**ID:** `SEQ-009`

\[
Q^+=(Q+1)\bmod 2^n
\]

**Detalle:** Calcula contador binario a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-008`, `SEQ-010`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.10 Contador módulo n
**ID:** `SEQ-010`

\[
Q^+=(Q+1)\bmod n
\]

**Detalle:** Calcula contador módulo n a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-009`, `SEQ-011`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.11 Máquina de Moore
**ID:** `SEQ-011`

\[
Y=g(Q)
\]

**Detalle:** Calcula máquina de Moore a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-010`, `SEQ-012`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.12 Máquina de Mealy
**ID:** `SEQ-012`

\[
Y=g(Q,X)
\]

**Detalle:** Calcula máquina de Mealy a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-011`, `SEQ-013`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.13 Frecuencia máxima síncrona
**ID:** `SEQ-013`

\[
f_{\max}\le\frac{1}{t_{pcq}+t_{\mathrm{comb}}+t_{\mathrm{setup}}}
\]

**Detalle:** Calcula frecuencia máxima síncrona a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-012`, `SEQ-014`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---

## 16.14 Metastabilidad
**ID:** `SEQ-014`

\[
\mathrm{MTBF}\propto\frac{e^{t_{\mathrm{res}}/\tau_m}}{f_{\mathrm{clk}}f_{\mathrm{datos}}}
\]

**Detalle:** Calcula metastabilidad a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(D,J,K,T,Q\): bits; \(t_{su},t_h,t_{pcq}\): s; \(n\): bits o módulo; \(f_{\max}\): Hz.

**Condición(es):** Flanco activo indicado; respetar tsu y th.

**Unidad:** s, Hz o adimensional

**Relacionadas:** `SEQ-013`, `SEQ-001`, `CMB-005`, `LGC-005`.

**Última revisión:** 2026-09-19

---


# 17. Conversión A/D–D/A y muestreo

## 17.1 Criterio de Nyquist
**ID:** `ADC-001`

\[
f_s>2f_{\max}
\]

**Detalle:** Nyquist exige fs>2 fmax para muestrear sin aliasing.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-010`, `ADC-002`, `FAS-002`, `FIL-001`.

**Explicación intuitiva:** Para «Criterio de Nyquist»: fs > 2 fmax evita aliasing; n bits parte VFS en 2^n niveles y PWM usa el ciclo útil.
**Ejemplo resuelto:** Para una señal limitada a \(20\,\mathrm{kHz}\), Nyquist exige \(f_s>40\,\mathrm{kHz}\); \(48\,\mathrm{kHz}\) cumple.
**Errores comunes:** tomar fs = fmax como Nyquist; olvidar el ±Δ/2 del error; mezclar LSB con el número de niveles
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de criterio de Nyquist?
**Respuesta:** Verificar Nyquist, el rango VFS y el número de bits.
**Alias de búsqueda:** Nyquist, cuantización, PWM, DAC R-2R, ADC flash

**Última revisión:** 2026-09-19

---

## 17.2 Frecuencia de Nyquist
**ID:** `ADC-002`

\[
f_N=\frac{f_s}{2}
\]

**Detalle:** Calcula frecuencia de Nyquist a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-001`, `ADC-003`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

## 17.3 Paso de cuantización
**ID:** `ADC-003`

\[
\Delta=\frac{V_{\mathrm{FS}}}{2^n}
\]

**Detalle:** El paso de cuantización Δ=VFS/2^n es la altura de cada escalón digital.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-002`, `ADC-004`, `FAS-002`, `FIL-001`.

**Explicación intuitiva:** Para «Paso de cuantización»: fs > 2 fmax evita aliasing; n bits parte VFS en 2^n niveles y PWM usa el ciclo útil.
**Ejemplo resuelto:** Con \(V_{\mathrm{FS}}=5.12\,\mathrm V\) y \(n=10\), \(\Delta=5.12/1024=5\,\mathrm{mV}\).
**Errores comunes:** tomar fs = fmax como Nyquist; olvidar el ±Δ/2 del error; mezclar LSB con el número de niveles
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de paso de cuantización?
**Respuesta:** Verificar Nyquist, el rango VFS y el número de bits.
**Alias de búsqueda:** Nyquist, cuantización, PWM, DAC R-2R, ADC flash

**Última revisión:** 2026-09-19

---

## 17.4 Error de cuantización
**ID:** `ADC-004`

\[
-\frac{\Delta}{2}\le e_q<\frac{\Delta}{2}
\]

**Detalle:** Calcula error de cuantización a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-003`, `ADC-005`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

## 17.5 Ciclo de trabajo PWM
**ID:** `ADC-005`

\[
\delta=\frac{t_{\mathrm{on}}}{T}
\]

**Detalle:** El ciclo útil PWM δ=ton/T es la fracción de periodo en alto.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-004`, `ADC-006`, `FAS-002`, `FIL-001`.

**Explicación intuitiva:** Para «Ciclo de trabajo PWM»: fs > 2 fmax evita aliasing; n bits parte VFS en 2^n niveles y PWM usa el ciclo útil.
**Ejemplo resuelto:** Con \(t_{\mathrm{on}}=2\,\mathrm{ms}\) y \(T=5\,\mathrm{ms}\), \(\delta=2/5=0.40=40\%\).
**Errores comunes:** tomar fs = fmax como Nyquist; olvidar el ±Δ/2 del error; mezclar LSB con el número de niveles
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de ciclo de trabajo PWM?
**Respuesta:** Verificar Nyquist, el rango VFS y el número de bits.
**Alias de búsqueda:** Nyquist, cuantización, PWM, DAC R-2R, ADC flash

**Última revisión:** 2026-09-19

---

## 17.6 DAC de escalera R-2R
**ID:** `ADC-006`

\[
V_o=-V_{\mathrm{ref}}\sum_{k=1}^{n}\frac{b_k}{2^k}
\]

**Detalle:** El DAC R-2R suma pesos binarios de la escalera para reconstruir la tensión.

**Variables:** \(V_o,V_{\mathrm{ref}}\): V; \(b_k\): bits; \(n\): bits; \(R\): Ω de la escalera.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-005`, `ADC-007`, `FAS-002`, `FIL-001`.

**Explicación intuitiva:** Para «DAC de escalera R-2R»: cada bit bk aporta Vref/2^k a través de la red R y 2R.
**Ejemplo resuelto:** Para un DAC R-2R de 3 bits, código \(101\) y \(V_{\mathrm{ref}}=8\,\mathrm V\), \(v_o=-8(1/2+1/8)=-5\,\mathrm V\).
**Errores comunes:** tomar fs = fmax como Nyquist; olvidar el ±Δ/2 del error; mezclar LSB con el número de niveles
**Pregunta:** ¿Qué debe verificarse antes de usar la relación de DAC de escalera R-2R?
**Respuesta:** Verificar Nyquist, el rango VFS y el número de bits.
**Alias de búsqueda:** Nyquist, cuantización, PWM, DAC R-2R, ADC flash

**Última revisión:** 2026-09-19

---

## 17.7 Peso del bit menos significativo
**ID:** `ADC-007`

\[
\mathrm{LSB}=\frac{V_{\mathrm{FS}}}{2^n}
\]

**Detalle:** Calcula peso del bit menos significativo a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-006`, `ADC-008`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

## 17.8 Número de niveles digitales
**ID:** `ADC-008`

\[
N=2^n
\]

**Detalle:** Calcula número de niveles digitales a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-007`, `ADC-009`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

## 17.9 Comparadores de un ADC flash
**ID:** `ADC-009`

\[
N_{\mathrm{comp}}=2^n-1
\]

**Detalle:** Calcula comparadores de un ADC flash a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-008`, `ADC-010`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

## 17.10 Conversión por aproximaciones sucesivas
**ID:** `ADC-010`

\[
D_k=\operatorname{SAR}(V_{\mathrm{in}},V_{\mathrm{DAC}})
\]

**Detalle:** Calcula conversión por aproximaciones sucesivas a partir del modelo del circuito y de las condiciones indicadas.

**Variables:** \(f_s,f_{\max},f_N\): Hz; \(n\): bits; \(V_{\mathrm{FS}}\): V; \(\Delta\): V; \(\delta\): adimensional; \(t_{\mathrm{on}},T\): s.

**Condición(es):** Convertidor ideal, señal limitada en banda y rango.

**Unidad:** Hz, V o adimensional

**Relacionadas:** `ADC-009`, `ADC-001`, `FAS-002`, `FIL-001`.

**Última revisión:** 2026-09-19

---

# 18. Guía para enfocar un circuito

| Señal o problema | Enfoque recomendado |
|---|---|
| DC resistivo | Reducir la red y obtener Thévenin/Norton |
| Red con carga | Incluir la carga antes del divisor |
| Transitorio RC | Hallar \(v_C(0^+)\), \(v_C(\infty)\) y \(\tau=RC\) |
| Transitorio RL | Hallar \(i_L(0^+)\), \(i_L(\infty)\) y \(\tau=L/R\) |
| Circuito RLC | Formular la ecuación característica y clasificar \(\zeta\) |
| Sinusoides | Convertir a fasores RMS e impedancias |
| Potencia CA o resonancia | Calcular \(P,Q,S\), FP y condición reactiva |
| Filtro | Obtener \(H(j\omega)\), cortes, pendiente y carga |
| Rectificador con diodo | Elegir modelo, identificar conducción y rizado |
| Amplificador operacional | Confirmar realimentación, región lineal y saturación |
| Lógica combinacional | Escribir tabla de verdad, minimizar y revisar peligros |
| Secuencial o flip-flop | Revisar reloj, setup, hold y estado siguiente |

## 18.1 Orden práctico de revisión

1. Dibujar nodos, referencias, polaridades y sentidos.
2. Identificar si la excitación es DC, transitoria, sinusoidal o digital.
3. Separar estado inicial, régimen de transición y estado final.
4. Elegir el modelo válido de cada componente y su región de operación.
5. Simplificar la red y plantear KCL, KVL, fasores o tabla de estados.
6. Resolver con unidades SI y conservar signos y valores RMS o pico.
7. Verificar límites, potencia, saturación, frecuencia y temporización.
8. Comparar el resultado con una estimación física y documentar supuestos.

# Frontera con Física Básica y Álgebra

Física Básica conserva las definiciones elementales de ley de Ohm, leyes de Kirchhoff y capacitancia (`ELE-009`, `ELE-014`, `ELE-015`, `ELE-018`). Álgebra conserva identidades booleanas como `ALG-BOO-001`, `ALG-BOO-006`, `ALG-BOO-007` y `ALG-BOO-008`. Este curso es responsable del análisis de circuitos, los modelos de dispositivos electrónicos y su implementación en hardware digital.

# Fuentes de referencia para validación

- Sedra y Smith, *Microelectronic Circuits*, para diodos, transistores y amplificadores.
- Nilsson y Riedel, *Electric Circuits*, para redes, transitorios, AC y filtros.
- Floyd, *Digital Fundamentals*, para familias, combinacional y secuencial.
- Horowitz y Hill, *The Art of Electronics*, como contraste práctico de diseño.

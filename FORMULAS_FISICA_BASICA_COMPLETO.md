# Fórmulas de Física Básica

Catálogo ampliado y corregido de fórmulas para la app **Fórmulas de Física Básica**.

El documento está organizado para soportar dos vistas en la aplicación:

- **Vista de catálogo:** nombre + fórmula principal + descripción breve.
- **Vista de detalle:** explicación, variables, condiciones de validez y fórmulas relacionadas.
- **Relaciones:** cada fórmula posee un **ID estable** que puede utilizarse para crear enlaces internos entre fórmulas.

> **Convención:** los signos dependen del sistema de coordenadas elegido. Cuando se usa caída libre con eje vertical positivo hacia arriba, la aceleración es \(a_y=-g\).

---

# Índice

1. [Vectores](#1-vectores)
2. [Cinemática 1D](#2-cinemática-1d)
3. [Movimiento 2D y 3D](#3-movimiento-2d-y-3d)
4. [Leyes de Newton y fuerzas](#4-leyes-de-newton-y-fuerzas)
5. [Movimiento circular](#5-movimiento-circular)
6. [Trabajo, energía y potencia](#6-trabajo-energía-y-potencia)
7. [Momento lineal, impulso y colisiones](#7-momento-lineal-impulso-y-colisiones)
8. [Rotación](#8-rotación)
9. [Equilibrio y elasticidad](#9-equilibrio-y-elasticidad)
10. [Gravitación](#10-gravitación)
11. [Mecánica de fluidos](#11-mecánica-de-fluidos)
12. [Oscilaciones y movimiento periódico](#12-oscilaciones-y-movimiento-periódico)
13. [Ondas](#13-ondas)
14. [Sonido](#14-sonido)
15. [Termodinámica](#15-termodinámica)
16. [Electricidad básica](#16-electricidad-básica)
17. [Constantes físicas](#17-constantes-físicas)
18. [Resumen de relaciones](#18-resumen-de-relaciones)

---

# Notación general

| Símbolo | Significado | Unidad SI |
|---|---|---|
| \(x,y,z,r\) | posición o distancia | m |
| \(t\) | tiempo | s |
| \(v\) | velocidad/rapidez | m/s |
| \(a\) | aceleración | m/s² |
| \(m\) | masa | kg |
| \(F\) | fuerza | N |
| \(W\) | trabajo | J |
| \(P\) | potencia o presión, según contexto | W o Pa |
| \(E\) | energía o campo eléctrico, según contexto | J o N/C |
| \(g\) | aceleración gravitatoria | m/s² |
| \(\rho\) | densidad | kg/m³ |
| \(\theta,\phi\) | ángulos | rad |
| \(\omega\) | velocidad/frecuencia angular | rad/s |
| \(\alpha\) | aceleración angular | rad/s² |

---

# 1. Vectores

## 1.1 Magnitud de un vector
**ID:** `VEC-001`

\[
|\vec A|=\sqrt{A_x^2+A_y^2+A_z^2}
\]

**Detalle:** calcula el módulo de un vector a partir de sus componentes cartesianas.

**Variables:** \(A_x,A_y,A_z\): componentes del vector.

**Relacionadas:** `VEC-002`, `VEC-003`, `VEC-005`.

---

## 1.2 Vector unitario
**ID:** `VEC-002`

\[
\hat u_A=\frac{\vec A}{|\vec A|}
\]

**Detalle:** produce un vector de magnitud uno con la misma dirección y sentido que \(\vec A\).

**Condición:** \(|\vec A|\neq0\).

**Relacionadas:** `VEC-001`, `VEC-003`.

---

## 1.3 Descomposición cartesiana
**ID:** `VEC-003`

\[
\vec A=A_x\hat i+A_y\hat j+A_z\hat k
\]

En dos dimensiones:

\[
A_x=A\cos\theta,\qquad A_y=A\sin\theta
\]

**Relacionadas:** `VEC-001`, `VEC-004`, `MOV-006`, `NEW-008`.

---

## 1.4 Suma de vectores
**ID:** `VEC-004`

\[
\vec R=\sum_i\vec A_i
\]

Por componentes:

\[
R_x=\sum_i A_{ix},\qquad
R_y=\sum_i A_{iy},\qquad
R_z=\sum_i A_{iz}
\]

**Relacionadas:** `VEC-003`, `NEW-002`.

---

## 1.5 Producto escalar
**ID:** `VEC-005`

\[
\vec A\cdot\vec B=AB\cos\theta
\]

También:

\[
\vec A\cdot\vec B=A_xB_x+A_yB_y+A_zB_z
\]

**Detalle:** su resultado es un escalar.

**Relacionadas:** `ENE-001`, `ENE-009`.

---

## 1.6 Producto vectorial
**ID:** `VEC-006`

\[
\vec A\times\vec B=AB\sin\theta\,\hat n
\]

**Detalle:** el resultado es perpendicular al plano formado por \(\vec A\) y \(\vec B\).

**Relacionadas:** `ROT-008`, `MOM-008`.

---

# 2. Cinemática 1D

## 2.1 Desplazamiento
**ID:** `CIN-001`

\[
\Delta x=x_f-x_i
\]

**Detalle:** cambio de posición. Puede ser positivo, negativo o cero.

**Relacionadas:** `CIN-002`, `CIN-004`.

---

## 2.2 Velocidad media
**ID:** `CIN-002`

\[
v_{\text{med}}=\frac{\Delta x}{\Delta t}
=\frac{x_f-x_i}{t_f-t_i}
\]

**Relacionadas:** `CIN-001`, `CIN-003`.

---

## 2.3 Rapidez media
**ID:** `CIN-003`

\[
v_{\text{rap,med}}=\frac{d_{\text{total}}}{\Delta t}
\]

**Detalle:** utiliza distancia total recorrida, no desplazamiento.

**Relacionadas:** `CIN-002`.

---

## 2.4 Velocidad instantánea
**ID:** `CIN-004`

\[
v=\frac{dx}{dt}
\]

**Relacionadas:** `CIN-006`, `CIN-012`.

---

## 2.5 Aceleración media
**ID:** `CIN-005`

\[
a_{\text{med}}=\frac{\Delta v}{\Delta t}
=\frac{v_f-v_i}{t_f-t_i}
\]

**Relacionadas:** `CIN-006`.

---

## 2.6 Aceleración instantánea
**ID:** `CIN-006`

\[
a=\frac{dv}{dt}=\frac{d^2x}{dt^2}
\]

**Relacionadas:** `CIN-004`, `CIN-013`.

---

## 2.7 MRU
**ID:** `CIN-007`

\[
x=x_0+vt
\]

**Condición:** \(v\) constante y \(a=0\).

**Relacionadas:** `CIN-002`, `CIN-004`.

---

## 2.8 MRUA — velocidad
**ID:** `CIN-008`

\[
v=v_0+at
\]

**Condición:** aceleración constante.

**Relacionadas:** `CIN-009`, `CIN-010`, `CIN-011`.

---

## 2.9 MRUA — posición
**ID:** `CIN-009`

\[
x=x_0+v_0t+\frac12at^2
\]

Por tanto:

\[
\Delta x=v_0t+\frac12at^2
\]

**Nota:** \(\Delta x\) es desplazamiento; solo coincide con la distancia recorrida si no cambia el sentido del movimiento.

**Relacionadas:** `CIN-008`, `CIN-010`.

---

## 2.10 Ecuación de Torricelli
**ID:** `CIN-010`

\[
v_f^2=v_0^2+2a\Delta x
\]

**Detalle:** elimina explícitamente el tiempo de las ecuaciones del MRUA.

**Relacionadas:** `CIN-008`, `CIN-009`.

---

## 2.11 Desplazamiento con velocidad media en MRUA
**ID:** `CIN-011`

\[
\Delta x=\frac{v_0+v_f}{2}\,t
\]

**Condición:** aceleración constante.

**Relacionadas:** `CIN-002`, `CIN-008`.

---

## 2.12 Velocidad desde aceleración variable
**ID:** `CIN-012`

\[
v(t)=v(t_0)+\int_{t_0}^{t}a(\tau)\,d\tau
\]

**Relacionadas:** `CIN-004`, `CIN-006`, `CIN-013`.

---

## 2.13 Posición desde velocidad variable
**ID:** `CIN-013`

\[
x(t)=x(t_0)+\int_{t_0}^{t}v(\tau)\,d\tau
\]

**Relacionadas:** `CIN-004`, `CIN-012`.

---

## 2.14 Caída libre — velocidad
**ID:** `CIN-014`

\[
v_y=v_{0y}-gt
\]

**Condición:** eje \(y\) positivo hacia arriba y resistencia del aire despreciable.

**Relacionadas:** `CIN-015`, `CIN-016`.

---

## 2.15 Caída libre — posición
**ID:** `CIN-015`

\[
y=y_0+v_{0y}t-\frac12gt^2
\]

**Relacionadas:** `CIN-014`, `CIN-016`.

---

## 2.16 Caída libre — relación velocidad/altura
**ID:** `CIN-016`

\[
v_y^2=v_{0y}^2-2g(y-y_0)
\]

**Relacionadas:** `CIN-010`, `CIN-014`, `CIN-017`.

---

## 2.17 Altura máxima en lanzamiento vertical
**ID:** `CIN-017`

\[
\Delta h_{\max}=\frac{v_0^2}{2g}
\]

**Condiciones:** lanzamiento estrictamente vertical; \(v_y=0\) en la altura máxima; resistencia del aire despreciable.

**Relacionadas:** `CIN-016`, `CIN-018`, `MOV-009`.

---

## 2.18 Tiempo de subida vertical
**ID:** `CIN-018`

\[
t_{\text{subida}}=\frac{v_0}{g}
\]

**Relacionadas:** `CIN-017`, `CIN-019`.

---

## 2.19 Tiempo de vuelo vertical
**ID:** `CIN-019`

\[
t_{\text{vuelo}}=\frac{2v_0}{g}
\]

**Condición:** el objeto regresa a la misma altura desde la que fue lanzado.

**Relacionadas:** `CIN-018`, `MOV-008`.

---

# 3. Movimiento 2D y 3D

## 3.1 Vector posición
**ID:** `MOV-001`

\[
\vec r=x\hat i+y\hat j+z\hat k
\]

**Relacionadas:** `MOV-002`, `VEC-003`.

---

## 3.2 Desplazamiento vectorial
**ID:** `MOV-002`

\[
\Delta\vec r=\vec r_f-\vec r_i
\]

**Relacionadas:** `MOV-001`, `MOV-003`.

---

## 3.3 Velocidad media vectorial
**ID:** `MOV-003`

\[
\vec v_{\text{med}}=\frac{\Delta\vec r}{\Delta t}
\]

**Relacionadas:** `MOV-002`, `MOV-004`.

---

## 3.4 Velocidad instantánea vectorial
**ID:** `MOV-004`

\[
\vec v=\frac{d\vec r}{dt}
\]

**Relacionadas:** `MOV-005`.

---

## 3.5 Aceleración vectorial
**ID:** `MOV-005`

\[
\vec a=\frac{d\vec v}{dt}
=\frac{d^2\vec r}{dt^2}
\]

**Relacionadas:** `MOV-004`, `NEW-002`.

---

## 3.6 Componentes de velocidad inicial de un proyectil
**ID:** `MOV-006`

\[
v_{0x}=v_0\cos\theta,\qquad
v_{0y}=v_0\sin\theta
\]

**Relacionadas:** `VEC-003`, `MOV-007`, `MOV-008`.

---

## 3.7 Proyectil — posición horizontal
**ID:** `MOV-007`

\[
x=x_0+(v_0\cos\theta)t
\]

**Condiciones:** sin resistencia del aire; \(a_x=0\).

**Relacionadas:** `MOV-006`, `MOV-008`, `MOV-010`.

---

## 3.8 Proyectil — posición vertical
**ID:** `MOV-008`

\[
y=y_0+(v_0\sin\theta)t-\frac12gt^2
\]

**Relacionadas:** `MOV-006`, `MOV-009`.

---

## 3.9 Proyectil — velocidad vertical
**ID:** `MOV-009`

\[
v_y=v_0\sin\theta-gt
\]

**Nota:** esta corrige la expresión \(v_y=v_0\sin\theta\), que solo corresponde al valor inicial.

**Relacionadas:** `MOV-006`, `MOV-008`, `MOV-011`.

---

## 3.10 Proyectil — velocidad horizontal
**ID:** `MOV-010`

\[
v_x=v_0\cos\theta
\]

**Condición:** sin resistencia del aire.

**Relacionadas:** `MOV-006`, `MOV-007`.

---

## 3.11 Tiempo hasta la altura máxima
**ID:** `MOV-011`

\[
t_{\max}=\frac{v_0\sin\theta}{g}
\]

**Condición:** \(v_y=0\) en la cima.

**Relacionadas:** `MOV-009`, `MOV-012`.

---

## 3.12 Altura máxima de un proyectil
**ID:** `MOV-012`

\[
H=\frac{v_0^2\sin^2\theta}{2g}
\]

**Detalle:** altura adicional respecto del punto de lanzamiento.

**Relacionadas:** `MOV-011`, `CIN-017`.

---

## 3.13 Tiempo total de vuelo de un proyectil
**ID:** `MOV-013`

\[
t_{\text{vuelo}}=\frac{2v_0\sin\theta}{g}
\]

**Condición:** punto de llegada a la misma altura que el punto de lanzamiento.

**Relacionadas:** `MOV-011`, `MOV-014`.

---

## 3.14 Alcance horizontal
**ID:** `MOV-014`

\[
R=\frac{v_0^2\sin(2\theta)}{g}
\]

**Condiciones:** misma altura inicial y final, superficie horizontal y resistencia del aire despreciable.

**Relacionadas:** `MOV-013`, `MOV-007`.

---

## 3.15 Velocidad relativa
**ID:** `MOV-015`

\[
\vec v_{P/A}=\vec v_{P/B}+\vec v_{B/A}
\]

**Relacionadas:** `MOV-003`, `VEC-004`.

---

# 4. Leyes de Newton y fuerzas

## 4.1 Primera ley de Newton
**ID:** `NEW-001`

\[
\sum\vec F=0
\quad\Longrightarrow\quad
\vec a=0
\]

**Detalle:** un cuerpo permanece en reposo o con velocidad constante en un marco inercial si la fuerza neta es cero.

**Relacionadas:** `NEW-002`, `EQU-001`.

---

## 4.2 Segunda ley de Newton
**ID:** `NEW-002`

\[
\sum\vec F=m\vec a
\]

Por componentes:

\[
\sum F_x=ma_x,\qquad
\sum F_y=ma_y,\qquad
\sum F_z=ma_z
\]

**Relacionadas:** `VEC-004`, `NEW-001`, `CIR-008`.

---

## 4.3 Tercera ley de Newton
**ID:** `NEW-003`

\[
\vec F_{A\rightarrow B}=-\vec F_{B\rightarrow A}
\]

**Detalle:** las fuerzas de acción y reacción actúan sobre cuerpos distintos.

**Relacionadas:** `NEW-002`.

---

## 4.4 Peso
**ID:** `NEW-004`

\[
\vec F_g=m\vec g
\]

Magnitud:

\[
F_g=mg
\]

**Relacionadas:** `GRA-002`, `ENE-004`.

---

## 4.5 Fricción cinética
**ID:** `NEW-005`

\[
f_k=\mu_kN
\]

**Relacionadas:** `NEW-006`, `ENE-012`.

---

## 4.6 Fricción estática
**ID:** `NEW-006`

\[
0\le f_s\le\mu_sN
\]

Valor máximo:

\[
f_{s,\max}=\mu_sN
\]

**Relacionadas:** `NEW-005`.

---

## 4.7 Ley de Hooke
**ID:** `NEW-007`

\[
F_x=-kx
\]

**Detalle:** fuerza restauradora de un resorte ideal.

**Condición:** régimen elástico lineal.

**Relacionadas:** `ENE-005`, `OSC-004`.

---

## 4.8 Componentes del peso en un plano inclinado
**ID:** `NEW-008`

\[
F_{g,\parallel}=mg\sin\theta
\]

\[
F_{g,\perp}=mg\cos\theta
\]

Si no existen otras fuerzas perpendiculares:

\[
N=mg\cos\theta
\]

**Relacionadas:** `VEC-003`, `NEW-004`, `NEW-005`.

---

# 5. Movimiento circular

## 5.1 Desplazamiento angular
**ID:** `CIR-001`

\[
\Delta\theta=\theta_f-\theta_i
\]

**Relacionadas:** `CIR-002`.

---

## 5.2 Velocidad angular media
**ID:** `CIR-002`

\[
\omega_{\text{med}}=\frac{\Delta\theta}{\Delta t}
\]

**Relacionadas:** `CIR-003`, `ROT-002`.

---

## 5.3 Velocidad angular instantánea
**ID:** `CIR-003`

\[
\omega=\frac{d\theta}{dt}
\]

**Relacionadas:** `CIR-004`, `CIR-005`.

---

## 5.4 Relación velocidad lineal-angular
**ID:** `CIR-004`

\[
v=\omega r
\]

**Relacionadas:** `CIR-003`, `CIR-006`, `ROT-011`.

---

## 5.5 Frecuencia angular
**ID:** `CIR-005`

\[
\omega=2\pi f=\frac{2\pi}{T}
\]

**Relacionadas:** `OSC-002`, `OND-004`.

---

## 5.6 Aceleración centrípeta
**ID:** `CIR-006`

\[
a_c=\frac{v^2}{r}=\omega^2r
\]

También:

\[
a_c=\frac{4\pi^2r}{T^2}
\]

**Relacionadas:** `CIR-004`, `CIR-007`.

---

## 5.7 Fuerza centrípeta neta
**ID:** `CIR-007`

\[
F_c=ma_c=\frac{mv^2}{r}=m\omega^2r
\]

**Nota:** no es una fuerza nueva; representa la componente radial de la fuerza neta.

**Relacionadas:** `NEW-002`, `CIR-006`.

---

## 5.8 Aceleración tangencial
**ID:** `CIR-008`

\[
a_t=\alpha r
\]

**Relacionadas:** `ROT-001`, `CIR-004`.

---

# 6. Trabajo, energía y potencia

## 6.1 Trabajo de una fuerza constante
**ID:** `ENE-001`

\[
W=\vec F\cdot\vec d=Fd\cos\theta
\]

Caso paralelo:

\[
W=Fd
\]

**Relacionadas:** `VEC-005`, `ENE-002`, `ENE-003`.

---

## 6.2 Trabajo de una fuerza variable
**ID:** `ENE-002`

\[
W=\int_{\vec r_1}^{\vec r_2}\vec F\cdot d\vec r
\]

En una dimensión:

\[
W=\int_{x_1}^{x_2}F_x(x)\,dx
\]

**Relacionadas:** `ENE-001`, `ENE-003`, `ENE-008`.

---

## 6.3 Energía cinética
**ID:** `ENE-003`

\[
K=\frac12mv^2
\]

**Relacionadas:** `ENE-004`, `ENE-007`, `MOM-001`.

---

## 6.4 Energía potencial gravitacional cerca de la superficie
**ID:** `ENE-004`

\[
U_g=mgy
\]

Cambio:

\[
\Delta U_g=mg(y_f-y_i)
\]

**Condición:** \(g\) aproximadamente constante.

**Relacionadas:** `NEW-004`, `ENE-006`, `GRA-003`.

---

## 6.5 Energía potencial elástica
**ID:** `ENE-005`

\[
U_s=\frac12kx^2
\]

**Relacionadas:** `NEW-007`, `ENE-006`, `OSC-008`.

---

## 6.6 Trabajo de una fuerza conservativa
**ID:** `ENE-006`

\[
W_c=-\Delta U=U_i-U_f
\]

**Relacionadas:** `ENE-004`, `ENE-005`, `ENE-008`.

---

## 6.7 Teorema trabajo-energía
**ID:** `ENE-007`

\[
W_{\text{neto}}=\Delta K=K_f-K_i
\]

**Relacionadas:** `ENE-001`, `ENE-003`, `ENE-010`.

---

## 6.8 Fuerza desde energía potencial
**ID:** `ENE-008`

\[
F_x=-\frac{dU}{dx}
\]

En tres dimensiones:

\[
\vec F=-\nabla U
\]

**Relacionadas:** `ENE-002`, `ENE-006`.

---

## 6.9 Energía mecánica
**ID:** `ENE-009`

\[
E_{\text{mec}}=K+U
\]

**Relacionadas:** `ENE-010`, `ENE-011`.

---

## 6.10 Conservación de energía mecánica
**ID:** `ENE-010`

\[
K_i+U_i=K_f+U_f
\]

**Condición:** solo fuerzas conservativas realizan trabajo.

**Relacionadas:** `ENE-007`, `ENE-009`, `ENE-011`.

---

## 6.11 Energía con fuerzas no conservativas
**ID:** `ENE-011`

\[
K_i+U_i+W_{\text{nc}}=K_f+U_f
\]

Equivalentemente:

\[
\Delta E_{\text{mec}}=W_{\text{nc}}
\]

**Relacionadas:** `ENE-010`, `ENE-012`.

---

## 6.12 Trabajo de la fricción cinética
**ID:** `ENE-012`

\[
W_f=-f_kd
\]

Para movimiento en superficie plana con fricción constante:

\[
W_f=-\mu_kNd
\]

**Relacionadas:** `NEW-005`, `ENE-011`.

---

## 6.13 Potencia media
**ID:** `ENE-013`

\[
P_{\text{med}}=\frac{W}{\Delta t}
\]

**Relacionadas:** `ENE-014`.

---

## 6.14 Potencia instantánea
**ID:** `ENE-014`

\[
P=\frac{dW}{dt}=\vec F\cdot\vec v
\]

**Relacionadas:** `ENE-013`, `VEC-005`, `ELE-012`.

---

## 6.15 Rendimiento
**ID:** `ENE-015`

\[
\eta=\frac{E_{\text{útil}}}{E_{\text{entrada}}}
\]

o

\[
\eta=\frac{P_{\text{útil}}}{P_{\text{entrada}}}
\]

**Relacionadas:** `TER-019`.

---

# 7. Momento lineal, impulso y colisiones

## 7.1 Momento lineal
**ID:** `MOM-001`

\[
\vec p=m\vec v
\]

**Relacionadas:** `MOM-002`, `MOM-003`, `ENE-003`.

---

## 7.2 Segunda ley en forma de momento
**ID:** `MOM-002`

\[
\sum\vec F=\frac{d\vec p}{dt}
\]

Para masa constante:

\[
\sum\vec F=m\vec a
\]

**Relacionadas:** `NEW-002`, `MOM-001`, `MOM-003`.

---

## 7.3 Impulso
**ID:** `MOM-003`

\[
\vec J=\int_{t_i}^{t_f}\vec F\,dt
\]

Para fuerza constante:

\[
\vec J=\vec F\,\Delta t
\]

**Relacionadas:** `MOM-004`.

---

## 7.4 Teorema impulso-momento
**ID:** `MOM-004`

\[
\vec J=\Delta\vec p
=\vec p_f-\vec p_i
\]

**Relacionadas:** `MOM-001`, `MOM-003`.

---

## 7.5 Conservación del momento lineal
**ID:** `MOM-005`

\[
\sum\vec p_i=\sum\vec p_f
\]

**Condición:** impulso externo neto despreciable.

**Relacionadas:** `MOM-006`, `MOM-007`.

---

## 7.6 Colisión perfectamente inelástica 1D
**ID:** `MOM-006`

\[
m_1v_{1i}+m_2v_{2i}
=(m_1+m_2)v_f
\]

**Detalle:** los objetos quedan unidos después de la colisión.

**Relacionadas:** `MOM-005`, `MOM-007`.

---

## 7.7 Colisión elástica
**ID:** `MOM-007`

Se conserva el momento:

\[
m_1v_{1i}+m_2v_{2i}
=m_1v_{1f}+m_2v_{2f}
\]

y la energía cinética:

\[
\frac12m_1v_{1i}^2+\frac12m_2v_{2i}^2
=
\frac12m_1v_{1f}^2+\frac12m_2v_{2f}^2
\]

**Relacionadas:** `MOM-005`, `ENE-003`.

---

## 7.8 Centro de masa
**ID:** `MOM-008`

\[
\vec r_{\text{CM}}
=
\frac{\sum_i m_i\vec r_i}{\sum_i m_i}
\]

Para distribución continua:

\[
\vec r_{\text{CM}}=\frac{1}{M}\int\vec r\,dm
\]

**Relacionadas:** `MOM-009`, `ROT-011`.

---

## 7.9 Velocidad del centro de masa
**ID:** `MOM-009`

\[
\vec v_{\text{CM}}=
\frac{\sum_i m_i\vec v_i}{M}
=
\frac{\vec P_{\text{total}}}{M}
\]

**Relacionadas:** `MOM-005`, `MOM-008`.

---

# 8. Rotación

## 8.1 Aceleración angular
**ID:** `ROT-001`

\[
\alpha=\frac{d\omega}{dt}
\]

**Relacionadas:** `CIR-003`, `ROT-002`.

---

## 8.2 Velocidad angular con aceleración constante
**ID:** `ROT-002`

\[
\omega_f=\omega_0+\alpha t
\]

**Relacionadas:** `ROT-003`, `ROT-004`.

---

## 8.3 Posición angular con aceleración constante
**ID:** `ROT-003`

\[
\theta=\theta_0+\omega_0t+\frac12\alpha t^2
\]

**Relacionadas:** `ROT-002`, `ROT-004`.

---

## 8.4 Ecuación angular sin tiempo
**ID:** `ROT-004`

\[
\omega_f^2=\omega_0^2+2\alpha\Delta\theta
\]

**Relacionadas:** `ROT-002`, `ROT-003`.

---

## 8.5 Momento de inercia — partículas
**ID:** `ROT-005`

\[
I=\sum_i m_ir_i^2
\]

**Relacionadas:** `ROT-006`, `ROT-009`.

---

## 8.6 Momento de inercia — cuerpo continuo
**ID:** `ROT-006`

\[
I=\int r^2\,dm
\]

**Relacionadas:** `ROT-005`, `ROT-007`.

---

## 8.7 Teorema de ejes paralelos
**ID:** `ROT-007`

\[
I=I_{\text{CM}}+Md^2
\]

**Relacionadas:** `ROT-006`, `MOM-008`.

---

## 8.8 Torque
**ID:** `ROT-008`

\[
\vec\tau=\vec r\times\vec F
\]

Magnitud:

\[
\tau=rF\sin\theta
\]

**Relacionadas:** `VEC-006`, `ROT-009`, `EQU-002`.

---

## 8.9 Segunda ley de la rotación
**ID:** `ROT-009`

\[
\sum\tau=I\alpha
\]

**Relacionadas:** `ROT-001`, `ROT-005`, `ROT-008`.

---

## 8.10 Energía cinética de rotación
**ID:** `ROT-010`

\[
K_{\text{rot}}=\frac12I\omega^2
\]

**Relacionadas:** `ROT-005`, `ENE-003`, `ROT-011`.

---

## 8.11 Rodadura sin deslizamiento
**ID:** `ROT-011`

\[
v_{\text{CM}}=R\omega
\]

\[
a_{\text{CM}}=R\alpha
\]

Energía cinética total:

\[
K=\frac12Mv_{\text{CM}}^2+\frac12I_{\text{CM}}\omega^2
\]

**Relacionadas:** `CIR-004`, `ROT-010`.

---

## 8.12 Momento angular de una partícula
**ID:** `ROT-012`

\[
\vec L=\vec r\times\vec p
\]

**Relacionadas:** `VEC-006`, `MOM-001`, `ROT-013`.

---

## 8.13 Momento angular de un cuerpo rígido
**ID:** `ROT-013`

\[
L=I\omega
\]

**Relacionadas:** `ROT-005`, `ROT-012`, `ROT-014`.

---

## 8.14 Torque y momento angular
**ID:** `ROT-014`

\[
\sum\vec\tau_{\text{ext}}
=
\frac{d\vec L}{dt}
\]

**Relacionadas:** `ROT-008`, `ROT-013`, `ROT-015`.

---

## 8.15 Conservación del momento angular
**ID:** `ROT-015`

\[
\vec L_i=\vec L_f
\]

Para un cuerpo que cambia su momento de inercia:

\[
I_i\omega_i=I_f\omega_f
\]

**Condición:** torque externo neto cero.

**Relacionadas:** `ROT-013`, `ROT-014`.

---

# 9. Equilibrio y elasticidad

## 9.1 Primera condición de equilibrio
**ID:** `EQU-001`

\[
\sum\vec F=0
\]

**Relacionadas:** `NEW-001`, `EQU-002`.

---

## 9.2 Segunda condición de equilibrio
**ID:** `EQU-002`

\[
\sum\tau=0
\]

**Relacionadas:** `ROT-008`, `EQU-001`.

---

## 9.3 Esfuerzo normal
**ID:** `EQU-003`

\[
\sigma=\frac{F_\perp}{A}
\]

**Unidad:** Pa.

**Relacionadas:** `EQU-004`, `EQU-005`.

---

## 9.4 Deformación longitudinal
**ID:** `EQU-004`

\[
\varepsilon=\frac{\Delta L}{L_0}
\]

**Detalle:** adimensional.

**Relacionadas:** `EQU-003`, `EQU-005`.

---

## 9.5 Módulo de Young
**ID:** `EQU-005`

\[
Y=\frac{\sigma}{\varepsilon}
=
\frac{F_\perp L_0}{A\Delta L}
\]

**Condición:** régimen elástico lineal.

**Relacionadas:** `EQU-003`, `EQU-004`, `NEW-007`.

---

## 9.6 Esfuerzo cortante
**ID:** `EQU-006`

\[
\tau_{\text{cort}}=\frac{F_\parallel}{A}
\]

**Relacionadas:** `EQU-007`.

---

## 9.7 Módulo de corte
**ID:** `EQU-007`

\[
G_s=
\frac{F_\parallel/A}{\Delta x/h}
\]

**Relacionadas:** `EQU-006`.

---

## 9.8 Módulo volumétrico
**ID:** `EQU-008`

\[
B=-\frac{\Delta P}{\Delta V/V_0}
\]

**Relacionadas:** `FLU-002`, `TER-006`.

---

# 10. Gravitación

## 10.1 Ley de gravitación universal
**ID:** `GRA-001`

\[
F=G\frac{m_1m_2}{r^2}
\]

Forma vectorial:

\[
\vec F_{12}
=
-G\frac{m_1m_2}{r^2}\hat r
\]

**Relacionadas:** `GRA-002`, `GRA-003`.

---

## 10.2 Campo/aceleración gravitatoria
**ID:** `GRA-002`

\[
g=\frac{GM}{r^2}
\]

**Relacionadas:** `NEW-004`, `GRA-001`.

---

## 10.3 Energía potencial gravitatoria universal
**ID:** `GRA-003`

\[
U(r)=-G\frac{Mm}{r}
\]

**Relacionadas:** `ENE-004`, `GRA-001`, `GRA-006`.

---

## 10.4 Potencial gravitatorio
**ID:** `GRA-004`

\[
\Phi=-\frac{GM}{r}
\]

y

\[
U=m\Phi
\]

**Relacionadas:** `GRA-003`.

---

## 10.5 Velocidad orbital circular
**ID:** `GRA-005`

\[
v_{\text{orb}}=\sqrt{\frac{GM}{r}}
\]

**Relacionadas:** `CIR-007`, `GRA-006`.

---

## 10.6 Periodo orbital
**ID:** `GRA-006`

\[
T=2\pi\sqrt{\frac{r^3}{GM}}
\]

Equivalentemente:

\[
T^2=\frac{4\pi^2}{GM}r^3
\]

**Relacionadas:** `GRA-005`.

---

## 10.7 Velocidad de escape
**ID:** `GRA-007`

\[
v_{\text{esc}}=\sqrt{\frac{2GM}{R}}
\]

**Relacionadas:** `GRA-003`, `ENE-010`.

---

## 10.8 Energía total de una órbita circular
**ID:** `GRA-008`

\[
E=-\frac{GMm}{2r}
\]

**Relacionadas:** `GRA-003`, `GRA-005`.

---

# 11. Mecánica de fluidos

## 11.1 Densidad
**ID:** `FLU-001`

\[
\rho=\frac{m}{V}
\]

**Relacionadas:** `FLU-003`, `FLU-007`.

---

## 11.2 Presión
**ID:** `FLU-002`

\[
P=\frac{F_\perp}{A}
\]

**Unidad:** Pa = N/m².

**Relacionadas:** `FLU-003`, `FLU-004`.

---

## 11.3 Presión hidrostática
**ID:** `FLU-003`

\[
P=P_0+\rho gh
\]

**Relacionadas:** `FLU-001`, `FLU-002`, `FLU-004`.

---

## 11.4 Diferencia de presión en un fluido
**ID:** `FLU-004`

\[
P_2-P_1=\rho g(y_1-y_2)
\]

Equivalentemente:

\[
P+\rho gy=\text{constante}
\]

para un fluido estático homogéneo.

**Relacionadas:** `FLU-003`.

---

## 11.5 Principio de Pascal
**ID:** `FLU-005`

\[
\Delta P_1=\Delta P_2
\]

En una prensa hidráulica:

\[
\frac{F_1}{A_1}=\frac{F_2}{A_2}
\]

**Relacionadas:** `FLU-002`.

---

## 11.6 Fuerza de flotación — Arquímedes
**ID:** `FLU-006`

\[
F_B=\rho_{\text{fluido}}gV_{\text{desplazado}}
\]

**Relacionadas:** `FLU-001`, `NEW-004`.

---

## 11.7 Caudal volumétrico
**ID:** `FLU-007`

\[
Q=\frac{dV}{dt}=Av
\]

**Relacionadas:** `FLU-008`.

---

## 11.8 Ecuación de continuidad
**ID:** `FLU-008`

\[
A_1v_1=A_2v_2
\]

Forma general:

\[
\rho_1A_1v_1=\rho_2A_2v_2
\]

**Condición para la primera forma:** fluido incompresible.

**Relacionadas:** `FLU-007`, `FLU-009`.

---

## 11.9 Ecuación de Bernoulli
**ID:** `FLU-009`

\[
P+\frac12\rho v^2+\rho gy=\text{constante}
\]

Entre dos puntos:

\[
P_1+\frac12\rho v_1^2+\rho gy_1
=
P_2+\frac12\rho v_2^2+\rho gy_2
\]

**Condiciones:** flujo estacionario, incompresible, no viscoso y aplicado a lo largo de una línea de corriente.

**Relacionadas:** `FLU-008`, `FLU-010`.

---

## 11.10 Ley de Torricelli
**ID:** `FLU-010`

\[
v=\sqrt{2gh}
\]

**Detalle:** caso particular de Bernoulli para la rapidez de salida de un fluido ideal.

**Relacionadas:** `FLU-009`, `CIN-016`.

---

## 11.11 Flujo másico
**ID:** `FLU-011`

\[
\dot m=\rho Q=\rho Av
\]

**Relacionadas:** `FLU-001`, `FLU-007`.

---

# 12. Oscilaciones y movimiento periódico

## 12.1 Periodo y frecuencia
**ID:** `OSC-001`

\[
f=\frac1T,\qquad T=\frac1f
\]

**Relacionadas:** `OSC-002`, `OND-002`.

---

## 12.2 Frecuencia angular
**ID:** `OSC-002`

\[
\omega=2\pi f=\frac{2\pi}{T}
\]

**Relacionadas:** `OSC-001`, `CIR-005`.

---

## 12.3 Posición en MAS
**ID:** `OSC-003`

\[
x(t)=A\cos(\omega t+\phi)
\]

**Variables:** \(A\): amplitud; \(\phi\): fase inicial.

**Relacionadas:** `OSC-004`, `OSC-005`.

---

## 12.4 Aceleración en MAS
**ID:** `OSC-004`

\[
a=-\omega^2x
\]

Para masa-resorte:

\[
a=-\frac{k}{m}x
\]

**Relacionadas:** `NEW-007`, `OSC-006`.

---

## 12.5 Velocidad en MAS
**ID:** `OSC-005`

\[
v=-A\omega\sin(\omega t+\phi)
\]

También:

\[
v^2=\omega^2(A^2-x^2)
\]

**Relacionadas:** `OSC-003`, `OSC-006`, `OSC-007`.

---

## 12.6 MAS masa-resorte — frecuencia angular
**ID:** `OSC-006`

\[
\omega=\sqrt{\frac{k}{m}}
\]

**Relacionadas:** `NEW-007`, `OSC-007`.

---

## 12.7 MAS masa-resorte — periodo y frecuencia
**ID:** `OSC-007`

\[
T=2\pi\sqrt{\frac{m}{k}}
\]

\[
f=\frac1{2\pi}\sqrt{\frac{k}{m}}
\]

**Relacionadas:** `OSC-001`, `OSC-006`.

---

## 12.8 Energía total del MAS
**ID:** `OSC-008`

\[
E=\frac12mv^2+\frac12kx^2
=\frac12kA^2
\]

**Relacionadas:** `ENE-003`, `ENE-005`, `OSC-005`.

---

## 12.9 Velocidad máxima en MAS
**ID:** `OSC-009`

\[
v_{\max}=A\omega
\]

**Relacionadas:** `OSC-005`.

---

## 12.10 Aceleración máxima en MAS
**ID:** `OSC-010`

\[
a_{\max}=A\omega^2
\]

**Relacionadas:** `OSC-004`.

---

## 12.11 Péndulo simple — frecuencia angular
**ID:** `OSC-011`

\[
\omega=\sqrt{\frac{g}{L}}
\]

**Condición:** aproximación de ángulo pequeño, \(\sin\theta\approx\theta\).

**Relacionadas:** `OSC-012`.

---

## 12.12 Péndulo simple — periodo y frecuencia
**ID:** `OSC-012`

\[
T=2\pi\sqrt{\frac{L}{g}}
\]

\[
f=\frac1{2\pi}\sqrt{\frac{g}{L}}
\]

**Condición:** pequeñas oscilaciones.

**Relacionadas:** `OSC-011`, `OSC-001`.

---

## 12.13 Péndulo físico
**ID:** `OSC-013`

\[
\omega=\sqrt{\frac{mgd}{I}}
\]

\[
T=2\pi\sqrt{\frac{I}{mgd}}
\]

**Variables:** \(d\): distancia del pivote al centro de masa.

**Relacionadas:** `ROT-005`, `OSC-012`.

---

## 12.14 Oscilador torsional
**ID:** `OSC-014`

\[
\tau=-\kappa\theta
\]

\[
\omega=\sqrt{\frac{\kappa}{I}}
\]

\[
T=2\pi\sqrt{\frac{I}{\kappa}}
\]

**Nota:** se usa \(\kappa\) para la constante torsional, evitando confundirla con la constante \(k\) de un resorte lineal.

**Relacionadas:** `ROT-009`, `OSC-006`.

---

# 13. Ondas

## 13.1 Velocidad de propagación
**ID:** `OND-001`

\[
v=\lambda f
\]

**Relacionadas:** `OND-002`, `OND-003`, `OND-004`.

---

## 13.2 Periodo y frecuencia
**ID:** `OND-002`

\[
T=\frac1f
\]

**Relacionadas:** `OSC-001`, `OND-001`.

---

## 13.3 Número de onda
**ID:** `OND-003`

\[
k=\frac{2\pi}{\lambda}
\]

**Relacionadas:** `OND-004`, `OND-005`.

---

## 13.4 Frecuencia angular de una onda
**ID:** `OND-004`

\[
\omega=2\pi f
\]

Además:

\[
v=\frac{\omega}{k}
\]

**Relacionadas:** `OND-001`, `OND-003`.

---

## 13.5 Onda armónica viajera
**ID:** `OND-005`

Para propagación hacia \(+x\):

\[
y(x,t)=A\sin(kx-\omega t+\phi)
\]

Para propagación hacia \(-x\):

\[
y(x,t)=A\sin(kx+\omega t+\phi)
\]

**Relacionadas:** `OND-003`, `OND-004`.

---

## 13.6 Velocidad transversal en una cuerda
**ID:** `OND-006`

\[
v=\sqrt{\frac{F_T}{\mu}}
\]

donde:

\[
\mu=\frac{m}{L}
\]

**Relacionadas:** `OND-001`, `OND-007`.

---

## 13.7 Frecuencias de una cuerda fija en ambos extremos
**ID:** `OND-007`

\[
f_n=\frac{nv}{2L},
\qquad n=1,2,3,\ldots
\]

Longitudes permitidas:

\[
\lambda_n=\frac{2L}{n}
\]

**Relacionadas:** `OND-006`, `SON-007`.

---

## 13.8 Superposición
**ID:** `OND-008`

\[
y_{\text{total}}=\sum_i y_i
\]

**Relacionadas:** `OND-009`.

---

## 13.9 Interferencia de dos ondas
**ID:** `OND-009`

Constructiva:

\[
\Delta r=m\lambda
\]

Destructiva:

\[
\Delta r=\left(m+\frac12\right)\lambda
\]

**Relacionadas:** `OND-008`.

---

## 13.10 Intensidad de una onda
**ID:** `OND-010`

\[
I=\frac{P}{A}
\]

Para una fuente puntual isotrópica:

\[
I=\frac{P}{4\pi r^2}
\]

**Relacionadas:** `ENE-013`, `SON-002`.

---

# 14. Sonido

## 14.1 Velocidad del sonido
**ID:** `SON-001`

\[
v=\lambda f
\]

**Relacionadas:** `OND-001`, `SON-006`.

---

## 14.2 Intensidad sonora
**ID:** `SON-002`

\[
I=\frac{P}{A}
\]

Para propagación esférica:

\[
I=\frac{P}{4\pi r^2}
\]

**Relacionadas:** `OND-010`, `SON-003`.

---

## 14.3 Nivel de intensidad sonora
**ID:** `SON-003`

\[
\beta=10\log_{10}\left(\frac{I}{I_0}\right)
\]

con:

\[
I_0=10^{-12}\,\text{W/m}^2
\]

**Unidad:** decibel (dB).

**Relacionadas:** `SON-002`.

---

## 14.4 Efecto Doppler — forma general
**ID:** `SON-004`

\[
f'=f\frac{v\pm v_o}{v\mp v_s}
\]

**Convención:** el signo del numerador se elige según el movimiento del observador hacia/desde la fuente; el del denominador según el movimiento de la fuente hacia/desde el observador.

**Relacionadas:** `SON-001`.

---

## 14.5 Batidos
**ID:** `SON-005`

\[
f_{\text{bat}}=|f_1-f_2|
\]

**Relacionadas:** `OND-008`.

---

## 14.6 Tubo abierto en ambos extremos
**ID:** `SON-006`

\[
f_n=\frac{nv}{2L},
\qquad n=1,2,3,\ldots
\]

**Relacionadas:** `OND-007`, `SON-007`.

---

## 14.7 Tubo cerrado en un extremo
**ID:** `SON-007`

\[
f_n=\frac{nv}{4L},
\qquad n=1,3,5,\ldots
\]

**Relacionadas:** `SON-006`.

---

# 15. Termodinámica

## 15.1 Conversión Celsius-Kelvin
**ID:** `TER-001`

\[
T_K=T_C+273.15
\]

**Relacionadas:** `TER-002`.

---

## 15.2 Conversión Celsius-Fahrenheit
**ID:** `TER-002`

\[
T_F=\frac95T_C+32
\]

Inversa:

\[
T_C=\frac59(T_F-32)
\]

**Relacionadas:** `TER-001`.

---

## 15.3 Dilatación lineal
**ID:** `TER-003`

\[
\Delta L=\alpha L_0\Delta T
\]

**Relacionadas:** `TER-004`, `TER-005`.

---

## 15.4 Dilatación superficial
**ID:** `TER-004`

\[
\Delta A\approx2\alpha A_0\Delta T
\]

**Condición:** sólido isotrópico y cambios de temperatura moderados.

**Relacionadas:** `TER-003`, `TER-005`.

---

## 15.5 Dilatación volumétrica
**ID:** `TER-005`

\[
\Delta V=\beta V_0\Delta T
\]

Para sólidos isotrópicos:

\[
\beta\approx3\alpha
\]

**Relacionadas:** `TER-003`, `TER-004`.

---

## 15.6 Calor sensible
**ID:** `TER-006`

\[
Q=mc\Delta T
\]

**Relacionadas:** `TER-007`, `TER-008`.

---

## 15.7 Capacidad calorífica
**ID:** `TER-007`

\[
C=\frac{Q}{\Delta T}
\]

y

\[
C=mc
\]

**Relacionadas:** `TER-006`.

---

## 15.8 Calor latente
**ID:** `TER-008`

\[
Q=mL
\]

**Detalle:** se aplica durante un cambio de fase a temperatura aproximadamente constante.

**Relacionadas:** `TER-006`, `TER-009`.

---

## 15.9 Calorimetría
**ID:** `TER-009`

En un sistema térmicamente aislado:

\[
\sum_i Q_i=0
\]

**Relacionadas:** `TER-006`, `TER-008`.

---

## 15.10 Ecuación de gas ideal
**ID:** `TER-010`

\[
PV=nRT
\]

También:

\[
PV=Nk_BT
\]

**Relacionadas:** `TER-011`, `TER-012`.

---

## 15.11 Ley combinada de los gases
**ID:** `TER-011`

Para cantidad fija de gas ideal:

\[
\frac{P_1V_1}{T_1}
=
\frac{P_2V_2}{T_2}
\]

**Relacionadas:** `TER-010`.

---

## 15.12 Energía cinética molecular media
**ID:** `TER-012`

\[
\langle K\rangle=\frac32k_BT
\]

**Condición:** gas ideal monoatómico.

**Relacionadas:** `TER-010`, `TER-014`.

---

## 15.13 Rapidez cuadrática media
**ID:** `TER-013`

\[
v_{\text{rms}}=\sqrt{\frac{3RT}{M}}
\]

Equivalentemente:

\[
v_{\text{rms}}=\sqrt{\frac{3k_BT}{m}}
\]

**Relacionadas:** `TER-012`.

---

## 15.14 Energía interna de un gas ideal monoatómico
**ID:** `TER-014`

\[
U=\frac32nRT
\]

Cambio:

\[
\Delta U=\frac32nR\Delta T
\]

**Relacionadas:** `TER-010`, `TER-015`.

---

## 15.15 Trabajo termodinámico
**ID:** `TER-015`

\[
W=\int_{V_i}^{V_f}P\,dV
\]

Para presión constante:

\[
W=P(V_f-V_i)
\]

**Convención:** \(W>0\) cuando el gas realiza trabajo sobre el entorno.

**Relacionadas:** `TER-016`, `ENE-002`.

---

## 15.16 Primera ley de la termodinámica
**ID:** `TER-016`

\[
\Delta U=Q-W
\]

**Convención:** \(Q>0\) entra al sistema y \(W>0\) es trabajo realizado por el sistema.

**Relacionadas:** `TER-014`, `TER-015`, `TER-017`.

---

## 15.17 Proceso isotérmico de gas ideal
**ID:** `TER-017`

\[
PV=\text{constante}
\]

Trabajo:

\[
W=nRT\ln\left(\frac{V_f}{V_i}\right)
\]

Para gas ideal:

\[
\Delta U=0,\qquad Q=W
\]

**Relacionadas:** `TER-010`, `TER-016`.

---

## 15.18 Proceso adiabático de gas ideal
**ID:** `TER-018`

\[
PV^\gamma=\text{constante}
\]

También:

\[
TV^{\gamma-1}=\text{constante}
\]

con

\[
\gamma=\frac{C_P}{C_V}
\]

**Relacionadas:** `TER-016`, `TER-017`.

---

## 15.19 Eficiencia de una máquina térmica
**ID:** `TER-019`

\[
\eta=\frac{W}{Q_H}
=
1-\frac{Q_C}{Q_H}
\]

**Relacionadas:** `ENE-015`, `TER-020`.

---

## 15.20 Eficiencia de Carnot
**ID:** `TER-020`

\[
\eta_C=1-\frac{T_C}{T_H}
\]

**Condición:** temperaturas absolutas en kelvin.

**Relacionadas:** `TER-019`.

---

## 15.21 Conducción térmica
**ID:** `TER-021`

\[
\frac{Q}{t}
=
kA\frac{T_H-T_C}{L}
\]

**Relacionadas:** `TER-022`.

---

## 15.22 Radiación térmica — Stefan-Boltzmann
**ID:** `TER-022`

\[
P=e\sigma A T^4
\]

Potencia neta respecto del entorno:

\[
P_{\text{net}}
=
e\sigma A(T^4-T_{\text{amb}}^4)
\]

**Relacionadas:** `TER-021`.

---

# 16. Electricidad básica

> Esta sección contiene electricidad fundamental de Física General. Los circuitos avanzados, RC/RL/RLC, corriente alterna, semiconductores, diodos, transistores, amplificadores y electrónica analógica/digital pueden reservarse para la app de **Física Electrónica**.

## 16.1 Cuantización de la carga
**ID:** `ELE-001`

\[
q=ne
\]

**Variables:** \(n\in\mathbb Z\); \(e\): carga elemental.

**Relacionadas:** `ELE-002`.

---

## 16.2 Ley de Coulomb
**ID:** `ELE-002`

\[
F=k_e\frac{|q_1q_2|}{r^2}
\]

con:

\[
k_e=\frac{1}{4\pi\varepsilon_0}
\]

**Relacionadas:** `ELE-003`, `GRA-001`.

---

## 16.3 Campo eléctrico
**ID:** `ELE-003`

\[
\vec E=\frac{\vec F}{q}
\]

Para una carga puntual:

\[
E=k_e\frac{|Q|}{r^2}
\]

**Relacionadas:** `ELE-002`, `ELE-004`, `ELE-005`.

---

## 16.4 Fuerza eléctrica
**ID:** `ELE-004`

\[
\vec F=q\vec E
\]

**Relacionadas:** `ELE-003`.

---

## 16.5 Potencial eléctrico
**ID:** `ELE-005`

\[
V=\frac{U}{q}
\]

Para una carga puntual:

\[
V=k_e\frac{Q}{r}
\]

**Relacionadas:** `ELE-006`, `ELE-003`.

---

## 16.6 Energía potencial eléctrica
**ID:** `ELE-006`

\[
U=qV
\]

Para dos cargas puntuales:

\[
U=k_e\frac{q_1q_2}{r}
\]

**Relacionadas:** `ELE-005`, `ENE-009`.

---

## 16.7 Diferencia de potencial y campo uniforme
**ID:** `ELE-007`

\[
\Delta V=-\int_A^B\vec E\cdot d\vec l
\]

En un campo uniforme paralelo al desplazamiento:

\[
|\Delta V|=Ed
\]

**Relacionadas:** `ELE-003`, `ELE-005`.

---

## 16.8 Corriente eléctrica
**ID:** `ELE-008`

\[
I=\frac{\Delta Q}{\Delta t}
\]

Instantánea:

\[
I=\frac{dQ}{dt}
\]

**Relacionadas:** `ELE-009`, `ELE-010`.

---

## 16.9 Ley de Ohm
**ID:** `ELE-009`

\[
V=IR
\]

**Condición:** elemento óhmico en el régimen considerado.

**Relacionadas:** `ELE-008`, `ELE-010`, `ELE-012`.

---

## 16.10 Resistencia de un conductor uniforme
**ID:** `ELE-010`

\[
R=\rho\frac{L}{A}
\]

**Variables:** \(\rho\): resistividad eléctrica.

**Relacionadas:** `ELE-009`, `ELE-011`.

---

## 16.11 Dependencia de la resistencia con la temperatura
**ID:** `ELE-011`

\[
R=R_0[1+\alpha(T-T_0)]
\]

**Condición:** aproximación lineal en el intervalo de temperatura considerado.

**Relacionadas:** `ELE-010`.

---

## 16.12 Potencia eléctrica
**ID:** `ELE-012`

\[
P=VI
\]

Usando la ley de Ohm:

\[
P=I^2R=\frac{V^2}{R}
\]

**Relacionadas:** `ELE-009`, `ENE-014`, `ELE-013`.

---

## 16.13 Energía eléctrica
**ID:** `ELE-013`

Para potencia constante:

\[
E=Pt=VIt
\]

**Relacionadas:** `ELE-012`, `ENE-009`.

---

## 16.14 Resistencias en serie
**ID:** `ELE-014`

\[
R_{\text{eq}}=\sum_iR_i
\]

**Relacionadas:** `ELE-015`, `ELE-009`.

---

## 16.15 Resistencias en paralelo
**ID:** `ELE-015`

\[
\frac1{R_{\text{eq}}}
=
\sum_i\frac1{R_i}
\]

Para dos resistencias:

\[
R_{\text{eq}}=\frac{R_1R_2}{R_1+R_2}
\]

**Relacionadas:** `ELE-014`, `ELE-009`.

---

## 16.16 Primera ley de Kirchhoff
**ID:** `ELE-016`

\[
\sum I_{\text{entra}}=\sum I_{\text{sale}}
\]

Equivalentemente:

\[
\sum I=0
\]

en un nodo usando signos algebraicos.

**Relacionadas:** `ELE-008`, `ELE-017`.

---

## 16.17 Segunda ley de Kirchhoff
**ID:** `ELE-017`

\[
\sum\Delta V=0
\]

al recorrer una malla cerrada.

**Relacionadas:** `ELE-005`, `ELE-009`, `ELE-016`.

---

## 16.18 Capacitancia — concepto básico
**ID:** `ELE-018`

\[
C=\frac{Q}{V}
\]

**Detalle:** se incluye como concepto de Física General; el análisis detallado de circuitos capacitivos puede trasladarse a Física Electrónica.

**Relacionadas:** `ELE-019`, `ELE-005`.

---

## 16.19 Capacitor de placas paralelas
**ID:** `ELE-019`

\[
C=\varepsilon_0\frac{A}{d}
\]

Con dieléctrico:

\[
C=\kappa\varepsilon_0\frac{A}{d}
\]

**Relacionadas:** `ELE-018`, `ELE-020`.

---

## 16.20 Energía almacenada en un capacitor
**ID:** `ELE-020`

\[
U_C=\frac12CV^2
=\frac{Q^2}{2C}
=\frac12QV
\]

**Relacionadas:** `ELE-018`, `ELE-019`, `ENE-009`.

---

# 17. Constantes físicas

| Constante | Símbolo | Valor aproximado | Unidad |
|---|---:|---:|---|
| Aceleración gravitatoria estándar | \(g_0\) | \(9.80665\) | m/s² |
| Constante de gravitación universal | \(G\) | \(6.67430\times10^{-11}\) | N·m²/kg² |
| Velocidad de la luz | \(c\) | \(2.99792458\times10^8\) | m/s |
| Carga elemental | \(e\) | \(1.602176634\times10^{-19}\) | C |
| Permitividad del vacío | \(\varepsilon_0\) | \(\approx8.854\times10^{-12}\) | F/m |
| Constante de Coulomb | \(k_e\) | \(\approx8.988\times10^9\) | N·m²/C² |
| Constante de Boltzmann | \(k_B\) | \(1.380649\times10^{-23}\) | J/K |
| Constante universal de los gases | \(R\) | \(8.314462618...\) | J/(mol·K) |
| Constante de Stefan-Boltzmann | \(\sigma\) | \(\approx5.6704\times10^{-8}\) | W/(m²·K⁴) |

---

# 18. Resumen de relaciones

Esta sección puede utilizarse para construir la pantalla **Relacionadas** de la app.

## Cinemática

```text
CIN-001 Desplazamiento
 ├─ CIN-002 Velocidad media
 ├─ CIN-009 MRUA — posición
 └─ CIN-010 Torricelli

CIN-004 Velocidad instantánea
 ├─ CIN-006 Aceleración instantánea
 ├─ CIN-012 Velocidad desde aceleración
 └─ CIN-013 Posición desde velocidad
```

## Proyectiles

```text
MOV-006 Componentes de v₀
 ├─ MOV-007 Posición horizontal
 ├─ MOV-008 Posición vertical
 ├─ MOV-009 Velocidad vertical
 ├─ MOV-011 Tiempo hasta altura máxima
 ├─ MOV-012 Altura máxima
 ├─ MOV-013 Tiempo de vuelo
 └─ MOV-014 Alcance
```

## Newton → energía → momento

```text
NEW-002 Segunda ley
 ├─ CIR-007 Fuerza centrípeta
 ├─ MOM-002 F = dp/dt
 └─ ROT-009 τ = Iα

ENE-001 Trabajo
 ├─ ENE-007 Teorema trabajo-energía
 ├─ ENE-013 Potencia media
 └─ ENE-014 Potencia instantánea

MOM-001 Momento lineal
 ├─ MOM-004 Impulso-momento
 ├─ MOM-005 Conservación del momento
 ├─ MOM-006 Colisión inelástica
 └─ MOM-007 Colisión elástica
```

## Rotación

```text
CIR-003 ω
 ├─ CIR-004 v = ωr
 ├─ ROT-002 Cinemática angular
 └─ ROT-013 L = Iω

ROT-008 Torque
 ├─ ROT-009 τ = Iα
 ├─ EQU-002 Equilibrio rotacional
 └─ ROT-014 τ = dL/dt
```

## Energía y oscilaciones

```text
NEW-007 Ley de Hooke
 ├─ ENE-005 Energía elástica
 ├─ OSC-004 Aceleración MAS
 ├─ OSC-006 ω = √(k/m)
 └─ OSC-008 Energía del MAS
```

## Fluidos

```text
FLU-002 Presión
 ├─ FLU-003 Presión hidrostática
 ├─ FLU-005 Pascal
 └─ FLU-009 Bernoulli

FLU-007 Caudal
 ├─ FLU-008 Continuidad
 ├─ FLU-009 Bernoulli
 └─ FLU-010 Torricelli
```

## Ondas y sonido

```text
OND-001 v = λf
 ├─ OND-003 Número de onda
 ├─ OND-004 Frecuencia angular
 ├─ OND-005 Onda viajera
 └─ SON-001 Velocidad del sonido

OND-008 Superposición
 ├─ OND-009 Interferencia
 └─ SON-005 Batidos
```

## Termodinámica

```text
TER-006 Q = mcΔT
 ├─ TER-008 Calor latente
 └─ TER-009 Calorimetría

TER-010 PV = nRT
 ├─ TER-011 Ley combinada
 ├─ TER-014 Energía interna
 ├─ TER-017 Isotérmico
 └─ TER-018 Adiabático

TER-016 Primera ley
 ├─ TER-015 Trabajo P-V
 ├─ TER-017 Isotérmico
 ├─ TER-018 Adiabático
 └─ TER-019 Máquina térmica
```

## Electricidad

```text
ELE-002 Coulomb
 ├─ ELE-003 Campo eléctrico
 ├─ ELE-004 Fuerza eléctrica
 └─ ELE-005 Potencial eléctrico

ELE-008 Corriente
 ├─ ELE-009 Ley de Ohm
 ├─ ELE-012 Potencia eléctrica
 ├─ ELE-016 Kirchhoff — nodos
 └─ ELE-017 Kirchhoff — mallas

ELE-018 Capacitancia
 ├─ ELE-019 Placas paralelas
 └─ ELE-020 Energía del capacitor
```

---

# Modelo recomendado para implementar cada fórmula en la app

Cada fórmula puede mapearse a una estructura equivalente a:

```text
id
category
subcategory
name
formula_latex
short_description
detail
variables[]
conditions[]
units[]
related_formula_ids[]
```

Ejemplo conceptual:

```text
id: MOV-014
category: Movimiento 2D y 3D
subcategory: Proyectiles
name: Alcance horizontal
formula_latex: R=\frac{v_0^2\sin(2\theta)}{g}
short_description: Alcance de un proyectil que regresa a su altura inicial.
conditions:
  - sin resistencia del aire
  - gravedad constante
  - misma altura inicial y final
related_formula_ids:
  - MOV-006
  - MOV-007
  - MOV-013
```

Esto permite que la pantalla de detalle muestre:

1. **Fórmula principal**
2. **Qué calcula**
3. **Significado de cada variable**
4. **Unidades SI**
5. **Condiciones de validez**
6. **Casos especiales**
7. **Fórmulas relacionadas**
8. **Navegación directa hacia cada fórmula relacionada**

---

# Frontera con la app de Física Electrónica

Para evitar duplicación excesiva, **Física Básica** termina aproximadamente en:

- electrostática;
- potencial eléctrico;
- corriente;
- ley de Ohm;
- resistencia;
- potencia;
- asociaciones simples de resistencias;
- leyes de Kirchhoff;
- capacitancia como concepto básico.

La app de **Física Electrónica** puede comenzar y profundizar en:

- divisores de tensión y corriente;
- circuitos RC, RL y RLC;
- transitorios;
- corriente alterna;
- fasores e impedancia;
- resonancia;
- filtros;
- inductores y transformadores;
- semiconductores;
- diodos;
- transistores BJT/FET;
- amplificadores;
- amplificadores operacionales;
- electrónica digital y lógica, si entra en el alcance elegido.

---

# Fuentes de referencia para validación

El catálogo se ha estructurado de acuerdo con el contenido estándar de Física General universitaria y puede contrastarse con:

- OpenStax — *University Physics Volume 1*: mecánica, rotación, gravitación, fluidos, oscilaciones y ondas.
- OpenStax — *University Physics Volume 2*: termodinámica, electrostática, potencial, corriente, resistencia y capacitancia.
- Valores de constantes fundamentales: SI/CODATA, usando valores exactos cuando el SI moderno los define exactamente.


# Contenido canónico

| Archivo                       | Materia (`subject`) | Descripción                                      |
| ----------------------------- | ------------------- | ------------------------------------------------ |
| `formulas-calculo-ii.md`      | `calculo-ii`        | Fórmulas de Cálculo II                           |
| `formulas-fisica-basica.md`   | `fisica-basica`     | Fórmulas de Física Básica universitaria (~195)   |
| `formulas-algebra.md`         | `algebra`           | Álgebra para Ingeniería y CS (~183) + viz specs  |

El archivo raíz `FORMULAS_ALGEBRA_INGENIERIA_CS_V3.md` es la fuente de referencia; la copia canónica para seed es `content/formulas-algebra.md`.

## Física Básica — capítulos → slugs

| #  | Capítulo                              | Slug                         |
| -- | ------------------------------------- | ---------------------------- |
| 1  | Vectores                              | `vectores`                   |
| 2  | Cinemática 1D                         | `cinematica-1d`              |
| 3  | Movimiento 2D y 3D                    | `movimiento-2d-3d`           |
| 4  | Leyes de Newton y fuerzas             | `leyes-de-newton`            |
| 5  | Movimiento circular                   | `movimiento-circular`        |
| 6  | Trabajo, energía y potencia           | `trabajo-energia-potencia`   |
| 7  | Momento lineal, impulso y colisiones  | `momento-impulso-colisiones` |
| 8  | Rotación                              | `rotacion`                   |
| 9  | Equilibrio y elasticidad              | `equilibrio-elasticidad`     |
| 10 | Gravitación                           | `gravitacion`                |
| 11 | Mecánica de fluidos                   | `mecanica-de-fluidos`        |
| 12 | Oscilaciones y movimiento periódico   | `oscilaciones`               |
| 13 | Ondas                                 | `ondas`                      |
| 14 | Sonido                                | `sonido`                     |
| 15 | Termodinámica                         | `termodinamica`              |
| 16 | Electricidad básica                   | `electricidad-basica`        |
| 17 | Constantes físicas                    | `constantes-fisicas`         |
| 18 | Guía para enfocar un problema         | `guia-enfoque`               |

Secciones del MD que **no** se importan como catálogo: Índice, Notación general, Resumen de relaciones (el grafo sale de `**Relacionadas:**`), Modelo recomendado, Frontera con Física Electrónica, Fuentes.

## Álgebra — capítulos → slugs

Caps. 1–28: fórmulas. Cap. 29: mapas de relaciones. Cap. 30 (fronteras con otras materias) es una nota editorial para el catálogo y **no se publica**. Sin `/guia`.

| #  | Capítulo                                | Slug                         |
| -- | --------------------------------------- | ---------------------------- |
| 1  | Números y propiedades algebraicas       | `numeros-propiedades`        |
| 2  | Potencias, exponentes y radicales       | `potencias-radicales`        |
| 3  | Expresiones algebraicas                 | `expresiones-algebraicas`    |
| 4  | Productos notables e identidades        | `productos-notables`         |
| 5  | Factorización                           | `factorizacion`              |
| 6  | Expresiones racionales                  | `expresiones-racionales`     |
| 7  | Ecuaciones                              | `ecuaciones`                 |
| 8  | Inecuaciones                            | `inecuaciones`               |
| 9  | Sistemas de ecuaciones                  | `sistemas-ecuaciones`        |
| 10 | Funciones                               | `funciones`                  |
| 11 | Polinomios                              | `polinomios`                 |
| 12 | Exponenciales y logaritmos              | `exponenciales-logaritmos`   |
| 13 | Números complejos                       | `numeros-complejos`          |
| 14 | Sucesiones, series finitas              | `sucesiones-series-finitas`  |
| 15 | Vectores                                | `vectores-algebra`           |
| 16 | Matrices                                | `matrices`                   |
| 17 | Determinantes e inversas                | `determinantes-inversas`     |
| 18 | Espacios vectoriales                    | `espacios-vectoriales`       |
| 19 | Transformaciones lineales               | `transformaciones-lineales`  |
| 20 | Valores propios y diagonalización       | `valores-propios`            |
| 21 | Ortogonalidad y proyecciones            | `ortogonalidad-proyecciones` |
| 22 | Mínimos cuadrados                       | `minimos-cuadrados`          |
| 23 | Descomposiciones de matrices            | `descomposiciones-matrices`  |
| 24 | Normas matriciales y condicionamiento   | `normas-condicionamiento`    |
| 25 | Álgebra booleana                        | `algebra-booleana`           |
| 26 | Aritmética modular                      | `aritmetica-modular`         |
| 27 | Estructuras algebraicas                 | `estructuras-algebraicas`    |
| 28 | Códigos lineales                        | `codigos-lineales`           |
| 29 | Mapas de relaciones                     | `mapas-relaciones`           |
| 30 | Fronteras con otras materias            | *(nota editorial, no se publica)* |

## Importación a Postgres

```bash
pnpm db:seed
```

El seed importa las tres materias. Para una sola:

```bash
pnpm --filter @repo/api db:seed -- content/formulas-algebra.md
```

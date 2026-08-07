# Contenido canónico

| Archivo                       | Materia (`subject`) | Descripción                                      |
| ----------------------------- | ------------------- | ------------------------------------------------ |
| `formulas-calculo-ii.md`      | `calculo-ii`        | Fórmulas de Cálculo II                           |
| `formulas-fisica-basica.md`   | `fisica-basica`     | Fórmulas de Física Básica universitaria (~195)   |

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

Secciones del MD que **no** se importan como catálogo: Índice, Notación general, Resumen de relaciones (el grafo sale de `**Relacionadas:**`), Modelo recomendado, Frontera con Física Electrónica, Fuentes.

## Importación a Postgres

```bash
pnpm db:seed
```

El seed importa ambas materias. Para una sola:

```bash
pnpm --filter @repo/api db:seed -- content/formulas-fisica-basica.md
```

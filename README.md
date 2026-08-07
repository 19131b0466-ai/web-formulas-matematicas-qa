# web-formulas-matematicas

Plataforma web multi-materia — **Formulario universitario** (Cálculo II + Física Básica).

## Monorepo

| App               | Puerto local | Descripción                      |
| ----------------- | ------------ | -------------------------------- |
| `apps/web-public` | 3000         | Sitio público (Vercel #1)        |
| `apps/web-admin`  | 3002         | Dashboard superadmin (Vercel #2) |
| `apps/api`        | 3001         | Backend API Hono (Vercel #3)     |

## Requisitos

- Node.js ≥ 22
- pnpm 9
- Docker (PostgreSQL local)

## Inicio rápido

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env

# 3. Base de datos local
docker compose up -d

# 4. Migraciones + seed de ambas materias
pnpm db:migrate
pnpm db:seed

# 5. Levantar los 3 servicios
pnpm dev
```

Servicios disponibles:

- Web pública: http://localhost:3000
- API health: http://localhost:3001/v1/health
- Admin: http://localhost:3002 (credenciales en `.env`: `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Scripts

| Comando            | Descripción                             |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | Desarrollo (turbo — 3 apps en paralelo) |
| `pnpm build`       | Build de producción                     |
| `pnpm lint`        | ESLint en todo el monorepo              |
| `pnpm typecheck`   | Verificación TypeScript                 |
| `pnpm format`      | Prettier write                          |
| `pnpm db:generate` | Generar migraciones Drizzle             |
| `pnpm db:migrate`  | Aplicar migraciones Drizzle             |
| `pnpm db:studio`   | Drizzle Studio                          |
| `pnpm db:seed`     | Importar fórmulas MD → Postgres         |
| `pnpm test`        | Tests unitarios + integración API       |

## Despliegue (producción)

Guía completa: **[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)**

Resumen:

1. Supabase con pooler **transaction mode** (`:6543`) + migración SQL + `pnpm db:seed`
2. Tres proyectos Vercel (`apps/api`, `apps/web-public`, `apps/web-admin`)
3. Variables por proyecto (`DATABASE_URL`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`, `CRON_SECRET`, …)
4. Dominios custom → HTTPS automático en Vercel
5. Lighthouse + checklist móvil

## Estructura

Ver [`PLAN_DESARROLLO.md`](./PLAN_DESARROLLO.md) para arquitectura, fases y criterios de aceptación.

## Materias

| Slug            | Contenido                                      |
| --------------- | ---------------------------------------------- |
| `calculo-ii`    | `content/formulas-calculo-ii.md`               |
| `fisica-basica` | `content/formulas-fisica-basica.md` (~195 IDs) |

Rutas públicas: `/`, `/calculo-ii/...`, `/fisica-basica/seccion/...`, `/fisica-basica/formula/VEC-001`.

## Fase actual

Multi-materia operativo en código (hub + Física con catálogo/detalle/relaciones). Despliegue cloud: `docs/DEPLOYMENT.md`.

# Despliegue a producción

Guía para levantar los **3 proyectos Vercel** + **Supabase Postgres** (pooler transaction mode), dominios custom e HTTPS.

## Arquitectura

| Proyecto Vercel | Root Directory   | URL típica                         |
| --------------- | ---------------- | ---------------------------------- |
| API (Hono)      | `apps/api`       | `https://api.tudominio.com`        |
| Web pública     | `apps/web-public`| `https://tudominio.com`            |
| Web admin       | `apps/web-admin` | `https://admin.tudominio.com`      |

Cada proyecto tiene su propio `vercel.json` con `installCommand` / `buildCommand` apuntando al monorepo (`pnpm`).

---

## 1. Supabase (producción)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Abre **SQL Editor** y ejecuta el contenido de:
   - [`supabase/migrations/20260730120000_initial_schema.sql`](../supabase/migrations/20260730120000_initial_schema.sql)
   - [`supabase/migrations/20260807130000_subjects_multi.sql`](../supabase/migrations/20260807130000_subjects_multi.sql)
3. En **Project Settings → Database → Connection string**:
   - Usa el **pooler** en modo **Transaction**.
   - Puerto **`6543`** (no el directo `5432`).
   - Formato típico:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
4. Copia esa URL como `DATABASE_URL` (solo en el proyecto Vercel de la API).
5. (Opcional Auth) En **Authentication**, crea un usuario admin. Necesitarás:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_JWT_SECRET` (Settings → API → JWT Secret)

### Seed de contenido

Desde tu máquina (con `DATABASE_URL` apuntando al pooler o a la conexión directa session mode):

```bash
# En la raíz del monorepo
cp .env.example .env
# Edita DATABASE_URL con la connection string de Supabase
pnpm db:seed
```

El seed importa **ambas** materias (`calculo-ii` y `fisica-basica`) y es idempotente por materia: puedes re-ejecutarlo tras actualizar `content/formulas-calculo-ii.md` o `content/formulas-fisica-basica.md`.

```bash
# Solo una materia (opcional)
pnpm --filter @repo/api exec tsx src/seed/import-markdown.ts ../../content/formulas-fisica-basica.md
```

**Importante — analytics:** el seed **solo** borra `sections` / `content_blocks` de la materia importada. **Nunca** toca `visit_logs` ni `admin_users`. No ejecutes `TRUNCATE`/`DROP` sobre `visit_logs` al redeployar contenido.

Si migraste a multi-materia y quieres etiquetar visitas antiguas:

```bash
pnpm --filter @repo/api exec tsx src/scripts/backfill-visit-subjects.ts
```

> **Nota:** el cliente Drizzle usa `prepare: false` y `max: 1`, requerido por el pooler en transaction mode bajo serverless.

---

## 2. Crear los 3 proyectos en Vercel

Requisitos: cuenta Vercel + repo en GitHub/GitLab.

### Opción A — Dashboard

Para **cada** app (`api`, `web-public`, `web-admin`):

1. **Add New Project** → importa este monorepo.
2. **Root Directory** → `apps/api` | `apps/web-public` | `apps/web-admin`.
3. Framework:
   - Next.js en frontends (detectado).
   - Other / sin framework en API.
4. Confirma que se lean `installCommand` y `buildCommand` del `vercel.json` de cada app.
5. Añade las variables de entorno (sección siguiente) **antes** del primer deploy.
6. Deploy.

### Opción B — CLI

```bash
npm i -g vercel
# o: npx vercel

# Desde la raíz, enlaza cada app (3 veces):
cd apps/api && vercel link && vercel env pull && vercel --prod
cd ../web-public && vercel link && vercel --prod
cd ../web-admin && vercel link && vercel --prod
```

---

## 3. Variables de entorno por proyecto

### API (`apps/api`)

| Variable            | Requerido | Descripción                                              |
| ------------------- | --------- | -------------------------------------------------------- |
| `DATABASE_URL`      | sí        | Pooler Supabase transaction mode (`:6543`)               |
| `CORS_ORIGINS`      | sí        | Orígenes de public + admin, separados por coma           |
| `JWT_SECRET`        | sí\*      | Firma JWT local si no usas Supabase Auth                 |
| `ADMIN_EMAIL`       | sí\*      | Login admin (modo local credentials)                     |
| `ADMIN_PASSWORD`    | sí\*      | Login admin (modo local credentials)                     |
| `CRON_SECRET`       | sí        | Protege `/v1/cron/*`; Vercel Cron lo envía como Bearer   |
| `SUPABASE_URL`      | opcional  | Auth Supabase                                            |
| `SUPABASE_ANON_KEY` | opcional  | Auth Supabase                                            |
| `SUPABASE_JWT_SECRET` | opcional | Validación JWT Supabase                                |

\* Obligatorios si no configuras Supabase Auth.

Ejemplo `CORS_ORIGINS`:

```
https://tudominio.com,https://admin.tudominio.com
```

### Web pública (`apps/web-public`)

| Variable               | Requerido | Descripción                          |
| ---------------------- | --------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | sí        | `https://api.tudominio.com/v1`       |
| `NEXT_PUBLIC_SITE_URL` | sí        | `https://tudominio.com` (SEO/OG)     |

### Web admin (`apps/web-admin`)

| Variable              | Requerido | Descripción                    |
| --------------------- | --------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | sí        | `https://api.tudominio.com/v1` |

Tras el primer deploy de la API, actualiza `CORS_ORIGINS` y `NEXT_PUBLIC_*` con las URLs reales (incl. `.vercel.app` temporales si aún no hay dominio custom).

Para este monorepo, el valor esperado de `NEXT_PUBLIC_API_URL` en **web-public** / **web-admin** es:

```text
https://web-formulas-matematicas-api.vercel.app/v1
```

Si queda en `http://localhost:3001/v1`, el hub de materias se renderiza vacío en Vercel. El frontend también tiene un fallback a esa URL de API cuando detecta host Vercel.

---

## 4. Dominios custom + HTTPS

En cada proyecto Vercel → **Settings → Domains**:

1. Añade el hostname (`tudominio.com`, `admin.…`, `api.…`).
2. Configura DNS según indique Vercel:
   - Apex: registro `A` / alias, o
   - Subdominio: `CNAME` → `cname.vercel-dns.com`
3. Vercel emite certificados **HTTPS** automáticamente (Let's Encrypt).
4. Espera a que el dominio aparezca como **Valid**.
5. Actualiza `CORS_ORIGINS` y `NEXT_PUBLIC_*` a los dominios finales y redespliega.

---

## 5. Crons (API)

Definidos en [`apps/api/vercel.json`](../apps/api/vercel.json):

| Path                     | Schedule (UTC)   | Propósito                         |
| ------------------------ | ---------------- | --------------------------------- |
| `/v1/health`             | diario 12:00     | Warm-up anti cold-start (Hobby)   |
| `/v1/cron/purge-visits`  | domingo 04:00    | Purga `visit_logs` > 12 meses     |

- Configura `CRON_SECRET` en el proyecto API. Vercel envía `Authorization: Bearer <CRON_SECRET>`.
- En plan **Pro** puedes subir el warm-up a `*/5 * * * *` si lo necesitas.

---

## 6. Checklist post-deploy

- [ ] `GET https://api…/v1/health` → `{ "status": "ok" }`
- [ ] Sitio público carga secciones y KaTeX
- [ ] Búsqueda y guía responden
- [ ] Visita genera fila en `visit_logs` (Supabase Table Editor)
- [ ] Login admin + dashboard + export CSV
- [ ] CSV **sin** columna `ip_address`
- [ ] HTTPS válido en los 3 dominios
- [ ] Footer público muestra aviso de analytics

---

## 7. Lighthouse

Objetivo del plan: **Performance > 90**, **Accessibility > 95**.

```bash
# Build + server local
pnpm --filter @repo/web-public... build
pnpm --filter @repo/web-public exec next start --port 3010

# Auditoría
npx lighthouse http://localhost:3010 \
  --only-categories=performance,accessibility,best-practices,seo \
  --view
```

**Resultado local (2026-08-02, build prod, sin API):**

| Página | Performance | Accessibility | Best practices | SEO |
| ------ | ----------- | ------------- | -------------- | --- |
| `/`    | 97          | 100           | 96             | 100 |
| `/guia`| 97          | 100           | —              | —   |

Repite contra la URL de producción tras el deploy (con API + contenido seeded) para validar LCP real.

Checklist móvil (dispositivo real o DevTools):

- [ ] Drawer de menú abre/cierra; targets ≥ 44px
- [ ] Sin scroll horizontal en home, sección, buscar y guía
- [ ] Dark mode legible
- [ ] Copiar LaTeX usable con el dedo
- [ ] Formulario de búsqueda usable en viewport ~390px

---

## 8. Orden recomendado

1. Supabase + migración SQL + seed  
2. Deploy API + vars (`DATABASE_URL`, `CORS_ORIGINS`, auth, `CRON_SECRET`)  
3. Deploy web-public + web-admin con `NEXT_PUBLIC_API_URL`  
4. Dominios custom + actualizar CORS / URLs públicas  
5. Lighthouse + prueba móvil  
6. Marcar checklist de Fase 5 en `PLAN_DESARROLLO.md`

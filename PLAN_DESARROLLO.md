# Plan de desarrollo — Formulario universitario (multi-materia)

Plataforma web de consulta de fórmulas de **Cálculo Integral (Cálculo II)** y **Física Básica universitaria**, con arquitectura backend–frontend separada, registro analítico de visitas y dashboard superadmin.

> Alcance ampliado: hub multi-materia, rutas `/{subject}/…`, IDs estables de Física (`VEC-001`, …) con catálogo/detalle/relacionadas. Fuente: `content/formulas-fisica-basica.md`.

---

## 1. Objetivo del producto

| Aspecto                  | Descripción                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Público**              | Estudiantes de Cálculo II, docentes y autodidactas                                                                              |
| **Propuesta de valor**   | Formulario completo, navegable y buscable con renderizado matemático de calidad, usable en móvil y desktop                      |
| **Alcance de contenido** | Las 18 secciones + Apéndices A y B del documento `FORMULAS_CALCULO_II_CORREGIDAS_Y_AMPLIADAS.md` (~200+ fórmulas/bloques LaTeX) |
| **Operación**            | Sitio público de solo lectura + panel superadmin privado para métricas de uso                                                   |

---

## 2. Arquitectura general

**Los 3 servicios se despliegan como proyectos Vercel independientes.** Supabase aloja únicamente la base de datos.

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└───────┬─────────────────────────┬───────────────────────────────┘
        │                         │
┌───────▼────────┐       ┌────────▼────────┐
│  Web Pública   │       │  Web Superadmin │
│  (Vercel #1)   │       │  (Vercel #2)    │
│  Next.js       │       │  Next.js        │
└───────┬────────┘       └────────┬────────┘
        │      REST / JSON        │
        └────────────┬────────────┘
                     │
          ┌──────────▼──────────┐
          │     Backend API      │
          │     (Vercel #3)      │
          │  Hono / Fastify      │
          │  Serverless Functions│
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  Supabase Postgres   │
          │  (+ Auth admin)      │
          └─────────────────────┘
```

### Principio de separación de responsabilidades

| Capa                    | Responsabilidad                                                                                                                                 | NO debe hacer                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Backend**             | Servir contenido estructurado, búsqueda, captura de IP/geo desde headers HTTP, logging de visitas, agregaciones analíticas, autenticación admin | Renderizar UI, almacenar lógica de presentación, exponer IP a los frontends |
| **Frontend público**    | UI/UX, navegación, render LaTeX, búsqueda client-side opcional, envío de eventos de visita (sin IP)                                             | Almacenar fórmulas en código duro, leer o transmitir IP, calcular analytics |
| **Frontend superadmin** | Dashboards, gráficos, filtros, exportación (datos agregados sin IP)                                                                             | Acceder directamente a Supabase, recibir o mostrar direcciones IP           |

### Regla de privacidad: IP solo en backend

La dirección IP **nunca llega a ningún frontend** (ni público ni admin):

1. El frontend público envía solo contexto de navegación (`path`, `sessionId`, `sectionSlug`, etc.).
2. El backend extrae la IP de los headers de la request entrante (`x-forwarded-for`, `x-real-ip`, headers Vercel).
3. La IP se persiste únicamente en Postgres; los endpoints de analytics admin devuelven agregados (país, ciudad, conteos) **sin incluir IP**.
4. Ningún campo de IP aparece en respuestas JSON hacia frontends ni en exportaciones CSV del admin.

---

## 3. Estructura del monorepo

```
web-formulas-matematicas/
├── apps/
│   ├── web-public/          # Next.js 15 — sitio público (Vercel)
│   ├── web-admin/           # Next.js 15 — dashboard superadmin (Vercel)
│   └── api/                 # Hono/Fastify — backend compartido (Vercel #3)
├── packages/
│   ├── shared-types/        # Tipos TypeScript compartidos (DTOs, enums)
│   ├── math-renderer/       # Utilidades KaTeX compartidas
│   └── eslint-config/       # Config lint compartida
├── scripts/
│   ├── seed/                # Importador MD → Postgres
│   └── migrate/             # Migraciones SQL
├── content/
│   └── formulas-calculo-ii.md   # Copia canónica del documento fuente
├── supabase/
│   └── migrations/          # Esquema SQL versionado
├── docker-compose.yml       # Postgres local para desarrollo
├── turbo.json               # Turborepo
└── package.json             # Workspace root (pnpm)
```

**Gestor de paquetes:** `pnpm` workspaces + Turborepo para builds paralelos.

---

## 4. Stack tecnológico

| Componente       | Tecnología                                                       | Justificación                                          |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Frontend público | Next.js 15 (App Router), React 19, Tailwind CSS 4                | SSR/SSG para SEO, despliegue nativo en Vercel          |
| Frontend admin   | Next.js 15, shadcn/ui, Recharts                                  | Componentes de dashboard maduros, mismo stack          |
| Backend          | Node.js 22, Hono (adapter Vercel), Zod                           | Ligero, serverless-native, tipado                      |
| ORM              | Drizzle ORM                                                      | SQL explícito, migraciones, tipos inferidos            |
| Base de datos    | Supabase (PostgreSQL 15)                                         | Hosting gestionado, backups, connection pooler         |
| Auth admin       | Supabase Auth (email+password) + JWT                             | Solo superadmin necesita login                         |
| Renderizado math | KaTeX                                                            | Más rápido que MathJax, SSR-friendly                   |
| Búsqueda         | PostgreSQL `tsvector` + índice GIN                               | Sin servicio extra; suficiente para ~200 entradas      |
| GeoIP            | Headers Vercel (`x-vercel-ip-country`, `x-vercel-ip-city`, etc.) | Nativo en el mismo host; sin DB GeoIP externa          |
| Monorepo         | Turborepo + pnpm                                                 | Builds cacheados, dependencias compartidas             |
| CI/CD            | GitHub Actions + Vercel Git Integration                          | Lint/test en Actions; deploy automático por proyecto   |
| Hosting (×3)     | Vercel — 3 proyectos independientes                              | web-public, web-admin, api — URLs y env vars separadas |

---

## 5. Modelo de datos

### 5.1 Contenido (servido por backend)

```sql
-- Jerarquía de contenido
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,       -- ej: "integracion-por-partes"
  number      TEXT NOT NULL,              -- ej: "5"
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  parent_id   UUID REFERENCES sections(id),  -- subsecciones
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL,  -- 'formula' | 'text' | 'table' | 'list' | 'note' | 'strategy'
  sort_order  INT NOT NULL,
  title       TEXT,           -- subtítulo opcional (ej: "5.1 Elección de u")
  content     JSONB NOT NULL, -- ver esquema abajo
  search_text TEXT,           -- texto plano para FTS
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_blocks_section ON content_blocks(section_id, sort_order);
CREATE INDEX idx_content_blocks_fts ON content_blocks USING GIN(to_tsvector('spanish', search_text));
CREATE INDEX idx_content_blocks_tags ON content_blocks USING GIN(tags);
```

**Esquema JSONB de `content` por tipo:**

```typescript
// formula
{ latex: string; displayMode?: boolean; constraints?: string[] }

// text (markdown sin fórmulas embebidas, o con placeholders)
{ markdown: string }

// table
{ headers: string[]; rows: string[][]; caption?: string }

// list
{ items: string[]; ordered: boolean }

// note (callout / restricción)
{ variant: 'info' | 'warning' | 'domain'; markdown: string }

// strategy (guía de métodos)
{ signal: string; method: string }
```

### 5.2 Analytics (logs de ingreso)

```sql
CREATE TABLE visit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL,          -- UUID anónimo generado en frontend
  visited_at      TIMESTAMPTZ DEFAULT now(),

  -- Request (capturado exclusivamente en backend; nunca expuesto a frontends)
  ip_address      INET NOT NULL,            -- extraída de headers HTTP en serverless
  user_agent      TEXT,                     -- header User-Agent de la request
  referer         TEXT,                     -- header Referer (o campo enviado por cliente)
  path            TEXT NOT NULL,
  query_string    TEXT,

  -- Geo (desde headers Vercel en backend; derivado de IP, no enviado al cliente)
  country_code    CHAR(2),
  country_name    TEXT,
  region          TEXT,
  city            TEXT,
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  timezone        TEXT,

  -- Cliente (enviados por frontend público; sin IP)
  accept_language TEXT,
  primary_language CHAR(5),
  screen_width    INT,
  screen_height   INT,
  device_type     TEXT,                     -- mobile | tablet | desktop
  browser         TEXT,                     -- parseado en backend desde User-Agent
  os              TEXT,

  -- Contexto app
  section_slug    TEXT,
  search_query    TEXT,
  is_unique_day   BOOLEAN DEFAULT false     -- calculado en agregación
);

-- Política: ip_address solo accesible vía queries internas del backend.
-- Ningún endpoint REST incluye ip_address en su response JSON.

CREATE INDEX idx_visit_logs_date ON visit_logs(visited_at DESC);
CREATE INDEX idx_visit_logs_country ON visit_logs(country_code);
CREATE INDEX idx_visit_logs_path ON visit_logs(path);
CREATE INDEX idx_visit_logs_session ON visit_logs(session_id);
```

### 5.3 Admin

```sql
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id),  -- Supabase Auth
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. API REST (backend compartido)

Base URL: `https://api.formulas-calculo-ii.example.com/v1`

### 6.1 Endpoints públicos (sin auth)

| Método | Ruta                      | Descripción                              |
| ------ | ------------------------- | ---------------------------------------- |
| `GET`  | `/health`                 | Health check                             |
| `GET`  | `/sections`               | Árbol de secciones (índice completo)     |
| `GET`  | `/sections/:slug`         | Sección con todos sus `content_blocks`   |
| `GET`  | `/search?q=&tags=&limit=` | Búsqueda full-text + filtros por tag     |
| `GET`  | `/tags`                   | Lista de tags disponibles (método, tema) |
| `GET`  | `/guide/method-selection` | Tabla de la sección 17                   |
| `POST` | `/analytics/visit`        | Registrar visita (rate-limited)          |

**Ejemplo respuesta `GET /sections/:slug`:**

```json
{
  "section": {
    "slug": "integracion-por-partes",
    "number": "5",
    "title": "Integración por partes",
    "description": null
  },
  "blocks": [
    {
      "id": "...",
      "type": "text",
      "title": null,
      "content": { "markdown": "Proviene de la regla del producto:" }
    },
    {
      "id": "...",
      "type": "formula",
      "title": null,
      "content": {
        "latex": "\\int u\\,dv = uv - \\int v\\,du",
        "displayMode": true
      },
      "tags": ["integracion-por-partes", "tecnica-fundamental"]
    }
  ],
  "subsections": []
}
```

**`POST /analytics/visit` — body (sin IP; el frontend no conoce ni envía la IP):**

```json
{
  "sessionId": "uuid-v4",
  "path": "/seccion/integracion-por-partes",
  "referer": "https://google.com",
  "acceptLanguage": "es-PE,es;q=0.9",
  "screen": { "width": 1920, "height": 1080 },
  "sectionSlug": "integracion-por-partes",
  "searchQuery": null
}
```

**Enriquecimiento exclusivo en backend** (desde headers HTTP de la request entrante):

| Dato                    | Origen                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| IP                      | `x-forwarded-for` / `x-real-ip`                                         |
| País, ciudad, región    | `x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-country-region` |
| Coordenadas, timezone   | `x-vercel-ip-latitude`, `x-vercel-ip-longitude`, `x-vercel-ip-timezone` |
| User-Agent, browser, OS | Header `User-Agent` + parseo con `ua-parser-js`                         |
| Timestamp               | Servidor                                                                |

La respuesta del endpoint es `{ "ok": true }` — sin devolver IP ni geo al cliente.

### 6.2 Endpoints superadmin (JWT Bearer)

| Método | Ruta                                                    | Descripción                                                      |
| ------ | ------------------------------------------------------- | ---------------------------------------------------------------- |
| `POST` | `/auth/login`                                           | Login (delegado a Supabase Auth)                                 |
| `POST` | `/auth/refresh`                                         | Refresh token                                                    |
| `GET`  | `/admin/analytics/overview`                             | KPIs: visitas hoy/semana/mes, únicos, top países                 |
| `GET`  | `/admin/analytics/timeseries?from=&to=&granularity=day` | Serie temporal                                                   |
| `GET`  | `/admin/analytics/geo?from=&to=`                        | Distribución geográfica                                          |
| `GET`  | `/admin/analytics/pages?from=&to=&limit=20`             | Páginas/secciones más visitadas                                  |
| `GET`  | `/admin/analytics/referrers?from=&to=`                  | Fuentes de tráfico                                               |
| `GET`  | `/admin/analytics/devices?from=&to=`                    | Dispositivos, browsers, OS                                       |
| `GET`  | `/admin/analytics/languages?from=&to=`                  | Idiomas detectados                                               |
| `GET`  | `/admin/analytics/export?from=&to=&format=csv`          | Exportación CSV (sin columna IP)                                 |
| `GET`  | `/admin/analytics/recent?limit=100`                     | Últimas visitas: fecha, país, ciudad, path, dispositivo — sin IP |

---

## 7. Mapeo del documento fuente → base de datos

El documento tiene **18 secciones principales + 2 apéndices**. Cada encabezado `##` o `###` se convierte en `section` o subsección; cada bloque LaTeX, tabla o párrafo en un `content_block`.

| #   | Slug                       | Título                               | Bloques estimados   |
| --- | -------------------------- | ------------------------------------ | ------------------- |
| 1   | notacion-dominios          | Notación, dominios y convenciones    | ~15                 |
| 2   | integral-indefinida        | Integral indefinida y propiedades    | ~12                 |
| 3   | integral-definida-tfc      | Integral definida y TFC              | ~20                 |
| 4   | sustitucion                | Método de sustitución                | ~15                 |
| 5   | integracion-por-partes     | Integración por partes               | ~18                 |
| 6   | integrales-trigonometricas | Integrales trigonométricas           | ~25                 |
| 7   | sustitucion-trigonometrica | Sustitución trigonométrica           | ~15                 |
| 8   | fracciones-parciales       | Funciones racionales                 | ~18                 |
| 9   | integrales-impropias       | Integrales impropias                 | ~15                 |
| 10  | aplicaciones-integral      | Aplicaciones de la integral          | ~25                 |
| 11  | integracion-numerica       | Integración numérica                 | ~12                 |
| 12  | curvas-parametricas        | Curvas paramétricas                  | ~10                 |
| 13  | coordenadas-polares        | Coordenadas polares                  | ~10                 |
| 14  | sucesiones-series          | Sucesiones y series                  | ~25                 |
| 15  | series-potencias-taylor    | Series de potencias y Taylor         | ~18                 |
| 16  | ecuaciones-diferenciales   | Ecuaciones diferenciales elementales | ~8                  |
| 17  | guia-metodos               | Guía para elegir un método           | ~15 (tabla + lista) |
| A   | apendice-antiderivadas     | Apéndice A: tabla extensa            | ~120                |
| B   | apendice-equivalencias     | Apéndice B: equivalencias            | ~5                  |

**Tags automáticos por bloque:**

- Técnica: `sustitucion`, `por-partes`, `trigonometrica`, `fracciones-parciales`, etc.
- Tipo: `antiderivada`, `definicion`, `propiedad`, `reduccion`, `aplicacion`, `criterio-convergencia`
- Dominio: `restriccion-dominio`, `integral-impropia`

**Script de seed (`scripts/seed/import-markdown.ts`):**

1. Parsear MD con `remark` + plugins custom para bloques `\[...\]`.
2. Detectar tablas markdown → `block_type: table`.
3. Extraer `search_text` concatenando títulos + LaTeX simplificado + markdown.
4. Upsert idempotente por `slug` de sección.

---

## 8. Frontend público — funcionalidades

### 8.1 Páginas

| Ruta               | Descripción                                                 |
| ------------------ | ----------------------------------------------------------- |
| `/`                | Landing + índice navegable de las 18 secciones              |
| `/seccion/[slug]`  | Contenido completo de una sección con fórmulas renderizadas |
| `/buscar`          | Búsqueda con resultados resaltados                          |
| `/guia`            | Sección 17 — guía interactiva de métodos                    |
| `/apendice/[slug]` | Apéndices A y B                                             |

### 8.2 UX clave

- **Navegación lateral fija** (desktop) / drawer (móvil) con índice colapsable.
- **Render KaTeX** con `react-katex`; fallback SSR para SEO.
- **Modo oscuro/claro** respetando `prefers-color-scheme`.
- **Copiar LaTeX** al portapapeles con un clic en cada fórmula.
- **Anclas por subtítulo** para compartir enlaces directos (`#5.1-eleccion-de-u`).
- **Breadcrumbs** por sección.
- **Skeleton loading** mientras carga desde API.
- **PWA básica** (manifest + service worker cache de assets estáticos).

### 8.3 Analytics client-side

El frontend **no lee, almacena ni transmite IP**. Solo envía contexto de navegación; el backend captura la IP de los headers de la request HTTP.

```typescript
// Al montar cada página — sin campos de IP:
analytics.trackVisit({
  path: window.location.pathname,
  sectionSlug: params.slug ?? null,
  sessionId: getOrCreateSessionId(), // localStorage, UUID v4, 30 días
  acceptLanguage: navigator.language,
  screen: { width: window.screen.width, height: window.screen.height },
  referer: document.referrer || null,
  searchQuery: searchParams.get('q'),
});
```

- Envío con `navigator.sendBeacon` en `beforeunload` como respaldo.
- Debounce: máximo 1 log por sesión+path cada 30 minutos (validado en backend).
- La IP queda en el serverless function de Vercel; el bundle del frontend no incluye lógica GeoIP.

### 8.4 SEO

- SSG/ISR para `/seccion/[slug]` (revalidación cada 24h).
- Meta tags Open Graph por sección.
- `sitemap.xml` generado desde `/sections`.
- Schema.org `LearningResource`.

---

## 9. Frontend superadmin — funcionalidades

### 9.1 Páginas

| Ruta                  | Descripción                              |
| --------------------- | ---------------------------------------- |
| `/login`              | Formulario email + password              |
| `/dashboard`          | Overview con KPI cards                   |
| `/analytics/traffic`  | Gráfico de visitas en el tiempo          |
| `/analytics/geo`      | Mapa coroplético + tabla por país/ciudad |
| `/analytics/content`  | Secciones más consultadas                |
| `/analytics/audience` | Idiomas, dispositivos, referrers         |
| `/analytics/logs`     | Tabla paginada de visitas recientes      |
| `/analytics/export`   | Descarga CSV con filtros de fecha        |

### 9.2 Dashboard — widgets

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Visitas hoy │  Únicos 7d  │ Top país    │ Top sección │
│    342      │    1,204    │  Perú (PE)  │  Por partes │
└─────────────┴─────────────┴─────────────┴─────────────┘
┌──────────────────────────────┬──────────────────────────┐
│   Visitas últimos 30 días    │   Mapa geográfico        │
│   (line chart)               │   (choropleth)           │
└──────────────────────────────┴──────────────────────────┘
┌──────────────────────────────┬──────────────────────────┐
│   Top 10 secciones           │   Dispositivos (pie)     │
└──────────────────────────────┴──────────────────────────┘
```

### 9.3 Seguridad admin

- Login vía Supabase Auth; JWT verificado en backend en cada request `/admin/*`.
- CORS restrictivo: solo dominios del admin y público en whitelist.
- Rate limiting en login (5 intentos / 15 min).
- Admin frontend en subdominio separado (`admin.formulas.example.com`).
- **IP nunca en respuestas admin:** la UI muestra país, ciudad, región, dispositivo y path; la columna `ip_address` no se serializa en ningún DTO hacia el frontend admin.

---

## 10. Despliegue

### 10.1 Tres proyectos Vercel + Supabase

| Servicio          | Vercel Proyecto | Root directory    | URL ejemplo                  | Variables clave                                                |
| ----------------- | --------------- | ----------------- | ---------------------------- | -------------------------------------------------------------- |
| `apps/web-public` | Proyecto A      | `apps/web-public` | `formulas.example.com`       | `NEXT_PUBLIC_API_URL`                                          |
| `apps/web-admin`  | Proyecto B      | `apps/web-admin`  | `admin.formulas.example.com` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`              |
| `apps/api`        | Proyecto C      | `apps/api`        | `api.formulas.example.com`   | `DATABASE_URL` (pooler Supabase), `JWT_SECRET`, `CORS_ORIGINS` |
| PostgreSQL        | — (Supabase)    | —                 | —                            | Connection string vía pooler transaction mode                  |

**Configuración del backend en Vercel (`apps/api/vercel.json`):**

```json
{
  "rewrites": [{ "source": "/v1/(.*)", "destination": "/api/$1" }]
}
```

El adapter Hono/Fastify exporta un handler serverless por ruta bajo `api/`. Usar **Supabase connection pooler** (puerto 6543, modo transaction) para evitar agotar conexiones en serverless.

### 10.2 Flujo CI/CD

```yaml
# GitHub Actions (por push a main):
# 1. turbo lint + test (monorepo completo)

# Vercel Git Integration (automático por proyecto):
# 2. Proyecto A redeploy si cambió apps/web-public o packages/*
# 3. Proyecto B redeploy si cambió apps/web-admin o packages/*
# 4. Proyecto C redeploy si cambió apps/api o packages/*
```

Cada proyecto Vercel tiene **Root Directory** apuntando a su carpeta en el monorepo e **Ignored Build Step** opcional para evitar builds innecesarios.

### 10.3 Entornos

| Entorno      | DB              | API (Vercel #3)               | Frontends (Vercel #1, #2)  |
| ------------ | --------------- | ----------------------------- | -------------------------- |
| `local`      | Docker Postgres | `vercel dev` o localhost:3001 | localhost:3000 / :3002     |
| `staging`    | Supabase branch | Preview deployment Vercel     | Preview deployments Vercel |
| `production` | Supabase prod   | Production Vercel             | Production Vercel          |

### 10.4 Consideraciones serverless (API en Vercel)

- **Cold starts:** aceptables para este tráfico; mitigar con cron de warm-up opcional.
- **Timeout:** 10s (Hobby) / 60s (Pro) — suficiente para queries de analytics.
- **GeoIP:** headers Vercel disponibles automáticamente en cada invocación; no requiere binarios externos.
- **IP en local dev:** simular con header manual o fallback a `127.0.0.1` sin geo.

---

## 11. Seguridad y privacidad

- **IP solo en backend:** capturada server-side, persistida en DB, excluida de todas las respuestas API y bundles frontend.
- **Aviso de analytics:** footer en sitio público informando recolección de datos de uso (país, idioma, páginas visitadas).
- **Retención:** job programado (Vercel Cron) para purgar `visit_logs` > 12 meses, incluyendo `ip_address`.
- **Rate limiting:** 60 req/min por IP en endpoints públicos; 10 req/min en `/analytics/visit` (IP leída en backend).
- **Validación:** Zod en todos los bodies; rechazar cualquier campo `ip` enviado por el cliente.
- **Headers:** CSP estricta en frontends; CORS whitelist entre los 3 dominios Vercel.
- **Secrets:** nunca en repo; Vercel env vars por proyecto + Supabase vault.
- **SQL injection:** Drizzle ORM parametrizado exclusivamente.

---

## 12. Fases de desarrollo

### Fase 0 — Fundación (Semana 1)

- [x] Inicializar monorepo (pnpm + Turborepo)
- [x] Configurar ESLint, Prettier, TypeScript strict
- [x] Docker Compose con Postgres local
- [x] Esquema Drizzle + migraciones Supabase
- [x] Scaffold Hono/Fastify con adapter Vercel y `/health`
- [x] Scaffold Next.js público y admin (shell vacío)
- [x] CI básico en GitHub Actions

**Entregable:** `pnpm dev` levanta los 3 servicios localmente.

### Fase 1 — Contenido y API (Semanas 2–3)

- [x] Script seed: importar MD completo → Postgres
- [x] Endpoints `GET /sections`, `/sections/:slug`, `/search`, `/tags`
- [x] Tests unitarios del parser MD
- [x] Tests de integración API con DB de test

**Entregable:** API sirve las 18 secciones + apéndices con búsqueda funcional.

### Fase 2 — Frontend público (Semanas 4–5)

- [x] Layout responsive con sidebar/drawer
- [x] Página índice y `/seccion/[slug]` con KaTeX
- [x] Buscador con resultados
- [x] Página guía de métodos (sección 17)
- [x] Copiar LaTeX, anclas, dark mode
- [x] SEO: meta, sitemap, OG tags

**Entregable:** Sitio público usable end-to-end contra API local/staging.

### Fase 3 — Analytics (Semana 6)

- [x] Tabla `visit_logs` + endpoint `POST /analytics/visit`
- [x] Captura IP + geo desde headers Vercel en serverless (sin exponer al cliente)
- [x] Parseo User-Agent (ua-parser-js) en backend
- [x] Hook `trackVisit` en frontend público (sin campos IP)
- [x] Deduplicación sesión+path en backend
- [x] DTOs admin y CSV sin columna `ip_address`

**Entregable:** Cada visita registrada con geo, idioma, dispositivo; IP solo en DB.

### Fase 4 — Dashboard superadmin (Semanas 7–8)

- [x] Auth Supabase + middleware JWT en API
- [x] Endpoints `/admin/analytics/*`
- [x] Login page admin
- [x] Dashboard overview + gráficos (Recharts)
- [x] Mapa geo, tablas paginadas, export CSV

**Entregable:** Superadmin funcional con métricas en tiempo real.

### Fase 5 — Despliegue y pulido (Semana 9)

**Listo en repo (configs + docs):**

- [x] API lista para pooler Supabase transaction mode (`prepare: false`, `max: 1`)
- [x] `vercel.json` en api / web-public / web-admin (install/build monorepo, crons API)
- [x] Cron retención `visit_logs` > 12 meses + warm-up `/health`
- [x] Headers de seguridad + aviso de analytics en footer público
- [x] Documentación de despliegue (`docs/DEPLOYMENT.md` + README)

**Pendiente con tu cuenta (pasos en docs):**

- [ ] Crear proyecto Supabase prod + aplicar migración + seed
- [ ] Crear 3 proyectos Vercel y primer deploy
- [ ] Dominios custom + HTTPS en los 3 proyectos
- [ ] Lighthouse contra URL de producción (local ya cumple: perf 97 / a11y 100)
- [ ] Pruebas en móvil real (checklist en `docs/DEPLOYMENT.md`)

**Entregable:** Producción live cuando completes el checklist de cuenta (guía: `docs/DEPLOYMENT.md`).

### Fase 6 — Post-lanzamiento (continuo)

- [ ] ISR/revalidación automática al actualizar contenido
- [ ] Panel admin para editar fórmulas (CRUD) — opcional v2
- [ ] Soporte inglés (i18n) — opcional v2
- [ ] Calculadora simbólica básica — opcional v2

---

## 13. Criterios de aceptación

| Criterio                | Métrica                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| Completitud de fórmulas | 100% de bloques del MD importados y renderizados                   |
| Usabilidad móvil        | Navegable sin scroll horizontal; touch targets ≥44px               |
| Performance             | LCP < 2.5s en 4G; API p95 < 200ms                                  |
| Búsqueda                | Resultados relevantes en < 300ms para cualquier término del índice |
| Analytics               | ≥95% de visitas registradas con país e idioma                      |
| Admin                   | Dashboard carga en < 3s; export CSV funcional                      |
| Despliegue              | 3 proyectos Vercel independientes en producción                    |
| Privacidad IP           | IP ausente en bundles frontend, respuestas API y exportaciones CSV |
| Accesibilidad           | WCAG 2.1 AA en sitio público                                       |

---

## 14. Riesgos y mitigaciones

| Riesgo                                      | Mitigación                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| LaTeX mal renderizado en fórmulas complejas | Suite de snapshot tests KaTeX; revisión manual apéndice A                |
| GeoIP impreciso en local dev                | Headers Vercel en prod; mock geo en desarrollo local                     |
| Spam en endpoint analytics                  | Rate limit por IP (backend) + deduplicación + honeypot field             |
| Documento fuente se actualiza               | Script seed idempotente; versionado en `content/`                        |
| Cold start API en Vercel                    | Cron de warm-up cada 5 min en `/health`; aceptable para tráfico inicial  |
| Agotar conexiones Postgres                  | Supabase pooler (transaction mode) + Drizzle sin conexiones persistentes |

---

## 15. Estimación de esfuerzo

| Fase          | Duración       | Dependencias     |
| ------------- | -------------- | ---------------- |
| Fase 0        | 1 semana       | —                |
| Fase 1        | 2 semanas      | Fase 0           |
| Fase 2        | 2 semanas      | Fase 1           |
| Fase 3        | 1 semana       | Fase 2           |
| Fase 4        | 2 semanas      | Fase 3           |
| Fase 5        | 1 semana       | Fase 4           |
| **Total MVP** | **~9 semanas** | 1 dev full-stack |

---

## 16. Próximo paso inmediato

1. ~~Fases 0–5 (código + docs de despliegue) completadas.~~
2. Go-live: seguir [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) (Supabase → 3 Vercel → dominios → Lighthouse).
3. Local: `ADMIN_EMAIL` / `ADMIN_PASSWORD` y http://localhost:3002.

---

_Plan generado a partir de `FORMULAS_CALCULO_II_CORREGIDAS_Y_AMPLIADAS.md` — Julio 2026._

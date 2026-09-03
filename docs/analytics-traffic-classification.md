# Clasificación de tráfico analítico

## Flujo

```
VisitTracker (apps/web-public)
  → POST /v1/analytics/visit
  → Vercel Edge aporta IP y geolocalización (x-forwarded-for, x-vercel-ip-*)
  → API Hono clasifica el User-Agent, genera ip_hash / ip_network y persiste
  → Postgres visit_logs
```

Los bots bloqueados por el Firewall de Vercel no llegan a la API y no aparecen en `visit_logs`. Ese tráfico solo se ve en Vercel Firewall / Observability.

## Migración

Aplicar en Supabase (SQL Editor o `pnpm db:migrate` si el journal de Drizzle es la fuente de verdad del entorno):

- [`supabase/migrations/20260903180000_visit_logs_traffic_class.sql`](../supabase/migrations/20260903180000_visit_logs_traffic_class.sql)
- Equivalente Drizzle: `apps/api/drizzle/0003_visit_logs_traffic_class.sql`

La migración es reversible (bloque de rollback en comentarios). No borra filas históricas. Columnas nuevas: `is_bot`, `traffic_class`, `bot_id`, `bot_category`, `bot_detection_reason`, `bot_confidence`, `ip_hash`, `ip_network`, `event_source`, `classification_version`.

El timestamp del evento sigue siendo `visited_at` (no existe `created_at` en `visit_logs`).

Después de migrar, reclasificar histórico:

```bash
pnpm --filter @repo/api exec tsx src/scripts/backfill-visit-classification.ts --dry-run
pnpm --filter @repo/api exec tsx src/scripts/backfill-visit-classification.ts
```

Requisitos: `DATABASE_URL` y `ANALYTICS_IP_HASH_SECRET` (solo servidor). El backfill es por lotes, reanudable, idempotente y no pisa `classification_version` que empiece por `manual`.

## Clasificador (`v1`)

Módulo único: `apps/api/src/lib/traffic-classifier.ts`. No se duplican reglas en el dashboard.

- Tokens específicos (Googlebot, GoogleOther, meta-externalagent, HeadlessChrome, …) antes que reglas genéricas.
- Coincidencia sin distinguir mayúsculas.
- Un navegador Chrome/Firefox/Safari/Edge sin tokens de crawler → `human` (etiqueta UI: “Humano probable”).
- User-Agent vacío o no clasificable → `unknown`, `is_bot = false`, confianza `low`.
- No hay verificación por rangos de IP oficiales. El motivo habla de “claimed bot”, no de “bot verificado”.
- `curl` / `wget` / `python-requests` / `Go-http-client` → `traffic_class = bot`, categoría `monitoring`.

## Privacidad de IP

- `ip_address` permanece en la base para geo/seguridad.
- Nunca se expone en API admin, CSV/JSON, UI ni logs de cliente.
- `ip_hash` = HMAC-SHA-256(IP normalizada, `ANALYTICS_IP_HASH_SECRET`), 20 hex.
- `ip_network`: IPv4 `/24`, IPv6 `/48`.

## Deduplicación y sesiones

- Sigue existiendo dedupe de 30 minutos por `session_id + path`.
- Las sesiones humanas usan `session_id` de localStorage (30 días).
- Los UUID de bots no entran en “sesiones humanas” ni en “únicos”. En la vista de bots, si se enumeran IDs de sesión, son identificadores de ejecución.

`event_source` del VisitTracker: `web_client`.

## KPIs (UTC)

Todas las agregaciones de “hoy / 7d / 30d” usan medianoche UTC (`date_trunc` / `setUTCHours`). La tabla de logs formatea la fecha en la zona local del navegador.

| KPI | Definición |
| --- | --- |
| Visitas hoy | `count(*)` con `traffic_class = 'human'` desde medianoche UTC. Páginas vistas humanas o probablemente humanas (post-dedupe). No es certeza absoluta. |
| Sesiones humanas 7d | `count(distinct session_id)` humano, últimos 7 días UTC. |
| Tráfico total | Todos los eventos persistidos (human + bot + unknown). |
| Solicitudes de bots | `traffic_class = 'bot'`. |
| Tráfico desconocido | `traffic_class = 'unknown'` (incluye histórico aún no reclasificado). |
| % bots | bots / tráfico total. |

Las pantallas de audiencia (geo, contenido, dispositivos, referentes, tendencias) filtran por defecto `audience=human`. Logs por defecto `all`. Bots fuerza `bot`.

## Solicitudes por minuto

No se guarda `rpm` por evento. Se calcula con `date_trunc('minute', visited_at)`:

- máximo global y máximo por `ip_hash`
- media = eventos / minutos del rango
- mediana y p95 sobre minutos con al menos una solicitud

No hay vista materializada: el volumen actual cabe en agregaciones ad hoc. Si el volumen creciera a millones de filas/día, una vista materializada por minuto sería el siguiente paso versionado.

## Limitaciones

- El User-Agent se puede falsificar.
- El Firewall de Vercel oculta bots que nunca llegan a la app.
- Filas históricas sin backfill aparecen como `unknown` y no inflan KPIs humanos.
- Geo de crawlers refleja el datacenter, no un usuario.

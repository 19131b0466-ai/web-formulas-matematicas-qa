-- Initial schema for Supabase (production/staging)
-- Run via Supabase CLI or dashboard SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  parent_id   UUID REFERENCES public.sections(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL,
  sort_order  INT NOT NULL,
  title       TEXT,
  content     JSONB NOT NULL,
  search_text TEXT,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON public.content_blocks(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_blocks_fts ON public.content_blocks USING GIN(to_tsvector('spanish', coalesce(search_text, '')));
CREATE INDEX IF NOT EXISTS idx_content_blocks_tags ON public.content_blocks USING GIN(tags);

CREATE TABLE IF NOT EXISTS public.visit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL,
  visited_at       TIMESTAMPTZ DEFAULT now(),
  ip_address       INET NOT NULL,
  user_agent       TEXT,
  referer          TEXT,
  path             TEXT NOT NULL,
  query_string     TEXT,
  country_code     CHAR(2),
  country_name     TEXT,
  region           TEXT,
  city             TEXT,
  latitude         DECIMAL(9,6),
  longitude        DECIMAL(9,6),
  timezone         TEXT,
  accept_language  TEXT,
  primary_language CHAR(5),
  screen_width     INT,
  screen_height    INT,
  device_type      TEXT,
  browser          TEXT,
  os               TEXT,
  section_slug     TEXT,
  search_query     TEXT,
  is_unique_day    BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_visit_logs_date ON public.visit_logs(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_logs_country ON public.visit_logs(country_code);
CREATE INDEX IF NOT EXISTS idx_visit_logs_path ON public.visit_logs(path);
CREATE INDEX IF NOT EXISTS idx_visit_logs_session ON public.visit_logs(session_id);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id),
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: visit_logs and admin tables are backend-only (service role)
ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read for content (API uses service role; direct client access blocked by default)
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

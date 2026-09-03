-- Local dev bootstrap: auth schema stub for admin_users FK (Supabase provides this in prod)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sections
CREATE TABLE IF NOT EXISTS sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  parent_id   UUID REFERENCES sections(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Content blocks
CREATE TABLE IF NOT EXISTS content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  block_type  TEXT NOT NULL,
  sort_order  INT NOT NULL,
  title       TEXT,
  content     JSONB NOT NULL,
  search_text TEXT,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_blocks_fts ON content_blocks USING GIN(to_tsvector('spanish', coalesce(search_text, '')));
CREATE INDEX IF NOT EXISTS idx_content_blocks_tags ON content_blocks USING GIN(tags);

-- Visit logs (ip_address never exposed via API)
CREATE TABLE IF NOT EXISTS visit_logs (
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
  is_unique_day    BOOLEAN DEFAULT false,
  is_bot           BOOLEAN NOT NULL DEFAULT FALSE,
  traffic_class    TEXT NOT NULL DEFAULT 'unknown',
  bot_id           TEXT,
  bot_category     TEXT,
  bot_detection_reason TEXT,
  bot_confidence   TEXT,
  ip_hash          TEXT,
  ip_network       TEXT,
  event_source     TEXT NOT NULL DEFAULT 'web_client',
  classification_version TEXT NOT NULL DEFAULT 'v1'
);

CREATE INDEX IF NOT EXISTS idx_visit_logs_date ON visit_logs(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_logs_country ON visit_logs(country_code);
CREATE INDEX IF NOT EXISTS idx_visit_logs_path ON visit_logs(path);
CREATE INDEX IF NOT EXISTS idx_visit_logs_session ON visit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_traffic ON visit_logs(visited_at, traffic_class);
CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_is_bot ON visit_logs(visited_at, is_bot);
CREATE INDEX IF NOT EXISTS idx_visit_logs_bot_id_visited ON visit_logs(bot_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_visit_logs_ip_hash_visited ON visit_logs(ip_hash, visited_at);
CREATE INDEX IF NOT EXISTS idx_visit_logs_path_visited_traffic ON visit_logs(path, visited_at, traffic_class);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id),
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);

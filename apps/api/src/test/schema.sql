-- PGlite-compatible schema (no pgcrypto; IDs supplied by application)
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sections (
  id          UUID PRIMARY KEY,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  parent_id   UUID REFERENCES sections(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subject_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_sections_subject ON sections(subject_id, sort_order);

CREATE TABLE IF NOT EXISTS content_blocks (
  id           UUID PRIMARY KEY,
  section_id   UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  block_type   TEXT NOT NULL,
  sort_order   INT NOT NULL,
  title        TEXT,
  content      JSONB NOT NULL,
  search_text  TEXT,
  tags         TEXT[] DEFAULT '{}',
  formula_code TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_blocks_tags ON content_blocks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_blocks_formula_code ON content_blocks(formula_code);

CREATE TABLE IF NOT EXISTS visit_logs (
  id               UUID PRIMARY KEY,
  session_id       UUID NOT NULL,
  visited_at       TIMESTAMPTZ DEFAULT now(),
  ip_address       TEXT NOT NULL,
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
  subject_slug     TEXT,
  search_query     TEXT,
  is_unique_day    BOOLEAN DEFAULT false,
  is_bot           BOOLEAN NOT NULL DEFAULT false,
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

CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_traffic ON visit_logs(visited_at, traffic_class);
CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_is_bot ON visit_logs(visited_at, is_bot);
CREATE INDEX IF NOT EXISTS idx_visit_logs_bot_id_visited ON visit_logs(bot_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_visit_logs_ip_hash_visited ON visit_logs(ip_hash, visited_at);
CREATE INDEX IF NOT EXISTS idx_visit_logs_path_visited_traffic ON visit_logs(path, visited_at, traffic_class);

CREATE INDEX IF NOT EXISTS idx_visit_logs_subject ON visit_logs(subject_slug);

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY,
  display_name TEXT,
  rating       INT NOT NULL,
  body         TEXT NOT NULL,
  locale       TEXT NOT NULL DEFAULT 'es',
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT now(),
  moderated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at);

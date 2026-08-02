-- PGlite-compatible schema (no pgcrypto; IDs supplied by application)
CREATE TABLE IF NOT EXISTS sections (
  id          UUID PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  parent_id   UUID REFERENCES sections(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id          UUID PRIMARY KEY,
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
CREATE INDEX IF NOT EXISTS idx_content_blocks_tags ON content_blocks USING GIN(tags);

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
  search_query     TEXT,
  is_unique_day    BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);

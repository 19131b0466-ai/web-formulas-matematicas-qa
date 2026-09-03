-- Visit traffic classification, anonymized IP identifiers, and event source.
-- Uses visited_at (the existing event timestamp), not created_at.
-- Historical rows are not deleted. New columns default to unclassified (unknown).
--
-- Rollback:
--   DROP INDEX IF EXISTS idx_visit_logs_path_visited_traffic;
--   DROP INDEX IF EXISTS idx_visit_logs_ip_hash_visited;
--   DROP INDEX IF EXISTS idx_visit_logs_bot_id_visited;
--   DROP INDEX IF EXISTS idx_visit_logs_visited_is_bot;
--   DROP INDEX IF EXISTS idx_visit_logs_visited_traffic;
--   ALTER TABLE visit_logs
--     DROP CONSTRAINT IF EXISTS visit_logs_bot_confidence_check,
--     DROP CONSTRAINT IF EXISTS visit_logs_event_source_check,
--     DROP CONSTRAINT IF EXISTS visit_logs_traffic_class_check,
--     DROP COLUMN IF EXISTS classification_version,
--     DROP COLUMN IF EXISTS event_source,
--     DROP COLUMN IF EXISTS ip_network,
--     DROP COLUMN IF EXISTS ip_hash,
--     DROP COLUMN IF EXISTS bot_confidence,
--     DROP COLUMN IF EXISTS bot_detection_reason,
--     DROP COLUMN IF EXISTS bot_category,
--     DROP COLUMN IF EXISTS bot_id,
--     DROP COLUMN IF EXISTS traffic_class,
--     DROP COLUMN IF EXISTS is_bot;

ALTER TABLE visit_logs
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS traffic_class TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS bot_id TEXT,
  ADD COLUMN IF NOT EXISTS bot_category TEXT,
  ADD COLUMN IF NOT EXISTS bot_detection_reason TEXT,
  ADD COLUMN IF NOT EXISTS bot_confidence TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS ip_network TEXT,
  ADD COLUMN IF NOT EXISTS event_source TEXT NOT NULL DEFAULT 'web_client',
  ADD COLUMN IF NOT EXISTS classification_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE visit_logs DROP CONSTRAINT IF EXISTS visit_logs_traffic_class_check;
ALTER TABLE visit_logs
  ADD CONSTRAINT visit_logs_traffic_class_check
  CHECK (traffic_class IN ('human', 'bot', 'unknown'));

ALTER TABLE visit_logs DROP CONSTRAINT IF EXISTS visit_logs_event_source_check;
ALTER TABLE visit_logs
  ADD CONSTRAINT visit_logs_event_source_check
  CHECK (event_source IN ('web_client', 'server', 'api', 'internal', 'unknown'));

ALTER TABLE visit_logs DROP CONSTRAINT IF EXISTS visit_logs_bot_confidence_check;
ALTER TABLE visit_logs
  ADD CONSTRAINT visit_logs_bot_confidence_check
  CHECK (bot_confidence IS NULL OR bot_confidence IN ('high', 'medium', 'low'));

CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_traffic
  ON visit_logs (visited_at, traffic_class);

CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_is_bot
  ON visit_logs (visited_at, is_bot);

CREATE INDEX IF NOT EXISTS idx_visit_logs_bot_id_visited
  ON visit_logs (bot_id, visited_at);

CREATE INDEX IF NOT EXISTS idx_visit_logs_ip_hash_visited
  ON visit_logs (ip_hash, visited_at);

CREATE INDEX IF NOT EXISTS idx_visit_logs_path_visited_traffic
  ON visit_logs (path, visited_at, traffic_class);

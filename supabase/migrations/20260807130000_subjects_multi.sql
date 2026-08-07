-- Multi-subject support + physics formula codes
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO subjects (id, slug, title, description, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'calculo-ii', 'Cálculo II', 'Cálculo Integral — fórmulas, métodos y aplicaciones', 1),
  ('22222222-2222-2222-2222-222222222222', 'fisica-basica', 'Física Básica', 'Fórmulas de Física General universitaria', 2)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE sections ADD COLUMN IF NOT EXISTS subject_id UUID;

UPDATE sections
SET subject_id = '11111111-1111-1111-1111-111111111111'
WHERE subject_id IS NULL;

ALTER TABLE sections ALTER COLUMN subject_id SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE sections
    ADD CONSTRAINT sections_subject_id_subjects_id_fk
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_slug_unique;

DO $$ BEGIN
  ALTER TABLE sections
    ADD CONSTRAINT sections_subject_slug_unique UNIQUE (subject_id, slug);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sections_subject ON sections (subject_id, sort_order);

ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS formula_code TEXT;
CREATE INDEX IF NOT EXISTS idx_content_blocks_formula_code ON content_blocks (formula_code);

ALTER TABLE visit_logs ADD COLUMN IF NOT EXISTS subject_slug TEXT;
CREATE INDEX IF NOT EXISTS idx_visit_logs_subject ON visit_logs (subject_slug);

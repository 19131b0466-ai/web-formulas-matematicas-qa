-- Legacy single-column unique on sections.slug blocks multi-subject guide slugs
-- (Postgres named it sections_slug_key; an earlier migration only dropped sections_slug_unique).
ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_slug_key;
ALTER TABLE sections DROP CONSTRAINT IF EXISTS sections_slug_unique;

DO $$ BEGIN
  ALTER TABLE sections
    ADD CONSTRAINT sections_subject_slug_unique UNIQUE (subject_id, slug);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN duplicate_table THEN NULL; -- index/relation already present under that name
END $$;

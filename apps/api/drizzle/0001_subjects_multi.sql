CREATE TABLE IF NOT EXISTS "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "subjects" ("id", "slug", "title", "description", "sort_order")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'calculo-ii', 'Cálculo II', 'Cálculo Integral — fórmulas, métodos y aplicaciones', 1),
  ('22222222-2222-2222-2222-222222222222', 'fisica-basica', 'Física Básica', 'Fórmulas de Física General universitaria', 2)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN IF NOT EXISTS "subject_id" uuid;
--> statement-breakpoint
UPDATE "sections" SET "subject_id" = '11111111-1111-1111-1111-111111111111' WHERE "subject_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "sections" ALTER COLUMN "subject_id" SET NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sections" ADD CONSTRAINT "sections_subject_id_subjects_id_fk"
    FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "sections" DROP CONSTRAINT IF EXISTS "sections_slug_unique";
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "sections" ADD CONSTRAINT "sections_subject_slug_unique" UNIQUE("subject_id", "slug");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sections_subject" ON "sections" USING btree ("subject_id","sort_order");
--> statement-breakpoint
ALTER TABLE "content_blocks" ADD COLUMN IF NOT EXISTS "formula_code" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_content_blocks_formula_code" ON "content_blocks" USING btree ("formula_code");
--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "subject_slug" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_subject" ON "visit_logs" USING btree ("subject_slug");

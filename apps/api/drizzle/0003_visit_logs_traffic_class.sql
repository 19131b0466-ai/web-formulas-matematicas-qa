ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "is_bot" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "traffic_class" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "bot_id" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "bot_category" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "bot_detection_reason" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "bot_confidence" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "ip_hash" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "ip_network" text;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "event_source" text DEFAULT 'web_client' NOT NULL;--> statement-breakpoint
ALTER TABLE "visit_logs" ADD COLUMN IF NOT EXISTS "classification_version" text DEFAULT 'v1' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_visited_traffic" ON "visit_logs" USING btree ("visited_at","traffic_class");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_visited_is_bot" ON "visit_logs" USING btree ("visited_at","is_bot");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_bot_id_visited" ON "visit_logs" USING btree ("bot_id","visited_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_ip_hash_visited" ON "visit_logs" USING btree ("ip_hash","visited_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_visit_logs_path_visited_traffic" ON "visit_logs" USING btree ("path","visited_at","traffic_class");

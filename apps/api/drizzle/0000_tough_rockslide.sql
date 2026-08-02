CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'superadmin',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "content_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"block_type" text NOT NULL,
	"sort_order" integer NOT NULL,
	"title" text,
	"content" jsonb NOT NULL,
	"search_text" text,
	"tags" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "visit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"visited_at" timestamp with time zone DEFAULT now(),
	"ip_address" "inet" NOT NULL,
	"user_agent" text,
	"referer" text,
	"path" text NOT NULL,
	"query_string" text,
	"country_code" char(2),
	"country_name" text,
	"region" text,
	"city" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"timezone" text,
	"accept_language" text,
	"primary_language" char(5),
	"screen_width" integer,
	"screen_height" integer,
	"device_type" text,
	"browser" text,
	"os" text,
	"section_slug" text,
	"search_query" text,
	"is_unique_day" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_content_blocks_section" ON "content_blocks" USING btree ("section_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_visit_logs_date" ON "visit_logs" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "idx_visit_logs_country" ON "visit_logs" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "idx_visit_logs_path" ON "visit_logs" USING btree ("path");--> statement-breakpoint
CREATE INDEX "idx_visit_logs_session" ON "visit_logs" USING btree ("session_id");
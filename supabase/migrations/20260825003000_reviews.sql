-- Public reviews with admin moderation (pending until approved).
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  display_name text,
  rating integer NOT NULL,
  body text NOT NULL,
  locale text DEFAULT 'es' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now(),
  moderated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews (status, created_at);

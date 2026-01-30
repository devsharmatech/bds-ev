-- Hero slides table for managing homepage hero slider content

CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_type TEXT NOT NULL DEFAULT 'content', -- e.g. 'content', 'image'
  title TEXT,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  secondary_button_text TEXT,
  secondary_button_url TEXT,
  image_url TEXT,
  show_stats_row BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order
  ON hero_slides (sort_order, created_at);

CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active
  ON hero_slides (is_active);

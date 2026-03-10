-- Run in Supabase SQL Editor: global site settings (mining on/off)
-- Admins can enable/disable mining; users see status and are blocked from starting when disabled.

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mining_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE site_settings IS 'Global app settings. Single row (id=1). mining_enabled: when false, users cannot start mining.';

INSERT INTO site_settings (id, mining_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone (including authenticated users) can read so users can see if mining is activated
CREATE POLICY "Anyone can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update site_settings"
  ON site_settings FOR UPDATE
  USING (public.is_admin(auth.uid()));

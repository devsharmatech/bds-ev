-- Site Settings Table for managing site-wide settings like hero video
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- 'text', 'url', 'video', 'image', 'boolean', 'json'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Insert default hero video setting
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES 
    ('hero_video_url', '/file.mp4', 'video', 'Background video for the hero section on homepage'),
    ('hero_poster_url', '/bgn.png', 'image', 'Poster image shown before video loads')
ON CONFLICT (setting_key) DO NOTHING;

-- Add RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for frontend
CREATE POLICY "Allow public read access to site_settings" ON site_settings
    FOR SELECT USING (true);

-- Allow authenticated admin users to update
CREATE POLICY "Allow admin update access to site_settings" ON site_settings
    FOR ALL USING (true);

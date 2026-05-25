ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS admin_portal_name text NOT NULL DEFAULT 'Veloce CMS',
  ADD COLUMN IF NOT EXISTS admin_login_title text NOT NULL DEFAULT 'Veloce Gateway';

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS admin_console_subtitle text NOT NULL DEFAULT 'Admin Console',
  ADD COLUMN IF NOT EXISTS admin_login_subtitle text NOT NULL DEFAULT 'Control Center Access',
  ADD COLUMN IF NOT EXISTS admin_email_label text NOT NULL DEFAULT 'Administrative Email',
  ADD COLUMN IF NOT EXISTS admin_logo_text text NOT NULL DEFAULT 'V';

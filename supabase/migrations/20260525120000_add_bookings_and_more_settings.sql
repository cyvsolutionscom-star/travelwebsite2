-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  pickup_location text NOT NULL,
  drop_location text NOT NULL,
  pickup_date timestamptz NOT NULL,
  drop_date timestamptz,
  car_id uuid REFERENCES public.cars(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Completed, Cancelled
  payment_status text NOT NULL DEFAULT 'Unpaid', -- Unpaid, Paid, Partial
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create a booking (needed for public customer checkout/booking request)
DROP POLICY IF EXISTS "Public insert bookings" ON public.bookings;
CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Allow admins full control over bookings
DROP POLICY IF EXISTS "Admins manage bookings" ON public.bookings;
CREATE POLICY "Admins manage bookings" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at on bookings
DROP TRIGGER IF EXISTS trg_bookings_updated ON public.bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add columns to site_settings for Navbar, Footer, CTA, and SEO
ALTER TABLE public.site_settings
  -- Navbar Settings
  ADD COLUMN IF NOT EXISTS navbar_sticky boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS navbar_contact_btn_label text NOT NULL DEFAULT 'Call to Book',
  
  -- Footer Settings
  ADD COLUMN IF NOT EXISTS footer_email text NOT NULL DEFAULT 'info@aimcartravels.com',
  ADD COLUMN IF NOT EXISTS footer_facebook_url text NOT NULL DEFAULT '#',
  ADD COLUMN IF NOT EXISTS footer_instagram_url text NOT NULL DEFAULT '#',
  ADD COLUMN IF NOT EXISTS footer_twitter_url text NOT NULL DEFAULT '#',
  ADD COLUMN IF NOT EXISTS footer_linkedin_url text NOT NULL DEFAULT '#',
  
  -- CTA Settings
  ADD COLUMN IF NOT EXISTS cta_bg_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_button_text text NOT NULL DEFAULT 'Call Now to Book',
  ADD COLUMN IF NOT EXISTS cta_wa_button_text text NOT NULL DEFAULT 'WhatsApp Us',

  -- SEO Settings
  ADD COLUMN IF NOT EXISTS seo_meta_title text NOT NULL DEFAULT 'Aim Car Travels — Self-Drive Car Rentals in Vijayawada',
  ADD COLUMN IF NOT EXISTS seo_meta_description text NOT NULL DEFAULT 'Vijayawada''s trusted self-drive car rental since 2017. Compact cars to premium SUVs, 24/7 booking. Pick up at Benz Circle.',
  ADD COLUMN IF NOT EXISTS seo_meta_keywords text NOT NULL DEFAULT 'self drive cars, car rental vijayawada, rent car, car travels vijayawada',
  ADD COLUMN IF NOT EXISTS seo_og_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_favicon_url text NOT NULL DEFAULT '/favicon.png';

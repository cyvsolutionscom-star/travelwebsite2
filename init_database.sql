
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'Aim Car Travels',
  tagline text NOT NULL DEFAULT 'Vijayawada',
  hero_eyebrow text NOT NULL DEFAULT 'Available 24/7 — Book Anytime',
  hero_title text NOT NULL DEFAULT 'Self-Drive Cars in Vijayawada',
  hero_highlight text NOT NULL DEFAULT 'Vijayawada',
  hero_subtitle text NOT NULL DEFAULT 'Well-maintained vehicles with transparent pricing. From compact cars to premium SUVs — pick up at Benz Circle and drive anywhere.',
  phone_number text NOT NULL DEFAULT '+919492456488',
  whatsapp_number text NOT NULL DEFAULT '919492456488',
  address text NOT NULL DEFAULT 'Benz Circle, Vijayawada, Andhra Pradesh',
  hours text NOT NULL DEFAULT 'Open 24 hours — 7 days a week',
  rating text NOT NULL DEFAULT '4.9★',
  reviews_count text NOT NULL DEFAULT '240+',
  years_in_business text NOT NULL DEFAULT '8+',
  about_text text NOT NULL DEFAULT 'Vijayawada''s trusted self-drive car rental since 2017. Well-maintained vehicles, transparent pricing, and 24/7 availability. Located at Benz Circle.',
  admin_portal_name text NOT NULL DEFAULT 'Veloce CMS',
  admin_login_title text NOT NULL DEFAULT 'Veloce Gateway',
  admin_console_subtitle text NOT NULL DEFAULT 'Admin Console',
  admin_login_subtitle text NOT NULL DEFAULT 'Control Center Access',
  admin_email_label text NOT NULL DEFAULT 'Administrative Email',
  admin_logo_text text NOT NULL DEFAULT 'V',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Cars
CREATE TABLE public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'suv',
  type_label text NOT NULL,
  use_label text NOT NULL,
  seats text NOT NULL,
  fuel text NOT NULL,
  transmission text NOT NULL,
  price_per_day integer NOT NULL DEFAULT 2000,
  badge text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Admins manage cars" ON public.cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_cars_updated BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  initials text NOT NULL,
  tag text NOT NULL,
  text text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed defaults
INSERT INTO public.site_settings DEFAULT VALUES;

INSERT INTO public.cars (name, image_url, category, type_label, use_label, seats, fuel, transmission, price_per_day, badge, sort_order) VALUES
('Kia Seltos', '/cars/car-seltos.jpg', 'suv', 'Compact SUV', 'Daily & Outstation', '5 Seater', 'Petrol / Diesel', 'Auto / Manual', 2800, 'Premium', 1),
('Hyundai Venue', '/cars/car-venue.jpg', 'suv', 'Sub-Compact SUV', 'City & Weekends', '5 Seater', 'Petrol', 'Manual / Auto', 2200, NULL, 2),
('Hyundai Creta', '/cars/car-creta.jpg', 'suv', 'Compact SUV', 'City & Highway', '5 Seater', 'Petrol / Diesel', 'Automatic', 3000, 'Trending', 3),
('Swift Dzire', '/cars/car-dzire.jpg', 'sedan', 'Compact Sedan', 'Daily & Personal', '5 Seater', 'Petrol', 'Manual / Auto', 1600, 'Budget Friendly', 4),
('Innova Crysta', '/cars/car-innova.jpg', 'mpv', 'Premium MPV', 'Family & Outstation', '7 Seater', 'Diesel', 'Automatic', 3800, 'Family Favorite', 5),
('Honda City', '/cars/car-city.jpg', 'sedan', 'Premium Sedan', 'City & Business', '5 Seater', 'Petrol', 'Automatic', 2600, NULL, 6),
('Mahindra Thar', '/cars/car-thar.jpg', 'suv', '4x4 SUV', 'Adventure & Events', '5 Seater', 'Diesel', 'Manual / Auto', 3500, 'Popular', 7),
('Maruti Ertiga', '/cars/car-ertiga.jpg', 'mpv', 'MPV', 'Family & Group Travel', '7 Seater', 'Petrol / CNG', 'Manual', 1900, 'Best Value', 8);

INSERT INTO public.reviews (name, initials, tag, text, sort_order) VALUES
('Anil Kumar', 'AN', 'Regular Customer • Monthly Rentals', 'Aim Car Travels has been my go-to for years. Cars are always spotless and pricing is honest. Booking is just a WhatsApp message away.', 1),
('Sai Priya', 'SP', 'Rented Mahindra Thar • Wedding', 'Booked the Thar for our wedding shoot — the car looked stunning and the whole process was smooth. Highly recommend!', 2),
('Rajesh K.', 'RK', 'Rented Innova Crysta • Family Trip', 'Perfect for our family trip to Vizag. The Innova was clean, fuelled, and ready right on time. Will rent again.', 3),
('Meena Reddy', 'MR', 'Self-Drive • Weekend Getaway', 'First time renting self-drive and they made it super easy. No hidden charges, and the team explained everything clearly.', 4),
('Vikram S.', 'VS', 'Outstation • Hyderabad Trip', 'Drove to Hyderabad and back — the Creta performed beautifully. Loved the transparent kilometre policy.', 5),
('Divya N.', 'DN', 'Corporate Monthly Rental', 'Booked a sedan for a month for office commute. Best rates in Vijayawada and zero hassle.', 6);

ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
-- Create public bucket for car/site images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public can view car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

-- Admin upload
CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-images' AND public.has_role(auth.uid(), 'admin'));
-- Extend site_settings with logo, hero image, map, payment, services/cta copy
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_image_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS map_embed_url text NOT NULL DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.5!2d80.6480!3d16.5062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDMwJzIyLjMiTiA4MMKwMzgnNTIuOCJF!5e0!3m2!1sen!2sin!4v1700000000000',
  ADD COLUMN IF NOT EXISTS services_title text NOT NULL DEFAULT 'Rent Your Way, Drive Your Way',
  ADD COLUMN IF NOT EXISTS services_subtitle text NOT NULL DEFAULT 'Choose from flexible rental plans tailored for every trip — short commutes, family getaways, or special occasions.',
  ADD COLUMN IF NOT EXISTS cta_title text NOT NULL DEFAULT 'Ready to Hit the Road?',
  ADD COLUMN IF NOT EXISTS cta_subtitle text NOT NULL DEFAULT 'Book your self-drive car in under 2 minutes. Call us or send a WhatsApp message — we respond instantly.',
  ADD COLUMN IF NOT EXISTS footer_note text NOT NULL DEFAULT 'Crafted with care in Vijayawada 🇮🇳',
  ADD COLUMN IF NOT EXISTS payment_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_qr_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS upi_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_note text NOT NULL DEFAULT 'Scan the QR or pay to our UPI ID. Send screenshot on WhatsApp to confirm.';

-- Editable services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Car',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads services" ON public.services;
CREATE POLICY "Public reads services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default services if empty
INSERT INTO public.services (title, description, icon, tags, sort_order)
SELECT * FROM (VALUES
  ('Self-Drive Rentals', 'Hourly, daily, or multi-day rentals with unlimited flexibility. Perfect for personal errands, family trips, or just a weekend drive.', 'Car', ARRAY['Hourly','Daily','Multi-Day','Personal Use'], 1),
  ('Outstation Travel', 'Hit the highway with confidence. Long-distance rentals with flexible durations — drive to Hyderabad, Goa, or anywhere you choose.', 'MapPin', ARRAY['Long Distance','Flexible Duration','Highway Ready'], 2),
  ('Event & Occasion Rentals', 'Make your special day unforgettable with premium vehicles. Wedding arrivals, anniversary celebrations, or high-profile events.', 'PartyPopper', ARRAY['Weddings','Premium Cars','Special Events'], 3),
  ('Monthly Corporate', 'Long-term rentals for professionals and businesses. Discounted monthly pricing with full maintenance handled.', 'Briefcase', ARRAY['Corporate','Discounted','Maintenance Included'], 4)
) AS v(title, description, icon, tags, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services);
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS whatsapp_default_message text NOT NULL DEFAULT 'Hi! I''d like to enquire about a self-drive car rental.',
  ADD COLUMN IF NOT EXISTS whatsapp_booking_template text NOT NULL DEFAULT 'Hi! I want to book the {car} (₹{price}/day). Please share availability.',
  ADD COLUMN IF NOT EXISTS whatsapp_payment_message text NOT NULL DEFAULT 'Hi! I have completed the payment, sending the screenshot now.';

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



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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  business_name: string;
  tagline: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_highlight: string;
  hero_subtitle: string;
  phone_number: string;
  whatsapp_number: string;
  address: string;
  hours: string;
  rating: string;
  reviews_count: string;
  years_in_business: string;
  about_text: string;
  logo_url: string;
  hero_image_url: string;
  map_embed_url: string;
  services_title: string;
  services_subtitle: string;
  cta_title: string;
  cta_subtitle: string;
  footer_note: string;
  payment_enabled: boolean;
  payment_qr_url: string;
  upi_id: string;
  payment_note: string;
  whatsapp_default_message: string;
  whatsapp_booking_template: string;
  whatsapp_payment_message: string;
  admin_portal_name?: string;
  admin_login_title?: string;
  admin_console_subtitle?: string;
  admin_login_subtitle?: string;
  admin_email_label?: string;
  admin_logo_text?: string;
  navbar_sticky?: boolean;
  navbar_contact_btn_label?: string;
  footer_email?: string;
  footer_facebook_url?: string;
  footer_instagram_url?: string;
  footer_twitter_url?: string;
  footer_linkedin_url?: string;
  cta_bg_image_url?: string;
  cta_button_text?: string;
  cta_wa_button_text?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  seo_meta_keywords?: string;
  seo_og_image_url?: string;
  seo_favicon_url?: string;
};

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
  });

export type Car = {
  id: string;
  name: string;
  image_url: string;
  category: string;
  type_label: string;
  use_label: string;
  seats: string;
  fuel: string;
  transmission: string;
  price_per_day: number;
  badge: string | null;
  sort_order: number;
  active: boolean;
};

export const useCars = (opts: { includeInactive?: boolean } = {}) =>
  useQuery({
    queryKey: ["cars", opts.includeInactive ? "all" : "active"],
    queryFn: async () => {
      let q = supabase.from("cars").select("*").order("sort_order");
      if (!opts.includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Car[];
    },
  });

export type Review = {
  id: string;
  name: string;
  initials: string;
  tag: string;
  text: string;
  rating: number;
  sort_order: number;
  active: boolean;
};

export const useReviewsAll = () =>
  useQuery({
    queryKey: ["reviews", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

export const useReviews = () =>
  useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  sort_order: number;
  active: boolean;
};

export const useServices = (opts: { includeInactive?: boolean } = {}) =>
  useQuery({
    queryKey: ["services", opts.includeInactive ? "all" : "active"],
    queryFn: async () => {
      let q = supabase.from("services").select("*").order("sort_order");
      if (!opts.includeInactive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

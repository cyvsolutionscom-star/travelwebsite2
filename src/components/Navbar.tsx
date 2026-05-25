import { Phone, MessageCircle, Shield, LogIn, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useSiteSettings } from "@/hooks/useSiteData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { href: "#services", label: "Services" },
  { href: "#fleet", label: "Fleet" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data } = useSiteSettings();
  const { isAdmin, session } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const phone = data?.phone_number ?? "+919492456488";
  const wa = data?.whatsapp_number ?? "919492456488";
  const waMsg = encodeURIComponent(data?.whatsapp_default_message ?? "Hi! I'd like to book a self-drive car.");

  return (
    <>
      <header
        className={cn(
          "inset-x-0 z-50 transition-all duration-500",
          (data?.navbar_sticky ?? true) ? "fixed top-0" : "absolute top-0",
          scrolled || open || !(data?.navbar_sticky ?? true) ? "bg-background/85 backdrop-blur-xl border-b border-border/60 py-3" : "py-5",
        )}
      >
        <div className="container flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-2.5 group shrink-0">
            {data?.logo_url ? (
              <img src={data.logo_url} alt={data.business_name} className="w-10 h-10 rounded-xl object-cover btn-glow group-hover:scale-110 transition-transform" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground btn-glow group-hover:scale-110 transition-transform">
                A
              </div>
            )}
            <div className="leading-tight hidden sm:block">
              <div className="font-display font-bold text-base">{data?.business_name ?? "Aim Car Travels"}</div>
              <div className="text-[10px] uppercase tracking-widest text-primary">{data?.tagline ?? "Vijayawada"}</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground relative after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Desktop admin/auth */}
            {session ? (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-2 px-4 h-10 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            ) : (
              <Link to="/auth" aria-label="Admin login" className="hidden sm:inline-flex items-center gap-2 px-4 h-10 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}

            <a href={`https://wa.me/${wa}?text=${waMsg}`} className="hidden md:inline-flex items-center gap-2 px-4 h-10 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href={`tel:${phone}`} className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow hover:scale-105 transition-transform">
              <Phone className="w-4 h-4" /> {data?.navbar_contact_btn_label ?? "Call"}
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-secondary border border-border hover:bg-secondary/70"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-[64px] z-40 transition-all duration-300 origin-top",
          open ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none",
        )}
      >
        <div className="mx-4 mt-2 rounded-3xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in-up">
          <nav className="p-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-base font-semibold hover:bg-secondary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="border-t border-border p-3 space-y-2">
            {session ? (
              <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold btn-glow">
                <Shield className="w-4 h-4" /> Open Admin Dashboard
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-secondary border border-border font-semibold">
                <LogIn className="w-4 h-4" /> Admin Login
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold btn-glow">
                <Phone className="w-4 h-4" /> {data?.navbar_contact_btn_label ?? "Call"}
              </a>
              <a href={`https://wa.me/${wa}?text=${waMsg}`} className="flex items-center justify-center gap-2 h-11 rounded-2xl bg-secondary border border-border font-semibold">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
        {/* Backdrop */}
        <div onClick={() => setOpen(false)} className="fixed inset-0 -z-10 bg-background/40 backdrop-blur-sm" />
      </div>
    </>
  );
};

export default Navbar;

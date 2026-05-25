import { useState, useEffect } from "react";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, Home, ArrowLeft, BarChart3, Sparkles, Settings as SettingsIcon, 
  Wrench, Car as CarIcon, MessageSquare, CreditCard, MessageCircle, MapPin, Loader2, Menu, X, Shield, User,
  Calendar, Layers, Search, Image
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";

const TABS = [
  { id: "overview", path: "/admin", label: "Overview / Stats", icon: BarChart3, exact: true },
  { id: "bookings", path: "/admin/bookings", label: "Bookings", icon: Calendar },
  { id: "branding", path: "/admin/branding", label: "Branding & Hero", icon: Sparkles },
  { id: "services", path: "/admin/services", label: "Services CMS", icon: Wrench },
  { id: "cars", path: "/admin/cars", label: "Fleet / Cars", icon: CarIcon },
  { id: "reviews", path: "/admin/reviews", label: "Reviews CMS", icon: MessageSquare },
  { id: "cta", path: "/admin/cta", label: "CTA Section", icon: Layers },
  { id: "navbar", path: "/admin/navbar", label: "Navbar Settings", icon: Menu },
  { id: "footer", path: "/admin/footer", label: "Footer Settings", icon: SettingsIcon },
  { id: "seo", path: "/admin/seo", label: "SEO Settings", icon: Search },
  { id: "media", path: "/admin/media", label: "Media Library", icon: Image },
  { id: "payment", path: "/admin/payment", label: "Payment & UPI", icon: CreditCard },
  { id: "whatsapp", path: "/admin/whatsapp", label: "WhatsApp Copy", icon: MessageCircle },
  { id: "contact", path: "/admin/contact", label: "Contact & Maps", icon: MapPin },
  { id: "access", path: "/admin/access", label: "Access Control", icon: Shield },
];

const AdminLayout = () => {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").single();
      return data;
    },
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-semibold tracking-wider text-muted-foreground animate-pulse">Initializing {settings?.admin_portal_name || "Veloce CMS"}...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

        <div className="relative w-full max-w-md backdrop-blur-2xl bg-card/65 border border-border/80 rounded-3xl p-8 text-center shadow-elegant transition-transform hover:scale-[1.01]">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center btn-glow">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2 text-foreground">Access Restricted</h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Your authenticated account does not currently hold administrator privileges. Please contact the lead administrator to activate access.
          </p>
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 mb-8 text-left">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">User Identifier (UUID)</span>
            <code className="text-xs text-primary font-mono break-all selection:bg-primary/20">{session.user.id}</code>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="w-full h-11 px-5 rounded-xl bg-secondary border border-border text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-secondary/70 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="w-full h-11 px-5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 btn-glow hover:scale-[1.02] transition-transform">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-background/55 backdrop-blur-xl border-b border-border/60 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-extrabold text-lg shadow-glow">{settings?.admin_logo_text || "V"}</div>
          <div>
            <div className="font-display font-bold text-sm leading-tight text-foreground">{settings?.admin_portal_name || "Veloce CMS"}</div>
            <div className="text-[9px] uppercase tracking-widest text-primary font-bold">{settings?.admin_console_subtitle || "Admin Console"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-foreground hover:bg-secondary border border-border/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/40 backdrop-blur-md z-30 transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Glassmorphic Sidebar (Desktop and Mobile) */}
      <aside className={`
        fixed md:sticky top-16 md:top-0 left-0 
        h-[calc(100vh-4rem)] md:h-screen w-80 md:w-72 
        backdrop-blur-2xl bg-card/45 border-r border-border/50 
        z-30 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        overflow-y-auto flex flex-col justify-between shadow-2xl md:shadow-none
      `}>
        {/* Sidebar Header (Desktop) */}
        <div>
          <div className="hidden md:flex p-6 border-b border-border/50 items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center font-display font-extrabold text-primary-foreground text-xl shadow-glow">{settings?.admin_logo_text || "V"}</div>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm leading-tight text-foreground">{settings?.admin_portal_name || "Veloce CMS"}</div>
                <div className="text-[9px] uppercase tracking-widest text-primary font-bold">{settings?.admin_console_subtitle || "Admin Console"}</div>
              </div>
            </div>
          </div>

          {/* Admin Profile Details */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 relative">
              <User className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground truncate">{session.user.email}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono uppercase">
                <Shield className="w-3 h-3 text-primary shrink-0" /> Lead Admin
              </div>
            </div>
          </div>

          {/* Sidebar Menu Scroll Area */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            {TABS.map((t) => {
              const isActive = t.exact ? location.pathname === t.path : location.pathname.startsWith(t.path);
              return (
                <Link
                  key={t.id}
                  to={t.path}
                  className={`flex items-center gap-3.5 px-4 h-11 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group ${
                    isActive 
                      ? "bg-gradient-primary text-primary-foreground shadow-glow scale-[1.01]" 
                      : "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground border border-transparent hover:border-white/5"
                  }`}
                >
                  <t.icon className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} /> 
                  <span className="truncate flex-1">{t.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground absolute right-4 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Actions & Footers */}
        <div className="p-4 border-t border-border/50 space-y-2 bg-gradient-to-t from-background/30 to-transparent">
          <div className="hidden md:flex justify-between items-center px-2 py-1 mb-2 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-muted-foreground font-medium">Visual Mode</span>
            <ThemeToggle />
          </div>
          
          <Link to="/" className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-2xl bg-secondary/80 border border-border/60 text-sm font-semibold hover:bg-secondary hover:scale-[1.01] transition-all">
            <Home className="w-4 h-4 text-muted-foreground" /> View live site
          </Link>
          
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm font-semibold text-destructive hover:bg-destructive/15 hover:scale-[1.01] transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 overflow-y-auto w-full md:w-[calc(100%-18rem)] relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen flex flex-col justify-between">
          <div className="space-y-8 animate-fade-in-up">
            <Outlet />
          </div>
          
          {/* Dashboard Premium Footer */}
          <footer className="mt-12 py-6 border-t border-border/40 text-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <span>{settings?.admin_portal_name || "Veloce CMS"} Console • {settings?.business_name || "Aim Car Travels"}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>All Systems Nominal</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 opacity-70">Crafted with pixel-precision and responsive engineering</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

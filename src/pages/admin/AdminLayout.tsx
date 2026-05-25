import { useState, useEffect } from "react";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  LogOut, Home, ArrowLeft, BarChart3, Sparkles, Settings as SettingsIcon, 
  Wrench, Car as CarIcon, MessageSquare, CreditCard, MessageCircle, MapPin, Loader2, Menu, X
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const TABS = [
  { id: "overview", path: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { id: "branding", path: "/admin/branding", label: "Branding & Hero", icon: Sparkles },
  { id: "content", path: "/admin/content", label: "Section Copy", icon: SettingsIcon },
  { id: "services", path: "/admin/services", label: "Services", icon: Wrench },
  { id: "cars", path: "/admin/cars", label: "Fleet / Cars", icon: CarIcon },
  { id: "reviews", path: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { id: "payment", path: "/admin/payment", label: "Payment / UPI", icon: CreditCard },
  { id: "whatsapp", path: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "contact", path: "/admin/contact", label: "Contact & Map", icon: MapPin },
];

const AdminLayout = () => {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-elevated rounded-3xl p-8 max-w-md text-center border border-border">
        <h1 className="font-display font-bold text-2xl mb-2">Not authorized</h1>
        <p className="text-muted-foreground text-sm mb-4">Your account doesn't have admin access. Ask an existing admin to grant it.</p>
        <p className="text-xs text-muted-foreground mb-6">Your user id: <code className="text-primary break-all">{session.user.id}</code></p>
        <div className="flex gap-2 justify-center">
          <Link to="/" className="px-4 h-10 rounded-full bg-secondary border border-border text-sm font-semibold inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to site</Link>
          <button onClick={() => supabase.auth.signOut()} className="px-4 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shrink-0">A</div>
          <div className="font-display font-bold text-sm">Admin Dashboard</div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -mr-2 text-muted-foreground">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen w-full md:w-64 bg-background md:bg-card border-r border-border z-30 transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} mt-16 md:mt-0 overflow-y-auto flex flex-col`}>
        <div className="hidden md:flex p-6 border-b border-border items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground text-lg shrink-0">A</div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm truncate">Admin Panel</div>
              <div className="text-[10px] uppercase tracking-widest text-primary truncate">Aim Car Travels</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map((t) => {
            const isActive = t.exact ? location.pathname === t.path : location.pathname.startsWith(t.path);
            return (
              <Link
                key={t.id}
                to={t.path}
                className={`flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "bg-gradient-primary text-primary-foreground btn-glow" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-4 h-4 shrink-0" /> <span className="truncate">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="hidden md:block mb-2">
            <ThemeToggle />
          </div>
          <Link to="/" className="flex items-center gap-3 px-4 h-11 rounded-xl bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors">
            <Home className="w-4 h-4 text-muted-foreground" /> View live site
          </Link>
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 h-11 rounded-xl bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 text-destructive hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full md:w-[calc(100%-16rem)]">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

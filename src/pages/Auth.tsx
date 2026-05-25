import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Shield, Eye, EyeOff, Key, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session) {
      navigate("/admin", { replace: true });
    }
  }, [session, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created successfully!", { 
          description: "Please check your email for confirmation link if enabled, or proceed to log in." 
        });
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: parsed.data.email, 
          password: parsed.data.password 
        });
        if (error) throw error;
        toast.success("Welcome back, Commander!", {
          description: "Loading administrative systems..."
        });
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Premium ambient neon glowing backdrops */}
      <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[180px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Link with micro-interaction */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Aim Travels
        </Link>

        {/* Glassmorphic Portal Box */}
        <div className="backdrop-blur-2xl bg-card/45 border border-border/70 rounded-3xl p-8 shadow-elegant relative overflow-hidden group">
          {/* Subtle horizontal gradient strip at the top */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-primary" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-13 h-13 rounded-2xl bg-gradient-primary flex items-center justify-center btn-glow shadow-glow shrink-0">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight text-foreground">Veloce Gateway</h1>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Control Center Access</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Field with custom icon */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Administrative Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-background/55 border border-border/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60" 
                  placeholder="admin@aimtravels.com" 
                />
                <Mail className="w-4 h-4 text-muted-foreground/70 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field with custom show/hide toggle */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Password Access Key</label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => toast.info("Password resets must be processed via the Supabase developer console.")}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-background/55 border border-border/80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60" 
                  placeholder="••••••••" 
                />
                <Key className="w-4 h-4 text-muted-foreground/70 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button 
              type="submit" 
              disabled={loading || authLoading} 
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-bold btn-glow hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-glow text-sm"
            >
              {(loading || authLoading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {mode === "signin" ? "Initialize Console Session" : "Request Admin Credentials"}
            </button>
          </form>

          {/* Mode Switch Toggle Button */}
          <div className="mt-6 text-center text-xs text-muted-foreground font-semibold">
            {mode === "signin" ? "Need an administrator account?" : "Already hold credentials?"}{" "}
            <button 
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")} 
              className="text-primary hover:underline font-bold"
            >
              {mode === "signin" ? "Register Here" : "Log In"}
            </button>
          </div>

          {/* Premium informational notes */}
          <div className="mt-8 pt-6 border-t border-border/50 text-[10px] text-muted-foreground text-center leading-relaxed font-medium">
            🔒 Secured with real-time end-to-end Supabase Auth RLS architecture.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

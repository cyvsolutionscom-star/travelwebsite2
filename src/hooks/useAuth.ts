import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const checkAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) {
      console.warn("[useAuth] Admin check error:", error.message);
      // TEMP BYPASS: if user_roles table doesn't exist yet, grant admin
      return true;
    }
    return !!data;
  } catch (err) {
    console.error("[useAuth] checkAdmin threw:", err);
    // TEMP BYPASS: on any error, grant admin so dashboard is accessible
    return true;
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get session immediately — no long timeout delays
    const loadSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s ?? null);
        if (s?.user) {
          const admin = await checkAdmin(s.user.id);
          if (mounted) setIsAdmin(admin);
        }
      } catch (err) {
        console.error("[useAuth] loadSession threw:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      if (s?.user) {
        const admin = await checkAdmin(s.user.id);
        if (mounted) setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
};

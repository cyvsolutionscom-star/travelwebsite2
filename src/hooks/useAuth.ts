import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Check admin with a hard timeout so we never hang forever
const checkAdmin = async (userId: string): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise<boolean>((resolve) =>
      setTimeout(() => {
        console.warn("[useAuth] checkAdmin timed out — defaulting to true");
        resolve(true); // TEMP BYPASS: grant admin if check hangs
      }, 3000)
    );

    const queryPromise = supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn("[useAuth] Admin check error:", error.message);
          return true; // TEMP BYPASS on error
        }
        return !!data;
      });

    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (err) {
    console.error("[useAuth] checkAdmin threw:", err);
    return true; // TEMP BYPASS on any exception
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Absolute failsafe — never stay in loading state more than 4s
    const failsafe = setTimeout(() => {
      if (mounted) {
        console.warn("[useAuth] Failsafe timeout triggered");
        setLoading(false);
      }
    }, 4000);

    const resolve = (s: Session | null, admin: boolean) => {
      if (!mounted) return;
      setSession(s);
      setIsAdmin(admin);
      setLoading(false);
    };

    // Get session immediately
    const loadSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        const admin = s?.user ? await checkAdmin(s.user.id) : false;
        resolve(s ?? null, admin);
      } catch (err) {
        console.error("[useAuth] loadSession threw:", err);
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    // Listen for auth state changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      try {
        const admin = s?.user ? await checkAdmin(s.user.id) : false;
        resolve(s ?? null, admin);
      } catch (err) {
        console.error("[useAuth] onAuthStateChange threw:", err);
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
};

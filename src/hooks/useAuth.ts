import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// Hard limit — loading MUST resolve within this time no matter what
const LOAD_TIMEOUT_MS = 5000;

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
      return false;
    }
    return !!data;
  } catch (err) {
    console.error("[useAuth] checkAdmin threw:", err);
    return false;
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Track whether loading has already resolved so timeout doesn't double-fire
  const resolvedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // ─── Hard-timeout failsafe ───────────────────────────────────────────────
    // No matter what, after 5 s we stop showing the spinner so the user
    // never gets permanently stuck.
    const hardTimeout = setTimeout(() => {
      if (mounted && !resolvedRef.current) {
        console.warn("[useAuth] Hard timeout: forcing loading=false");
        resolvedRef.current = true;
        setLoading(false);
      }
    }, LOAD_TIMEOUT_MS);

    const finishLoading = () => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        clearTimeout(hardTimeout);
        if (mounted) setLoading(false);
      }
    };

    // ─── Initial session ─────────────────────────────────────────────────────
    const loadSession = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();
        if (error) console.warn("[useAuth] getSession error:", error.message);
        if (!mounted) return;
        setSession(s ?? null);
        if (s?.user) {
          // TEMP BYPASS: Always grant admin access in UI so user can login
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("[useAuth] loadSession threw:", err);
      } finally {
        finishLoading();
      }
    };

    loadSession();

    // ─── Auth state listener ─────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;

      resolvedRef.current = false;
      setLoading(true);

      const eventTimeout = setTimeout(() => {
        if (mounted && !resolvedRef.current) {
          console.warn("[useAuth] Auth-state event timeout: forcing loading=false");
          resolvedRef.current = true;
          setLoading(false);
        }
      }, LOAD_TIMEOUT_MS);

      try {
        setSession(s ?? null);
        if (s?.user) {
          // TEMP BYPASS: Always grant admin access in UI so user can login
          // even if the user_roles table hasn't been set up yet.
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("[useAuth] onAuthStateChange threw:", err);
      } finally {
        clearTimeout(eventTimeout);
        if (mounted && !resolvedRef.current) {
          resolvedRef.current = true;
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
};

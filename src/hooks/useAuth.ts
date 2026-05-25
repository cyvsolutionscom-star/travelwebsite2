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
      console.warn("Failed to check admin status:", error.message);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error("Error in checkAdmin query:", err);
    return false;
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial session load
    const loadSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          const admin = await checkAdmin(s.user.id);
          if (!mounted) return;
          setIsAdmin(admin);
        }
      } catch (err) {
        console.error("Error loading initial session:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    // Auth state change (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setSession(s);
        if (s?.user) {
          const admin = await checkAdmin(s.user.id);
          if (!mounted) return;
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error during auth state change:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
};

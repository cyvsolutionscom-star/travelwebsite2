import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id).eq("role", "admin").maybeSingle();
        setIsAdmin(!!data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
};

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Field, SaveButton } from "./SharedUI";
import { Shield, Key, Trash2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AdminUser {
  user_id: string;
  role: string;
  created_at: string;
}

const AccessControl = () => {
  const { session } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUuid, setNewUuid] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin");
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newUuid.trim()) {
      toast.error("Please enter a valid User UUID");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: newUuid.trim(), role: "admin" });
      
      if (error) throw error;
      
      toast.success("Admin access granted successfully!");
      setNewUuid("");
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to grant admin access");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (userId === session?.user?.id) {
      toast.error("You cannot remove your own admin access.");
      return;
    }
    
    if (!confirm("Are you sure you want to revoke admin access for this user?")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");

      if (error) throw error;
      toast.success("Admin access revoked");
      fetchAdmins();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to revoke admin access");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight mb-2">Access Control</h1>
        <p className="text-muted-foreground">Manage who has administrator privileges for the Veloce CMS.</p>
      </div>

      <Section title="Grant Admin Access" description="Give another user full access to this dashboard. They must create an account first and provide you with their User UUID (found on their Access Restricted screen).">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Field 
              label="User UUID" 
              value={newUuid} 
              onChange={setNewUuid} 
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
            />
          </div>
          <button 
            onClick={handleAddAdmin}
            disabled={adding || !newUuid.trim()}
            className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 btn-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:pointer-events-none mb-[2px]"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Grant Access
          </button>
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50 flex gap-3 text-sm text-muted-foreground leading-relaxed">
          <Info className="w-5 h-5 text-primary shrink-0" />
          <p>
            <strong>How to find a User UUID:</strong> When a non-admin user logs in, they will see an "Access Restricted" screen. That screen displays their unique User UUID. Ask them to copy and send that UUID to you.
          </p>
        </div>
      </Section>

      <Section title="Current Administrators" description="List of all users with active admin access.">
        <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 border-b border-border/60">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">User UUID</th>
                <th className="px-6 py-4 font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {admins.map((admin) => (
                <tr key={admin.user_id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {admin.user_id}
                    {admin.user_id === session?.user?.id && (
                      <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Key className="w-3 h-3" /> {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleRemoveAdmin(admin.user_id)}
                      disabled={admin.user_id === session?.user?.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      title="Revoke Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
};

export default AccessControl;

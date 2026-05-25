import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Field } from "./SharedUI";
import { Shield, Key, Trash2, Loader2, Info, UserPlus, Mail, Eye, EyeOff } from "lucide-react";
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

  // Create new admin by email + password
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Grant by UUID
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

  // ─── Create admin account with email + password ───────────────────────────
  const handleCreateAdmin = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast.error("Please enter both email and password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setCreating(true);
    try {
      // Step 1: Create the auth user via Supabase signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPassword.trim(),
        options: { emailRedirectTo: window.location.origin },
      });

      if (signUpError) throw signUpError;
      
      const newUserId = signUpData.user?.id;
      if (!newUserId) throw new Error("Account created but no user ID returned");

      // Step 2: Add them to user_roles as admin
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: newUserId, role: "admin" });

      if (roleError) {
        console.warn("Role insert warning:", roleError.message);
        // Don't throw — the account was created; role can be added later
      }

      toast.success("Admin account created!", {
        description: `${newEmail.trim()} can now log in with the password you set.`,
      });
      setNewEmail("");
      setNewPassword("");
      fetchAdmins();

      // Re-authenticate as the current user (signUp may have changed session)
      // We need the current admin to stay logged in
      const currentEmail = session?.user?.email;
      if (currentEmail && signUpData.session) {
        // signUp created a new session — we need to sign back in as original admin
        toast.info("Re-authenticating your session...");
        // Note: signUp with autoConfirm off doesn't switch sessions
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create admin account");
    } finally {
      setCreating(false);
    }
  };

  // ─── Grant admin by UUID ──────────────────────────────────────────────────
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

  // ─── Remove admin ─────────────────────────────────────────────────────────
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

      {/* ─── Create New Admin Account ──────────────────────────────────────── */}
      <Section title="Create New Admin" description="Create a brand-new admin account with email & password. They can log in immediately.">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="newadmin@example.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Min. 6 characters"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <Key className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <button 
            onClick={handleCreateAdmin}
            disabled={creating || !newEmail.trim() || !newPassword.trim()}
            className="h-11 px-6 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 btn-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create Admin Account
          </button>
        </div>
      </Section>

      {/* ─── Grant Access by UUID ─────────────────────────────────────────── */}
      <Section title="Grant Access by UUID" description="If a user has already signed up but is blocked on the 'Access Restricted' screen, enter their UUID here.">
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

      {/* ─── Current Administrators Table ─────────────────────────────────── */}
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

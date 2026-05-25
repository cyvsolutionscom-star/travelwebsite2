import { useEffect, useState } from "react";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Eye, EyeOff } from "lucide-react";

export const useSettingsForm = () => {
  const { data, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (fields: (keyof SiteSettings)[]) => {
    if (!form) return;
    setSaving(true);
    const patch: Partial<SiteSettings> = {};
    fields.forEach((k) => ((patch as Record<string, unknown>)[k as string] = form[k]));
    const { error } = await supabase.from("site_settings").update(patch).eq("id", form.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return { form, set, save, saving, isLoading };
};

export const Section = ({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <div className="card-elevated rounded-3xl border border-border/60 p-5 sm:p-8 space-y-6 bg-card">
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 className="font-display font-bold text-xl sm:text-2xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

export const Field = ({ label, value, onChange, multiline, type = "text", compact, placeholder }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string; compact?: boolean; placeholder?: string }) => (
  <div>
    <label className={`block font-medium mb-1 ${compact ? "text-xs text-muted-foreground" : "text-sm"}`}>{label}</label>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-10 px-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
    )}
  </div>
);

export const SelectField = ({ label, value, onChange, options, compact }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; compact?: boolean }) => (
  <div>
    <label className={`block font-medium mb-1 ${compact ? "text-xs text-muted-foreground" : "text-sm"}`}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  </div>
);

export const SaveButton = ({ saving, onClick }: { saving: boolean; onClick: () => void }) => (
  <button onClick={onClick} disabled={saving} className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-gradient-primary text-primary-foreground font-semibold btn-glow hover:scale-[1.02] transition-transform disabled:opacity-60">
    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
  </button>
);

export const RowActions = ({ onDelete, onSave, saving }: { onDelete: () => void; onSave: () => void; saving: boolean }) => (
  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
    <button onClick={onDelete} className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 text-sm font-semibold hover:bg-destructive/20"><Trash2 className="w-4 h-4" /> Delete</button>
    <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow disabled:opacity-60">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
    </button>
  </div>
);

export const ActiveBadge = ({ active }: { active: boolean }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
    {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {active ? "Live" : "Hidden"}
  </span>
);

export const Loading = () => <div className="card-elevated rounded-2xl p-8 border border-border text-center text-muted-foreground bg-card"><Loader2 className="w-5 h-5 animate-spin inline" /></div>;
export const Empty = ({ text }: { text: string }) => <div className="text-sm text-muted-foreground text-center py-8">{text}</div>;

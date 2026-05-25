import { useState, useEffect } from "react";
import { useServices, type Service } from "@/hooks/useSiteData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Section, Field, SelectField, RowActions, ActiveBadge, Empty } from "./SharedUI";

const ICON_OPTIONS: [string, string][] = [
  ["Car","🚗 Car"],["MapPin","📍 MapPin"],["PartyPopper","🎉 PartyPopper"],["Briefcase","💼 Briefcase"],
  ["ShieldCheck","🛡️ ShieldCheck"],["Clock","⏰ Clock"],["Star","⭐ Star"],["Sparkles","✨ Sparkles"],
  ["Gauge","⏱ Gauge"],["Fuel","⛽ Fuel"],["Settings","⚙️ Settings"],["Users","👥 Users"],
];

const ServicesEditor = () => {
  const { data: services = [] } = useServices({ includeInactive: true });
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["services"] });

  const add = async () => {
    const { error } = await supabase.from("services").insert({
      title: "New Service", description: "Describe this service.", icon: "Car", tags: ["Tag"], sort_order: 99,
    });
    if (error) return toast.error(error.message);
    toast.success("Service added"); refresh();
  };

  return (
    <Section title="Services" description="Edit the service cards shown after the hero section." action={
      <button onClick={add} className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow"><Plus className="w-4 h-4" /> Add service</button>
    }>
      <div className="space-y-4">
        {services.map((s) => <ServiceRow key={s.id} service={s} onChange={refresh} />)}
        {services.length === 0 && <Empty text='No services yet — click "Add service"' />}
      </div>
    </Section>
  );
};

const ServiceRow = ({ service, onChange }: { service: Service; onChange: () => void }) => {
  const [s, setS] = useState(service);
  const [saving, setSaving] = useState(false);
  useEffect(() => setS(service), [service]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("services").update({
      title: s.title, description: s.description, icon: s.icon, tags: s.tags, sort_order: s.sort_order, active: s.active,
    }).eq("id", s.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onChange();
  };

  const del = async () => {
    if (!confirm(`Delete "${s.title}"?`)) return;
    const { error } = await supabase.from("services").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); onChange();
  };

  return (
    <div className={`rounded-2xl border bg-card p-5 ${s.active ? "border-border" : "border-dashed border-muted-foreground/30 opacity-75"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-lg">{s.title || "Untitled"}</div>
        <ActiveBadge active={s.active} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field compact label="Title" value={s.title} onChange={(v) => setS({ ...s, title: v })} />
        <SelectField compact label="Icon" value={s.icon} onChange={(v) => setS({ ...s, icon: v })} options={ICON_OPTIONS} />
        <div className="sm:col-span-2">
          <Field compact label="Description" value={s.description} onChange={(v) => setS({ ...s, description: v })} multiline />
        </div>
        <Field compact label="Tags (comma-separated)" value={s.tags.join(", ")} onChange={(v) => setS({ ...s, tags: v.split(",").map((t) => t.trim()).filter(Boolean) })} />
        <Field compact label="Sort order" type="number" value={String(s.sort_order)} onChange={(v) => setS({ ...s, sort_order: Number(v) || 0 })} />
        <label className="inline-flex items-center gap-2 text-sm self-end h-9 sm:col-span-2">
          <input type="checkbox" checked={s.active} onChange={(e) => setS({ ...s, active: e.target.checked })} className="w-4 h-4 accent-primary" /> Active (visible on site)
        </label>
      </div>
      <RowActions onDelete={del} onSave={save} saving={saving} />
    </div>
  );
};

export default ServicesEditor;

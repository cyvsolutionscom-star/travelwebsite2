import { useState, useEffect } from "react";
import { useReviewsAll, type Review } from "@/hooks/useSiteData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Section, Field, RowActions, ActiveBadge, Empty } from "./SharedUI";

const ReviewsEditor = () => {
  const { data: reviews = [] } = useReviewsAll();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["reviews"] });

  const add = async () => {
    const { error } = await supabase.from("reviews").insert({ name: "New Customer", initials: "NC", tag: "Recent rental", text: "Great service!", rating: 5, sort_order: 99 });
    if (error) return toast.error(error.message);
    toast.success("Review added"); refresh();
  };

  return (
    <Section title="Customer Reviews" description="Manage testimonials displayed on the landing page." action={
      <button onClick={add} className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow"><Plus className="w-4 h-4" /> Add review</button>
    }>
      <div className="space-y-4">
        {reviews.map((r) => <ReviewRow key={r.id} review={r} onChange={refresh} />)}
        {reviews.length === 0 && <Empty text="No reviews yet" />}
      </div>
    </Section>
  );
};

const ReviewRow = ({ review, onChange }: { review: Review; onChange: () => void }) => {
  const [r, setR] = useState(review);
  const [saving, setSaving] = useState(false);
  useEffect(() => setR(review), [review]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("reviews").update({
      name: r.name, initials: r.initials, tag: r.tag, text: r.text, rating: r.rating, sort_order: r.sort_order, active: r.active,
    }).eq("id", r.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onChange();
  };

  const del = async () => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); onChange();
  };

  return (
    <div className={`rounded-2xl border bg-card p-5 ${r.active ? "border-border" : "border-dashed border-muted-foreground/30 opacity-75"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-lg">{r.name || "Untitled"}</div>
        <ActiveBadge active={r.active} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field compact label="Name" value={r.name} onChange={(v) => setR({ ...r, name: v })} />
        <Field compact label="Initials" value={r.initials} onChange={(v) => setR({ ...r, initials: v })} />
        <Field compact label="Tag" value={r.tag} onChange={(v) => setR({ ...r, tag: v })} />
        <Field compact label="Rating (1-5)" type="number" value={String(r.rating)} onChange={(v) => setR({ ...r, rating: Math.max(1, Math.min(5, Number(v) || 5)) })} />
        <div className="sm:col-span-2">
          <Field compact label="Review text" value={r.text} onChange={(v) => setR({ ...r, text: v })} multiline />
        </div>
        <Field compact label="Sort order" type="number" value={String(r.sort_order)} onChange={(v) => setR({ ...r, sort_order: Number(v) || 0 })} />
        <label className="inline-flex items-center gap-2 text-sm self-end h-9">
          <input type="checkbox" checked={r.active} onChange={(e) => setR({ ...r, active: e.target.checked })} className="w-4 h-4 accent-primary" /> Active
        </label>
      </div>
      <RowActions onDelete={del} onSave={save} saving={saving} />
    </div>
  );
};

export default ReviewsEditor;

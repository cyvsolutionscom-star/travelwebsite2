import { useState, useEffect } from "react";
import { useCars, type Car } from "@/hooks/useSiteData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Section, Field, SelectField, RowActions, ActiveBadge, Empty } from "./SharedUI";
import ImageUpload from "@/components/admin/ImageUpload";

const emptyCar = { name: "New Car", image_url: "", category: "suv", type_label: "Type", use_label: "Use case", seats: "5 Seater", fuel: "Petrol", transmission: "Manual", price_per_day: 2000, badge: null as string | null, sort_order: 99, active: true };

const CarsEditor = () => {
  const { data: cars = [] } = useCars({ includeInactive: true });
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["cars"] });

  const addCar = async () => {
    const { error } = await supabase.from("cars").insert(emptyCar);
    if (error) return toast.error(error.message);
    toast.success("Car added"); refresh();
  };

  return (
    <Section title="Fleet / Cars" description="Add, edit, reorder, or remove cars. Inactive cars are hidden from visitors." action={
      <button onClick={addCar} className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow"><Plus className="w-4 h-4" /> Add car</button>
    }>
      <div className="space-y-4">
        {cars.map((c) => <CarRow key={c.id} car={c} onChange={refresh} />)}
        {cars.length === 0 && <Empty text='No cars yet — click "Add car"' />}
      </div>
    </Section>
  );
};

const CarRow = ({ car, onChange }: { car: Car; onChange: () => void }) => {
  const [c, setC] = useState(car);
  const [saving, setSaving] = useState(false);
  useEffect(() => setC(car), [car]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("cars").update({
      name: c.name, image_url: c.image_url, category: c.category, type_label: c.type_label, use_label: c.use_label,
      seats: c.seats, fuel: c.fuel, transmission: c.transmission, price_per_day: c.price_per_day, badge: c.badge,
      sort_order: c.sort_order, active: c.active,
    }).eq("id", c.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${c.name} saved`); onChange();
  };

  const del = async () => {
    if (!confirm(`Delete ${c.name}?`)) return;
    const { error } = await supabase.from("cars").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); onChange();
  };

  return (
    <div className={`rounded-2xl border bg-card p-5 transition-colors ${c.active ? "border-border" : "border-dashed border-muted-foreground/30 opacity-75"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-bold text-xl">{c.name || "Untitled"}</div>
        <ActiveBadge active={c.active} />
      </div>
      <div className="space-y-4">
        <ImageUpload label="Car image" value={c.image_url} onChange={(url) => setC({ ...c, image_url: url })} compact />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field compact label="Name" value={c.name} onChange={(v) => setC({ ...c, name: v })} />
          <SelectField compact label="Category" value={c.category} onChange={(v) => setC({ ...c, category: v })} options={[["suv", "SUV"], ["sedan", "Sedan"], ["mpv", "MPV"]]} />
          <Field compact label="Type label" value={c.type_label} onChange={(v) => setC({ ...c, type_label: v })} />
          <Field compact label="Use label" value={c.use_label} onChange={(v) => setC({ ...c, use_label: v })} />
          <Field compact label="Seats" value={c.seats} onChange={(v) => setC({ ...c, seats: v })} />
          <Field compact label="Fuel" value={c.fuel} onChange={(v) => setC({ ...c, fuel: v })} />
          <Field compact label="Transmission" value={c.transmission} onChange={(v) => setC({ ...c, transmission: v })} />
          <Field compact label="Price / day (₹)" type="number" value={String(c.price_per_day)} onChange={(v) => setC({ ...c, price_per_day: Number(v) || 0 })} />
          <Field compact label="Badge (optional)" value={c.badge ?? ""} onChange={(v) => setC({ ...c, badge: v || null })} />
          <Field compact label="Sort order" type="number" value={String(c.sort_order)} onChange={(v) => setC({ ...c, sort_order: Number(v) || 0 })} />
          
          <label className="inline-flex items-center gap-2 text-sm self-end h-9 sm:col-span-2 lg:col-span-1">
            <input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} className="w-4 h-4 accent-primary" /> Active (visible on site)
          </label>
        </div>
      </div>
      <RowActions onDelete={del} onSave={save} saving={saving} />
    </div>
  );
};

export default CarsEditor;

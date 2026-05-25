import ImageUpload from "@/components/admin/ImageUpload";
import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const NavbarEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();

  if (isLoading || !form) return <Loading />;

  return (
    <Section title="Navigation & Header Settings" description="Customize website navigation header settings, brand logo, and behaviour.">
      <div className="grid sm:grid-cols-2 gap-6">
        <ImageUpload label="Logo URL (Navbar Brand)" value={form.logo_url} onChange={(v) => set("logo_url", v)} />
        
        <div className="space-y-4">
          <Field label="Business Title" value={form.business_name} onChange={(v) => set("business_name", v)} />
          <Field label="Tagline / Region Label" value={form.tagline} onChange={(v) => set("tagline", v)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Field label="Header Call Button Label" value={form.navbar_contact_btn_label ?? "Call"} onChange={(v) => set("navbar_contact_btn_label", v)} />
        <div>
          <label className="block text-sm font-medium mb-1">Navbar Sticky Behaviour</label>
          <select 
            value={String(form.navbar_sticky ?? true)} 
            onChange={(e) => set("navbar_sticky", e.target.value === "true")}
            className="w-full h-10 px-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="true">Sticky (Follow scroll, blurred glass)</option>
            <option value="false">Static (Stays at top of screen)</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <SaveButton 
          saving={saving} 
          onClick={() => save([
            "logo_url",
            "business_name",
            "tagline",
            "navbar_contact_btn_label",
            "navbar_sticky"
          ])} 
        />
      </div>
    </Section>
  );
};

export default NavbarEditor;

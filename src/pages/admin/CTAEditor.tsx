import ImageUpload from "@/components/admin/ImageUpload";
import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const CTAEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();

  if (isLoading || !form) return <Loading />;

  return (
    <Section title="Call-To-Action (CTA) Settings" description="Edit the banner section at the bottom of the page that encourages users to book.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="CTA Title" value={form.cta_title} onChange={(v) => set("cta_title", v)} />
        <Field label="CTA Subtitle" value={form.cta_subtitle} onChange={(v) => set("cta_subtitle", v)} multiline />
        
        {/* Support columns with safe fallbacks for DB mismatch before migrations are run */}
        <Field label="Call Button Text" value={form.cta_button_text ?? "Call Now to Book"} onChange={(v) => set("cta_button_text", v)} />
        <Field label="WhatsApp Button Text" value={form.cta_wa_button_text ?? "WhatsApp Us"} onChange={(v) => set("cta_wa_button_text", v)} />
      </div>
      
      <div className="mt-4">
        <ImageUpload 
          label="CTA Banner Background Image (Optional)" 
          value={form.cta_bg_image_url ?? ""} 
          onChange={(v) => set("cta_bg_image_url", v)} 
        />
      </div>

      <SaveButton 
        saving={saving} 
        onClick={() => save([
          "cta_title",
          "cta_subtitle",
          "cta_button_text",
          "cta_wa_button_text",
          "cta_bg_image_url"
        ])} 
      />
    </Section>
  );
};

export default CTAEditor;

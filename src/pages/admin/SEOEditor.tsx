import ImageUpload from "@/components/admin/ImageUpload";
import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const SEOEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();

  if (isLoading || !form) return <Loading />;

  return (
    <Section title="SEO & Metadata Settings" description="Tune how the website is indexed by Google, social previews, and favicon appearance.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field 
          label="Meta Browser Title" 
          value={form.seo_meta_title ?? "Aim Car Travels — Self-Drive Car Rentals in Vijayawada"} 
          onChange={(v) => set("seo_meta_title", v)} 
        />
        <Field 
          label="Meta Keywords (Comma separated)" 
          value={form.seo_meta_keywords ?? "self drive cars, car rental vijayawada, rent car, car travels vijayawada"} 
          onChange={(v) => set("seo_meta_keywords", v)} 
        />
      </div>

      <div className="mt-4">
        <Field 
          label="Meta Description" 
          value={form.seo_meta_description ?? "Vijayawada's trusted self-drive car rental since 2017. Compact cars to premium SUVs, 24/7 booking. Pick up at Benz Circle."} 
          onChange={(v) => set("seo_meta_description", v)} 
          multiline 
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-6 border-t border-border pt-6">
        <ImageUpload 
          label="Favicon Image (Browser Tab Icon)" 
          value={form.seo_favicon_url ?? "/favicon.png"} 
          onChange={(v) => set("seo_favicon_url", v)} 
        />
        
        <ImageUpload 
          label="OpenGraph Preview Image (Renders on social shares)" 
          value={form.seo_og_image_url ?? ""} 
          onChange={(v) => set("seo_og_image_url", v)} 
        />
      </div>

      <div className="mt-6">
        <SaveButton 
          saving={saving} 
          onClick={() => save([
            "seo_meta_title",
            "seo_meta_keywords",
            "seo_meta_description",
            "seo_favicon_url",
            "seo_og_image_url"
          ])} 
        />
      </div>
    </Section>
  );
};

export default SEOEditor;

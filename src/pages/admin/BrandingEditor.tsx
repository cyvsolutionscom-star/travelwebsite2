import ImageUpload from "@/components/admin/ImageUpload";
import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const BrandingEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();
  
  if (isLoading || !form) return <Loading />;
  
  return (
    <Section title="Branding & Hero" description="Logo, hero background image, and the main headline at the top of the page.">
      <div className="grid sm:grid-cols-2 gap-6">
        <ImageUpload label="Logo (square works best)" value={form.logo_url} onChange={(v) => set("logo_url", v)} />
        <ImageUpload label="Hero background image" value={form.hero_image_url} onChange={(v) => set("hero_image_url", v)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Business Name" value={form.business_name} onChange={(v) => set("business_name", v)} />
        <Field label="Tagline" value={form.tagline} onChange={(v) => set("tagline", v)} />
        <Field label="Hero Eyebrow (small line above title)" value={form.hero_eyebrow} onChange={(v) => set("hero_eyebrow", v)} />
        <Field label="Hero Title" value={form.hero_title} onChange={(v) => set("hero_title", v)} />
        <Field label="Highlight word (must appear inside title)" value={form.hero_highlight} onChange={(v) => set("hero_highlight", v)} />
        <Field label="Rating (e.g. 4.9★)" value={form.rating} onChange={(v) => set("rating", v)} />
        <Field label="Reviews Count (e.g. 240+)" value={form.reviews_count} onChange={(v) => set("reviews_count", v)} />
        <Field label="Years in Business" value={form.years_in_business} onChange={(v) => set("years_in_business", v)} />
      </div>
      <Field label="Hero Subtitle" value={form.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} multiline />
      <SaveButton saving={saving} onClick={() => save(["logo_url","hero_image_url","business_name","tagline","hero_eyebrow","hero_title","hero_highlight","hero_subtitle","rating","reviews_count","years_in_business"])} />
    </Section>
  );
};

export default BrandingEditor;

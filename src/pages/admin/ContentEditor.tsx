import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const ContentEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();
  
  if (isLoading || !form) return <Loading />;
  
  return (
    <Section title="Section Copy" description="Edit headings & subtitles for the Services, Call-to-action, About and Footer sections.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Services section title" value={form.services_title} onChange={(v) => set("services_title", v)} />
        <Field label="Services section subtitle" value={form.services_subtitle} onChange={(v) => set("services_subtitle", v)} multiline />
        <Field label="CTA title" value={form.cta_title} onChange={(v) => set("cta_title", v)} />
        <Field label="CTA subtitle" value={form.cta_subtitle} onChange={(v) => set("cta_subtitle", v)} multiline />
      </div>
      <Field label="About / Footer text" value={form.about_text} onChange={(v) => set("about_text", v)} multiline />
      <Field label="Footer note (small line at bottom)" value={form.footer_note} onChange={(v) => set("footer_note", v)} />
      <SaveButton saving={saving} onClick={() => save(["services_title","services_subtitle","cta_title","cta_subtitle","about_text","footer_note"])} />
    </Section>
  );
};

export default ContentEditor;

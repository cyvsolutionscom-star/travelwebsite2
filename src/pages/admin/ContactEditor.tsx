import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const ContactEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();
  
  if (isLoading || !form) return <Loading />;
  
  return (
    <Section title="Contact & Location" description="Phone, WhatsApp, address, opening hours and Google Maps embed.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone (tel: link, e.g. +919492456488)" value={form.phone_number} onChange={(v) => set("phone_number", v)} />
        <Field label="WhatsApp (digits only with country code)" value={form.whatsapp_number} onChange={(v) => set("whatsapp_number", v)} />
        <Field label="Address" value={form.address} onChange={(v) => set("address", v)} />
        <Field label="Hours" value={form.hours} onChange={(v) => set("hours", v)} />
      </div>
      <Field
        label='Google Maps embed URL (Maps → Share → Embed → copy the src="…" link)'
        value={form.map_embed_url}
        onChange={(v) => set("map_embed_url", v)}
        multiline
      />
      {form.map_embed_url && (
        <div className="rounded-2xl overflow-hidden border border-border aspect-video shadow-sm">
          <iframe src={form.map_embed_url} title="Map preview" className="w-full h-full" loading="lazy" />
        </div>
      )}
      <SaveButton saving={saving} onClick={() => save(["phone_number","whatsapp_number","address","hours","map_embed_url"])} />
    </Section>
  );
};

export default ContactEditor;

import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const FooterEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();

  if (isLoading || !form) return <Loading />;

  return (
    <Section title="Footer & Corporate Settings" description="Modify social links, office hours, copyright text, contact email, and address info.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Office Location Address" value={form.address} onChange={(v) => set("address", v)} />
        <Field label="Working Hours Status" value={form.hours} onChange={(v) => set("hours", v)} />
        <Field label="Corporate Email Address" value={form.footer_email ?? "info@aimcartravels.com"} onChange={(v) => set("footer_email", v)} />
        <Field label="Footer Copyright Note" value={form.footer_note ?? "Crafted with care in Vijayawada 🇮🇳"} onChange={(v) => set("footer_note", v)} />
      </div>

      <div className="mt-4">
        <Field label="About Company Info (Renders in footer)" value={form.about_text} onChange={(v) => set("about_text", v)} multiline />
      </div>

      <div className="border-t border-border pt-6 mt-6 space-y-4">
        <h3 className="font-display font-semibold text-lg">Social Media Links</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook Page URL" value={form.footer_facebook_url ?? "#"} onChange={(v) => set("footer_facebook_url", v)} placeholder="https://facebook.com/..." />
          <Field label="Instagram Profile URL" value={form.footer_instagram_url ?? "#"} onChange={(v) => set("footer_instagram_url", v)} placeholder="https://instagram.com/..." />
          <Field label="Twitter / X Profile URL" value={form.footer_twitter_url ?? "#"} onChange={(v) => set("footer_twitter_url", v)} placeholder="https://twitter.com/..." />
          <Field label="LinkedIn Profile URL" value={form.footer_linkedin_url ?? "#"} onChange={(v) => set("footer_linkedin_url", v)} placeholder="https://linkedin.com/company/..." />
        </div>
      </div>

      <div className="mt-6">
        <SaveButton 
          saving={saving} 
          onClick={() => save([
            "address",
            "hours",
            "footer_email",
            "footer_note",
            "about_text",
            "footer_facebook_url",
            "footer_instagram_url",
            "footer_twitter_url",
            "footer_linkedin_url"
          ])} 
        />
      </div>
    </Section>
  );
};

export default FooterEditor;

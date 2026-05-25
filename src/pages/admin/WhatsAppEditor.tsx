import { MessageCircle } from "lucide-react";
import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";

const WhatsAppEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();
  
  if (isLoading || !form) return <Loading />;
  
  const wa = form.whatsapp_number || "919492456488";
  const previewBooking = form.whatsapp_booking_template
    .replace("{car}", "Hyundai Creta")
    .replace("{price}", "2500");
  const testLink = (msg: string) => `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  
  return (
    <Section
      title="WhatsApp Integration"
      description="Customers reach you on WhatsApp from the navbar, hero, fleet cards, and payment screen. Edit the number and the auto-filled messages here."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="WhatsApp number (digits only with country code, e.g. 919492456488)" value={form.whatsapp_number} onChange={(v) => set("whatsapp_number", v.replace(/[^0-9]/g, ""))} />
        <Field label="Phone number (used for Call button)" value={form.phone_number} onChange={(v) => set("phone_number", v)} />
      </div>
      <Field label="Default greeting (Navbar / Hero / Floating button)" value={form.whatsapp_default_message} onChange={(v) => set("whatsapp_default_message", v)} multiline />
      <Field label='"Book on WhatsApp" template (use {car} and {price} placeholders)' value={form.whatsapp_booking_template} onChange={(v) => set("whatsapp_booking_template", v)} multiline />
      <Field label="Payment confirmation message (sent after UPI payment)" value={form.whatsapp_payment_message} onChange={(v) => set("whatsapp_payment_message", v)} multiline />

      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Live preview & test</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <a href={testLink(form.whatsapp_default_message)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:brightness-110 shadow-sm transition-all hover:-translate-y-0.5">
            <MessageCircle className="w-4 h-4" /> Test greeting
          </a>
          <a href={testLink(previewBooking)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:brightness-110 shadow-sm transition-all hover:-translate-y-0.5">
            <MessageCircle className="w-4 h-4" /> Test booking
          </a>
          <a href={testLink(form.whatsapp_payment_message)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:brightness-110 shadow-sm transition-all hover:-translate-y-0.5">
            <MessageCircle className="w-4 h-4" /> Test payment
          </a>
        </div>
        <p className="text-sm text-muted-foreground bg-background p-3 rounded-xl border border-border">Preview: <span className="text-foreground font-medium">{previewBooking}</span></p>
      </div>

      <SaveButton saving={saving} onClick={() => save(["whatsapp_number","phone_number","whatsapp_default_message","whatsapp_booking_template","whatsapp_payment_message"])} />
    </Section>
  );
};

export default WhatsAppEditor;

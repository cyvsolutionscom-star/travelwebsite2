import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";
import ImageUpload from "@/components/admin/ImageUpload";

const PaymentEditor = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();
  
  if (isLoading || !form) return <Loading />;
  
  return (
    <Section title="Payment / UPI" description="Show a UPI QR + ID on the landing page so customers can pay instantly.">
      <label className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card cursor-pointer">
        <input type="checkbox" checked={form.payment_enabled} onChange={(e) => set("payment_enabled", e.target.checked)} className="w-5 h-5 accent-primary" />
        <div>
          <div className="font-semibold">Show payment section on landing page</div>
          <div className="text-xs text-muted-foreground">When off, the payment block is hidden from visitors.</div>
        </div>
      </label>

      <div className="grid sm:grid-cols-2 gap-6">
        <ImageUpload label="UPI / Payment QR image" value={form.payment_qr_url} onChange={(v) => set("payment_qr_url", v)} />
        <div className="space-y-4">
          <Field label="UPI ID (e.g. name@oksbi)" value={form.upi_id} onChange={(v) => set("upi_id", v)} />
          <Field label="Payment instructions" value={form.payment_note} onChange={(v) => set("payment_note", v)} multiline />
        </div>
      </div>

      <SaveButton saving={saving} onClick={() => save(["payment_enabled","payment_qr_url","upi_id","payment_note"])} />
    </Section>
  );
};

export default PaymentEditor;

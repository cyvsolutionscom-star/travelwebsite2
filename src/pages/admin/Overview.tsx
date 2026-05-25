import { useNavigate } from "react-router-dom";
import { useCars, useReviewsAll, useServices, useSiteSettings } from "@/hooks/useSiteData";
import { Car, Wrench, MessageSquare, CreditCard, ImageIcon } from "lucide-react";
import { Section } from "./SharedUI";

const Overview = () => {
  const navigate = useNavigate();
  const { data: cars = [] } = useCars({ includeInactive: true });
  const { data: reviews = [] } = useReviewsAll();
  const { data: services = [] } = useServices({ includeInactive: true });
  const { data: settings } = useSiteSettings();

  const stats = [
    { label: "Cars in fleet", value: cars.length, sub: `${cars.filter((c) => c.active).length} active`, icon: Car, path: "/admin/cars" },
    { label: "Services", value: services.length, sub: `${services.filter((s) => s.active).length} live`, icon: Wrench, path: "/admin/services" },
    { label: "Reviews", value: reviews.length, sub: `${reviews.filter((r) => r.active).length} live`, icon: MessageSquare, path: "/admin/reviews" },
    { label: "Payment", value: settings?.payment_enabled ? "Enabled" : "Off", sub: settings?.upi_id || "Add UPI ID", icon: CreditCard, path: "/admin/payment" },
  ];

  return (
    <div className="space-y-6">
      <Section title="Welcome back 👋" description="Stunning dashboard. Manage every part of the landing page from here.">
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <button key={i} onClick={() => navigate(s.path)} className="text-left rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-0.5 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform"><s.icon className="w-5 h-5" /></div>
                <div className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">Edit →</div>
              </div>
              <div className="font-display font-bold text-3xl mb-1 truncate">{s.value}</div>
              <div className="text-sm font-medium">{s.label} <span className="text-muted-foreground font-normal">· {s.sub}</span></div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Quick actions">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/admin/branding")} className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold btn-glow hover:scale-105 transition-transform"><ImageIcon className="w-4 h-4" /> Change logo & hero</button>
          <button onClick={() => navigate("/admin/payment")} className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors"><CreditCard className="w-4 h-4" /> Setup UPI QR</button>
          <button onClick={() => navigate("/admin/cars")} className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors"><Car className="w-4 h-4" /> Add a car</button>
          <button onClick={() => navigate("/admin/whatsapp")} className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-secondary border border-border text-sm font-semibold hover:bg-secondary/70 transition-colors"><MessageSquare className="w-4 h-4" /> Edit WhatsApp Text</button>
        </div>
      </Section>
    </div>
  );
};

export default Overview;

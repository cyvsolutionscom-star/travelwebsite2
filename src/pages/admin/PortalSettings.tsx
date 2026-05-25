import { useSettingsForm, Section, Field, SaveButton, Loading } from "./SharedUI";
import { Shield, LayoutGrid } from "lucide-react";

const PortalSettings = () => {
  const { form, set, save, saving, isLoading } = useSettingsForm();

  if (isLoading || !form) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Admin Dashboard Branding Card */}
      <Section 
        title="Admin Dashboard Config" 
        description="Rename the admin panel and customize its sidebar branding and elements."
        action={
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <LayoutGrid className="w-5 h-5" />
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field 
            label="Dashboard / Portal Name" 
            placeholder="e.g. Veloce CMS"
            value={form.admin_portal_name ?? "Veloce CMS"} 
            onChange={(v) => set("admin_portal_name", v)} 
          />
          <Field 
            label="Sidebar Subtitle" 
            placeholder="e.g. Admin Console"
            value={form.admin_console_subtitle ?? "Admin Console"} 
            onChange={(v) => set("admin_console_subtitle", v)} 
          />
          <Field 
            label="Logo Icon Text (1-2 characters)" 
            placeholder="e.g. V"
            value={form.admin_logo_text ?? "V"} 
            onChange={(v) => set("admin_logo_text", v)} 
          />
        </div>
      </Section>

      {/* Admin Login Gateway Page Branding Card */}
      <Section 
        title="Admin Login Gateway Config" 
        description="Rename and customize the public login gateway page for your administrative control center."
        action={
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Shield className="w-5 h-5" />
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <Field 
            label="Login Portal Title" 
            placeholder="e.g. Veloce Gateway"
            value={form.admin_login_title ?? "Veloce Gateway"} 
            onChange={(v) => set("admin_login_title", v)} 
          />
          <Field 
            label="Login Portal Subtitle" 
            placeholder="e.g. Control Center Access"
            value={form.admin_login_subtitle ?? "Control Center Access"} 
            onChange={(v) => set("admin_login_subtitle", v)} 
          />
          <div className="sm:col-span-2">
            <Field 
              label="Email Input Label" 
              placeholder="e.g. Administrative Email"
              value={form.admin_email_label ?? "Administrative Email"} 
              onChange={(v) => set("admin_email_label", v)} 
            />
          </div>
        </div>
      </Section>

      {/* Save Button for all changes */}
      <div className="flex justify-end p-2">
        <SaveButton 
          saving={saving} 
          onClick={() => save([
            "admin_portal_name",
            "admin_console_subtitle",
            "admin_logo_text",
            "admin_login_title",
            "admin_login_subtitle",
            "admin_email_label"
          ])} 
        />
      </div>
    </div>
  );
};

export default PortalSettings;

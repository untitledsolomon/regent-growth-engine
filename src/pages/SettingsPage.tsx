import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Bell, Plug, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: 'Regent Admin', email: 'admin@regent.io', company: 'Regent Agency' });
  const [notifications, setNotifications] = useState({
    newLead: true,
    messageReply: true,
    campaignComplete: true,
    weeklyReport: false,
  });

  const handleSaveProfile = () => toast.success('Profile saved');

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your profile and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Profile</h3>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Company</Label>
              <Input value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} className="mt-1" />
            </div>
            <Button size="sm" onClick={handleSaveProfile} className="mt-2">Save Profile</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'newLead' as const, label: 'New lead added', desc: 'Get notified when a new lead is imported or created' },
              { key: 'messageReply' as const, label: 'Message replies', desc: 'Notify when a lead replies to your outreach' },
              { key: 'campaignComplete' as const, label: 'Campaign completed', desc: 'Alert when a campaign finishes its run' },
              { key: 'weeklyReport' as const, label: 'Weekly digest', desc: 'Receive a weekly performance summary email' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Integrations Link */}
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Plug className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base">Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage PhantomBuster, WhatsApp, and Zoho Mail connections</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/integrations')}>
              Manage Integrations <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

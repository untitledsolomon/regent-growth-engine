import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Key, MessageSquare, Mail, Bell, RefreshCw, CheckCircle, Globe } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: 'Regent Admin', email: 'admin@regent.io', company: 'Regent Agency' });
  const [integrations, setIntegrations] = useState({
    phantombusterKey: '',
    phantombusterConnected: false,
    whatsappNumber: '',
    whatsappConnected: false,
    zohoSmtp: '',
    zohoEmail: '',
    zohoConnected: false,
  });
  const [notifications, setNotifications] = useState({
    newLead: true,
    messageReply: true,
    campaignComplete: true,
    weeklyReport: false,
  });

  const handleSaveProfile = () => toast.success('Profile saved');
  const handleSyncPB = () => {
    if (!integrations.phantombusterKey) { toast.error('Enter a PhantomBuster API key first'); return; }
    toast.loading('Syncing with PhantomBuster...');
    setTimeout(() => {
      setIntegrations(prev => ({ ...prev, phantombusterConnected: true }));
      toast.dismiss();
      toast.success('PhantomBuster connected — 12 leads synced');
    }, 2000);
  };
  const handleConnectWhatsapp = () => {
    if (!integrations.whatsappNumber) { toast.error('Enter a WhatsApp Business number first'); return; }
    setIntegrations(prev => ({ ...prev, whatsappConnected: true }));
    toast.success('WhatsApp Business connected');
  };
  const handleConnectZoho = () => {
    if (!integrations.zohoSmtp || !integrations.zohoEmail) { toast.error('Fill in SMTP host and email'); return; }
    setIntegrations(prev => ({ ...prev, zohoConnected: true }));
    toast.success('Zoho Mail connected');
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your profile, integrations, and preferences" />

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

        {/* PhantomBuster */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4" /> PhantomBuster
            {integrations.phantombusterConnected && <CheckCircle className="w-4 h-4 text-regent-emerald" />}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Auto-import leads from PhantomBuster phantoms</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">API Key</Label>
              <Input
                type="password"
                value={integrations.phantombusterKey}
                onChange={e => setIntegrations(prev => ({ ...prev, phantombusterKey: e.target.value }))}
                placeholder="pb_xxxxxxxxxxxxxxxx"
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSyncPB} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Sync Now
              </Button>
              {integrations.phantombusterConnected && (
                <span className="inline-flex items-center text-xs text-regent-emerald gap-1"><CheckCircle className="w-3 h-3" /> Connected</span>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> WhatsApp Business
            {integrations.whatsappConnected && <CheckCircle className="w-4 h-4 text-regent-emerald" />}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Connect your WhatsApp Business API</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Business Phone Number</Label>
              <Input
                value={integrations.whatsappNumber}
                onChange={e => setIntegrations(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="+1-555-000-0000"
                className="mt-1"
              />
            </div>
            <Button size="sm" onClick={handleConnectWhatsapp}>Connect WhatsApp</Button>
          </div>
        </div>

        {/* Zoho Mail */}
        <div className="glass rounded-xl p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Zoho Mail / SMTP
            {integrations.zohoConnected && <CheckCircle className="w-4 h-4 text-regent-emerald" />}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Configure email sending via Zoho Mail SMTP</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">SMTP Host</Label>
              <Input
                value={integrations.zohoSmtp}
                onChange={e => setIntegrations(prev => ({ ...prev, zohoSmtp: e.target.value }))}
                placeholder="smtp.zoho.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">From Email</Label>
              <Input
                value={integrations.zohoEmail}
                onChange={e => setIntegrations(prev => ({ ...prev, zohoEmail: e.target.value }))}
                placeholder="outreach@regent.io"
                className="mt-1"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleConnectZoho} className="mt-3">Connect Zoho Mail</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

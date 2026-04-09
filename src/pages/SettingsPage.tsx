import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Bell, Plug, ArrowRight, Palette, Upload, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/orgContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId } = useOrg();

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name ?? 'Regent Admin',
    email: user?.email ?? 'admin@regent.io',
    company: 'Regent Agency',
  });
  const [notifications, setNotifications] = useState({
    newLead: true,
    messageReply: true,
    campaignComplete: true,
    weeklyReport: false,
  });
  const [branding, setBranding] = useState({ primaryColor: '#4648d4', poweredBy: true });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  // Load org branding from Supabase when orgId is available
  useEffect(() => {
    if (!supabase || !orgId) return;
    supabase
      .from('organisations')
      .select('name, primary_color, powered_by_visible')
      .eq('id', orgId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(p => ({ ...p, company: data.name }));
          setBranding({
            primaryColor: data.primary_color ?? '#4648d4',
            poweredBy: data.powered_by_visible ?? true,
          });
        }
      });
  }, [orgId]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      if (supabase && user) {
        // Update display name in auth metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { full_name: profile.name },
        });
        if (authError) throw authError;

        // Update org name if we own an org
        if (orgId) {
          const { error: orgError } = await supabase
            .from('organisations')
            .update({ name: profile.company })
            .eq('id', orgId);
          if (orgError) throw orgError;
        }
      }
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      if (supabase && orgId) {
        const { error } = await supabase
          .from('organisations')
          .update({
            primary_color: branding.primaryColor,
            powered_by_visible: branding.poweredBy,
          })
          .eq('id', orgId);
        if (error) throw error;
      }
      toast.success('Branding updated');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update branding');
    } finally {
      setSavingBranding(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences, and workspace" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile</h3>
          <div className="space-y-3">
            <div><Label className="text-xs">Full Name</Label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="mt-1 rounded-xl" /></div>
            <div><Label className="text-xs">Email</Label><Input value={profile.email} readOnly className="mt-1 rounded-xl opacity-60 cursor-not-allowed" /></div>
            <div><Label className="text-xs">Company</Label><Input value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} className="mt-1 rounded-xl" /></div>
            <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="mt-2 rounded-xl gradient-primary text-white">
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'newLead' as const, label: 'New lead added', desc: 'Get notified when a new lead is imported or created' },
              { key: 'messageReply' as const, label: 'Message replies', desc: 'Notify when a lead replies to your outreach' },
              { key: 'campaignComplete' as const, label: 'Campaign completed', desc: 'Alert when a campaign finishes its run' },
              { key: 'weeklyReport' as const, label: 'Weekly digest', desc: 'Receive a weekly performance summary email' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <Switch checked={notifications[item.key]} onCheckedChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /> Branding</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Primary Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} className="w-10 h-10 rounded-xl border border-border cursor-pointer" />
                <Input value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} className="flex-1 font-mono text-xs rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Logo Upload</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-[10px] text-muted-foreground mt-1">SVG, PNG, or JPG (max 2MB)</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Show "Powered by Regent"</p><p className="text-xs text-muted-foreground">Display attribution in client portal</p></div>
              <Switch checked={branding.poweredBy} onCheckedChange={v => setBranding(b => ({ ...b, poweredBy: v }))} />
            </div>
            <Button size="sm" onClick={handleSaveBranding} disabled={savingBranding} className="rounded-xl gradient-primary text-white">
              {savingBranding ? 'Saving…' : 'Save Branding'}
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
              <Button variant="outline" size="sm" className="rounded-xl">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Change Password</p><p className="text-xs text-muted-foreground">Update your account password</p></div>
              <Button variant="outline" size="sm" className="rounded-xl">Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Active Sessions</p><p className="text-xs text-muted-foreground">Manage devices logged into your account</p></div>
              <Button variant="outline" size="sm" className="rounded-xl">View</Button>
            </div>
          </div>
        </div>

        {/* Integrations Link */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10"><Plug className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-display font-semibold text-base">Integrations</h3>
                <p className="text-sm text-muted-foreground">Manage PhantomBuster, WhatsApp, and Zoho Mail connections</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => navigate('/integrations')}>
              Manage Integrations <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

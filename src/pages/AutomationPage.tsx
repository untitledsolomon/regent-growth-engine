import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Play, Pause, Zap, Mail, MessageSquare, Clock, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AutomationPage() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRulesAndLogs() {
      if (!supabase || !user) return;

      // Get user's org
      const { data: orgMember } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) {
        setLoading(false);
        return;
      }
      setOrgId(orgMember.org_id);

      const [rulesRes, logsRes] = await Promise.all([
        supabase.from('automation_rules').select('*').eq('org_id', orgMember.org_id),
        supabase.from('automation_logs').select('*, leads(name, email)').eq('org_id', orgMember.org_id).order('created_at', { ascending: false }).limit(20)
      ]);

      setRules(rulesRes.data || []);
      setLogs(logsRes.data || []);
      setLoading(false);
    }
    fetchRulesAndLogs();
  }, [user]);

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    const { error } = await supabase.from('automation_rules').update({ enabled }).eq('id', ruleId);
    if (error) {
      toast.error("Failed to update rule");
      return;
    }
    setRules(rules.map(r => r.id === ruleId ? { ...r, enabled } : r));
    toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  const deleteRule = async (ruleId: string) => {
    const { error } = await supabase.from('automation_rules').delete().eq('id', ruleId);
    if (error) {
      toast.error("Failed to delete rule");
      return;
    }
    setRules(rules.filter(r => r.id !== ruleId));
    toast.success("Rule deleted");
  };

  const createRule = async () => {
    if (!orgId) return;
    const newRule = {
      org_id: orgId,
      name: "New Lead Welcome",
      trigger_type: "new_lead",
      action_type: "send_whatsapp",
      config: { message: "Hi {{name}}, thanks for reaching out!" },
      enabled: true
    };
    const { data, error } = await supabase.from('automation_rules').insert(newRule).select().single();
    if (error) {
      toast.error("Failed to create rule");
      return;
    }
    setRules([...rules, data]);
    toast.success("Automation rule created");
  };

  return (
    <DashboardLayout>
      <PageHeader title="Automation" subtitle="Create smart workflows to engage leads automatically" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Active Workflows
            </h3>
            <Button onClick={createRule} className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Create Rule
            </Button>
          </div>

          <div className="space-y-4">
            {rules.length === 0 && !loading && (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">No automation rules yet.</p>
                <Button variant="link" onClick={createRule}>Create your first rule</Button>
              </div>
            )}

            {rules.map((rule) => (
              <div key={rule.id} className="glass rounded-2xl p-6 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rule.name}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase">{rule.trigger_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      {rule.action_type === 'send_whatsapp' ? <MessageSquare className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      {rule.action_type === 'send_whatsapp' ? 'Send WhatsApp' : 'Send Email'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`rule-${rule.id}`} className="sr-only">Toggle rule</Label>
                      <Switch
                        id={`rule-${rule.id}`}
                        checked={rule.enabled}
                        onCheckedChange={(v) => toggleRule(rule.id, v)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Action Config</Label>
                    <p className="text-xs mt-1 truncate">{rule.config?.message || rule.config?.subject || 'No config set'}</p>
                  </div>
                  <div className="text-right">
                    <Label className="text-[10px] uppercase text-muted-foreground">Total Runs</Label>
                    <p className="text-xs mt-1 font-semibold">--</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Execution Log
          </h3>
          <div className="glass rounded-2xl p-4 space-y-4">
            {logs.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No activity yet</p>}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm pb-3 border-b border-border last:border-0 last:pb-0">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-success' : 'bg-destructive'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{log.leads?.name || 'Unknown Lead'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.status === 'success' ? 'Sent successfully' : 'Failed to send'}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

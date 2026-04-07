import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Globe, MessageSquare, Mail, CheckCircle, XCircle, RefreshCw,
  Activity, Zap, Clock, ArrowUpRight, Send, Eye, Reply,
  AlertTriangle, Shield, QrCode, Server, Wifi, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  loadConfig, saveConfig,
  pbFetchAgents, pbSyncLeads,
  zohoTestConnection,
} from "@/lib/integrations";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("phantombuster");
  const [loading, setLoading] = useState(true);

  // PhantomBuster state
  const [pbKey, setPbKey] = useState("");
  const [pbConnected, setPbConnected] = useState(false);
  const [pbSyncing, setPbSyncing] = useState(false);
  const [pbAutoSync, setPbAutoSync] = useState(true);
  const [pbSyncInterval, setPbSyncInterval] = useState("daily");
  const [pbPhantoms, setPbPhantoms] = useState<{ id: string; name: string }[]>([]);
  const [pbSelectedPhantom, setPbSelectedPhantom] = useState("");
  const [pbMetrics, setPbMetrics] = useState({ totalImported: 0, lastSync: "Never", avgPerSync: 0, successRate: 0, totalSyncs: 0 });
  const [syncLogs, setSyncLogs] = useState<any[]>([]);

  // WhatsApp state
  const [waConnected, setWaConnected] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [waMetrics] = useState({ sentToday: 0, limit: 1000, deliveryRate: 0, readRate: 0, replyRate: 0, totalSent: 0 });

  // Zoho state
  const [zohoConnected, setZohoConnected] = useState(false);
  const [zohoHost, setZohoHost] = useState("smtp.zoho.com");
  const [zohoPort, setZohoPort] = useState("587");
  const [zohoTls, setZohoTls] = useState(true);
  const [zohoEmail, setZohoEmail] = useState("");
  const [zohoPassword, setZohoPassword] = useState("");
  const [zohoMetrics] = useState({ sentToday: 0, bounceRate: 0, openRate: 0, totalSent: 0 });

  // ─── LOAD CONFIGS ON MOUNT ───────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [pb, wa, zoho] = await Promise.all([
          loadConfig("phantombuster"),
          loadConfig("whatsapp"),
          loadConfig("zoho"),
        ]);

        // PhantomBuster
        if (pb) {
          setPbConnected(pb.connected);
          setPbKey(pb.config.apiKey || "");
          setPbAutoSync(pb.config.autoSync ?? true);
          setPbSyncInterval(pb.config.syncInterval || "daily");
          setPbSelectedPhantom(pb.config.selectedPhantomId || "");
          if (pb.connected && pb.config.apiKey) {
            await fetchPhantoms(pb.config.apiKey);
          }
        }

        // WhatsApp
        if (wa) {
          setWaConnected(wa.connected);
          setWaNumber(wa.config.businessNumber || "");
        }

        // Zoho
        if (zoho) {
          setZohoConnected(zoho.connected);
          setZohoHost(zoho.config.host || "smtp.zoho.com");
          setZohoPort(zoho.config.port || "587");
          setZohoTls(zoho.config.tls ?? true);
          setZohoEmail(zoho.config.email || "");
        }

        // Metrics + logs
        await Promise.all([loadPbMetrics(), loadSyncLogs()]);
      } catch (err) {
        toast.error("Failed to load integration configs");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchPhantoms(apiKey: string) {
    try {
      const data = await pbFetchAgents(apiKey);
      const agents = (data.agents || []).map((a: any) => ({ id: a.id, name: a.name }));
      setPbPhantoms(agents);
      if (agents.length > 0 && !pbSelectedPhantom) {
        setPbSelectedPhantom(agents[0].id);
      }
    } catch {
      // silently fail — user may have a bad key
    }
  }

  async function loadPbMetrics() {
    const { data: logs } = await supabase
      .from("integration_sync_logs")
      .select("*")
      .eq("source", "PhantomBuster")
      .order("timestamp", { ascending: false });

    if (!logs || logs.length === 0) return;

    const totalImported = logs.reduce((s, l) => s + (l.leads_count || 0), 0);
    const successful = logs.filter(l => l.status === "success");
    const successRate = ((successful.length / logs.length) * 100);
    const avgPerSync = Math.round(totalImported / logs.length);
    const lastSync = logs[0]?.timestamp
      ? new Date(logs[0].timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Never";

    setPbMetrics({ totalImported, lastSync, avgPerSync, successRate: parseFloat(successRate.toFixed(1)), totalSyncs: logs.length });
  }

  async function loadSyncLogs() {
    const { data } = await supabase
      .from("integration_sync_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(10);
    setSyncLogs(data || []);
  }

  // ─── PHANTOMBUSTER CONNECT ───────────────────────────
  const handlePbConnect = async () => {
    if (!pbKey) { toast.error("Enter your API key first"); return; }
    try {
      toast.loading("Verifying API key...");
      await fetchPhantoms(pbKey);
      await saveConfig("phantombuster", {
        apiKey: pbKey,
        selectedPhantomId: pbSelectedPhantom,
        autoSync: pbAutoSync,
        syncInterval: pbSyncInterval,
      }, true);
      setPbConnected(true);
      toast.dismiss();
      toast.success("PhantomBuster connected");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Connection failed");
    }
  };

  const handlePbDisconnect = async () => {
    await saveConfig("phantombuster", { apiKey: pbKey }, false);
    setPbConnected(false);
    toast.success("Disconnected");
  };

  // ─── PHANTOMBUSTER SYNC ──────────────────────────────
  const handlePbSync = async () => {
    if (!pbConnected) { toast.error("Connect PhantomBuster first"); return; }
    if (!pbSelectedPhantom) { toast.error("Select a Phantom first"); return; }
    setPbSyncing(true);
    const tid = toast.loading("Syncing with PhantomBuster...");
    try {
      const count = await pbSyncLeads(pbKey, pbSelectedPhantom);
      toast.dismiss(tid);
      toast.success(`Sync complete — ${count} leads imported`);
      await Promise.all([loadPbMetrics(), loadSyncLogs()]);
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.message || "Sync failed");
      await supabase.from("integration_sync_logs").insert({
        source: "PhantomBuster",
        leads_count: 0,
        status: "error",
        error_message: err.message,
      });
    } finally {
      setPbSyncing(false);
    }
  };

  // ─── WHATSAPP CONNECT ─────────────────────────────────
  const handleWaConnect = async () => {
    // WA credentials live in edge function env vars — we just save the business number
    await saveConfig("whatsapp", { businessNumber: waNumber }, true);
    setWaConnected(true);
    toast.success("WhatsApp connected");
  };

  const handleWaDisconnect = async () => {
    await saveConfig("whatsapp", { businessNumber: waNumber }, false);
    setWaConnected(false);
    toast.success("WhatsApp disconnected");
  };

  // ─── ZOHO CONNECT + TEST ──────────────────────────────
  const handleZohoConnect = async () => {
    await saveConfig("zoho", {
      host: zohoHost, port: zohoPort, tls: zohoTls, email: zohoEmail,
    }, true);
    setZohoConnected(true);
    toast.success("Zoho config saved — run Test Connection to verify");
  };

  const handleZohoDisconnect = async () => {
    await saveConfig("zoho", { host: zohoHost, port: zohoPort, tls: zohoTls, email: zohoEmail }, false);
    setZohoConnected(false);
    toast.success("Disconnected");
  };

  const handleTestZoho = async () => {
    const tid = toast.loading("Testing SMTP connection...");
    try {
      await zohoTestConnection();
      toast.dismiss(tid);
      toast.success("SMTP connection successful — test email sent");
    } catch (err: any) {
      toast.dismiss(tid);
      toast.error(err.message || "SMTP test failed");
    }
  };

  const integrationCards = [
    { id: "phantombuster", name: "PhantomBuster", icon: Globe, connected: pbConnected, metric: `${pbMetrics.totalImported} leads imported` },
    { id: "whatsapp", name: "WhatsApp Business", icon: MessageSquare, connected: waConnected, metric: `${waMetrics.sentToday}/${waMetrics.limit} messages today` },
    { id: "zoho", name: "Zoho Mail / SMTP", icon: Mail, connected: zohoConnected, metric: `${zohoMetrics.sentToday} emails today` },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Integrations" subtitle="Manage your connected services, monitor performance, and sync data" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {integrationCards.map((card) => (
          <button key={card.id} onClick={() => setActiveTab(card.id)}
            className={`glass rounded-xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${activeTab === card.id ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-muted"><card.icon className="w-5 h-5 text-foreground" /></div>
              {card.connected
                ? <Badge variant="outline" className="text-accent border-accent gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Connected</Badge>
                : <Badge variant="outline" className="text-destructive border-destructive gap-1 text-xs"><XCircle className="w-3 h-3" /> Disconnected</Badge>}
            </div>
            <p className="font-display font-semibold">{card.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.metric}</p>
          </button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="phantombuster" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> PhantomBuster</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="zoho" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Zoho Mail</TabsTrigger>
        </TabsList>

        {/* PHANTOMBUSTER */}
        <TabsContent value="phantombuster">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Imported", value: pbMetrics.totalImported, icon: ArrowUpRight },
                { label: "Total Syncs", value: pbMetrics.totalSyncs, icon: RefreshCw },
                { label: "Avg / Sync", value: pbMetrics.avgPerSync, icon: Activity },
                { label: "Success Rate", value: `${pbMetrics.successRate}%`, icon: Zap },
                { label: "Last Sync", value: pbMetrics.lastSync, icon: Clock },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Wifi className="w-4 h-4" /> Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">API Key</Label>
                  <Input type="password" value={pbKey} onChange={e => setPbKey(e.target.value)} placeholder="pb_xxxxxxxxxxxxxxxx" className="mt-1 font-mono text-xs" />
                </div>
                {pbPhantoms.length > 0 && (
                  <div>
                    <Label className="text-xs">Active Phantom</Label>
                    <Select value={pbSelectedPhantom} onValueChange={setPbSelectedPhantom}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pbPhantoms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-sync</p>
                    <p className="text-xs text-muted-foreground">Import leads on schedule</p>
                  </div>
                  <Switch checked={pbAutoSync} onCheckedChange={setPbAutoSync} />
                </div>
                {pbAutoSync && (
                  <div>
                    <Label className="text-xs">Sync Interval</Label>
                    <Select value={pbSyncInterval} onValueChange={setPbSyncInterval}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5" onClick={handlePbSync} disabled={pbSyncing || !pbConnected}>
                    <RefreshCw className={`w-3.5 h-3.5 ${pbSyncing ? "animate-spin" : ""}`} /> {pbSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button size="sm" variant={pbConnected ? "destructive" : "default"}
                    onClick={pbConnected ? handlePbDisconnect : handlePbConnect}>
                    {pbConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Sync History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {["Timestamp", "Source", "Leads", "Duration", "Status"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {syncLogs.length === 0 ? (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">No syncs yet</td></tr>
                    ) : syncLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2.5 text-sm">{new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-3 py-2.5 text-sm">{log.source}</td>
                        <td className="px-3 py-2.5 text-sm font-medium">{log.leads_count}</td>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground">{log.duration || "—"}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={log.status === "success" ? "default" : log.status === "partial" ? "secondary" : "destructive"} className="text-xs">{log.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* WHATSAPP */}
        <TabsContent value="whatsapp">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Sent", value: waMetrics.totalSent.toLocaleString(), icon: Send },
                { label: "Sent Today", value: `${waMetrics.sentToday}/${waMetrics.limit}`, icon: Activity },
                { label: "Delivery Rate", value: `${waMetrics.deliveryRate}%`, icon: CheckCircle },
                { label: "Read Rate", value: `${waMetrics.readRate}%`, icon: Eye },
                { label: "Reply Rate", value: `${waMetrics.replyRate}%`, icon: Reply },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Wifi className="w-4 h-4" /> Connection</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Business Phone Number</Label>
                  <Input value={waNumber} onChange={e => setWaNumber(e.target.value)} placeholder="+256700000000" className="mt-1" />
                </div>
                <p className="text-xs text-muted-foreground">WA_PHONE_NUMBER_ID and WA_ACCESS_TOKEN are set via Supabase secrets — not stored in the browser.</p>
                <Button size="sm" variant={waConnected ? "destructive" : "default"}
                  onClick={waConnected ? handleWaDisconnect : handleWaConnect}>
                  {waConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Rate Limit</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages used today</span>
                    <span className="font-semibold">{waMetrics.sentToday} / {waMetrics.limit}</span>
                  </div>
                  <Progress value={(waMetrics.sentToday / waMetrics.limit) * 100} className="h-2.5" />
                  <p className="text-xs text-muted-foreground">{waMetrics.limit - waMetrics.sentToday} messages remaining • Resets at midnight UTC</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ZOHO */}
        <TabsContent value="zoho">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Sent", value: zohoMetrics.totalSent.toLocaleString(), icon: Send },
                { label: "Sent Today", value: zohoMetrics.sentToday, icon: Activity },
                { label: "Open Rate", value: `${zohoMetrics.openRate}%`, icon: Eye },
                { label: "Bounce Rate", value: `${zohoMetrics.bounceRate}%`, icon: AlertTriangle },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Server className="w-4 h-4" /> SMTP Configuration</h3>
              <div className="space-y-3">
                <div><Label className="text-xs">SMTP Host</Label><Input value={zohoHost} onChange={e => setZohoHost(e.target.value)} className="mt-1 font-mono text-xs" /></div>
                <div><Label className="text-xs">Port</Label><Input value={zohoPort} onChange={e => setZohoPort(e.target.value)} className="mt-1 font-mono text-xs" /></div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">TLS / SSL</p><p className="text-xs text-muted-foreground">Encrypt connection</p></div>
                  <Switch checked={zohoTls} onCheckedChange={setZohoTls} />
                </div>
                <div><Label className="text-xs">From Email</Label><Input value={zohoEmail} onChange={e => setZohoEmail(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">App Password</Label><Input type="password" value={zohoPassword} onChange={e => setZohoPassword(e.target.value)} placeholder="Set via Supabase secrets" className="mt-1" disabled /></div>
                <p className="text-xs text-muted-foreground">ZOHO_PASSWORD is set via <code>supabase secrets set</code> — never stored in browser.</p>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5" onClick={handleTestZoho} disabled={!zohoConnected}><Zap className="w-3.5 h-3.5" /> Test Connection</Button>
                  <Button size="sm" variant={zohoConnected ? "destructive" : "default"} onClick={zohoConnected ? handleZohoDisconnect : handleZohoConnect}>
                    {zohoConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Domain Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{zohoEmail ? zohoEmail.split("@")[1] : "Not configured"}</p><p className="text-xs text-muted-foreground">Primary sending domain</p></div>
                    <Badge variant={zohoConnected ? "default" : "secondary"} className="gap-1 text-xs">
                      {zohoConnected ? <><CheckCircle className="w-3 h-3" /> Connected</> : "Not set"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ label: "SPF" }, { label: "DKIM" }, { label: "DMARC" }].map((dns) => (
                      <div key={dns.label} className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-xs text-muted-foreground">{dns.label}</p>
                        <p className="text-sm font-semibold text-muted-foreground">—</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
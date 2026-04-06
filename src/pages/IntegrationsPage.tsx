import { useState } from "react";
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
  AlertTriangle, Shield, QrCode, Server, Wifi
} from "lucide-react";
import { integrationSyncLogs, phantomConfigs, type IntegrationSyncLog } from "@/data/mockData";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("phantombuster");

  // PhantomBuster state
  const [pbKey, setPbKey] = useState("");
  const [pbConnected, setPbConnected] = useState(true);
  const [pbSyncing, setPbSyncing] = useState(false);
  const [pbAutoSync, setPbAutoSync] = useState(true);
  const [pbSyncInterval, setPbSyncInterval] = useState("daily");
  const [pbSelectedPhantom, setPbSelectedPhantom] = useState(phantomConfigs[0]?.id || "");

  // WhatsApp state
  const [waConnected, setWaConnected] = useState(true);
  const [waNumber, setWaNumber] = useState("+1-555-800-9090");

  // Zoho state
  const [zohoConnected, setZohoConnected] = useState(true);
  const [zohoHost, setZohoHost] = useState("smtp.zoho.com");
  const [zohoPort, setZohoPort] = useState("587");
  const [zohoTls, setZohoTls] = useState(true);
  const [zohoEmail, setZohoEmail] = useState("outreach@regent.io");

  const handlePbSync = () => {
    if (!pbConnected) { toast.error("Connect PhantomBuster first"); return; }
    setPbSyncing(true);
    toast.loading("Syncing with PhantomBuster...");
    setTimeout(() => {
      setPbSyncing(false);
      toast.dismiss();
      toast.success("Sync complete — 8 new leads imported");
    }, 2500);
  };

  const handleTestZoho = () => {
    toast.loading("Testing SMTP connection...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("SMTP connection successful — test email sent");
    }, 1500);
  };

  // Mock metrics
  const pbMetrics = { totalImported: 247, lastSync: "2 hours ago", avgPerSync: 12, successRate: 96.4, totalSyncs: 21 };
  const waMetrics = { sentToday: 250, limit: 1000, deliveryRate: 97.2, readRate: 84.5, replyRate: 38.1, totalSent: 1842 };
  const zohoMetrics = { sentToday: 85, bounceRate: 1.4, openRate: 42.8, totalSent: 2130, domainVerified: true };

  const integrationCards = [
    { id: "phantombuster", name: "PhantomBuster", icon: Globe, connected: pbConnected, metric: `${pbMetrics.totalImported} leads imported` },
    { id: "whatsapp", name: "WhatsApp Business", icon: MessageSquare, connected: waConnected, metric: `${waMetrics.sentToday}/${waMetrics.limit} messages today` },
    { id: "zoho", name: "Zoho Mail / SMTP", icon: Mail, connected: zohoConnected, metric: `${zohoMetrics.sentToday} emails today` },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Integrations" subtitle="Manage your connected services, monitor performance, and sync data" />

      {/* Integration Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {integrationCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className={`glass rounded-xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${activeTab === card.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-muted">
                <card.icon className="w-5 h-5 text-foreground" />
              </div>
              {card.connected ? (
                <Badge variant="outline" className="text-accent border-accent gap-1 text-xs">
                  <CheckCircle className="w-3 h-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-destructive border-destructive gap-1 text-xs">
                  <XCircle className="w-3 h-3" /> Disconnected
                </Badge>
              )}
            </div>
            <p className="font-display font-semibold">{card.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.metric}</p>
          </button>
        ))}
      </div>

      {/* Detailed Panels */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="phantombuster" className="gap-1.5"><Globe className="w-3.5 h-3.5" /> PhantomBuster</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="zoho" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Zoho Mail</TabsTrigger>
        </TabsList>

        {/* PHANTOMBUSTER */}
        <TabsContent value="phantombuster">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Imported", value: pbMetrics.totalImported, icon: ArrowUpRight },
                { label: "Total Syncs", value: pbMetrics.totalSyncs, icon: RefreshCw },
                { label: "Avg / Sync", value: pbMetrics.avgPerSync, icon: Activity },
                { label: "Success Rate", value: `${pbMetrics.successRate}%`, icon: Zap },
                { label: "Last Sync", value: pbMetrics.lastSync, icon: Clock },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Configuration */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">API Key</Label>
                  <Input type="password" value={pbKey} onChange={e => setPbKey(e.target.value)} placeholder="pb_xxxxxxxxxxxxxxxx" className="mt-1 font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Active Phantom</Label>
                  <Select value={pbSelectedPhantom} onValueChange={setPbSelectedPhantom}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {phantomConfigs.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-sync</p>
                    <p className="text-xs text-muted-foreground">Automatically import leads on schedule</p>
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
                  <Button size="sm" className="gap-1.5" onClick={handlePbSync} disabled={pbSyncing}>
                    <RefreshCw className={`w-3.5 h-3.5 ${pbSyncing ? "animate-spin" : ""}`} /> {pbSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button size="sm" variant={pbConnected ? "destructive" : "default"} onClick={() => { setPbConnected(!pbConnected); toast.success(pbConnected ? "Disconnected" : "Connected"); }}>
                    {pbConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sync History */}
            <div className="lg:col-span-2 glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Sync History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Timestamp</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Phantom</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Leads</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Duration</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {integrationSyncLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2.5 text-sm">{new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-3 py-2.5 text-sm">{log.source}</td>
                        <td className="px-3 py-2.5 text-sm font-medium">{log.leadsCount}</td>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground">{log.duration}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant={log.status === "success" ? "default" : log.status === "partial" ? "secondary" : "destructive"} className="text-xs">
                            {log.status}
                          </Badge>
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
            {/* Metrics */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Sent", value: waMetrics.totalSent.toLocaleString(), icon: Send },
                { label: "Sent Today", value: `${waMetrics.sentToday}/${waMetrics.limit}`, icon: Activity },
                { label: "Delivery Rate", value: `${waMetrics.deliveryRate}%`, icon: CheckCircle },
                { label: "Read Rate", value: `${waMetrics.readRate}%`, icon: Eye },
                { label: "Reply Rate", value: `${waMetrics.replyRate}%`, icon: Reply },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Config */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Connection
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Business Phone Number</Label>
                  <Input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Device Link</p>
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mx-auto">
                    <QrCode className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Scan to link WhatsApp device</p>
                </div>
                <Button size="sm" variant={waConnected ? "destructive" : "default"} onClick={() => { setWaConnected(!waConnected); toast.success(waConnected ? "WhatsApp disconnected" : "WhatsApp connected"); }}>
                  {waConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>

            {/* Rate Limit + Delivery Log */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Rate Limit
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages used today</span>
                    <span className="font-semibold">{waMetrics.sentToday} / {waMetrics.limit}</span>
                  </div>
                  <Progress value={(waMetrics.sentToday / waMetrics.limit) * 100} className="h-2.5" />
                  <p className="text-xs text-muted-foreground">{waMetrics.limit - waMetrics.sentToday} messages remaining • Resets at midnight UTC</p>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Recent Delivery Log
                </h3>
                <div className="space-y-2">
                  {[
                    { to: "Sarah Chen", time: "2 min ago", status: "read" },
                    { to: "Marcus Williams", time: "15 min ago", status: "delivered" },
                    { to: "Omar Hassan", time: "1 hr ago", status: "sent" },
                    { to: "James Rodriguez", time: "2 hrs ago", status: "replied" },
                    { to: "Elena Vasquez", time: "3 hrs ago", status: "read" },
                    { to: "Raj Kapoor", time: "5 hrs ago", status: "delivered" },
                    { to: "Lisa Park", time: "6 hrs ago", status: "failed" },
                    { to: "David Kim", time: "7 hrs ago", status: "read" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{entry.to}</p>
                        <p className="text-xs text-muted-foreground">{entry.time}</p>
                      </div>
                      <Badge variant={entry.status === "failed" ? "destructive" : entry.status === "replied" ? "default" : "secondary"} className="text-xs capitalize">
                        {entry.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ZOHO MAIL */}
        <TabsContent value="zoho">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics */}
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Sent", value: zohoMetrics.totalSent.toLocaleString(), icon: Send },
                { label: "Sent Today", value: zohoMetrics.sentToday, icon: Activity },
                { label: "Open Rate", value: `${zohoMetrics.openRate}%`, icon: Eye },
                { label: "Bounce Rate", value: `${zohoMetrics.bounceRate}%`, icon: AlertTriangle },
              ].map((m) => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            {/* SMTP Config */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Server className="w-4 h-4" /> SMTP Configuration
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">SMTP Host</Label>
                  <Input value={zohoHost} onChange={e => setZohoHost(e.target.value)} className="mt-1 font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Port</Label>
                  <Input value={zohoPort} onChange={e => setZohoPort(e.target.value)} className="mt-1 font-mono text-xs" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">TLS / SSL</p>
                    <p className="text-xs text-muted-foreground">Encrypt connection</p>
                  </div>
                  <Switch checked={zohoTls} onCheckedChange={setZohoTls} />
                </div>
                <div>
                  <Label className="text-xs">From Email</Label>
                  <Input value={zohoEmail} onChange={e => setZohoEmail(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5" onClick={handleTestZoho}>
                    <Zap className="w-3.5 h-3.5" /> Test Connection
                  </Button>
                  <Button size="sm" variant={zohoConnected ? "destructive" : "default"} onClick={() => { setZohoConnected(!zohoConnected); toast.success(zohoConnected ? "Disconnected" : "Connected"); }}>
                    {zohoConnected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Domain Verification + Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Domain Verification
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">regent.io</p>
                      <p className="text-xs text-muted-foreground">Primary sending domain</p>
                    </div>
                    <Badge variant="default" className="gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "SPF", status: "Pass" },
                      { label: "DKIM", status: "Pass" },
                      { label: "DMARC", status: "Pass" },
                    ].map((dns) => (
                      <div key={dns.label} className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-xs text-muted-foreground">{dns.label}</p>
                        <p className="text-sm font-semibold text-accent">{dns.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Email Performance (7 days)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Emails Sent", value: "584" },
                    { label: "Opened", value: "249 (42.8%)" },
                    { label: "Bounced", value: "8 (1.4%)" },
                    { label: "Unsubscribed", value: "2 (0.3%)" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

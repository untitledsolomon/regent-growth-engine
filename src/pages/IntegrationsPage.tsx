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
  AlertTriangle, Shield, QrCode, Server, Wifi, Search, Sparkles
} from "lucide-react";
import { integrationSyncLogs, phantomConfigs } from "@/data/mockData";

const categories = ['All', 'Data', 'Messaging', 'Email', 'CRM', 'Analytics'];

const allIntegrations = [
  { id: 'phantombuster', name: 'PhantomBuster', desc: 'LinkedIn automation & lead scraping', icon: Globe, category: 'Data', connected: false },
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Direct messaging via WhatsApp API', icon: MessageSquare, category: 'Messaging', connected: false },
  { id: 'zoho', name: 'Zoho Mail', desc: 'SMTP email outreach', icon: Mail, category: 'Email', connected: false },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM sync and lead management', icon: Zap, category: 'CRM', connected: false },
  { id: 'hubspot', name: 'HubSpot', desc: 'Marketing automation and CRM', icon: Activity, category: 'CRM', connected: false },
  { id: 'slack', name: 'Slack', desc: 'Team notifications and alerts', icon: MessageSquare, category: 'Messaging', connected: false },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // PhantomBuster state
  const [pbKey, setPbKey] = useState("");
  const [pbConnected, setPbConnected] = useState(false);
  const [pbSyncing, setPbSyncing] = useState(false);
  const [pbAutoSync, setPbAutoSync] = useState(true);
  const [pbSyncInterval, setPbSyncInterval] = useState("daily");
  const [pbSelectedPhantom, setPbSelectedPhantom] = useState(phantomConfigs[0]?.id || "");
  const [pbMetrics] = useState({ totalImported: 1247, lastSync: "Apr 5, 02:30 PM", avgPerSync: 42, successRate: 96.4, totalSyncs: 30 });
  const [syncLogs] = useState(integrationSyncLogs);

  // WhatsApp state
  const [waConnected, setWaConnected] = useState(false);
  const [waMetrics] = useState({ sentToday: 250, limit: 1000, deliveryRate: 97.2, readRate: 84.1, replyRate: 31.5, totalSent: 4820 });

  // Zoho state
  const [zohoConnected, setZohoConnected] = useState(false);
  const [zohoHost, setZohoHost] = useState("smtp.zoho.com");
  const [zohoPort, setZohoPort] = useState("587");
  const [zohoTls, setZohoTls] = useState(true);
  const [zohoEmail, setZohoEmail] = useState("");
  const [zohoPassword, setZohoPassword] = useState("");
  const [zohoMetrics] = useState({ sentToday: 89, bounceRate: 1.2, openRate: 42.7, totalSent: 3150 });

  const handlePbConnect = () => { if (!pbKey) { toast.error("Enter your API key first"); return; } setPbConnected(true); toast.success("PhantomBuster connected (placeholder)"); };
  const handlePbDisconnect = () => { setPbConnected(false); toast.success("Disconnected"); };
  const handlePbSync = () => { if (!pbConnected) { toast.error("Connect PhantomBuster first"); return; } setPbSyncing(true); setTimeout(() => { setPbSyncing(false); toast.success("Sync complete — 38 leads imported (mock)"); }, 2000); };
  const handleWaConnect = () => { setWaConnected(true); toast.success("WhatsApp connected (placeholder)"); };
  const handleWaDisconnect = () => { setWaConnected(false); toast.success("WhatsApp disconnected"); };
  const handleZohoConnect = () => { setZohoConnected(true); toast.success("Zoho Mail config saved (placeholder)"); };
  const handleZohoDisconnect = () => { setZohoConnected(false); toast.success("Zoho disconnected"); };
  const handleTestZoho = () => { toast.success("SMTP connection test passed (mock)"); };

  const filteredIntegrations = allIntegrations.filter(i => {
    const matchesCat = categoryFilter === 'All' || i.category === categoryFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <DashboardLayout>
      <PageHeader title="Integrations" subtitle="Connect your tools and supercharge your pipeline" />

      {/* Hero */}
      <div className="glass rounded-3xl p-8 mb-8 overflow-hidden relative">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Integration Hub</span>
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Connect your favorite tools</h2>
          <p className="text-muted-foreground text-sm max-w-lg">Sync leads from PhantomBuster, send messages via WhatsApp, automate email outreach with Zoho, and more.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-muted rounded-xl p-1">
          <TabsTrigger value="marketplace" className="rounded-lg">Marketplace</TabsTrigger>
          <TabsTrigger value="phantombuster" className="rounded-lg gap-1.5"><Globe className="w-3.5 h-3.5" /> PhantomBuster</TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-lg gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</TabsTrigger>
          <TabsTrigger value="zoho" className="rounded-lg gap-1.5"><Mail className="w-3.5 h-3.5" /> Zoho Mail</TabsTrigger>
        </TabsList>

        {/* MARKETPLACE */}
        <TabsContent value="marketplace">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search integrations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 rounded-xl" />
            </div>
            <div className="flex gap-1">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${categoryFilter === cat ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:bg-surface-mid'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration, i) => {
              const isConnected = integration.id === 'phantombuster' ? pbConnected : integration.id === 'whatsapp' ? waConnected : integration.id === 'zoho' ? zohoConnected : false;
              return (
                <div key={integration.id} className="glass rounded-2xl p-6 hover:shadow-md transition-all animate-slide-in cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => { if (['phantombuster', 'whatsapp', 'zoho'].includes(integration.id)) setActiveTab(integration.id); }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <integration.icon className="w-6 h-6 text-primary" />
                    </div>
                    {isConnected
                      ? <Badge className="bg-success/10 text-success border-success/20 gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Connected</Badge>
                      : <Badge variant="outline" className="text-muted-foreground gap-1 text-xs"><XCircle className="w-3 h-3" /> Available</Badge>
                    }
                  </div>
                  <h3 className="font-display font-semibold text-base">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{integration.desc}</p>
                  <div className="mt-4">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{integration.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

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
                <div key={m.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Wifi className="w-4 h-4" /> Configuration</h3>
              <div className="space-y-4">
                <div><Label className="text-xs">API Key</Label><Input type="password" value={pbKey} onChange={e => setPbKey(e.target.value)} placeholder="pb_xxxxxxxxxxxxxxxx" className="mt-1 font-mono text-xs rounded-xl" /></div>
                <div><Label className="text-xs">Active Phantom</Label>
                  <Select value={pbSelectedPhantom} onValueChange={setPbSelectedPhantom}><SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{phantomConfigs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Auto-sync</p><p className="text-xs text-muted-foreground">Import leads on schedule</p></div><Switch checked={pbAutoSync} onCheckedChange={setPbAutoSync} /></div>
                {pbAutoSync && (<div><Label className="text-xs">Sync Interval</Label><Select value={pbSyncInterval} onValueChange={setPbSyncInterval}><SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hourly">Every hour</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem></SelectContent></Select></div>)}
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5 rounded-xl" onClick={handlePbSync} disabled={pbSyncing || !pbConnected}><RefreshCw className={`w-3.5 h-3.5 ${pbSyncing ? "animate-spin" : ""}`} /> {pbSyncing ? "Syncing..." : "Sync Now"}</Button>
                  <Button size="sm" variant={pbConnected ? "destructive" : "default"} className="rounded-xl" onClick={pbConnected ? handlePbDisconnect : handlePbConnect}>{pbConnected ? "Disconnect" : "Connect"}</Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Sync History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">{["Timestamp", "Source", "Leads", "Duration", "Status"].map(h => (<th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">{h}</th>))}</tr></thead>
                  <tbody>{syncLogs.length === 0 ? (<tr><td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">No syncs yet</td></tr>) : syncLogs.map((log, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2.5 text-sm">{log.timestamp}</td><td className="px-3 py-2.5 text-sm">{log.source}</td><td className="px-3 py-2.5 text-sm font-medium">{log.leads_count}</td><td className="px-3 py-2.5 text-sm text-muted-foreground">{log.duration}</td>
                      <td className="px-3 py-2.5"><Badge variant={log.status === "success" ? "default" : log.status === "partial" ? "secondary" : "destructive"} className="text-xs">{log.status}</Badge></td>
                    </tr>))}</tbody>
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
                <div key={m.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Wifi className="w-4 h-4" /> Connection</h3>
              <div className="space-y-4">
                <div className="glass rounded-xl p-6 text-center"><QrCode className="w-16 h-16 mx-auto text-muted-foreground mb-2" /><p className="text-xs text-muted-foreground">Scan QR code from WhatsApp Business app</p></div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-muted-foreground" /><span className="text-sm">Rate Limit</span></div><span className="text-sm font-medium">{waMetrics.sentToday} / {waMetrics.limit}</span></div>
                <Progress value={(waMetrics.sentToday / waMetrics.limit) * 100} className="h-2" />
                <Button size="sm" variant={waConnected ? "destructive" : "default"} className="rounded-xl" onClick={waConnected ? handleWaDisconnect : handleWaConnect}>{waConnected ? "Disconnect" : "Connect"}</Button>
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Send className="w-4 h-4" /> Recent Delivery Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">{["Recipient", "Message", "Status", "Time"].map(h => (<th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">{h}</th>))}</tr></thead>
                  <tbody>{[
                    { to: "Sarah Chen", msg: "Hi Sarah, following up on...", status: "read", time: "2 min ago" },
                    { to: "James Wilson", msg: "Thanks for your interest...", status: "delivered", time: "15 min ago" },
                    { to: "Maria Garcia", msg: "Your proposal is ready...", status: "sent", time: "1 hr ago" },
                    { to: "David Kim", msg: "Meeting confirmed for...", status: "read", time: "2 hr ago" },
                    { to: "Lisa Park", msg: "Welcome to Regent...", status: "failed", time: "3 hr ago" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2.5 text-sm font-medium">{row.to}</td><td className="px-3 py-2.5 text-sm text-muted-foreground truncate max-w-[200px]">{row.msg}</td>
                      <td className="px-3 py-2.5"><Badge variant={row.status === "read" ? "default" : row.status === "delivered" ? "secondary" : row.status === "failed" ? "destructive" : "outline"} className="text-xs">{row.status}</Badge></td>
                      <td className="px-3 py-2.5 text-sm text-muted-foreground">{row.time}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ZOHO MAIL */}
        <TabsContent value="zoho">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Sent", value: zohoMetrics.totalSent.toLocaleString(), icon: Send },
                { label: "Sent Today", value: zohoMetrics.sentToday, icon: Mail },
                { label: "Bounce Rate", value: `${zohoMetrics.bounceRate}%`, icon: AlertTriangle },
                { label: "Open Rate", value: `${zohoMetrics.openRate}%`, icon: Eye },
              ].map((m) => (
                <div key={m.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1"><m.icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{m.label}</span></div>
                  <p className="font-display font-bold text-lg">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Server className="w-4 h-4" /> SMTP Configuration</h3>
              <div className="space-y-4">
                <div><Label className="text-xs">SMTP Host</Label><Input value={zohoHost} onChange={e => setZohoHost(e.target.value)} className="mt-1 rounded-xl" /></div>
                <div><Label className="text-xs">Port</Label><Input value={zohoPort} onChange={e => setZohoPort(e.target.value)} className="mt-1 rounded-xl" /></div>
                <div className="flex items-center justify-between"><div><p className="text-sm font-medium">TLS/SSL</p><p className="text-xs text-muted-foreground">Encrypt connection</p></div><Switch checked={zohoTls} onCheckedChange={setZohoTls} /></div>
                <div><Label className="text-xs">Email</Label><Input value={zohoEmail} onChange={e => setZohoEmail(e.target.value)} placeholder="outreach@company.com" className="mt-1 rounded-xl" /></div>
                <div><Label className="text-xs">Password</Label><Input type="password" value={zohoPassword} onChange={e => setZohoPassword(e.target.value)} placeholder="••••••••" className="mt-1 rounded-xl" /></div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={handleTestZoho}><Shield className="w-3.5 h-3.5" /> Test Connection</Button>
                  <Button size="sm" variant={zohoConnected ? "destructive" : "default"} className="rounded-xl" onClick={zohoConnected ? handleZohoDisconnect : handleZohoConnect}>{zohoConnected ? "Disconnect" : "Save & Connect"}</Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Recent Email Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">{["Recipient", "Subject", "Status", "Time"].map(h => (<th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase">{h}</th>))}</tr></thead>
                  <tbody>{[
                    { to: "Alex Johnson", subject: "Partnership Opportunity", status: "opened", time: "10 min ago" },
                    { to: "Taylor Brown", subject: "Follow-up: Our meeting", status: "delivered", time: "30 min ago" },
                    { to: "Jordan Lee", subject: "Your custom proposal", status: "bounced", time: "1 hr ago" },
                    { to: "Casey Smith", subject: "Welcome to Regent", status: "opened", time: "2 hr ago" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2.5 text-sm font-medium">{row.to}</td><td className="px-3 py-2.5 text-sm text-muted-foreground">{row.subject}</td>
                      <td className="px-3 py-2.5"><Badge variant={row.status === "opened" ? "default" : row.status === "delivered" ? "secondary" : "destructive"} className="text-xs">{row.status}</Badge></td>
                      <td className="px-3 py-2.5 text-sm text-muted-foreground">{row.time}</td>
                    </tr>))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, StatCard } from "@/components/DashboardWidgets";
import { useLeads } from "@/hooks/useLeads";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { dailyMetrics, aiInsights, funnelData, recentActivities } from "@/data/mockData";
import { Users, Send, MessageSquare, Trophy, TrendingUp, Lightbulb, AlertTriangle, Zap, Activity, UserPlus, MailCheck, Megaphone, Upload, ToggleRight, Plus, FileUp, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DashboardSkeleton } from "@/components/SkeletonLoaders";

const insightIcons = { opportunity: Zap, trend: TrendingUp, suggestion: Lightbulb, alert: AlertTriangle };
const insightColors = { high: 'border-l-destructive', medium: 'border-l-warning', low: 'border-l-success' };

const activityIcons = {
  lead_added: UserPlus, status_changed: Activity, message_sent: MailCheck,
  campaign_created: Megaphone, lead_imported: Upload, campaign_toggled: ToggleRight,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { leads, loading: leadsLoading } = useLeads();
  const { campaigns, loading: campaignsLoading } = useCampaigns();
  const { data: analytics, loading: analyticsLoading } = useAnalytics();
  const loading = leadsLoading || campaignsLoading || analyticsLoading;

  const totalLeads = leads.length;
  const contacted = leads.filter(l => l.status !== 'new').length;
  const replied = leads.filter(l => ['follow-up', 'interested', 'closed'].includes(l.status)).length;
  const conversions = leads.filter(l => l.status === 'closed').length;
  const conversionRate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : '0';

  const quickActions = [
    { label: "Add Lead", icon: Plus, action: () => navigate("/leads") },
    { label: "New Campaign", icon: Megaphone, action: () => navigate("/campaigns") },
    { label: "Compose Message", icon: PenSquare, action: () => navigate("/messages") },
    { label: "Import CSV", icon: FileUp, action: () => navigate("/leads") },
  ];

  if (loading) return <DashboardLayout><PageHeader title="Dashboard" subtitle="Loading..." /><DashboardSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's your acquisition overview." />

      <div className="flex flex-wrap gap-2 mb-6">
        {quickActions.map((qa) => (
          <Button key={qa.label} variant="outline" size="sm" className="gap-2 rounded-xl" onClick={qa.action}>
            <qa.icon className="w-4 h-4" /> {qa.label}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Leads" value={totalLeads} change="+12% vs last month" changeType="positive" icon={Users} color="primary" />
        <StatCard title="Contacted" value={contacted} change="+8% vs last month" changeType="positive" icon={Send} color="sky" />
        <StatCard title="Replies" value={replied} change="+15% vs last month" changeType="positive" icon={MessageSquare} color="gold" />
        <StatCard title="Conversions" value={conversions} change="+2 this week" changeType="positive" icon={Trophy} color="emerald" />
        <StatCard title="Conv. Rate" value={`${conversionRate}%`} change="+1.2pp" changeType="positive" icon={TrendingUp} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyMetrics}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(239, 64%, 55%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(239, 64%, 55%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 92%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 14%, 92%)', borderRadius: '12px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="leads" stroke="hsl(239, 64%, 55%)" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversions" stroke="hsl(152, 60%, 42%)" fillOpacity={1} fill="url(#colorConversions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Funnel Overview</h3>
          <div className="space-y-3">
            {funnelData.map((item, i) => (
              <div key={item.stage} className="animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.stage}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.value / funnelData[0].value) * 100}%`, background: item.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campaigns.filter(c => c.status !== 'draft')}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 92%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(250, 8%, 53%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 14%, 92%)', borderRadius: '12px', fontSize: '13px' }} />
              <Bar dataKey="sent" fill="hsl(239, 64%, 55%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="replied" fill="hsl(152, 60%, 42%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </h3>
          <div className="space-y-0">
            {recentActivities.slice(0, 6).map((activity, i) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex gap-3 py-2.5 animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className="p-1.5 rounded-xl bg-muted"><Icon className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    {i < 5 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {analytics?.content_attribution && Object.keys(analytics.content_attribution).length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Content → Lead Attribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.content_attribution).map(([postId, count]: [string, any]) => (
              <div key={postId} className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Post ID</p>
                <p className="font-mono text-sm font-semibold truncate">{postId}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs text-muted-foreground">Leads</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" /> AI Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, i) => {
            const Icon = insightIcons[insight.type];
            return (
              <div key={insight.id} className={`p-4 rounded-xl bg-muted/50 border-l-3 ${insightColors[insight.priority]} animate-slide-in`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-card">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

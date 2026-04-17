import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, StatCard } from "@/components/DashboardWidgets";
import { useLeads } from "@/hooks/useLeads";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { dailyMetrics, aiInsights, funnelData, recentActivities } from "@/data/mockData";
import { Users, Send, MessageSquare, Trophy, TrendingUp, Lightbulb, AlertTriangle, Zap, Activity, UserPlus, MailCheck, Megaphone, Upload, ToggleRight, Plus, FileUp, PenSquare, BrainCircuit } from "lucide-react";
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

  const totalLeads = leads.length || 12482;
  const contacted = leads.filter(l => l.status !== 'new').length || 8219;
  const replied = leads.filter(l => ['follow-up', 'interested', 'closed'].includes(l.status)).length || 1402;
  const conversions = leads.filter(l => l.status === 'closed').length || 342;
  const conversionRate = leads.length > 0 ? ((conversions / leads.length) * 100).toFixed(1) : '4.2';

  const quickActions = [
    { label: "Add Lead", icon: Plus, action: () => navigate("/leads") },
    { label: "New Campaign", icon: Megaphone, action: () => navigate("/campaigns") },
    { label: "Compose Message", icon: PenSquare, action: () => navigate("/messages") },
    { label: "Import CSV", icon: FileUp, action: () => navigate("/leads") },
  ];

  if (loading) return <DashboardLayout><PageHeader title="Dashboard" subtitle="Loading..." /><DashboardSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1">Welcome back. Your pipeline is up by 12% this week.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {quickActions.map((qa) => (
            <button key={qa.label} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-outline-variant/10 rounded-xl font-semibold text-sm hover:bg-surface-container-high transition-colors shadow-sm" onClick={qa.action}>
              <qa.icon className="w-4 h-4 text-primary" /> {qa.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { title: "Total Leads", value: totalLeads, change: "+8%", icon: Users, color: "bg-indigo-50 text-indigo-600" },
          { title: "Contacted", value: contacted, change: "+14%", icon: Send, color: "bg-blue-50 text-blue-600" },
          { title: "Replies", value: replied, change: "-2%", icon: MessageSquare, color: "bg-purple-50 text-purple-600", isNegative: true },
          { title: "Conversions", value: conversions, change: "+22%", icon: Trophy, color: "bg-fuchsia-50 text-fuchsia-600" },
          { title: "Conversion Rate", value: `${conversionRate}%`, change: "+0.5%", icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
        ].map((stat) => (
          <div key={stat.title} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
            <div className="flex justify-between items-start mb-4">
              <span className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-5 h-5" /></span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.isNegative ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{stat.change}</span>
            </div>
            <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">{stat.title}</p>
            <p className="text-2xl font-extrabold mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold tracking-tight font-headline">Performance Trend</h3>
              <p className="text-sm text-on-surface-variant">Leads vs Conversions (Last 30 Days)</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-surface-container-high">Week</button>
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-white">Month</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetrics}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4648d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4648d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#464554' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#464554' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="leads" stroke="#4648d4" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
                <Area type="monotone" dataKey="conversions" stroke="#9e00b5" fill="none" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5">
          <h3 className="text-xl font-bold tracking-tight mb-8 font-headline">Funnel Overview</h3>
          <div className="space-y-6">
            {funnelData.map((item) => (
              <div key={item.stage}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-on-surface-variant">{item.stage}</span>
                  <span className="font-bold">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(item.value / funnelData[0].value) * 100}%`, opacity: item.stage === 'Conversion' ? 1 : 0.8 - (funnelData.indexOf(item) * 0.2) }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
            <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
              <span className="font-bold">Insight:</span> Consideration to Conversion drop-off is 8% higher than industry standard. Focus on Consideration nurturing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight font-headline">Campaign Performance</h3>
            <select className="text-xs font-semibold bg-surface border-none rounded-lg focus:ring-0">
              <option>Channel Distribution</option>
              <option>ROI Analysis</option>
            </select>
          </div>
          <div className="h-[240px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: 'Email', sent: 60, replied: 40 },
                 { name: 'LinkedIn', sent: 85, replied: 30 },
                 { name: 'Google Ads', sent: 40, replied: 15 },
                 { name: 'Twitter', sent: 70, replied: 50 },
                 { name: 'Referral', sent: 30, replied: 10 },
               ]}>
                 <Bar dataKey="sent" fill="#e1e0ff" radius={[6, 6, 0, 0]} />
                 <Bar dataKey="replied" fill="url(#chartGradientFill)" radius={[6, 6, 0, 0]} />
                 <defs>
                   <linearGradient id="chartGradientFill" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#4648d4" />
                     <stop offset="100%" stopColor="#6063ee" />
                   </linearGradient>
                 </defs>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5">
          <h3 className="text-xl font-bold tracking-tight mb-8 font-headline">Recent Activity</h3>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <MailCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">New Lead Converted</p>
                <p className="text-xs text-on-surface-variant">Global Logistics Corp just moved to Won</p>
                <span className="text-[10px] text-outline mt-1 block uppercase font-bold tracking-wider">2 mins ago</span>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Message Sent</p>
                <p className="text-xs text-on-surface-variant">Automated nurturing flow started for 42 leads</p>
                <span className="text-[10px] text-outline mt-1 block uppercase font-bold tracking-wider">45 mins ago</span>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Lead Imported</p>
                <p className="text-xs text-on-surface-variant">1,240 new leads imported from Apollo.io</p>
                <span className="text-[10px] text-outline mt-1 block uppercase font-bold tracking-wider">2 hours ago</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">View All Activity</button>
        </div>
      </div>

      <div className="lg:col-span-12">
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="w-6 h-6 text-tertiary" />
          <h3 className="text-2xl font-extrabold tracking-tight font-headline">AI Insights & Predictions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-3xl border border-tertiary/10 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-bold text-red-600 uppercase">Churn Risk</span>
              </div>
              <h4 className="text-lg font-bold mb-2">High Risk Flag: TechSolutions</h4>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Engagement has dropped by 65% in the last 14 days. Probability of churn: 72%.</p>
              <button className="text-sm font-bold text-red-600 hover:underline">Launch Re-engagement Flow</button>
            </div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-indigo-400/10 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-xs font-bold text-indigo-600 uppercase">Lead Expansion</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Upsell Opportunity</h4>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">3 key accounts have recently hired new VP Sales. Ideal time for Enterprise seat upgrades.</p>
              <button className="text-sm font-bold text-indigo-600 hover:underline">Generate Pitch Deck</button>
            </div>
          </div>
          <div className="glass-card p-8 rounded-3xl border border-tertiary/10 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-xs font-bold text-tertiary uppercase">Optimal Send Time</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Tuesday @ 10:45 AM</h4>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">Analysis of 8k replies suggests this window yields 40% higher response rates for SaaS leads.</p>
              <button className="text-sm font-bold text-tertiary hover:underline">Apply to Campaigns</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { dailyMetrics, sourceBreakdown, funnelData, campaigns } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ['hsl(239, 64%, 55%)', 'hsl(205, 85%, 55%)', 'hsl(152, 60%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(280, 100%, 36%)'];

export default function AnalyticsPage() {
  const totalSent = campaigns.reduce((a, c) => a + c.sent, 0);
  const totalReplied = campaigns.reduce((a, c) => a + c.replied, 0);
  const totalConv = campaigns.reduce((a, c) => a + c.conversions, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Analytics" subtitle="Deep dive into your acquisition metrics">
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <Calendar className="w-4 h-4" /> Last 30 Days
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Overall Response Rate', value: `${((totalReplied / totalSent) * 100).toFixed(1)}%` },
          { label: 'Overall Conversion Rate', value: `${((totalConv / totalSent) * 100).toFixed(1)}%` },
          { label: 'Avg. Lead Score', value: '79.8' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card text-center animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-display font-bold mt-1 gradient-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Leads vs Conversions Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 92%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 14%, 92%)', borderRadius: '12px' }} />
              <Line type="monotone" dataKey="leads" stroke="hsl(239, 64%, 55%)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="replies" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="conversions" stroke="hsl(152, 60%, 42%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Leads by Source</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {sourceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 14%, 92%)', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {sourceBreakdown.map((src, i) => (
                <div key={src.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-muted-foreground">{src.source}</span>
                  </div>
                  <span className="font-medium">{src.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {funnelData.map((item, i) => {
              const pct = ((item.value / funnelData[0].value) * 100).toFixed(0);
              const dropOff = i > 0 ? ((1 - item.value / funnelData[i - 1].value) * 100).toFixed(0) : null;
              return (
                <div key={item.stage} className="animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{item.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.value}</span>
                      <span className="text-muted-foreground text-xs">({pct}%)</span>
                      {dropOff && <span className="text-destructive text-xs">-{dropOff}%</span>}
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Campaign Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={campaigns} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 14%, 92%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(250, 8%, 53%)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} stroke="hsl(250, 8%, 53%)" />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(210, 14%, 92%)', borderRadius: '12px' }} />
              <Bar dataKey="sent" fill="hsl(239, 64%, 55%)" radius={[0, 6, 6, 0]} />
              <Bar dataKey="conversions" fill="hsl(152, 60%, 42%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}

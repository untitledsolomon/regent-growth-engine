import { DashboardLayout } from "@/components/DashboardLayout";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, Filter, Download, ArrowUp, ArrowDown, DollarSign, Clock, Zap, Target } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const COLORS = ['#4648d4', '#9e00b5', '#515f74', '#fbabff', '#c028d7'];

export default function AnalyticsPage() {
  const { dailyMetrics, sourceBreakdown, funnelData, campaigns } = useAnalytics();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-headline">Performance Analytics</h1>
          <p className="text-on-surface-variant mt-1 font-body">Real-time insight into your growth engine velocity.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center px-3 py-2 text-sm font-bold text-on-surface-variant bg-surface-container-low rounded-lg cursor-pointer">
            <Calendar className="w-4 h-4 mr-2" />
            Oct 1, 2023 - Oct 31, 2023
          </div>
          <div className="h-6 w-[1px] bg-outline-variant/30"></div>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-16 h-16 text-primary" />
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Revenue</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">$428,500</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUp className="w-3 h-3" /> 12.5%
            </span>
          </div>
          <p className="text-[10px] text-outline mt-2 font-bold uppercase tracking-tight">+$48k vs last month</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5 relative">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Acquisition Cost (CAC)</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">$184.20</h3>
            <span className="text-xs font-bold text-rose-600 flex items-center bg-rose-50 px-2 py-0.5 rounded-full">
              <ArrowUp className="w-3 h-3" /> 4.1%
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-[10px] text-outline mt-2 font-bold uppercase tracking-tight">Target: &lt; $150.00</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Close Velocity</p>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">14.2 Days</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowDown className="w-3 h-3" /> 2.4d
            </span>
          </div>
          <div className="mt-6 flex gap-1 h-8">
            {[20, 40, 60, 100, 50, 20, 10].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm bg-primary" style={{ opacity: v/100 }} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/5 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-on-surface font-headline">Lead Attribution by Source</h3>
              <p className="text-sm text-on-surface-variant font-body">Volume tracking across primary channels</p>
            </div>
            <div className="flex gap-4">
              {['LinkedIn', 'Ads', 'Referral'].map((src, i) => (
                <div key={src} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">{src}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetrics}>
                <defs>
                  <linearGradient id="colorSource" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4648d4" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4648d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#767586', fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#767586', fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="leads" stroke="#4648d4" fillOpacity={1} fill="url(#colorSource)" strokeWidth={3} />
                <Area type="monotone" dataKey="replies" stroke="#9e00b5" fill="none" strokeWidth={3} />
                <Area type="monotone" dataKey="conversions" stroke="#515f74" fill="none" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-3xl shadow-xl text-white flex flex-col">
          <h3 className="text-xl font-bold font-headline mb-2">Conversion Funnel</h3>
          <p className="text-slate-400 text-sm mb-8 font-body">Efficiency across journey stages</p>
          <div className="space-y-8 flex-1">
            <div className="relative">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-slate-400">
                <span>Total Visitors</span>
                <span className="text-white">45,200</span>
              </div>
              <div className="h-10 w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <div className="h-full signature-gradient" style={{ width: '100%' }}></div>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center text-[10px] text-rose-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-rose-900/50">
                <ArrowDown className="w-2.5 h-2.5 mr-1" /> 62% Drop
              </div>
            </div>
            <div className="relative pt-4">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-slate-400">
                <span>Qualified Leads</span>
                <span className="text-white">17,176</span>
              </div>
              <div className="h-10 w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <div className="h-full signature-gradient opacity-80" style={{ width: '38%' }}></div>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center text-[10px] text-rose-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-rose-900/50">
                <ArrowDown className="w-2.5 h-2.5 mr-1" /> 84% Drop
              </div>
            </div>
            <div className="pt-4">
              <div className="flex justify-between text-xs mb-2 font-bold uppercase tracking-widest text-slate-400">
                <span>Sales Closed</span>
                <span className="text-white">2,748</span>
              </div>
              <div className="h-10 w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                <div className="h-full bg-tertiary" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Net Conversion Rate</p>
            <p className="text-3xl font-extrabold text-white">6.08%</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface font-headline">Top Performing Campaigns</h3>
          <button className="text-sm font-bold text-primary hover:underline uppercase tracking-widest">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-[10px] font-bold text-outline uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Campaign Name</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Leads</th>
                <th className="px-8 py-4 text-right">ROI</th>
                <th className="px-8 py-4 text-right">Conversion</th>
                <th className="px-8 py-4">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {[
                { name: 'Q4 Enterprise Push', source: 'Google Ads', status: 'Active', leads: '1,482', roi: '485%', conv: '12.4%', eff: 92 },
                { name: 'Video Retargeting B', source: 'LinkedIn', status: 'Active', leads: '894', roi: '312%', conv: '8.1%', eff: 65 },
                { name: 'Executive Outreach', source: 'Referral', status: 'Paused', leads: '324', roi: '740%', conv: '24.2%', eff: 48 },
              ].map((c) => (
                <tr key={c.name} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{c.name}</p>
                        <p className="text-xs text-on-surface-variant">{c.source} • High Intent</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold rounded-md uppercase tracking-wider`}>{c.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-on-surface">{c.leads}</td>
                  <td className="px-8 py-5 text-right font-extrabold text-on-surface">{c.roi}</td>
                  <td className="px-8 py-5 text-right font-bold text-on-surface">{c.conv}</td>
                  <td className="px-8 py-5">
                    <div className="w-32 h-1.5 bg-surface-container-high rounded-full ml-auto overflow-hidden">
                      <div className="h-full signature-gradient rounded-full" style={{ width: `${c.eff}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Megaphone, Send, Users, Trophy } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";

export default function CampaignsPage() {
  const { campaigns, loading } = useCampaigns();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">Campaign Management</h2>
          <p className="text-on-surface-variant mt-1">Orchestrate and monitor your multi-channel outreach flows.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="gap-2 rounded-xl border-outline-variant/10 shadow-sm">
             <Filter className="w-4 h-4" /> Filter
           </Button>
           <Button className="gap-2 rounded-xl signature-gradient text-white font-bold shadow-lg shadow-indigo-500/20">
             <Plus className="w-4 h-4" /> New Campaign
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Active Campaigns', value: '12', icon: Megaphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Sent', value: '45,280', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. ROI', value: '412%', icon: Trophy, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-extrabold text-on-surface">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/5 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/5 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="relative w-full max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-400/50 transition-all outline-none" placeholder="Search campaigns..." type="text" />
           </div>
           <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mr-2">Sort by:</span>
             <select className="bg-surface-container-low border-none rounded-lg text-xs font-bold py-1.5 px-3 focus:ring-0">
               <option>Performance</option>
               <option>Creation Date</option>
               <option>Lead Volume</option>
             </select>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50 text-[10px] font-bold text-outline uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Campaign Details</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Sent</th>
                <th className="px-8 py-4 text-right">Replies</th>
                <th className="px-8 py-4 text-right">Conversions</th>
                <th className="px-8 py-4">Health</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer" onClick={() => navigate(`/analytics?campaign=${c.id}`)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{c.name}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 capitalize">
                           {c.channels.join(' • ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={c.status === 'active' ? 'contacted' : 'closed'} />
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-on-surface">{c.sent.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-bold text-on-surface">{c.replied.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right font-extrabold text-primary">{c.conversions.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="w-32 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full signature-gradient rounded-full" style={{ width: `${(c.replied / c.sent * 100) || 0}%` }}></div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-1 hover:bg-surface-container-high rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4 text-outline" />
                    </button>
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

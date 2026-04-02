import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { campaigns } from "@/data/mockData";
import { Plus, Play, Pause, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const statusIcons = { draft: FileText, active: Play, paused: Pause, completed: CheckCircle };
const statusColors = { 
  draft: 'bg-muted text-muted-foreground', 
  active: 'bg-regent-emerald/15 text-regent-emerald', 
  paused: 'bg-regent-gold/15 text-regent-gold', 
  completed: 'bg-primary/15 text-primary' 
};

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Campaigns" subtitle="Manage your outreach campaigns">
        <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {campaigns.map((campaign, i) => {
          const Icon = statusIcons[campaign.status];
          const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(0) : '0';
          const convRate = campaign.sent > 0 ? ((campaign.conversions / campaign.sent) * 100).toFixed(0) : '0';
          
          return (
            <div key={campaign.id} className="glass rounded-xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-slide-in cursor-pointer" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-base truncate">{campaign.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{campaign.channel} channel</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                  <Icon className="w-3 h-3" /> {campaign.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold">{campaign.leadsCount}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold">{campaign.sent}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Reply Rate</span>
                  <span className="font-medium">{replyRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-regent-sky transition-all duration-500" style={{ width: `${replyRate}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">{convRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-regent-emerald transition-all duration-500" style={{ width: `${convRate}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Campaign } from "@/data/mockData";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Plus, Play, Pause, CheckCircle, FileText, Send, Eye, Reply, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignDetailDrawer } from "@/components/CampaignDetailDrawer";
import { CardSkeleton } from "@/components/SkeletonLoaders";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const statusIcons = { draft: FileText, active: Play, paused: Pause, completed: CheckCircle };
const statusColors = { 
  draft: 'bg-muted text-muted-foreground', 
  active: 'bg-success/10 text-success', 
  paused: 'bg-warning/10 text-warning', 
  completed: 'bg-primary/10 text-primary' 
};

export default function CampaignsPage() {
  const { campaigns: initial, loading } = useCampaigns();
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  useEffect(() => { if (!loading) setCampaignsList(initial); }, [initial, loading]);

  const handleAdd = (campaign: Campaign) => { setCampaignsList(prev => [campaign, ...prev]); toast.success(`Campaign "${campaign.name}" created`); };
  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCampaignsList(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = c.status === 'draft' ? 'active' : c.status === 'active' ? 'paused' : c.status === 'paused' ? 'active' : c.status;
      if (next !== c.status) toast.info(`Campaign "${c.name}" ${next}`);
      return { ...c, status: next };
    }));
  };

  return (
    <DashboardLayout>
      <PageHeader title="Campaigns" subtitle="Manage your outreach campaigns">
        <Button size="sm" className="gap-2 rounded-xl gradient-primary text-white" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Campaign</Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : campaignsList.length === 0 ? (
        <EmptyState title="No campaigns yet" description="Create your first outreach campaign to start engaging leads" actionLabel="New Campaign" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-3">
          {campaignsList.map((campaign, i) => {
            const Icon = statusIcons[campaign.status];
            const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(0) : '0';
            const convRate = campaign.sent > 0 ? ((campaign.conversions / campaign.sent) * 100).toFixed(0) : '0';
            return (
              <div key={campaign.id} className="glass rounded-2xl p-5 hover:shadow-md transition-all duration-300 animate-slide-in cursor-pointer" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setDetailCampaign(campaign)}>
                <div className="flex items-center gap-5">
                  <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold text-base truncate">{campaign.name}</h3>
                      <button onClick={(e) => toggleStatus(campaign.id, e)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        <Icon className="w-3 h-3" /> {campaign.status}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{campaign.channel} channel • {campaign.leads_count} leads</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Send className="w-3 h-3" /><span className="text-xs">Sent</span></div>
                      <p className="font-display font-bold text-lg">{campaign.sent}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Eye className="w-3 h-3" /><span className="text-xs">Opened</span></div>
                      <p className="font-display font-bold text-lg">{Math.round(campaign.sent * 0.45)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><Reply className="w-3 h-3" /><span className="text-xs">Replied</span></div>
                      <p className="font-display font-bold text-lg">{campaign.replied}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-0.5"><TrendingUp className="w-3 h-3" /><span className="text-xs">Conv.</span></div>
                      <p className="font-display font-bold text-lg">{convRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} onAdd={handleAdd} />
      <CampaignDetailDrawer campaign={detailCampaign} open={!!detailCampaign} onOpenChange={v => { if (!v) setDetailCampaign(null); }} />
    </DashboardLayout>
  );
}

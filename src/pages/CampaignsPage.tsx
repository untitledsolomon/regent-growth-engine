import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { Campaign } from "@/data/mockData";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Plus, Play, Pause, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignDetailDrawer } from "@/components/CampaignDetailDrawer";
import { CardSkeleton } from "@/components/SkeletonLoaders";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const statusIcons = { draft: FileText, active: Play, paused: Pause, completed: CheckCircle };
const statusColors = { draft: 'bg-muted text-muted-foreground', active: 'bg-accent/15 text-accent', paused: 'bg-regent-gold/15 text-regent-gold', completed: 'bg-primary/15 text-primary' };

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
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> New Campaign</Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : campaignsList.length === 0 ? (
        <EmptyState title="No campaigns yet" description="Create your first outreach campaign to start engaging leads" actionLabel="New Campaign" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {campaignsList.map((campaign, i) => {
            const Icon = statusIcons[campaign.status];
            const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(0) : '0';
            const convRate = campaign.sent > 0 ? ((campaign.conversions / campaign.sent) * 100).toFixed(0) : '0';
            return (
              <div key={campaign.id} className="glass rounded-xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-slide-in cursor-pointer" style={{ animationDelay: `${i * 80}ms` }} onClick={() => setDetailCampaign(campaign)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate" style={{ fontFamily: 'Space Grotesk' }}>{campaign.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{campaign.channel} channel</p>
                  </div>
                  <button onClick={(e) => toggleStatus(campaign.id, e)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusColors[campaign.status]}`}>
                    <Icon className="w-3 h-3" /> {campaign.status}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold">{campaign.leads_count}</p><p className="text-xs text-muted-foreground">Leads</p></div>
                  <div className="bg-muted/50 rounded-lg p-2.5 text-center"><p className="text-lg font-bold">{campaign.sent}</p><p className="text-xs text-muted-foreground">Sent</p></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Reply Rate</span><span className="font-medium">{replyRate}%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${replyRate}%` }} /></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Conversion Rate</span><span className="font-medium">{convRate}%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${convRate}%` }} /></div>
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

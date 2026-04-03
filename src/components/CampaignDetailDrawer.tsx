import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Campaign, leads, messages as allMessages } from "@/data/mockData";
import { BarChart3, Users, Send, Reply, Trophy, Calendar } from "lucide-react";

interface CampaignDetailDrawerProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailDrawer({ campaign, open, onOpenChange }: CampaignDetailDrawerProps) {
  if (!campaign) return null;

  const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';
  const convRate = campaign.sent > 0 ? ((campaign.conversions / campaign.sent) * 100).toFixed(1) : '0';
  const deliveryRate = campaign.sent > 0 ? ((campaign.delivered / campaign.sent) * 100).toFixed(1) : '0';

  // Mock: assign some leads to campaign
  const campaignLeads = leads.slice(0, Math.min(campaign.leadsCount, leads.length));
  const campaignMessages = allMessages.filter(m => campaignLeads.some(l => l.id === m.leadId));

  const metrics = [
    { label: 'Total Leads', value: campaign.leadsCount, icon: Users, color: 'text-primary' },
    { label: 'Sent', value: campaign.sent, icon: Send, color: 'text-regent-sky' },
    { label: 'Replied', value: campaign.replied, icon: Reply, color: 'text-regent-gold' },
    { label: 'Conversions', value: campaign.conversions, icon: Trophy, color: 'text-regent-emerald' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{campaign.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Channel */}
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">{campaign.status}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">{campaign.channel} channel</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> {campaign.createdAt}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-muted/50 text-center">
                <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.color}`} />
                <p className="text-xl font-bold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Rates */}
          <div className="space-y-3">
            {[
              { label: 'Delivery Rate', value: deliveryRate, color: 'bg-regent-sky' },
              { label: 'Reply Rate', value: replyRate, color: 'bg-regent-gold' },
              { label: 'Conversion Rate', value: convRate, color: 'bg-regent-emerald' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${r.color} transition-all duration-500`} style={{ width: `${r.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Assigned Leads */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Assigned Leads ({campaignLeads.length})
            </p>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {campaignLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50">
                  <div>
                    <p className="text-xs font-medium">{lead.name}</p>
                    <p className="text-[10px] text-muted-foreground">{lead.business}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    lead.status === 'closed' ? 'bg-regent-emerald/15 text-regent-emerald' :
                    lead.status === 'interested' ? 'bg-regent-gold/15 text-regent-gold' :
                    'bg-muted text-muted-foreground'
                  }`}>{lead.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Campaign Messages ({campaignMessages.length})
            </p>
            {campaignMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No messages sent in this campaign</p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {campaignMessages.map(msg => (
                  <div key={msg.id} className="p-2.5 rounded-lg border border-border/50 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{msg.leadName}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">{msg.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{msg.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { ScoreBadge } from "@/components/StatusBadge";
import { leads as initialLeads, Lead, LeadStatus } from "@/data/mockData";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";

const stages: { key: LeadStatus; label: string; dotColor: string }[] = [
  { key: 'new', label: 'New', dotColor: 'bg-info' },
  { key: 'contacted', label: 'Contacted', dotColor: 'bg-primary' },
  { key: 'follow-up', label: 'Follow-up', dotColor: 'bg-warning' },
  { key: 'interested', label: 'Interested', dotColor: 'bg-success' },
  { key: 'closed', label: 'Closed', dotColor: 'bg-accent' },
];

const sourceBadges: Record<string, { label: string; className: string }> = {
  phantombuster: { label: 'PHANTOMBUSTER', className: 'bg-primary/10 text-primary' },
  linkedin: { label: 'LINKEDIN', className: 'bg-info/10 text-info' },
  referral: { label: 'REFERRAL', className: 'bg-success/10 text-success' },
  website: { label: 'INBOUND', className: 'bg-warning/10 text-warning' },
  'cold-outreach': { label: 'OUTBOUND', className: 'bg-accent/10 text-accent' },
};

export default function PipelinePage() {
  const [pipelineLeads, setPipelineLeads] = useState<Lead[]>(initialLeads);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);

  const handleDrop = (targetStatus: LeadStatus) => {
    if (!draggedLead) return;
    setPipelineLeads(prev => prev.map(l => l.id === draggedLead ? { ...l, status: targetStatus } : l));
    setDraggedLead(null);
    toast.success('Lead moved');
  };

  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    setPipelineLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    setDetailLead(prev => prev && prev.id === leadId ? { ...prev, status } : prev);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Pipeline" subtitle="Drag leads between stages to update their status" />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageLeads = pipelineLeads.filter(l => l.status === stage.key);
          const totalValue = stageLeads.length * 2500; // mock deal value
          return (
            <div
              key={stage.key}
              className="min-w-[280px] flex-1 bg-muted/50 rounded-2xl"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                    <h3 className="font-display font-semibold text-sm">{stage.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-card text-muted-foreground text-xs font-medium border border-border">{stageLeads.length}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-4.5">${totalValue.toLocaleString()} total value</p>
              </div>
              <div className="px-3 pb-3 space-y-2 min-h-[300px]">
                {stageLeads.map(lead => {
                  const badge = sourceBadges[lead.source] || sourceBadges['cold-outreach'];
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      onClick={() => setDetailLead(lead)}
                      className={`p-4 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${draggedLead === lead.id ? 'opacity-50 scale-95' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${badge.className}`}>{badge.label}</span>
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </div>
                      <p className="font-semibold text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lead.business}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <ScoreBadge score={lead.score} />
                        <span className="text-xs text-muted-foreground">2d ago</span>
                      </div>
                    </div>
                  );
                })}
                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <LeadDetailDrawer
        lead={detailLead}
        open={!!detailLead}
        onOpenChange={v => { if (!v) setDetailLead(null); }}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
}

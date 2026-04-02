import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { ScoreBadge } from "@/components/StatusBadge";
import { leads as initialLeads, Lead, LeadStatus } from "@/data/mockData";

const stages: { key: LeadStatus; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'border-t-regent-sky' },
  { key: 'contacted', label: 'Contacted', color: 'border-t-primary' },
  { key: 'follow-up', label: 'Follow-up', color: 'border-t-regent-gold' },
  { key: 'interested', label: 'Interested', color: 'border-t-regent-emerald' },
  { key: 'closed', label: 'Closed', color: 'border-t-accent' },
];

export default function PipelinePage() {
  const [pipelineLeads, setPipelineLeads] = useState<Lead[]>(initialLeads);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const handleDragStart = (leadId: string) => setDraggedLead(leadId);

  const handleDrop = (targetStatus: LeadStatus) => {
    if (!draggedLead) return;
    setPipelineLeads(prev => prev.map(l => l.id === draggedLead ? { ...l, status: targetStatus } : l));
    setDraggedLead(null);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Pipeline" subtitle="Drag leads between stages to update their status" />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageLeads = pipelineLeads.filter(l => l.status === stage.key);
          return (
            <div
              key={stage.key}
              className={`min-w-[260px] flex-1 glass rounded-xl border-t-2 ${stage.color}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">{stage.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">{stageLeads.length}</span>
                </div>
              </div>
              <div className="p-3 space-y-2 min-h-[300px]">
                {stageLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className={`p-3 rounded-lg bg-background border border-border/50 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${draggedLead === lead.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lead.business}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <ScoreBadge score={lead.score} />
                      <div className="flex gap-1">
                        {lead.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

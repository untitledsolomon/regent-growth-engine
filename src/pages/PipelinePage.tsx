import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ScoreBadge } from "@/components/StatusBadge";
import { leads as initialLeads, Lead, LeadStatus } from "@/data/mockData";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { toast } from "sonner";
import { GripVertical, Filter, Calendar, BrainCircuit, ArrowUp, ArrowDown, CheckCircle2, Clock, PlusCircle, Paperclip, AlertCircle } from "lucide-react";

const stages: { key: LeadStatus; label: string; dotColor: string }[] = [
  { key: 'new', label: 'New', dotColor: 'bg-primary' },
  { key: 'contacted', label: 'Contacted', dotColor: 'bg-amber-400' },
  { key: 'qualified', label: 'Qualified', dotColor: 'bg-indigo-500' },
  { key: 'follow-up', label: 'Proposal', dotColor: 'bg-purple-500' },
  { key: 'interested', label: 'Negotiation', dotColor: 'bg-orange-500' },
  { key: 'closed', label: 'Closed Won', dotColor: 'bg-emerald-500' },
];

const sourceBadges: Record<string, { label: string; className: string }> = {
  phantombuster: { label: 'PHANTOMBUSTER', className: 'bg-primary/10 text-primary' },
  linkedin: { label: 'FOLLOW UP', className: 'bg-secondary-container text-on-secondary-container' },
  referral: { label: 'PRIORITY', className: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  website: { label: 'INBOUND', className: 'bg-secondary-container text-on-secondary-container' },
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
      <div className="flex h-full min-h-[calc(100vh-12rem)]">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-1 font-headline">Sales Pipeline</h2>
              <p className="text-on-surface-variant text-sm">Managing {pipelineLeads.length} active deals across 6 stages.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                ))}
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+8</div>
              </div>
              <button className="bg-surface-container-lowest p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              <button className="bg-surface-container-lowest p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-stretch">
            {stages.map(stage => {
              const stageLeads = pipelineLeads.filter(l => l.status === stage.key);
              const totalValue = stageLeads.length * 2500;
              return (
                <div
                  key={stage.key}
                  className="flex flex-col w-72 shrink-0 group"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(stage.key)}
                >
                  <div className="flex items-center justify-between px-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`}></span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-headline">{stage.label}</h3>
                      <span className="text-xs font-medium text-on-surface-variant bg-surface-container-high px-1.5 rounded">{stageLeads.length}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {stage.label === 'Proposal' && stageLeads.length > 0 && (
                      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border-2 border-primary/10 border-dashed bg-primary/[0.02] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/[0.04]">
                        <PlusCircle className="w-6 h-6 text-primary/40" />
                        <p className="text-center text-[10px] font-bold text-primary uppercase tracking-tighter">Draft New Proposal</p>
                      </div>
                    )}

                    {stageLeads.map(lead => {
                      const badge = sourceBadges[lead.source] || sourceBadges['cold-outreach'];
                      const isUrgent = lead.score > 85;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={() => handleDragStart(lead.id)}
                          onClick={() => setDetailLead(lead)}
                          className={`bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-transparent hover:border-primary/20 group/card relative overflow-hidden ${draggedLead === lead.id ? 'opacity-50' : ''}`}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                            <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                          <h4 className="font-bold text-on-surface text-sm mb-0.5 font-headline">{lead.name}</h4>
                          <p className="text-xs text-on-surface-variant mb-4">{lead.business}</p>

                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-sm font-bold text-primary">${totalValue.toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                              {isUrgent && <AlertCircle className="w-4 h-4 text-error" />}
                              <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                                <Clock className="w-3 h-3" /> 2h
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="w-80 bg-white dark:bg-slate-950 border-l border-outline-variant/10 p-6 hidden xl:block overflow-y-auto">
          <h3 className="text-lg font-bold font-headline mb-6">Pipeline Insights</h3>
          <div className="space-y-6">
            <div className="signature-gradient p-4 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">AI Prediction</span>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">Lead conversion probability is 85% likely to increase if you schedule a follow-up call today.</p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-xs font-bold transition-colors">
                Draft Outreach
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Win Rate</p>
                <p className="text-xl font-bold text-on-surface">64%</p>
                <p className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1">
                  <ArrowUp className="w-3 h-3" /> 12%
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Avg. Cycle</p>
                <p className="text-xl font-bold text-on-surface">18d</p>
                <p className="text-[10px] text-error flex items-center gap-0.5 mt-1">
                  <ArrowDown className="w-3 h-3" /> 2d
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-4 flex items-center justify-between">
                Recent Activity
                <span className="text-[10px] text-primary cursor-pointer">View All</span>
              </h4>
              <div className="space-y-4">
                {[
                  { user: 'Julian Black', action: 'moved to Contacted', time: '22 mins ago', color: 'bg-emerald-500' },
                  { user: 'New Lead', action: 'Alex Thompson (Inbound)', time: '2 hours ago', color: 'bg-primary' },
                  { user: 'David Chen', action: 'viewed the proposal', time: '5 hours ago', color: 'bg-tertiary' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${act.color}`}></div>
                    <div>
                      <p className="text-xs text-on-surface"><strong>{act.user}</strong> {act.action}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
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

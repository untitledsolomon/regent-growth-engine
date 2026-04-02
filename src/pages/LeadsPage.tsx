import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";
import { leads as initialLeads, Lead, LeadStatus } from "@/data/mockData";
import { Search, Upload, Filter, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { CSVImportDialog } from "@/components/CSVImportDialog";
import { toast } from "sonner";

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [addOpen, setAddOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const filtered = leadsList.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.business.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'follow-up', 'interested', 'closed'];

  const handleAddLead = (lead: Lead) => {
    setLeadsList(prev => [lead, ...prev]);
    toast.success(`${lead.name} added to leads`);
  };

  const handleUpdateLead = (lead: Lead) => {
    setLeadsList(prev => prev.map(l => l.id === lead.id ? lead : l));
    setEditLead(null);
    toast.success(`${lead.name} updated`);
  };

  const handleImport = (imported: Lead[]) => {
    setLeadsList(prev => [...imported, ...prev]);
    toast.success(`${imported.length} leads imported successfully`);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Leads" subtitle={`${leadsList.length} total leads in your pipeline`}>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setCsvOpen(true)}><Upload className="w-4 h-4" /> Import CSV</Button>
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Lead</Button>
      </PageHeader>

      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Business</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Tags</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-slide-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{lead.business}</td>
                  <td className="px-4 py-3 text-sm capitalize text-muted-foreground hidden md:table-cell">{lead.source}</td>
                  <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {lead.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditLead(lead)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No leads found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <AddLeadDialog open={addOpen || !!editLead} onOpenChange={(v) => { if (!v) { setAddOpen(false); setEditLead(null); } else setAddOpen(true); }} onAdd={handleAddLead} editLead={editLead} onUpdate={handleUpdateLead} />
      <CSVImportDialog open={csvOpen} onOpenChange={setCsvOpen} onImport={handleImport} />
    </DashboardLayout>
  );
}

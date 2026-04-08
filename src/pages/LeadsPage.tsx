import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";
import { Lead, LeadStatus } from "@/data/mockData";
import { useLeads } from "@/hooks/useLeads";
import { Search, Upload, Filter, Plus, Pencil, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { CSVImportDialog } from "@/components/CSVImportDialog";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton } from "@/components/SkeletonLoaders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function LeadsPage() {
  const { leads: initialLeads, loading } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { if (!loading) setLeadsList(initialLeads); }, [initialLeads, loading]);

  const filtered = leadsList.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.business.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const statuses: (LeadStatus | 'all')[] = ['all', 'new', 'contacted', 'follow-up', 'interested', 'closed'];

  const handleAddLead = (lead: Lead) => { setLeadsList(prev => [lead, ...prev]); toast.success(`${lead.name} added to leads`); };
  const handleUpdateLead = (lead: Lead) => { setLeadsList(prev => prev.map(l => l.id === lead.id ? lead : l)); setEditLead(null); toast.success(`${lead.name} updated`); };
  const handleImport = (imported: Lead[]) => { setLeadsList(prev => [...imported, ...prev]); toast.success(`${imported.length} leads imported successfully`); };
  const handleDeleteLead = (leadId: string) => { setLeadsList(prev => prev.filter(l => l.id !== leadId)); toast.success('Lead deleted'); };
  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    setLeadsList(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    setDetailLead(prev => prev && prev.id === leadId ? { ...prev, status } : prev);
    toast.success('Status updated');
  };
  const toggleSelect = (id: string) => { setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const toggleSelectAll = () => { selectedIds.size === filtered.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(l => l.id))); };
  const handleBulkStatusChange = (status: LeadStatus) => { setLeadsList(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, status } : l)); toast.success(`${selectedIds.size} leads updated to ${status}`); setSelectedIds(new Set()); };
  const handleBulkDelete = () => { setLeadsList(prev => prev.filter(l => !selectedIds.has(l.id))); toast.success(`${selectedIds.size} leads deleted`); setSelectedIds(new Set()); setBulkDeleteOpen(false); };
  const handleExportCSV = () => {
    const headers = ['Name', 'Business', 'Email', 'Phone', 'Source', 'Score', 'Status', 'Tags', 'Created'];
    const rows = filtered.map(l => [l.name, l.business, l.email, l.phone, l.source, l.score, l.status, l.tags.join(';'), l.created_at]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} leads exported`);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Leads" subtitle={`${leadsList.length} total leads in your pipeline`}>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handleExportCSV}><Download className="w-4 h-4" /> Export</Button>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => setCsvOpen(true)}><Upload className="w-4 h-4" /> Import CSV</Button>
        <Button size="sm" className="gap-2 rounded-xl gradient-primary text-white" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Lead</Button>
      </PageHeader>

      {selectedIds.size > 0 && (
        <div className="glass rounded-2xl p-3 mb-4 flex items-center gap-3 animate-slide-in">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Select onValueChange={v => handleBulkStatusChange(v as LeadStatus)}>
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-xl"><SelectValue placeholder="Change status" /></SelectTrigger>
            <SelectContent>
              {statuses.filter(s => s !== 'all').map(s => (<SelectItem key={s} value={s}>{(s as string).charAt(0).toUpperCase() + (s as string).slice(1)}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="destructive" size="sm" className="gap-1 h-8 text-xs rounded-xl" onClick={() => setBulkDeleteOpen(true)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
        </div>
      )}

      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {statuses.map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:bg-surface-mid'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <Select value={sourceFilter} onValueChange={v => { setSourceFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="phantombuster">PhantomBuster</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <TableSkeleton rows={8} cols={7} /> : (
        <>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 w-10"><Checkbox checked={filtered.length > 0 && selectedIds.size === filtered.length} onCheckedChange={toggleSelectAll} /></th>
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
                  {paginated.map((lead, i) => (
                    <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-slide-in cursor-pointer" style={{ animationDelay: `${i * 40}ms` }} onClick={() => setDetailLead(lead)}>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}><Checkbox checked={selectedIds.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} /></td>
                      <td className="px-4 py-3"><div><p className="font-medium text-sm">{lead.name}</p><p className="text-xs text-muted-foreground">{lead.email}</p></div></td>
                      <td className="px-4 py-3 text-sm">{lead.business}</td>
                      <td className="px-4 py-3 text-sm capitalize text-muted-foreground hidden md:table-cell">{lead.source}</td>
                      <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="flex gap-1 flex-wrap">{lead.tags.map(tag => (<span key={tag} className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-xs">{tag}</span>))}</div></td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditLead(lead)}><Pencil className="w-3.5 h-3.5" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <EmptyState title="No leads found" description="Try adjusting your search or filters" actionLabel="Add Lead" onAction={() => setAddOpen(true)} />}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                  <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className={`h-8 w-8 text-xs rounded-xl ${p === page ? 'gradient-primary text-white' : ''}`} onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      <AddLeadDialog open={addOpen || !!editLead} onOpenChange={(v) => { if (!v) { setAddOpen(false); setEditLead(null); } else setAddOpen(true); }} onAdd={handleAddLead} editLead={editLead} onUpdate={handleUpdateLead} />
      <CSVImportDialog open={csvOpen} onOpenChange={setCsvOpen} onImport={handleImport} />
      <LeadDetailDrawer lead={detailLead} open={!!detailLead} onOpenChange={(v) => { if (!v) setDetailLead(null); }} onStatusChange={handleStatusChange} onDelete={handleDeleteLead} />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} leads?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove the selected leads.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

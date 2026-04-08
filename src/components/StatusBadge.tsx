import { LeadStatus } from "@/data/mockData";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-info/10 text-info border-info/20' },
  contacted: { label: 'Contacted', className: 'bg-primary/10 text-primary border-primary/20' },
  'follow-up': { label: 'Follow-up', className: 'bg-warning/10 text-warning border-warning/20' },
  interested: { label: 'Interested', className: 'bg-success/10 text-success border-success/20' },
  closed: { label: 'Closed', className: 'bg-accent/10 text-accent border-accent/20' },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${score >= 85 ? 'bg-success' : score >= 70 ? 'bg-warning' : 'bg-muted-foreground'}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-medium ${color}`}>{score}</span>
    </div>
  );
}

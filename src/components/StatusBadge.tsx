import { LeadStatus } from "@/data/mockData";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-regent-sky/15 text-regent-sky border-regent-sky/30' },
  contacted: { label: 'Contacted', className: 'bg-primary/15 text-primary border-primary/30' },
  'follow-up': { label: 'Follow-up', className: 'bg-regent-gold/15 text-regent-gold border-regent-gold/30' },
  interested: { label: 'Interested', className: 'bg-regent-emerald/15 text-regent-emerald border-regent-emerald/30' },
  closed: { label: 'Closed', className: 'bg-accent/15 text-accent border-accent/30' },
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
  const color = score >= 85 ? 'text-regent-emerald' : score >= 70 ? 'text-regent-gold' : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${score >= 85 ? 'bg-regent-emerald' : score >= 70 ? 'bg-regent-gold' : 'bg-muted-foreground'}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-medium ${color}`}>{score}</span>
    </div>
  );
}

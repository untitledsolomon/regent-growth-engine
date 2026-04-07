import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lead, LeadStatus, messages as allMessages } from "@/data/mockData";
import { StatusBadge, ScoreBadge } from "@/components/StatusBadge";
import { Mail, Phone, Linkedin, Building2, Calendar, Clock, MessageSquare, Send, CheckCheck, Reply, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusIcons = { sent: Send, delivered: CheckCheck, read: CheckCheck, replied: Reply, failed: AlertCircle };
const statusColors = { sent: 'text-muted-foreground', delivered: 'text-regent-sky', read: 'text-primary', replied: 'text-regent-emerald', failed: 'text-regent-coral' };

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
  onDelete?: (leadId: string) => void;
}

export function LeadDetailDrawer({ lead, open, onOpenChange, onStatusChange, onDelete }: LeadDetailDrawerProps) {
  if (!lead) return null;

  const leadMessages = allMessages.filter(m => m.leadId === lead.id);
  const statuses: LeadStatus[] = ['new', 'contacted', 'follow-up', 'interested', 'closed'];

  const mockTimeline = [
    { action: 'Lead created', date: lead.created_at, icon: '➕' },
    ...(lead.last_contacted ? [{ action: 'Last contacted', date: lead.last_contacted, icon: '📤' }] : []),
    ...leadMessages.map(m => ({
      action: `${m.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} — ${m.status}`,
      date: m.sentAt.split('T')[0],
      icon: m.channel === 'whatsapp' ? '💬' : '📧',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">{lead.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{lead.business}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{lead.phone}</span>
            </div>
            {lead.linkedinUrl && (
              <div className="flex items-center gap-3 text-sm">
                <Linkedin className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{lead.linkedinUrl}</a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Added {lead.created_at}</span>
            </div>
          </div>

          {/* Score & Status */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Score</p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{lead.score}</div>
                <ScoreBadge score={lead.score} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              {onStatusChange ? (
                <Select value={lead.status} onValueChange={(v) => onStatusChange(lead.id, v as LeadStatus)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={lead.status} />
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
            <div className="flex gap-1.5 flex-wrap">
              {lead.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs">{tag}</span>
              ))}
              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs capitalize">{lead.source}</span>
            </div>
          </div>

          {/* Messages */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Messages ({leadMessages.length})</p>
            {leadMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No messages sent yet</p>
            ) : (
              <div className="space-y-2">
                {leadMessages.map(msg => {
                  const StatusIcon = statusIcons[msg.status];
                  return (
                    <div key={msg.id} className="p-3 rounded-lg border border-border/50 bg-background">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {msg.channel === 'whatsapp' ? <MessageSquare className="w-3.5 h-3.5 text-regent-emerald" /> : <Mail className="w-3.5 h-3.5 text-regent-sky" />}
                          <span className="text-xs font-medium">{msg.template || msg.channel}</span>
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] ${statusColors[msg.status]}`}>
                          <StatusIcon className="w-3 h-3" /> {msg.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{msg.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Activity Timeline</p>
            <div className="space-y-0">
              {mockTimeline.map((item, i) => (
                <div key={i} className="flex gap-3 py-2">
                  <div className="flex flex-col items-center">
                    <span className="text-sm">{item.icon}</span>
                    {i < mockTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.action}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete */}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Lead
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {lead.name}?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently remove this lead and cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { onDelete(lead.id); onOpenChange(false); }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { messages as initialMessages, templates as initialTemplates, Message, Template } from "@/data/mockData";
import { MessageSquare, Mail, Send, Clock, CheckCheck, Reply, AlertCircle, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComposeMessageDialog } from "@/components/ComposeMessageDialog";
import { TemplateDialog } from "@/components/TemplateDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusIcons = { sent: Send, delivered: CheckCheck, read: CheckCheck, replied: Reply, failed: AlertCircle };
const statusColors = { sent: 'text-muted-foreground', delivered: 'text-regent-sky', read: 'text-primary', replied: 'text-regent-emerald', failed: 'text-regent-coral' };

export default function MessagesPage() {
  const [tab, setTab] = useState<'history' | 'templates'>('history');
  const [messagesList, setMessagesList] = useState<Message[]>(initialMessages);
  const [templatesList, setTemplatesList] = useState<Template[]>(initialTemplates);
  const [composeOpen, setComposeOpen] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const handleSend = (message: Message) => {
    setMessagesList(prev => [message, ...prev]);
    toast.success(`Message sent to ${message.leadName}`);
  };

  const filteredMessages = messagesList.filter(msg => {
    const matchesSearch = msg.leadName.toLowerCase().includes(msgSearch.toLowerCase()) || msg.body.toLowerCase().includes(msgSearch.toLowerCase());
    const matchesChannel = channelFilter === 'all' || msg.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const handleSaveTemplate = (tmpl: Template) => {
    if (editTemplate) {
      setTemplatesList(prev => prev.map(t => t.id === tmpl.id ? tmpl : t));
      toast.success('Template updated');
    } else {
      setTemplatesList(prev => [tmpl, ...prev]);
      toast.success('Template created');
    }
    setEditTemplate(null);
  };

  const handleDeleteTemplate = () => {
    if (!deleteTemplateId) return;
    setTemplatesList(prev => prev.filter(t => t.id !== deleteTemplateId));
    toast.success('Template deleted');
    setDeleteTemplateId(null);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Track outreach messages and manage templates">
        <Button size="sm" className="gap-2" onClick={() => setComposeOpen(true)}>
          <Plus className="w-4 h-4" /> Compose
        </Button>
      </PageHeader>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Message History ({messagesList.length})
        </button>
        <button onClick={() => setTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'templates' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Templates ({templatesList.length})
        </button>
      </div>

      {tab === 'history' && (
        <>
          <div className="glass rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search messages..." value={msgSearch} onChange={e => setMsgSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-2">
              {(['all', 'whatsapp', 'email'] as const).map(ch => (
                <button key={ch} onClick={() => setChannelFilter(ch)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${channelFilter === ch ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {ch === 'all' ? 'All' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filteredMessages.map((msg, i) => {
              const StatusIcon = statusIcons[msg.status];
              return (
                <div key={msg.id} className="glass rounded-xl p-4 hover:shadow-md transition-all animate-slide-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${msg.channel === 'whatsapp' ? 'bg-regent-emerald/15 text-regent-emerald' : 'bg-regent-sky/15 text-regent-sky'}`}>
                        {msg.channel === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{msg.leadName}</span>
                          {msg.template && <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{msg.template}</span>}
                        </div>
                        {msg.subject && <p className="text-sm font-medium text-muted-foreground mt-0.5">{msg.subject}</p>}
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.body}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-medium ${statusColors[msg.status]}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {msg.status}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredMessages.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-lg font-medium">No messages found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'templates' && (
        <>
          <div className="mb-4">
            <Button size="sm" className="gap-2" onClick={() => { setEditTemplate(null); setTemplateOpen(true); }}>
              <Plus className="w-4 h-4" /> New Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesList.map((tmpl, i) => (
              <div key={tmpl.id} className="glass rounded-xl p-5 hover:shadow-md transition-all animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-sm">{tmpl.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tmpl.channel === 'whatsapp' ? 'bg-regent-emerald/15 text-regent-emerald' : 
                      tmpl.channel === 'email' ? 'bg-regent-sky/15 text-regent-sky' : 
                      'bg-primary/15 text-primary'
                    }`}>
                      {tmpl.channel}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTemplate(tmpl); setTemplateOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTemplateId(tmpl.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{tmpl.body}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <ComposeMessageDialog open={composeOpen} onOpenChange={setComposeOpen} onSend={handleSend} />
      <TemplateDialog open={templateOpen} onOpenChange={v => { setTemplateOpen(v); if (!v) setEditTemplate(null); }} onSave={handleSaveTemplate} editTemplate={editTemplate} />
      
      <AlertDialog open={!!deleteTemplateId} onOpenChange={v => { if (!v) setDeleteTemplateId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>This template will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

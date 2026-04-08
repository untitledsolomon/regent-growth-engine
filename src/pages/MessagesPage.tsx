import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { messages as initialMessages, templates as initialTemplates, Message, Template, leads } from "@/data/mockData";
import { MessageSquare, Mail, Send, Clock, CheckCheck, Reply, AlertCircle, Plus, Search, Pencil, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComposeMessageDialog } from "@/components/ComposeMessageDialog";
import { TemplateDialog } from "@/components/TemplateDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const statusIcons = { sent: Send, delivered: CheckCheck, read: CheckCheck, replied: Reply, failed: AlertCircle };
const statusColors = { sent: 'text-muted-foreground', delivered: 'text-info', read: 'text-primary', replied: 'text-success', failed: 'text-destructive' };

export default function MessagesPage() {
  const [tab, setTab] = useState<'inbox' | 'templates'>('inbox');
  const [messagesList, setMessagesList] = useState<Message[]>(initialMessages);
  const [templatesList, setTemplatesList] = useState<Template[]>(initialTemplates);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(initialMessages[0] || null);
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

  const selectedLead = selectedMsg ? leads.find(l => l.name === selectedMsg.leadName) : null;

  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Track outreach messages and manage templates">
        <Button size="sm" className="gap-2 rounded-xl gradient-primary text-white" onClick={() => setComposeOpen(true)}>
          <Plus className="w-4 h-4" /> Compose
        </Button>
      </PageHeader>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('inbox')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'inbox' ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:bg-surface-mid'}`}>
          Conversations ({messagesList.length})
        </button>
        <button onClick={() => setTab('templates')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === 'templates' ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:bg-surface-mid'}`}>
          Templates ({templatesList.length})
        </button>
      </div>

      {tab === 'inbox' && (
        <div className="flex gap-4 h-[calc(100vh-260px)]">
          {/* Left: conversation list */}
          <div className="w-80 flex-shrink-0 flex flex-col glass rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={msgSearch} onChange={e => setMsgSearch(e.target.value)} className="pl-9 rounded-xl h-9 text-sm" />
              </div>
              <div className="flex gap-1 mt-2">
                {(['all', 'whatsapp', 'email'] as const).map(ch => (
                  <button key={ch} onClick={() => setChannelFilter(ch)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${channelFilter === ch ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {ch === 'all' ? 'All' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedMsg?.id === msg.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{msg.leadName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{msg.leadName}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{new Date(msg.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {msg.channel === 'whatsapp' ? <MessageSquare className="w-3 h-3 text-success shrink-0" /> : <Mail className="w-3 h-3 text-info shrink-0" />}
                        <p className="text-xs text-muted-foreground truncate">{msg.body}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: chat area */}
          <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
            {selectedMsg ? (
              <>
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{selectedMsg.leadName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{selectedMsg.leadName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{selectedMsg.channel} • {selectedMsg.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {/* Outgoing message */}
                  <div className="flex justify-end">
                    <div className="max-w-[70%] gradient-primary text-white rounded-2xl rounded-br-sm px-4 py-3">
                      {selectedMsg.subject && <p className="text-xs font-semibold mb-1 text-white/80">{selectedMsg.subject}</p>}
                      <p className="text-sm leading-relaxed">{selectedMsg.body}</p>
                      <p className="text-[10px] text-white/50 mt-1 text-right">{new Date(selectedMsg.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  {selectedMsg.status === 'replied' && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                        <p className="text-sm leading-relaxed">Thanks for reaching out! I'd love to learn more about your services. Can we schedule a call this week?</p>
                        <p className="text-[10px] text-muted-foreground mt-1">2:45 PM</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="rounded-xl" />
                    <Button className="rounded-xl gradient-primary text-white"><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Select a conversation</p>
              </div>
            )}
          </div>

          {/* Right: lead detail */}
          {selectedLead && (
            <div className="w-72 flex-shrink-0 glass rounded-2xl overflow-hidden hidden xl:block">
              <div className="p-5 text-center border-b border-border">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl font-bold">{selectedLead.name.charAt(0)}</span>
                </div>
                <p className="font-display font-semibold">{selectedLead.name}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.business}</p>
              </div>
              <div className="p-4 space-y-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedLead.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedLead.phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Source</p><p className="text-sm font-medium capitalize">{selectedLead.source}</p></div>
                <div><p className="text-xs text-muted-foreground">Score</p><p className="text-sm font-bold">{selectedLead.score}/100</p></div>
                <div className="flex gap-1 flex-wrap">
                  {selectedLead.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'templates' && (
        <>
          <div className="mb-4">
            <Button size="sm" className="gap-2 rounded-xl gradient-primary text-white" onClick={() => { setEditTemplate(null); setTemplateOpen(true); }}>
              <Plus className="w-4 h-4" /> New Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesList.map((tmpl, i) => (
              <div key={tmpl.id} className="glass rounded-2xl p-5 hover:shadow-md transition-all animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-sm">{tmpl.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tmpl.channel === 'whatsapp' ? 'bg-success/10 text-success' : 
                      tmpl.channel === 'email' ? 'bg-info/10 text-info' : 
                      'bg-primary/10 text-primary'
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

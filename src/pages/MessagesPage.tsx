import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/DashboardWidgets";
import { messages, templates } from "@/data/mockData";
import { MessageSquare, Mail, Send, Clock, CheckCheck, Reply, AlertCircle } from "lucide-react";

const statusIcons = { sent: Send, delivered: CheckCheck, read: CheckCheck, replied: Reply, failed: AlertCircle };
const statusColors = { sent: 'text-muted-foreground', delivered: 'text-regent-sky', read: 'text-primary', replied: 'text-regent-emerald', failed: 'text-regent-coral' };

export default function MessagesPage() {
  const [tab, setTab] = useState<'history' | 'templates'>('history');

  return (
    <DashboardLayout>
      <PageHeader title="Messages" subtitle="Track outreach messages and manage templates" />

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Message History
        </button>
        <button onClick={() => setTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'templates' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          Templates
        </button>
      </div>

      {tab === 'history' && (
        <div className="space-y-3">
          {messages.map((msg, i) => {
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
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tmpl, i) => (
            <div key={tmpl.id} className="glass rounded-xl p-5 hover:shadow-md transition-all animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm">{tmpl.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  tmpl.channel === 'whatsapp' ? 'bg-regent-emerald/15 text-regent-emerald' : 
                  tmpl.channel === 'email' ? 'bg-regent-sky/15 text-regent-sky' : 
                  'bg-primary/15 text-primary'
                }`}>
                  {tmpl.channel}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tmpl.body}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

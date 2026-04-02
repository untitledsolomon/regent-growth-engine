import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mail, Wand2 } from "lucide-react";
import { leads, templates, Message } from "@/data/mockData";

interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (message: Message) => void;
}

export function ComposeMessageDialog({ open, onOpenChange, onSend }: ComposeMessageDialogProps) {
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [leadId, setLeadId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedLead = leads.find(l => l.id === leadId);
  const filteredTemplates = templates.filter(t => t.channel === channel || t.channel === 'both');

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl || !selectedLead) return;
    let text = tmpl.body
      .replace(/\{\{name\}\}/g, selectedLead.name.split(' ')[0])
      .replace(/\{\{business\}\}/g, selectedLead.business);
    setBody(text);
  };

  const handleSend = () => {
    const e: Record<string, string> = {};
    if (!leadId) e.lead = 'Select a recipient';
    if (!body.trim()) e.body = 'Message body is required';
    if (channel === 'email' && !subject.trim()) e.subject = 'Subject is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const message: Message = {
      id: crypto.randomUUID(),
      leadId,
      leadName: selectedLead?.name || '',
      channel,
      subject: channel === 'email' ? subject : undefined,
      body: body.trim(),
      status: 'sent',
      sentAt: new Date().toISOString(),
      template: templates.find(t => t.id === selectedTemplate)?.name,
    };
    onSend(message);
    setLeadId(''); setSubject(''); setBody(''); setSelectedTemplate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-display">Compose Message</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={channel === 'whatsapp' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setChannel('whatsapp')}
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </Button>
            <Button
              type="button"
              variant={channel === 'email' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
              onClick={() => setChannel('email')}
            >
              <Mail className="w-4 h-4" /> Email
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Recipient</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger><SelectValue placeholder="Select a lead..." /></SelectTrigger>
              <SelectContent>
                {leads.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name} — {l.business}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead && <p className="text-xs text-destructive">{errors.lead}</p>}
          </div>

          {leadId && (
            <div className="space-y-2">
              <Label>Use Template</Label>
              <div className="flex gap-2">
                <Select value={selectedTemplate} onValueChange={applyTemplate}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Button type="button" variant="outline" size="icon" onClick={() => applyTemplate(selectedTemplate)} title="Re-apply template">
                    <Wand2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {channel === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Partnership Opportunity" />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} placeholder="Type your message..." rows={5} />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} className="gap-2">
            {channel === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

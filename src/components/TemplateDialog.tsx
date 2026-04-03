import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Template } from "@/data/mockData";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: Template) => void;
  editTemplate?: Template | null;
}

export function TemplateDialog({ open, onOpenChange, onSave, editTemplate }: TemplateDialogProps) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('email');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTemplate) {
      setName(editTemplate.name);
      setChannel(editTemplate.channel);
      setBody(editTemplate.body);
    } else {
      setName('');
      setChannel('email');
      setBody('');
    }
    setErrors({});
  }, [editTemplate, open]);

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Required';
    if (!body.trim()) errs.body = 'Required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      id: editTemplate?.id || crypto.randomUUID(),
      name: name.trim(),
      channel,
      body: body.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">{editTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm">Template Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cold Intro" className="mt-1" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label className="text-sm">Channel</Label>
            <Select value={channel} onValueChange={v => setChannel(v as typeof channel)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Message Body</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Use {{name}} and {{business}} for variables..." className="mt-1" />
            {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">Available variables: {'{{name}}'}, {'{{business}}'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editTemplate ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

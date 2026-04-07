import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lead, LeadSource, LeadStatus } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/orgContext";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (lead: Lead) => void;
  editLead?: Lead | null;
  onUpdate?: (lead: Lead) => void;
}

const emptyForm = {
  name: '', business: '', email: '', phone: '',
  source: 'website' as LeadSource, score: 50, status: 'new' as LeadStatus, tags: '',
};

export function AddLeadDialog({ open, onOpenChange, onAdd, editLead, onUpdate }: AddLeadDialogProps) {
  const isEdit = !!editLead;
  const [form, setForm] = useState(
    editLead ? { ...editLead, tags: editLead.tags.join(', ') } : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {orgId} = useOrg();

  const resetForm = () => { setForm(emptyForm); setErrors({}); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.business.trim()) e.business = 'Business is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      org_id: orgId,
      name: form.name.trim(),
      business: form.business.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      source: form.source,
      score: Number(form.score),
      status: form.status,
      tags,
      created_at: editLead?.created_at || new Date().toISOString().split('T')[0],
      last_contacted: editLead?.last_contacted,
    };
    let error;
    if (isEdit) {
      const {error: updateError} = await supabase
        .from("leads")
        .update(payload)
        .eq("id", editLead.id);

      error = updateError;
    } else {
      const {error: insertError} = await supabase
        .from("leads")
        .insert([payload]);

        error = insertError
    }

    if (error) {
      console.error(error);
      return;
    }

    // Sync form when editLead changes
    if (isEdit && onUpdate) onUpdate({ ...payload, id: editLead.id } as Lead);
    else if (onAdd) onAdd({ ...payload, id: crypto.randomUUID() } as Lead);

    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sarah Chen" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="business">Business</Label>
              <Input id="business" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} placeholder="TechVault Solutions" />
              {errors.business && <p className="text-xs text-destructive">{errors.business}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sarah@techvault.io" />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0101" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v as LeadSource }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phantombuster">PhantomBuster</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as LeadStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input id="score" type="number" min={0} max={100} value={form.score} onChange={e => setForm(f => ({ ...f, score: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="enterprise, high-value" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? 'Update Lead' : 'Add Lead'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

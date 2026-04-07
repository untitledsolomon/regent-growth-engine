import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Campaign, CampaignChannel, templates } from "@/data/mockData";
import { useLeads } from "@/hooks/useLeads";import { supabase } from "@/lib/supabase";
import { getUserOrg } from "@/lib/org";
import { useOrg } from "@/contexts/orgContext";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (campaign: Campaign) => void;
}

const sourceOptions = ['phantombuster', 'linkedin', 'referral', 'website', 'cold-outreach'];
const statusOptions = ['new', 'contacted', 'follow-up', 'interested'];

export function CreateCampaignDialog({ open, onOpenChange, onAdd }: CreateCampaignDialogProps) {
  const {leads} = useLeads();
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('email');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {orgId} = useOrg();

  const toggleSource = (s: string) => setSelectedSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleStatus = (s: string) => setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const matchingLeads = leads.filter(l => {
    if (selectedSources.length && !selectedSources.includes(l.source)) return false;
    if (selectedStatuses.length && !selectedStatuses.includes(l.status)) return false;
    return true;
  });

  const filteredTemplates = templates.filter(t => t.channel === channel || t.channel === 'both');

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Campaign name is required';
    if (matchingLeads.length === 0) e.audience = 'No leads match your criteria';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const { data: campaignData, error: campaignError} = await supabase
      .from("campaigns")
      .insert([
        {
          org_id: orgId,
          name: name.trim(),
          channel,
          status: 'draft',
          leads_count: matchingLeads.length,
          sent: 0, delivered: 0, replied: 0, conversions: 0,
          created_at: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (campaignError) {
      console.error(campaignError);
      return;
    }

    const campaignId = campaignData.id;

    const campaignLeads = matchingLeads.map((lead) => ({
      campaign_id: campaignId,
      lead_id: lead.id,
    }));

    const {error: linkError} = await supabase
      .from("campaign_leads")
      .insert(campaignLeads);

    if (linkError) {
      console.error(linkError);
      return;
    }

    const campaign: Campaign = {
      id: campaignId,
      name: name.trim(),
      channel,
      status: 'draft',
      leads_count: matchingLeads.length,
      sent: 0,
      delivered: 0,
      replied: 0,
      conversions: 0,
      created_at: campaignData.created_at,
    };

    onAdd(campaign);

    setName('');
    setChannel('email');
    setSelectedSources([]);
    setSelectedStatuses([]);
    setSelectedTemplate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Campaign</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input id="campaign-name" value={name} onChange={e => setName(e.target.value)} placeholder="Q2 Enterprise Outreach" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={v => setChannel(v as CampaignChannel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
                <SelectItem value="both">Both Channels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Audience — Source</Label>
            <div className="flex flex-wrap gap-2">
              {sourceOptions.map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={selectedSources.includes(s)} onCheckedChange={() => toggleSource(s)} />
                  <span className="text-sm capitalize">{s.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Audience — Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={selectedStatuses.includes(s)} onCheckedChange={() => toggleStatus(s)} />
                  <span className="text-sm capitalize">{s.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{matchingLeads.length} leads match your criteria</p>
            {errors.audience && <p className="text-xs text-destructive">{errors.audience}</p>}
          </div>

          <div className="space-y-2">
            <Label>Message Template (optional)</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
              <SelectContent>
                {filteredTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                {templates.find(t => t.id === selectedTemplate)?.body}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

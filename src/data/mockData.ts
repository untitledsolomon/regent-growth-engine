export type LeadStatus = 'new' | 'contacted' | 'follow-up' | 'interested' | 'closed';
export type LeadSource = 'phantombuster' | 'linkedin' | 'referral' | 'website' | 'cold-outreach';
export type CampaignChannel = 'whatsapp' | 'email' | 'both';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'replied' | 'failed';

export interface Lead {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  source: LeadSource;
  score: number;
  status: LeadStatus;
  tags: string[];
  created_at: string;
  last_contacted?: string;
  linkedinUrl?: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: 'draft' | 'active' | 'paused' | 'completed';
  leads_count: number;
  sent: number;
  delivered: number;
  replied: number;
  conversions: number;
  created_at: string;
}

export interface Message {
  id: string;
  leadId: string;
  leadName: string;
  channel: 'whatsapp' | 'email';
  subject?: string;
  body: string;
  status: MessageStatus;
  sentAt: string;
  template?: string;
}

export interface DailyMetric {
  date: string;
  leads: number;
  contacted: number;
  replies: number;
  conversions: number;
}

export interface Template {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'both';
  body: string;
}

export interface Activity {
  id: string;
  type: 'lead_added' | 'status_changed' | 'message_sent' | 'campaign_created' | 'lead_imported' | 'campaign_toggled';
  description: string;
  timestamp: string;
  meta?: Record<string, string>;
}

export const leads: Lead[] = [
  { id: '1', name: 'Sarah Chen', business: 'TechVault Solutions', email: 'sarah@techvault.io', phone: '+1-555-0101', source: 'phantombuster', score: 92, status: 'interested', tags: ['enterprise', 'high-value'], created_at: '2026-03-15', last_contacted: '2026-03-30', linkedinUrl: 'https://linkedin.com/in/sarahchen' },
  { id: '2', name: 'Marcus Williams', business: 'GrowthStack Inc', email: 'marcus@growthstack.com', phone: '+1-555-0102', source: 'linkedin', score: 85, status: 'contacted', tags: ['startup', 'series-a'], created_at: '2026-03-18', last_contacted: '2026-03-28', linkedinUrl: 'https://linkedin.com/in/marcuswilliams' },
  { id: '3', name: 'Amara Osei', business: 'BrightPath Digital', email: 'amara@brightpath.co', phone: '+1-555-0103', source: 'referral', score: 78, status: 'follow-up', tags: ['agency', 'mid-market'], created_at: '2026-03-20', last_contacted: '2026-03-29' },
  { id: '4', name: 'James Rodriguez', business: 'Apex Ventures', email: 'james@apexventures.com', phone: '+1-555-0104', source: 'phantombuster', score: 95, status: 'closed', tags: ['enterprise', 'high-value', 'won'], created_at: '2026-03-10', last_contacted: '2026-04-01', linkedinUrl: 'https://linkedin.com/in/jamesrodriguez' },
  { id: '5', name: 'Priya Patel', business: 'NovaBrand Studio', email: 'priya@novabrand.co', phone: '+1-555-0105', source: 'website', score: 70, status: 'new', tags: ['smb'], created_at: '2026-03-25' },
  { id: '6', name: 'David Kim', business: 'CloudNine SaaS', email: 'david@cloudnine.io', phone: '+1-555-0106', source: 'cold-outreach', score: 65, status: 'new', tags: ['saas', 'startup'], created_at: '2026-03-26' },
  { id: '7', name: 'Elena Vasquez', business: 'Meridian Health', email: 'elena@meridianhealth.com', phone: '+1-555-0107', source: 'linkedin', score: 88, status: 'interested', tags: ['healthcare', 'enterprise'], created_at: '2026-03-12', last_contacted: '2026-03-31', linkedinUrl: 'https://linkedin.com/in/elenavasquez' },
  { id: '8', name: 'Omar Hassan', business: 'FinEdge Capital', email: 'omar@finedge.co', phone: '+1-555-0108', source: 'phantombuster', score: 82, status: 'contacted', tags: ['fintech', 'high-value'], created_at: '2026-03-19', last_contacted: '2026-03-27', linkedinUrl: 'https://linkedin.com/in/omarhassan' },
  { id: '9', name: 'Lisa Park', business: 'EcoVenture Labs', email: 'lisa@ecoventure.com', phone: '+1-555-0109', source: 'referral', score: 74, status: 'follow-up', tags: ['sustainability'], created_at: '2026-03-22', last_contacted: '2026-03-30' },
  { id: '10', name: 'Thomas Burke', business: 'Atlas Logistics', email: 'thomas@atlaslog.com', phone: '+1-555-0110', source: 'website', score: 60, status: 'new', tags: ['logistics'], created_at: '2026-03-28' },
  { id: '11', name: 'Natasha Romanova', business: 'Stellar AI', email: 'natasha@stellarai.io', phone: '+1-555-0111', source: 'phantombuster', score: 91, status: 'closed', tags: ['ai', 'enterprise', 'won'], created_at: '2026-03-08', last_contacted: '2026-03-29', linkedinUrl: 'https://linkedin.com/in/natasharomanova' },
  { id: '12', name: 'Raj Kapoor', business: 'UrbanPulse Media', email: 'raj@urbanpulse.co', phone: '+1-555-0112', source: 'linkedin', score: 77, status: 'contacted', tags: ['media', 'mid-market'], created_at: '2026-03-21', last_contacted: '2026-03-28' },
];

export const campaigns: Campaign[] = [
  { id: '1', name: 'Q1 Enterprise Outreach', channel: 'both', status: 'active', leads_count: 45, sent: 38, delivered: 35, replied: 12, conversions: 4, created_at: '2026-03-01' },
  { id: '2', name: 'Startup Growth Sprint', channel: 'email', status: 'active', leads_count: 120, sent: 95, delivered: 88, replied: 22, conversions: 7, created_at: '2026-03-10' },
  { id: '3', name: 'LinkedIn Warm Leads', channel: 'whatsapp', status: 'completed', leads_count: 30, sent: 30, delivered: 28, replied: 15, conversions: 6, created_at: '2026-02-20' },
  { id: '4', name: 'Healthcare Vertical Push', channel: 'email', status: 'draft', leads_count: 60, sent: 0, delivered: 0, replied: 0, conversions: 0, created_at: '2026-03-28' },
  { id: '5', name: 'Re-engagement Wave', channel: 'both', status: 'paused', leads_count: 85, sent: 40, delivered: 36, replied: 8, conversions: 2, created_at: '2026-03-15' },
];

export const messages: Message[] = [
  { id: '1', leadId: '1', leadName: 'Sarah Chen', channel: 'whatsapp', body: 'Hi Sarah, I noticed TechVault is scaling rapidly. We help enterprise tech companies streamline client acquisition — would love to share how.', status: 'read', sentAt: '2026-03-30T10:30:00', template: 'Enterprise Intro' },
  { id: '2', leadId: '1', leadName: 'Sarah Chen', channel: 'email', subject: 'Partnership Opportunity for TechVault', body: 'Dear Sarah, Following up on our conversation about scaling TechVault\'s growth pipeline...', status: 'replied', sentAt: '2026-03-31T09:00:00', template: 'Follow-up #1' },
  { id: '3', leadId: '2', leadName: 'Marcus Williams', channel: 'email', subject: 'Growth Strategies for Series A Startups', body: 'Hi Marcus, Congrats on GrowthStack\'s Series A! We specialize in helping post-funding startups accelerate...', status: 'delivered', sentAt: '2026-03-28T14:00:00', template: 'Startup Outreach' },
  { id: '4', leadId: '4', leadName: 'James Rodriguez', channel: 'whatsapp', body: 'James, great speaking with you yesterday. As discussed, here\'s the proposal for Apex Ventures...', status: 'replied', sentAt: '2026-03-29T11:00:00', template: 'Proposal Follow-up' },
  { id: '5', leadId: '7', leadName: 'Elena Vasquez', channel: 'email', subject: 'Healthcare Client Acquisition Solutions', body: 'Hi Elena, Meridian Health\'s growth trajectory is impressive. We\'ve helped similar healthcare companies...', status: 'read', sentAt: '2026-03-31T08:30:00', template: 'Healthcare Vertical' },
  { id: '6', leadId: '8', leadName: 'Omar Hassan', channel: 'whatsapp', body: 'Omar, hope you\'re well. Quick question — is FinEdge still looking to expand its client base in Q2?', status: 'sent', sentAt: '2026-03-27T16:00:00', template: 'Check-in' },
];

export const dailyMetrics: DailyMetric[] = [
  { date: 'Mar 1', leads: 5, contacted: 3, replies: 1, conversions: 0 },
  { date: 'Mar 5', leads: 8, contacted: 6, replies: 2, conversions: 1 },
  { date: 'Mar 10', leads: 12, contacted: 9, replies: 4, conversions: 1 },
  { date: 'Mar 15', leads: 15, contacted: 11, replies: 5, conversions: 2 },
  { date: 'Mar 20', leads: 20, contacted: 15, replies: 7, conversions: 3 },
  { date: 'Mar 25', leads: 25, contacted: 18, replies: 9, conversions: 4 },
  { date: 'Mar 30', leads: 30, contacted: 22, replies: 12, conversions: 5 },
  { date: 'Apr 1', leads: 32, contacted: 24, replies: 14, conversions: 6 },
];

export const sourceBreakdown = [
  { source: 'PhantomBuster', count: 45, percentage: 37 },
  { source: 'LinkedIn', count: 30, percentage: 25 },
  { source: 'Referral', count: 20, percentage: 17 },
  { source: 'Website', count: 15, percentage: 13 },
  { source: 'Cold Outreach', count: 10, percentage: 8 },
];

export const funnelData = [
  { stage: 'Total Leads', value: 120, fill: 'hsl(250, 75%, 58%)' },
  { stage: 'Contacted', value: 85, fill: 'hsl(205, 85%, 55%)' },
  { stage: 'Replied', value: 42, fill: 'hsl(170, 70%, 45%)' },
  { stage: 'Interested', value: 24, fill: 'hsl(42, 90%, 55%)' },
  { stage: 'Closed', value: 12, fill: 'hsl(160, 70%, 42%)' },
];

export const aiInsights = [
  { id: '1', type: 'opportunity' as const, title: 'High-value leads cooling off', description: '3 enterprise leads haven\'t been contacted in 5+ days. Re-engagement recommended.', priority: 'high' as const },
  { id: '2', type: 'trend' as const, title: 'WhatsApp outperforming email', description: 'WhatsApp messages have 2.3x higher reply rate than email this month.', priority: 'medium' as const },
  { id: '3', type: 'suggestion' as const, title: 'Optimal send time detected', description: 'Messages sent between 9-11 AM get 40% more replies. Adjust campaign schedule.', priority: 'medium' as const },
  { id: '4', type: 'alert' as const, title: 'Campaign saturation warning', description: 'Startup Growth Sprint is approaching diminishing returns. Consider refreshing audience.', priority: 'low' as const },
];

export const templates: Template[] = [
  { id: '1', name: 'Enterprise Intro', channel: 'whatsapp', body: 'Hi {{name}}, I noticed {{business}} is scaling rapidly. We help enterprise companies streamline client acquisition — would love to share how.' },
  { id: '2', name: 'Follow-up #1', channel: 'email', body: 'Dear {{name}}, Following up on our previous conversation about {{business}}\'s growth plans...' },
  { id: '3', name: 'Startup Outreach', channel: 'email', body: 'Hi {{name}}, Congrats on {{business}}\'s momentum! We specialize in helping fast-growing startups...' },
  { id: '4', name: 'Check-in', channel: 'whatsapp', body: '{{name}}, hope you\'re well. Quick question — is {{business}} still looking to expand in Q2?' },
  { id: '5', name: 'Proposal Follow-up', channel: 'both', body: '{{name}}, great speaking with you. As discussed, here\'s how we can help {{business}}...' },
];

export interface IntegrationSyncLog {
  id: string;
  timestamp: string;
  source: string;
  leads_count: number;
  status: 'success' | 'partial' | 'failed';
  duration: string;
}

export interface PhantomConfig {
  id: string;
  name: string;
  type: string;
}

export const phantomConfigs: PhantomConfig[] = [
  { id: 'ph1', name: 'LinkedIn Sales Navigator Search', type: 'scraper' },
  { id: 'ph2', name: 'LinkedIn Profile Scraper', type: 'scraper' },
  { id: 'ph3', name: 'LinkedIn Auto Connect', type: 'action' },
  { id: 'ph4', name: 'LinkedIn Message Sender', type: 'action' },
  { id: 'ph5', name: 'Google Maps Scraper', type: 'scraper' },
];

export const integrationSyncLogs: IntegrationSyncLog[] = [
  { id: 's1', timestamp: '2026-04-06T10:30:00', source: 'LinkedIn Sales Navigator Search', leads_count: 15, status: 'success', duration: '2m 14s' },
  { id: 's2', timestamp: '2026-04-05T10:30:00', source: 'LinkedIn Profile Scraper', leads_count: 8, status: 'success', duration: '1m 42s' },
  { id: 's3', timestamp: '2026-04-04T10:30:00', source: 'LinkedIn Sales Navigator Search', leads_count: 22, status: 'success', duration: '3m 05s' },
  { id: 's4', timestamp: '2026-04-03T10:30:00', source: 'LinkedIn Sales Navigator Search', leads_count: 3, status: 'partial', duration: '4m 30s' },
  { id: 's5', timestamp: '2026-04-02T10:30:00', source: 'Google Maps Scraper', leads_count: 0, status: 'failed', duration: '0m 12s' },
];

export interface Notification {
  id: string;
  type: 'new_lead' | 'message_reply' | 'sync_complete' | 'campaign_milestone';
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
}

export const notifications: Notification[] = [
  { id: 'n1', type: 'new_lead', title: 'New lead: Sarah Chen from TechVault', body: 'Imported via PhantomBuster', read: false, created_at: '2026-04-07T09:30:00' },
  { id: 'n2', type: 'message_reply', title: 'Reply from James Rodriguez', body: 'Thanks for the proposal, looks great!', read: false, created_at: '2026-04-07T08:15:00' },
  { id: 'n3', type: 'sync_complete', title: 'PhantomBuster sync complete', body: '15 new leads imported successfully', read: false, created_at: '2026-04-06T22:00:00' },
  { id: 'n4', type: 'campaign_milestone', title: 'Q1 Enterprise Outreach hit 50% reply rate', read: true, created_at: '2026-04-06T16:30:00' },
  { id: 'n5', type: 'new_lead', title: 'New lead: David Kim from CloudNine', body: 'Added manually', read: true, created_at: '2026-04-06T14:00:00' },
  { id: 'n6', type: 'message_reply', title: 'Reply from Elena Vasquez', body: 'Let\'s schedule a call next week', read: true, created_at: '2026-04-05T11:20:00' },
];

export const recentActivities: Activity[] = [
  { id: '1', type: 'message_sent', description: 'Message sent to Sarah Chen via WhatsApp', timestamp: '2026-04-01T14:30:00' },
  { id: '2', type: 'status_changed', description: 'James Rodriguez moved to Closed', timestamp: '2026-04-01T12:15:00' },
  { id: '3', type: 'lead_added', description: 'Priya Patel added as new lead', timestamp: '2026-03-31T16:45:00' },
  { id: '4', type: 'campaign_created', description: 'Campaign "Re-engagement Wave" created', timestamp: '2026-03-31T10:00:00' },
  { id: '5', type: 'lead_imported', description: '12 leads imported from PhantomBuster CSV', timestamp: '2026-03-30T09:20:00' },
  { id: '6', type: 'campaign_toggled', description: 'Campaign "Q1 Enterprise Outreach" activated', timestamp: '2026-03-29T11:30:00' },
  { id: '7', type: 'message_sent', description: 'Follow-up email sent to Elena Vasquez', timestamp: '2026-03-29T08:00:00' },
  { id: '8', type: 'status_changed', description: 'Omar Hassan moved to Contacted', timestamp: '2026-03-28T15:20:00' },
];

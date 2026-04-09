import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  dailyMetrics as mockDailyMetrics,
  sourceBreakdown as mockSourceBreakdown,
  funnelData as mockFunnelData,
  campaigns as mockCampaigns,
  type DailyMetric,
  type Campaign,
} from '@/data/mockData';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export interface SourceBreakdownItem {
  source: string;
  count: number;
  percentage: number;
}

export interface FunnelItem {
  stage: string;
  value: number;
  fill: string;
}

export interface AnalyticsData {
  dailyMetrics: DailyMetric[];
  sourceBreakdown: SourceBreakdownItem[];
  funnelData: FunnelItem[];
  campaigns: Campaign[];
  loading: boolean;
}

const FUNNEL_FILLS = [
  'hsl(250, 75%, 58%)',
  'hsl(205, 85%, 55%)',
  'hsl(170, 70%, 45%)',
  'hsl(42, 90%, 55%)',
  'hsl(160, 70%, 42%)',
];

const SOURCE_LABEL: Record<string, string> = {
  phantombuster: 'PhantomBuster',
  linkedin: 'LinkedIn',
  referral: 'Referral',
  website: 'Website',
  'cold-outreach': 'Cold Outreach',
};

export function useAnalytics(): AnalyticsData {
  const [data, setData] = useState<AnalyticsData>({
    dailyMetrics: mockDailyMetrics,
    sourceBreakdown: mockSourceBreakdown,
    funnelData: mockFunnelData,
    campaigns: mockCampaigns,
    loading: true,
  });

  useEffect(() => {
    if (!supabase) {
      setData(d => ({ ...d, loading: false }));
      return;
    }

    async function fetchAnalytics() {
      try {
        const [leadsRes, campaignsRes] = await Promise.all([
          supabase!.from('leads').select('created_at, status, source'),
          supabase!.from('campaigns').select('*').order('created_at', { ascending: false }),
        ]);

        if (leadsRes.error) throw leadsRes.error;
        if (campaignsRes.error) throw campaignsRes.error;

        const leads = leadsRes.data ?? [];
        const campaigns: Campaign[] = campaignsRes.data ?? [];

        // --- daily metrics: last 30 days, leads created per day ---
        const today = new Date();
        const from = subDays(today, 29);
        const days = eachDayOfInterval({ start: from, end: today });

        const dailyMetrics: DailyMetric[] = days.map(day => {
          const label = format(day, 'MMM d');
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayLeads = leads.filter(l => l.created_at?.startsWith(dayStr));
          const contacted = dayLeads.filter(l => ['contacted', 'follow-up', 'interested', 'closed'].includes(l.status)).length;
          const replies   = dayLeads.filter(l => ['interested', 'closed'].includes(l.status)).length;
          const conversions = dayLeads.filter(l => l.status === 'closed').length;
          return { date: label, leads: dayLeads.length, contacted, replies, conversions };
        });

        // --- source breakdown ---
        const sourceCounts: Record<string, number> = {};
        for (const l of leads) {
          const src = l.source ?? 'unknown';
          sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
        }
        const total = leads.length || 1;
        const sourceBreakdown: SourceBreakdownItem[] = Object.entries(sourceCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([src, count]) => ({
            source: SOURCE_LABEL[src] ?? src,
            count,
            percentage: Math.round((count / total) * 100),
          }));

        // --- funnel data ---
        const statusCounts: Record<string, number> = {};
        for (const l of leads) statusCounts[l.status] = (statusCounts[l.status] ?? 0) + 1;
        const totalLeads = leads.length;
        const contacted  = leads.filter(l => ['contacted', 'follow-up', 'interested', 'closed'].includes(l.status)).length;
        const replied    = leads.filter(l => ['interested', 'closed'].includes(l.status)).length;
        const interested = (statusCounts['interested'] ?? 0) + (statusCounts['closed'] ?? 0);
        const closed     = statusCounts['closed'] ?? 0;

        const funnelData: FunnelItem[] = [
          { stage: 'Total Leads',  value: totalLeads,  fill: FUNNEL_FILLS[0] },
          { stage: 'Contacted',    value: contacted,   fill: FUNNEL_FILLS[1] },
          { stage: 'Replied',      value: replied,     fill: FUNNEL_FILLS[2] },
          { stage: 'Interested',   value: interested,  fill: FUNNEL_FILLS[3] },
          { stage: 'Closed',       value: closed,      fill: FUNNEL_FILLS[4] },
        ];

        setData({ dailyMetrics, sourceBreakdown, funnelData, campaigns, loading: false });
      } catch {
        // Silently fall back to mock data on error
        setData(d => ({ ...d, loading: false }));
      }
    }

    fetchAnalytics();
  }, []);

  return data;
}

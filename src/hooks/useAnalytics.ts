import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { dailyMetrics as mockDailyMetrics, sourceBreakdown as mockSourceBreakdown, funnelData as mockFunnelData, campaigns as mockCampaigns } from '@/data/mockData';

export function useAnalytics() {
  const [data, setData] = useState<any>({
    dailyMetrics: mockDailyMetrics,
    sourceBreakdown: mockSourceBreakdown,
    funnelData: mockFunnelData,
    campaigns: mockCampaigns
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: result, error: fetchErr } = await supabase.functions.invoke('analytics');
        if (fetchErr) throw fetchErr;

        if (result) {
          setData({
            totalLeads: result.total_leads,
            contactedCount: result.contacted,
            repliesCount: result.total_replied,
            conversionsCount: result.total_conversions,
            conversionRate: result.conversion_rate,
            funnelData: [
              { stage: 'Total Leads', value: result.total_leads, fill: '#4648d4' },
              { stage: 'Contacted', value: result.contacted, fill: '#6063ee' },
              { stage: 'Replied', value: result.total_replied, fill: '#9e00b5' },
              { stage: 'Interested', value: result.interested, fill: '#c028d7' },
              { stage: 'Conversion', value: result.total_conversions, fill: '#10b981' },
            ],
            sourceBreakdown: Object.entries(result.leads_by_source || {}).map(([source, count]) => ({
              source,
              count,
              percentage: result.total_leads > 0 ? Math.round((count as number / result.total_leads) * 100) : 0
            })),
            recentLeads: result.recent_leads,
            dailyMetrics: result.daily_metrics?.length ? result.daily_metrics : mockDailyMetrics,
            campaigns: mockCampaigns, // Keep mock for now or fetch from DB
          });
        }
      } catch (e: any) {
        setError(e.message);
        console.error('Analytics Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return {
    ...data,
    loading,
    error
  };
}

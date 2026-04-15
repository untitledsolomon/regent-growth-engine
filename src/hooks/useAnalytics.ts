import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { dailyMetrics, sourceBreakdown, funnelData, campaigns } from '@/data/mockData';

export function useAnalytics() {
  const [data, setData] = useState<any>({
    dailyMetrics,
    sourceBreakdown,
    funnelData,
    campaigns
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

        // Map the API result to the dashboard's expected data structure
        // If API returns null or error, keep mock data
        if (result) {
          setData({
            ...data,
            totalLeads: result.total_leads,
            contactedCount: result.contacted,
            repliesCount: result.total_replied,
            conversionsCount: result.total_conversions,
            conversionRate: result.conversion_rate,
            funnelData: [
              { label: 'Total Leads', value: result.total_leads, color: 'bg-primary' },
              { label: 'Contacted', value: result.contacted, color: 'bg-blue-400' },
              { label: 'Replied', value: result.total_replied, color: 'bg-emerald-400' },
              { label: 'Interested', value: result.interested, color: 'bg-amber-400' },
              { label: 'Closed', value: result.closed, color: 'bg-emerald-600' },
            ],
            sourceBreakdown: Object.entries(result.leads_by_source || {}).map(([name, value]) => ({
              name,
              value,
              color: name === 'PhantomBuster' ? '#6366f1' : name === 'LinkedIn' ? '#3b82f6' : '#10b981'
            })),
            recentLeads: result.recent_leads,
            // Still using mock for dailyMetrics as the API doesn't provide time-series yet
            dailyMetrics,
            campaigns: result.total_campaigns > 0 ? [] : campaigns, // Simplified logic for now
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

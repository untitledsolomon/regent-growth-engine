import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: result, error: fetchErr } = await supabase.functions.invoke('analytics/summary');
        if (fetchErr) throw fetchErr;
        setData(result);
      } catch (e: any) {
        setError(e.message);
        console.error('Analytics Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return { data, loading, error };
}

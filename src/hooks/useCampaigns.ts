import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { campaigns as mockCampaigns, Campaign } from '@/data/mockData';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!supabase) {
        setCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setCampaigns(data?.length ? data : mockCampaigns);
      } catch (e: any) {
        setError(e.message);
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { campaigns, setCampaigns, loading, error };
}

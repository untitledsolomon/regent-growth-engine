import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { leads as mockLeads, Lead } from '@/data/mockData';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!supabase) {
        setLeads(mockLeads);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setLeads(data?.length ? data : mockLeads);
      } catch (e: any) {
        setError(e.message);
        setLeads(mockLeads);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { leads, setLeads, loading, error };
}

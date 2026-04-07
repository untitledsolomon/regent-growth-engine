import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { integrationSyncLogs as mockLogs, phantomConfigs as mockPhantoms } from '@/data/mockData';
import type { IntegrationSyncLog, PhantomConfig } from '@/data/mockData';

export function useIntegrationConfig() {
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [phantomConfigs, setPhantomConfigs] = useState<PhantomConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!supabase) {
        setSyncLogs(mockLogs);
        setPhantomConfigs(mockPhantoms);
        setLoading(false);
        return;
      }
      try {
        const [logsRes, phantomsRes] = await Promise.all([
          supabase.from('integration_sync_logs').select('*').order('timestamp', { ascending: false }),
          supabase.from('phantom_configs').select('*'),
        ]);
        setSyncLogs(logsRes.data?.length ? logsRes.data : mockLogs);
        setPhantomConfigs(phantomsRes.data?.length ? phantomsRes.data : mockPhantoms);
      } catch {
        setSyncLogs(mockLogs);
        setPhantomConfigs(mockPhantoms);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { syncLogs, phantomConfigs, loading };
}

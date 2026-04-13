/**
 * Integration Sync Log Helper
 */
import { adminClient } from '../_shared/supabase.ts';

export async function logIntegrationActivity(opts: {
  org_id: string;
  source: string;
  status: 'success' | 'partial' | 'failed';
  leads_count?: number;
  duration?: string;
}) {
  const supabase = adminClient();
  const { error } = await supabase.from('integration_sync_logs').insert({
    org_id: opts.org_id,
    source: opts.source,
    status: opts.status,
    leads_count: opts.leads_count || 0,
    duration: opts.duration,
  });

  if (error) {
    console.error('Failed to log integration activity:', error);
  }
}

import { corsHeaders } from '../_shared/cors.ts';
import { getClient, adminClient, getScopedAuth, json, err } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return addCors(err('Method not allowed', 405));
  }

  const scopedAuth = await getScopedAuth(req);
  const supabase = scopedAuth ? adminClient() : getClient(req);

  try {
    if (scopedAuth && !scopedAuth.scopes.includes('analytics:read')) {
      return addCors(err('Insufficient scopes', 403));
    }

    const filterByOrg = (query: any) => scopedAuth ? query.eq('org_id', scopedAuth.org_id) : query;

    const [leadsRes, campaignsRes, recentRes, timeSeriesRes] = await Promise.all([
      filterByOrg(supabase.from('leads').select('status, source')),
      filterByOrg(supabase
        .from('campaigns')
        .select('status, sent, delivered, replied, conversions')),
      filterByOrg(supabase
        .from('leads')
        .select('id, name, business, status, source, created_at')
        .order('created_at', { ascending: false })
        .limit(5)),
      filterByOrg(supabase.rpc('get_leads_time_series')) // We'll add this RPC or mock it in JS
    ]);

    if (leadsRes.error) return addCors(err(leadsRes.error.message, 500));
    if (campaignsRes.error) return addCors(err(campaignsRes.error.message, 500));

    const leads = leadsRes.data ?? [];
    const campaigns = campaignsRes.data ?? [];

    // Lead status breakdown
    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      'follow-up': 0,
      interested: 0,
      closed: 0,
    };
    const sourceCounts: Record<string, number> = {};
    const contentAttribution: Record<string, number> = {};

    for (const lead of leads) {
      if (lead.status in statusCounts) statusCounts[lead.status]++;
      if (lead.source) {
        sourceCounts[lead.source] = (sourceCounts[lead.source] ?? 0) + 1;
      }
    }

    // Campaign aggregates
    let totalSent = 0, totalDelivered = 0, totalReplied = 0, totalConversions = 0;
    let activeCampaigns = 0;
    for (const c of campaigns) {
      totalSent += c.sent ?? 0;
      totalDelivered += c.delivered ?? 0;
      totalReplied += c.replied ?? 0;
      totalConversions += c.conversions ?? 0;
      if (c.status === 'active') activeCampaigns++;
    }

    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? parseFloat(((totalConversions / totalLeads) * 100).toFixed(2)) : 0;
    const replyRate = totalSent > 0 ? parseFloat(((totalReplied / totalSent) * 100).toFixed(2)) : 0;

    // Use timeSeriesRes if available, otherwise fallback to daily breakdown of current leads
    let dailyMetrics = timeSeriesRes.data || [];
    if (!dailyMetrics.length) {
       // Simple group by date for last 30 days
       const metricsMap: Record<string, any> = {};
       const now = new Date();
       for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          metricsMap[dateStr] = { date: dateStr, leads: 0, conversions: 0, replies: 0 };
       }

       for (const lead of leads as any) {
          const d = lead.created_at?.split('T')[0];
          if (metricsMap[d]) {
             metricsMap[d].leads++;
             if (lead.status === 'closed') metricsMap[d].conversions++;
          }
       }
       dailyMetrics = Object.values(metricsMap);
    }

    return addCors(
      json({
        total_leads: totalLeads,
        new_leads: statusCounts['new'],
        contacted: statusCounts['contacted'],
        follow_up: statusCounts['follow-up'],
        interested: statusCounts['interested'],
        closed: statusCounts['closed'],
        total_campaigns: campaigns.length,
        active_campaigns: activeCampaigns,
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_replied: totalReplied,
        total_conversions: totalConversions,
        conversion_rate: conversionRate,
        reply_rate: replyRate,
        leads_by_source: sourceCounts,
        recent_leads: recentRes.data ?? [],
        daily_metrics: dailyMetrics,
      }),
    );
  } catch (e) {
    return addCors(err(e instanceof Error ? e.message : 'Internal error', 500));
  }
});

function addCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

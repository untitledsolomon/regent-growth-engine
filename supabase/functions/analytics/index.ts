/**
 * Analytics Edge Function
 *
 * Routes:
 *   GET /analytics/summary – aggregate pipeline health metrics
 *
 * Returns:
 *   {
 *     total_leads, new_leads, contacted, follow_up, interested, closed,
 *     total_campaigns, active_campaigns,
 *     total_sent, total_delivered, total_replied, total_conversions,
 *     conversion_rate,          // conversions / total_leads * 100
 *     reply_rate,               // total_replied / total_sent * 100
 *     leads_by_source,          // { source: count }
 *     recent_leads,             // last 5 leads
 *   }
 *
 * Auth: same as other functions (service-role or agent key bypasses RLS)
 */

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

    // If using scoped auth, we must filter queries by org_id
    const filterByOrg = (query: any) => scopedAuth ? query.eq('org_id', scopedAuth.org_id) : query;

    // Run queries in parallel
    const [leadsRes, campaignsRes, recentRes] = await Promise.all([
      filterByOrg(supabase.from('leads').select('status, source')),
      filterByOrg(supabase
        .from('campaigns')
        .select('status, sent, delivered, replied, conversions')),
      filterByOrg(supabase
        .from('leads')
        .select('id, name, business, status, source, created_at')
        .order('created_at', { ascending: false })
        .limit(5)),
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

      // Attribution logic
      const postId = (lead as any).metadata?.postId;
      if (postId) {
        contentAttribution[postId] = (contentAttribution[postId] ?? 0) + 1;
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
    const conversionRate =
      totalLeads > 0
        ? parseFloat(((totalConversions / totalLeads) * 100).toFixed(2))
        : 0;
    const replyRate =
      totalSent > 0
        ? parseFloat(((totalReplied / totalSent) * 100).toFixed(2))
        : 0;

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
        content_attribution: contentAttribution,
        recent_leads: recentRes.data ?? [],
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

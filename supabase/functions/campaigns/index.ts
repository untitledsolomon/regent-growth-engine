/**
 * Campaigns Edge Function
 *
 * Routes:
 *   POST  /campaigns          – create a campaign
 *   POST  /campaigns/:id/send – execute / send a campaign (marks active, logs delivery start)
 *
 * Auth: same as leads function (service-role key or agent API key bypasses RLS)
 */

import { corsHeaders } from '../_shared/cors.ts';
import { getClient, json, err } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const localPath = url.pathname.replace(/^\/functions\/v1\/campaigns/, '') || '/';

  const supabase = getClient(req);

  try {
    // ── POST /campaigns/:id/send ──────────────────────────────────────────────
    const sendMatch = localPath.match(/^\/([a-f0-9-]{36})\/send$/);
    if (req.method === 'POST' && sendMatch) {
      const campaignId = sendMatch[1];

      // Fetch campaign to validate it exists and check state
      const { data: campaign, error: fetchErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchErr || !campaign) {
        return addCors(err('Campaign not found', 404));
      }
      if (campaign.status === 'completed') {
        return addCors(err('Campaign already completed', 409));
      }

      // Count eligible leads
      const { count: leadsCount } = await supabase
        .from('campaign_leads')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      // Transition to active and record leads_count
      const { data: updated, error: updateErr } = await supabase
        .from('campaigns')
        .update({
          status: 'active',
          leads_count: leadsCount ?? campaign.leads_count,
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (updateErr) return addCors(err(updateErr.message, 500));

      // Mark all pending campaign_leads as sent (delivery simulation)
      await supabase
        .from('campaign_leads')
        .update({ status: 'sent' })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      return addCors(
        json({
          message: 'Campaign send initiated',
          campaign: updated,
          leads_queued: leadsCount ?? 0,
        }),
      );
    }

    // ── POST /campaigns ───────────────────────────────────────────────────────
    if (req.method === 'POST' && (localPath === '/' || localPath === '')) {
      const body = await req.json();

      // Optionally accept lead_ids to link immediately
      const { lead_ids, ...campaignFields } = body as {
        lead_ids?: string[];
        [key: string]: unknown;
      };

      const { data: campaign, error: insertErr } = await supabase
        .from('campaigns')
        .insert(campaignFields)
        .select()
        .single();

      if (insertErr) return addCors(err(insertErr.message, 500));

      // Link provided leads
      if (lead_ids && lead_ids.length > 0) {
        const junction = lead_ids.map((lid) => ({
          campaign_id: campaign.id,
          lead_id: lid,
        }));
        const { error: linkErr } = await supabase
          .from('campaign_leads')
          .insert(junction);
        if (linkErr) {
          // Don't fail the whole request; return partial success
          return addCors(
            json(
              {
                campaign,
                warning: `Campaign created but failed to link leads: ${linkErr.message}`,
              },
              201,
            ),
          );
        }
        // Update leads_count
        await supabase
          .from('campaigns')
          .update({ leads_count: lead_ids.length })
          .eq('id', campaign.id);
        campaign.leads_count = lead_ids.length;
      }

      return addCors(json(campaign, 201));
    }

    return addCors(err('Not found', 404));
  } catch (e) {
    return addCors(err(e instanceof Error ? e.message : 'Internal error', 500));
  }
});

function addCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}

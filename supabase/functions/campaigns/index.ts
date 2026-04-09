/**
 * Campaigns Edge Function
 *
 * Routes:
 *   POST  /campaigns          – create a campaign (optionally with lead_ids)
 *   POST  /campaigns/:id/send – execute the campaign; sends real emails via Resend
 *
 * Auth: same as leads function (service-role key or agent API key bypasses RLS)
 *
 * Required env vars for email delivery (set in Supabase Edge Function Secrets):
 *   RESEND_API_KEY – Resend API key for sending campaign emails
 *
 * Campaign email template fields (set when creating/updating a campaign):
 *   subject        – email subject line (required for email/both channel)
 *   message_html   – HTML body; supports {{name}}, {{business}} placeholders
 *   message_text   – plain-text fallback
 *   from_name      – sender display name (defaults to "Regent")
 *   from_email     – verified Resend sender address (defaults to updates@regent.systems)
 */

import { corsHeaders } from '../_shared/cors.ts';
import { getClient, adminClient, json, err } from '../_shared/supabase.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_BATCH_SIZE = 10; // Resend batch send limit

/** Replace {{name}} and {{business}} placeholders in a template string. */
function renderTemplate(template: string, lead: { name?: string; business?: string }): string {
  return template
    .replace(/\{\{name\}\}/g, lead.name ?? 'there')
    .replace(/\{\{business\}\}/g, lead.business ?? 'your business');
}

/** Send one email via Resend. Returns true on success. */
async function sendEmail(opts: {
  to: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email delivery skipped');
    return false;
  }

  const body: Record<string, unknown> = {
    from: `${opts.fromName} <${opts.fromEmail}>`,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.text) body.text = opts.text;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error('Resend send error:', res.status, errData);
    return false;
  }
  return true;
}

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

      // Fetch campaign
      const { data: campaign, error: fetchErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchErr || !campaign) return addCors(err('Campaign not found', 404));
      if (campaign.status === 'completed') return addCors(err('Campaign already completed', 409));

      // Fetch pending campaign_leads joined with lead details
      const admin = adminClient();
      const { data: pendingRows, error: pendingErr } = await admin
        .from('campaign_leads')
        .select('id, lead_id, leads(id, name, business, email, phone)')
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');

      if (pendingErr) return addCors(err(pendingErr.message, 500));

      const pending = pendingRows ?? [];
      const leadsCount = pending.length;

      // Transition campaign to active
      const { data: updated, error: updateErr } = await admin
        .from('campaigns')
        .update({ status: 'active', leads_count: leadsCount })
        .eq('id', campaignId)
        .select()
        .single();

      if (updateErr) return addCors(err(updateErr.message, 500));

      // Determine delivery mode
      const channel: string = campaign.channel ?? 'email';
      const sendEmails = channel === 'email' || channel === 'both';

      const fromName = campaign.from_name || 'Regent';
      const fromEmail = campaign.from_email || 'updates@regent.systems';
      const subject = campaign.subject || campaign.name;
      const htmlTemplate = campaign.message_html || `<p>Hi {{name}},</p><p>${campaign.name}</p>`;
      const textTemplate = campaign.message_text;

      let sentCount = 0;
      const sentIds: string[] = [];
      const failedIds: string[] = [];

      if (sendEmails && RESEND_API_KEY) {
        // Process in batches to respect Resend rate limits
        for (let i = 0; i < pending.length; i += RESEND_BATCH_SIZE) {
          const batch = pending.slice(i, i + RESEND_BATCH_SIZE);
          await Promise.all(
            batch.map(async (row) => {
              const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads;
              if (!lead?.email) {
                failedIds.push(row.id);
                return;
              }
              const success = await sendEmail({
                to: lead.email,
                fromName,
                fromEmail,
                subject: renderTemplate(subject, lead),
                html: renderTemplate(htmlTemplate, lead),
                text: textTemplate ? renderTemplate(textTemplate, lead) : undefined,
              });
              if (success) {
                sentIds.push(row.id);
                sentCount++;
              } else {
                failedIds.push(row.id);
              }
            }),
          );
        }

        // Mark sent rows
        if (sentIds.length > 0) {
          await admin
            .from('campaign_leads')
            .update({ status: 'sent' })
            .in('id', sentIds);
        }
      } else {
        // No email delivery configured (WhatsApp-only or missing Resend key) — mark all as sent for tracking
        sentCount = leadsCount;
        await admin
          .from('campaign_leads')
          .update({ status: 'sent' })
          .eq('campaign_id', campaignId)
          .eq('status', 'pending');

        if (!RESEND_API_KEY && sendEmails) {
          console.warn('RESEND_API_KEY not configured — marked leads as sent without actual delivery');
        }
      }

      // Update campaign sent count
      await admin
        .from('campaigns')
        .update({ sent: sentCount })
        .eq('id', campaignId);

      return addCors(
        json({
          message: 'Campaign send initiated',
          campaign: { ...updated, sent: sentCount },
          leads_queued: leadsCount,
          leads_sent: sentCount,
          leads_failed: failedIds.length,
          email_delivery: sendEmails && !!RESEND_API_KEY,
        }),
      );
    }

    // ── POST /campaigns ───────────────────────────────────────────────────────
    if (req.method === 'POST' && (localPath === '/' || localPath === '')) {
      const body = await req.json();

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

      if (lead_ids && lead_ids.length > 0) {
        const junction = lead_ids.map((lid) => ({
          campaign_id: campaign.id,
          lead_id: lid,
        }));
        const { error: linkErr } = await supabase
          .from('campaign_leads')
          .insert(junction);
        if (linkErr) {
          return addCors(
            json(
              { campaign, warning: `Campaign created but failed to link leads: ${linkErr.message}` },
              201,
            ),
          );
        }
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

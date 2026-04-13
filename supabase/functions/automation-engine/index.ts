import { corsHeaders } from '../_shared/cors.ts';
import { adminClient, json, err } from '../_shared/supabase.ts';
import { dispatchMessage } from '../_shared/integrations/mod.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = adminClient();

  try {
    const { type, lead } = await req.json();

    if (!type || !lead) {
      return json({ message: 'Missing type or lead data' }, 400);
    }

    // 1. Fetch enabled rules for this trigger type and org
    const { data: rules, error: rulesErr } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('org_id', lead.org_id)
      .eq('trigger_type', type)
      .eq('enabled', true);

    if (rulesErr) throw rulesErr;

    const results = [];

    // 2. Execute each rule
    for (const rule of rules || []) {
      try {
        let success = false;
        let errorMsg = '';

        if (rule.action_type === 'send_whatsapp') {
          const res = await dispatchMessage('whatsapp', {
            to_phone: lead.phone,
            body_text: rule.config.message || `Hi ${lead.name}, thanks for reaching out!`,
          });
          success = !!res.whatsapp_success;
        } else if (rule.action_type === 'send_email') {
          const res = await dispatchMessage('email', {
            to_email: lead.email,
            subject: rule.config.subject || 'Welcome to Regent',
            body_html: rule.config.html || `<p>Hi ${lead.name}, we received your inquiry.</p>`,
          });
          success = !!res.email_success;
        }

        // 3. Log execution
        await supabase.from('automation_logs').insert({
          org_id: lead.org_id,
          rule_id: rule.id,
          lead_id: lead.id,
          status: success ? 'success' : 'failed',
          error: success ? null : 'Integration failed',
        });

        results.push({ rule: rule.name, status: success ? 'success' : 'failed' });
      } catch (e) {
        console.error(`Error executing rule ${rule.id}:`, e);
      }
    }

    return json({ processed: results.length, results });
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Internal error', 500);
  }
});

/**
 * Leads Edge Function
 *
 * Routes:
 *   POST   /leads           – create a single lead
 *   GET    /leads           – query leads (filter: status, source, limit, offset)
 *   PATCH  /leads/:id       – update lead status / score / fields
 *   POST   /leads/import    – bulk-import an array of leads
 *
 * Auth:
 *   Agents:  pass  x-agent-api-key: <AGENT_API_KEY>
 *            or    Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *   Browser: pass  Authorization: Bearer <user-jwt>  (RLS applied)
 */

import { corsHeaders } from '../_shared/cors.ts';
import { getClient, json, err } from '../_shared/supabase.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  // Supabase prepends /functions/v1/<fn-name>; strip that to get the local path.
  const localPath = url.pathname.replace(/^\/functions\/v1\/leads/, '') || '/';

  const supabase = getClient(req);

  try {
    // ── POST /leads/import ────────────────────────────────────────────────────
    if (req.method === 'POST' && localPath === '/import') {
      const body = await req.json();
      const leads: unknown[] = Array.isArray(body) ? body : body.leads;
      if (!Array.isArray(leads) || leads.length === 0) {
        return addCors(err('Body must be an array of leads or { leads: [...] }'));
      }
      const { data, error } = await supabase
        .from('leads')
        .insert(leads)
        .select();
      if (error) return addCors(err(error.message, 500));
      return addCors(json({ imported: data?.length ?? 0, leads: data }));
    }

    // ── POST /leads ───────────────────────────────────────────────────────────
    if (req.method === 'POST' && (localPath === '/' || localPath === '')) {
      const body = await req.json();
      const { data, error } = await supabase
        .from('leads')
        .insert(body)
        .select()
        .single();
      if (error) return addCors(err(error.message, 500));
      return addCors(json(data, 201));
    }

    // ── GET /leads ────────────────────────────────────────────────────────────
    if (req.method === 'GET' && (localPath === '/' || localPath === '')) {
      const status = url.searchParams.get('status');
      const source = url.searchParams.get('source');
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200);
      const offset = parseInt(url.searchParams.get('offset') ?? '0');

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);
      if (source) query = query.eq('source', source);

      const { data, error, count } = await query;
      if (error) return addCors(err(error.message, 500));
      return addCors(json({ leads: data, total: count, limit, offset }));
    }

    // ── PATCH /leads/:id ──────────────────────────────────────────────────────
    const patchMatch = localPath.match(/^\/([a-f0-9-]{36})$/);
    if (req.method === 'PATCH' && patchMatch) {
      const id = patchMatch[1];
      const body = await req.json();
      const { data, error } = await supabase
        .from('leads')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      if (error) return addCors(err(error.message, 500));
      if (!data) return addCors(err('Lead not found', 404));
      return addCors(json(data));
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

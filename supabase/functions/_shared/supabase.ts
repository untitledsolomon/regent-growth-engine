import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const AGENT_API_KEY = Deno.env.get('AGENT_API_KEY') ?? '';

/**
 * Scoped credentials returned by API key verification
 */
export interface ScopedAuth {
  org_id: string;
  scopes: string[];
}

/**
 * Returns an admin Supabase client (bypasses RLS) when the request carries a
 * valid agent API key or the Supabase service-role key.  Otherwise returns a
 * user-scoped client that respects RLS.
 */
export function getClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? '';
  const agentKey = req.headers.get('x-agent-api-key') ?? '';

  const isServiceRole = authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
  const isAgentKey = AGENT_API_KEY.length > 0 && agentKey === AGENT_API_KEY;

  if (isServiceRole || isAgentKey) {
    return adminClient();
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

/**
 * Verifies a scoped API key and returns its org_id and scopes.
 * Use this for public-facing integration points (like lead capture).
 */
export async function getScopedAuth(req: Request): Promise<ScopedAuth | null> {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return null;

  const supabase = adminClient();
  const { data, error } = await supabase.rpc('verify_api_key', { p_key: apiKey });

  if (error || !data || data.length === 0) {
    console.error('API key verification failed:', error);
    return null;
  }

  return {
    org_id: data[0].org_id,
    scopes: data[0].scopes,
  };
}

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

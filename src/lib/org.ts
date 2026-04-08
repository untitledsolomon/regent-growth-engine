import { supabase } from "./supabase";

export async function getUserOrg() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organisations(name, slug)')
    .eq('user_id', user.id)
    .maybeSingle();

  return data;
}

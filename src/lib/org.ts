import { supabase } from "./supabase";

export async function getUserOrg() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organisations(name, slug)')
    .eq('user_id', user!.id)
    .single();
  return data;
}
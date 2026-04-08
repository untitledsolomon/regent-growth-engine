import { supabase } from "./supabase";

export async function getUserOrg() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('current auth user:', user?.id); // ← add this
  if (!user) return null;

  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organisations(name, slug)')
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('org_members query result:', data); // ← add this
  return data;
}
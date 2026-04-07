import { supabase } from "./supabase";

// ─── TYPES ───────────────────────────────────────────────
export interface PBConfig {
  apiKey: string;
  selectedPhantomId: string;
  autoSync: boolean;
  syncInterval: string;
}

export interface WAConfig {
  phoneNumberId: string;
  accessToken: string;
  businessNumber: string;
}

export interface ZohoConfig {
  host: string;
  port: string;
  tls: boolean;
  email: string;
  password: string;
}

// ─── LOAD / SAVE CONFIG ──────────────────────────────────
export async function loadConfig(integration: string) {
  const { data, error } = await supabase
    .from("integration_configs")
    .select("*")
    .eq("integration", integration)
    .single();
  if (error) throw error;
  return data;
}

export async function saveConfig(integration: string, config: object, connected: boolean) {
  const { error } = await supabase
    .from("integration_configs")
    .update({ config, connected, updated_at: new Date().toISOString() })
    .eq("integration", integration);
  if (error) throw error;
}

// ─── PHANTOMBUSTER ───────────────────────────────────────
export async function pbFetchAgents(apiKey: string) {
  const res = await fetch("https://api.phantombuster.com/api/v2/agents/fetch-all", {
    headers: { "X-Phantombuster-Key": apiKey },
  });
  if (!res.ok) throw new Error("Invalid PhantomBuster API key");
  return res.json(); // returns { agents: [...] }
}

export async function pbSyncLeads(apiKey: string, agentId: string) {
  const start = Date.now();

  const res = await fetch(
    `https://api.phantombuster.com/api/v2/agents/fetch-output?id=${agentId}`,
    { headers: { "X-Phantombuster-Key": apiKey } }
  );
  if (!res.ok) throw new Error("Failed to fetch PhantomBuster output");

  const data = await res.json();
  const output = data.output ? JSON.parse(data.output) : [];
  const leads = Array.isArray(output) ? output : [];

  // Map PB output → leads table shape
  const mapped = leads.map((l: any) => ({
    name: l.fullName || l.name || "Unknown",
    email: l.email || null,
    phone: l.phone || null,
    business: l.companyName || l.company || "Unknown",
    source: "phantombuster",
    status: "new",
    score: 50,
    tags: ["phantombuster"],
  }));

  // Upsert leads
  if (mapped.length > 0) {
    await supabase.from("leads").insert(mapped);
  }

  // Log the sync
  const duration = `${((Date.now() - start) / 1000).toFixed(1)}s`;
  await supabase.from("integration_sync_logs").insert({
    source: "PhantomBuster",
    leads_count: mapped.length,
    status: "success",
    duration,
  });

  return mapped.length;
}

// ─── WHATSAPP ────────────────────────────────────────────
// Proxied through Supabase Edge Function to protect the access token
export async function waSendMessage(to: string, message: string, toName?: string) {
  const { data, error } = await supabase.functions.invoke("send-whatsapp", {
    body: { to, message, toName },
  });
  if (error) throw error;

  // Log it
  await supabase.from("whatsapp_logs").insert({
    to_name: toName || null,
    to_number: to,
    message,
    status: "sent",
    wa_message_id: data?.messages?.[0]?.id || null,
  });

  return data;
}

// ─── ZOHO MAIL ───────────────────────────────────────────
// Proxied through Supabase Edge Function (SMTP can't run in browser)
export async function zohoTestConnection() {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      to: "test@internal.regent.io",
      subject: "SMTP Test — Regent Analytics",
      html: "<p>SMTP connection verified.</p>",
      isTest: true,
    },
  });
  if (error) throw error;
  return data;
}

export async function zohoSendEmail(to: string, subject: string, html: string) {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, html },
  });
  if (error) throw error;

  await supabase.from("email_logs").insert({ to_email: to, subject, status: "sent" });
  return data;
}
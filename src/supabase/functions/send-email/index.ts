import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const ZOHO_HOST = Deno.env.get("ZOHO_HOST") || "smtp.zoho.com";
const ZOHO_PORT = parseInt(Deno.env.get("ZOHO_PORT") || "587");
const ZOHO_EMAIL = Deno.env.get("ZOHO_EMAIL")!;
const ZOHO_PASSWORD = Deno.env.get("ZOHO_PASSWORD")!;

serve(async (req) => {
  const { to, subject, html } = await req.json();

  const client = new SmtpClient();
  await client.connectTLS({ hostname: ZOHO_HOST, port: ZOHO_PORT, username: ZOHO_EMAIL, password: ZOHO_PASSWORD });
  await client.send({ from: ZOHO_EMAIL, to, subject, content: html, html });
  await client.close();

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
import { sendWhatsAppMessage } from './whatsapp.ts';
import { sendZohoEmail } from './zoho.ts';

export type IntegrationChannel = 'whatsapp' | 'email' | 'both';

export interface MessagePayload {
  to_phone?: string;
  to_email?: string;
  subject?: string;
  body_text?: string;
  body_html?: string;
  from_name?: string;
}

export async function dispatchMessage(channel: IntegrationChannel, payload: MessagePayload): Promise<{
  whatsapp_success?: boolean;
  email_success?: boolean;
}> {
  const results: any = {};

  if ((channel === 'whatsapp' || channel === 'both') && payload.to_phone && payload.body_text) {
    results.whatsapp_success = await sendWhatsAppMessage(payload.to_phone, payload.body_text);
  }

  if ((channel === 'email' || channel === 'both') && payload.to_email) {
    results.email_success = await sendZohoEmail({
      to: payload.to_email,
      subject: payload.subject || 'Regent Outreach',
      html: payload.body_html || payload.body_text || '',
      fromName: payload.from_name,
    });
  }

  return results;
}

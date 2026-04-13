/**
 * WhatsApp Cloud API Integration
 */

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials missing');
    return false;
  }

  // Basic phone sanitization (remove non-digits, ensuring it starts with +)
  const cleanPhone = to.replace(/\D/g, '');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API Error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('WhatsApp Network Error:', error);
    return false;
  }
}

/**
 * Regent Integration Client
 * Copy this to your Main Platform to communicate with the Regent Growth Engine.
 */

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  source: string;
  metadata?: Record<string, any>;
}

export class RegentClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { baseUrl: string; apiKey: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Submit a new lead to the Regent Growth Engine
   */
  async captureLead(payload: LeadPayload): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to capture lead' };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Regent Lead Capture Error:', error);
      return { success: false, error: 'Network error or service unavailable' };
    }
  }

  /**
   * Helper to submit lead with retry logic
   */
  async captureLeadWithRetry(payload: LeadPayload, retries = 3): Promise<{ success: boolean; data?: any; error?: string }> {
    let lastError: string | undefined;

    for (let i = 0; i < retries; i++) {
      const result = await this.captureLead(payload);
      if (result.success) return result;

      lastError = result.error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }

    return { success: false, error: lastError || 'Max retries reached' };
  }
}

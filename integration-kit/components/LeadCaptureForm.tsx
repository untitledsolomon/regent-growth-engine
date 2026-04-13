import React, { useState } from 'react';

interface LeadFormProps {
  client: any; // RegentClient instance
  source: string;
  postId?: string;
  title?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export const LeadCaptureForm: React.FC<LeadFormProps> = ({
  client,
  source,
  postId,
  title = "Get the full case study",
  buttonText = "Download Now",
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      source: source,
      metadata: {
        postId,
        url: window.location.href,
        capturedAt: new Date().toISOString()
      }
    };

    const result = await client.captureLeadWithRetry(payload);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-2xl border border-green-100">
        <h3 className="text-xl font-bold text-green-900 mb-2">Check your inbox!</h3>
        <p className="text-green-700">We've sent the resources to your email address.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            required
            name="name"
            placeholder="Jane Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
          <input
            required
            type="email"
            name="email"
            placeholder="jane@company.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Optional)</label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : buttonText}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">
          By clicking, you agree to our privacy policy.
        </p>
      </form>
    </div>
  );
};

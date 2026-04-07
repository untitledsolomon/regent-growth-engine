import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp, signInWithMagicLink, isDemo } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let result: { error: Error | null };

    if (tab === 'magic') {
      result = await signInWithMagicLink(email);
      if (!result.error) toast.success('Check your email for the login link');
    } else if (tab === 'signup') {
      result = await signUp(email, password);
      if (!result.error) toast.success('Account created! Check your email to confirm.');
    } else {
      result = await signIn(email, password);
      if (!result.error) toast.success('Welcome back!');
    }

    if (result.error) toast.error(result.error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl" style={{ fontFamily: 'Space Grotesk' }}>R</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Regent Analytics</h1>
          <p className="text-muted-foreground mt-2">Client acquisition intelligence platform</p>
          {isDemo && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-regent-gold/15 text-sm font-medium" style={{ color: 'hsl(42, 90%, 45%)' }}>
              <Sparkles className="w-3.5 h-3.5" /> Demo Mode — No Supabase configured
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            {(['signin', 'signup', 'magic'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t === 'signin' ? 'Sign In' : t === 'signup' ? 'Sign Up' : 'Magic Link'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="pl-9" required />
              </div>
            </div>

            {tab !== 'magic' && (
              <div>
                <Label className="text-xs">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" required minLength={6} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Magic Link'}
            </Button>
          </form>

          {isDemo && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              In demo mode, any credentials will log you in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

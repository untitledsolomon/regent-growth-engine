import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Sparkles, Users, TrendingUp, Zap } from 'lucide-react';

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

  const stats = [
    { icon: Users, value: '2,847', label: 'Leads Captured' },
    { icon: TrendingUp, value: '34.2%', label: 'Conversion Rate' },
    { icon: Zap, value: '12.5K', label: 'Messages Sent' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — gradient hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 50%, hsla(280, 100%, 36%, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, hsla(239, 70%, 72%, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, hsla(200, 80%, 60%, 0.2) 0%, transparent 50%)
          `
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="font-bold text-lg font-display">R</span>
              </div>
              <span className="font-display font-bold text-xl">Regent</span>
            </div>
            <p className="text-white/60 text-sm">Client Acquisition Intelligence</p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-bold leading-tight">
                Turn leads into<br />revenue, faster.
              </h2>
              <p className="text-white/70 mt-4 text-base leading-relaxed max-w-md">
                Automate your outreach pipeline with AI-powered insights, multi-channel messaging, and real-time analytics.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <stat.icon className="w-5 h-5 text-white/60 mb-2" />
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">© 2025 Regent Analytics. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-[420px] space-y-8">
          <div>
            <div className="lg:hidden flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">R</span>
              </div>
              <span className="text-foreground font-display font-bold text-xl">Regent</span>
            </div>
            <h1 className="text-2xl font-display font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Sign in to your acquisition dashboard</p>
            {isDemo && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-sm font-medium text-warning">
                <Sparkles className="w-3.5 h-3.5" /> Demo Mode
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {(['signin', 'signup', 'magic'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t === 'signin' ? 'Sign In' : t === 'signup' ? 'Sign Up' : 'Magic Link'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="pl-10 h-11 rounded-xl" required />
                </div>
              </div>

              {tab !== 'magic' && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 h-11 rounded-xl" required minLength={6} />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white font-semibold text-sm" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {tab === 'signin' ? 'Sign In' : tab === 'signup' ? 'Create Account' : 'Send Magic Link'}
              </Button>
            </form>

            {isDemo && (
              <p className="text-center text-xs text-muted-foreground">
                In demo mode, any credentials will log you in.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Palette, Plug, ArrowRight, Check } from 'lucide-react';

const steps = [
  { icon: Building2, title: 'Your Workspace', desc: 'Set up your company details' },
  { icon: Palette, title: 'Branding', desc: 'Customize your look' },
  { icon: Plug, title: 'Integrations', desc: 'Connect your tools' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { workspace, setWorkspace, setIsOnboarded } = useWorkspace();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState(workspace.name);
  const [color, setColor] = useState(workspace.primary_color);

  const handleFinish = () => {
    setWorkspace({ ...workspace, name: companyName, primary_color: color });
    setIsOnboarded(true);
    toast.success('Welcome to Regent! Your workspace is ready.');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>Welcome to Regent</h1>
          <p className="text-muted-foreground mt-2">Let's get your workspace set up in 3 quick steps</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? 'bg-accent text-accent-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-accent' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk' }}>Workspace Details</h2>
              </div>
              <div>
                <Label className="text-xs">Company / Agency Name</Label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Agency" className="mt-1" />
              </div>
              <Button className="w-full gap-2" onClick={() => setStep(1)}>
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk' }}>Brand Colors</h2>
              </div>
              <div>
                <Label className="text-xs">Primary Color</Label>
                <div className="flex gap-3 mt-2">
                  {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Custom Hex</Label>
                <Input value={color} onChange={e => setColor(e.target.value)} className="mt-1 font-mono" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(2)}>Next <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plug className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk' }}>Connect Integrations</h2>
              </div>
              <p className="text-sm text-muted-foreground">You can connect integrations now or do it later from the Integrations page.</p>
              <div className="space-y-2">
                {['PhantomBuster', 'WhatsApp Business', 'Zoho Mail'].map(name => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{name}</span>
                    <Button variant="outline" size="sm" onClick={() => toast.info(`${name} setup → configure in Integrations page`)}>
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 gap-2" onClick={handleFinish}>
                  <Check className="w-4 h-4" /> Finish Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

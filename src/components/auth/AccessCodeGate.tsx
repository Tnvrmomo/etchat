import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, MessageCircle, Video, Phone, FileText, Users } from 'lucide-react';

interface AccessCodeGateProps {
  onAccessGranted: () => void;
}

const ACCESS_CODE = 'engineerstechowner';

export const AccessCodeGate = ({ onAccessGranted }: AccessCodeGateProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toLowerCase() === ACCESS_CODE.toLowerCase()) {
      localStorage.setItem('et-chat-access', 'granted');
      onAccessGranted();
    } else {
      setError('Invalid access code');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const features = [
    { icon: MessageCircle, label: 'Real-time Messaging' },
    { icon: Phone, label: 'Voice Calls' },
    { icon: Video, label: 'Video Calls' },
    { icon: Users, label: 'Group Calling' },
    { icon: FileText, label: 'Document Sharing' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float-delayed" />
      
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-organic-xl overflow-hidden shadow-warm animate-scale-in">
            <img 
              src="/et-chat-logo.jpg" 
              alt="eT chat" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground animate-fade-in-up">
            eT chat
          </h1>
          <p className="text-muted-foreground text-center animate-fade-in-up stagger-1">
            Enter your access code to unlock full features
          </p>
        </div>

        {/* Features preview */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up stagger-2">
          {features.map((feature, index) => (
            <div 
              key={feature.label}
              className="flex items-center gap-2 px-3 py-2 bg-card rounded-organic border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-display text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Access form */}
        <form 
          onSubmit={handleSubmit} 
          className={`space-y-4 animate-fade-in-up stagger-3 ${isShaking ? 'animate-wiggle' : ''}`}
        >
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter access code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              className="pl-12 h-14 text-lg rounded-organic-lg bg-card border-border focus:border-primary focus:ring-primary"
            />
          </div>
          
          {error && (
            <p className="text-destructive text-sm text-center animate-fade-in-up">
              {error}
            </p>
          )}

          <Button 
            type="submit"
            className="w-full h-14 text-lg font-display font-semibold rounded-organic-lg shadow-warm hover-lift"
          >
            Unlock eT chat
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center animate-fade-in-up stagger-4">
          Powered by Lovable Cloud • Secure & Private
        </p>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, MessageCircle, Phone, CheckCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationOnboardingProps {
  onComplete: () => void;
}

export const NotificationOnboarding = ({ onComplete }: NotificationOnboardingProps) => {
  const { permission, subscribe, isLoading, isSupported } = usePushNotifications();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEnable = async () => {
    await subscribe();
    setShowSuccess(true);
    setTimeout(onComplete, 1500);
  };

  const handleSkip = () => {
    localStorage.setItem('et-chat-notifications-skipped', 'true');
    onComplete();
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            You're all set!
          </h2>
          <p className="text-muted-foreground">
            You'll receive notifications for messages and calls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-organic overflow-hidden shadow-soft">
          <img src="/et-chat-logo.jpg" alt="eT chat" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-display text-xl font-bold text-foreground">eT chat</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-gentle-bounce">
          <Bell className="w-12 h-12 text-primary" />
        </div>

        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
          Stay Connected
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8">
          Enable notifications to never miss important messages and calls from your friends
        </p>

        {/* Benefits */}
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-center gap-4 p-4 bg-card rounded-organic border border-border">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-foreground">New Messages</h3>
              <p className="text-sm text-muted-foreground">Get notified when someone sends you a message</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-organic border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-foreground">Incoming Calls</h3>
              <p className="text-sm text-muted-foreground">Never miss a voice or video call</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          {isSupported && permission !== 'denied' ? (
            <Button 
              onClick={handleEnable} 
              className="w-full gap-2"
              size="lg"
              disabled={isLoading}
            >
              <Bell className="w-5 h-5" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          ) : permission === 'denied' ? (
            <div className="p-4 bg-destructive/10 rounded-organic text-center">
              <BellOff className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-organic text-center">
              <p className="text-sm text-muted-foreground">
                Notifications are not supported in this browser
              </p>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center mt-8">
        You can change this anytime in Settings
      </p>
    </div>
  );
};

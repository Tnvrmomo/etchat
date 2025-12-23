import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { isPWAInstalled } from '@/utils/notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (isPWAInstalled()) return;
    
    const dismissed = localStorage.getItem('et-chat-pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = isPWAInstalled();
    
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS - show instructions
      return;
    }

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.removeItem('et-chat-pwa-dismissed');
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('et-chat-pwa-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-card border border-border rounded-organic-lg shadow-warm p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-organic overflow-hidden shadow-soft flex-shrink-0">
            <img src="/et-chat-logo.jpg" alt="eT chat" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground">Install eT chat</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS 
                ? 'Tap the share button and "Add to Home Screen" for the best experience'
                : 'Install for quick access and offline support'
              }
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              {!isIOS && (
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isInstalling ? 'Installing...' : 'Install'}
                </Button>
              )}
              {isIOS && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>Share → Add to Home Screen</span>
                </div>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
              >
                Later
              </Button>
            </div>
          </div>

          <Button 
            size="icon" 
            variant="ghost" 
            className="flex-shrink-0 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

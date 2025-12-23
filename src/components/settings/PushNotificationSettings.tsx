import { Bell, BellOff, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationSettings = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-card rounded-organic-lg p-4 border border-border">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-display font-medium text-foreground">
              Push Notifications Not Supported
            </p>
            <p className="text-sm">
              Your browser doesn't support push notifications
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-card rounded-organic-lg p-4 border border-destructive/30">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-display font-medium text-foreground">
              Notifications Blocked
            </p>
            <p className="text-sm text-muted-foreground">
              Please enable notifications in your browser settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="bg-card rounded-organic-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-display font-medium text-foreground">
                Push Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed 
                  ? 'Receive notifications when app is closed' 
                  : 'Enable to receive background notifications'}
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch 
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          )}
        </div>
        
        {error && (
          <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isSubscribed && (
        <div className="bg-primary/5 rounded-organic-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-display font-medium text-foreground text-sm">
                Push Notifications Active
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive notifications for messages, calls, and updates
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test notification button */}
      {isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onClick={sendTestNotification}
          className="w-full rounded-organic gap-2"
        >
          <Send className="w-4 h-4" />
          Send Test Notification
        </Button>
      )}

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center px-4">
        Push notifications work even when the app is closed or in the background.
        {!isSubscribed && ' Enable them to never miss important updates.'}
      </p>
    </div>
  );
};

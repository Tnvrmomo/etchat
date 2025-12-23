import { useState, useEffect } from 'react';
import { X, Phone, Video, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'message' | 'call' | 'video_call' | 'file' | 'missed_call';
  title: string;
  body: string;
  avatar?: string;
  timestamp: Date;
  data?: {
    callerId?: string;
    conversationId?: string;
    callType?: 'voice' | 'video';
  };
  onAction?: () => void;
  onDismiss?: () => void;
}

interface BubbleNotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

export const BubbleNotification = ({ notification, onDismiss, onAction }: BubbleNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss after 5 seconds (except for calls)
    if (notification.type !== 'call' && notification.type !== 'video_call') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    handleDismiss();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'call':
        return <Phone className="w-5 h-5 text-secondary animate-pulse" />;
      case 'video_call':
        return <Video className="w-5 h-5 text-primary animate-pulse" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-accent" />;
      case 'file':
        return <FileText className="w-5 h-5 text-muted-foreground" />;
      case 'missed_call':
        return <Phone className="w-5 h-5 text-destructive" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const isCallNotification = notification.type === 'call' || notification.type === 'video_call';

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm',
        'bg-card border border-border rounded-organic-xl shadow-warm',
        'transition-all duration-300 ease-out',
        isVisible && !isExiting ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
        isCallNotification && 'animate-gentle-bounce'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar/Icon */}
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            {notification.avatar ? (
              <span className="text-2xl">{notification.avatar}</span>
            ) : (
              getIcon()
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-semibold text-foreground truncate">
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.body}
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Call actions */}
            {isCallNotification && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDismiss}
                  className="flex-1 rounded-organic"
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={handleAction}
                  className="flex-1 rounded-organic bg-secondary hover:bg-secondary/90"
                >
                  {notification.type === 'video_call' ? 'Video' : 'Answer'}
                </Button>
              </div>
            )}

            {/* Message action */}
            {notification.type === 'message' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAction}
                className="mt-2 text-primary font-display"
              >
                Open Chat →
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {!isCallNotification && (
        <div className="h-1 bg-muted rounded-b-organic-xl overflow-hidden">
          <div 
            className="h-full bg-primary transition-all ease-linear"
            style={{ 
              width: '100%',
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

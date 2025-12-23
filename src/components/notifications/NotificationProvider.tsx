import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BubbleNotification, Notification } from './BubbleNotification';

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  showCallNotification: (callerName: string, avatar: string, callType: 'voice' | 'video', onAccept: () => void) => void;
  showMessageNotification: (senderName: string, message: string, avatar: string, onOpen: () => void) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notif,
      id,
      timestamp: new Date(),
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const showCallNotification = useCallback((
    callerName: string,
    avatar: string,
    callType: 'voice' | 'video',
    onAccept: () => void
  ) => {
    showNotification({
      type: callType === 'video' ? 'video_call' : 'call',
      title: callerName,
      body: `Incoming ${callType} call...`,
      avatar,
      data: { callType },
      onAction: onAccept,
    });
  }, [showNotification]);

  const showMessageNotification = useCallback((
    senderName: string,
    message: string,
    avatar: string,
    onOpen: () => void
  ) => {
    showNotification({
      type: 'message',
      title: senderName,
      body: message,
      avatar,
      onAction: onOpen,
    });
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleAction = useCallback((notification: Notification) => {
    if (notification.onAction) {
      notification.onAction();
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showCallNotification,
        showMessageNotification,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
      
      {/* Render notifications */}
      {notifications.slice(-3).map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            transform: `translateY(${index * 8}px)`,
            zIndex: 100 - index 
          }}
        >
          <BubbleNotification
            notification={notification}
            onDismiss={dismissNotification}
            onAction={handleAction}
          />
        </div>
      ))}
    </NotificationContext.Provider>
  );
};

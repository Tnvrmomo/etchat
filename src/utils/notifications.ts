export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });
  }
};

export const showCallNotification = (
  callerName: string,
  callType: 'voice' | 'video',
  onAccept: () => void,
  onReject: () => void
): void => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(`${callerName} is calling...`, {
      body: `Incoming ${callType} call`,
      icon: '/pwa-192x192.png',
      tag: 'incoming-call',
      requireInteraction: true,
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'reject', title: 'Decline' },
      ],
    } as NotificationOptions);

    notification.onclick = () => {
      onAccept();
      notification.close();
    };
  }
};

export const showMessageNotification = (
  senderName: string,
  message: string,
  onClick?: () => void
): void => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(senderName, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/pwa-192x192.png',
      tag: 'new-message',
    });

    if (onClick) {
      notification.onclick = () => {
        onClick();
        notification.close();
      };
    }
  }
};

export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

export const canInstallPWA = (): boolean => {
  return 'BeforeInstallPromptEvent' in window || 
    (!isPWAInstalled() && 'serviceWorker' in navigator);
};

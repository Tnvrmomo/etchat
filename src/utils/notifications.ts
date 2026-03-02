import { Capacitor } from '@capacitor/core';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  // when running inside Capacitor native container, use the push/local plugins
  if (Capacitor.isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const status = await PushNotifications.requestPermissions();
      if (status.receive === 'granted') {
        await PushNotifications.register();
      }
      return status.receive === 'granted' ? 'granted' : 'denied';
    } catch (err) {
      console.error('native permission request failed', err);
      return 'denied';
    }
  }

  // otherwise fallback to browser API
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

export const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(),
          title,
          body: options?.body,
          extra: options,
        },
      ],
    });
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/et-chat-logo.jpg',
      badge: '/et-chat-logo.jpg',
      ...options,
    });
  }
};

export const showCallNotification = async (
  callerName: string,
  callType: 'voice' | 'video',
  onAccept: () => void,
  onReject: () => void
): Promise<void> => {
  // for native we use a local notification that launches the app
  if (Capacitor.isNativePlatform()) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(),
          title: `${callerName} is calling...`,
          body: `Incoming ${callType} call`,
          extra: { callType },
          smallIcon: 'ic_stat_pwa',
          channelId: 'calls',
          // on Android we could add actions in native code if needed
        },
      ],
    });
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(`${callerName} is calling...`, {
      body: `Incoming ${callType} call`,
      icon: '/et-chat-logo.jpg',
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

export const showMessageNotification = async (
  senderName: string,
  message: string,
  onClick?: () => void
): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(),
          title: senderName,
          body: message.length > 100 ? message.substring(0, 100) + '...' : message,
          extra: { onClick },
        },
      ],
    });
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(senderName, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/et-chat-logo.jpg',
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

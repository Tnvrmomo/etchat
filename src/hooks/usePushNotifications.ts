import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    permission: 'unsupported',
    isSubscribed: false,
    isLoading: true,
    error: null
  });
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'unsupported'
    }));
    
    return isSupported;
  }, []);

  // Load VAPID public key from edge function
  const loadVapidKey = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-key');
      
      if (error) throw error;
      
      if (data?.publicKey) {
        setVapidPublicKey(data.publicKey);
        return data.publicKey;
      }
      throw new Error('VAPID public key not available');
    } catch (error) {
      console.error('Error loading VAPID key:', error);
      setState(prev => ({ ...prev, error: 'Failed to load push configuration' }));
      return null;
    }
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[Push] Service worker registered:', reg);
      setRegistration(reg);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      return reg;
    } catch (error) {
      console.error('[Push] Service worker registration failed:', error);
      setState(prev => ({ ...prev, error: 'Failed to register service worker' }));
      return null;
    }
  }, []);

  // Check existing subscription
  const checkExistingSubscription = useCallback(async (reg: ServiceWorkerRegistration) => {
    try {
      const subscription = await reg.pushManager.getSubscription();
      
      if (subscription) {
        console.log('[Push] Existing subscription found');
        setState(prev => ({ ...prev, isSubscribed: true }));
        return subscription;
      }
      
      setState(prev => ({ ...prev, isSubscribed: false }));
      return null;
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
      return null;
    }
  }, []);

  // Request notification permission and subscribe
  const subscribe = useCallback(async () => {
    if (!registration || !vapidPublicKey || !user) {
      toast.error('Push notifications not ready');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== 'granted') {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Notification permission denied' 
        }));
        toast.error('Please enable notifications in your browser settings');
        return false;
      }

      // Convert VAPID key
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey.buffer as ArrayBuffer
      });

      console.log('[Push] Subscribed:', subscription);

      // Save subscription to database
      const subscriptionJson = subscription.toJSON();
      
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || ''
        }, {
          onConflict: 'endpoint'
        });

      if (dbError) {
        console.error('[Push] Error saving subscription:', dbError);
        throw dbError;
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        isLoading: false 
      }));
      
      toast.success('Push notifications enabled!');
      return true;
    } catch (error) {
      console.error('[Push] Subscribe error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe'
      }));
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, [registration, vapidPublicKey, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!registration || !user) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));
      
      toast.success('Push notifications disabled');
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unsubscribe'
      }));
      return false;
    }
  }, [registration, user]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          title: 'Test Notification',
          body: 'This is a test notification from eT chat!',
          icon: '/et-chat-logo.jpg',
          tag: 'test-notification'
        }
      });

      if (error) throw error;
      
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('[Push] Test notification error:', error);
      toast.error('Failed to send test notification');
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!checkSupport()) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const key = await loadVapidKey();
      if (!key) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const reg = await registerServiceWorker();
      if (!reg) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      await checkExistingSubscription(reg);
      setState(prev => ({ ...prev, isLoading: false }));
    };

    init();
  }, [checkSupport, loadVapidKey, registerServiceWorker, checkExistingSubscription]);

  // Listen for messages from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      console.log('[Push] Message from SW:', event.data);
      
      if (event.data?.type === 'SUBSCRIPTION_CHANGED' && registration) {
        checkExistingSubscription(registration);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [registration, checkExistingSubscription]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  initOfflineStorage,
  getUnsyncedMessages,
  markMessageSynced,
  getSyncQueue,
  clearSyncQueue,
  getStorageUsage,
  saveOfflineMessage,
  saveOfflineProfile,
  cacheConversation,
  getCachedConversations,
} from '@/lib/offlineStorage';
import { isOffline } from '@/lib/serverConfig';
import { toast } from 'sonner';

interface UseOfflineSyncReturn {
  isSyncing: boolean;
  pendingItems: number;
  storageUsed: number;
  storageQuota: number;
  syncNow: () => Promise<void>;
  cacheCurrentData: () => Promise<void>;
}

export const useOfflineSync = (userId?: string): UseOfflineSyncReturn => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingItems, setPendingItems] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);

  // Initialize offline storage
  useEffect(() => {
    initOfflineStorage().catch(console.error);
  }, []);

  // Update storage usage
  const updateStorageInfo = useCallback(async () => {
    try {
      const usage = await getStorageUsage();
      setStorageUsed(usage.used);
      setStorageQuota(usage.quota);
      
      const queue = await getSyncQueue();
      const unsyncedMessages = await getUnsyncedMessages();
      setPendingItems(queue.length + unsyncedMessages.length);
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }
  }, []);

  useEffect(() => {
    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 10000);
    return () => clearInterval(interval);
  }, [updateStorageInfo]);

  // Sync pending data to server
  const syncNow = useCallback(async () => {
    if (isOffline()) {
      toast.info('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      // Sync unsynced messages
      const unsyncedMessages = await getUnsyncedMessages();
      for (const message of unsyncedMessages) {
        try {
          const { error } = await supabase
            .from('messages')
            .upsert({
              id: message.id,
              conversation_id: message.conversationId,
              sender_id: message.senderId,
              content: message.content,
              created_at: message.timestamp,
            });
          
          if (!error) {
            await markMessageSynced(message.id);
          }
        } catch (e) {
          console.error('Failed to sync message:', e);
        }
      }

      // Clear sync queue
      await clearSyncQueue();
      await updateStorageInfo();
      
      if (unsyncedMessages.length > 0) {
        toast.success(`Synced ${unsyncedMessages.length} items`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [updateStorageInfo]);

  // Cache current data for offline use
  const cacheCurrentData = useCallback(async () => {
    if (!userId) return;

    try {
      // Cache conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .limit(50);
      
      if (conversations) {
        for (const conv of conversations) {
          await cacheConversation(conv);
        }
      }

      // Cache profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);
      
      if (profiles) {
        for (const profile of profiles) {
          await saveOfflineProfile({
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name || '',
            avatarUrl: profile.avatar_url || '',
            status: profile.status || 'offline',
            lastUpdated: new Date().toISOString(),
          });
        }
      }

      // Cache recent messages
      const cachedConvs = await getCachedConversations();
      for (const conv of cachedConvs.slice(0, 10)) {
        const convObj = conv as { id: string };
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convObj.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (messages) {
          for (const msg of messages) {
            await saveOfflineMessage({
              id: msg.id,
              conversationId: msg.conversation_id,
              senderId: msg.sender_id || '',
              content: msg.content || '',
              timestamp: msg.created_at,
              synced: true,
            });
          }
        }
      }

      await updateStorageInfo();
      toast.success('Data cached for offline use');
    } catch (error) {
      console.error('Failed to cache data:', error);
      toast.error('Failed to cache data');
    }
  }, [userId, updateStorageInfo]);

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingItems > 0) {
        syncNow();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingItems, syncNow]);

  return {
    isSyncing,
    pendingItems,
    storageUsed,
    storageQuota,
    syncNow,
    cacheCurrentData,
  };
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export const useReadReceipts = (conversationId: string) => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Map<string, ReadReceipt[]>>(new Map());
  const markedMessages = useRef<Set<string>>(new Set());

  // Fetch existing read receipts for the conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchReceipts = async () => {
      const { data, error } = await supabase
        .from('message_read_receipts')
        .select('*, messages!inner(conversation_id)')
        .eq('messages.conversation_id', conversationId);

      if (error) {
        console.error('Error fetching read receipts:', error);
        return;
      }

      const receiptMap = new Map<string, ReadReceipt[]>();
      (data || []).forEach((receipt: any) => {
        const messageId = receipt.message_id;
        if (!receiptMap.has(messageId)) {
          receiptMap.set(messageId, []);
        }
        receiptMap.get(messageId)!.push({
          id: receipt.id,
          message_id: receipt.message_id,
          user_id: receipt.user_id,
          read_at: receipt.read_at,
        });
      });
      setReceipts(receiptMap);
    };

    fetchReceipts();

    // Subscribe to new read receipts
    const channel = supabase
      .channel(`read-receipts:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts',
        },
        (payload) => {
          const newReceipt = payload.new as ReadReceipt;
          setReceipts(prev => {
            const updated = new Map(prev);
            const existing = updated.get(newReceipt.message_id) || [];
            if (!existing.some(r => r.user_id === newReceipt.user_id)) {
              updated.set(newReceipt.message_id, [...existing, newReceipt]);
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Mark a message as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!user || markedMessages.current.has(messageId)) return;
    
    markedMessages.current.add(messageId);

    const { error } = await supabase
      .from('message_read_receipts')
      .upsert({
        message_id: messageId,
        user_id: user.id,
      }, {
        onConflict: 'message_id,user_id',
      });

    if (error) {
      console.error('Error marking message as read:', error);
      markedMessages.current.delete(messageId);
    }
  }, [user]);

  // Mark multiple messages as read
  const markMultipleAsRead = useCallback(async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    const unread = messageIds.filter(id => !markedMessages.current.has(id));
    if (unread.length === 0) return;

    unread.forEach(id => markedMessages.current.add(id));

    const { error } = await supabase
      .from('message_read_receipts')
      .upsert(
        unread.map(id => ({
          message_id: id,
          user_id: user.id,
        })),
        { onConflict: 'message_id,user_id' }
      );

    if (error) {
      console.error('Error marking messages as read:', error);
      unread.forEach(id => markedMessages.current.delete(id));
    }
  }, [user]);

  // Get read status for a message
  const getReadStatus = useCallback((messageId: string, senderId: string): 'sent' | 'delivered' | 'read' => {
    if (senderId === user?.id) {
      const messageReceipts = receipts.get(messageId) || [];
      const othersRead = messageReceipts.filter(r => r.user_id !== user?.id);
      if (othersRead.length > 0) return 'read';
      return 'delivered';
    }
    return 'read';
  }, [receipts, user]);

  // Get who has read a message (for group chats)
  const getReadBy = useCallback((messageId: string): string[] => {
    return (receipts.get(messageId) || [])
      .filter(r => r.user_id !== user?.id)
      .map(r => r.user_id);
  }, [receipts, user]);

  return {
    receipts,
    markAsRead,
    markMultipleAsRead,
    getReadStatus,
    getReadBy,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageAttachment } from '@/components/messaging/MessageBubble';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribe: () => void;
}

export const useRealtimeMessages = (
  conversationId: string | null,
  currentUserId: string
): UseRealtimeMessagesReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          message_type,
          metadata,
          created_at,
          sender_id,
          reply_to_id
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        content: msg.content || '',
        senderId: msg.sender_id || '',
        senderName: msg.sender_id === currentUserId ? 'You' : 'User',
        timestamp: new Date(msg.created_at),
        status: 'read' as const,
        attachments: (msg.metadata as any)?.attachments || undefined,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentUserId]);

  const subscribeToMessages = useCallback((convId: string) => {
    if (channel) {
      supabase.removeChannel(channel);
    }

    const newChannel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          const formattedMessage: Message = {
            id: newMsg.id,
            content: newMsg.content || '',
            senderId: newMsg.sender_id || '',
            senderName: newMsg.sender_id === currentUserId ? 'You' : 'User',
            timestamp: new Date(newMsg.created_at),
            status: 'delivered' as const,
            attachments: newMsg.metadata?.attachments || undefined,
          };

          setMessages((prev) => [...prev, formattedMessage]);
        }
      )
      .subscribe();

    setChannel(newChannel);
  }, [channel, currentUserId]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
  }, [channel]);

  const sendMessage = useCallback(async (
    content: string,
    attachments?: MessageAttachment[]
  ) => {
    if (!conversationId || !currentUserId) return;

    try {
      const messageData = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
        message_type: attachments && attachments.length > 0 ? 'file' : 'text',
        metadata: attachments ? { attachments } : {},
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData as any);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      subscribeToMessages(conversationId);
    }

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  return {
    messages,
    isLoading,
    sendMessage,
    subscribeToMessages,
    unsubscribe,
  };
};

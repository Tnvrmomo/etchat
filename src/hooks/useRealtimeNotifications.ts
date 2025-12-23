import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { requestNotificationPermission } from '@/utils/notifications';

interface UseRealtimeNotificationsProps {
  userId?: string;
  onIncomingCall?: (callerId: string, callerName: string, callType: 'voice' | 'video') => void;
  onNewMessage?: (conversationId: string, senderName: string, content: string) => void;
}

export const useRealtimeNotifications = ({
  userId,
  onIncomingCall,
  onNewMessage,
}: UseRealtimeNotificationsProps) => {
  const { showCallNotification, showMessageNotification } = useNotifications();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`calls-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_participants',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('Incoming call participant:', payload);
          
          // Get call details
          const { data: call } = await supabase
            .from('calls')
            .select('*, caller:profiles!calls_caller_id_fkey(display_name, avatar_url)')
            .eq('id', payload.new.call_id)
            .single();

          if (call && call.status === 'ringing') {
            const callerName = (call.caller as any)?.display_name || 'Unknown';
            const avatar = (call.caller as any)?.avatar_url || '👤';
            
            showCallNotification(
              callerName,
              avatar,
              call.call_type as 'voice' | 'video',
              () => {
                if (onIncomingCall) {
                  onIncomingCall(call.caller_id, callerName, call.call_type as 'voice' | 'video');
                }
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showCallNotification, onIncomingCall]);

  // Subscribe to new messages
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Don't notify for own messages
          if (payload.new.sender_id === userId) return;

          console.log('New message:', payload);

          // Get sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', payload.new.sender_id)
            .single();

          const senderName = sender?.display_name || 'Someone';
          const avatar = sender?.avatar_url || '💬';
          const content = payload.new.content || 'Sent an attachment';

          showMessageNotification(
            senderName,
            content,
            avatar,
            () => {
              if (onNewMessage) {
                onNewMessage(payload.new.conversation_id, senderName, content);
              }
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showMessageNotification, onNewMessage]);

  return null;
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface IncomingCall {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  conversationId?: string;
}

interface UseRealtimeCallsReturn {
  incomingCall: IncomingCall | null;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  createCall: (targetUserId: string, callType: 'voice' | 'video', conversationId?: string) => Promise<string | null>;
  endCall: (callId: string) => Promise<void>;
}

export const useRealtimeCalls = (currentUserId: string | null): UseRealtimeCallsReturn => {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const subscribeToIncomingCalls = useCallback(() => {
    if (!currentUserId || channel) return;

    const newChannel = supabase
      .channel(`calls:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_participants',
          filter: `user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const participant = payload.new as any;
          if (participant.status !== 'ringing') return;

          // Fetch call details
          const { data: call } = await supabase
            .from('calls')
            .select('id, call_type, caller_id, conversation_id')
            .eq('id', participant.call_id)
            .single();

          if (call && call.caller_id !== currentUserId) {
            // Fetch caller profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', call.caller_id)
              .single();

            setIncomingCall({
              id: call.id,
              callerId: call.caller_id,
              callerName: profile?.display_name || 'Unknown',
              callerAvatar: profile?.avatar_url || undefined,
              callType: call.call_type as 'voice' | 'video',
              conversationId: call.conversation_id,
            });
          }
        }
      )
      .subscribe();

    setChannel(newChannel);
  }, [currentUserId, channel]);

  const createCall = useCallback(async (
    targetUserId: string,
    callType: 'voice' | 'video',
    conversationId?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'create-call',
          callType,
          targetUserId,
          conversationId,
        },
      });

      if (error) throw error;
      return data?.call?.id || null;
    } catch (error) {
      console.error('Failed to create call:', error);
      return null;
    }
  }, []);

  const acceptCall = useCallback(async (callId: string) => {
    try {
      const { error } = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'join-call',
          callId,
        },
      });

      if (error) throw error;
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  }, []);

  const rejectCall = useCallback(async (callId: string) => {
    try {
      const { error } = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'reject-call',
          callId,
        },
      });

      if (error) throw error;
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  }, []);

  const endCall = useCallback(async (callId: string) => {
    try {
      const { error } = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'end-call',
          callId,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      subscribeToIncomingCalls();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUserId]);

  return {
    incomingCall,
    acceptCall,
    rejectCall,
    createCall,
    endCall,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CallRecord {
  id: string;
  call_type: 'voice' | 'video';
  caller_id: string;
  other_user_id?: string;
  conversation_id: string | null;
  status: string;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  caller_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  direction: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
}

export const useCallHistory = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCallHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Get calls where user is caller
      const { data: callerCalls, error: callerError } = await supabase
        .from('calls')
        .select('*')
        .eq('caller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (callerError) {
        console.error('Error fetching caller calls:', callerError);
      }

      // Get calls where user is participant
      const { data: participantData, error: participantError } = await supabase
        .from('call_participants')
        .select('call_id, status')
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error fetching participant calls:', participantError);
      }

      const participantCallIds = (participantData || []).map(p => p.call_id);
      
      let participantCalls: any[] = [];
      if (participantCallIds.length > 0) {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .in('id', participantCallIds)
          .neq('caller_id', user.id)
          .order('created_at', { ascending: false });

        if (!error) {
          participantCalls = data || [];
        }
      }

      // Combine and sort all calls
      const allCalls = [...(callerCalls || []), ...participantCalls].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Fetch participant profiles and determine direction
      const callsWithDetails = await Promise.all(
        allCalls.map(async (call) => {
          const isOutgoing = call.caller_id === user.id;
          const participantRecord = participantData?.find(p => p.call_id === call.id);
          
          // For outgoing calls, get the other participant's profile
          // For incoming calls, get the caller's profile
          let otherUserId: string;
          
          if (isOutgoing) {
            // Get the other participant (not the caller)
            const { data: participants } = await supabase
              .from('call_participants')
              .select('user_id')
              .eq('call_id', call.id)
              .neq('user_id', user.id)
              .limit(1);
            
            otherUserId = participants?.[0]?.user_id || call.caller_id;
          } else {
            otherUserId = call.caller_id;
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();
          
          let direction: 'incoming' | 'outgoing' | 'missed';
          if (isOutgoing) {
            direction = 'outgoing';
          } else if (call.status === 'missed' || participantRecord?.status === 'missed') {
            direction = 'missed';
          } else {
            direction = 'incoming';
          }

          // Calculate duration
          let duration: number | undefined;
          if (call.started_at && call.ended_at) {
            duration = Math.floor(
              (new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000
            );
          }

          return {
            ...call,
            call_type: call.call_type as 'voice' | 'video',
            other_user_id: otherUserId,
            caller_profile: profile,
            direction,
            duration,
          };
        })
      );

      setCalls(callsWithDetails);
    } catch (err) {
      console.error('Error in fetchCallHistory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls',
        },
        () => {
          fetchCallHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCallHistory]);

  const createCall = async (
    participantIds: string[],
    callType: 'voice' | 'video',
    conversationId?: string
  ) => {
    if (!user) return null;

    try {
      // Create call record
      const { data: call, error: callError } = await supabase
        .from('calls')
        .insert({
          caller_id: user.id,
          call_type: callType,
          conversation_id: conversationId,
          status: 'ringing',
        })
        .select()
        .single();

      if (callError) {
        console.error('Error creating call:', callError);
        return null;
      }

      // Add participants
      const participants = participantIds.map(userId => ({
        call_id: call.id,
        user_id: userId,
        status: 'invited',
      }));

      const { error: partError } = await supabase
        .from('call_participants')
        .insert(participants);

      if (partError) {
        console.error('Error adding call participants:', partError);
      }

      return call;
    } catch (err) {
      console.error('Error in createCall:', err);
      return null;
    }
  };

  const updateCallStatus = async (callId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'connected') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }

      await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId);

      await fetchCallHistory();
    } catch (err) {
      console.error('Error updating call status:', err);
    }
  };

  return {
    calls,
    isLoading,
    refresh: fetchCallHistory,
    createCall,
    updateCallStatus,
  };
};

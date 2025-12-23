import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebRTC } from './useWebRTC';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ActiveCall {
  id: string;
  callType: 'voice' | 'video';
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  isOutgoing: boolean;
  targetUserId?: string;
}

interface UseCallManagerReturn {
  // Call state
  activeCall: ActiveCall | null;
  incomingCall: ActiveCall | null;
  isInCall: boolean;
  
  // WebRTC state
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  
  // Actions
  startCall: (targetUserId: string, targetName: string, targetAvatar: string | undefined, callType: 'voice' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
}

export const useCallManager = (currentUserId: string | null): UseCallManagerReturn => {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<ActiveCall | null>(null);
  const [signalChannel, setSignalChannel] = useState<RealtimeChannel | null>(null);
  const [callChannel, setCallChannel] = useState<RealtimeChannel | null>(null);
  
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!activeCall || !currentUserId) return;

    const targetUserId = activeCall.isOutgoing 
      ? activeCall.targetUserId 
      : activeCall.callerId;

    if (!targetUserId) return;

    try {
      await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'send-signal',
          callId: activeCall.id,
          targetUserId,
          signalType: 'ice-candidate',
          signalData: candidate.toJSON(),
        },
      });
    } catch (error) {
      console.error('Failed to send ICE candidate:', error);
    }
  }, [activeCall, currentUserId]);

  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    startCall: initializeWebRTC,
    endCall: cleanupWebRTC,
    toggleMute,
    toggleVideo,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    createOffer,
    createAnswer,
    handleRemoteOffer,
    handleRemoteAnswer,
    addIceCandidate,
  } = useWebRTC(handleIceCandidate);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!currentUserId || callChannel) return;

    const newChannel = supabase
      .channel(`incoming-calls:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_participants',
          filter: `user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const participant = payload.new as { call_id: string; status: string };
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
              callType: call.call_type as 'voice' | 'video',
              callerId: call.caller_id,
              callerName: profile?.display_name || 'Unknown',
              callerAvatar: profile?.avatar_url || undefined,
              isOutgoing: false,
            });

            toast.info(`Incoming ${call.call_type} call from ${profile?.display_name || 'Unknown'}`);
          }
        }
      )
      .subscribe();

    setCallChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [currentUserId]);

  // Subscribe to signaling messages
  useEffect(() => {
    if (!currentUserId || !activeCall || signalChannel) return;

    const newChannel = supabase
      .channel(`signals:${activeCall.id}:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `to_user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const signal = payload.new as {
            signal_type: string;
            signal_data: any;
            from_user_id: string;
            call_id: string;
          };

          if (signal.call_id !== activeCall.id) return;

          console.log('Received signal:', signal.signal_type);

          try {
            switch (signal.signal_type) {
              case 'offer':
                await handleRemoteOffer(signal.signal_data);
                const answer = await createAnswer();
                await supabase.functions.invoke('webrtc-signaling', {
                  body: {
                    action: 'send-signal',
                    callId: activeCall.id,
                    targetUserId: signal.from_user_id,
                    signalType: 'answer',
                    signalData: answer,
                  },
                });
                // Process pending ICE candidates
                for (const candidate of pendingCandidatesRef.current) {
                  await addIceCandidate(candidate);
                }
                pendingCandidatesRef.current = [];
                break;

              case 'answer':
                await handleRemoteAnswer(signal.signal_data);
                // Process pending ICE candidates
                for (const candidate of pendingCandidatesRef.current) {
                  await addIceCandidate(candidate);
                }
                pendingCandidatesRef.current = [];
                break;

              case 'ice-candidate':
                try {
                  await addIceCandidate(signal.signal_data);
                } catch {
                  // Queue if remote description not set yet
                  pendingCandidatesRef.current.push(signal.signal_data);
                }
                break;
            }
          } catch (error) {
            console.error('Error handling signal:', error);
          }
        }
      )
      .subscribe();

    setSignalChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [currentUserId, activeCall, handleRemoteOffer, handleRemoteAnswer, createAnswer, addIceCandidate]);

  // Start outgoing call
  const startCall = useCallback(async (
    targetUserId: string,
    targetName: string,
    targetAvatar: string | undefined,
    callType: 'voice' | 'video'
  ) => {
    if (!currentUserId) return;

    try {
      // Initialize WebRTC
      await initializeWebRTC(callType);

      // Create call in database
      const { data, error } = await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'create-call',
          callType,
          targetUserId,
        },
      });

      if (error) throw error;

      const callId = data?.call?.id;
      if (!callId) throw new Error('Failed to create call');

      setActiveCall({
        id: callId,
        callType,
        callerId: currentUserId,
        callerName: targetName,
        callerAvatar: targetAvatar,
        isOutgoing: true,
        targetUserId,
      });

      // Create and send offer
      const offer = await createOffer();
      await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'send-signal',
          callId,
          targetUserId,
          signalType: 'offer',
          signalData: offer,
        },
      });

      toast.success(`Calling ${targetName}...`);
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call');
      cleanupWebRTC();
    }
  }, [currentUserId, initializeWebRTC, createOffer, cleanupWebRTC]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !currentUserId) return;

    try {
      // Initialize WebRTC
      await initializeWebRTC(incomingCall.callType);

      // Accept call in database
      await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'join-call',
          callId: incomingCall.id,
        },
      });

      setActiveCall(incomingCall);
      setIncomingCall(null);
      
      toast.success('Call connected');
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast.error('Failed to accept call');
      cleanupWebRTC();
    }
  }, [incomingCall, currentUserId, initializeWebRTC, cleanupWebRTC]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'reject-call',
          callId: incomingCall.id,
        },
      });

      setIncomingCall(null);
      toast.info('Call rejected');
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  }, [incomingCall]);

  // End active call
  const endCall = useCallback(async () => {
    if (!activeCall) return;

    try {
      await supabase.functions.invoke('webrtc-signaling', {
        body: {
          action: 'end-call',
          callId: activeCall.id,
        },
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }

    cleanupWebRTC();
    setActiveCall(null);
    
    if (signalChannel) {
      supabase.removeChannel(signalChannel);
      setSignalChannel(null);
    }

    toast.info('Call ended');
  }, [activeCall, cleanupWebRTC, signalChannel]);

  return {
    activeCall,
    incomingCall,
    isInCall: !!activeCall,
    localStream,
    remoteStream,
    callState,
    isMuted,
    isVideoOff,
    isScreenSharing,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  };
};

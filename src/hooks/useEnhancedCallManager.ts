import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateCallCode,
  normalizeCallCode,
  globalCallManager,
  type CallSession,
} from '@/utils/callCodeGenerator';
import { CallMessage } from '@/components/calling/InCallChat';

export interface CallState {
  callId: string | null;
  callCode: string | null;
  callSession: CallSession | null;
  isActive: boolean;
  isHost: boolean;
  messages: CallMessage[];
  handsRaised: Array<{ userId: string; userName: string; timestamp: Date }>;
  isScreenSharing: boolean;
  isRecording: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  participantCount: number;
}

const initialState: CallState = {
  callId: null,
  callCode: null,
  callSession: null,
  isActive: false,
  isHost: false,
  messages: [],
  handsRaised: [],
  isScreenSharing: false,
  isRecording: false,
  isMuted: false,
  isVideoOff: false,
  participantCount: 0,
};

export const useEnhancedCallManager = (userId: string, userName: string) => {
  const [state, setState] = useState<CallState>(initialState);
  const [localHandRaised, setLocalHandRaised] = useState(false);
  const messageQueueRef = useRef<string[]>([]);

  /**
   * Start a new call
   */
  const startCall = useCallback(
    (title?: string) => {
      const session = globalCallManager.createCall(userId, userName, title);
      globalCallManager.addParticipant(session.id, userId);

      setState((prev) => ({
        ...prev,
        callId: session.id,
        callCode: session.code,
        callSession: session,
        isActive: true,
        isHost: true,
        participantCount: 1,
      }));

      return session;
    },
    [userId, userName],
  );

  /**
   * Join an existing call
   */
  const joinCall = useCallback((code: string) => {
    const normalized = normalizeCallCode(code);
    const session = globalCallManager.getCallByCode(normalized);

    if (!session) {
      console.error('Call not found');
      return null;
    }

    globalCallManager.addParticipant(session.id, userId);

    setState((prev) => ({
      ...prev,
      callId: session.id,
      callCode: session.code,
      callSession: session,
      isActive: true,
      isHost: false,
      participantCount: session.participants.length,
    }));

    return session;
  }, [userId]);

  /**
   * End current call
   */
  const endCall = useCallback(() => {
    if (state.callId) {
      globalCallManager.removeParticipant(state.callId, userId);
      globalCallManager.endCall(state.callId);
    }

    setState(initialState);
    setLocalHandRaised(false);
  }, [state.callId, userId]);

  /**
   * Send a message during the call
   */
  const sendMessage = useCallback((message: string) => {
    const newMessage: CallMessage = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      senderName: userName,
      message,
      timestamp: new Date(),
      type: 'message',
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));

    messageQueueRef.current.push(message);
  }, [userId, userName]);

  /**
   * Raise hand
   */
  const raiseHand = useCallback(() => {
    setLocalHandRaised(true);

    setState((prev) => ({
      ...prev,
      handsRaised: [
        ...prev.handsRaised,
        {
          userId,
          userName,
          timestamp: new Date(),
        },
      ],
    }));
  }, [userId, userName]);

  /**
   * Lower hand
   */
  const lowerHand = useCallback((targetUserId?: string) => {
    const userIdToLower = targetUserId || userId;

    if (userIdToLower === userId) {
      setLocalHandRaised(false);
    }

    setState((prev) => ({
      ...prev,
      handsRaised: prev.handsRaised.filter((hand) => hand.userId !== userIdToLower),
    }));
  }, [userId]);

  /**
   * Toggle screen sharing
   */
  const toggleScreenShare = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isScreenSharing: !prev.isScreenSharing,
    }));
  }, []);

  /**
   * Toggle recording
   */
  const toggleRecording = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRecording: !prev.isRecording,
    }));
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVideoOff: !prev.isVideoOff,
    }));
  }, []);

  /**
   * Update participant count
   */
  const updateParticipantCount = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      participantCount: count,
    }));
  }, []);

  /**
   * Get remaining message queue
   */
  const getMessageQueue = useCallback(() => {
    const queue = [...messageQueueRef.current];
    messageQueueRef.current = [];
    return queue;
  }, []);

  /**
   * Clear messages (for testing)
   */
  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
    }));
  }, []);

  return {
    // State
    callId: state.callId,
    callCode: state.callCode,
    callSession: state.callSession,
    isActive: state.isActive,
    isHost: state.isHost,
    messages: state.messages,
    handsRaised: state.handsRaised,
    isScreenSharing: state.isScreenSharing,
    isRecording: state.isRecording,
    isMuted: state.isMuted,
    isVideoOff: state.isVideoOff,
    participantCount: state.participantCount,
    localHandRaised,

    // Actions
    startCall,
    joinCall,
    endCall,
    sendMessage,
    raiseHand,
    lowerHand,
    toggleScreenShare,
    toggleRecording,
    toggleMute,
    toggleVideo,
    updateParticipantCount,
    getMessageQueue,
    clearMessages,
  };
};

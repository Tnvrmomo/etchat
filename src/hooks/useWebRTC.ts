import { useState, useCallback, useRef, useEffect } from 'react';
import { RTCManager, CallType, CallState } from '@/utils/webrtc/RTCManager';

interface UseWebRTCReturn {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  startCall: (type: CallType) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleCamera: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: () => Promise<RTCSessionDescriptionInit>;
  handleRemoteOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  handleRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
}

export const useWebRTC = (
  onIceCandidate?: (candidate: RTCIceCandidate) => void
): UseWebRTCReturn => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const rtcManagerRef = useRef<RTCManager | null>(null);

  useEffect(() => {
    rtcManagerRef.current = new RTCManager({
      onRemoteStream: (stream) => {
        console.log('Setting remote stream');
        setRemoteStream(stream);
      },
      onCallStateChange: (state) => {
        console.log('Call state changed:', state);
        setCallState(state);
      },
      onError: (error) => {
        console.error('WebRTC error:', error);
      },
      onIceCandidate: onIceCandidate,
    });

    return () => {
      rtcManagerRef.current?.endCall();
    };
  }, [onIceCandidate]);

  const startCall = useCallback(async (type: CallType) => {
    if (!rtcManagerRef.current) return;
    
    try {
      const stream = await rtcManagerRef.current.initializeCall(type);
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(false);
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }, []);

  const endCall = useCallback(() => {
    rtcManagerRef.current?.endCall();
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  }, []);

  const toggleMute = useCallback(() => {
    const muted = rtcManagerRef.current?.toggleMute() ?? false;
    setIsMuted(muted);
  }, []);

  const toggleVideo = useCallback(() => {
    const videoOff = rtcManagerRef.current?.toggleVideo() ?? false;
    setIsVideoOff(videoOff);
  }, []);

  const toggleCamera = useCallback(async () => {
    await rtcManagerRef.current?.toggleCamera();
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      await rtcManagerRef.current?.startScreenShare();
      setIsScreenSharing(true);
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    await rtcManagerRef.current?.stopScreenShare();
    setIsScreenSharing(false);
  }, []);

  const createOffer = useCallback(async () => {
    if (!rtcManagerRef.current) throw new Error('RTCManager not initialized');
    return rtcManagerRef.current.createOffer();
  }, []);

  const createAnswer = useCallback(async () => {
    if (!rtcManagerRef.current) throw new Error('RTCManager not initialized');
    return rtcManagerRef.current.createAnswer();
  }, []);

  const handleRemoteOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!rtcManagerRef.current) throw new Error('RTCManager not initialized');
    await rtcManagerRef.current.handleRemoteOffer(offer);
  }, []);

  const handleRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!rtcManagerRef.current) throw new Error('RTCManager not initialized');
    await rtcManagerRef.current.handleRemoteAnswer(answer);
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!rtcManagerRef.current) throw new Error('RTCManager not initialized');
    await rtcManagerRef.current.addIceCandidate(candidate);
  }, []);

  return {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    startCall,
    endCall,
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
  };
};

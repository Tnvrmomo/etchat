import { useEffect, useRef, useState } from 'react';
import { CallControls } from './CallControls';
import { CallState } from '@/utils/webrtc/RTCManager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoCallScreenProps {
  callerName: string;
  callerAvatar?: string;
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export const VideoCallScreen = ({
  callerName,
  callerAvatar,
  callState,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}: VideoCallScreenProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Remote Video (Full Screen) */}
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-card to-background">
          <div className="text-center animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <Avatar className="w-32 h-32 ring-4 ring-primary/30">
                <AvatarImage src={callerAvatar} alt={callerName} />
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  {callerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(callState === 'calling' || callState === 'ringing') && (
                <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-ping" />
              )}
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              {callerName}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              {callState === 'calling' ? 'Calling...' : callState === 'ringing' ? 'Ringing...' : 'Connecting...'}
            </p>
          </div>
        </div>
      )}

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden shadow-lg border-2 border-card">
        {!isVideoOff && localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/20 text-foreground">
                You
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      {/* Call Info Overlay */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-sm font-medium text-foreground">
          {callState === 'connected' ? formatDuration(callDuration) : callerName}
        </span>
      </div>

      {/* Screen Share Indicator */}
      {isScreenSharing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground rounded-full px-4 py-2">
          <span className="text-sm font-medium">Sharing your screen</span>
        </div>
      )}

      {/* Call Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-full p-4">
          <CallControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            showVideoControls
            onToggleMute={onToggleMute}
            onToggleVideo={onToggleVideo}
            onToggleCamera={onToggleCamera}
            onToggleScreenShare={isScreenSharing ? () => {} : onToggleScreenShare}
            onEndCall={onEndCall}
          />
        </div>
      </div>
    </div>
  );
};

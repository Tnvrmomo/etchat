import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallControls } from './CallControls';
import { CallState } from '@/utils/webrtc/RTCManager';

interface VoiceCallScreenProps {
  callerName: string;
  callerAvatar?: string;
  callState: CallState;
  isMuted: boolean;
  remoteStream: MediaStream | null;
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const VoiceCallScreen = ({
  callerName,
  callerAvatar,
  callState,
  isMuted,
  remoteStream,
  onToggleMute,
  onEndCall,
}: VoiceCallScreenProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play remote audio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
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

  const getStatusText = (): string => {
    switch (callState) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-card to-background flex flex-col items-center justify-between py-16 px-4">
      {/* Hidden audio element for remote audio */}
      <audio ref={audioRef} autoPlay playsInline />

      {/* Caller Info */}
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="relative">
          <Avatar className="w-32 h-32 ring-4 ring-primary/30">
            <AvatarImage src={callerAvatar} alt={callerName} />
            <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
              {callerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Animated rings for calling/ringing state */}
          {(callState === 'calling' || callState === 'ringing') && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            {callerName}
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Visual Audio Indicator */}
      {callState === 'connected' && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-secondary rounded-full animate-pulse"
              style={{
                height: `${20 + Math.random() * 30}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.5s',
              }}
            />
          ))}
        </div>
      )}

      {/* Call Controls */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CallControls
          isMuted={isMuted}
          isVideoOff={false}
          isScreenSharing={false}
          onToggleMute={onToggleMute}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
};

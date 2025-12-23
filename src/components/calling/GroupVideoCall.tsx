import { useEffect, useRef, useState } from 'react';
import { CallControls } from './CallControls';
import { CallState } from '@/utils/webrtc/RTCManager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSpeaking?: boolean;
}

interface GroupVideoCallProps {
  callState: CallState;
  localStream: MediaStream | null;
  participants: Participant[];
  currentUserId: string;
  currentUserName: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

const VideoTile = ({ 
  participant, 
  isLocal = false,
  size = 'normal',
}: { 
  participant: Participant; 
  isLocal?: boolean;
  size?: 'small' | 'normal' | 'large';
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const sizeClasses = {
    small: 'w-24 h-32',
    normal: 'w-full h-full',
    large: 'w-full h-full',
  };

  return (
    <div className={cn(
      'relative rounded-organic-lg overflow-hidden bg-muted',
      sizeClasses[size],
      participant.isSpeaking && 'ring-2 ring-primary'
    )}>
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            'w-full h-full object-cover',
            isLocal && 'transform scale-x-[-1]'
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-muted to-muted/80">
          <Avatar className="w-16 h-16">
            <AvatarImage src={participant.avatar} alt={participant.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {participant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-background/70 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-full truncate">
          {isLocal ? 'You' : participant.name}
        </span>
        {participant.isMuted && (
          <span className="bg-destructive/80 text-destructive-foreground text-xs px-2 py-1 rounded-full">
            🔇
          </span>
        )}
      </div>
    </div>
  );
};

export const GroupVideoCall = ({
  callState,
  localStream,
  participants,
  currentUserId,
  currentUserName,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}: GroupVideoCallProps) => {
  const [callDuration, setCallDuration] = useState(0);

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

  // Add local user to participants
  const allParticipants: Participant[] = [
    {
      id: currentUserId,
      name: currentUserName,
      stream: localStream || undefined,
      isMuted,
      isVideoOff,
    },
    ...participants,
  ];

  // Calculate grid layout based on participant count
  const getGridClasses = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-3';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="font-display font-semibold text-foreground">Group Call</h2>
          <p className="text-xs text-muted-foreground">
            {allParticipants.length} participants • {callState === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
          </p>
        </div>
        {isScreenSharing && (
          <span className="bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full">
            Sharing Screen
          </span>
        )}
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-2 overflow-auto">
        <div className={cn(
          'grid gap-2 h-full',
          getGridClasses(allParticipants.length)
        )}>
          {allParticipants.map((participant, index) => (
            <VideoTile
              key={participant.id}
              participant={participant}
              isLocal={index === 0}
              size={allParticipants.length <= 2 ? 'large' : 'normal'}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card/80 backdrop-blur-sm p-4 border-t border-border">
        <div className="flex justify-center">
          <CallControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            showVideoControls
            onToggleMute={onToggleMute}
            onToggleVideo={onToggleVideo}
            onToggleCamera={onToggleCamera}
            onToggleScreenShare={onToggleScreenShare}
            onEndCall={onEndCall}
          />
        </div>
      </div>
    </div>
  );
};

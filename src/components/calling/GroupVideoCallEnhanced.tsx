import { useEffect, useRef, useState, ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  MoreVertical
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GroupCallParticipant {
  id: string;
  name: string;
  avatar?: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  joinedAt: Date;
}

interface GroupVideoCallProps {
  groupName: string;
  participants: GroupCallParticipant[];
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
  onRemoveParticipant?: (participantId: string) => void;
  callDuration: number;
}

export const GroupVideoCall = ({
  groupName,
  participants,
  localStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  onRemoveParticipant,
  callDuration,
}: GroupVideoCallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridLayout, setGridLayout] = useState<'2x2' | '3x3' | 'focus'>('2x2');
  type GridLayout = '2x2' | '3x3' | 'focus';

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGridClass = (): string => {
    const count = participants.length;
    
    if (gridLayout === '3x3') {
      return 'grid grid-cols-3 gap-2 p-2 auto-rows-fr';
    } else if (gridLayout === 'focus') {
      return 'grid grid-cols-1 gap-2 p-2';
    } else {
      // 2x2 layout
      if (count === 1) return 'grid grid-cols-1 gap-2 p-2';
      if (count === 2) return 'grid grid-cols-2 gap-2 p-2';
      if (count <= 4) return 'grid grid-cols-2 gap-2 p-2';
      return 'grid grid-cols-2 gap-2 p-2 auto-rows-fr overflow-y-auto';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" role="complementary" aria-label="Group video call">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            {groupName}
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'} • {formatDuration(callDuration)}
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => {
                const layouts: GridLayout[] = ['2x2', '3x3', 'focus'];
                const currentIndex = layouts.indexOf(gridLayout);
                setGridLayout(layouts[(currentIndex + 1) % layouts.length]);
              }}>
                <Users className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Toggle Layout ({gridLayout})
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Video Grid */}
      <div 
        ref={containerRef}
        className={`flex-1 bg-black overflow-hidden ${getGridClass()}`}
      >
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="relative bg-slate-900 rounded-lg overflow-hidden group min-h-[150px]"
          >
            {/* Video Stream or Placeholder */}
            {participant.stream && !participant.isVideoOff ? (
              <VideoTile stream={participant.stream} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <Avatar className="w-20 h-20 ring-2 ring-primary/30">
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {participant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Participant Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-end justify-between">
              <div className="flex items-center gap-2 flex-1">
                <p className="text-white font-semibold text-sm truncate">
                  {participant.name}
                </p>
                {participant.isMuted && (
                  <MicOff className="w-4 h-4 text-red-500" />
                )}
                {participant.isVideoOff && (
                  <VideoOff className="w-4 h-4 text-orange-500" />
                )}
              </div>

              {onRemoveParticipant && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onRemoveParticipant(participant.id)}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}

        {/* Local Video Placeholder */}
        {participants.length < 4 && (
          <div className="relative bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-primary/50 min-h-[150px]">
            {localStream && !isVideoOff ? (
              <VideoTile stream={localStream} isMuted />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="text-center">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/50 mx-auto mb-2">
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-slate-300 text-xs">Your Video</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex justify-center items-center gap-4 max-w-md mx-auto">
          {/* Mute Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? 'destructive' : 'outline'}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={onToggleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? 'Unmute' : 'Mute'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Video Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVideoOff ? 'destructive' : 'outline'}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={onToggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVideoOff ? 'Enable Camera' : 'Turn Off Camera'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Screen Share */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isScreenSharing ? 'secondary' : 'outline'}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={onToggleScreenShare}
                >
                  <Monitor className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* End Call */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={onEndCall}
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                End Call
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

// Helper component to display video streams
interface VideoTileProps {
  stream: MediaStream;
  isMuted?: boolean;
}

const VideoTile = ({ stream, isMuted = false }: VideoTileProps): ReactNode => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isMuted}
      className="w-full h-full object-cover"
    />
  );
};

import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  RotateCcw, 
  Monitor,
  MonitorOff 
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  showVideoControls?: boolean;
  onToggleMute: () => void;
  onToggleVideo?: () => void;
  onToggleCamera?: () => void;
  onToggleScreenShare?: () => void;
  onEndCall: () => void;
}

export const CallControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  showVideoControls = false,
  onToggleMute,
  onToggleVideo,
  onToggleCamera,
  onToggleScreenShare,
  onEndCall,
}: CallControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Mute Button */}
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="lg"
        className="rounded-full w-14 h-14"
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </Button>

      {/* Video Toggle */}
      {showVideoControls && onToggleVideo && (
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={onToggleVideo}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>
      )}

      {/* End Call Button */}
      <Button
        variant="destructive"
        size="lg"
        className="rounded-full w-16 h-16"
        onClick={onEndCall}
      >
        <PhoneOff className="w-7 h-7" />
      </Button>

      {/* Camera Flip */}
      {showVideoControls && onToggleCamera && (
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={onToggleCamera}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      )}

      {/* Screen Share */}
      {showVideoControls && onToggleScreenShare && (
        <Button
          variant={isScreenSharing ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
          onClick={onToggleScreenShare}
        >
          {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </Button>
      )}
    </div>
  );
};

import { useEffect, useRef, useState, ReactNode } from 'react';
import { CallState } from '@/utils/webrtc/RTCManager';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedVideoCallScreenProps {
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
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  callType: 'audio' | 'video';
}

export const EnhancedVideoCallScreen = ({
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
  networkQuality = 'excellent',
  callType,
}: EnhancedVideoCallScreenProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | undefined>();

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
    let interval: ReturnType<typeof setInterval>;
    
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Auto-hide controls on video calls
  useEffect(() => {
    if (callType === 'video' && callState === 'connected') {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (hideControlsTimeout.current !== undefined) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [callState, callType]);

  const handleScreenTap = () => {
    if (callType === 'video') {
      setShowControls(!showControls);
      if (hideControlsTimeout.current !== undefined) {
        clearTimeout(hideControlsTimeout.current);
      }
      if (!showControls) {
        hideControlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 5000);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNetworkIndicator = () => {
    const colors = {
      excellent: 'text-green-500',
      good: 'text-blue-500',
      fair: 'text-yellow-500',
      poor: 'text-red-500'
    };

    return (
      <div className={`flex items-center gap-1 ${colors[networkQuality]}`}>
        {networkQuality === 'poor' ? (
          <WifiOff className="w-4 h-4" />
        ) : (
          <Wifi className="w-4 h-4" />
        )}
        <span className="text-xs font-medium capitalize">{networkQuality}</span>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      onClick={handleScreenTap}
      role="button"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleScreenTap();
        }
      }}
    >
      {/* Remote Video Background */}
      {remoteStream && callType === 'video' ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-black">
          <div className="text-center animate-fade-in">
            <div className="relative inline-block mb-8">
              <Avatar className="w-40 h-40 ring-4 ring-primary/50 border-4 border-slate-700">
                <AvatarImage src={callerAvatar} alt={callerName} />
                <AvatarFallback className="text-6xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-display">
                  {callerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(callState === 'calling' || callState === 'ringing') && (
                <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-pulse" />
              )}
            </div>
            
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {callerName}
            </h2>
            
            <p className="text-slate-300 text-lg mb-6 font-medium">
              {callState === 'calling' && 'Calling...'}
              {callState === 'ringing' && 'Incoming call...'}
              {callState === 'connected' && (
                <span className="text-primary">{formatDuration(callDuration)}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Local Video PIP (Picture in Picture) */}
      {localStream && callType === 'video' && !isVideoOff && (
        <div className="absolute bottom-24 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-primary/50 shadow-xl bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-display font-semibold text-lg">
            {callType === 'audio' ? 'Voice Call' : 'Video Call'}
          </h3>
          <p className="text-slate-300 text-sm">
            {callState === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getNetworkIndicator()}
          {isRemoteMuted && (
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded text-red-400 text-xs">
              <MicOff className="w-3 h-3" />
              <span>Muted</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls - Bottom Bar */}
      {(showControls || callState !== 'connected') && callType === 'video' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-6 pt-12">
          <div className="flex justify-center items-center gap-4 max-w-2xl mx-auto">
            {/* Mute Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isMuted ? 'destructive' : 'outline'}
                    size="lg"
                    className={`rounded-full w-14 h-14 ${
                      isMuted
                        ? 'bg-red-500/90 hover:bg-red-600 border-0'
                        : 'bg-slate-700/60 hover:bg-slate-600 border-slate-600'
                    }`}
                    onClick={onToggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMuted ? 'Unmute' : 'Mute'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Video Toggle */}
            {callType === 'video' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isVideoOff ? 'destructive' : 'outline'}
                      size="lg"
                      className={`rounded-full w-14 h-14 ${
                        isVideoOff
                          ? 'bg-red-500/90 hover:bg-red-600 border-0'
                          : 'bg-slate-700/60 hover:bg-slate-600 border-slate-600'
                      }`}
                      onClick={onToggleVideo}
                    >
                      {isVideoOff ? (
                        <VideoOff className="w-6 h-6" />
                      ) : (
                        <Video className="w-6 h-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isVideoOff ? 'Enable Camera' : 'Turn Off Camera'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Screen Share Toggle */}
            {callType === 'video' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isScreenSharing ? 'secondary' : 'outline'}
                      size="lg"
                      className={`rounded-full w-14 h-14 ${
                        isScreenSharing
                          ? 'bg-blue-500/90 hover:bg-blue-600 border-0'
                          : 'bg-slate-700/60 hover:bg-slate-600 border-slate-600'
                      }`}
                      onClick={onToggleScreenShare}
                    >
                      {isScreenSharing ? (
                        <MonitorOff className="w-6 h-6" />
                      ) : (
                        <Monitor className="w-6 h-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* End Call */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 border-0"
                    onClick={onEndCall}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  End Call
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Bottom Info */}
          {callState !== 'connected' && (
            <div className="text-center mt-4 text-slate-400 text-sm">
              <p>Tap to show/hide controls</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

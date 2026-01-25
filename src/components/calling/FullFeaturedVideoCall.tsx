import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  MoreVertical,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { InCallChat, RaiseHandButton, CallMessage } from '@/components/calling/InCallChat';
import { CallCodeDisplay } from '@/components/calling/CallCodeDisplay';

interface FullFeaturedVideoCallProps {
  callerName: string;
  callerAvatar?: string;
  callCode: string;
  isHost: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  participantCount: number;
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  messages: CallMessage[];
  handsRaised: Array<{ userId: string; userName: string; timestamp: Date }>;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onRaiseHand: () => void;
  onLowerHand: (userId: string) => void;
  onSendMessage: (message: string) => void;
  onEndCall: () => void;
  onCopyCode: () => void;
}

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getQualityColor = (quality?: string): string => {
  switch (quality) {
    case 'excellent':
      return 'text-green-500';
    case 'good':
      return 'text-blue-500';
    case 'fair':
      return 'text-yellow-500';
    case 'poor':
      return 'text-orange-500';
    default:
      return 'text-red-500';
  }
};

export const FullFeaturedVideoCall: React.FC<FullFeaturedVideoCallProps> = ({
  callerName,
  callerAvatar,
  callCode,
  isHost,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  participantCount,
  networkQuality = 'excellent',
  messages,
  handsRaised,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onRaiseHand,
  onLowerHand,
  onSendMessage,
  onEndCall,
  onCopyCode,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showCodeShare, setShowCodeShare] = useState(false);
  const [isRaiseHandActive, setIsRaiseHandActive] = useState(false);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-hide controls
  const handleScreenTap = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  const handleRaiseHand = () => {
    setIsRaiseHandActive(!isRaiseHandActive);
    if (!isRaiseHandActive) {
      onRaiseHand();
    } else {
      onLowerHand('');
    }
  };

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden bg-black"
      onClick={handleScreenTap}
    >
      {/* Remote Video (Main) */}
      <div className="relative flex-1">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#E2725B] to-[#D1654A]">
            <div className="text-center">
              <Avatar className="mx-auto mb-4 h-24 w-24 border-4 border-white">
                <AvatarImage src={callerAvatar} alt={callerName} />
                <AvatarFallback className="bg-[#F5F1E6] text-[#E2725B]">
                  {callerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold text-white">{callerName}</p>
              <p className="mt-2 text-sm text-white/80">Waiting to connect...</p>
            </div>
          </div>
        )}

        {/* Local Video PIP */}
        {!isVideoOff && localStream && (
          <div className="absolute bottom-24 right-4 h-32 w-24 overflow-hidden rounded-lg border-2 border-white bg-black shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Status Bar */}
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black to-transparent p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1">
              <div className={`h-2 w-2 rounded-full ${getQualityColor(networkQuality)}`} />
              <span className="text-xs text-white">{networkQuality}</span>
            </div>

            <div className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {formatDuration(callDuration)}
            </div>

            {isRecording && (
              <div className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1 text-xs text-white">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                Recording
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            <span>{participantCount} participant</span>
            {participantCount > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className={`bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-6">
          {/* Mute */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className={`rounded-full ${
              isMuted
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            size="lg"
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {/* Video */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVideo();
            }}
            className={`rounded-full ${
              isVideoOff
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            size="lg"
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleScreenShare();
            }}
            className={`rounded-full ${
              isScreenSharing
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            size="lg"
          >
            <Monitor className="h-6 w-6" />
          </Button>

          {/* Chat */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowChat(!showChat);
            }}
            className={`rounded-full ${
              showChat
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            size="lg"
          >
            <MessageSquare className="h-6 w-6" />
            {messages.length > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                {messages.length > 9 ? '9+' : messages.length}
              </span>
            )}
          </Button>

          {/* Raise Hand */}
          <RaiseHandButton
            isRaised={isRaiseHandActive}
            onToggle={handleRaiseHand}
            handsCount={handsRaised.length}
          />

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={(e) => e.stopPropagation()}
                className="rounded-full bg-gray-700 text-white hover:bg-gray-600"
                size="lg"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-[#E2725B] bg-[#F5F1E6]">
              <DropdownMenuItem onClick={() => setShowCodeShare(!showCodeShare)}>
                <Share2 className="mr-2 h-4 w-4 text-[#E2725B]" />
                <span>Share Call Code</span>
              </DropdownMenuItem>

              {isHost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onToggleRecording}
                    className={isRecording ? 'text-red-500' : ''}
                  >
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEndCall} className="text-red-500">
                <PhoneOff className="mr-2 h-4 w-4" />
                <span>End Call</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* End Call */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEndCall();
            }}
            className="rounded-full bg-red-500 text-white hover:bg-red-600"
            size="lg"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 z-40 h-full w-80 border-l border-[#E2725B] bg-white/95 shadow-lg">
          <InCallChat
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            messages={messages}
            onSendMessage={onSendMessage}
            currentUserId="current-user-id"
          />
        </div>
      )}

      {/* Call Code Share Panel */}
      {showCodeShare && (
        <div className="absolute left-1/2 top-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-[#E2725B]">Share Your Call</h2>
          <CallCodeDisplay
            code={callCode}
            onCopy={onCopyCode}
            onShare={() => {
              // Handle share via native APIs
              if (navigator.share) {
                navigator.share({
                  title: 'Join my call',
                  text: `Join my call with code: ${callCode}`,
                });
              }
            }}
          />
          <Button
            onClick={() => setShowCodeShare(false)}
            variant="outline"
            className="mt-4 w-full border-[#E2725B] text-[#E2725B]"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

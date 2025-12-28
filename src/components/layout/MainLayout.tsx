import { useState, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { ProfileView } from '@/components/views/ProfileView';
import { ChatsView } from '@/components/views/ChatsView';
import { CallsView } from '@/components/views/CallsView';
import { FilesView } from '@/components/views/FilesView';
import { ContactsView } from '@/components/contacts/ContactsView';
import { IncomingCallModal } from '@/components/calling/IncomingCallModal';
import { VideoCallScreen } from '@/components/calling/VideoCallScreen';
import { VoiceCallScreen } from '@/components/calling/VoiceCallScreen';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useCallManager } from '@/hooks/useCallManager';
import { useRingtone } from '@/hooks/useRingtone';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/components/status/ConnectionStatus';
import { CallState } from '@/utils/webrtc/RTCManager';

interface MainLayoutProps {
  userName: string;
  userAvatar: string;
  userInterests: string[];
}

export const MainLayout = ({ userName, userAvatar, userInterests }: MainLayoutProps) => {
  const [activeNav, setActiveNav] = useState<'chats' | 'calls' | 'files' | 'contacts' | 'profile'>('chats');
  const [unreadCount] = useState(3);
  const [missedCalls] = useState(1);
  
  const { user } = useAuth();
  const {
    activeCall,
    incomingCall,
    isInCall,
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
  } = useCallManager(user?.id || null);

  const { playRingtone, stopRingtone, playCallEnd } = useRingtone();

  // Play ringtone when there's an incoming call
  useEffect(() => {
    if (incomingCall) {
      playRingtone();
    } else {
      stopRingtone();
    }
  }, [incomingCall, playRingtone, stopRingtone]);

  const handleStartCall = (
    targetUserId: string,
    targetName: string,
    targetAvatar: string | undefined,
    callType: 'voice' | 'video'
  ) => {
    startCall(targetUserId, targetName, targetAvatar, callType);
  };

  const handleAcceptCall = () => {
    stopRingtone();
    acceptCall();
  };

  const handleRejectCall = () => {
    stopRingtone();
    rejectCall();
  };

  const handleEndCall = () => {
    playCallEnd();
    endCall();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Active Video Call */}
      {isInCall && activeCall?.callType === 'video' && (
        <VideoCallScreen
          callerName={activeCall.callerName}
          callerAvatar={activeCall.callerAvatar}
          callState={callState as CallState}
          localStream={localStream}
          remoteStream={remoteStream}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
          onEndCall={handleEndCall}
        />
      )}

      {/* Active Voice Call */}
      {isInCall && activeCall?.callType === 'voice' && (
        <VoiceCallScreen
          callerName={activeCall.callerName}
          callerAvatar={activeCall.callerAvatar}
          callState={callState as CallState}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onEndCall={handleEndCall}
          remoteStream={remoteStream}
        />
      )}

      {/* Soft background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float-delayed" />
      </div>

      {/* Header with eT chat branding */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-organic overflow-hidden shadow-soft">
              <img src="/et-chat-logo.jpg" alt="eT chat" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">eT chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ConnectionStatus compact />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="relative z-10 pb-24">
        {activeNav === 'chats' && <ChatsView onStartCall={handleStartCall} />}
        {activeNav === 'calls' && <CallsView onStartCall={handleStartCall} />}
        {activeNav === 'contacts' && (
          <ContactsView 
            onStartCall={handleStartCall}
            onStartChat={(userId, displayName) => {
              // Navigate to chats and open conversation
              setActiveNav('chats');
            }}
          />
        )}
        {activeNav === 'files' && <FilesView />}
        {activeNav === 'profile' && (
          <ProfileView 
            name={userName} 
            avatar={userAvatar} 
            interests={userInterests}
          />
        )}
      </main>

      {/* Navigation */}
      <BottomNav 
        active={activeNav} 
        onNavigate={setActiveNav} 
        unreadCount={unreadCount}
        missedCalls={missedCalls}
      />
    </div>
  );
};

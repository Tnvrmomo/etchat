import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, Video } from 'lucide-react';
import { ConversationList, Conversation, demoConversations } from '@/components/messaging/ConversationList';
import { ChatView } from '@/components/messaging/ChatView';
import { GroupChat } from '@/components/messaging/GroupChat';
import { VoiceCallScreen } from '@/components/calling/VoiceCallScreen';
import { VideoCallScreen } from '@/components/calling/VideoCallScreen';
import { IncomingCallModal } from '@/components/calling/IncomingCallModal';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';

interface ChatsViewProps {
  currentUserId?: string;
}

export const ChatsView = ({ currentUserId = 'current-user' }: ChatsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    callType: 'voice' | 'video';
  } | null>(null);

  const { toast } = useToast();

  const {
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
  } = useWebRTC();

  const filteredConversations = demoConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartVoiceCall = async () => {
    if (!selectedConversation) return;
    
    try {
      setCallType('voice');
      await startCall('voice');
      toast({
        title: 'Calling...',
        description: `Calling ${selectedConversation.name}`,
      });
    } catch (error) {
      toast({
        title: 'Call failed',
        description: 'Could not start voice call. Please check microphone permissions.',
        variant: 'destructive',
      });
      setCallType(null);
    }
  };

  const handleStartVideoCall = async () => {
    if (!selectedConversation) return;
    
    try {
      setCallType('video');
      await startCall('video');
      toast({
        title: 'Video call starting...',
        description: `Calling ${selectedConversation.name}`,
      });
    } catch (error) {
      toast({
        title: 'Call failed',
        description: 'Could not start video call. Please check camera permissions.',
        variant: 'destructive',
      });
      setCallType(null);
    }
  };

  const handleEndCall = () => {
    endCall();
    setCallType(null);
    toast({
      title: 'Call ended',
      description: `Call with ${selectedConversation?.name} has ended`,
    });
  };

  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    
    try {
      setCallType(incomingCall.callType);
      await startCall(incomingCall.callType);
      setIncomingCall(null);
    } catch (error) {
      toast({
        title: 'Failed to answer',
        description: 'Could not answer the call',
        variant: 'destructive',
      });
      setIncomingCall(null);
    }
  };

  const handleRejectIncomingCall = () => {
    setIncomingCall(null);
    toast({
      title: 'Call declined',
    });
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  // Simulate incoming call for demo (uncomment to test)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIncomingCall({ callerName: 'Demo Caller', callType: 'video' });
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // }, []);

  // Show incoming call modal
  if (incomingCall) {
    return (
      <IncomingCallModal
        callerName={incomingCall.callerName}
        callType={incomingCall.callType}
        onAccept={handleAcceptIncomingCall}
        onReject={handleRejectIncomingCall}
      />
    );
  }

  // Show active call screen
  if (callType && callState !== 'idle' && callState !== 'ended') {
    if (callType === 'voice') {
      return (
        <VoiceCallScreen
          callerName={selectedConversation?.name || 'Unknown'}
          callState={callState}
          isMuted={isMuted}
          remoteStream={remoteStream}
          onToggleMute={toggleMute}
          onEndCall={handleEndCall}
        />
      );
    }

    return (
      <VideoCallScreen
        callerName={selectedConversation?.name || 'Unknown'}
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onEndCall={handleEndCall}
      />
    );
  }

  // Show chat view when conversation selected
  if (selectedConversation) {
    if (selectedConversation.isGroup) {
      return (
        <GroupChat
          groupId={selectedConversation.id}
          groupName={selectedConversation.name}
          members={[]}
          currentUserId={currentUserId}
          onBack={() => setSelectedConversation(null)}
          onGroupCall={handleStartVoiceCall}
          onGroupVideoCall={handleStartVideoCall}
          onShowMembers={() => {}}
        />
      );
    }

    return (
      <ChatView
        contact={{
          id: selectedConversation.id,
          name: selectedConversation.name,
          avatar: selectedConversation.avatar,
          status: selectedConversation.isTyping ? 'typing' : selectedConversation.isOnline ? 'online' : 'offline',
        }}
        currentUserId={currentUserId}
        onBack={() => setSelectedConversation(null)}
        onVoiceCall={handleStartVoiceCall}
        onVideoCall={handleStartVideoCall}
      />
    );
  }

  // Show conversation list
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Chats</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ConversationList
        conversations={filteredConversations}
        onSelect={setSelectedConversation}
      />
    </div>
  );
};

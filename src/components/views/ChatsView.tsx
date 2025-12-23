import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, Video, UserPlus, Loader2 } from 'lucide-react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatView } from '@/components/messaging/ChatView';
import { GroupChat } from '@/components/messaging/GroupChat';
import { VoiceCallScreen } from '@/components/calling/VoiceCallScreen';
import { VideoCallScreen } from '@/components/calling/VideoCallScreen';
import { IncomingCallModal } from '@/components/calling/IncomingCallModal';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/hooks/use-toast';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const ChatsView = () => {
  const { user } = useAuth();
  const { conversations, isLoading, createConversation } = useConversations();
  const { createCall, updateCallStatus } = useCallHistory();
  const { getOtherProfiles } = useProfiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
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

  // Transform conversations for the list component
  const transformedConversations = conversations.map(conv => {
    const otherParticipant = conv.participants?.[0];
    return {
      id: conv.id,
      name: conv.type === 'group' ? (conv.name || 'Group Chat') : (otherParticipant?.display_name || 'Unknown'),
      avatar: conv.type === 'group' ? conv.avatar_url : otherParticipant?.avatar_url,
      lastMessage: conv.last_message?.content || 'No messages yet',
      lastMessageTime: new Date(conv.last_message?.created_at || conv.created_at),
      unreadCount: conv.unread_count || 0,
      isOnline: otherParticipant?.status === 'available',
      isGroup: conv.type === 'group',
      isTyping: conv.is_typing,
    };
  });

  const filteredConversations = transformedConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartVoiceCall = async () => {
    if (!selectedConversation || !user) return;
    
    try {
      setCallType('voice');
      await startCall('voice');
      
      // Create call in database
      const participantIds = selectedConversation.participants?.map((p: any) => p.user_id) || [];
      const call = await createCall(participantIds, 'voice', selectedConversation.id);
      if (call) setCurrentCallId(call.id);
      
      toast({
        title: 'Calling...',
        description: `Calling ${selectedConversation.name || 'Unknown'}`,
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
    if (!selectedConversation || !user) return;
    
    try {
      setCallType('video');
      await startCall('video');
      
      // Create call in database
      const participantIds = selectedConversation.participants?.map((p: any) => p.user_id) || [];
      const call = await createCall(participantIds, 'video', selectedConversation.id);
      if (call) setCurrentCallId(call.id);
      
      toast({
        title: 'Video call starting...',
        description: `Calling ${selectedConversation.name || 'Unknown'}`,
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

  const handleEndCall = async () => {
    endCall();
    if (currentCallId) {
      await updateCallStatus(currentCallId, 'ended');
    }
    setCallType(null);
    setCurrentCallId(null);
    toast({
      title: 'Call ended',
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
    toast({ title: 'Call declined' });
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const handleCreateConversation = async (userId: string, displayName: string) => {
    const conv = await createConversation([userId]);
    if (conv) {
      setShowNewChatDialog(false);
      toast({ title: `Started chat with ${displayName}` });
    }
  };

  const handleSelectConversation = (conv: any) => {
    const fullConv = conversations.find(c => c.id === conv.id);
    setSelectedConversation(fullConv || conv);
  };

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
    const callerName = selectedConversation?.name || 
      selectedConversation?.participants?.[0]?.display_name || 
      'Unknown';

    if (callType === 'voice') {
      return (
        <VoiceCallScreen
          callerName={callerName}
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
        callerName={callerName}
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
    const isGroup = selectedConversation.type === 'group';
    const otherParticipant = selectedConversation.participants?.[0];
    
    if (isGroup) {
      return (
        <GroupChat
          groupId={selectedConversation.id}
          groupName={selectedConversation.name || 'Group Chat'}
          members={[]}
          currentUserId={user?.id || ''}
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
          name: otherParticipant?.display_name || 'Unknown',
          avatar: otherParticipant?.avatar_url || '👤',
          status: otherParticipant?.status === 'available' ? 'online' : 'offline',
        }}
        currentUserId={user?.id || ''}
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
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-primary/10">
                  <UserPlus className="w-5 h-5 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  {getOtherProfiles().length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No other users found. Invite someone to join!
                    </p>
                  ) : (
                    getOtherProfiles().map((profile) => (
                      <button
                        key={profile.user_id}
                        onClick={() => handleCreateConversation(profile.user_id, profile.display_name || 'User')}
                        className="w-full flex items-center gap-3 p-3 rounded-organic hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                          {profile.avatar_url || '👤'}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-display font-medium">{profile.display_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{profile.status_message || 'Available'}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Phone className="w-8 h-8" />
          </div>
          <p className="font-display text-lg">No conversations yet</p>
          <p className="text-sm text-center mt-2">Start a new chat by tapping the + button above</p>
        </div>
      ) : (
        <ConversationList
          conversations={filteredConversations}
          onSelect={handleSelectConversation}
        />
      )}
    </div>
  );
};

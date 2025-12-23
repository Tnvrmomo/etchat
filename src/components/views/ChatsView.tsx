import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Phone, UserPlus, Loader2 } from 'lucide-react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatView } from '@/components/messaging/ChatView';
import { GroupChat } from '@/components/messaging/GroupChat';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ChatsViewProps {
  onStartCall?: (targetUserId: string, targetName: string, targetAvatar: string | undefined, callType: 'voice' | 'video') => void;
}

export const ChatsView = ({ onStartCall }: ChatsViewProps) => {
  const { user } = useAuth();
  const { conversations, isLoading, createConversation } = useConversations();
  const { getOtherProfiles } = useProfiles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  const { toast } = useToast();

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

  const handleStartVoiceCall = () => {
    if (!selectedConversation || !user || !onStartCall) return;
    
    const otherParticipant = selectedConversation.participants?.[0];
    if (!otherParticipant) {
      toast({
        title: 'Cannot start call',
        description: 'No participant found',
        variant: 'destructive',
      });
      return;
    }
    
    onStartCall(
      otherParticipant.user_id,
      otherParticipant.display_name || 'Unknown',
      otherParticipant.avatar_url || undefined,
      'voice'
    );
  };

  const handleStartVideoCall = () => {
    if (!selectedConversation || !user || !onStartCall) return;
    
    const otherParticipant = selectedConversation.participants?.[0];
    if (!otherParticipant) {
      toast({
        title: 'Cannot start call',
        description: 'No participant found',
        variant: 'destructive',
      });
      return;
    }
    
    onStartCall(
      otherParticipant.user_id,
      otherParticipant.display_name || 'Unknown',
      otherParticipant.avatar_url || undefined,
      'video'
    );
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

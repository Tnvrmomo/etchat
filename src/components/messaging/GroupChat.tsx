import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Phone, Video, Users, Search } from 'lucide-react';
import { MessageBubble, Message, MessageAttachment } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MessageSearch } from './MessageSearch';
import { ForwardMessageDialog } from './ForwardMessageDialog';
import { TypingIndicator } from './TypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { useMessageReactions } from '@/hooks/useMessageReactions';

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  role: 'admin' | 'member';
}

interface GroupChatProps {
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  members: GroupMember[];
  currentUserId: string;
  onBack: () => void;
  onGroupCall: () => void;
  onGroupVideoCall: () => void;
  onShowMembers: () => void;
}

const demoMembers: GroupMember[] = [
  { id: 'current-user', name: 'You', isOnline: true, role: 'admin' },
  { id: 'member-1', name: 'Alex Chen', isOnline: true, role: 'admin' },
  { id: 'member-2', name: 'Sarah Miller', isOnline: true, role: 'member' },
  { id: 'member-3', name: 'Jordan Lee', isOnline: false, role: 'member' },
  { id: 'member-4', name: 'Mike Wilson', isOnline: true, role: 'member' },
];

export const GroupChat = ({
  groupId,
  groupName,
  groupAvatar,
  members = demoMembers,
  currentUserId,
  onBack,
  onGroupCall,
  onGroupVideoCall,
  onShowMembers,
}: GroupChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineCount = members.filter(m => m.isOnline).length;

  // Hooks for typing, read receipts, and reactions
  const { typingUsers, setTyping } = useTypingIndicator(groupId);
  const { markMultipleAsRead, getReadStatus, getReadBy } = useReadReceipts(groupId);
  const { toggleReaction, getReactionSummary } = useMessageReactions(groupId);

  // Filter out current user from typing users
  const otherTypingUsers = typingUsers.filter(u => u.userId !== currentUserId);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', groupId)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error fetching group messages:', error);
          return;
        }

        const formattedMessages: Message[] = (data || []).map(msg => {
          const metadata = msg.metadata as { attachments?: MessageAttachment[] } | null;
          const member = members.find(m => m.id === msg.sender_id);
          return {
            id: msg.id,
            content: msg.content || '',
            senderId: msg.sender_id || '',
            senderName: msg.sender_id === currentUserId ? 'You' : (member?.name || 'Unknown'),
            senderAvatar: member?.avatar,
            timestamp: new Date(msg.created_at),
            status: 'read' as const,
            attachments: metadata?.attachments,
          };
        });

        setMessages(formattedMessages);

        // Mark messages from others as read
        const unreadMessageIds = (data || [])
          .filter(msg => msg.sender_id !== currentUserId)
          .map(msg => msg.id);
        
        if (unreadMessageIds.length > 0) {
          markMultipleAsRead(unreadMessageIds);
        }
      } catch (err) {
        console.error('Error in fetchMessages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group-messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${groupId}`,
        },
        (payload) => {
          const msg = payload.new as any;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) {
              return prev;
            }
            const member = members.find(m => m.id === msg.sender_id);
            const newMessage: Message = {
              id: msg.id,
              content: msg.content || '',
              senderId: msg.sender_id || '',
              senderName: msg.sender_id === currentUserId ? 'You' : (member?.name || 'Unknown'),
              senderAvatar: member?.avatar,
              timestamp: new Date(msg.created_at),
              status: 'delivered',
              attachments: msg.metadata?.attachments as MessageAttachment[] | undefined,
            };
            
            // Mark as read if from other user
            if (msg.sender_id !== currentUserId) {
              markMultipleAsRead([msg.id]);
            }
            
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, currentUserId, members, markMultipleAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string, attachments?: MessageAttachment[]) => {
    const tempId = `temp-${Date.now()}`;
    
    const newMessage: Message = {
      id: tempId,
      content,
      senderId: currentUserId,
      senderName: 'You',
      timestamp: new Date(),
      status: 'sending',
      attachments,
      replyTo: replyTo ? {
        id: replyTo.id,
        content: replyTo.content || (replyTo.attachments ? '📎 Attachment' : ''),
        senderName: replyTo.senderName,
      } : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setReplyTo(null);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: groupId,
          sender_id: currentUserId,
          content,
          message_type: attachments && attachments.length > 0 ? 'file' : 'text',
          metadata: attachments ? JSON.parse(JSON.stringify({ attachments })) : null,
          reply_to_id: replyTo?.id || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error sending group message:', error);
        return;
      }

      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, id: data.id, status: 'sent' as const } : m)
      );

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);

    } catch (err) {
      console.error('Error in handleSend:', err);
    }
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
  }, [setTyping]);

  const handleSearchResultClick = (messageId: string) => {
    setHighlightedMessageId(messageId);
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightedMessageId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={groupAvatar} alt={groupName} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {groupName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0" onClick={onShowMembers}>
          <h2 className="font-display font-semibold text-foreground truncate cursor-pointer hover:underline">
            {groupName}
          </h2>
          <p className="text-xs text-muted-foreground">
            {otherTypingUsers.length > 0 
              ? `${otherTypingUsers[0].userName} is typing...`
              : `${members.length} members, ${onlineCount} online`
            }
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
          <Search className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onGroupCall}>
          <Phone className="w-5 h-5 text-secondary" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onGroupVideoCall}>
          <Video className="w-5 h-5 text-secondary" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onShowMembers}>
          <Users className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <MessageSearch
        conversationId={groupId}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onResultClick={handleSearchResultClick}
        members={members.map(m => ({ id: m.id, name: m.name }))}
      />

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <ScrollArea ref={scrollRef} className="flex-1 py-4">
          <div className="space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="font-display">No messages yet</p>
                <p className="text-sm mt-2">Start the group conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                const readByUsers = isOwn ? getReadBy(message.id) : [];

                return (
                  <div key={message.id} id={`message-${message.id}`}>
                    {!isOwn && showAvatar && (
                      <p className="text-xs text-primary font-medium px-16 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <MessageBubble
                      message={{
                        ...message,
                        status: isOwn ? getReadStatus(message.id, message.senderId) : message.status,
                      }}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onReply={() => setReplyTo(message)}
                      onReact={(messageId, emoji) => toggleReaction(messageId, emoji)}
                      onForward={() => setForwardMessage(message)}
                      reactionSummary={getReactionSummary(message.id)}
                      readBy={readByUsers}
                      isHighlighted={message.id === highlightedMessageId}
                    />
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {otherTypingUsers.length > 0 && (
              <TypingIndicator users={otherTypingUsers} />
            )}
          </div>
        </ScrollArea>
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder="Type a message to the group..."
        conversationId={groupId}
      />

      {/* Forward Dialog */}
      <ForwardMessageDialog
        message={forwardMessage}
        isOpen={!!forwardMessage}
        onClose={() => setForwardMessage(null)}
        currentUserId={currentUserId}
      />
    </div>
  );
};

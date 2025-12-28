import { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { MessageBubble, Message, MessageAttachment } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MessageSearch } from './MessageSearch';
import { ForwardMessageDialog } from './ForwardMessageDialog';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadReceipts } from '@/hooks/useReadReceipts';
import { useMessageReactions } from '@/hooks/useMessageReactions';

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: Date;
  userId?: string;
}

interface ChatViewProps {
  contact: ChatContact;
  currentUserId: string;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export const ChatView = ({
  contact,
  currentUserId,
  onBack,
  onVoiceCall,
  onVideoCall,
}: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Hooks for typing, read receipts, and reactions
  const { typingUsers, setTyping } = useTypingIndicator(contact.id);
  const { markMultipleAsRead, getReadStatus, getReadBy } = useReadReceipts(contact.id);
  const { toggleReaction, getReactionSummary } = useMessageReactions(contact.id);

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
          .eq('conversation_id', contact.id)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        const formattedMessages: Message[] = (data || []).map(msg => {
          const metadata = msg.metadata as { attachments?: MessageAttachment[] } | null;
          return {
            id: msg.id,
            content: msg.content || '',
            senderId: msg.sender_id || '',
            senderName: msg.sender_id === currentUserId ? 'You' : contact.name,
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
      .channel(`messages:${contact.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${contact.id}`,
        },
        (payload) => {
          const msg = payload.new as any;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) {
              return prev;
            }
            const newMessage: Message = {
              id: msg.id,
              content: msg.content || '',
              senderId: msg.sender_id || '',
              senderName: msg.sender_id === currentUserId ? 'You' : contact.name,
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
  }, [contact.id, currentUserId, contact.name, markMultipleAsRead]);

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
          conversation_id: contact.id,
          sender_id: currentUserId,
          content,
          message_type: attachments && attachments.length > 0 ? 'file' : 'text',
          metadata: attachments ? JSON.parse(JSON.stringify({ attachments })) : null,
          reply_to_id: replyTo?.id || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        setMessages(prev =>
          prev.map(m => m.id === tempId ? { ...m, status: 'sending' as const } : m)
        );
        return;
      }

      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, id: data.id, status: 'sent' as const } : m)
      );

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', contact.id);

    } catch (err) {
      console.error('Error in handleSend:', err);
    }
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    setTyping(isTyping);
  }, [setTyping]);

  const handleSearchResultClick = (messageId: string) => {
    setHighlightedMessageId(messageId);
    // Find the message element and scroll to it
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Clear highlight after 2 seconds
    setTimeout(() => setHighlightedMessageId(null), 2000);
  };

  const getStatusText = (): string => {
    if (otherTypingUsers.length > 0) return 'typing...';
    if (contact.status === 'online') return 'online';
    if (contact.lastSeen) {
      return `last seen ${contact.lastSeen.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    }
    return 'offline';
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach(msg => {
      const msgDate = msg.timestamp.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });

      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.avatar} alt={contact.name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {contact.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-foreground truncate">
            {contact.name}
          </h2>
          <p className={cn(
            'text-xs',
            otherTypingUsers.length > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'
          )}>
            {getStatusText()}
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
          <Search className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onVoiceCall}>
          <Phone className="w-5 h-5 text-secondary" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onVideoCall}>
          <Video className="w-5 h-5 text-secondary" />
        </Button>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <MessageSearch
        conversationId={contact.id}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onResultClick={handleSearchResultClick}
        members={[
          { id: currentUserId, name: 'You' },
          { id: contact.userId || contact.id, name: contact.name },
        ]}
      />

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <ScrollArea ref={scrollRef} className="flex-1 py-2">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p className="font-display">No messages yet</p>
                <p className="text-sm mt-2">Say hello to start the conversation!</p>
              </div>
            ) : (
              messageGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {group.date}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {group.messages.map((message, index) => {
                      const isOwn = message.senderId === currentUserId;
                      const showAvatar = index === 0 || group.messages[index - 1].senderId !== message.senderId;

                      return (
                        <div key={message.id} id={`message-${message.id}`}>
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
                            readBy={isOwn ? getReadBy(message.id) : []}
                            isHighlighted={message.id === highlightedMessageId}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
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
        conversationId={contact.id}
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

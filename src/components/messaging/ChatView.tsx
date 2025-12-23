import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { MessageBubble, Message, MessageAttachment } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { cn } from '@/lib/utils';

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: Date;
}

interface ChatViewProps {
  contact: ChatContact;
  currentUserId: string;
  onBack: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

// Demo messages with attachments
const demoMessages: Message[] = [
  {
    id: '1',
    content: 'Hey! How are you doing?',
    senderId: 'contact-1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
  },
  {
    id: '2',
    content: "I'm doing great! Just finished working on that new feature.",
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3500000),
    status: 'read',
  },
  {
    id: '3',
    content: 'That sounds awesome! Check out this screenshot:',
    senderId: 'contact-1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
    attachments: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        name: 'screenshot.jpg',
        type: 'image',
        size: 245000,
        mimeType: 'image/jpeg',
      }
    ]
  },
  {
    id: '4',
    content: "Nice! Here's the documentation for the WebRTC implementation.",
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3300000),
    status: 'delivered',
    attachments: [
      {
        id: 'file-1',
        url: '#',
        name: 'WebRTC_Documentation.pdf',
        type: 'file',
        size: 1250000,
        mimeType: 'application/pdf',
      }
    ]
  },
  {
    id: '5',
    content: '',
    senderId: 'contact-1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 3200000),
    status: 'read',
    attachments: [
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
        name: 'code-preview.jpg',
        type: 'image',
        size: 320000,
        mimeType: 'image/jpeg',
      },
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        name: 'debug-session.jpg',
        type: 'image',
        size: 280000,
        mimeType: 'image/jpeg',
      }
    ]
  },
];

export const ChatView = ({
  contact,
  currentUserId,
  onBack,
  onVoiceCall,
  onVideoCall,
}: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (contact.status === 'typing') {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [contact.status]);

  const handleSend = (content: string, attachments?: MessageAttachment[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
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

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m)
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
      );
    }, 1000);
  };

  const getStatusText = (): string => {
    if (isTyping || contact.status === 'typing') return 'typing...';
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
            isTyping || contact.status === 'typing' ? 'text-primary animate-pulse' : 'text-muted-foreground'
          )}>
            {getStatusText()}
          </p>
        </div>

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

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 py-2">
        <div className="space-y-4">
          {messageGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-1">
                {group.messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const showAvatar = index === 0 || group.messages[index - 1].senderId !== message.senderId;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onReply={() => setReplyTo(message)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 px-4 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                  {contact.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1 px-4 py-3 bg-card rounded-2xl">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        conversationId={contact.id}
      />
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { MessageBubble, Message } from './MessageBubble';
import { MessageInput } from './MessageInput';

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

// Demo messages
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
    content: 'That sounds awesome! Can you tell me more about it?',
    senderId: 'contact-1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
  },
  {
    id: '4',
    content: "It's a real-time messaging system with voice and video calling capabilities. We're using WebRTC for the peer-to-peer connections.",
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3300000),
    status: 'delivered',
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: currentUserId,
      senderName: 'You',
      timestamp: new Date(),
      status: 'sending',
      replyTo: replyTo ? {
        id: replyTo.id,
        content: replyTo.content,
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
    if (contact.status === 'typing') return 'typing...';
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
          <p className="text-xs text-muted-foreground">
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
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

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
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

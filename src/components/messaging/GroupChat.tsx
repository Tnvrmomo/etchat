import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Phone, Video, MoreVertical, Users } from 'lucide-react';
import { MessageBubble, Message } from './MessageBubble';
import { MessageInput } from './MessageInput';

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

// Demo group messages
const demoGroupMessages: Message[] = [
  {
    id: '1',
    content: "Hey team! The new release is ready for testing.",
    senderId: 'member-1',
    senderName: 'Alex Chen',
    timestamp: new Date(Date.now() - 7200000),
    status: 'read',
  },
  {
    id: '2',
    content: 'Awesome! I will start testing the voice calling feature.',
    senderId: 'member-2',
    senderName: 'Sarah Miller',
    timestamp: new Date(Date.now() - 7100000),
    status: 'read',
  },
  {
    id: '3',
    content: "I'll handle the video calling tests 🎥",
    senderId: 'member-3',
    senderName: 'Jordan Lee',
    timestamp: new Date(Date.now() - 7000000),
    status: 'read',
  },
  {
    id: '4',
    content: "Great teamwork everyone! Let's sync up after testing.",
    senderId: 'current-user',
    senderName: 'You',
    timestamp: new Date(Date.now() - 6900000),
    status: 'delivered',
  },
  {
    id: '5',
    content: 'The screen sharing is working perfectly! 🚀',
    senderId: 'member-2',
    senderName: 'Sarah Miller',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
  },
];

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
  const [messages, setMessages] = useState<Message[]>(demoGroupMessages);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineCount = members.filter(m => m.isOnline).length;

  useEffect(() => {
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

    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m)
      );
    }, 500);
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
            {members.length} members, {onlineCount} online
          </p>
        </div>

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

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isOwn = message.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

            return (
              <div key={message.id}>
                {/* Show sender name for group messages */}
                {!isOwn && showAvatar && (
                  <p className="text-xs text-primary font-medium px-16 mb-1">
                    {message.senderName}
                  </p>
                )}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onReply={() => setReplyTo(message)}
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder="Type a message to the group..."
      />
    </div>
  );
};

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isGroup?: boolean;
  isTyping?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

// Demo conversations
export const demoConversations: Conversation[] = [
  {
    id: '1',
    name: 'Alex Chen',
    lastMessage: "That sounds awesome! Can you tell me more?",
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    isOnline: true,
    isTyping: true,
  },
  {
    id: '2',
    name: 'EngineersTech Team',
    lastMessage: 'Jordan: The deployment is ready!',
    lastMessageTime: new Date(Date.now() - 600000),
    unreadCount: 5,
    isOnline: true,
    isGroup: true,
  },
  {
    id: '3',
    name: 'Sarah Miller',
    lastMessage: 'Thanks for the help earlier!',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Design Sync',
    lastMessage: 'Mike: New mockups are ready for review',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 0,
    isOnline: true,
    isGroup: true,
  },
  {
    id: '5',
    name: 'Jordan Lee',
    lastMessage: 'See you at the meeting!',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    isOnline: true,
  },
];

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) => {
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            className={cn(
              'w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
              selectedId === conversation.id && 'bg-muted'
            )}
            onClick={() => onSelect(conversation)}
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12">
                <AvatarImage src={conversation.avatar} alt={conversation.name} />
                <AvatarFallback className={cn(
                  conversation.isGroup ? 'bg-accent' : 'bg-primary',
                  'text-primary-foreground'
                )}>
                  {conversation.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && !conversation.isGroup && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-card" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-medium text-foreground truncate">
                  {conversation.name}
                </span>
                <span className={cn(
                  'text-xs flex-shrink-0',
                  conversation.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'
                )}>
                  {formatTime(conversation.lastMessageTime)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className={cn(
                  'text-sm truncate',
                  conversation.isTyping
                    ? 'text-secondary italic'
                    : conversation.unreadCount > 0
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}>
                  {conversation.isTyping ? 'typing...' : conversation.lastMessage}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge className="flex-shrink-0 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};

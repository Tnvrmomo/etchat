import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onReact,
}: MessageBubbleProps) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 rounded-full border border-current opacity-50" />;
      case 'sent':
        return <Check className="w-3 h-3 opacity-60" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 opacity-60" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-secondary" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'flex gap-2 px-4 py-1 group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="text-xs bg-accent text-accent-foreground">
            {message.senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[75%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div
            className={cn(
              'text-xs px-3 py-1.5 rounded-t-lg border-l-2 border-accent mb-0.5',
              isOwn ? 'bg-primary/20 text-primary-foreground/80' : 'bg-muted text-muted-foreground'
            )}
          >
            <span className="font-medium">{message.replyTo.senderName}</span>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'px-4 py-2.5 shadow-soft',
            isOwn 
              ? 'bg-primary text-primary-foreground bubble-right' 
              : 'bg-card text-card-foreground bubble-left'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Time and Status */}
          <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
            <span className={cn('text-xs', isOwn ? 'opacity-70' : 'text-muted-foreground')}>
              {formatTime(message.timestamp)}
            </span>
            {isOwn && <StatusIcon />}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn('flex gap-0.5 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
            {message.reactions.map((reaction, index) => (
              <span
                key={index}
                className="text-sm bg-card rounded-full px-1.5 py-0.5 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                title={reaction.userName}
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Spacer for own messages without avatar */}
      {showAvatar && isOwn && <div className="w-8 flex-shrink-0" />}
    </div>
  );
};

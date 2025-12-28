import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck, Download, Play, FileText, Image as ImageIcon, CornerUpRight, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { QuickReactions } from './EmojiPicker';
import { ReactionSummary } from '@/hooks/useMessageReactions';

export interface MessageAttachment {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'file';
  size: number;
  mimeType: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
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
  onForward?: (message: Message) => void;
  reactionSummary?: ReactionSummary[];
  readBy?: string[];
  isHighlighted?: boolean;
}

export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onReact,
  onForward,
  reactionSummary = [],
  readBy = [],
  isHighlighted = false,
}: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 rounded-full border border-current opacity-50 animate-pulse" />;
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

  const renderAttachment = (attachment: MessageAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div key={attachment.id} className="relative rounded-lg overflow-hidden mt-2 max-w-[280px]">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
            />
            <a
              href={attachment.url}
              download={attachment.name}
              className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        );
      
      case 'video':
        return (
          <div key={attachment.id} className="relative rounded-lg overflow-hidden mt-2 max-w-[280px]">
            <video
              src={attachment.url}
              controls
              className="w-full h-auto rounded-lg"
              preload="metadata"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div key={attachment.id} className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-lg max-w-[280px]">
            <Button size="icon" variant="ghost" className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Play className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <audio src={attachment.url} controls className="w-full h-8 mt-1" />
            </div>
          </div>
        );
      
      case 'file':
      default:
        return (
          <a
            key={attachment.id}
            href={attachment.url}
            download={attachment.name}
            className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-lg max-w-[280px] hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
            </div>
            <Download className="w-4 h-4 text-muted-foreground" />
          </a>
        );
    }
  };

  const hasOnlyAttachments = !message.content && message.attachments && message.attachments.length > 0;

  return (
    <div
      className={cn(
        'flex gap-2 px-4 py-1 group relative',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isHighlighted && 'bg-primary/10 animate-pulse'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
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
            'shadow-soft relative',
            hasOnlyAttachments ? 'p-1' : 'px-4 py-2.5',
            isOwn 
              ? 'bg-primary text-primary-foreground bubble-right' 
              : 'bg-card text-card-foreground bubble-left'
          )}
        >
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map(renderAttachment)}
            </div>
          )}
          
          {/* Time and Status */}
          <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start', hasOnlyAttachments && 'px-2')}>
            <span className={cn('text-xs', isOwn ? 'opacity-70' : 'text-muted-foreground')}>
              {formatTime(message.timestamp)}
            </span>
            {isOwn && <StatusIcon />}
          </div>
        </div>

        {/* Reactions Display */}
        {reactionSummary.length > 0 && (
          <div className={cn('flex gap-1 mt-1 flex-wrap', isOwn ? 'justify-end' : 'justify-start')}>
            {reactionSummary.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact?.(message.id, reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 text-sm px-2 py-0.5 rounded-full shadow-sm transition-all hover:scale-105',
                  reaction.hasReacted
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-card border border-border'
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Read by indicator for group chats */}
        {isOwn && readBy.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Seen by {readBy.length}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div
          className={cn(
            'absolute top-0 flex items-center gap-1',
            isOwn ? 'left-4' : 'right-4'
          )}
        >
          <QuickReactions
            onReact={(emoji) => onReact?.(message.id, emoji)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onReply && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-card shadow-sm border border-border"
                onClick={() => onReply(message)}
              >
                <CornerUpRight className="w-3.5 h-3.5" />
              </Button>
            )}
            {onForward && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-card shadow-sm border border-border"
                onClick={() => onForward(message)}
              >
                <CornerUpRight className="w-3.5 h-3.5 rotate-90" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Spacer for own messages without avatar */}
      {showAvatar && isOwn && <div className="w-8 flex-shrink-0" />}
    </div>
  );
};

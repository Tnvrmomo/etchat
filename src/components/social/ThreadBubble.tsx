import { useState } from 'react';
import { MoreHorizontal, ArrowRight } from 'lucide-react';

interface Reply {
  id: number;
  author: string;
  authorEmoji: string;
  content: string;
  isActive: boolean;
  replies?: Reply[];
}

interface ThreadBubbleProps {
  id: number;
  author: string;
  authorEmoji: string;
  content: string;
  isActive: boolean;
  depth?: number;
  replies?: Reply[];
  onReply?: (id: number) => void;
  onReact?: (id: number, reaction: string) => void;
}

export const ThreadBubble = ({
  id,
  author,
  authorEmoji,
  content,
  isActive,
  depth = 0,
  replies = [],
  onReply,
  onReact,
}: ThreadBubbleProps) => {
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [showQuickReact, setShowQuickReact] = useState(false);

  // Wider bubbles for longer content
  const contentLength = content.length;
  const bubbleWidth = contentLength > 100 ? 'max-w-md' : contentLength > 50 ? 'max-w-sm' : 'max-w-xs';

  const quickReactions = ['👍', '❤️', '💡', '🎯'];

  return (
    <div className={`${depth > 0 ? 'ml-6 mt-3' : ''}`}>
      <div
        className={`
          relative group ${bubbleWidth}
          ${isActive ? 'shadow-glow' : 'shadow-soft'}
        `}
        onMouseEnter={() => setShowQuickReact(true)}
        onMouseLeave={() => setShowQuickReact(false)}
      >
        {/* Thought bubble shape */}
        <div 
          className={`
            relative bg-card/95 backdrop-blur-sm p-4 
            ${depth === 0 ? 'rounded-[2rem] rounded-bl-lg' : 'rounded-[1.5rem] rounded-bl-md'}
            transition-all duration-300
            ${isActive ? 'ring-2 ring-primary/20' : ''}
          `}
        >
          {/* Author */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{authorEmoji}</span>
            <span className="font-display text-sm font-medium">{author}</span>
            {isActive && (
              <span className="w-2 h-2 rounded-full presence-online" />
            )}
          </div>

          {/* Content */}
          <p className="font-body leading-relaxed">{content}</p>

          {/* Quick react on hover */}
          {showQuickReact && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full flex gap-1 bg-card shadow-soft p-1.5 rounded-full animate-scale-in">
              {quickReactions.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => onReact?.(id, reaction)}
                  className="hover:scale-110 transition-transform text-sm"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}

          {/* Thought bubble tail */}
          <div className="absolute -bottom-2 left-4">
            <div className="w-4 h-4 bg-card/95 rounded-full" />
            <div className="w-2 h-2 bg-card/95 rounded-full -ml-1 -mt-1" />
          </div>
        </div>

        {/* Reply action */}
        <div className="mt-3 ml-4 flex items-center gap-3 text-sm text-muted-foreground">
          <button
            onClick={() => onReply?.(id)}
            className="hover:text-primary transition-colors font-display"
          >
            Reply
          </button>
          
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>{replies.length} {showReplies ? 'hide' : 'more'}</span>
              <ArrowRight className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="animate-fade-in-up">
          {replies.map((reply) => (
            <ThreadBubble
              key={reply.id}
              {...reply}
              depth={depth + 1}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
};

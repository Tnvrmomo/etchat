import { useState } from 'react';
import { Clock, MessageCircle, Heart, Smile, ThumbsUp } from 'lucide-react';

interface ReelCardProps {
  id: number;
  author: string;
  authorEmoji: string;
  mood: string;
  prompt: string;
  replies: number;
  timeLeft: string;
  hoursRemaining: number;
  isActive: boolean;
  rotation?: number;
  onReply?: (id: number) => void;
  onReact?: (id: number, reaction: string) => void;
}

export const ReelCard = ({
  id,
  author,
  authorEmoji,
  mood,
  prompt,
  replies,
  timeLeft,
  hoursRemaining,
  isActive,
  rotation = 0,
  onReply,
  onReact,
}: ReelCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);

  // Pulsing intensity based on time remaining
  const isUrgent = hoursRemaining < 12;
  const isCritical = hoursRemaining < 6;

  const reactions = ['❤️', '👍', '😄', '🤔', '✨'];

  const handleReact = (reaction: string) => {
    setHasReacted(true);
    setShowReactions(false);
    onReact?.(id, reaction);
  };

  return (
    <article
      className={`
        relative bg-card/90 backdrop-blur-sm p-5 rounded-organic-lg shadow-soft 
        hover-lift cursor-pointer transition-all duration-300
        border-2 border-transparent hover:border-primary/20
        ${isExpanded ? 'scale-[1.02] shadow-warm' : ''}
      `}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(40 30% 95%) 100%)`,
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Tape effect at top */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-warm/40 rounded-sm"
        style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{authorEmoji}</span>
          <div>
            <span className="font-display text-sm font-semibold">{author}</span>
            <span className="ml-2 text-sm">{mood}</span>
          </div>
        </div>
        
        {/* Timer with pulsing animation */}
        <div 
          className={`
            flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
            ${isCritical ? 'bg-primary/20 text-primary' : isUrgent ? 'bg-warm/20 text-warm-foreground' : 'bg-muted/50 text-muted-foreground'}
          `}
        >
          <Clock 
            className={`w-3 h-3 ${isCritical ? 'animate-pulse' : ''}`} 
          />
          <span className={isCritical ? 'font-medium' : ''}>{timeLeft}</span>
          {isActive && (
            <span className="w-2 h-2 rounded-full presence-active" />
          )}
        </div>
      </div>

      {/* Prompt - Big and central */}
      <p className="text-lg leading-relaxed mb-4 font-body">{prompt}</p>

      {/* Quick reactions */}
      {showReactions && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-card shadow-warm p-2 rounded-full animate-scale-in">
          {reactions.map((reaction) => (
            <button
              key={reaction}
              onClick={(e) => {
                e.stopPropagation();
                handleReact(reaction);
              }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {reaction}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
            className={`flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ${hasReacted ? 'text-primary' : ''}`}
          >
            <Heart className={`w-4 h-4 ${hasReacted ? 'fill-primary' : ''}`} />
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span>{replies}</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply?.(id);
          }}
          className="font-display font-medium text-primary hover:underline"
        >
          Join in →
        </button>
      </div>

      {/* Expanded quick reply */}
      {isExpanded && (
        <div 
          className="mt-4 pt-4 border-t border-border animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            placeholder="Add your thoughts..."
            className="w-full bg-muted/50 rounded-organic px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      )}
    </article>
  );
};

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = [
  {
    name: 'Quick',
    emojis: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'],
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚', '✋', '🖐️', '👏', '🙌', '🤝', '🙏'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
  },
  {
    name: 'Objects',
    emojis: ['🎉', '🎊', '🎁', '🔥', '⭐', '✨', '💫', '🌟', '💯', '💢', '💥', '💦', '💨', '🕳️', '💣', '💬'],
  },
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  triggerClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const EmojiPicker = ({ onEmojiSelect, triggerClassName, side = 'top' }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 rounded-full hover:bg-muted', triggerClassName)}
        >
          <Smile className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72 p-2" align="end">
        {/* Quick reactions */}
        <div className="flex gap-1 mb-2 pb-2 border-b border-border">
          {EMOJI_CATEGORIES[0].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded-md transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-2">
          {EMOJI_CATEGORIES.slice(1).map((category, index) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(index + 1)}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors',
                activeCategory === index + 1
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded-md transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Quick reaction bar for message bubbles
interface QuickReactionsProps {
  onReact: (emoji: string) => void;
  className?: string;
}

export const QuickReactions = ({ onReact, className }: QuickReactionsProps) => {
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className={cn('flex gap-0.5 bg-card rounded-full px-1 py-0.5 shadow-lg border border-border', className)}>
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-muted rounded-full transition-all hover:scale-110"
        >
          {emoji}
        </button>
      ))}
      <EmojiPicker onEmojiSelect={onReact} side="top" />
    </div>
  );
};

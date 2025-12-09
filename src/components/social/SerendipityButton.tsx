import { useState } from 'react';
import { Shuffle, User, MessageCircle, Palette, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DiscoveryType = 'person' | 'thread' | 'canvas' | 'space';

interface Discovery {
  type: DiscoveryType;
  title: string;
  description: string;
  emoji: string;
  reason?: string;
}

const discoveries: Discovery[] = [
  {
    type: 'person',
    title: 'Meet Jordan',
    description: 'Loves sustainable design',
    emoji: '🎨',
    reason: 'You both care about the environment',
  },
  {
    type: 'thread',
    title: 'Deep conversation happening',
    description: 'What makes a home feel like home?',
    emoji: '💭',
    reason: 'Your perspective would add depth',
  },
  {
    type: 'canvas',
    title: 'Canvas needs you',
    description: 'Community garden planning',
    emoji: '🌱',
    reason: 'They need someone with your skills',
  },
  {
    type: 'space',
    title: 'Good vibes right now',
    description: 'Cozy Creators Corner',
    emoji: '☕',
    reason: '7 people having a great chat',
  },
];

const discoveryIcons = {
  person: User,
  thread: MessageCircle,
  canvas: Palette,
  space: Users,
};

export const SerendipityButton = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<Discovery | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleShuffle = () => {
    setIsSpinning(true);
    setShowResult(false);
    
    // Simulate spinning through options
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * discoveries.length);
      setCurrentDiscovery(discoveries[randomIndex]);
      count++;
      
      if (count > 8) {
        clearInterval(interval);
        setIsSpinning(false);
        setShowResult(true);
      }
    }, 150);
  };

  const DiscoveryIcon = currentDiscovery ? discoveryIcons[currentDiscovery.type] : null;

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className={`
          w-full py-6 rounded-organic-lg font-display
          border-2 border-dashed border-primary/30
          hover:border-primary hover:bg-primary/5
          transition-all duration-300
          ${isSpinning ? 'animate-pulse' : ''}
        `}
        onClick={handleShuffle}
        disabled={isSpinning}
      >
        <Shuffle className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
        Find something unexpected
        <Sparkles className="w-4 h-4 ml-2 text-warm" />
      </Button>

      {/* Discovery result */}
      {currentDiscovery && (
        <div 
          className={`
            bg-card border border-border rounded-organic-lg p-4
            transition-all duration-500
            ${showResult ? 'animate-scale-in opacity-100' : 'opacity-50'}
            ${isSpinning ? 'scale-95' : 'scale-100'}
          `}
        >
          <div className="flex items-start gap-3">
            {/* Type icon */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {currentDiscovery.emoji}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {DiscoveryIcon && (
                  <DiscoveryIcon className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground capitalize">
                  {currentDiscovery.type}
                </span>
              </div>
              
              <p className="font-display font-semibold">{currentDiscovery.title}</p>
              <p className="text-sm text-muted-foreground">{currentDiscovery.description}</p>
              
              {showResult && currentDiscovery.reason && (
                <p className="text-xs text-secondary mt-2 italic animate-fade-in-up">
                  ✨ {currentDiscovery.reason}
                </p>
              )}
            </div>
          </div>

          {showResult && (
            <div className="flex gap-2 mt-4 animate-fade-in-up">
              <Button 
                size="sm" 
                className="flex-1 rounded-organic font-display"
              >
                Jump in →
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-organic font-display"
                onClick={handleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

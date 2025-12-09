import { useState } from 'react';
import { Users } from 'lucide-react';

interface InterestCloudProps {
  interests: string[];
  viewerInterests?: string[];
  onInterestClick?: (interest: string) => void;
}

const interestEmojis: Record<string, string> = {
  art: '🎨',
  music: '🎵',
  books: '📚',
  tech: '💻',
  food: '🍳',
  travel: '✈️',
  fitness: '💪',
  gaming: '🎮',
  movies: '🎬',
  nature: '🌿',
  photography: '📸',
  writing: '✍️',
  mindfulness: '🧘',
  podcasts: '🎙️',
  crafts: '🧶',
  design: '✏️',
  sustainability: '🌱',
  cooking: '👨‍🍳',
  coffee: '☕',
  fashion: '👗',
};

// Sizes based on depth of interest (simulated with position in array for now)
const sizeClasses = [
  'text-base px-4 py-2',
  'text-sm px-3 py-1.5',
  'text-xs px-2.5 py-1',
];

export const InterestCloud = ({ 
  interests, 
  viewerInterests = [],
  onInterestClick 
}: InterestCloudProps) => {
  const [hoveredInterest, setHoveredInterest] = useState<string | null>(null);
  const [expandedInterest, setExpandedInterest] = useState<string | null>(null);

  const isShared = (interest: string) => viewerInterests.includes(interest);

  const handleClick = (interest: string) => {
    if (expandedInterest === interest) {
      setExpandedInterest(null);
    } else {
      setExpandedInterest(interest);
    }
    onInterestClick?.(interest);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap justify-center gap-2">
        {interests.map((interest, index) => {
          const emoji = interestEmojis[interest.toLowerCase()] || '✨';
          const shared = isShared(interest);
          const sizeClass = sizeClasses[Math.min(Math.floor(index / 3), 2)];
          const isHovered = hoveredInterest === interest;
          const isExpanded = expandedInterest === interest;
          
          return (
            <button
              key={interest}
              className={`
                relative font-display rounded-full transition-all duration-300
                ${sizeClass}
                ${shared 
                  ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                  : 'bg-card border border-border hover:border-primary/30'
                }
                ${isHovered ? 'scale-110 shadow-warm' : 'shadow-soft'}
                ${isExpanded ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                animation: isHovered ? 'gentle-bounce 0.5s ease-in-out' : undefined
              }}
              onMouseEnter={() => setHoveredInterest(interest)}
              onMouseLeave={() => setHoveredInterest(null)}
              onClick={() => handleClick(interest)}
            >
              <span className="mr-1">{emoji}</span>
              {interest}
              
              {/* Shared indicator */}
              {shared && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-[8px]">✓</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded discovery panel */}
      {expandedInterest && (
        <div className="mt-4 p-4 bg-card rounded-organic-lg border border-border animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-medium">
              People who care about {expandedInterest}
            </span>
          </div>
          <div className="flex -space-x-2 mb-3">
            {['😊', '🎨', '💭', '✨', '🌿'].map((emoji, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm border-2 border-background"
              >
                {emoji}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-display border-2 border-background text-primary">
              +12
            </div>
          </div>
          <button className="text-sm text-primary font-display hover:underline">
            Explore {expandedInterest} community →
          </button>
        </div>
      )}
    </div>
  );
};

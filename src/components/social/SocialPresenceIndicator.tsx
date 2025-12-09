import { useState } from 'react';
import { Hand, MessageCircle, Palette, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PresenceStatus = 'active' | 'creating' | 'chatting' | 'away';

interface SocialPresenceIndicatorProps {
  name: string;
  avatar: string;
  status: PresenceStatus;
  location?: string;
  activityLevel?: 'high' | 'medium' | 'low';
  onWave?: () => void;
}

const statusConfig = {
  active: {
    label: 'Online',
    icon: null,
    pulseClass: 'presence-online',
    pulseSpeed: 'animate-pulse-soft',
  },
  creating: {
    label: 'Creating',
    icon: Palette,
    pulseClass: 'presence-active',
    pulseSpeed: 'animate-pulse',
  },
  chatting: {
    label: 'In conversation',
    icon: MessageCircle,
    pulseClass: 'presence-active',
    pulseSpeed: 'animate-pulse',
  },
  away: {
    label: 'Taking a break',
    icon: Moon,
    pulseClass: 'presence-away',
    pulseSpeed: '',
  },
};

export const SocialPresenceIndicator = ({
  name,
  avatar,
  status,
  location,
  activityLevel = 'medium',
  onWave,
}: SocialPresenceIndicatorProps) => {
  const [waved, setWaved] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleWave = () => {
    setWaved(true);
    onWave?.();
    setTimeout(() => setWaved(false), 3000);
  };

  // Pulse speed based on activity level
  const pulseAnimationDuration = {
    high: '1s',
    medium: '2s',
    low: '3s',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card rounded-organic-lg border border-border hover-lift transition-all duration-300">
      {/* Avatar with presence pulse */}
      <div className="relative">
        <div 
          className={`
            w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl
            ${config.pulseSpeed}
          `}
          style={{ 
            animationDuration: pulseAnimationDuration[activityLevel],
          }}
        >
          {avatar}
        </div>
        
        {/* Status indicator dot */}
        <div 
          className={`
            absolute bottom-0 right-0 w-4 h-4 rounded-full 
            border-2 border-background
            ${config.pulseClass}
            flex items-center justify-center
          `}
        >
          {StatusIcon && <StatusIcon className="w-2 h-2 text-background" />}
        </div>
      </div>

      {/* Name and status */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-medium text-sm truncate">{name}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          {StatusIcon && <StatusIcon className="w-3 h-3" />}
          <span className="text-xs">{config.label}</span>
          {location && (
            <>
              <span className="text-xs">·</span>
              <span className="text-xs truncate">{location}</span>
            </>
          )}
        </div>
      </div>

      {/* Wave button */}
      <Button
        variant="ghost"
        size="sm"
        className={`
          rounded-full h-8 w-8 p-0
          ${waved ? 'bg-warm/20 text-warm-foreground' : ''}
        `}
        onClick={handleWave}
        disabled={waved}
      >
        <Hand className={`w-4 h-4 ${waved ? 'animate-wiggle' : ''}`} />
      </Button>
    </div>
  );
};

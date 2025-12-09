import { useState, useEffect } from 'react';
import { Sparkles, MessageCircle, Palette, Users, Award } from 'lucide-react';

interface Activity {
  id: string;
  type: 'collaborating' | 'discussing' | 'endorsed' | 'joined';
  actor: string;
  actorAvatar: string;
  target: string;
  targetType: 'canvas' | 'thread' | 'space' | 'skill';
  timestamp: Date;
}

interface LiveActivityStreamProps {
  activities?: Activity[];
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'collaborating',
    actor: 'Alex',
    actorAvatar: '🎨',
    target: 'Travel Canvas',
    targetType: 'canvas',
    timestamp: new Date(),
  },
  {
    id: '2',
    type: 'discussing',
    actor: 'Sam',
    actorAvatar: '💭',
    target: 'sustainable fashion',
    targetType: 'thread',
    timestamp: new Date(),
  },
  {
    id: '3',
    type: 'endorsed',
    actor: 'Jordan',
    actorAvatar: '✨',
    target: "Casey's photography skills",
    targetType: 'skill',
    timestamp: new Date(),
  },
  {
    id: '4',
    type: 'joined',
    actor: 'Riley',
    actorAvatar: '🌿',
    target: 'Mindful Creators',
    targetType: 'space',
    timestamp: new Date(),
  },
  {
    id: '5',
    type: 'collaborating',
    actor: 'Morgan',
    actorAvatar: '☕',
    target: 'Recipe Collection',
    targetType: 'canvas',
    timestamp: new Date(),
  },
];

const activityIcons = {
  collaborating: Palette,
  discussing: MessageCircle,
  endorsed: Award,
  joined: Users,
};

const activityVerbs = {
  collaborating: 'is collaborating on',
  discussing: 'is discussing',
  endorsed: 'just endorsed',
  joined: 'joined',
};

const targetEmojis = {
  canvas: '🎨',
  thread: '💬',
  space: '🏠',
  skill: '⭐',
};

export const LiveActivityStream = ({ activities = mockActivities }: LiveActivityStreamProps) => {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>(activities.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate through activities like a live feed
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activities.length]);

  // Update visible activities based on current index
  useEffect(() => {
    const start = currentIndex;
    const newVisible = [];
    for (let i = 0; i < 3; i++) {
      newVisible.push(activities[(start + i) % activities.length]);
    }
    setVisibleActivities(newVisible);
  }, [currentIndex, activities]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-2 h-2 rounded-full presence-active" />
          <div className="absolute inset-0 w-2 h-2 rounded-full presence-active animate-ping opacity-50" />
        </div>
        <span className="font-display text-sm font-medium text-muted-foreground">
          Happening now
        </span>
      </div>

      <div className="space-y-3">
        {visibleActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          
          return (
            <button
              key={`${activity.id}-${index}`}
              className={`
                w-full flex items-center gap-3 p-3 
                bg-card hover:bg-card/80 rounded-organic-lg
                border border-border hover:border-primary/20
                transition-all duration-300 hover-lift
                text-left group
                ${index === 0 ? 'animate-slide-in-right' : ''}
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar with activity pulse */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                  {activity.actorAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
              </div>

              {/* Activity description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display">
                  <span className="font-semibold">{activity.actor}</span>
                  <span className="text-muted-foreground"> {activityVerbs[activity.type]} </span>
                  <span className="font-medium text-primary">{activity.target}</span>
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs">{targetEmojis[activity.targetType]}</span>
                  <span className="text-xs text-muted-foreground capitalize">{activity.targetType}</span>
                </div>
              </div>

              {/* Join prompt */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-primary font-display">Join →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Ambient indicator */}
      <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-display">
          {activities.length} friends active right now
        </span>
      </div>
    </div>
  );
};

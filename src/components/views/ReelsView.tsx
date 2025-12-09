import { useState } from 'react';
import { ReelCard } from '@/components/social/ReelCard';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const sampleReels = [
  {
    id: 1,
    author: 'Alex',
    authorEmoji: '🌿',
    mood: '☕',
    prompt: 'What\'s one thing that made you smile today?',
    replies: 12,
    timeLeft: '23h left',
    hoursRemaining: 23,
    isActive: true,
  },
  {
    id: 2,
    author: 'Jordan',
    authorEmoji: '🎨',
    mood: '✨',
    prompt: 'Working on a new project and need some creative input... What colors make you feel inspired?',
    replies: 8,
    timeLeft: '18h left',
    hoursRemaining: 18,
    isActive: true,
  },
  {
    id: 3,
    author: 'Sam',
    authorEmoji: '📚',
    mood: '🤔',
    prompt: 'What book changed the way you see the world?',
    replies: 24,
    timeLeft: '6h left',
    hoursRemaining: 6,
    isActive: false,
  },
  {
    id: 4,
    author: 'Riley',
    authorEmoji: '🌙',
    mood: '😊',
    prompt: 'Late night thoughts: why do we feel more creative after midnight?',
    replies: 15,
    timeLeft: '42h left',
    hoursRemaining: 42,
    isActive: true,
  },
  {
    id: 5,
    author: 'Casey',
    authorEmoji: '🎵',
    mood: '🎧',
    prompt: 'Drop a song that matches your current vibe. No explanations needed.',
    replies: 31,
    timeLeft: '3h left',
    hoursRemaining: 3,
    isActive: true,
  },
];

export const ReelsView = () => {
  const handleReply = (id: number) => {
    toast('Joining the conversation...', { icon: '💬' });
  };

  const handleReact = (id: number, reaction: string) => {
    toast(`You reacted with ${reaction}`, { icon: '✨' });
  };

  return (
    <div className="px-4 max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center py-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold">Water Cooler</h1>
        <p className="text-muted-foreground text-sm mt-1">Quick conversations that disappear in 48h</p>
      </div>

      {/* Reels grid - organic placement */}
      <div className="space-y-5">
        {sampleReels.map((reel, index) => (
          <div
            key={reel.id}
            className="animate-fade-in-up"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              marginLeft: index % 3 === 0 ? '0' : index % 3 === 1 ? '8px' : '-4px',
            }}
          >
            <ReelCard
              {...reel}
              rotation={(index % 2 === 0 ? -1 : 1) * (0.5 + Math.random() * 0.5)}
              onReply={handleReply}
              onReact={handleReact}
            />
          </div>
        ))}
      </div>

      {/* Overheard section */}
      <div className="pt-8 animate-fade-in-up stagger-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-warm" />
          <h2 className="font-display font-semibold">Overheard</h2>
        </div>
        <div className="bg-warm/10 p-4 rounded-organic-lg border border-warm/20">
          <p className="text-sm italic text-muted-foreground font-handwritten text-lg">
            "The best conversations happen when you stop trying to be interesting and start being interested."
          </p>
          <span className="text-xs text-muted-foreground mt-2 block">— someone in the creative lounge</span>
        </div>
      </div>
    </div>
  );
};

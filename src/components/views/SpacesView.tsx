import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { SpaceDetailView } from './SpaceDetailView';

const sampleSpaces = [
  {
    id: 1,
    name: 'Creative Lounge',
    vibe: '🎨',
    activeCount: 8,
    mood: 'Energetic',
    moodColor: 'bg-primary/20',
    description: 'Where ideas come to play',
    ambientHint: '☕ Cafe sounds',
  },
  {
    id: 2,
    name: 'Quiet Corner',
    vibe: '📚',
    activeCount: 4,
    mood: 'Calm',
    moodColor: 'bg-accent/20',
    description: 'Deep thoughts and book chats',
    ambientHint: '🌧️ Gentle rain',
  },
  {
    id: 3,
    name: "Maker's Workshop",
    vibe: '🛠️',
    activeCount: 12,
    mood: 'Focused',
    moodColor: 'bg-secondary/20',
    description: 'Building things together',
    ambientHint: '🔇 Silent focus',
  },
  {
    id: 4,
    name: 'Night Owls',
    vibe: '🌙',
    activeCount: 6,
    mood: 'Cozy',
    moodColor: 'bg-warm/20',
    description: 'For late-night wanderers',
    ambientHint: '🔥 Fireplace crackle',
  },
];

export const SpacesView = () => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);

  if (selectedSpaceId !== null) {
    return (
      <SpaceDetailView
        spaceId={selectedSpaceId}
        onBack={() => setSelectedSpaceId(null)}
      />
    );
  }

  return (
    <div className="px-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold">Spaces</h1>
        <p className="text-muted-foreground text-sm mt-1">Find your corner of the internet</p>
      </div>

      {/* Space cards */}
      <div className="grid gap-4">
        {sampleSpaces.map((space, index) => (
          <article
            key={space.id}
            onClick={() => setSelectedSpaceId(space.id)}
            className={`${space.moodColor} p-5 rounded-organic-lg hover-lift cursor-pointer animate-fade-in-up border border-transparent hover:border-primary/20`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{space.vibe}</span>
                <div>
                  <h3 className="font-display font-semibold text-lg">{space.name}</h3>
                  <p className="text-sm text-muted-foreground">{space.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-2 h-2 rounded-full presence-online" />
                  <span>{space.activeCount} here</span>
                </div>
                <span className="text-xs text-muted-foreground">{space.mood}</span>
              </div>
            </div>

            {/* Floating avatars preview */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                {['😊', '🌟', '🎨', '☕'].slice(0, space.activeCount > 4 ? 4 : space.activeCount).map((emoji, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-card/60 flex items-center justify-center text-sm shadow-soft -ml-2 first:ml-0"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {emoji}
                  </div>
                ))}
                {space.activeCount > 4 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    +{space.activeCount - 4} more
                  </span>
                )}
              </div>
              
              {/* Ambient sound hint */}
              <span className="text-xs text-muted-foreground">{space.ambientHint}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Ambient sounds hint */}
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground animate-fade-in-up stagger-5">
        <Volume2 className="w-4 h-4" />
        <span>Each space has its own ambient sounds</span>
      </div>
    </div>
  );
};

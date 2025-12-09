import { useState, useEffect } from 'react';

const allInterests = [
  { id: 'art', label: '🎨 Art', color: 'bg-primary/20' },
  { id: 'music', label: '🎵 Music', color: 'bg-accent/20' },
  { id: 'books', label: '📚 Books', color: 'bg-secondary/20' },
  { id: 'tech', label: '💻 Tech', color: 'bg-warm/20' },
  { id: 'food', label: '🍳 Food', color: 'bg-primary/20' },
  { id: 'travel', label: '✈️ Travel', color: 'bg-accent/20' },
  { id: 'fitness', label: '💪 Fitness', color: 'bg-secondary/20' },
  { id: 'gaming', label: '🎮 Gaming', color: 'bg-warm/20' },
  { id: 'movies', label: '🎬 Movies', color: 'bg-primary/20' },
  { id: 'nature', label: '🌿 Nature', color: 'bg-secondary/20' },
  { id: 'photography', label: '📸 Photography', color: 'bg-accent/20' },
  { id: 'writing', label: '✍️ Writing', color: 'bg-warm/20' },
  { id: 'mindfulness', label: '🧘 Mindfulness', color: 'bg-secondary/20' },
  { id: 'podcasts', label: '🎙️ Podcasts', color: 'bg-primary/20' },
  { id: 'crafts', label: '🧶 Crafts', color: 'bg-accent/20' },
];

interface InterestPickerProps {
  selected: string[];
  onToggle: (interest: string) => void;
}

export const InterestPicker = ({ selected, onToggle }: InterestPickerProps) => {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Generate organic positions for interests
    const newPositions = allInterests.map((_, i) => ({
      x: Math.sin(i * 0.8) * 15 + (i % 3) * 5,
      y: Math.cos(i * 0.6) * 8,
    }));
    setPositions(newPositions);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
          What lights you up?
        </h2>
        <p className="text-muted-foreground">Pick a few interests (they'll help us connect you)</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 py-4">
        {allInterests.map((interest, index) => {
          const isSelected = selected.includes(interest.id);
          const pos = positions[index] || { x: 0, y: 0 };
          
          return (
            <button
              key={interest.id}
              onClick={() => onToggle(interest.id)}
              className={`
                px-4 py-2.5 rounded-full font-display text-sm font-medium
                transition-all duration-300 animate-fade-in-up
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-warm scale-105' 
                  : `${interest.color} hover:scale-105`
                }
              `}
              style={{
                animationDelay: `${index * 0.05}s`,
                transform: `translate(${pos.x}px, ${pos.y}px) ${isSelected ? 'scale(1.05)' : 'scale(1)'}`,
              }}
            >
              {interest.label}
              {isSelected && (
                <span className="ml-1.5 inline-block animate-scale-in">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-center text-sm text-muted-foreground animate-fade-in-up">
          {selected.length} {selected.length === 1 ? 'interest' : 'interests'} selected
        </p>
      )}
    </div>
  );
};

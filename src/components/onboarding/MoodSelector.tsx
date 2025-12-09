import { useState } from 'react';

const moods = [
  { id: 'connect', emoji: '🤝', label: 'Connect', description: 'Meet kindred spirits' },
  { id: 'learn', emoji: '📚', label: 'Learn', description: 'Discover new ideas' },
  { id: 'create', emoji: '🎨', label: 'Create', description: 'Build something together' },
  { id: 'chill', emoji: '☕', label: 'Chill', description: 'Just hang out' },
];

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  selected?: string;
}

export const MoodSelector = ({ onSelect, selected }: MoodSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
          What brings you here today?
        </h2>
        <p className="text-muted-foreground">Pick your vibe for today</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {moods.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={`
              p-6 rounded-organic-lg text-left transition-all duration-300 hover-lift
              animate-fade-in-up
              ${selected === mood.id 
                ? 'bg-primary/10 border-2 border-primary shadow-warm' 
                : 'bg-card border-2 border-transparent shadow-soft hover:border-primary/30'
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-4xl mb-3 block">{mood.emoji}</span>
            <h3 className="font-display font-semibold text-lg">{mood.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{mood.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

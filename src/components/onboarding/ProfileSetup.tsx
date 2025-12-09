import { useState } from 'react';
import { Input } from '@/components/ui/input';

const avatarEmojis = ['😊', '🌟', '🎨', '🌿', '☕', '🎵', '📚', '✨', '🦋', '🌙'];

interface ProfileSetupProps {
  name: string;
  onNameChange: (name: string) => void;
  avatar: string;
  onAvatarChange: (avatar: string) => void;
}

export const ProfileSetup = ({ name, onNameChange, avatar, onAvatarChange }: ProfileSetupProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
          How do friends describe you?
        </h2>
        <p className="text-muted-foreground">Pick a name that feels like you</p>
      </div>

      {/* Avatar picker */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl shadow-soft animate-scale-in">
          {avatar || '😊'}
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {avatarEmojis.map((emoji, index) => (
            <button
              key={emoji}
              onClick={() => onAvatarChange(emoji)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-xl
                transition-all duration-200 animate-fade-in-up
                ${avatar === emoji 
                  ? 'bg-primary/20 ring-2 ring-primary scale-110' 
                  : 'bg-card hover:bg-muted hover:scale-110'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div className="max-w-sm mx-auto animate-fade-in-up stagger-3">
        <Input
          type="text"
          placeholder="What should we call you?"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-center text-lg py-6 rounded-organic-lg border-2 border-muted focus:border-primary bg-card/50"
          maxLength={20}
        />
        <p className="text-center text-sm text-muted-foreground mt-2">
          This is how you'll appear to others
        </p>
      </div>
    </div>
  );
};

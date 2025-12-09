import { useState } from 'react';
import { Hand, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterestCloud } from './InterestCloud';
import { SkillGarden } from './SkillGarden';
import { MoodTimeline } from './MoodTimeline';

interface Collaboration {
  id: string;
  title: string;
  collaborator: string;
  collaboratorAvatar: string;
  type: 'canvas' | 'thread' | 'space';
}

interface StoryProfileProps {
  firstName: string;
  avatar: string;
  currentMood: string;
  moodHistory: { day: string; mood: string; color: string }[];
  interests: string[];
  skills: { name: string; endorsers: { name: string; avatar: string; context: string }[] }[];
  recentCollaborations: Collaboration[];
  viewerInterests?: string[];
}

const moodColors: Record<string, string> = {
  '😊': 'bg-warm',
  '☕': 'bg-primary/20',
  '🎨': 'bg-accent',
  '💭': 'bg-secondary/30',
  '✨': 'bg-warm/80',
  '🌿': 'bg-secondary',
  '🔥': 'bg-primary',
  '💪': 'bg-accent/80',
  '😴': 'bg-muted',
  '🎵': 'bg-primary/40',
};

const collaborationIcons: Record<string, string> = {
  canvas: '🎨',
  thread: '💬',
  space: '🏠',
};

export const StoryProfile = ({
  firstName,
  avatar,
  currentMood,
  moodHistory,
  interests,
  skills,
  recentCollaborations,
  viewerInterests = [],
}: StoryProfileProps) => {
  const [waved, setWaved] = useState(false);
  
  const commonInterests = interests.filter(i => viewerInterests.includes(i));

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">
      {/* Header with mood-colored avatar */}
      <div className="text-center pt-4">
        <div 
          className={`w-32 h-32 mx-auto rounded-full ${moodColors[currentMood] || 'bg-primary/10'} 
            flex items-center justify-center text-7xl shadow-warm transition-all duration-500
            animate-pulse-soft`}
        >
          {avatar}
        </div>
        <h1 className="font-display text-2xl font-bold mt-4">{firstName}</h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
          <span className="text-2xl">{currentMood}</span>
          <span className="text-sm font-display">right now</span>
        </div>
      </div>

      {/* Mood Timeline - 7 day visual */}
      <MoodTimeline moodHistory={moodHistory} />

      {/* Common Ground - highlighted shared interests */}
      {commonInterests.length > 0 && (
        <div className="bg-secondary/10 p-4 rounded-organic-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="font-display text-sm font-medium text-secondary">Common ground</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map(interest => (
              <span 
                key={interest}
                className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-display"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Together Section - Recent Collaborations (not posts!) */}
      <div className="animate-fade-in-up stagger-1">
        <h2 className="font-display font-semibold mb-3 text-sm text-muted-foreground">Together lately</h2>
        <div className="space-y-3">
          {recentCollaborations.slice(0, 3).map((collab) => (
            <div 
              key={collab.id}
              className="flex items-center gap-3 p-3 bg-card rounded-organic hover-lift cursor-pointer"
            >
              <span className="text-xl">{collaborationIcons[collab.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-medium truncate">{collab.title}</p>
                <p className="text-xs text-muted-foreground">with {collab.collaborator}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">
                {collab.collaboratorAvatar}
              </div>
            </div>
          ))}
          {recentCollaborations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collaborations yet—every story starts somewhere ✨
            </p>
          )}
        </div>
      </div>

      {/* Interest Cloud */}
      <div className="animate-fade-in-up stagger-2">
        <h2 className="font-display font-semibold mb-3 text-sm text-muted-foreground">Lights me up</h2>
        <InterestCloud interests={interests} viewerInterests={viewerInterests} />
      </div>

      {/* Skill Garden */}
      <div className="animate-fade-in-up stagger-3">
        <h2 className="font-display font-semibold mb-3 text-sm text-muted-foreground">Growing skills</h2>
        <SkillGarden skills={skills} />
      </div>

      {/* Wave Button */}
      <div className="flex justify-center pt-4 animate-fade-in-up stagger-4">
        <Button 
          variant={waved ? "secondary" : "outline"}
          className="rounded-organic-lg font-display gap-2 transition-all duration-300"
          onClick={() => setWaved(true)}
          disabled={waved}
        >
          <Hand className={`w-4 h-4 ${waved ? 'animate-wiggle' : ''}`} />
          {waved ? "Wave sent! 👋" : "Wave hello 👋"}
        </Button>
      </div>
    </div>
  );
};

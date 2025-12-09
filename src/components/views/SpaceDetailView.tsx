import { useState } from 'react';
import { SpaceRoom } from '@/components/social/SpaceRoom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SpaceDetailViewProps {
  spaceId: number;
  onBack: () => void;
}

const spacesData: Record<number, {
  name: string;
  vibe: string;
  mood: 'energetic' | 'calm' | 'focused' | 'cozy';
  ambientSound: 'cafe' | 'fireplace' | 'rain' | 'none';
  members: { id: string; name: string; emoji: string; x: number; y: number }[];
  conversationCircles: { id: string; x: number; y: number; topic: string; members: string[] }[];
}> = {
  1: {
    name: 'Creative Lounge',
    vibe: '🎨',
    mood: 'energetic',
    ambientSound: 'cafe',
    members: [
      { id: '1', name: 'Alex', emoji: '🌿', x: 25, y: 30 },
      { id: '2', name: 'Jordan', emoji: '🎨', x: 70, y: 25 },
      { id: '3', name: 'Sam', emoji: '📚', x: 30, y: 60 },
      { id: '4', name: 'Riley', emoji: '🌙', x: 65, y: 55 },
    ],
    conversationCircles: [
      { id: 'c1', x: 30, y: 45, topic: 'Design ideas', members: ['Alex', 'Sam'] },
      { id: 'c2', x: 70, y: 40, topic: 'Color theory', members: ['Jordan', 'Riley'] },
    ],
  },
  2: {
    name: 'Quiet Corner',
    vibe: '📚',
    mood: 'calm',
    ambientSound: 'rain',
    members: [
      { id: '5', name: 'Nova', emoji: '⭐', x: 20, y: 35 },
      { id: '6', name: 'River', emoji: '🌊', x: 75, y: 50 },
    ],
    conversationCircles: [
      { id: 'c3', x: 50, y: 40, topic: 'Book recommendations', members: ['Nova', 'River'] },
    ],
  },
  3: {
    name: "Maker's Workshop",
    vibe: '🛠️',
    mood: 'focused',
    ambientSound: 'none',
    members: [
      { id: '7', name: 'Casey', emoji: '🎵', x: 20, y: 25 },
      { id: '8', name: 'Maya', emoji: '🌸', x: 45, y: 35 },
      { id: '9', name: 'Leo', emoji: '🦁', x: 70, y: 30 },
      { id: '10', name: 'Sage', emoji: '🌿', x: 35, y: 60 },
      { id: '11', name: 'Phoenix', emoji: '🔥', x: 60, y: 55 },
    ],
    conversationCircles: [
      { id: 'c4', x: 35, y: 40, topic: 'Project collab', members: ['Casey', 'Maya', 'Sage'] },
      { id: 'c5', x: 65, y: 45, topic: 'Code review', members: ['Leo', 'Phoenix'] },
    ],
  },
  4: {
    name: 'Night Owls',
    vibe: '🌙',
    mood: 'cozy',
    ambientSound: 'fireplace',
    members: [
      { id: '12', name: 'Luna', emoji: '🌙', x: 30, y: 40 },
      { id: '13', name: 'Star', emoji: '⭐', x: 55, y: 35 },
      { id: '14', name: 'Ash', emoji: '🔥', x: 70, y: 55 },
    ],
    conversationCircles: [
      { id: 'c6', x: 45, y: 45, topic: 'Late night thoughts', members: ['Luna', 'Star', 'Ash'] },
    ],
  },
};

export const SpaceDetailView = ({ spaceId, onBack }: SpaceDetailViewProps) => {
  const space = spacesData[spaceId] || spacesData[1];

  const handleJoinCircle = (circleId: string) => {
    const circle = space.conversationCircles.find(c => c.id === circleId);
    toast(`Joining "${circle?.topic}" discussion...`, { icon: '💬' });
  };

  const handleSendMessage = (message: string) => {
    toast(`You said: "${message}"`, { icon: '💭' });
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="px-4 py-4 animate-fade-in-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">All spaces</span>
        </button>
      </div>
      <div className="flex-1 mx-4 mb-4 bg-card rounded-organic-lg overflow-hidden shadow-soft animate-scale-in">
        <SpaceRoom
          {...space}
          onJoinCircle={handleJoinCircle}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

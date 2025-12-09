import { StoryProfile } from '@/components/social/StoryProfile';
import { LiveActivityStream } from '@/components/social/LiveActivityStream';
import { SocialPresenceIndicator } from '@/components/social/SocialPresenceIndicator';
import { SerendipityButton } from '@/components/social/SerendipityButton';

// Mock data for demonstration
const mockMoodHistory = [
  { day: 'Mon', mood: '☕', color: 'cozy' },
  { day: 'Tue', mood: '🎨', color: 'creative' },
  { day: 'Wed', mood: '💭', color: 'thoughtful' },
  { day: 'Thu', mood: '✨', color: 'energetic' },
  { day: 'Fri', mood: '🌿', color: 'calm' },
  { day: 'Sat', mood: '😊', color: 'happy' },
  { day: 'Sun', mood: '🔥', color: 'energetic' },
];

const mockSkills = [
  {
    name: 'UI Design',
    endorsers: [
      { name: 'Jordan', avatar: '🎨', context: 'Loved your work on the Travel Canvas' },
      { name: 'Sam', avatar: '💭', context: 'Great eye for details!' },
      { name: 'Alex', avatar: '✨', context: 'The best collaborator' },
    ],
  },
  {
    name: 'Photography',
    endorsers: [
      { name: 'Casey', avatar: '📸', context: 'Amazing compositions' },
    ],
  },
  {
    name: 'Sustainable Living',
    endorsers: [],
  },
];

const mockCollaborations = [
  {
    id: '1',
    title: 'Summer Road Trip Planning',
    collaborator: 'Jordan',
    collaboratorAvatar: '🎨',
    type: 'canvas' as const,
  },
  {
    id: '2',
    title: 'Best coffee spots in town',
    collaborator: 'Sam',
    collaboratorAvatar: '☕',
    type: 'thread' as const,
  },
  {
    id: '3',
    title: 'Mindful Creators',
    collaborator: 'Alex',
    collaboratorAvatar: '🌿',
    type: 'space' as const,
  },
];

const mockFriends = [
  { name: 'Jordan', avatar: '🎨', status: 'creating' as const, location: 'Travel Canvas' },
  { name: 'Sam', avatar: '☕', status: 'chatting' as const, location: 'Coffee Lovers Space' },
  { name: 'Alex', avatar: '🌿', status: 'active' as const },
  { name: 'Casey', avatar: '📸', status: 'away' as const },
];

interface SocialDiscoveryViewProps {
  userInterests?: string[];
}

export const SocialDiscoveryView = ({ userInterests = ['art', 'travel', 'sustainability'] }: SocialDiscoveryViewProps) => {
  return (
    <div className="px-4 pb-24 max-w-lg mx-auto space-y-8">
      {/* Section: Who's here now */}
      <section className="animate-fade-in-up">
        <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4">
          Your people
        </h2>
        <div className="space-y-2">
          {mockFriends.map((friend) => (
            <SocialPresenceIndicator
              key={friend.name}
              name={friend.name}
              avatar={friend.avatar}
              status={friend.status}
              location={friend.location}
              activityLevel={friend.status === 'creating' ? 'high' : friend.status === 'chatting' ? 'medium' : 'low'}
            />
          ))}
        </div>
      </section>

      {/* Section: Happening now */}
      <section className="animate-fade-in-up stagger-1">
        <LiveActivityStream />
      </section>

      {/* Section: Find something unexpected */}
      <section className="animate-fade-in-up stagger-2">
        <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4">
          Serendipity
        </h2>
        <SerendipityButton />
      </section>

      {/* Section: Profile Preview */}
      <section className="animate-fade-in-up stagger-3 pt-8 border-t border-border">
        <h2 className="font-display font-semibold text-sm text-muted-foreground mb-4">
          How others see you
        </h2>
        <StoryProfile
          firstName="You"
          avatar="✨"
          currentMood="☕"
          moodHistory={mockMoodHistory}
          interests={['art', 'photography', 'travel', 'sustainability', 'coffee']}
          skills={mockSkills}
          recentCollaborations={mockCollaborations}
          viewerInterests={userInterests}
        />
      </section>
    </div>
  );
};

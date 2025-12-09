import { Settings, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileViewProps {
  name: string;
  avatar: string;
  interests: string[];
}

const interestLabels: Record<string, string> = {
  art: '🎨 Art',
  music: '🎵 Music',
  books: '📚 Books',
  tech: '💻 Tech',
  food: '🍳 Food',
  travel: '✈️ Travel',
  fitness: '💪 Fitness',
  gaming: '🎮 Gaming',
  movies: '🎬 Movies',
  nature: '🌿 Nature',
  photography: '📸 Photography',
  writing: '✍️ Writing',
  mindfulness: '🧘 Mindfulness',
  podcasts: '🎙️ Podcasts',
  crafts: '🧶 Crafts',
};

export const ProfileView = ({ name, avatar, interests }: ProfileViewProps) => {
  return (
    <div className="px-4 max-w-md mx-auto space-y-8">
      {/* Header with settings */}
      <div className="flex justify-end pt-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Avatar and name */}
      <div className="text-center animate-fade-in-up">
        <div className="w-28 h-28 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-6xl shadow-soft mb-4">
          {avatar}
        </div>
        <h1 className="font-display text-2xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Feeling creative today ✨</p>
      </div>

      {/* Current mood */}
      <div className="bg-warm/10 p-4 rounded-organic-lg text-center animate-fade-in-up stagger-1">
        <span className="text-3xl block mb-2">☕</span>
        <span className="text-sm text-muted-foreground">Current mood</span>
      </div>

      {/* Interests cloud */}
      <div className="animate-fade-in-up stagger-2">
        <h2 className="font-display font-semibold mb-3 text-center">Lights me up</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {interests.map((interest, index) => (
            <span
              key={interest}
              className="px-3 py-1.5 bg-card rounded-full text-sm font-display shadow-soft"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {interestLabels[interest] || interest}
            </span>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="animate-fade-in-up stagger-3">
        <h2 className="font-display font-semibold mb-3">Recent conversations</h2>
        <div className="space-y-3">
          <div className="bg-card/50 p-4 rounded-organic text-sm text-muted-foreground">
            <p>You haven't started any conversations yet.</p>
            <p className="mt-2 text-primary font-display font-medium">Start one now →</p>
          </div>
        </div>
      </div>

      {/* Wave button instead of follow */}
      <div className="flex justify-center pt-4 animate-fade-in-up stagger-4">
        <Button 
          variant="outline" 
          className="rounded-organic-lg font-display gap-2"
        >
          <Hand className="w-4 h-4" />
          Wave to someone 👋
        </Button>
      </div>
    </div>
  );
};

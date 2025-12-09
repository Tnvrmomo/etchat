import { useState } from 'react';
import { ReelCard } from '@/components/social/ReelCard';
import { Sparkles, Upload, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MediaImporter, ImportIntent } from '@/components/media/MediaImporter';
import { MediaEnhancementStudio, EnhancedMedia } from '@/components/media/MediaEnhancementStudio';
import { ContentTransformer } from '@/components/media/ContentTransformer';
import { CollaborativeCanvas } from '@/components/media/CollaborativeCanvas';

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

// Sample collaborative canvas data
const sampleCanvasData = {
  imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
  title: 'Mountain Sunrise Planning',
  author: { name: 'Taylor', emoji: '🏔️' },
  hotspots: [
    { id: '1', x: 30, y: 40, label: 'Best time to visit?', comments: 5 },
    { id: '2', x: 70, y: 60, label: 'Camera settings?', comments: 3 },
  ],
  ideas: [
    { id: '1', content: 'We should try the north trail!', author: 'Maya', authorEmoji: '🥾', x: 15, y: 20, likes: 4 },
    { id: '2', content: 'Golden hour starts at 5:30am here', author: 'Alex', authorEmoji: '📸', x: 85, y: 30, likes: 7 },
  ],
};

export const ReelsView = () => {
  const [showImporter, setShowImporter] = useState(false);
  const [showEnhancementStudio, setShowEnhancementStudio] = useState(false);
  const [showTransformer, setShowTransformer] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<ImportIntent | null>(null);
  const [showCollaborativeCanvas, setShowCollaborativeCanvas] = useState(false);

  const handleReply = (id: number) => {
    toast('Joining the conversation...', { icon: '💬' });
  };

  const handleReact = (id: number, reaction: string) => {
    toast(`You reacted with ${reaction}`, { icon: '✨' });
  };

  const handleMediaImport = (file: File, intent: ImportIntent) => {
    setImportedFile(file);
    setSelectedIntent(intent);
    setShowImporter(false);
    setShowEnhancementStudio(true);
  };

  const handlePublishEnhancedMedia = (data: EnhancedMedia) => {
    console.log('Publishing enhanced media:', data);
    setShowEnhancementStudio(false);
    setImportedFile(null);
    setSelectedIntent(null);
    
    // Show the collaborative canvas as a demo
    setShowCollaborativeCanvas(true);
  };

  return (
    <div className="px-4 max-w-2xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="text-center py-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold">Water Cooler</h1>
        <p className="text-muted-foreground text-sm mt-1">Quick conversations that disappear in 48h</p>
      </div>

      {/* Content Bridge CTA */}
      <div className="bg-gradient-to-br from-primary/10 via-warm/10 to-secondary/10 rounded-organic-xl p-5 border border-primary/20 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-organic">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold">Got content to share?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Turn your photos & videos into real conversations, not just likes.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                size="sm" 
                onClick={() => setShowImporter(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Share & Start Conversation
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowTransformer(true)}
                className="gap-2"
              >
                See the difference
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Collaborative Canvas */}
      {showCollaborativeCanvas && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warm" />
              <span className="font-display font-semibold text-sm">Your New Canvas</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCollaborativeCanvas(false)}
            >
              Minimize
            </Button>
          </div>
          <CollaborativeCanvas {...sampleCanvasData} />
        </div>
      )}

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

      {/* Media Importer Modal */}
      <MediaImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImport={handleMediaImport}
      />

      {/* Enhancement Studio Modal */}
      <MediaEnhancementStudio
        isOpen={showEnhancementStudio}
        onClose={() => {
          setShowEnhancementStudio(false);
          setImportedFile(null);
          setSelectedIntent(null);
        }}
        file={importedFile}
        intent={selectedIntent}
        onPublish={handlePublishEnhancedMedia}
      />

      {/* Content Transformer Demo Modal */}
      <ContentTransformer
        isOpen={showTransformer}
        onClose={() => setShowTransformer(false)}
      />
    </div>
  );
};

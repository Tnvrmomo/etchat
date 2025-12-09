import { useState } from 'react';
import { ArrowRight, Image, MessageSquare, Users, Sparkles, Heart, ThumbsUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentTransformerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransformExample {
  id: string;
  originalType: string;
  originalIcon: string;
  originalEngagement: { likes: number; comments: number };
  transformedType: string;
  transformedIcon: typeof MessageSquare;
  transformedEngagement: { collaborators: number; ongoing: boolean; endorsements: number };
  description: string;
}

const transformExamples: TransformExample[] = [
  {
    id: '1',
    originalType: 'Food photo',
    originalIcon: '🍕',
    originalEngagement: { likes: 24, comments: 3 },
    transformedType: 'Recipe Swap Canvas',
    transformedIcon: Image,
    transformedEngagement: { collaborators: 8, ongoing: true, endorsements: 3 },
    description: 'Showing off → Collaboration',
  },
  {
    id: '2',
    originalType: 'Travel video',
    originalIcon: '✈️',
    originalEngagement: { likes: 156, comments: 12 },
    transformedType: 'Trip Planning Thread',
    transformedIcon: MessageSquare,
    transformedEngagement: { collaborators: 15, ongoing: true, endorsements: 5 },
    description: 'Envy → Shared planning',
  },
  {
    id: '3',
    originalType: 'DIY project',
    originalIcon: '🔨',
    originalEngagement: { likes: 89, comments: 7 },
    transformedType: 'Build Together Canvas',
    transformedIcon: Users,
    transformedEngagement: { collaborators: 12, ongoing: true, endorsements: 8 },
    description: 'Admiration → Participation',
  },
];

export const ContentTransformer = ({ isOpen, onClose }: ContentTransformerProps) => {
  const [activeExample, setActiveExample] = useState(0);

  if (!isOpen) return null;

  const example = transformExamples[activeExample];

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-card rounded-organic-xl shadow-warm max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border text-center">
          <div className="inline-flex items-center gap-2 bg-warm/20 text-warm-foreground px-3 py-1 rounded-full text-sm mb-3">
            <Sparkles className="w-4 h-4" />
            Your Content, Amplified
          </div>
          <h2 className="font-display text-2xl font-bold">See the Transformation</h2>
          <p className="text-muted-foreground mt-2">
            Same content, deeper connections
          </p>
        </div>

        <div className="p-6">
          {/* Example selector */}
          <div className="flex gap-2 mb-8 justify-center">
            {transformExamples.map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => setActiveExample(i)}
                className={`
                  px-4 py-2 rounded-full text-sm transition-all
                  ${activeExample === i 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                  }
                `}
              >
                {ex.originalIcon} {ex.originalType}
              </button>
            ))}
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left - Traditional platform */}
            <div className="p-6 rounded-organic-lg border border-border bg-muted/30">
              <div className="text-center mb-4">
                <span className="text-3xl">{example.originalIcon}</span>
                <h3 className="font-display font-semibold mt-2">{example.originalType}</h3>
                <p className="text-xs text-muted-foreground">on Instagram/TikTok</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    Likes
                  </span>
                  <span>{example.originalEngagement.likes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </span>
                  <span>{example.originalEngagement.comments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    Result
                  </span>
                  <span className="text-muted-foreground">Passive views</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center italic">
                  "Cool!" "Nice!" "🔥"
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 w-12">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            {/* Right - Reel */}
            <div className="p-6 rounded-organic-lg border-2 border-primary bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                Same photo →
              </div>
              
              <div className="text-center mb-4">
                <example.transformedIcon className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-display font-semibold mt-2">{example.transformedType}</h3>
                <p className="text-xs text-muted-foreground">on Reel</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Collaborators
                  </span>
                  <span className="text-secondary font-semibold">
                    {example.transformedEngagement.collaborators}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    Status
                  </span>
                  <span className="text-secondary font-semibold">
                    {example.transformedEngagement.ongoing ? 'Ongoing project' : 'Completed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ThumbsUp className="w-4 h-4" />
                    Skill endorsements
                  </span>
                  <span className="text-secondary font-semibold">
                    {example.transformedEngagement.endorsements}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-xs text-secondary text-center font-medium">
                  Real connections & active collaboration
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mt-6 p-4 bg-warm/10 rounded-organic-lg">
            <p className="font-handwritten text-xl text-foreground">
              {example.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            Got it
          </Button>
          <Button onClick={onClose}>
            Try it now
          </Button>
        </div>
      </div>
    </div>
  );
};

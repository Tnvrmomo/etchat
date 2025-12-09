import { useState } from 'react';
import { ThreadBubble } from '@/components/social/ThreadBubble';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

const sampleThreads = [
  {
    id: 1,
    author: 'Maya',
    authorEmoji: '🌸',
    content: 'I\'ve been thinking about how we measure success. Is it just about achievements, or is there more to it?',
    isActive: true,
    replies: [
      {
        id: 2,
        author: 'Leo',
        authorEmoji: '🦁',
        content: 'For me, it\'s about growth. Am I better than I was yesterday?',
        isActive: false,
        replies: [
          {
            id: 3,
            author: 'Sage',
            authorEmoji: '🌿',
            content: 'Love this perspective. Though I wonder if even "better" is too achievement-focused.',
            isActive: true,
            replies: [],
          },
        ],
      },
      {
        id: 4,
        author: 'Nova',
        authorEmoji: '⭐',
        content: 'I think it\'s about impact. Did I help someone today? Did I leave things a little better?',
        isActive: true,
        replies: [
          {
            id: 5,
            author: 'River',
            authorEmoji: '🌊',
            content: 'The ripple effect! One kind word can travel so far.',
            isActive: false,
            replies: [],
          },
        ],
      },
    ],
  },
];

const relatedTangents = [
  { id: 1, topic: 'What does "growth" mean to you?', replies: 14 },
  { id: 2, topic: 'Small wins vs big achievements', replies: 8 },
  { id: 3, topic: 'Redefining productivity', replies: 22 },
];

export const ThreadsView = () => {
  const [activeThread] = useState(sampleThreads[0]);

  const handleReply = (id: number) => {
    toast('Adding your thought...', { icon: '💭' });
  };

  const handleReact = (id: number, reaction: string) => {
    toast(`You added ${reaction}`, { icon: reaction });
  };

  return (
    <div className="px-4 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="py-6 animate-fade-in-up">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">All discussions</span>
        </button>
        <h1 className="font-display text-2xl font-bold">Deep Discussions</h1>
        <p className="text-muted-foreground text-sm mt-1">Thoughts that grow together</p>
      </div>

      {/* Thread visualization */}
      <div className="space-y-6 animate-fade-in-up stagger-1">
        <ThreadBubble
          {...activeThread}
          onReply={handleReply}
          onReact={handleReact}
        />
      </div>

      {/* Add to thread */}
      <div className="mt-8 animate-fade-in-up stagger-3">
        <div className="bg-card/60 backdrop-blur-sm rounded-organic-lg p-4 border border-border/50">
          <textarea
            placeholder="Add your perspective..."
            className="w-full bg-transparent resize-none focus:outline-none font-body"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-organic text-sm font-display hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Add thought
            </button>
          </div>
        </div>
      </div>

      {/* Related tangents */}
      <div className="mt-10 animate-fade-in-up stagger-4">
        <h2 className="font-display font-semibold text-lg mb-4">Related tangents</h2>
        <div className="space-y-3">
          {relatedTangents.map((tangent, index) => (
            <button
              key={tangent.id}
              className="w-full text-left p-4 bg-muted/30 hover:bg-muted/50 rounded-organic-lg transition-colors group"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <p className="font-body group-hover:text-primary transition-colors">{tangent.topic}</p>
              <span className="text-xs text-muted-foreground">{tangent.replies} thoughts</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

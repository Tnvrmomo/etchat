import { useState } from 'react';
import { CanvasBoard } from '@/components/social/CanvasBoard';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';

const sampleCanvasItems = [
  {
    id: 1,
    type: 'text' as const,
    content: 'What if we started with the user\'s emotional state?',
    x: 150,
    y: 120,
    color: 'hsl(9, 68%, 62%)',
    author: 'Alex',
    authorEmoji: '🌿',
  },
  {
    id: 2,
    type: 'text' as const,
    content: 'Love this direction! Maybe we could map out the journey first.',
    x: 380,
    y: 180,
    color: 'hsl(146, 50%, 36%)',
    author: 'Jordan',
    authorEmoji: '🎨',
  },
  {
    id: 3,
    type: 'image' as const,
    content: '📊',
    x: 280,
    y: 300,
    color: 'hsl(204, 35%, 58%)',
    author: 'Sam',
    authorEmoji: '📚',
  },
  {
    id: 4,
    type: 'link' as const,
    content: 'https://example.com/inspiration',
    x: 480,
    y: 350,
    color: 'hsl(45, 100%, 70%)',
    author: 'Riley',
    authorEmoji: '🌙',
  },
  {
    id: 5,
    type: 'text' as const,
    content: 'Key insight: simplicity wins over complexity every time',
    x: 200,
    y: 420,
    color: 'hsl(280, 50%, 60%)',
    author: 'Casey',
    authorEmoji: '🎵',
  },
];

const sampleCursors = [
  { id: '1', name: 'Alex', color: 'hsl(9, 68%, 62%)', x: 200, y: 150 },
  { id: '2', name: 'Jordan', color: 'hsl(146, 50%, 36%)', x: 400, y: 250 },
];

const canvasProjects = [
  {
    id: 1,
    title: 'Product Brainstorm',
    description: 'Reimagining the onboarding experience',
    collaborators: 5,
    active: true,
  },
  {
    id: 2,
    title: 'Weekly Mood Board',
    description: 'Inspirations and vibes for the week',
    collaborators: 8,
    active: false,
  },
  {
    id: 3,
    title: 'Book Club Notes',
    description: 'Collective thoughts on "Thinking, Fast and Slow"',
    collaborators: 3,
    active: false,
  },
];

export const CanvasView = () => {
  const [selectedCanvas, setSelectedCanvas] = useState<number | null>(null);

  const handleAddItem = (type: 'text' | 'image' | 'link', x: number, y: number) => {
    toast(`Added ${type} to the canvas ✨`, { icon: '📌' });
  };

  const handleMoveItem = (id: number, x: number, y: number) => {
    // Item moved - in real app would sync to backend
  };

  if (selectedCanvas !== null) {
    const canvas = canvasProjects.find(c => c.id === selectedCanvas);
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <div className="px-4 py-4 animate-fade-in-up">
          <button
            onClick={() => setSelectedCanvas(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">All canvases</span>
          </button>
        </div>
        <div className="flex-1 mx-4 mb-4 bg-card rounded-organic-lg overflow-hidden shadow-soft animate-scale-in">
          <CanvasBoard
            title={canvas?.title || ''}
            description={canvas?.description || ''}
            items={sampleCanvasItems}
            cursors={sampleCursors}
            onAddItem={handleAddItem}
            onMoveItem={handleMoveItem}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="text-center py-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold">Collaborative Canvases</h1>
        <p className="text-muted-foreground text-sm mt-1">Build ideas together</p>
      </div>

      {/* Canvas list */}
      <div className="space-y-4">
        {canvasProjects.map((canvas, index) => (
          <button
            key={canvas.id}
            onClick={() => setSelectedCanvas(canvas.id)}
            className={`
              w-full text-left p-5 rounded-organic-lg transition-all hover-lift
              ${canvas.active ? 'bg-primary/10 border-2 border-primary/30' : 'bg-card border-2 border-transparent'}
              animate-fade-in-up
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-lg">{canvas.title}</h3>
                  {canvas.active && (
                    <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full">
                      Active now
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{canvas.description}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{canvas.collaborators}</span>
              </div>
            </div>
            
            {/* Preview dots showing activity */}
            <div className="flex gap-1 mt-4">
              {[...Array(canvas.collaborators)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: [
                      'hsl(9, 68%, 62%)',
                      'hsl(146, 50%, 36%)',
                      'hsl(204, 35%, 58%)',
                      'hsl(45, 100%, 70%)',
                      'hsl(280, 50%, 60%)',
                    ][i % 5],
                  }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Create new canvas */}
      <button
        className="w-full mt-6 p-5 border-2 border-dashed border-border rounded-organic-lg text-muted-foreground hover:border-primary/50 hover:text-primary transition-all animate-fade-in-up stagger-4"
        onClick={() => toast('Starting new canvas...', { icon: '🎨' })}
      >
        <span className="font-display">+ Start a new canvas</span>
      </button>
    </div>
  );
};

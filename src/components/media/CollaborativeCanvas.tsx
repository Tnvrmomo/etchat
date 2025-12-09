import { useState, useEffect } from 'react';
import { MousePointer2, MessageCircle, Plus, Heart, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CollaborativeCanvasProps {
  imageUrl: string;
  title: string;
  author: {
    name: string;
    emoji: string;
  };
  hotspots?: Hotspot[];
  ideas?: CanvasIdea[];
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  comments: number;
}

interface CanvasIdea {
  id: string;
  content: string;
  author: string;
  authorEmoji: string;
  x: number;
  y: number;
  likes: number;
}

interface LiveCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

const sampleCursors: LiveCursor[] = [
  { id: '1', name: 'Maya', color: 'hsl(280, 50%, 60%)', x: 25, y: 35 },
  { id: '2', name: 'Alex', color: 'hsl(146, 50%, 45%)', x: 65, y: 55 },
  { id: '3', name: 'Jordan', color: 'hsl(204, 35%, 58%)', x: 45, y: 75 },
];

export const CollaborativeCanvas = ({
  imageUrl,
  title,
  author,
  hotspots = [],
  ideas: initialIdeas = [],
}: CollaborativeCanvasProps) => {
  const [ideas, setIdeas] = useState<CanvasIdea[]>(initialIdeas);
  const [liveCursors, setLiveCursors] = useState(sampleCursors);
  const [addingIdea, setAddingIdea] = useState(false);
  const [newIdeaPosition, setNewIdeaPosition] = useState<{ x: number; y: number } | null>(null);
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Simulate cursor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCursors(prev => 
        prev.map(cursor => ({
          ...cursor,
          x: Math.max(5, Math.min(95, cursor.x + (Math.random() - 0.5) * 8)),
          y: Math.max(5, Math.min(95, cursor.y + (Math.random() - 0.5) * 8)),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addingIdea) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewIdeaPosition({ x, y });
  };

  const submitIdea = () => {
    if (newIdeaPosition && newIdeaContent.trim()) {
      setIdeas(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: newIdeaContent.trim(),
          author: 'You',
          authorEmoji: '✨',
          x: newIdeaPosition.x,
          y: newIdeaPosition.y,
          likes: 0,
        },
      ]);
      setNewIdeaContent('');
      setNewIdeaPosition(null);
      setAddingIdea(false);
    }
  };

  return (
    <div className="bg-card rounded-organic-xl overflow-hidden shadow-soft">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              by {author.emoji} {author.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {liveCursors.map((cursor) => (
                <div
                  key={cursor.id}
                  className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: cursor.color, color: 'white' }}
                  title={cursor.name}
                >
                  {cursor.name[0]}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {liveCursors.length} collaborating
            </span>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div 
        className={`relative bg-muted/30 cursor-${addingIdea ? 'crosshair' : 'default'}`}
        onClick={handleCanvasClick}
      >
        {/* Original image - centerpiece */}
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full object-contain max-h-[400px]"
          />

          {/* Hotspots from the original creator */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className="absolute group cursor-pointer"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id);
              }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse-soft shadow-warm">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                {hotspot.comments > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-warm text-warm-foreground text-xs rounded-full flex items-center justify-center font-medium">
                    {hotspot.comments}
                  </span>
                )}
                
                {/* Expanded hotspot */}
                {activeHotspot === hotspot.id && (
                  <div className="absolute left-10 top-0 bg-card shadow-warm rounded-organic-lg p-3 min-w-[200px] z-10 animate-scale-in">
                    <p className="text-sm font-medium mb-2">{hotspot.label}</p>
                    <Input 
                      placeholder="Share your thoughts..."
                      className="text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live cursors */}
          {liveCursors.map((cursor) => (
            <div
              key={cursor.id}
              className="absolute pointer-events-none transition-all duration-1000 ease-out z-20"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
            >
              <MousePointer2 
                className="w-4 h-4 drop-shadow-md -translate-x-0.5 -translate-y-0.5" 
                style={{ color: cursor.color }}
                fill={cursor.color}
              />
              <span 
                className="absolute left-4 top-3 text-xs px-1.5 py-0.5 rounded text-white whitespace-nowrap"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </span>
            </div>
          ))}
        </div>

        {/* Ideas placed around the image */}
        {ideas.map((idea) => (
          <div
            key={idea.id}
            className="absolute bg-card shadow-soft rounded-organic p-3 max-w-[180px] border-l-3 border-secondary animate-scale-in"
            style={{ 
              left: `${idea.x}%`, 
              top: `${idea.y}%`,
              transform: 'translate(-50%, 0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm">{idea.content}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {idea.authorEmoji} {idea.author}
              </span>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-3 h-3" />
                {idea.likes}
              </button>
            </div>
          </div>
        ))}

        {/* New idea input */}
        {newIdeaPosition && (
          <div
            className="absolute bg-card shadow-warm rounded-organic-lg p-3 min-w-[220px] z-30 animate-scale-in"
            style={{ 
              left: `${newIdeaPosition.x}%`, 
              top: `${newIdeaPosition.y}%`,
              transform: 'translate(-50%, 0)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={newIdeaContent}
              onChange={(e) => setNewIdeaContent(e.target.value)}
              placeholder="Add your idea..."
              className="mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={submitIdea} className="flex-1">
                Add
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setNewIdeaPosition(null);
                  setAddingIdea(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {ideas.length + liveCursors.length} contributing
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {ideas.length} ideas
            </span>
          </div>
          <Button 
            variant={addingIdea ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setAddingIdea(!addingIdea)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {addingIdea ? 'Click to place idea' : 'Add your idea'}
          </Button>
        </div>
      </div>
    </div>
  );
};

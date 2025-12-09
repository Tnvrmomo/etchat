import { useState, useRef, useEffect } from 'react';
import { Plus, Type, Image, Link, GripVertical, MousePointer2 } from 'lucide-react';

interface CanvasItem {
  id: number;
  type: 'text' | 'image' | 'link';
  content: string;
  x: number;
  y: number;
  color: string;
  author: string;
  authorEmoji: string;
}

interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface CanvasBoardProps {
  title: string;
  description: string;
  items: CanvasItem[];
  cursors?: Cursor[];
  onAddItem?: (type: 'text' | 'image' | 'link', x: number, y: number) => void;
  onMoveItem?: (id: number, x: number, y: number) => void;
}

const userColors = [
  'hsl(9, 68%, 62%)',    // Primary clay
  'hsl(146, 50%, 36%)',  // Secondary moss
  'hsl(204, 35%, 58%)',  // Accent blue
  'hsl(45, 100%, 70%)',  // Warm yellow
  'hsl(280, 50%, 60%)',  // Purple
];

export const CanvasBoard = ({
  title,
  description,
  items: initialItems,
  cursors = [],
  onAddItem,
  onMoveItem,
}: CanvasBoardProps) => {
  const [items, setItems] = useState(initialItems);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addPosition, setAddPosition] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Simulate live cursors movement
  const [liveCursors, setLiveCursors] = useState(cursors);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCursors(prev => 
        prev.map(cursor => ({
          ...cursor,
          x: cursor.x + (Math.random() - 0.5) * 20,
          y: cursor.y + (Math.random() - 0.5) * 20,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBoardClick = (e: React.MouseEvent) => {
    if (draggingId) return;
    
    const rect = boardRef.current?.getBoundingClientRect();
    if (rect) {
      setAddPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowAddMenu(true);
    }
  };

  const handleAddItem = (type: 'text' | 'image' | 'link') => {
    const newItem: CanvasItem = {
      id: Date.now(),
      type,
      content: type === 'text' ? 'New thought...' : type === 'link' ? 'https://' : '🖼️',
      x: addPosition.x,
      y: addPosition.y,
      color: userColors[0],
      author: 'You',
      authorEmoji: '✨',
    };
    setItems([...items, newItem]);
    setShowAddMenu(false);
    onAddItem?.(type, addPosition.x, addPosition.y);
  };

  const handleDragStart = (id: number) => {
    setDraggingId(id);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingId || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setItems(items.map(item => 
      item.id === draggingId ? { ...item, x, y } : item
    ));
  };

  const handleDragEnd = () => {
    if (draggingId) {
      const item = items.find(i => i.id === draggingId);
      if (item) {
        onMoveItem?.(draggingId, item.x, item.y);
      }
    }
    setDraggingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {/* Active collaborators */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Active now:</span>
          <div className="flex -space-x-2">
            {liveCursors.map((cursor) => (
              <div
                key={cursor.id}
                className="w-6 h-6 rounded-full border-2 border-card flex items-center justify-center text-xs"
                style={{ backgroundColor: cursor.color }}
                title={cursor.name}
              >
                {cursor.name[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas board */}
      <div
        ref={boardRef}
        className="flex-1 relative bg-muted/30 overflow-hidden cursor-crosshair"
        onClick={handleBoardClick}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Canvas items */}
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              absolute p-3 bg-card rounded-organic shadow-soft
              transition-all duration-200 cursor-move
              ${draggingId === item.id ? 'scale-105 shadow-warm z-10' : ''}
              ${hoveredItem === item.id ? 'ring-2' : ''}
            `}
            style={{
              left: item.x,
              top: item.y,
              transform: 'translate(-50%, -50%)',
              boxShadow: hoveredItem === item.id ? `0 0 20px ${item.color}40` : undefined,
              borderLeft: `3px solid ${item.color}`,
            }}
            onMouseDown={() => handleDragStart(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                {item.type === 'text' && (
                  <p className="text-sm max-w-[200px]">{item.content}</p>
                )}
                {item.type === 'image' && (
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl">
                    {item.content}
                  </div>
                )}
                {item.type === 'link' && (
                  <a href="#" className="text-sm text-accent underline max-w-[200px] block truncate">
                    {item.content}
                  </a>
                )}
              </div>
            </div>
            
            {/* Author indicator on hover */}
            {hoveredItem === item.id && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card shadow-soft px-2 py-1 rounded-full text-xs whitespace-nowrap animate-scale-in">
                {item.authorEmoji} {item.author}
              </div>
            )}
          </div>
        ))}

        {/* Live cursors */}
        {liveCursors.map((cursor) => (
          <div
            key={cursor.id}
            className="absolute pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer2 
              className="w-5 h-5 drop-shadow-md" 
              style={{ color: cursor.color }}
              fill={cursor.color}
            />
            <span 
              className="absolute left-4 top-4 text-xs px-1.5 py-0.5 rounded-md text-card whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
            </span>
          </div>
        ))}

        {/* Add menu */}
        {showAddMenu && (
          <div
            className="absolute bg-card shadow-warm rounded-organic-lg p-2 flex gap-2 animate-scale-in z-20"
            style={{
              left: addPosition.x,
              top: addPosition.y,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAddItem('text')}
              className="p-3 hover:bg-muted rounded-organic transition-colors"
              title="Add text"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAddItem('image')}
              className="p-3 hover:bg-muted rounded-organic transition-colors"
              title="Add image"
            >
              <Image className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAddItem('link')}
              className="p-3 hover:bg-muted rounded-organic transition-colors"
              title="Add link"
            >
              <Link className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddMenu(false)}
              className="p-3 hover:bg-destructive/10 rounded-organic transition-colors text-muted-foreground"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

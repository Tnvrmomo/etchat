import { useState } from 'react';
import { Plus, MessageCircle, Sparkles, Palette, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateButtonProps {
  onAction: (type: 'thread' | 'reel' | 'canvas' | 'space') => void;
}

export const CreateButton = ({ onAction }: CreateButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'thread' as const, icon: MessageCircle, label: 'Start a chat', color: 'bg-primary' },
    { id: 'reel' as const, icon: Sparkles, label: 'Share a moment', color: 'bg-accent' },
    { id: 'canvas' as const, icon: Palette, label: 'Make together', color: 'bg-secondary' },
    { id: 'space' as const, icon: Users, label: 'Open space', color: 'bg-warm' },
  ];

  const handleAction = (type: 'thread' | 'reel' | 'canvas' | 'space') => {
    onAction(type);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
      {/* Action menu */}
      {isOpen && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col gap-3 animate-fade-in-up">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-organic-lg shadow-soft bg-card hover-lift whitespace-nowrap',
                  'animate-slide-in-right'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={cn('p-2 rounded-full', action.color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-warm flex items-center justify-center transition-all duration-300',
          isOpen 
            ? 'bg-muted rotate-45' 
            : 'bg-primary hover:scale-105'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Plus className="w-7 h-7 text-primary-foreground" />
        )}
      </button>
    </div>
  );
};

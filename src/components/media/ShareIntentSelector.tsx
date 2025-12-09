import { useState } from 'react';
import { Instagram, MessageSquare, Users, Palette, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareIntentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platforms: SharePlatform[]) => void;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: typeof Instagram;
  caption: string;
  purpose: string;
  color: string;
  isExternal?: boolean;
}

const platforms: SharePlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    caption: 'Show my finished work',
    purpose: 'Showcase & validation',
    color: 'hsl(340, 75%, 55%)',
    isExternal: true,
  },
  {
    id: 'reel-canvas',
    name: 'Reel Canvas',
    icon: Palette,
    caption: 'Get real feedback on this',
    purpose: 'Collaboration & iteration',
    color: 'hsl(var(--primary))',
  },
  {
    id: 'reel-thread',
    name: 'Reel Thread',
    icon: MessageSquare,
    caption: 'Share my process',
    purpose: 'Learning & teaching',
    color: 'hsl(var(--secondary))',
  },
  {
    id: 'reel-space',
    name: 'Reel Space',
    icon: Users,
    caption: 'Find collaborators',
    purpose: 'Team building',
    color: 'hsl(var(--accent))',
  },
];

export const ShareIntentSelector = ({ isOpen, onClose, onShare }: ShareIntentSelectorProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleShare = () => {
    const selected = platforms.filter(p => selectedPlatforms.includes(p.id));
    
    if (selected.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    onShare(selected);
    
    const reelPlatforms = selected.filter(p => !p.isExternal);
    const externalPlatforms = selected.filter(p => p.isExternal);

    if (reelPlatforms.length > 0 && externalPlatforms.length > 0) {
      toast.success(
        `Sharing to ${externalPlatforms.map(p => p.name).join(', ')} + starting conversation on Reel!`,
        { icon: '🎉' }
      );
    } else if (reelPlatforms.length > 0) {
      toast.success('Starting your conversation on Reel!', { icon: '💬' });
    } else {
      toast.info('Sharing externally. Come back to Reel to start a conversation!', { icon: '👋' });
    }

    onClose();
  };

  if (!isOpen) return null;

  const hasReelSelection = selectedPlatforms.some(id => 
    platforms.find(p => p.id === id && !p.isExternal)
  );

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fade-in-up">
      <div className="bg-card rounded-t-organic-xl md:rounded-organic-xl shadow-warm w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl font-bold">Cross-Post with Purpose</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Choose where to share and why
          </p>
        </div>

        <div className="p-6 space-y-3">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`
                w-full p-4 rounded-organic-lg border-2 text-left transition-all
                ${selectedPlatforms.includes(platform.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-organic"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <platform.icon 
                    className="w-5 h-5" 
                    style={{ color: platform.color }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{platform.name}</h3>
                    {platform.isExternal && (
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "{platform.caption}"
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    {platform.purpose}
                  </p>
                </div>
                {selectedPlatforms.includes(platform.id) && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Value proposition when Reel is selected */}
        {hasReelSelection && (
          <div className="px-6 pb-4 animate-fade-in-up">
            <div className="p-3 bg-secondary/10 rounded-organic-lg text-center">
              <p className="text-sm text-secondary font-medium">
                ✨ On Reel: Get real feedback, not just likes
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleShare} className="flex-1">
            Share ({selectedPlatforms.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

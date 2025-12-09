import { useState, useEffect } from 'react';
import { Lightbulb, MessageCircle, Plus, X, Sparkles, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ImportIntent } from './MediaImporter';

interface MediaEnhancementStudioProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  intent: ImportIntent | null;
  onPublish: (data: EnhancedMedia) => void;
}

export interface EnhancedMedia {
  file: File;
  intent: ImportIntent;
  prompts: string[];
  customPrompt: string;
  hotspots: Hotspot[];
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface SuggestedPrompt {
  id: string;
  text: string;
  category: string;
}

const getSuggestedPrompts = (intent: ImportIntent): SuggestedPrompt[] => {
  const prompts: Record<ImportIntent, SuggestedPrompt[]> = {
    feedback: [
      { id: '1', text: 'What would you change about this?', category: 'critique' },
      { id: '2', text: 'Does this evoke any emotion for you?', category: 'feeling' },
      { id: '3', text: 'What does this remind you of?', category: 'connection' },
      { id: '4', text: 'How would you improve the composition?', category: 'technical' },
    ],
    process: [
      { id: '1', text: 'What was your inspiration?', category: 'origin' },
      { id: '2', text: 'What tools did you use?', category: 'technical' },
      { id: '3', text: 'What was the hardest part?', category: 'challenge' },
      { id: '4', text: 'How long did this take?', category: 'effort' },
    ],
    collaborate: [
      { id: '1', text: 'Who wants to work on something similar?', category: 'team' },
      { id: '2', text: 'What skills would complement this?', category: 'skills' },
      { id: '3', text: 'Should we make a series together?', category: 'project' },
      { id: '4', text: 'What direction should we take this?', category: 'vision' },
    ],
  };
  return prompts[intent] || [];
};

export const MediaEnhancementStudio = ({ 
  isOpen, 
  onClose, 
  file, 
  intent, 
  onPublish 
}: MediaEnhancementStudioProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [addingHotspot, setAddingHotspot] = useState(false);
  const [newHotspotLabel, setNewHotspotLabel] = useState('');
  const [pendingHotspot, setPendingHotspot] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const suggestedPrompts = intent ? getSuggestedPrompts(intent) : [];

  const togglePrompt = (promptId: string) => {
    setSelectedPrompts(prev => 
      prev.includes(promptId) 
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addingHotspot) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPendingHotspot({ x, y });
  };

  const addHotspot = () => {
    if (pendingHotspot && newHotspotLabel.trim()) {
      setHotspots(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          x: pendingHotspot.x,
          y: pendingHotspot.y,
          label: newHotspotLabel.trim(),
        },
      ]);
      setPendingHotspot(null);
      setNewHotspotLabel('');
      setAddingHotspot(false);
    }
  };

  const removeHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
  };

  const handlePublish = () => {
    if (!file || !intent) return;

    const enhancedMedia: EnhancedMedia = {
      file,
      intent,
      prompts: selectedPrompts,
      customPrompt,
      hotspots,
    };

    onPublish(enhancedMedia);
    toast.success('Your conversation is live!', { icon: '🎉' });
    onClose();
  };

  const getIntentTitle = () => {
    switch (intent) {
      case 'feedback': return 'Creating a Collaborative Canvas';
      case 'process': return 'Starting a Process Thread';
      case 'collaborate': return 'Opening a Collaboration Space';
      default: return 'Enhance Your Content';
    }
  };

  if (!isOpen || !file || !intent) return null;

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-card rounded-organic-xl shadow-warm w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold">{getIntentTitle()}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Add conversation starters to your content
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(90vh-180px)]">
          {/* Left panel - Original content */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-border overflow-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                Your original
              </span>
            </div>
            
            <div 
              className={`relative rounded-organic-lg overflow-hidden bg-muted cursor-${addingHotspot ? 'crosshair' : 'default'}`}
              onClick={handleImageClick}
            >
              {previewUrl && (
                file.type.startsWith('video/') ? (
                  <video 
                    src={previewUrl} 
                    className="w-full object-contain"
                    controls
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Your content" 
                    className="w-full object-contain"
                  />
                )
              )}

              {/* Hotspots */}
              {hotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="absolute group"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse-soft cursor-pointer">
                      <MessageCircle className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 bg-card shadow-soft px-3 py-2 rounded-organic whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-medium">{hotspot.label}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHotspot(hotspot.id);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending hotspot */}
              {pendingHotspot && (
                <div
                  className="absolute"
                  style={{ left: `${pendingHotspot.x}%`, top: `${pendingHotspot.y}%` }}
                >
                  <div className="relative -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 bg-warm rounded-full flex items-center justify-center animate-gentle-bounce">
                      <Plus className="w-3 h-3 text-warm-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add hotspot controls */}
            <div className="mt-4 space-y-3">
              {!addingHotspot && !pendingHotspot && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingHotspot(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add "Ask me about" spot
                </Button>
              )}

              {addingHotspot && !pendingHotspot && (
                <p className="text-sm text-muted-foreground animate-gentle-bounce">
                  👆 Click on the image to place a conversation point
                </p>
              )}

              {pendingHotspot && (
                <div className="flex gap-2 animate-fade-in-up">
                  <Input
                    value={newHotspotLabel}
                    onChange={(e) => setNewHotspotLabel(e.target.value)}
                    placeholder="What should people ask about here?"
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={addHotspot} size="sm">Add</Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setPendingHotspot(null);
                      setAddingHotspot(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Conversation layer */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-warm" />
              <span className="font-display font-semibold">Conversation starters</span>
            </div>

            {/* Suggested prompts */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                People might ask about...
              </p>
              
              <div className="grid gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => togglePrompt(prompt.id)}
                    className={`
                      p-3 rounded-organic-lg border text-left transition-all
                      ${selectedPrompts.includes(prompt.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{prompt.text}</p>
                      {selectedPrompts.includes(prompt.id) && (
                        <span className="text-primary text-lg">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      #{prompt.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom prompt */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Or write your own invitation...
              </p>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="What conversation do you want to start?"
                className="min-h-[100px]"
              />
            </div>

            {/* Preview of engagement */}
            <div className="mt-6 p-4 bg-muted/50 rounded-organic-lg border border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Users className="w-4 h-4" />
                What you'll get instead of likes:
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-display font-bold text-lg text-primary">Real</p>
                  <p className="text-xs text-muted-foreground">feedback</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-secondary">Active</p>
                  <p className="text-xs text-muted-foreground">collaborators</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-accent">Quality</p>
                  <p className="text-xs text-muted-foreground">connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedPrompts.length} prompts selected • {hotspots.length} conversation points
            </p>
            <Button onClick={handlePublish} className="gap-2">
              <Send className="w-4 h-4" />
              Start the conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

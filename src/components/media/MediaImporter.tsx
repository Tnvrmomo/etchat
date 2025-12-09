import { useState } from 'react';
import { Upload, MessageSquare, Users, Palette, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MediaImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, intent: ImportIntent) => void;
}

export type ImportIntent = 'feedback' | 'process' | 'collaborate';

const importIntents = [
  {
    id: 'feedback' as ImportIntent,
    icon: MessageSquare,
    title: 'Get feedback',
    description: 'Turn your work into a collaborative canvas',
    color: 'hsl(var(--primary))',
    benefit: 'Get real suggestions, not just likes',
  },
  {
    id: 'process' as ImportIntent,
    icon: Palette,
    title: 'Share your process',
    description: 'Start a thread about how you made this',
    color: 'hsl(var(--secondary))',
    benefit: 'Inspire others with your journey',
  },
  {
    id: 'collaborate' as ImportIntent,
    icon: Users,
    title: 'Find collaborators',
    description: 'Create a Space around your idea',
    color: 'hsl(var(--accent))',
    benefit: 'Build something together',
  },
];

export const MediaImporter = ({ isOpen, onClose, onImport }: MediaImporterProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<ImportIntent | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please upload an image or video');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    if (selectedFile && selectedIntent) {
      onImport(selectedFile, selectedIntent);
      toast.success('Starting your conversation...', { icon: '✨' });
      handleReset();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedIntent(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-card rounded-organic-xl shadow-warm max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-bold">Share this on Reel?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Also start a conversation about this
            </p>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload area or Preview */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-organic-lg p-12
                transition-all duration-300 cursor-pointer
                ${dragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
            >
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-center">
                <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="font-display font-semibold mb-1">
                  Drop your content here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse your files
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-organic-lg overflow-hidden bg-muted">
              {previewUrl && (
                selectedFile.type.startsWith('video/') ? (
                  <video 
                    src={previewUrl} 
                    className="w-full max-h-64 object-contain"
                    controls
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-64 object-contain"
                  />
                )
              )}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-card transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Intent selection */}
          {selectedFile && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warm" />
                <span className="font-display font-semibold">What kind of conversation?</span>
              </div>

              <div className="grid gap-3">
                {importIntents.map((intent) => (
                  <button
                    key={intent.id}
                    onClick={() => setSelectedIntent(intent.id)}
                    className={`
                      relative p-4 rounded-organic-lg border-2 text-left transition-all duration-300
                      hover-lift group
                      ${selectedIntent === intent.id 
                        ? 'border-primary bg-primary/5 shadow-warm' 
                        : 'border-border hover:border-primary/30'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-organic transition-colors"
                        style={{ 
                          backgroundColor: selectedIntent === intent.id 
                            ? `${intent.color}20` 
                            : 'hsl(var(--muted))'
                        }}
                      >
                        <intent.icon 
                          className="w-5 h-5" 
                          style={{ color: intent.color }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{intent.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {intent.description}
                        </p>
                        <p className="text-xs text-secondary mt-2 font-medium">
                          ✓ {intent.benefit}
                        </p>
                      </div>
                      {selectedIntent === intent.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className="p-6 border-t border-border bg-muted/30 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your original content stays exactly as you made it
              </p>
              <Button
                onClick={handleContinue}
                disabled={!selectedIntent}
                className="gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

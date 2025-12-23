import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Camera, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupPageProps {
  userId: string;
  onComplete: () => void;
}

const avatarEmojis = ['👤', '😊', '🎨', '🚀', '💻', '🎵', '📚', '🌟', '🔥', '💎', '🦊', '🐱', '🐶', '🦁', '🐼', '🦋'];

export const ProfileSetupPage = ({ userId, onComplete }: ProfileSetupPageProps) => {
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Please enter your display name');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_url: selectedAvatar,
          status_message: statusMessage.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Profile update error:', error);
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile set up successfully!');
      onComplete();
    } catch (err) {
      console.error('Profile setup error:', err);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
      <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-float-delayed" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <h1 className="font-display text-3xl font-bold text-foreground">Set Up Your Profile</h1>
          <p className="text-muted-foreground mt-2">Let others know who you are</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar selection */}
          <div className="space-y-4 animate-fade-in-up stagger-1">
            <Label className="font-display">Choose your avatar</Label>
            <div className="flex flex-wrap gap-3 justify-center">
              {avatarEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center transition-all ${
                    selectedAvatar === emoji
                      ? 'bg-primary text-primary-foreground scale-110 shadow-warm'
                      : 'bg-card hover:bg-muted border border-border'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-2 animate-fade-in-up stagger-2">
            <Label htmlFor="displayName" className="font-display">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 rounded-organic-lg bg-card border-border"
              maxLength={30}
            />
          </div>

          {/* Status message */}
          <div className="space-y-2 animate-fade-in-up stagger-3">
            <Label htmlFor="statusMessage" className="font-display">Status (optional)</Label>
            <Input
              id="statusMessage"
              type="text"
              placeholder="What's on your mind?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              className="h-12 rounded-organic-lg bg-card border-border"
              maxLength={100}
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className="w-full h-12 text-lg font-display font-semibold rounded-organic-lg shadow-warm hover-lift animate-fade-in-up stagger-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

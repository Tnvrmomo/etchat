import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPhotoUpdated?: (newUrl: string) => void;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

const iconSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

export const ProfilePhotoUpload = ({
  currentPhotoUrl,
  displayName = '',
  size = 'lg',
  onPhotoUpdated,
}: ProfilePhotoUploadProps) => {
  const { user, refreshProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      await refreshProfile();
      onPhotoUpdated?.(publicUrl);
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to update profile photo');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentPhotoUrl;
  const isEmoji = displayUrl && displayUrl.length <= 4 && !displayUrl.startsWith('http');

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div className={cn('relative rounded-full', sizeClasses[size])}>
        {isEmoji ? (
          <div className={cn(
            'flex items-center justify-center bg-primary/10 rounded-full text-4xl',
            sizeClasses[size]
          )}>
            {displayUrl}
          </div>
        ) : (
          <Avatar className={cn('rounded-full', sizeClasses[size])}>
            <AvatarImage src={displayUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {displayName.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Upload overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full',
            'bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity',
            'cursor-pointer disabled:cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <Loader2 className={cn('animate-spin text-primary', iconSizeClasses[size])} />
          ) : (
            <Camera className={cn('text-foreground', iconSizeClasses[size])} />
          )}
        </button>

        {/* Cancel preview button */}
        {previewUrl && !isUploading && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full"
            onClick={cancelPreview}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isUploading && (
        <p className="text-xs text-muted-foreground text-center mt-2">Uploading...</p>
      )}
    </div>
  );
};

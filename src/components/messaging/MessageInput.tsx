import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X, Image as ImageIcon, FileText, Mic, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, MessageAttachment } from './MessageBubble';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageInputProps {
  onSend: (content: string, attachments?: MessageAttachment[]) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
  conversationId?: string;
}

export const MessageInput = ({
  onSend,
  replyTo,
  onCancelReply,
  placeholder = 'Type a message...',
  disabled = false,
  conversationId,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'file' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const uploadFile = async (file: File): Promise<MessageAttachment | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${conversationId || 'general'}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(data.path);

      return {
        id: data.path,
        url: urlData.publicUrl,
        name: file.name,
        type: getFileType(file.type),
        size: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;

    const content = message.trim();
    let attachments: MessageAttachment[] = [];

    if (files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < files.length; i++) {
          const attachment = await uploadFile(files[i]);
          if (attachment) {
            attachments.push(attachment);
          }
          setUploadProgress(((i + 1) / files.length) * 100);
        }
      } catch (error) {
        toast.error('Failed to upload some files');
      }

      setIsUploading(false);
      setUploadProgress(0);
    }

    onSend(content, attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setFiles([]);
    setFilePreviews([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isImage = false) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file sizes (max 50MB)
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 50MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFiles(prev => [...prev, ...validFiles]);

    // Generate previews for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => [...prev, '']);
      }
    });

    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Mic className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Camera className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="border-t border-border bg-card">
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b border-border">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-primary">{replyTo.senderName}</span>
            <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Attachments Preview */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative flex-shrink-0"
            >
              {filePreviews[index] ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={filePreviews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  {getFileIcon(file)}
                  <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                    {file.name}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0 hover:bg-destructive/90"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, false)}
          accept=".pdf,.doc,.docx,.xls,.xlsx,video/*,audio/*"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, true)}
          accept="image/*"
        />

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <ImageIcon className="w-5 h-5 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-10',
              'rounded-2xl border-border focus-visible:ring-1 focus-visible:ring-primary'
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1"
            disabled={disabled}
          >
            <Smile className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        <Button
          size="icon"
          className={cn(
            'flex-shrink-0 rounded-full transition-all',
            message.trim() || files.length > 0
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-muted text-muted-foreground'
          )}
          onClick={handleSend}
          disabled={disabled || isUploading || (!message.trim() && files.length === 0)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

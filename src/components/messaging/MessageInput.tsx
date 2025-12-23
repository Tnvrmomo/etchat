import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from './MessageBubble';

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput = ({
  onSend,
  replyTo,
  onCancelReply,
  placeholder = 'Type a message...',
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
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
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
            >
              {getFileIcon(file)}
              <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                {file.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-4 h-4 absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0"
                onClick={() => removeAttachment(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
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
            disabled={disabled}
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
            message.trim() || attachments.length > 0
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-muted text-muted-foreground'
          )}
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

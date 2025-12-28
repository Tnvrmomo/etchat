import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, MessageAttachment } from './MessageBubble';

interface ForwardMessageDialogProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export const ForwardMessageDialog = ({
  message,
  isOpen,
  onClose,
  currentUserId,
}: ForwardMessageDialogProps) => {
  const { conversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const name = conv.name || 'Unknown';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleConversation = (conversationId: string) => {
    setSelectedConversations(prev =>
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleForward = async () => {
    if (!message || selectedConversations.length === 0) return;

    setIsForwarding(true);
    try {
      const forwardedContent = message.content
        ? `↪️ Forwarded:\n${message.content}`
        : '↪️ Forwarded message';

      const insertPromises = selectedConversations.map(convId =>
        supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: currentUserId,
          content: forwardedContent,
          message_type: message.attachments?.length ? 'file' : 'text',
          metadata: message.attachments
            ? JSON.parse(JSON.stringify({ attachments: message.attachments }))
            : null,
        })
      );

      await Promise.all(insertPromises);

      // Update conversation timestamps
      await Promise.all(
        selectedConversations.map(convId =>
          supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', convId)
        )
      );

      toast.success(`Message forwarded to ${selectedConversations.length} conversation(s)`);
      onClose();
      setSelectedConversations([]);
    } catch (error) {
      console.error('Forward error:', error);
      toast.error('Failed to forward message');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedConversations([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Forward Message</DialogTitle>
        </DialogHeader>

        {/* Message preview */}
        {message && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Forwarding:</p>
            <p className="text-sm text-foreground line-clamp-2">
              {message.content || (message.attachments?.length ? '📎 Attachment' : 'Message')}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>

        {/* Conversation list */}
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversations.includes(conv.id);
              const name = conv.name || 'Unknown';

              return (
                <button
                  key={conv.id}
                  onClick={() => toggleConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  )}
                >
                  <Checkbox checked={isSelected} />
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conv.avatar_url || undefined} alt={name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.type === 'group' ? 'Group' : 'Direct message'}
                    </p>
                  </div>
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No conversations found</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Forward button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {selectedConversations.length} selected
          </p>
          <Button
            onClick={handleForward}
            disabled={selectedConversations.length === 0 || isForwarding}
            className="gap-2"
          >
            {isForwarding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Forward
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

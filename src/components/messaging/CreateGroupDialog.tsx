import { useState } from 'react';
import { Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useProfiles } from '@/hooks/useProfiles';
import { useConversations } from '@/hooks/useConversations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: (conversationId: string) => void;
}

export const CreateGroupDialog = ({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) => {
  const { getOtherProfiles } = useProfiles();
  const { createConversation } = useConversations();
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const profiles = getOtherProfiles();

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (selectedUsers.length < 1) {
      toast.error('Please select at least one member');
      return;
    }

    setIsCreating(true);
    try {
      const conversation = await createConversation(selectedUsers, groupName.trim(), 'group');
      if (conversation) {
        toast.success('Group created successfully');
        onGroupCreated?.(conversation.id);
        onOpenChange(false);
        setGroupName('');
        setSelectedUsers([]);
      }
    } catch (error) {
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group
          </DialogTitle>
          <DialogDescription>
            Create a group chat with multiple people.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Members ({selectedUsers.length} selected)
            </label>
            <ScrollArea className="h-48 border rounded-organic p-2">
              {profiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No other users available
                </p>
              ) : (
                <div className="space-y-1">
                  {profiles.map((profile) => {
                    const isSelected = selectedUsers.includes(profile.user_id);
                    return (
                      <button
                        key={profile.user_id}
                        onClick={() => toggleUser(profile.user_id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2 rounded-organic transition-colors',
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-sm">
                            {(profile.display_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-left text-sm font-display">
                          {profile.display_name || 'User'}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isCreating || !groupName.trim() || selectedUsers.length < 1}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

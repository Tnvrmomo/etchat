import { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Star, 
  MoreVertical, 
  Phone, 
  Video, 
  MessageCircle,
  Ban,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useContacts } from '@/hooks/useContacts';
import { useProfiles } from '@/hooks/useProfiles';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContactsViewProps {
  onStartChat?: (userId: string, displayName: string) => void;
  onStartCall?: (userId: string, displayName: string, avatar: string | undefined, callType: 'voice' | 'video') => void;
}

export const ContactsView = ({ onStartChat, onStartCall }: ContactsViewProps) => {
  const { contacts, favorites, blocked, isLoading, addContact, removeContact, toggleFavorite, toggleBlock } = useContacts();
  const { getOtherProfiles } = useProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const name = contact.nickname || contact.profile?.display_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddContact = async (userId: string) => {
    await addContact(userId);
    setShowAddDialog(false);
  };

  const renderContactItem = (contact: any, showActions = true) => {
    const displayName = contact.nickname || contact.profile?.display_name || 'Unknown';
    const avatar = contact.profile?.avatar_url;
    const status = contact.profile?.status;

    return (
      <div
        key={contact.id}
        className="flex items-center gap-3 p-3 rounded-organic hover:bg-muted/50 transition-colors"
      >
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {status === 'available' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full presence-online border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-medium truncate">{displayName}</p>
            {contact.is_favorite && (
              <Star className="w-4 h-4 text-warm fill-warm" />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contact.profile?.status_message || (status === 'available' ? 'Online' : 'Offline')}
          </p>
        </div>

        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onStartChat?.(contact.contact_user_id, displayName)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onStartCall?.(contact.contact_user_id, displayName, avatar, 'voice')}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onStartCall?.(contact.contact_user_id, displayName, avatar, 'video')}
            >
              <Video className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleFavorite(contact.id)}>
                  <Star className={cn(
                    "w-4 h-4 mr-2",
                    contact.is_favorite && "fill-current"
                  )} />
                  {contact.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit nickname
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleBlock(contact.id)}>
                  <Ban className="w-4 h-4 mr-2" />
                  Block contact
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => removeContact(contact.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Contacts</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-primary/10">
                <UserPlus className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
                <DialogDescription>
                  Select a user to add to your contacts.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-64 mt-4">
                <div className="space-y-2">
                  {getOtherProfiles().filter(p => !contacts.some(c => c.contact_user_id === p.user_id)).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No new users to add
                    </p>
                  ) : (
                    getOtherProfiles()
                      .filter(p => !contacts.some(c => c.contact_user_id === p.user_id))
                      .map((profile) => (
                        <button
                          key={profile.user_id}
                          onClick={() => handleAddContact(profile.user_id)}
                          className="w-full flex items-center gap-3 p-3 rounded-organic hover:bg-muted transition-colors"
                        >
                          <Avatar>
                            <AvatarImage src={profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(profile.display_name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <p className="font-display font-medium">{profile.display_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{profile.status_message || 'Available'}</p>
                          </div>
                          <UserPlus className="w-5 h-5 text-muted-foreground" />
                        </button>
                      ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-0"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 py-6 bg-transparent border-b border-border rounded-none">
          <TabsTrigger value="all" className="font-display">
            All ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="font-display">
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="font-display">
            Blocked ({blocked.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="font-display">No contacts found</p>
                <p className="text-sm">Add contacts to get started</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredContacts.map(contact => renderContactItem(contact))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Star className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-display">No favorites yet</p>
              </div>
            ) : (
              <div className="p-2">
                {favorites.map(contact => renderContactItem(contact))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="blocked" className="flex-1 m-0">
          <ScrollArea className="h-full">
            {blocked.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Ban className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-display">No blocked contacts</p>
              </div>
            ) : (
              <div className="p-2">
                {blocked.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-3 rounded-organic hover:bg-muted/50 transition-colors opacity-60"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contact.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {(contact.profile?.display_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-display font-medium">{contact.nickname || contact.profile?.display_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">Blocked</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBlock(contact.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

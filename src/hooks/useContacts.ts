import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Contact {
  id: string;
  contact_user_id: string;
  nickname: string | null;
  is_favorite: boolean;
  is_blocked: boolean;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    status: string | null;
    status_message: string | null;
  };
}

interface UseContactsReturn {
  contacts: Contact[];
  favorites: Contact[];
  blocked: Contact[];
  isLoading: boolean;
  addContact: (contactUserId: string, nickname?: string) => Promise<void>;
  removeContact: (contactId: string) => Promise<void>;
  toggleFavorite: (contactId: string) => Promise<void>;
  toggleBlock: (contactId: string) => Promise<void>;
  updateNickname: (contactId: string, nickname: string) => Promise<void>;
  isContact: (userId: string) => boolean;
}

export const useContacts = (): UseContactsReturn => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for contacts
      const contactUserIds = data?.map(c => c.contact_user_id) || [];
      
      if (contactUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url, status, status_message')
          .in('user_id', contactUserIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

        const enrichedContacts = data?.map(contact => ({
          ...contact,
          profile: profileMap.get(contact.contact_user_id),
        })) || [];

        setContacts(enrichedContacts);
      } else {
        setContacts([]);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`contacts:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchContacts]);

  const addContact = useCallback(async (contactUserId: string, nickname?: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          nickname: nickname || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('This user is already in your contacts');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Contact added');
    } catch (err) {
      console.error('Error adding contact:', err);
      toast.error('Failed to add contact');
    }
  }, [user?.id]);

  const removeContact = useCallback(async (contactId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact removed');
    } catch (err) {
      console.error('Error removing contact:', err);
      toast.error('Failed to remove contact');
    }
  }, [user?.id]);

  const toggleFavorite = useCallback(async (contactId: string) => {
    if (!user?.id) return;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_favorite: !contact.is_favorite })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev =>
        prev.map(c =>
          c.id === contactId ? { ...c, is_favorite: !c.is_favorite } : c
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [user?.id, contacts]);

  const toggleBlock = useCallback(async (contactId: string) => {
    if (!user?.id) return;

    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: !contact.is_blocked })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev =>
        prev.map(c =>
          c.id === contactId ? { ...c, is_blocked: !c.is_blocked } : c
        )
      );

      toast.success(contact.is_blocked ? 'Contact unblocked' : 'Contact blocked');
    } catch (err) {
      console.error('Error toggling block:', err);
    }
  }, [user?.id, contacts]);

  const updateNickname = useCallback(async (contactId: string, nickname: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ nickname })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev =>
        prev.map(c =>
          c.id === contactId ? { ...c, nickname } : c
        )
      );
    } catch (err) {
      console.error('Error updating nickname:', err);
    }
  }, [user?.id]);

  const isContact = useCallback((userId: string) => {
    return contacts.some(c => c.contact_user_id === userId);
  }, [contacts]);

  const favorites = contacts.filter(c => c.is_favorite && !c.is_blocked);
  const blocked = contacts.filter(c => c.is_blocked);

  return {
    contacts: contacts.filter(c => !c.is_blocked),
    favorites,
    blocked,
    isLoading,
    addContact,
    removeContact,
    toggleFavorite,
    toggleBlock,
    updateNickname,
    isContact,
  };
};

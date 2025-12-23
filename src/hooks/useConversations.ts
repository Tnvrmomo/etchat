import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  name: string | null;
  type: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string | null;
    created_at: string;
    sender_id: string | null;
  };
  unread_count?: number;
  participants?: {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    status: string | null;
  }[];
  is_typing?: boolean;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Get conversations the user is part of
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error fetching participant data:', participantError);
        return;
      }

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Fetch conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          name,
          type,
          avatar_url,
          created_at,
          updated_at,
          typing_users
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return;
      }

      // Fetch last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get last message
          const { data: messageData } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get participants
          const { data: participantsData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id);

          const participantProfiles = await Promise.all(
            (participantsData || []).map(async (p) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url, status')
                .eq('user_id', p.user_id)
                .single();
              return { user_id: p.user_id, ...profile };
            })
          );

          return {
            ...conv,
            last_message: messageData || undefined,
            participants: participantProfiles,
            is_typing: Array.isArray(conv.typing_users) && conv.typing_users.length > 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error('Error in fetchConversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const createConversation = async (participantIds: string[], name?: string, type: 'direct' | 'group' = 'direct') => {
    if (!user) return null;

    try {
      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: type === 'group' ? name : null,
          type,
          created_by: user.id,
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return null;
      }

      // Add participants
      const participants = [user.id, ...participantIds].map(userId => ({
        conversation_id: conv.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member',
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) {
        console.error('Error adding participants:', partError);
        return null;
      }

      await fetchConversations();
      return conv;
    } catch (err) {
      console.error('Error in createConversation:', err);
      return null;
    }
  };

  return {
    conversations,
    isLoading,
    refresh: fetchConversations,
    createConversation,
  };
};

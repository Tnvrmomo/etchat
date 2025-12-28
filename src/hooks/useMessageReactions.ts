import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

export const useMessageReactions = (conversationId: string) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());

  // Fetch existing reactions for the conversation
  useEffect(() => {
    if (!conversationId || !user) return;

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*, messages!inner(conversation_id)')
        .eq('messages.conversation_id', conversationId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return;
      }

      const reactionMap = new Map<string, Reaction[]>();
      (data || []).forEach((reaction: any) => {
        const messageId = reaction.message_id;
        if (!reactionMap.has(messageId)) {
          reactionMap.set(messageId, []);
        }
        reactionMap.get(messageId)!.push({
          id: reaction.id,
          message_id: reaction.message_id,
          user_id: reaction.user_id,
          emoji: reaction.emoji,
          created_at: reaction.created_at,
        });
      });
      setReactions(reactionMap);
    };

    fetchReactions();

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`reactions:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newReaction = payload.new as Reaction;
            setReactions(prev => {
              const updated = new Map(prev);
              const existing = updated.get(newReaction.message_id) || [];
              updated.set(newReaction.message_id, [...existing, newReaction]);
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedReaction = payload.old as Reaction;
            setReactions(prev => {
              const updated = new Map(prev);
              const existing = updated.get(deletedReaction.message_id) || [];
              updated.set(
                deletedReaction.message_id,
                existing.filter(r => r.id !== deletedReaction.id)
              );
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Toggle a reaction on a message
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    const messageReactions = reactions.get(messageId) || [];
    const existingReaction = messageReactions.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) {
        console.error('Error removing reaction:', error);
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error) {
        console.error('Error adding reaction:', error);
      }
    }
  }, [user, reactions]);

  // Get reaction summary for a message
  const getReactionSummary = useCallback((messageId: string): ReactionSummary[] => {
    const messageReactions = reactions.get(messageId) || [];
    const emojiMap = new Map<string, { count: number; users: string[]; hasReacted: boolean }>();

    messageReactions.forEach(reaction => {
      const existing = emojiMap.get(reaction.emoji) || { count: 0, users: [], hasReacted: false };
      existing.count++;
      existing.users.push(reaction.user_id);
      if (reaction.user_id === user?.id) {
        existing.hasReacted = true;
      }
      emojiMap.set(reaction.emoji, existing);
    });

    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  }, [reactions, user]);

  return {
    reactions,
    toggleReaction,
    getReactionSummary,
  };
};

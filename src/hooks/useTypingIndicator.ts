import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TypingUser {
  userId: string;
  displayName: string;
}

interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  setTyping: (isTyping: boolean) => void;
}

export const useTypingIndicator = (conversationId: string | null): UseTypingIndicatorReturn => {
  const { user, profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);

  // Subscribe to presence for typing indicators
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: TypingUser[] = [];

        Object.entries(state).forEach(([, presences]) => {
          (presences as any[]).forEach((presence) => {
            if (presence.isTyping && presence.userId !== user.id) {
              typing.push({
                userId: presence.userId,
                displayName: presence.displayName,
              });
            }
          });
        });

        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.isTyping && presence.userId !== user.id) {
            setTypingUsers(prev => {
              if (prev.some(u => u.userId === presence.userId)) return prev;
              return [...prev, { userId: presence.userId, displayName: presence.displayName }];
            });
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          setTypingUsers(prev => prev.filter(u => u.userId !== presence.userId));
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            displayName: profile?.display_name || 'User',
            isTyping: false,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id, profile?.display_name]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!conversationId || !user?.id) return;

    // Throttle typing updates (only send every 2 seconds)
    const now = Date.now();
    if (isTyping && now - lastTypingRef.current < 2000) return;
    lastTypingRef.current = now;

    const channel = supabase.channel(`typing:${conversationId}`);

    channel.track({
      userId: user.id,
      displayName: profile?.display_name || 'User',
      isTyping,
      online_at: new Date().toISOString(),
    });

    // Auto-clear typing after 5 seconds
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        channel.track({
          userId: user.id,
          displayName: profile?.display_name || 'User',
          isTyping: false,
          online_at: new Date().toISOString(),
        });
      }, 5000);
    }
  }, [conversationId, user?.id, profile?.display_name]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { typingUsers, setTyping };
};

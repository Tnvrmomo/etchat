import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  totalChats: number;
  totalCalls: number;
  totalFiles: number;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalChats: 0,
    totalCalls: 0,
    totalFiles: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Count conversations
      const { count: chatCount } = await supabase
        .from('conversation_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count calls (as caller or participant)
      const { count: callerCount } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('caller_id', user.id);

      const { count: participantCount } = await supabase
        .from('call_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count files
      const { count: fileCount } = await supabase
        .from('shared_files')
        .select('*', { count: 'exact', head: true })
        .eq('uploaded_by', user.id);

      setStats({
        totalChats: chatCount || 0,
        totalCalls: (callerCount || 0) + (participantCount || 0),
        totalFiles: fileCount || 0,
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refresh: fetchStats,
  };
};

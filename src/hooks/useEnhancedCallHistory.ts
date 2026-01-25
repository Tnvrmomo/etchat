import { useCallback, useEffect, useState } from 'react';

export interface CallHistoryRecord {
  id: string;
  code: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  participantCount: number;
  isScreenShared: boolean;
  isRecorded: boolean;
  participants: Array<{
    userId: string;
    userName: string;
    joinTime: Date;
    leaveTime?: Date;
    duration: number;
  }>;
}

const STORAGE_KEY = 'etchat_call_history_enhanced';
const MAX_HISTORY_ITEMS = 50;

export const useEnhancedCallHistory = () => {
  const [history, setHistory] = useState<CallHistoryRecord[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load history from storage
  useEffect(() => {
    if (!initialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const converted = parsed.map((record: any) => ({
            ...record,
            startTime: new Date(record.startTime),
            endTime: record.endTime ? new Date(record.endTime) : undefined,
            participants: record.participants.map((p: any) => ({
              ...p,
              joinTime: new Date(p.joinTime),
              leaveTime: p.leaveTime ? new Date(p.leaveTime) : undefined,
            })),
          }));
          setHistory(converted);
        }
        setInitialized(true);
      } catch (error) {
        console.error('Failed to load call history:', error);
        setInitialized(true);
      }
    }
  }, [initialized]);

  /**
   * Add a new call to history
   */
  const addCallToHistory = useCallback((record: Omit<CallHistoryRecord, 'id'>) => {
    const newRecord: CallHistoryRecord = {
      ...record,
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setHistory((prev) => {
      const updated = [newRecord, ...prev];
      // Keep only the last MAX_HISTORY_ITEMS
      const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);

      // Save to storage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (error) {
        console.error('Failed to save call history:', error);
      }

      return trimmed;
    });

    return newRecord;
  }, []);

  /**
   * Remove a call from history
   */
  const removeCallFromHistory = useCallback((callId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((record) => record.id !== callId);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update call history:', error);
      }

      return updated;
    });
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear call history:', error);
    }
  }, []);

  /**
   * Get recent calls with stats
   */
  const getRecentCalls = useCallback(
    (limit: number = 10) => {
      return history.slice(0, limit).map((record) => ({
        code: record.code,
        name: record.title,
        participants: record.participantCount,
        lastUsed: record.startTime,
        duration: record.duration,
        isRecorded: record.isRecorded,
      }));
    },
    [history],
  );

  /**
   * Get call statistics
   */
  const getCallStats = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayCalls = history.filter((call) => call.startTime >= today);
    const weekCalls = history.filter((call) => call.startTime >= thisWeek);
    const monthCalls = history.filter((call) => call.startTime >= thisMonth);

    const totalDuration = history.reduce((sum, call) => sum + call.duration, 0);
    const avgDuration = history.length > 0 ? totalDuration / history.length : 0;
    const totalParticipants = history.reduce((sum, call) => sum + call.participantCount, 0);
    const avgParticipants = history.length > 0 ? totalParticipants / history.length : 0;

    return {
      totalCalls: history.length,
      todayCalls: todayCalls.length,
      weekCalls: weekCalls.length,
      monthCalls: monthCalls.length,
      totalDuration,
      avgDuration,
      totalParticipants,
      avgParticipants,
      recordedCalls: history.filter((call) => call.isRecorded).length,
    };
  }, [history]);

  /**
   * Search call history
   */
  const searchCalls = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return history.filter(
        (call) =>
          call.title.toLowerCase().includes(lowerQuery) ||
          call.code.toLowerCase().includes(lowerQuery) ||
          call.participants.some((p) => p.userName.toLowerCase().includes(lowerQuery)),
      );
    },
    [history],
  );

  return {
    history,
    addCallToHistory,
    removeCallFromHistory,
    clearHistory,
    getRecentCalls,
    getCallStats,
    searchCalls,
  };
};

import { useState } from 'react';
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCallHistory, CallRecord } from '@/hooks/useCallHistory';
import { toast } from 'sonner';

interface CallsViewProps {
  onStartCall?: (userId: string, userName: string, avatar: string | undefined, callType: 'voice' | 'video') => void;
}

export const CallsView = ({ onStartCall }: CallsViewProps) => {
  const { calls, isLoading } = useCallHistory();
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filteredCalls = filter === 'missed' 
    ? calls.filter(c => c.direction === 'missed')
    : calls;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getDirectionIcon = (direction: CallRecord['direction']) => {
    switch (direction) {
      case 'incoming': return <PhoneIncoming className="w-4 h-4 text-secondary" />;
      case 'outgoing': return <PhoneOutgoing className="w-4 h-4 text-primary" />;
      case 'missed': return <PhoneMissed className="w-4 h-4 text-destructive" />;
    }
  };

  const handleCallBack = (call: CallRecord) => {
    if (!onStartCall) {
      toast.error('Calling is not available at the moment');
      return;
    }

    const userName = call.caller_profile?.display_name || 'Unknown';
    const avatar = call.caller_profile?.avatar_url || undefined;
    
    onStartCall(call.caller_id, userName, avatar, call.call_type);
    toast.info(`Calling ${userName}...`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="font-display"
          >
            All Calls
          </Button>
          <Button
            variant={filter === 'missed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('missed')}
            className="font-display"
          >
            Missed
          </Button>
        </div>
      </div>

      {/* Call history */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Phone className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-display">No {filter === 'missed' ? 'missed ' : ''}calls yet</p>
            <p className="text-sm mt-2">Your call history will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleCallBack(call)}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {call.caller_profile?.avatar_url || '👤'}
                </div>

                {/* Call info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-display font-medium truncate",
                      call.direction === 'missed' && "text-destructive"
                    )}>
                      {call.caller_profile?.display_name || 'Unknown'}
                    </span>
                    {call.call_type === 'video' && <Video className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getDirectionIcon(call.direction)}
                    <span>{formatTime(call.created_at)}</span>
                    {call.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(call.duration)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Call button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCallBack(call);
                  }}
                >
                  {call.call_type === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

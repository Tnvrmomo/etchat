import { useState } from 'react';
import { Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CallRecord {
  id: string;
  name: string;
  avatar: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration?: number;
}

const demoCallHistory: CallRecord[] = [
  { id: '1', name: 'Alex Chen', avatar: '👨‍💻', type: 'video', direction: 'outgoing', timestamp: new Date(Date.now() - 1000 * 60 * 30), duration: 245 },
  { id: '2', name: 'Sarah Wilson', avatar: '👩‍🎨', type: 'voice', direction: 'missed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', name: 'Team Meeting', avatar: '👥', type: 'video', direction: 'incoming', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), duration: 3600 },
  { id: '4', name: 'Jordan Lee', avatar: '🧑‍🔬', type: 'voice', direction: 'outgoing', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), duration: 180 },
  { id: '5', name: 'Marketing Group', avatar: '📣', type: 'video', direction: 'missed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
];

export const CallsView = () => {
  const [filter, setFilter] = useState<'all' | 'missed'>('all');

  const filteredCalls = filter === 'missed' 
    ? demoCallHistory.filter(c => c.direction === 'missed')
    : demoCallHistory;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date) => {
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
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Phone className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-display">No {filter === 'missed' ? 'missed ' : ''}calls yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {call.avatar}
                </div>

                {/* Call info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-display font-medium truncate",
                      call.direction === 'missed' && "text-destructive"
                    )}>
                      {call.name}
                    </span>
                    {call.type === 'video' && <Video className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getDirectionIcon(call.direction)}
                    <span>{formatTime(call.timestamp)}</span>
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
                >
                  {call.type === 'video' ? (
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

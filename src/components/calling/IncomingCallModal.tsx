import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingCallModalProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal = ({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onReject,
}: IncomingCallModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              animation: `ping ${2 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Caller Info */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="relative">
          <Avatar className="w-28 h-28 ring-4 ring-primary/50 shadow-warm">
            <AvatarImage src={callerAvatar} alt={callerName} />
            <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
              {callerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Call type indicator */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-lg">
            {callType === 'video' ? (
              <Video className="w-5 h-5 text-secondary-foreground" />
            ) : (
              <Phone className="w-5 h-5 text-secondary-foreground" />
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold text-foreground">
            {callerName}
          </h2>
          <p className="text-lg text-muted-foreground mt-1">
            Incoming {callType} call...
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex items-center gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Reject Button */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={onReject}
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
          <span className="text-sm text-muted-foreground">Decline</span>
        </div>

        {/* Accept Button */}
        <div className="flex flex-col items-center gap-2">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-secondary hover:bg-secondary/90 shadow-lg animate-pulse"
            onClick={onAccept}
          >
            {callType === 'video' ? (
              <Video className="w-7 h-7" />
            ) : (
              <Phone className="w-7 h-7" />
            )}
          </Button>
          <span className="text-sm text-muted-foreground">Accept</span>
        </div>
      </div>
    </div>
  );
};

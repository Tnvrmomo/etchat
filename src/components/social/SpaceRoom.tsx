import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageCircle, Users } from 'lucide-react';

interface SpaceMember {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  isTyping?: boolean;
  message?: string;
}

interface ConversationCircle {
  id: string;
  x: number;
  y: number;
  topic: string;
  members: string[];
}

interface SpaceRoomProps {
  name: string;
  vibe: string;
  mood: 'energetic' | 'calm' | 'focused' | 'cozy';
  members: SpaceMember[];
  conversationCircles?: ConversationCircle[];
  ambientSound?: 'cafe' | 'fireplace' | 'rain' | 'none';
  onJoinCircle?: (circleId: string) => void;
  onSendMessage?: (message: string) => void;
}

const moodColors = {
  energetic: 'from-primary/20 via-warm/10 to-primary/20',
  calm: 'from-accent/20 via-secondary/10 to-accent/20',
  focused: 'from-secondary/20 via-accent/10 to-secondary/20',
  cozy: 'from-warm/20 via-primary/10 to-warm/20',
};

const ambientSounds = {
  cafe: '☕ Cafe murmur',
  fireplace: '🔥 Crackling fire',
  rain: '🌧️ Gentle rain',
  none: '🔇 Silent',
};

export const SpaceRoom = ({
  name,
  vibe,
  mood,
  members: initialMembers,
  conversationCircles = [],
  ambientSound = 'none',
  onJoinCircle,
  onSendMessage,
}: SpaceRoomProps) => {
  const [members, setMembers] = useState(initialMembers);
  const [soundEnabled, setSoundEnabled] = useState(ambientSound !== 'none');
  const [currentSound, setCurrentSound] = useState(ambientSound);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 80 });
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const roomRef = useRef<HTMLDivElement>(null);

  // Animate members movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers(prev =>
        prev.map(member => ({
          ...member,
          x: Math.max(10, Math.min(90, member.x + (Math.random() - 0.5) * 3)),
          y: Math.max(10, Math.min(85, member.y + (Math.random() - 0.5) * 3)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Random member messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMember = members[Math.floor(Math.random() * members.length)];
      if (randomMember && Math.random() > 0.7) {
        setMembers(prev =>
          prev.map(m =>
            m.id === randomMember.id
              ? { ...m, message: ['Nice!', 'I agree', '💭', '✨', '😊'][Math.floor(Math.random() * 5)] }
              : m
          )
        );
        setTimeout(() => {
          setMembers(prev =>
            prev.map(m => (m.id === randomMember.id ? { ...m, message: undefined } : m))
          );
        }, 3000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [members.length]);

  const handleRoomClick = (e: React.MouseEvent) => {
    if (!roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setUserPosition({ x, y });
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onSendMessage?.(chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Room header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{vibe}</span>
            <div>
              <h2 className="font-display text-lg font-bold">{name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{members.length + 1} here</span>
                <span className="capitalize">• {mood}</span>
              </div>
            </div>
          </div>
          
          {/* Sound controls */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm hover:bg-muted transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="text-xs">{ambientSounds[currentSound]}</span>
          </button>
        </div>
      </div>

      {/* Room space */}
      <div
        ref={roomRef}
        className={`flex-1 relative bg-gradient-to-br ${moodColors[mood]} overflow-hidden cursor-pointer transition-all duration-1000`}
        onClick={handleRoomClick}
      >
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Conversation circles */}
        {conversationCircles.map((circle) => (
          <div
            key={circle.id}
            className="absolute w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
            style={{
              left: `${circle.x}%`,
              top: `${circle.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onJoinCircle?.(circle.id);
            }}
          >
            <div className="text-center">
              <p className="text-xs font-display font-medium text-primary/80">{circle.topic}</p>
              <p className="text-[10px] text-muted-foreground">{circle.members.length} chatting</p>
            </div>
          </div>
        ))}

        {/* Other members */}
        {members.map((member) => (
          <div
            key={member.id}
            className="absolute transition-all duration-1000 ease-out"
            style={{
              left: `${member.x}%`,
              top: `${member.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Message bubble */}
            {member.message && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card shadow-soft px-2 py-1 rounded-full text-sm whitespace-nowrap animate-scale-in">
                {member.message}
              </div>
            )}
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-card shadow-soft flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer">
                {member.emoji}
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-display bg-card/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                {member.name}
              </span>
              {member.isTyping && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Current user */}
        <div
          className="absolute transition-all duration-300 z-10"
          style={{
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary shadow-warm flex items-center justify-center text-2xl ring-2 ring-primary/50 ring-offset-2 ring-offset-transparent">
              ✨
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-display font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full whitespace-nowrap">
              You
            </span>
          </div>
        </div>

        {/* Instructions hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
          Click anywhere to move around
        </div>
      </div>

      {/* Chat input */}
      <div className="p-4 bg-card/50 backdrop-blur-sm border-t border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-organic transition-colors ${showChat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          {showChat && (
            <div className="flex-1 flex gap-2 animate-slide-in-right">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Say something..."
                className="flex-1 bg-muted rounded-organic px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-organic font-display text-sm hover:bg-primary/90 transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

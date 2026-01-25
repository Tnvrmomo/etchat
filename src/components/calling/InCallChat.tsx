import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Hand, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface CallMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface InCallChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CallMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

const REACTIONS = ['👍', '👏', '❤️', '😂', '🙌', '🎉'];

export const InCallChat: React.FC<InCallChatProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [messageText, setMessageText] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-[#E2725B] bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2725B]/20 p-4">
        <h3 className="font-semibold text-[#E2725B]">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-gray-500 hover:text-[#E2725B]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-[#E2725B]">{msg.senderName}</span>
                  <span className="text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p
                  className={`rounded-lg px-3 py-2 text-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-[#E2725B] text-white'
                      : 'bg-[#F5F1E6] text-gray-900'
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-[#E2725B]/20 p-4">
        <div className="space-y-3">
          {/* Reactions */}
          {showReactions && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-[#F5F1E6] p-2">
              {REACTIONS.map((reaction) => (
                <Button
                  key={reaction}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSendMessage(reaction);
                    setShowReactions(false);
                  }}
                  className="h-8 w-8 p-0 text-lg hover:bg-white"
                >
                  {reaction}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="border-[#E2725B]/30"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactions(!showReactions)}
              className="h-10 w-10 p-0 text-gray-500 hover:text-[#E2725B]"
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="h-10 w-10 bg-[#E2725B] p-0 text-white hover:bg-[#D1654A] disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HandRaiseListProps {
  isOpen: boolean;
  onClose: () => void;
  handsRaised: Array<{ userId: string; userName: string; timestamp: Date }>;
  onLowerHand: (userId: string) => void;
  currentUserId: string;
  isHost: boolean;
}

export const HandRaiseList: React.FC<HandRaiseListProps> = ({
  isOpen,
  onClose,
  handsRaised,
  onLowerHand,
  currentUserId,
  isHost,
}) => {
  if (!isOpen || handsRaised.length === 0) return null;

  return (
    <div className="absolute right-0 top-20 z-50 w-72 rounded-lg border border-[#E2725B] bg-white p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[#E2725B]">Hands Raised ({handsRaised.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 text-gray-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {handsRaised.map((item) => (
          <div key={item.userId} className="flex items-center justify-between rounded-lg bg-[#F5F1E6] p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.userName}</p>
              <p className="text-xs text-gray-500">
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {isHost && item.userId !== currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLowerHand(item.userId)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-[#E2725B]"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface RaiseHandButtonProps {
  isRaised: boolean;
  onToggle: () => void;
  handsCount: number;
}

export const RaiseHandButton: React.FC<RaiseHandButtonProps> = ({
  isRaised,
  onToggle,
  handsCount,
}) => {
  return (
    <Button
      onClick={onToggle}
      className={`relative gap-2 ${
        isRaised
          ? 'bg-[#E2725B] text-white hover:bg-[#D1654A]'
          : 'border-[#E2725B] text-[#E2725B] hover:bg-[#F5F1E6]'
      }`}
      variant={isRaised ? 'default' : 'outline'}
    >
      <Hand className="h-4 w-4" />
      <span>Raise Hand</span>
      {handsCount > 0 && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
          {handsCount}
        </span>
      )}
    </Button>
  );
};

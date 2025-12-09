import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const messages = [
  "talking about morning routines",
  "sharing favorite recipes",
  "discussing book recommendations",
  "brainstorming project ideas",
  "planning weekend adventures",
];

export const LiveActivity = () => {
  const [conversationCount, setConversationCount] = useState(12);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setConversationCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-card/60 backdrop-blur-sm rounded-organic-lg shadow-soft">
      <div className="relative">
        <div className="w-3 h-3 rounded-full presence-active" />
        <div className="absolute inset-0 w-3 h-3 rounded-full presence-active animate-ping opacity-50" />
      </div>
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="font-display text-sm font-medium">
          {conversationCount} conversations happening now
        </span>
      </div>
      <span className="text-muted-foreground text-sm hidden sm:inline animate-fade-in-up" key={currentMessage}>
        · {messages[currentMessage]}
      </span>
    </div>
  );
};

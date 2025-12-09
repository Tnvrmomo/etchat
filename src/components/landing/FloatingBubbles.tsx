import { useEffect, useState } from 'react';

const bubbleEmojis = ['💬', '✨', '🌿', '☕', '💭', '🎨'];

interface Bubble {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
}

export const FloatingBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const createBubble = () => {
      const newBubble: Bubble = {
        id: Date.now(),
        emoji: bubbleEmojis[Math.floor(Math.random() * bubbleEmojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      };
      setBubbles(prev => [...prev.slice(-8), newBubble]);
    };

    const interval = setInterval(createBubble, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute bottom-0 text-2xl opacity-60"
          style={{
            left: `${bubble.left}%`,
            animation: `bubble-rise ${bubble.duration}s ease-out ${bubble.delay}s forwards`,
          }}
        >
          {bubble.emoji}
        </div>
      ))}
    </div>
  );
};

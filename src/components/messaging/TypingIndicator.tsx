import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: { userId: string; displayName: string }[];
  className?: string;
}

export const TypingIndicator = ({ users, className }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].displayName} is typing`;
    } else if (users.length === 2) {
      return `${users[0].displayName} and ${users[1].displayName} are typing`;
    } else {
      return `${users[0].displayName} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2', className)}>
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" 
          style={{ animationDelay: '0ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" 
          style={{ animationDelay: '150ms' }}
        />
        <span 
          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" 
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-sm text-muted-foreground font-display">
        {getTypingText()}
      </span>
    </div>
  );
};

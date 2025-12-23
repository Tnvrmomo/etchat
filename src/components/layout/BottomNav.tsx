import { MessageCircle, Phone, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'chats' | 'calls' | 'files' | 'profile';

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  unreadCount?: number;
  missedCalls?: number;
}

export const BottomNav = ({ active, onNavigate, unreadCount = 0, missedCalls = 0 }: BottomNavProps) => {
  const items = [
    { id: 'chats' as const, icon: MessageCircle, label: 'Chats', badge: unreadCount },
    { id: 'calls' as const, icon: Phone, label: 'Calls', badge: missedCalls },
    { id: 'files' as const, icon: FileText, label: 'Files' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-organic transition-all duration-300',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 rounded-organic transition-all duration-300 relative',
                isActive && 'bg-primary/10 animate-scale-in'
              )}>
                <Icon className={cn(
                  'w-5 h-5 transition-transform duration-300',
                  isActive && 'scale-110'
                )} />
                {'badge' in item && item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-display font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

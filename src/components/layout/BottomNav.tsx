import { Home, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'home' | 'spaces' | 'you';

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

export const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  const items = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'spaces' as const, icon: Users, label: 'Spaces' },
    { id: 'you' as const, icon: User, label: 'You' },
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
                'flex flex-col items-center gap-1 px-6 py-2 rounded-organic transition-all duration-300',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 rounded-organic transition-all duration-300',
                isActive && 'bg-primary/10 animate-scale-in'
              )}>
                <Icon className={cn(
                  'w-6 h-6 transition-transform duration-300',
                  isActive && 'scale-110'
                )} />
              </div>
              <span className="text-xs font-display font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

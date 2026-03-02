import { MessageCircle, Phone, FileText, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'chats' | 'calls' | 'files' | 'contacts' | 'profile';

interface SideNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  unreadCount?: number;
  missedCalls?: number;
}

export const SideNav = ({ active, onNavigate, unreadCount = 0, missedCalls = 0 }: SideNavProps) => {
  const items = [
    { id: 'chats' as const, icon: MessageCircle, label: 'Chats', badge: unreadCount },
    { id: 'calls' as const, icon: Phone, label: 'Calls', badge: missedCalls },
    { id: 'contacts' as const, icon: Users, label: 'Contacts' },
    { id: 'files' as const, icon: FileText, label: 'Files' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="hidden md:flex flex-col w-20 lg:w-24 bg-card/90 backdrop-blur-lg border-r border-border fixed inset-y-0 z-40">
      <div className="flex flex-col items-center py-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-2 rounded-organic transition-colors duration-200',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-2 rounded-organic relative',
                isActive && 'bg-primary/10'
              )}>
                <Icon className={cn('w-6 h-6', isActive && 'scale-105')} />
                {'badge' in item && item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
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

import { Settings, LogOut, Bell, Moon, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileViewProps {
  name: string;
  avatar: string;
  interests: string[];
}

export const ProfileView = ({ name, avatar, interests }: ProfileViewProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    localStorage.removeItem('et-chat-access');
    await signOut();
  };

  const settingsItems = [
    { icon: Bell, label: 'Notifications', hasToggle: true },
    { icon: Moon, label: 'Dark Mode', hasToggle: true },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="px-4 max-w-md mx-auto space-y-6 pb-8">
      {/* Profile card */}
      <div className="bg-card rounded-organic-xl p-6 text-center shadow-soft animate-fade-in-up">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-5xl mb-4">
          {avatar}
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{name}</h1>
        <p className="text-muted-foreground text-sm mt-1">eT chat member</p>
        
        <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Chats</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">48</p>
            <p className="text-xs text-muted-foreground">Calls</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">23</p>
            <p className="text-xs text-muted-foreground">Files</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card rounded-organic-xl overflow-hidden shadow-soft animate-fade-in-up stagger-1">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Settings</h2>
        </div>
        <div className="divide-y divide-border">
          {settingsItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-display text-foreground">{item.label}</span>
              </div>
              {item.hasToggle ? (
                <Switch />
              ) : (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="bg-card rounded-organic-xl p-4 text-center shadow-soft animate-fade-in-up stagger-2">
        <div className="w-12 h-12 mx-auto rounded-organic overflow-hidden mb-3">
          <img src="/et-chat-logo.jpg" alt="eT chat" className="w-full h-full object-cover" />
        </div>
        <p className="font-display font-semibold text-foreground">eT chat</p>
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">Powered by Lovable Cloud</p>
      </div>

      {/* Logout */}
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="w-full rounded-organic-lg font-display gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground animate-fade-in-up stagger-3"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </Button>
    </div>
  );
};

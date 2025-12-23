import { useState, useEffect } from 'react';
import { 
  Settings, 
  LogOut, 
  Bell, 
  Moon, 
  Shield, 
  HelpCircle,
  Server,
  Wifi,
  WifiOff,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { ServerSettings } from '@/components/settings/ServerSettings';
import { PushNotificationSettings } from '@/components/settings/PushNotificationSettings';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useUserStats } from '@/hooks/useUserStats';

interface ProfileViewProps {
  name: string;
  avatar: string;
  interests: string[];
}

type SettingsView = 'main' | 'server' | 'notifications';

export const ProfileView = ({ name, avatar, interests }: ProfileViewProps) => {
  const { signOut, profile } = useAuth();
  const { isOnline, emergencyConfig } = useServerStatus();
  const { stats } = useUserStats();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('et-chat-access');
    await signOut();
  };

  if (currentView === 'server') {
    return (
      <div className="px-4 max-w-md mx-auto pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('main')}
            className="rounded-organic"
          >
            ← Back
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Server Settings</h1>
        </div>
        <ServerSettings />
      </div>
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="px-4 max-w-md mx-auto pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('main')}
            className="rounded-organic"
          >
            ← Back
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
        </div>
        <PushNotificationSettings />
      </div>
    );
  }

  return (
    <div className="px-4 max-w-md mx-auto space-y-6 pb-8">
      {/* Connection Status Banner */}
      {(!isOnline || emergencyConfig.offlineMode) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-organic-lg p-3 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-500" />
          <div>
            <p className="font-display text-sm font-medium text-foreground">
              {emergencyConfig.offlineMode ? 'Emergency Mode Active' : 'You\'re Offline'}
            </p>
            <p className="text-xs text-muted-foreground">
              Messages will sync when connected
            </p>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-card rounded-organic-xl p-6 text-center shadow-soft animate-fade-in-up">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-5xl mb-4">
          {avatar}
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {profile?.username ? `@${profile.username}` : 'eT chat member'}
        </p>
        
        <div className="flex justify-center gap-2 mt-3">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
              <Wifi className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
        
        <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">{stats.totalChats}</p>
            <p className="text-xs text-muted-foreground">Chats</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">{stats.totalCalls}</p>
            <p className="text-xs text-muted-foreground">Calls</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-foreground">{stats.totalFiles}</p>
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
          <button
            onClick={() => setCurrentView('notifications')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <span className="font-display text-foreground block">Notifications</span>
                <span className="text-xs text-muted-foreground">
                  Push & in-app notifications
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <span className="font-display text-foreground">Dark Mode</span>
            </div>
            <Switch 
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          <button
            onClick={() => setCurrentView('server')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <span className="font-display text-foreground block">Server & Sync</span>
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="font-display text-foreground">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span className="font-display text-foreground">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
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

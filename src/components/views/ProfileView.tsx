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
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ServerSettings } from '@/components/settings/ServerSettings';
import { PushNotificationSettings } from '@/components/settings/PushNotificationSettings';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileViewProps {
  name: string;
  avatar: string;
  interests: string[];
}

type SettingsView = 'main' | 'server' | 'notifications';

export const ProfileView = ({ name, avatar, interests }: ProfileViewProps) => {
  const { signOut, profile, refreshProfile, user } = useAuth();
  const { isOnline, emergencyConfig } = useServerStatus();
  const { stats } = useUserStats();
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [darkMode, setDarkMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editName, setEditName] = useState(profile?.display_name || name);
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editStatus, setEditStatus] = useState(profile?.status_message || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (profile) {
      setEditName(profile.display_name || name);
      setEditUsername(profile.username || '');
      setEditStatus(profile.status_message || '');
    }
  }, [profile, name]);

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

  const saveField = async (field: 'display_name' | 'username' | 'status_message', value: string) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated');
      
      if (field === 'display_name') setIsEditingName(false);
      if (field === 'username') setIsEditingUsername(false);
      if (field === 'status_message') setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex justify-center mb-4">
          <ProfilePhotoUpload
            currentPhotoUrl={profile?.avatar_url || avatar}
            displayName={profile?.display_name || name}
            size="xl"
          />
        </div>
        
        {/* Editable Display Name */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-48 text-center h-8"
                placeholder="Display name"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => saveField('display_name', editName)}
                disabled={isSaving}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => {
                  setIsEditingName(false);
                  setEditName(profile?.display_name || name);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {profile?.display_name || name}
              </h1>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setIsEditingName(true)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
        
        {/* Editable Username */}
        <div className="flex items-center justify-center gap-2">
          {isEditingUsername ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-muted-foreground">@</span>
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-32 h-7 text-sm"
                  placeholder="username"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => saveField('username', editUsername)}
                disabled={isSaving}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setIsEditingUsername(false);
                  setEditUsername(profile?.username || '');
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                {profile?.username ? `@${profile.username}` : 'Set username'}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setIsEditingUsername(true)}
              >
                <Edit2 className="w-2.5 h-2.5" />
              </Button>
            </>
          )}
        </div>

        {/* Editable Status Message */}
        <div className="flex items-center justify-center gap-2 mt-2">
          {isEditingStatus ? (
            <div className="flex items-center gap-2">
              <Input
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-48 text-center h-7 text-sm"
                placeholder="What's on your mind?"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => saveField('status_message', editStatus)}
                disabled={isSaving}
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setIsEditingStatus(false);
                  setEditStatus(profile?.status_message || '');
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-xs italic">
                {profile?.status_message || 'Set a status message'}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setIsEditingStatus(true)}
              >
                <Edit2 className="w-2.5 h-2.5" />
              </Button>
            </>
          )}
        </div>
        
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

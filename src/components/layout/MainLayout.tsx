import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { CreateButton } from './CreateButton';
import { HomeView } from '@/components/views/HomeView';
import { SpacesView } from '@/components/views/SpacesView';
import { ProfileView } from '@/components/views/ProfileView';
import { SocialDiscoveryView } from '@/components/views/SocialDiscoveryView';
import { toast } from 'sonner';

interface MainLayoutProps {
  userName: string;
  userAvatar: string;
  userInterests: string[];
}

export const MainLayout = ({ userName, userAvatar, userInterests }: MainLayoutProps) => {
  const [activeNav, setActiveNav] = useState<'home' | 'spaces' | 'discover' | 'you'>('home');

  const handleCreate = (type: 'thread' | 'reel' | 'canvas' | 'space') => {
    const messages = {
      thread: 'Starting a new conversation...',
      reel: 'Ready to share a moment!',
      canvas: 'Opening collaborative canvas...',
      space: 'Creating your space...',
    };
    toast(messages[type], {
      icon: '✨',
    });
  };

  return (
    <div className="min-h-screen bg-atmosphere">
      {/* Soft background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-secondary/5 blur-3xl animate-float" />
      </div>

      {/* Main content area */}
      <main className="relative z-10 pb-32 pt-6">
        {activeNav === 'home' && <HomeView />}
        {activeNav === 'spaces' && <SpacesView />}
        {activeNav === 'discover' && <SocialDiscoveryView userInterests={userInterests} />}
        {activeNav === 'you' && (
          <ProfileView 
            name={userName} 
            avatar={userAvatar} 
            interests={userInterests}
          />
        )}
      </main>

      {/* Navigation */}
      <CreateButton onAction={handleCreate} />
      <BottomNav active={activeNav} onNavigate={setActiveNav} />
    </div>
  );
};

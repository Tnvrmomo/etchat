import { useState, useEffect } from 'react';
import { AccessCodeGate } from '@/components/auth/AccessCodeGate';
import { AuthPage } from '@/components/auth/AuthPage';
import { ProfileSetupPage } from '@/components/auth/ProfileSetupPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { NotificationOnboarding } from '@/components/onboarding/NotificationOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [hasAccessCode, setHasAccessCode] = useState(false);
  const [showNotificationOnboarding, setShowNotificationOnboarding] = useState(false);
  const { user, profile, isLoading, isProfileComplete, refreshProfile } = useAuth();

  useEffect(() => {
    // Check if access code was entered
    const accessGranted = localStorage.getItem('et-chat-access');
    if (accessGranted === 'granted') {
      setHasAccessCode(true);
    }
  }, []);

  // Check if we should show notification onboarding
  useEffect(() => {
    if (user && isProfileComplete) {
      const notificationsSkipped = localStorage.getItem('et-chat-notifications-skipped');
      const notificationsShown = localStorage.getItem('et-chat-notifications-shown');
      
      if (!notificationsSkipped && !notificationsShown && Notification.permission === 'default') {
        setShowNotificationOnboarding(true);
      }
    }
  }, [user, isProfileComplete]);

  const handleAccessGranted = () => {
    setHasAccessCode(true);
  };

  const handleAuthSuccess = () => {
    // Auth state will be updated by the listener
  };

  const handleProfileComplete = () => {
    refreshProfile();
  };

  const handleNotificationOnboardingComplete = () => {
    localStorage.setItem('et-chat-notifications-shown', 'true');
    setShowNotificationOnboarding(false);
  };

  // Show loading state
  if (hasAccessCode && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-organic-xl overflow-hidden shadow-warm">
            <img src="/et-chat-logo.jpg" alt="eT chat" className="w-full h-full object-cover" />
          </div>
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground font-display">Loading...</p>
        </div>
      </div>
    );
  }

  // Step 1: Access code gate
  if (!hasAccessCode) {
    return (
      <>
        <AccessCodeGate onAccessGranted={handleAccessGranted} />
        <PWAUpdatePrompt />
      </>
    );
  }

  // Step 2: Authentication
  if (!user) {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <PWAUpdatePrompt />
      </>
    );
  }

  // Step 3: Profile setup (if not complete)
  if (!isProfileComplete) {
    return (
      <>
        <ProfileSetupPage userId={user.id} onComplete={handleProfileComplete} />
        <PWAUpdatePrompt />
      </>
    );
  }

  // Step 4: Notification onboarding (first time only)
  if (showNotificationOnboarding) {
    return (
      <>
        <NotificationOnboarding onComplete={handleNotificationOnboardingComplete} />
        <PWAUpdatePrompt />
      </>
    );
  }

  // Step 5: Main app
  return (
    <>
      <MainLayout 
        userName={profile?.display_name || 'User'}
        userAvatar={profile?.avatar_url || '👤'}
        userInterests={['messaging', 'calls', 'documents']}
      />
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </>
  );
};

export default Index;

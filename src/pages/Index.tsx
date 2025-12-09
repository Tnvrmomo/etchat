import { useState } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { MainLayout } from '@/components/layout/MainLayout';

type AppState = 'landing' | 'onboarding' | 'app';

interface UserData {
  mood: string;
  interests: string[];
  name: string;
  avatar: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleGetStarted = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    setAppState('app');
  };

  const handleBackToLanding = () => {
    setAppState('landing');
  };

  if (appState === 'landing') {
    return (
      <div className="bg-atmosphere min-h-screen">
        <HeroSection onGetStarted={handleGetStarted} />
      </div>
    );
  }

  if (appState === 'onboarding') {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <MainLayout 
      userName={userData?.name || 'Friend'}
      userAvatar={userData?.avatar || '😊'}
      userInterests={userData?.interests || []}
    />
  );
};

export default Index;

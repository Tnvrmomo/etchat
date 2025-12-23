import { useState, useEffect } from 'react';
import { AccessCodeGate } from '@/components/auth/AccessCodeGate';
import { MainLayout } from '@/components/layout/MainLayout';
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const accessGranted = localStorage.getItem('et-chat-access');
    if (accessGranted === 'granted') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <AccessCodeGate onAccessGranted={handleAccessGranted} />
        <PWAUpdatePrompt />
      </>
    );
  }

  return (
    <>
      <MainLayout 
        userName="User"
        userAvatar="👤"
        userInterests={['messaging', 'calls', 'documents']}
      />
      <PWAUpdatePrompt />
    </>
  );
};

export default Index;

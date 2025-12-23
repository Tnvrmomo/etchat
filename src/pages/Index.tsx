import { useState, useEffect } from 'react';
import { AccessCodeGate } from '@/components/auth/AccessCodeGate';
import { MainLayout } from '@/components/layout/MainLayout';

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
    return <AccessCodeGate onAccessGranted={handleAccessGranted} />;
  }

  return (
    <MainLayout 
      userName="User"
      userAvatar="👤"
      userInterests={['messaging', 'calls', 'documents']}
    />
  );
};

export default Index;

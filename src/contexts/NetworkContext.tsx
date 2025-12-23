import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { EmergencyConfig } from '@/lib/serverConfig';
import { useAuth } from '@/contexts/AuthContext';

interface NetworkContextType {
  isOnline: boolean;
  isEmergencyMode: boolean;
  emergencyConfig: EmergencyConfig;
  pendingItems: number;
  isSyncing: boolean;
  setEmergencyConfig: (config: EmergencyConfig) => void;
  syncNow: () => Promise<void>;
  cacheCurrentData: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const {
    isOnline,
    emergencyConfig,
    setEmergencyConfig,
  } = useServerStatus();

  const {
    isSyncing,
    pendingItems,
    syncNow,
    cacheCurrentData,
  } = useOfflineSync(user?.id);

  const value: NetworkContextType = {
    isOnline,
    isEmergencyMode: emergencyConfig.offlineMode || emergencyConfig.enabled,
    emergencyConfig,
    pendingItems,
    isSyncing,
    setEmergencyConfig,
    syncNow,
    cacheCurrentData,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

import { useState, useEffect, useCallback } from 'react';
import { 
  ServerConfig, 
  getStoredServers, 
  checkServerHealth, 
  updateServerStatus,
  getBestServer,
  EmergencyConfig,
  getEmergencyConfig,
  saveEmergencyConfig,
} from '@/lib/serverConfig';

interface UseServerStatusReturn {
  servers: ServerConfig[];
  activeServer: ServerConfig | null;
  isOnline: boolean;
  isChecking: boolean;
  emergencyConfig: EmergencyConfig;
  refreshServerStatus: () => Promise<void>;
  setEmergencyConfig: (config: EmergencyConfig) => void;
}

export const useServerStatus = (): UseServerStatusReturn => {
  const [servers, setServers] = useState<ServerConfig[]>(getStoredServers());
  const [activeServer, setActiveServer] = useState<ServerConfig | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);
  const [emergencyConfig, setEmergencyConfigState] = useState<EmergencyConfig>(getEmergencyConfig());

  const refreshServerStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const updatedServers = await Promise.all(
        getStoredServers().map(async (server) => {
          const health = await checkServerHealth(server.url);
          updateServerStatus(server.id, health.online ? 'online' : 'offline', health.latency);
          return {
            ...server,
            status: health.online ? 'online' as const : 'offline' as const,
            latency: health.latency,
          };
        })
      );
      setServers(updatedServers);
      
      const best = await getBestServer();
      setActiveServer(best);
    } catch (error) {
      console.error('Failed to refresh server status:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const setEmergencyConfig = useCallback((config: EmergencyConfig) => {
    saveEmergencyConfig(config);
    setEmergencyConfigState(config);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshServerStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setServers(prev => prev.map(s => ({ ...s, status: 'offline' as const })));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshServerStatus]);

  // Initial check and periodic refresh
  useEffect(() => {
    refreshServerStatus();
    
    // Check every 30 seconds
    const interval = setInterval(refreshServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, [refreshServerStatus]);

  return {
    servers,
    activeServer,
    isOnline: isOnline && !emergencyConfig.offlineMode,
    isChecking,
    emergencyConfig,
    refreshServerStatus,
    setEmergencyConfig,
  };
};

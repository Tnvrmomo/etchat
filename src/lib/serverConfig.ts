// Server configuration and federation management
export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  type: 'primary' | 'fallback' | 'matrix';
  status: 'online' | 'offline' | 'checking';
  latency?: number;
  priority: number;
}

export interface EmergencyConfig {
  enabled: boolean;
  offlineMode: boolean;
  lowBandwidthMode: boolean;
  p2pEnabled: boolean;
}

const DEFAULT_SERVERS: ServerConfig[] = [
  {
    id: 'lovable-primary',
    name: 'Lovable Cloud',
    url: import.meta.env.VITE_SUPABASE_URL || 'https://qfegiecxgjpxqpqqvroq.supabase.co',
    type: 'primary',
    status: 'checking',
    priority: 1,
  },
];

const STORAGE_KEY = 'et-chat-servers';
const EMERGENCY_KEY = 'et-chat-emergency';

// Get stored server configurations
export const getStoredServers = (): ServerConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored servers:', e);
  }
  return DEFAULT_SERVERS;
};

// Save server configurations
export const saveServers = (servers: ServerConfig[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
};

// Add a new server
export const addServer = (server: Omit<ServerConfig, 'id' | 'status'>): ServerConfig => {
  const servers = getStoredServers();
  const newServer: ServerConfig = {
    ...server,
    id: `custom-${Date.now()}`,
    status: 'checking',
  };
  servers.push(newServer);
  saveServers(servers);
  return newServer;
};

// Remove a server
export const removeServer = (serverId: string): void => {
  const servers = getStoredServers().filter(s => s.id !== serverId);
  saveServers(servers);
};

// Update server status
export const updateServerStatus = (serverId: string, status: ServerConfig['status'], latency?: number): void => {
  const servers = getStoredServers();
  const index = servers.findIndex(s => s.id === serverId);
  if (index !== -1) {
    servers[index].status = status;
    if (latency !== undefined) {
      servers[index].latency = latency;
    }
    saveServers(servers);
  }
};

// Check server health
export const checkServerHealth = async (url: string): Promise<{ online: boolean; latency: number }> => {
  const start = performance.now();
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      mode: 'cors',
      signal: AbortSignal.timeout(5000),
    });
    const latency = Math.round(performance.now() - start);
    return { online: response.ok, latency };
  } catch {
    return { online: false, latency: -1 };
  }
};

// Get best available server
export const getBestServer = async (): Promise<ServerConfig | null> => {
  const servers = getStoredServers();
  
  // Check all servers in parallel
  const results = await Promise.all(
    servers.map(async (server) => {
      const health = await checkServerHealth(server.url);
      return { server, health };
    })
  );
  
  // Update statuses
  results.forEach(({ server, health }) => {
    updateServerStatus(server.id, health.online ? 'online' : 'offline', health.latency);
  });
  
  // Find best online server by priority and latency
  const onlineServers = results
    .filter(r => r.health.online)
    .sort((a, b) => {
      if (a.server.priority !== b.server.priority) {
        return a.server.priority - b.server.priority;
      }
      return a.health.latency - b.health.latency;
    });
  
  return onlineServers[0]?.server || null;
};

// Emergency configuration
export const getEmergencyConfig = (): EmergencyConfig => {
  try {
    const stored = localStorage.getItem(EMERGENCY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse emergency config:', e);
  }
  return {
    enabled: false,
    offlineMode: false,
    lowBandwidthMode: false,
    p2pEnabled: false,
  };
};

export const saveEmergencyConfig = (config: EmergencyConfig): void => {
  localStorage.setItem(EMERGENCY_KEY, JSON.stringify(config));
};

// Check if we're in offline mode
export const isOffline = (): boolean => {
  return !navigator.onLine || getEmergencyConfig().offlineMode;
};

import { Wifi, WifiOff, AlertTriangle, Cloud, RefreshCw } from 'lucide-react';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  compact?: boolean;
}

export const ConnectionStatus = ({ compact = false }: ConnectionStatusProps) => {
  const { user } = useAuth();
  const { isOnline, emergencyConfig, activeServer, isChecking } = useServerStatus();
  const { pendingItems, isSyncing, syncNow } = useOfflineSync(user?.id);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center gap-1.5 text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-display">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-amber-500">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-display">Offline</span>
          </div>
        )}
        {pendingItems > 0 && (
          <span className="text-xs text-muted-foreground">
            ({pendingItems} pending)
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-organic-lg p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {emergencyConfig.offlineMode ? (
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          ) : isOnline ? (
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-500" />
            </div>
          )}
          
          <div>
            <p className="font-display font-medium text-foreground">
              {emergencyConfig.offlineMode 
                ? 'Emergency Mode' 
                : isOnline 
                  ? 'Connected' 
                  : 'Offline'}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeServer?.name || 'No server'}
              {activeServer?.latency && activeServer.latency > 0 && ` • ${activeServer.latency}ms`}
            </p>
          </div>
        </div>

        {pendingItems > 0 && isOnline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={syncNow}
            disabled={isSyncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-xs">Sync {pendingItems}</span>
          </Button>
        )}
      </div>

      {pendingItems > 0 && !isOnline && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            {pendingItems} items will sync when online
          </p>
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { 
  Server, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Signal, 
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ServerConfig, 
  addServer, 
  removeServer,
} from '@/lib/serverConfig';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ServerSettings = () => {
  const { user } = useAuth();
  const { 
    servers, 
    activeServer, 
    isOnline, 
    isChecking, 
    emergencyConfig,
    refreshServerStatus,
    setEmergencyConfig,
  } = useServerStatus();
  
  const {
    isSyncing,
    pendingItems,
    storageUsed,
    storageQuota,
    syncNow,
    cacheCurrentData,
  } = useOfflineSync(user?.id);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerType, setNewServerType] = useState<'fallback' | 'matrix'>('fallback');

  const handleAddServer = () => {
    if (!newServerName || !newServerUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const url = new URL(newServerUrl);
      addServer({
        name: newServerName,
        url: url.origin,
        type: newServerType,
        priority: servers.length + 1,
      });
      
      setNewServerName('');
      setNewServerUrl('');
      setShowAddDialog(false);
      refreshServerStatus();
      toast.success('Server added successfully');
    } catch {
      toast.error('Invalid URL format');
    }
  };

  const handleRemoveServer = (serverId: string) => {
    removeServer(serverId);
    refreshServerStatus();
    toast.success('Server removed');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusIcon = (status: ServerConfig['status']) => {
    switch (status) {
      case 'online':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-card rounded-organic-xl p-4 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="font-display font-semibold text-foreground">
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshServerStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {activeServer && (
          <div className="text-sm text-muted-foreground">
            <p>Active: <span className="text-foreground">{activeServer.name}</span></p>
            {activeServer.latency && activeServer.latency > 0 && (
              <p>Latency: <span className="text-foreground">{activeServer.latency}ms</span></p>
            )}
          </div>
        )}
      </div>

      {/* Emergency Mode */}
      <div className="bg-card rounded-organic-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span className="font-display font-semibold text-foreground">Emergency Mode</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-display">Offline Mode</Label>
              <p className="text-xs text-muted-foreground">Work without server connection</p>
            </div>
            <Switch
              checked={emergencyConfig.offlineMode}
              onCheckedChange={(checked) => 
                setEmergencyConfig({ ...emergencyConfig, offlineMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-display">Low Bandwidth Mode</Label>
              <p className="text-xs text-muted-foreground">Reduce data usage</p>
            </div>
            <Switch
              checked={emergencyConfig.lowBandwidthMode}
              onCheckedChange={(checked) => 
                setEmergencyConfig({ ...emergencyConfig, lowBandwidthMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-display">P2P Direct Connect</Label>
              <p className="text-xs text-muted-foreground">Connect directly to nearby users</p>
            </div>
            <Switch
              checked={emergencyConfig.p2pEnabled}
              onCheckedChange={(checked) => 
                setEmergencyConfig({ ...emergencyConfig, p2pEnabled: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Offline Storage */}
      <div className="bg-card rounded-organic-xl p-4 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <Signal className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold text-foreground">Offline Storage</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="text-foreground">
                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(storageUsed / storageQuota) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending Sync Items</span>
            <span className="text-foreground">{pendingItems}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cacheCurrentData}
              className="flex-1 font-display"
            >
              Cache Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncNow}
              disabled={isSyncing || pendingItems === 0}
              className="flex-1 font-display"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Sync Now
            </Button>
          </div>
        </div>
      </div>

      {/* Server List */}
      <div className="bg-card rounded-organic-xl overflow-hidden shadow-soft">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-muted-foreground" />
            <span className="font-display font-semibold text-foreground">Servers</span>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-organic-xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add Server</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="font-display">Server Name</Label>
                  <Input
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    placeholder="My Matrix Server"
                    className="mt-1 rounded-organic"
                  />
                </div>
                <div>
                  <Label className="font-display">Server URL</Label>
                  <Input
                    value={newServerUrl}
                    onChange={(e) => setNewServerUrl(e.target.value)}
                    placeholder="https://matrix.example.com"
                    className="mt-1 rounded-organic"
                  />
                </div>
                <div>
                  <Label className="font-display">Server Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={newServerType === 'fallback' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewServerType('fallback')}
                      className="rounded-organic"
                    >
                      Fallback
                    </Button>
                    <Button
                      variant={newServerType === 'matrix' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewServerType('matrix')}
                      className="rounded-organic"
                    >
                      Matrix
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleAddServer}
                  className="w-full rounded-organic font-display"
                >
                  Add Server
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="divide-y divide-border">
          {servers.map((server) => (
            <div 
              key={server.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(server.status)}
                <div>
                  <p className="font-display text-foreground">{server.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {server.type} • {server.latency ? `${server.latency}ms` : 'checking...'}
                  </p>
                </div>
              </div>
              
              {server.type !== 'primary' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveServer(server.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface NetworkStatus {
  online: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

const NetworkMonitor: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine
  });
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      const status: NetworkStatus = {
        online: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      };
      
      setNetworkStatus(status);
      
      // Show offline alert when going offline
      if (!status.online) {
        setShowOfflineAlert(true);
        if (config.features.enableAnalytics) {
          analytics.track('network_offline', {
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setShowOfflineAlert(false);
        if (config.features.enableAnalytics) {
          analytics.track('network_online', {
            connectionType: status.connectionType,
            effectiveType: status.effectiveType,
            timestamp: new Date().toISOString(),
          });
        }
      }
    };

    // Initial check
    updateNetworkStatus();

    // Listen for network changes
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes (if supported)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const getConnectionQuality = () => {
    if (!networkStatus.online) return 'offline';
    if (!networkStatus.effectiveType) return 'unknown';
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
        return 'poor';
      case '2g':
        return 'fair';
      case '3g':
        return 'good';
      case '4g':
        return 'excellent';
      default:
        return 'unknown';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Only show in development mode or when offline
  if (!config.isDevelopment && networkStatus.online) {
    return null;
  }

  return (
    <>
      {/* Offline Alert */}
      {showOfflineAlert && (
        <Alert className="fixed top-4 right-4 z-50 w-auto shadow-lg border-red-200 bg-red-50">
          <WifiOff className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            You are currently offline. Some features may not work.
          </AlertDescription>
        </Alert>
      )}

      {/* Network Status Badge (Development Mode) */}
      {config.isDevelopment && (
        <div className="fixed top-4 left-4 z-40">
          <Badge 
            className={`flex items-center gap-1 ${getQualityColor(getConnectionQuality())}`}
          >
            {networkStatus.online ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="text-xs">
              {networkStatus.online ? (
                networkStatus.effectiveType ? 
                  networkStatus.effectiveType.toUpperCase() : 
                  'Online'
              ) : (
                'Offline'
              )}
            </span>
            {networkStatus.online && networkStatus.rtt && (
              <span className="text-xs opacity-75">
                {networkStatus.rtt}ms
              </span>
            )}
          </Badge>
        </div>
      )}
    </>
  );
};

export default NetworkMonitor;

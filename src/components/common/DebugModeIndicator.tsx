import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Info, AlertTriangle } from 'lucide-react';
import { config } from '@/config/environment';
import { useDebugMode } from '@/hooks/useDebugMode';

const DebugModeIndicator: React.FC = () => {
  const { isDebugMode, debugLog } = useDebugMode();

  // Only show in development and when debug mode is enabled
  if (!config.isDevelopment || !isDebugMode) {
    return null;
  }

  const handleDebugInfo = () => {
    debugLog('Debug mode indicator clicked');
    debugLog('Current configuration:', {
      environment: config.app.environment,
      version: config.app.version,
      features: config.features,
      isDevelopment: config.isDevelopment,
      isProduction: config.isProduction,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="w-80 border-orange-200 bg-orange-50">
        <Bug className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-orange-700 border-orange-300"
              >
                Debug Mode
              </Badge>
              <span className="text-xs">
                Enhanced logging enabled
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDebugInfo}
              className="h-6 w-6 p-0 text-orange-700 hover:text-orange-900"
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs mt-1 text-orange-700">
            Check console for detailed debug information
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DebugModeIndicator;

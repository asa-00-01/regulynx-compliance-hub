
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Info } from 'lucide-react';
import { config } from '@/config/environment';

const MockModeIndicator: React.FC = () => {
  // Only show when mock data is enabled and in development
  if (!config.isDevelopment || !config.features.useMockData) {
    return null;
  }

  const handleMockInfo = () => {
    console.log('🔧 Mock Mode Configuration:', {
      useMockData: config.features.useMockData,
      environment: config.app.environment,
      isDevelopment: config.isDevelopment,
    });
    console.log('🔧 Mock data is being used for development/testing');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Alert className="w-80 border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-blue-700 border-blue-300"
              >
                Mock Mode
              </Badge>
              <span className="text-xs">
                Using mock data
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMockInfo}
              className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900"
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs mt-1 text-blue-700">
            Development mode with simulated data
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MockModeIndicator;


import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Settings, Info } from 'lucide-react';
import { config } from '@/config/environment';
import { MockDataService } from '@/services/mockDataService';

const MockModeIndicator: React.FC = () => {
  // Only show in development and when mock mode is enabled
  if (!config.isDevelopment || !config.features.useMockData) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <Database className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                Mock Mode
              </Badge>
              <span className="text-xs">Using JSON data</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Mock mode info:', {
                  enabled: MockDataService.isMockMode(),
                  environment: config.app.environment,
                  services: 'All services using mock data'
                });
              }}
              className="h-6 w-6 p-0 text-orange-700 hover:text-orange-900"
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs mt-1 text-orange-700">
            Set VITE_USE_MOCK_DATA=false to disable
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MockModeIndicator;

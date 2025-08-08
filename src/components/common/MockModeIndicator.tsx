
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Info, Globe } from 'lucide-react';
import { config } from '@/config/environment';
import { UnifiedDataService } from '@/services/unifiedDataService';

const MockModeIndicator: React.FC = () => {
  // Only show in development
  if (!config.isDevelopment) {
    return null;
  }

  const isMockMode = config.features.useMockData;
  const dataSource = UnifiedDataService.getCurrentDataSource();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className={isMockMode ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
        {isMockMode ? (
          <Database className="h-4 w-4 text-orange-600" />
        ) : (
          <Globe className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={isMockMode ? "text-orange-800" : "text-blue-800"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={isMockMode ? "text-orange-700 border-orange-300" : "text-blue-700 border-blue-300"}
              >
                {isMockMode ? 'Mock Mode' : 'Real Data'}
              </Badge>
              <span className="text-xs">
                {isMockMode ? 'Using JSON data' : 'Using API/Database'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Current data mode:', {
                  mode: isMockMode ? 'Mock' : 'Real',
                  source: dataSource,
                  environment: config.app.environment,
                  canToggle: 'Use Developer Tools to change'
                });
              }}
              className={`h-6 w-6 p-0 hover:text-opacity-90 ${
                isMockMode ? 'text-orange-700 hover:text-orange-900' : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              <Info className="h-3 w-3" />
            </Button>
          </div>
          <div className={`text-xs mt-1 ${isMockMode ? 'text-orange-700' : 'text-blue-700'}`}>
            {isMockMode ? 
              'Go to Developer Tools to switch to real data' : 
              'Go to Developer Tools to switch to mock data'
            }
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MockModeIndicator;

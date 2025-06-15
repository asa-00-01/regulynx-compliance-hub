
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { validateEnvironmentConfig, config } from '@/config/environment';

const EnvironmentChecker: React.FC = () => {
  const { isValid, errors } = validateEnvironmentConfig();

  if (config.isProduction && isValid) {
    // Don't show anything in production if everything is fine
    return null;
  }

  if (!config.isDevelopment) {
    // Don't show in production unless there are errors
    return errors.length > 0 ? (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Production configuration errors detected. Check console for details.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  return (
    <div className="space-y-2 p-4 bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Info className="h-4 w-4" />
        Environment Configuration Status
      </div>
      
      <div className="grid gap-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Environment: {config.app.environment}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          App Name: {config.app.name}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Domain: {config.app.domain}
        </div>
        
        {errors.length > 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Configuration Issues:</div>
                {errors.map((error, index) => (
                  <div key={index} className="text-xs">• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default EnvironmentChecker;

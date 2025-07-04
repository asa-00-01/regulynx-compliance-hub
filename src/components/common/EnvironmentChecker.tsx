
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, XCircle, AlertCircle } from 'lucide-react';
import { validateEnvironmentConfig, config, getConfigurationSummary } from '@/config/environment';

const EnvironmentChecker: React.FC = () => {
  const { isValid, errors, warnings } = validateEnvironmentConfig();
  const configSummary = getConfigurationSummary();

  if (config.isProduction && isValid && warnings.length === 0) {
    // Don't show anything in production if everything is perfect
    return null;
  }

  if (!config.isDevelopment && errors.length === 0 && warnings.length === 0) {
    // Don't show in production unless there are issues
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Info className="h-4 w-4" />
          Environment Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Environment Info */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Environment: <Badge variant="outline">{configSummary.environment}</Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Version: <Badge variant="outline">{configSummary.version}</Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Domain: <Badge variant="outline">{config.app.domain}</Badge>
        </div>

        {/* Feature Status */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Feature Status:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={configSummary.features.analytics ? "default" : "secondary"}>
              Analytics: {configSummary.features.analytics ? "On" : "Off"}
            </Badge>
            <Badge variant={configSummary.features.errorReporting ? "default" : "secondary"}>
              Error Reporting: {configSummary.features.errorReporting ? "On" : "Off"}
            </Badge>
            <Badge variant={configSummary.features.mockData ? "destructive" : "default"}>
              Mock Data: {configSummary.features.mockData ? "On" : "Off"}
            </Badge>
            <Badge variant={configSummary.features.debugMode ? "secondary" : "default"}>
              Debug: {configSummary.features.debugMode ? "On" : "Off"}
            </Badge>
          </div>
        </div>

        {/* Security Status */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Security Status:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={configSummary.security.csp ? "default" : "secondary"}>
              CSP: {configSummary.security.csp ? "On" : "Off"}
            </Badge>
            <Badge variant={configSummary.security.hsts ? "default" : "secondary"}>
              HSTS: {configSummary.security.hsts ? "On" : "Off"}
            </Badge>
            <Badge variant={configSummary.security.xssProtection ? "default" : "secondary"}>
              XSS Protection: {configSummary.security.xssProtection ? "On" : "Off"}
            </Badge>
          </div>
        </div>
        
        {/* Critical Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Critical Configuration Issues:</div>
                {errors.map((error, index) => (
                  <div key={index} className="text-xs flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <Alert variant="default" className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-2">
                <div className="font-medium">Configuration Warnings:</div>
                {warnings.map((warning, index) => (
                  <div key={index} className="text-xs flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Production Readiness Summary */}
        {config.isProduction && (
          <div className="p-3 border rounded-lg bg-background">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Production Readiness</span>
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Ready" : "Not Ready"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {isValid ? 
                "All critical configuration requirements are met." :
                "Please fix the critical issues above before deploying."
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnvironmentChecker;

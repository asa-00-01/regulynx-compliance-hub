
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import config from '@/config/environment';
import { globalRateLimiter } from '@/lib/rateLimiting';

interface SecurityStatus {
  csp: boolean;
  rateLimit: boolean;
  https: boolean;
  headers: boolean;
  auth: boolean;
}

const SecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    csp: false,
    rateLimit: false,
    https: false,
    headers: false,
    auth: false,
  });

  useEffect(() => {
    const checkSecurityStatus = () => {
      const status: SecurityStatus = {
        csp: config.security.enableCSP,
        rateLimit: true, // Rate limiting is always available
        https: window.location.protocol === 'https:' || !config.isProduction,
        headers: config.security.enableXSSProtection && config.security.enableFrameOptions,
        auth: !!document.querySelector('meta[name="supabase-auth"]'),
      };

      setSecurityStatus(status);
    };

    checkSecurityStatus();
  }, []);

  // Only show in development or if there are security issues
  const hasIssues = !securityStatus.csp || !securityStatus.https || !securityStatus.headers;
  const shouldShow = config.isDevelopment || (config.isProduction && hasIssues);

  if (!shouldShow) return null;

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-3 w-3 text-green-500" />
    ) : (
      <AlertTriangle className="h-3 w-3 text-red-500" />
    );
  };

  const getStatusBadge = (enabled: boolean, label: string) => {
    return (
      <Badge variant={enabled ? "default" : "destructive"} className="text-xs">
        {getStatusIcon(enabled)}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  return (
    <div className="fixed bottom-4 left-4 max-w-sm bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4" />
        <span className="font-medium text-sm">Security Status</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {getStatusBadge(securityStatus.csp, 'CSP')}
          {getStatusBadge(securityStatus.rateLimit, 'Rate Limit')}
          {getStatusBadge(securityStatus.https, 'HTTPS')}
          {getStatusBadge(securityStatus.headers, 'Security Headers')}
        </div>

        {hasIssues && config.isProduction && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Security issues detected in production. Please review your configuration.
            </AlertDescription>
          </Alert>
        )}

        {config.isDevelopment && (
          <div className="text-xs text-muted-foreground mt-2">
            Development mode - Security monitoring active
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityMonitor;

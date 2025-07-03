
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

interface SecurityMonitorProps {
  embedded?: boolean;
}

// Helper functions moved to the top
const getStatusIcon = (enabled: boolean) => {
  return enabled ? (
    <CheckCircle className="h-3 w-3 text-green-500" />
  ) : (
    <AlertTriangle className="h-3 w-3 text-red-500" />
  );
};

const getStatusBadge = (enabled: boolean, label: string) => {
  return (
    <Badge variant={enabled ? "default" : "destructive"} className="text-xs flex items-center gap-1">
      {getStatusIcon(enabled)}
      <span>{label}</span>
    </Badge>
  );
};

const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ embedded = false }) => {
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

  const hasIssues = !securityStatus.csp || !securityStatus.https || !securityStatus.headers;

  // If embedded, always show the content
  if (embedded) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {getStatusBadge(securityStatus.csp, 'CSP')}
          {getStatusBadge(securityStatus.rateLimit, 'Rate Limit')}
          {getStatusBadge(securityStatus.https, 'HTTPS')}
          {getStatusBadge(securityStatus.headers, 'Security Headers')}
        </div>

        {hasIssues && config.isProduction && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Security issues detected in production. Please review your configuration.
            </AlertDescription>
          </Alert>
        )}

        {config.isDevelopment && (
          <div className="text-sm text-muted-foreground">
            Development mode - Security monitoring active
          </div>
        )}
      </div>
    );
  }

  // Don't show floating version anymore
  return null;
};

export default SecurityMonitor;


import React, { useEffect } from 'react';
import { setSecurityHeaders } from '@/lib/csp';
import { secureAuth } from '@/lib/secureAuth';
import config from '@/config/environment';

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize security headers
    if (config.isProduction || config.security.enableCSP) {
      setSecurityHeaders();
    }

    // Initialize secure authentication monitoring
    secureAuth.initialize();

    // Cleanup on unmount
    return () => {
      secureAuth.cleanup();
    };
  }, []);

  return <>{children}</>;
};

export default SecurityProvider;

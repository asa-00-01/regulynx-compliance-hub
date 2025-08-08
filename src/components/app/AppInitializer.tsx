
import React from 'react';
import { validateEnvironmentConfig } from '@/config/environment';

interface AppInitializerProps {
  children?: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  React.useEffect(() => {
    const { isValid, errors, warnings } = validateEnvironmentConfig();
    
    if (!isValid) {
      console.warn('Environment configuration has errors:', errors);
      errors.forEach(error => console.warn(`⚠️ ${error}`));
    } else {
      console.log('✅ Environment configuration is valid');
    }
    
    // Log warnings but don't block the app
    if (warnings.length > 0) {
      console.info('Environment configuration warnings:', warnings);
      warnings.forEach(warning => console.info(`ℹ️ ${warning}`));
    }
  }, []);

  return <>{children}</>;
};

export default AppInitializer;

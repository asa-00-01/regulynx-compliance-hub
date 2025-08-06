
import React from 'react';
import { validateEnvironmentConfig } from '@/config/environment';

interface AppInitializerProps {
  children?: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  React.useEffect(() => {
    const { isValid, errors } = validateEnvironmentConfig();
    if (!isValid) {
      console.error('Environment configuration errors:', errors);
      errors.forEach(error => console.error(`❌ ${error}`));
    } else {
      console.log('✅ Environment configuration is valid');
    }
  }, []);

  return <>{children}</>;
};

export default AppInitializer;

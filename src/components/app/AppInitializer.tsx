
import React from 'react';
import { validateEnvironmentConfig } from '@/config/environment';

const AppInitializer: React.FC = () => {
  React.useEffect(() => {
    const { isValid, errors } = validateEnvironmentConfig();
    if (!isValid) {
      console.error('Environment configuration errors:', errors);
      errors.forEach(error => console.error(`❌ ${error}`));
    } else {
      console.log('✅ Environment configuration is valid');
    }
  }, []);

  return null;
};

export default AppInitializer;

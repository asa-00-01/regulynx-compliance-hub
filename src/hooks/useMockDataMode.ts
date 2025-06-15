
import { useCallback } from 'react';
import { config } from '@/config/environment';
import { MockDataService } from '@/services/mockDataService';

export const useMockDataMode = () => {
  const isMockMode = config.features.useMockData;

  const logMockStatus = useCallback(() => {
    console.log('Mock Data Mode Status:', {
      enabled: isMockMode,
      environment: config.app.environment,
      isDevelopment: config.isDevelopment,
      canToggle: config.isDevelopment
    });
  }, [isMockMode]);

  const getDataSource = useCallback((serviceName: string) => {
    return isMockMode ? `Mock ${serviceName} Service` : `Real ${serviceName} API`;
  }, [isMockMode]);

  const conditionalFetch = useCallback(async <T>(
    mockDataFn: () => Promise<T>,
    realApiFn: () => Promise<T>
  ): Promise<T> => {
    if (isMockMode) {
      return await mockDataFn();
    } else {
      return await realApiFn();
    }
  }, [isMockMode]);

  return {
    isMockMode,
    isRealMode: !isMockMode,
    logMockStatus,
    getDataSource,
    conditionalFetch,
    MockDataService: isMockMode ? MockDataService : null,
  };
};

export default useMockDataMode;

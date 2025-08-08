
import { useCallback } from 'react';
import { config } from '@/config/environment';
import { UnifiedDataService } from '@/services/unifiedDataService';

export const useMockDataMode = () => {
  const isMockMode = config.features.useMockData;

  const logMockStatus = useCallback(() => {
    console.log('Data Mode Status:', {
      mode: isMockMode ? 'Mock Data' : 'Real API/Database',
      enabled: isMockMode,
      environment: config.app.environment,
      isDevelopment: config.isDevelopment,
      canToggle: config.isDevelopment,
      dataSource: UnifiedDataService.getCurrentDataSource()
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

  const validateDataSource = useCallback(async () => {
    return UnifiedDataService.validateCurrentDataSource();
  }, []);

  return {
    isMockMode,
    isRealMode: !isMockMode,
    logMockStatus,
    getDataSource,
    conditionalFetch,
    validateDataSource,
    currentDataSource: UnifiedDataService.getCurrentDataSource(),
    UnifiedDataService: UnifiedDataService,
  };
};

export default useMockDataMode;

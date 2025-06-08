
import { UnifiedUserData } from './types';
import { unifiedMockData } from '@/mocks/centralizedMockData';

export const initializeMockData = (): UnifiedUserData[] => {
  // Return the centralized mock data
  return unifiedMockData;
};


import { ComplianceCaseDetails, CaseAction, CaseFilters } from '@/types/case';
import { MockDataService } from '@/services/mockDataService';
import { config } from '@/config/environment';
import { CaseServiceOperations } from './types';

export const complianceCaseService: CaseServiceOperations = {
  async fetchCases(filters: CaseFilters): Promise<ComplianceCaseDetails[]> {
    if (config.features.useMockData) {
      return await MockDataService.getComplianceCases(filters);
    } else {
      // Use real Supabase API
      // This would be implemented with actual Supabase queries
      return await MockDataService.getComplianceCases(filters);
    }
  },

  async createCase(caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> {
    if (config.features.useMockData) {
      return await MockDataService.createComplianceCase(caseData);
    } else {
      // Use real Supabase API
      // This would save to Supabase and return the created case
      return await MockDataService.createComplianceCase(caseData);
    }
  },

  async fetchCaseActions(caseId: string): Promise<CaseAction[]> {
    if (config.features.useMockData) {
      // Use mock data
      const actions: CaseAction[] = [
        {
          id: '1',
          caseId: caseId,
          actionBy: 'system',
          actionByName: 'System',
          actionDate: new Date().toISOString(),
          actionType: 'status_change',
          description: 'Case created',
        },
        {
          id: '2',
          caseId: caseId,
          actionBy: '123',
          actionByName: 'Alex Nordström',
          actionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionType: 'assignment',
          description: 'Case assigned to compliance officer',
        }
      ];
      return actions;
    } else {
      // Use real Supabase API
      // This would be implemented with actual Supabase queries
      return [];
    }
  }
};


import { ComplianceCaseDetails } from '@/types/case';
import { mockComplianceCases } from '@/mocks/casesData';
import { BaseMockService, simulateDelay } from '../base/BaseMockService';

export class ComplianceCasesService extends BaseMockService {
  static async getComplianceCases(filters?: any): Promise<ComplianceCaseDetails[]> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('📋 Fetching mock compliance cases...', filters ? 'with filters' : '');
    await simulateDelay();
    
    let filteredCases = [...mockComplianceCases];
    
    // Apply filters if provided
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filteredCases = filteredCases.filter(c => filters.status.includes(c.status));
      }
      
      if (filters.type && filters.type.length > 0) {
        filteredCases = filteredCases.filter(c => filters.type.includes(c.type));
      }
      
      if (filters.priority && filters.priority.length > 0) {
        filteredCases = filteredCases.filter(c => filters.priority.includes(c.priority));
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredCases = filteredCases.filter(c => 
          c.userName.toLowerCase().includes(term) || 
          c.description.toLowerCase().includes(term)
        );
      }
    }
    
    return filteredCases;
  }

  static async createComplianceCase(caseData: Partial<ComplianceCaseDetails>): Promise<ComplianceCaseDetails> {
    if (!this.shouldUseMockData()) {
      throw new Error('Mock data is disabled. Use real API service.');
    }
    
    console.log('✨ Creating mock compliance case...', caseData);
    await simulateDelay();
    
    const newCase: ComplianceCaseDetails = {
      id: `case-${Date.now()}`,
      userId: caseData.userId || '',
      userName: caseData.userName || 'Unknown User',
      createdAt: new Date().toISOString(),
      createdBy: caseData.createdBy,
      updatedAt: new Date().toISOString(),
      type: caseData.type || 'kyc',
      status: 'open',
      riskScore: caseData.riskScore || 50,
      description: caseData.description || 'No description provided',
      assignedTo: caseData.assignedTo,
      assignedToName: caseData.assignedToName,
      priority: caseData.priority || 'medium',
      source: caseData.source || 'manual',
      relatedTransactions: caseData.relatedTransactions || [],
      relatedAlerts: caseData.relatedAlerts || [],
      documents: caseData.documents || [],
    };
    
    return newCase;
  }
}

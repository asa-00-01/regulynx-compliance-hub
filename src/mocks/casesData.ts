
import { ComplianceCaseDetails } from '@/types/case';
import { mockComplianceCasesCollection } from '@/mocks/centralizedMockData';

export const mockComplianceCases: ComplianceCaseDetails[] = mockComplianceCasesCollection;

export const complianceOfficers = [
  { id: 'admin_001', name: 'Alex Nordström' },
  { id: 'admin_002', name: 'Johan Berg' },
  { id: 'admin_003', name: 'Lena Wikström' },
  { id: 'admin_004', name: 'Maria Svensson' },
  { id: 'admin_005', name: 'Erik Lindqvist' }
];

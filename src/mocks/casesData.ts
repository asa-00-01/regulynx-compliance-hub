
import { ComplianceCaseDetails } from '@/types/case';
import { normalizedComplianceCases } from '@/mocks/normalizedMockData';

export const mockComplianceCases: ComplianceCaseDetails[] = normalizedComplianceCases;

export const complianceOfficers = [
  { id: 'admin-001', name: 'Alex Nordström' },
  { id: 'admin-002', name: 'Johan Berg' },
  { id: 'admin-003', name: 'Lena Wikström' },
  { id: 'admin-004', name: 'Maria Svensson' },
  { id: 'admin-005', name: 'Erik Lindqvist' }
];

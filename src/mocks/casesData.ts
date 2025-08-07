
import { ComplianceCaseDetails } from '@/types/case';
import { mockComplianceCasesCollection } from '@/mocks/centralizedMockData';

// Convert ComplianceCase to ComplianceCaseDetails by adding missing properties
export const mockComplianceCases: ComplianceCaseDetails[] = mockComplianceCasesCollection.map(caseData => ({
  id: caseData.id,
  userId: caseData.userId,
  userName: caseData.userName,
  createdAt: caseData.createdAt,
  createdBy: caseData.createdBy,
  updatedAt: caseData.updatedAt,
  type: caseData.type,
  status: caseData.status,
  riskScore: caseData.riskScore,
  description: caseData.description,
  assignedTo: caseData.assignedTo,
  assignedToName: caseData.assignedToName,
  priority: caseData.priority,
  source: 'system', // Add default source as it's required by ComplianceCaseDetails
  relatedTransactions: caseData.relatedTransactions,
  relatedAlerts: caseData.relatedAlerts,
  documents: caseData.documents,
}));

export const complianceOfficers = [
  { id: 'admin_001', name: 'Alex Nordström' },
  { id: 'admin_002', name: 'Johan Berg' },
  { id: 'admin_003', name: 'Lena Wikström' },
  { id: 'admin_004', name: 'Maria Svensson' },
  { id: 'admin_005', name: 'Erik Lindqvist' }
];

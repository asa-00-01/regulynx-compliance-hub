
import { ComplianceCaseDetails } from '@/types/case';
import { mockComplianceCasesCollection } from '@/mocks/centralizedMockData';

// Convert ComplianceCase to ComplianceCaseDetails by adding missing properties
export const mockComplianceCases: ComplianceCaseDetails[] = mockComplianceCasesCollection.map(caseData => ({
  id: caseData.id,
  userId: caseData.userId,
  userName: `User ${caseData.userId.substring(0, 8)}`, // Generate a userName since it doesn't exist
  createdAt: caseData.createdAt,
  createdBy: caseData.createdBy || 'system', // Default createdBy
  updatedAt: caseData.updatedAt,
  type: caseData.type,
  status: caseData.status,
  riskScore: caseData.riskScore,
  description: caseData.description,
  assignedTo: caseData.assignedTo,
  assignedToName: `Admin ${caseData.assignedTo}`, // Generate assignedToName
  priority: caseData.priority,
  source: 'system', // Add default source as it's required by ComplianceCaseDetails
  relatedTransactions: [], // Add empty arrays for missing properties
  relatedAlerts: [],
  documents: [],
}));

export const complianceOfficers = [
  { id: 'admin_001', name: 'Alex Nordström' },
  { id: 'admin_002', name: 'Johan Berg' },
  { id: 'admin_003', name: 'Lena Wikström' },
  { id: 'admin_004', name: 'Maria Svensson' },
  { id: 'admin_005', name: 'Erik Lindqvist' }
];

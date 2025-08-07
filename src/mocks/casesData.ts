
import { ComplianceCase } from '@/types/compliance';
import { ComplianceCaseDetails, CasePriority } from '@/types/case';

// Mock compliance officers data
export const complianceOfficers = [
  { id: 'officer-1', name: 'Sarah Johnson', role: 'Senior Compliance Officer' },
  { id: 'officer-2', name: 'Michael Chen', role: 'AML Specialist' },
  { id: 'officer-3', name: 'Emma Williams', role: 'KYC Manager' },
  { id: 'officer-4', name: 'David Rodriguez', role: 'Compliance Analyst' }
];

// Mock data for compliance cases
const mockCasesData: ComplianceCaseDetails[] = [
  {
    id: 'case-001',
    caseNumber: 'CC-2023-001',
    type: 'kyc',
    status: 'open',
    priority: 'high' as CasePriority,
    description: 'KYC verification failed for user John Doe',
    createdAt: '2023-01-15T14:30:00Z',
    updatedAt: '2023-01-15T14:30:00Z',
    userName: 'John Doe',
    userId: 'user-001',
    createdBy: 'system',
    assignedToName: 'Sarah Johnson',
    source: 'system',
    riskScore: 75,
    relatedTransactions: [],
    relatedAlerts: [],
    documents: [],
    notes: [],
    timeline: []
  },
  {
    id: 'case-002',
    caseNumber: 'CC-2023-002',
    type: 'aml',
    status: 'under_review',
    priority: 'medium' as CasePriority,
    description: 'Suspicious transaction detected for user Jane Smith',
    createdAt: '2023-02-01T09:15:00Z',
    updatedAt: '2023-02-05T16:45:00Z',
    userName: 'Jane Smith',
    userId: 'user-002',
    createdBy: 'system',
    assignedToName: 'Michael Chen',
    source: 'transaction_alert',
    riskScore: 65,
    relatedTransactions: [],
    relatedAlerts: [],
    documents: [],
    notes: [],
    timeline: []
  },
  {
    id: 'case-003',
    caseNumber: 'CC-2023-003',
    type: 'sanctions',
    status: 'escalated',
    priority: 'high' as CasePriority,
    description: 'Potential sanctions hit detected in user account Robert Johnson',
    createdAt: '2023-02-10T11:00:00Z',
    updatedAt: '2023-02-12T18:20:00Z',
    userName: 'Robert Johnson',
    userId: 'user-003',
    createdBy: 'system',
    assignedToName: 'Emma Williams',
    source: 'sanctions_hit',
    riskScore: 85,
    relatedTransactions: [],
    relatedAlerts: [],
    documents: [],
    notes: [],
    timeline: []
  }
];

export const mockComplianceCases = mockCasesData;

export const mapCaseToDetails = (complianceCase: ComplianceCaseDetails): ComplianceCaseDetails => {
  return {
    ...complianceCase,
    createdBy: complianceCase.createdBy || 'System',
    assignedToName: complianceCase.assignedToName || 'Unassigned',
    source: complianceCase.source || 'system',
    relatedTransactions: complianceCase.relatedTransactions || [],
    relatedAlerts: complianceCase.relatedAlerts || [],
    documents: complianceCase.documents || [],
    notes: complianceCase.notes || [],
    timeline: complianceCase.timeline || []
  };
};

export default mockCasesData;

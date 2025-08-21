
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';

// Mock AML transaction data for assessment
export const mockAMLTransactions: AMLTransaction[] = [
  {
    id: 'txn_001',
    transactionAmount: 15000.00,
    currency: 'USD',
    date: new Date('2024-01-15T10:30:00Z').toISOString(),
    fromAccountId: 'acc_001',
    toAccountId: 'acc_002',
    type: 'wire_transfer',
    status: 'completed',
    riskScore: 85,
    flaggedReason: 'High amount transaction to high-risk jurisdiction',
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T10:35:00Z').toISOString(),
  },
  {
    id: 'txn_002',
    transactionAmount: 7500.00,
    currency: 'EUR',
    date: new Date('2024-01-16T14:22:00Z').toISOString(),
    fromAccountId: 'acc_003',
    toAccountId: 'acc_001',
    type: 'bank_transfer',
    status: 'pending_review',
    riskScore: 72,
    flaggedReason: 'Unusual pattern detected',
    createdAt: new Date('2024-01-16T14:22:00Z').toISOString(),
    updatedAt: new Date('2024-01-16T14:25:00Z').toISOString(),
  },
  {
    id: 'txn_003',
    transactionAmount: 25000.00,
    currency: 'USD',
    date: new Date('2024-01-17T09:15:00Z').toISOString(),
    fromAccountId: 'acc_004',
    toAccountId: 'acc_005',
    type: 'cash_deposit',
    status: 'flagged',
    riskScore: 95,
    flaggedReason: 'Large cash deposit with suspicious timing',
    createdAt: new Date('2024-01-17T09:15:00Z').toISOString(),
    updatedAt: new Date('2024-01-17T09:20:00Z').toISOString(),
  }
];

// Mock compliance cases for assessment
export const mockComplianceCases: ComplianceCaseDetails[] = [
  {
    id: 'case_001',
    userId: 'user_001',
    userName: 'John Smith',
    createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
    createdBy: 'admin_001',
    updatedAt: new Date('2024-01-15T16:30:00Z').toISOString(),
    type: 'kyc',
    status: 'under_review',
    riskScore: 78,
    description: 'Customer verification documents require additional review',
    assignedTo: 'analyst_001',
    assignedToName: 'Sarah Johnson',
    priority: 'high',
    source: 'kyc_flag',
    relatedTransactions: ['txn_001'],
    relatedAlerts: ['alert_001'],
    documents: ['doc_001', 'doc_002']
  }
];

// Mock documents for assessment
export const mockDocuments: Document[] = [
  {
    id: 'doc_001',
    name: 'passport_scan.pdf',
    type: 'passport',
    uploadDate: new Date('2024-01-08T12:00:00Z').toISOString(),
    status: 'pending',
    userId: 'user_001',
    filePath: '/documents/user_001/passport_scan.pdf'
  }
];
